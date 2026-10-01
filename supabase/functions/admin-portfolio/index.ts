// Protected portfolio endpoint: existing admin authorization is required before data access.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.0";
import type {
  AnalyticsSnapshot,
  PortfolioCheck,
  PortfolioProject,
  PortfolioResponse,
  SourceState,
} from "../_shared/portfolio-types.ts";
import { allowedUrl, checkWebsite } from "../website-guardian/check.ts";
import {
  ANALYTICS_TTL_MS,
  HEALTH_TTL_MS,
  authorized,
  connectionStatus,
  fetchGa4,
  fetchGsc,
  safeSourceError,
  SourceError,
  validRange,
} from "./analytics.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { ...cors, "Cache-Control": "no-store" } });
const env = (name: string) => Deno.env.get(name);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "Metoden stöds inte." }, 405);
  const header = request.headers.get("Authorization") ?? "";
  const token = /^Bearer\s+/i.test(header) ? header.replace(/^Bearer\s+/i, "") : "";
  if (token.length > 4096 || !authorized(token, [env("ADMIN_SECRET"), env("FAQ_ANALYTICS_PASSWORD")])) {
    return json({ error: "unauthorized" }, 401);
  }
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 4096) throw new Error();
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Ogiltig begäran." }, 400);
  }
  const days = body.rangeDays ?? 28;
  if (!validRange(days)) return json({ error: "Välj 7, 28 eller 90 dagar." }, 400);
  const action = body.action ?? "overview";
  if (action !== "overview" && action !== "refresh") return json({ error: "Okänd åtgärd." }, 400);
  const source = body.source;
  if (action === "refresh" && (!body.projectId || !["ga4", "gsc", "health"].includes(String(source)))) {
    return json({ error: "Välj ett registrerat projekt och en giltig datakälla." }, 400);
  }
  const supabaseUrl = env("SUPABASE_URL"),
    serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Dashboardens datalagring är inte konfigurerad." }, 503);
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  // The portfolio contains unpublished projects and lives only in a protected
  // database table, never in this public repository or the browser bundle.
  const registry = await db.from("portfolio_projects").select("payload").order("project_id");
  if (registry.error) return json({ error: "Projektregistret kunde inte läsas." }, 503);
  const projects = (registry.data ?? []).map((row) => row.payload as PortfolioProject);
  const ids = projects.map((item) => item.id);
  const project = projects.find((item) => item.id === body.projectId);
  if (action === "refresh" && !project) return json({ error: "Projektet finns inte i det skyddade registret." }, 400);

  const overview = async (): Promise<PortfolioResponse> => {
    const [snapshots, checks, states] = await Promise.all([
      db.from("portfolio_snapshots").select("payload").in("project_id", ids).eq("range_days", days),
      db.from("portfolio_checks").select("payload").in("project_id", ids),
      db
        .from("portfolio_source_states")
        .select("payload")
        .in("project_id", ids)
        .or(`range_days.eq.0,range_days.eq.${days}`),
    ]);
    if (snapshots.error || checks.error || states.error) throw new Error("Portfolio read failed");
    return {
      projects,
      snapshots: (snapshots.data ?? []).map((row) => row.payload as AnalyticsSnapshot),
      checks: (checks.data ?? []).map((row) => row.payload as PortfolioCheck),
      sourceStates: (states.data ?? []).map((row) => row.payload as SourceState),
      generatedAt: new Date().toISOString(),
      connections: connectionStatus(env),
    };
  };

  try {
    if (action === "refresh" && project && (source === "ga4" || source === "gsc" || source === "health")) {
      const now = new Date();
      const attemptedAt = now.toISOString();
      const stateRange = source === "health" ? 0 : days;
      const current =
        source === "health"
          ? await db.from("portfolio_checks").select("payload, updated_at").eq("project_id", project.id).maybeSingle()
          : await db
              .from("portfolio_snapshots")
              .select("payload, updated_at")
              .eq("project_id", project.id)
              .eq("source", source)
              .eq("range_days", days)
              .maybeSingle();
      if (current.error) throw new Error("Portfolio cache read failed");
      const currentPayload = current.data?.payload as AnalyticsSnapshot | PortfolioCheck | undefined;
      const fetchedAt =
        source === "health"
          ? (currentPayload as PortfolioCheck | undefined)?.checkedAt
          : (currentPayload as AnalyticsSnapshot | undefined)?.fetchedAt;
      const ttl = source === "health" ? HEALTH_TTL_MS : ANALYTICS_TTL_MS;
      // Verified imports are historical evidence, never treated as an API refresh.
      const liveCache = source === "health" || (currentPayload as AnalyticsSnapshot | undefined)?.method === "api";
      const fresh =
        fetchedAt &&
        Number.isFinite(Date.parse(fetchedAt)) &&
        now.getTime() - Date.parse(fetchedAt) >= 0 &&
        now.getTime() - Date.parse(fetchedAt) < ttl;
      if (liveCache && fresh) return json(await overview());

      // An atomic database claim prevents duplicate tabs/concurrent requests and
      // gives failed sources a two-minute cooldown. The caller cannot bypass it.
      const claim = await db.rpc("portfolio_claim_refresh", {
        p_project_id: project.id,
        p_source: source,
        p_attempted_at: attemptedAt,
        p_range_days: stateRange,
      });
      if (claim.error) throw new Error("Portfolio refresh claim failed");
      if (claim.data !== true) return json(await overview());
      const previousState = await db
        .from("portfolio_source_states")
        .select("payload")
        .eq("project_id", project.id)
        .eq("source", source)
        .eq("range_days", stateRange)
        .single();
      if (previousState.error) throw new Error("Portfolio state read failed");
      let state: SourceState = {
        projectId: project.id,
        source,
        rangeDays: stateRange,
        attemptedAt,
        succeededAt: (previousState.data?.payload as SourceState | null)?.succeededAt ?? null,
        error: null,
      };
      try {
        if (source === "health") {
          if (!project.url || project.stage === "internal")
            throw new SourceError("Projektet saknar en publik adress att kontrollera.");
          // Only an admin-managed registry URL is passed to the checker. Redirects are never followed.
          const url = allowedUrl(project.url, [new URL(project.url).origin]);
          const result = await checkWebsite(url, "");
          const payload: PortfolioCheck = { projectId: project.id, ...result };
          const saved = await db
            .from("portfolio_checks")
            .upsert({ project_id: project.id, payload, updated_at: attemptedAt }, { onConflict: "project_id" });
          if (saved.error) throw new Error("Portfolio check write failed");
        } else {
          const payload =
            source === "ga4"
              ? await fetchGa4(project, days, env, fetch, now)
              : await fetchGsc(project, days, env, fetch, now);
          const saved = await db.from("portfolio_snapshots").upsert(
            {
              project_id: project.id,
              source,
              range_days: days,
              payload,
              updated_at: attemptedAt,
            },
            { onConflict: "project_id,source,range_days" },
          );
          if (saved.error) throw new Error("Portfolio snapshot write failed");
        }
        state = { ...state, succeededAt: attemptedAt };
      } catch (error) {
        state = { ...state, error: safeSourceError(error) };
      }
      // A failed source only updates its state. Its last successful snapshot remains intact.
      const savedState = await db.from("portfolio_source_states").upsert(
        {
          project_id: project.id,
          source,
          range_days: stateRange,
          payload: state,
          updated_at: attemptedAt,
        },
        { onConflict: "project_id,source,range_days" },
      );
      if (savedState.error) throw new Error("Portfolio state write failed");
    }
    return json(await overview());
  } catch {
    return json({ error: "Dashboardens lagrade data kunde inte läsas eller sparas. Försök igen senare." }, 503);
  }
});

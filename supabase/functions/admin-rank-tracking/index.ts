import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json" },
});
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

type GscRow = { keys?: string[]; clicks?: number; impressions?: number; position?: number };
type TrackedKeyword = { id: string; keyword: string; active: boolean };
type ProjectWithKeywords = {
  id: string;
  name: string;
  site_url: string;
  seo_rank_keywords: TrackedKeyword[] | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const pwd = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  const adminPwd = Deno.env.get("ADMIN_SECRET") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token || (token !== pwd && token !== adminPwd)) return json({ error: "unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceRole) return json({ error: "supabase_not_configured" }, 500);
  const admin = createClient(supabaseUrl, serviceRole);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const action = clean(body.action || "list", 40);

  const list = async () => {
    const [projectsResult, keywordsResult, snapshotsResult] = await Promise.all([
      admin.from("seo_rank_projects").select("*").order("created_at", { ascending: true }),
      admin.from("seo_rank_keywords").select("*").order("created_at", { ascending: true }),
      admin.from("seo_rank_snapshots").select("*").order("checked_on", { ascending: false }).limit(5000),
    ]);
    const error = projectsResult.error || keywordsResult.error || snapshotsResult.error;
    if (error) throw error;
    const snapshots = snapshotsResult.data ?? [];
    const keywords = (keywordsResult.data ?? []).map((keyword) => {
      const history = snapshots
        .filter((snapshot) => snapshot.keyword_id === keyword.id)
        .sort((a, b) => String(b.checked_on).localeCompare(String(a.checked_on)));
      const latest = history[0] ?? null;
      const previous = history[1] ?? null;
      return {
        ...keyword,
        latest,
        previous,
        movement: latest?.position != null && previous?.position != null
          ? Number(previous.position) - Number(latest.position)
          : null,
      };
    });
    return {
      projects: (projectsResult.data ?? []).map((project) => ({
        ...project,
        keywords: keywords.filter((keyword) => keyword.project_id === project.id),
      })),
    };
  };

  if (action === "list") {
    try { return json(await list()); } catch (e) { return json({ error: e instanceof Error ? e.message : String(e) }, 500); }
  }

  if (action === "create_project") {
    const name = clean(body.name, 160);
    const rawSite = clean(body.site_url, 500);
    if (!name || !rawSite) return json({ error: "name_and_site_url_required" }, 400);
    let siteUrl: URL;
    try { siteUrl = new URL(rawSite); } catch { return json({ error: "invalid_site_url" }, 400); }
    if (!["http:", "https:"].includes(siteUrl.protocol)) return json({ error: "invalid_site_url" }, 400);
    const normalized = siteUrl.toString();
    const { error } = await admin.from("seo_rank_projects").insert({
      name,
      site_url: normalized,
      domain: siteUrl.hostname.replace(/^www\./, ""),
      location_name: clean(body.location_name, 160) || null,
    });
    if (error) return json({ error: error.message }, 500);
    return json(await list());
  }

  if (action === "add_keyword") {
    const projectId = clean(body.project_id, 80);
    const keyword = clean(body.keyword, 300).replace(/\s+/g, " ");
    if (!projectId || !keyword) return json({ error: "project_id_and_keyword_required" }, 400);
    const { error } = await admin.from("seo_rank_keywords").insert({ project_id: projectId, keyword });
    if (error) return json({ error: error.message }, 500);
    return json(await list());
  }

  if (action === "toggle_keyword") {
    const id = clean(body.id, 80);
    const active = Boolean(body.active);
    const { error } = await admin.from("seo_rank_keywords").update({ active }).eq("id", id);
    if (error) return json({ error: error.message }, 500);
    return json(await list());
  }

  if (action === "sync") {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
    const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY") ?? "";
    if (!lovableKey || !gscKey) return json({ error: "GSC connector not configured" }, 500);
    const headers = {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gscKey,
      "Content-Type": "application/json",
    };

    const { data: projects, error: projectsError } = await admin
      .from("seo_rank_projects")
      .select("id,name,site_url,seo_rank_keywords(id,keyword,active)")
      .eq("active", true);
    if (projectsError) return json({ error: projectsError.message }, 500);

    const endDate = new Date(Date.now() - 3 * 86400_000);
    const startDate = new Date(endDate.getTime() - 6 * 86400_000);
    const end = endDate.toISOString().slice(0, 10);
    const start = startDate.toISOString().slice(0, 10);
    const checkedOn = end;
    const results: { project: string; synced: number; error?: string }[] = [];

    for (const project of (projects ?? []) as ProjectWithKeywords[]) {
      const tracked = (project.seo_rank_keywords ?? []).filter((keyword) => keyword.active);
      if (tracked.length === 0) {
        results.push({ project: project.name, synced: 0 });
        continue;
      }
      try {
        const siteEnc = encodeURIComponent(project.site_url);
        const response = await fetch(`${GATEWAY}/webmasters/v3/sites/${siteEnc}/searchAnalytics/query`, {
          method: "POST",
          headers,
          body: JSON.stringify({ startDate: start, endDate: end, dimensions: ["query"], rowLimit: 25_000 }),
        });
        if (!response.ok) throw new Error(`GSC ${response.status}: ${(await response.text()).slice(0, 300)}`);
        const payload = await response.json();
        const rows: GscRow[] = payload.rows ?? [];
        const byQuery = new Map(rows.map((row) => [String(row.keys?.[0] ?? "").trim().toLocaleLowerCase("sv-SE"), row]));
        const snapshots = tracked.map((keyword) => {
          const row = byQuery.get(keyword.keyword.trim().toLocaleLowerCase("sv-SE"));
          return {
            keyword_id: keyword.id,
            checked_on: checkedOn,
            position: row?.position ?? null,
            clicks: row?.clicks ?? 0,
            impressions: row?.impressions ?? 0,
            source: "gsc",
          };
        });
        const { error } = await admin.from("seo_rank_snapshots").upsert(snapshots, {
          onConflict: "keyword_id,checked_on,source",
        });
        if (error) throw error;
        results.push({ project: project.name, synced: snapshots.length });
      } catch (e) {
        results.push({ project: project.name, synced: 0, error: e instanceof Error ? e.message : String(e) });
      }
    }

    try {
      return json({ ...(await list()), sync: { start, end, results } });
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : String(e), sync: { start, end, results } }, 500);
    }
  }

  return json({ error: "unknown_action" }, 400);
});

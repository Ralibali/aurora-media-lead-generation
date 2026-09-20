import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTION = /^[a-z0-9_-]+\.[A-Za-z0-9_.-]+$/;
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

function adminAuthorized(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const allowed = [Deno.env.get("FAQ_ANALYTICS_PASSWORD"), Deno.env.get("ADMIN_SECRET")].filter(Boolean);
  return Boolean(token && allowed.includes(token));
}

function extractJson(raw: string) {
  const fence = String.fromCharCode(96).repeat(3);
  const cleaned = raw.replace(fence + "json", "").replaceAll(fence, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("ai_response_not_json");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function validInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const serialized = JSON.stringify(value);
  if (serialized.length > 30_000) throw new Error("action_input_too_large");
  return value as Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!adminAuthorized(req)) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) return json({ error: "supabase_not_configured" }, 500);
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return json({ error: "invalid_json" }, 400);
  const action = clean(body.action || "list", 50);

  const list = async () => {
    const [profiles, tasks, runs] = await Promise.all([
      db.from("coworker_profiles").select("*").eq("active", true).order("created_at"),
      db
        .from("coworker_tasks")
        .select("*, coworker_profiles(key,name)")
        .order("created_at", { ascending: false })
        .limit(100),
      db
        .from("integration_runs")
        .select("id, connection_id, action_id, status, created_at, integration_connections(name)")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    const error = profiles.error || tasks.error || runs.error;
    if (error) throw error;
    return { profiles: profiles.data ?? [], tasks: tasks.data ?? [], runs: runs.data ?? [] };
  };

  try {
    if (action === "list") return json(await list());

    if (action === "create_task") {
      const profileId = clean(body.profile_id, 80);
      const title = clean(body.title, 180);
      const goal = clean(body.goal, 4000);
      if (!UUID.test(profileId) || title.length < 2 || goal.length < 5) {
        return json({ error: "invalid_task" }, 400);
      }
      const { data: profile } = await db.from("coworker_profiles").select("id").eq("id", profileId).eq("active", true).maybeSingle();
      if (!profile) return json({ error: "profile_not_found" }, 404);
      const { data: task, error } = await db.from("coworker_tasks").insert({
        profile_id: profileId,
        title,
        goal,
        status: "queued",
        requires_approval: true,
      }).select("id").single();
      if (error) throw error;
      return json({ ...(await list()), created_task_id: task.id }, 201);
    }

    const taskId = clean(body.task_id, 80);
    if (!UUID.test(taskId)) return json({ error: "invalid_task_id" }, 400);
    const { data: task, error: taskError } = await db
      .from("coworker_tasks")
      .select("*, coworker_profiles(*)")
      .eq("id", taskId)
      .maybeSingle();
    if (taskError) throw taskError;
    if (!task) return json({ error: "task_not_found" }, 404);

    if (action === "cancel_task") {
      const { error } = await db.from("coworker_tasks").update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      }).eq("id", taskId).in("status", ["queued", "prepared", "approved"]);
      if (error) throw error;
      return json(await list());
    }

    if (action === "prepare_task") {
      if (!["queued", "prepared"].includes(task.status)) return json({ error: "task_state_conflict" }, 409);
      const lovableKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
      if (!lovableKey) return json({ error: "LOVABLE_API_KEY_missing" }, 500);

      const { data: connections, error: connectionsError } = await db
        .from("integration_connections")
        .select("id,name,service,connection_alias,allowed_actions,status,active")
        .eq("active", true);
      if (connectionsError) throw connectionsError;

      const profile = task.coworker_profiles as Record<string, unknown>;
      const prefixes = Array.isArray(profile.allowed_action_prefixes)
        ? profile.allowed_action_prefixes.map((value) => String(value))
        : [];
      const safeConnections = (connections ?? []).map((connection) => ({
        id: connection.id,
        name: connection.name,
        service: connection.service,
        alias: connection.connection_alias,
        status: connection.status,
        allowedActions: (Array.isArray(connection.allowed_actions) ? connection.allowed_actions : [])
          .filter((actionId) => prefixes.some((prefix) => String(actionId).startsWith(prefix)))
          .slice(0, 50),
      }));

      const prompt = `Du är ${clean(profile.name, 120)} i Aurora Media. Roll: ${clean(profile.system_role, 2000)}.
Uppgift: ${task.title}
Mål: ${task.goal}

Tillgängliga, uttryckligen allowlistade integrationer:
${JSON.stringify(safeConnections)}

Skapa en konservativ arbetsplan. Du får aldrig hitta på data, credentials, kundfakta eller connector-actions. Föreslå bara actionId som exakt finns i allowedActions ovan. Alla actions blir endast STAGED och måste godkännas av människa innan de kan exekveras.

Returnera strikt JSON:
{"summary":"kort svensk sammanfattning","steps":["steg 1"],"actions":[{"connectionId":"uuid","actionId":"service.action","input":{},"reason":"varför"}],"unknowns":["vad som saknas"],"successCriteria":["mätbart kriterium"]}

Max 6 steg och max 5 actions. Om inga externa actions behövs, returnera actions: [].`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(30_000),
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          temperature: 0.1,
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!response.ok) return json({ error: `ai_gateway_${response.status}` }, response.status === 429 ? 429 : 502);
      const completion = await response.json();
      const parsed = extractJson(String(completion?.choices?.[0]?.message?.content ?? ""));

      const connectionMap = new Map(safeConnections.map((connection) => [connection.id, connection]));
      const candidateActions = Array.isArray(parsed.actions) ? parsed.actions.slice(0, 5) : [];
      const stagedRunIds: string[] = [];
      const rejectedActions: string[] = [];

      for (const candidate of candidateActions) {
        try {
          const item = (candidate ?? {}) as Record<string, unknown>;
          const connectionId = clean(item.connectionId, 80);
          const actionId = clean(item.actionId, 180);
          if (!UUID.test(connectionId) || !ACTION.test(actionId)) throw new Error("invalid_candidate");
          const connection = connectionMap.get(connectionId);
          if (!connection || !connection.allowedActions.includes(actionId)) throw new Error("action_not_allowlisted");
          if (!prefixes.some((prefix) => actionId.startsWith(prefix))) throw new Error("action_outside_worker_scope");
          const input = validInput(item.input);

          const { data: run, error } = await db.from("integration_runs").insert({
            connection_id: connectionId,
            action_id: actionId,
            input,
            status: "staged",
          }).select("id").single();
          if (error) throw error;
          stagedRunIds.push(run.id);
        } catch (error) {
          rejectedActions.push(error instanceof Error ? error.message : String(error));
        }
      }

      const plan = {
        summary: clean(parsed.summary, 1000),
        steps: Array.isArray(parsed.steps) ? parsed.steps.map((step: unknown) => clean(step, 500)).filter(Boolean).slice(0, 6) : [],
        unknowns: Array.isArray(parsed.unknowns) ? parsed.unknowns.map((item: unknown) => clean(item, 500)).filter(Boolean).slice(0, 10) : [],
        successCriteria: Array.isArray(parsed.successCriteria)
          ? parsed.successCriteria.map((item: unknown) => clean(item, 500)).filter(Boolean).slice(0, 10)
          : [],
        stagedRunIds,
        rejectedActions,
      };

      const { error: updateError } = await db.from("coworker_tasks").update({
        status: "prepared",
        plan,
        updated_at: new Date().toISOString(),
      }).eq("id", taskId);
      if (updateError) throw updateError;
      return json({ ...(await list()), prepared: plan });
    }

    if (action === "approve_task") {
      if (task.status !== "prepared") return json({ error: "task_not_prepared" }, 409);
      const { error } = await db.from("coworker_tasks").update({
        status: "approved",
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", taskId);
      if (error) throw error;
      return json(await list());
    }

    if (action === "complete_task") {
      if (!["prepared", "approved"].includes(task.status)) return json({ error: "task_state_conflict" }, 409);
      const resultSummary = body.result_summary && typeof body.result_summary === "object"
        ? body.result_summary
        : { note: clean(body.result_summary, 1000) };
      const { error } = await db.from("coworker_tasks").update({
        status: "done",
        result_summary: resultSummary,
        executed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", taskId);
      if (error) throw error;
      return json(await list());
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /invalid|too_large|state_conflict|not_prepared|allowlist|scope/.test(message) ? 400 : 500;
    return json({ error: message.slice(0, 500) }, status);
  }
});

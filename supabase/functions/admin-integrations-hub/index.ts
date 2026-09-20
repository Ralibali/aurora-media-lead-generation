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
const SERVICE = /^[a-z0-9][a-z0-9_-]{1,79}$/;
const ACTION = /^[a-z0-9_-]+.[A-Za-z0-9_.-]+$/;
const ALIAS = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

function adminAuthorized(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const allowed = [Deno.env.get("FAQ_ANALYTICS_PASSWORD"), Deno.env.get("ADMIN_SECRET")].filter(Boolean);
  return Boolean(token && allowed.includes(token));
}

function connectorConfig() {
  const baseUrl = (Deno.env.get("OPENCONNECTOR_BASE_URL") ?? "").replace(/\/+$/, "");
  const token = Deno.env.get("OPENCONNECTOR_RUNTIME_TOKEN") ?? "";
  return { baseUrl, token, configured: Boolean(baseUrl && token) };
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function safeOutputSummary(value: unknown) {
  if (!value || typeof value !== "object") return { type: typeof value };
  const root = value as Record<string, unknown>;
  const data = root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : null;
  return {
    success: root.success === true,
    message: typeof root.message === "string" ? root.message.slice(0, 300) : null,
    meta: root.meta && typeof root.meta === "object"
      ? {
          executionId: clean((root.meta as Record<string, unknown>).executionId, 180) || null,
          actionId: clean((root.meta as Record<string, unknown>).actionId, 180) || null,
          auditPersisted: (root.meta as Record<string, unknown>).auditPersisted === true,
        }
      : null,
    dataKeys: data ? Object.keys(data).slice(0, 30) : [],
  };
}

function parseAllowedActions(raw: unknown, service: string) {
  if (!Array.isArray(raw)) return [];
  const prefix = `${service}.`;
  const actions = [...new Set(
    raw
      .map((item) => clean(item, 180))
      .filter((item) => ACTION.test(item) && item.startsWith(prefix)),
  )];
  if (actions.length > 50) throw new Error("too_many_allowed_actions");
  return actions;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!adminAuthorized(req)) return json({ error: "unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return json({ error: "supabase_not_configured" }, 500);
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return json({ error: "invalid_json" }, 400);
  const action = clean(body.action || "list", 50);

  const list = async () => {
    const [connections, runs] = await Promise.all([
      db.from("integration_connections").select("*").order("created_at", { ascending: true }),
      db
        .from("integration_runs")
        .select("*, integration_connections(name, service, connection_alias)")
        .order("created_at", { ascending: false })
        .limit(150),
    ]);
    const error = connections.error || runs.error;
    if (error) throw error;
    return {
      configured: connectorConfig().configured,
      connections: connections.data ?? [],
      runs: runs.data ?? [],
    };
  };

  try {
    if (action === "list") return json(await list());

    if (action === "create_connection") {
      const name = clean(body.name, 120);
      const service = clean(body.service, 80).toLowerCase();
      const alias = clean(body.connection_alias || "default", 80);
      if (name.length < 2 || !SERVICE.test(service) || !ALIAS.test(alias)) {
        return json({ error: "invalid_connection" }, 400);
      }
      const allowedActions = parseAllowedActions(body.allowed_actions, service);
      const { error } = await db.from("integration_connections").insert({
        name,
        service,
        connection_alias: alias,
        allowed_actions: allowedActions,
        status: "pending",
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    const connectionId = clean(body.connection_id, 80);
    if (!UUID.test(connectionId)) return json({ error: "invalid_connection_id" }, 400);
    const { data: connection, error: connectionError } = await db
      .from("integration_connections")
      .select("*")
      .eq("id", connectionId)
      .maybeSingle();
    if (connectionError) throw connectionError;
    if (!connection) return json({ error: "connection_not_found" }, 404);

    if (action === "update_connection") {
      const allowedActions = parseAllowedActions(body.allowed_actions ?? connection.allowed_actions, connection.service);
      const alias = clean(body.connection_alias ?? connection.connection_alias, 80);
      if (!ALIAS.test(alias)) return json({ error: "invalid_connection_alias" }, 400);
      const { error } = await db.from("integration_connections").update({
        connection_alias: alias,
        allowed_actions: allowedActions,
        active: body.active === undefined ? connection.active : Boolean(body.active),
        updated_at: new Date().toISOString(),
      }).eq("id", connectionId);
      if (error) throw error;
      return json(await list());
    }

    const connector = connectorConfig();
    if (!connector.configured && ["test_connection", "discover_actions", "execute_run"].includes(action)) {
      return json({ error: "openconnector_not_configured" }, 409);
    }

    if (action === "test_connection") {
      const started = Date.now();
      try {
        const res = await fetch(`${connector.baseUrl}/v1/health`, {
          method: "GET",
          headers: { Authorization: `Bearer ${connector.token}` },
          signal: AbortSignal.timeout(8_000),
        });
        const status = res.ok ? "connected" : "error";
        const lastError = res.ok ? null : `HTTP ${res.status}`;
        await db.from("integration_connections").update({
          status,
          last_verified_at: new Date().toISOString(),
          last_error: lastError,
          updated_at: new Date().toISOString(),
        }).eq("id", connectionId);
        return json({ ...(await list()), health: { ok: res.ok, latency_ms: Date.now() - started, status: res.status } });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await db.from("integration_connections").update({
          status: "error",
          last_verified_at: new Date().toISOString(),
          last_error: message.slice(0, 300),
          updated_at: new Date().toISOString(),
        }).eq("id", connectionId);
        return json({ ...(await list()), health: { ok: false, latency_ms: null, error: message.slice(0, 300) } });
      }
    }

    if (action === "discover_actions") {
      const res = await fetch(
        `${connector.baseUrl}/v1/actions?service=${encodeURIComponent(connection.service)}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${connector.token}` },
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (!res.ok) return json({ error: `openconnector_${res.status}` }, 502);
      const payload = await res.json().catch(() => ({}));
      const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.data?.items) ? payload.data.items : [];
      const actions = rows
        .map((entry: unknown) => {
          const item = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;
          return {
            id: clean(item.id ?? item.actionId, 180),
            name: clean(item.name ?? item.title, 180),
            description: clean(item.description, 500),
          };
        })
        .filter((item: { id: string }) => ACTION.test(item.id) && item.id.startsWith(`${connection.service}.`))
        .slice(0, 200);
      return json({ actions });
    }

    if (action === "stage_run") {
      const actionId = clean(body.action_id, 180);
      if (!ACTION.test(actionId) || !actionId.startsWith(`${connection.service}.`)) {
        return json({ error: "invalid_action_id" }, 400);
      }
      const allowed = Array.isArray(connection.allowed_actions) ? connection.allowed_actions : [];
      if (!allowed.includes(actionId)) return json({ error: "action_not_allowlisted" }, 403);
      const input = body.input && typeof body.input === "object" && !Array.isArray(body.input)
        ? body.input
        : {};
      const serialized = JSON.stringify(input);
      if (serialized.length > 50_000) return json({ error: "input_too_large" }, 413);
      const { error } = await db.from("integration_runs").insert({
        connection_id: connectionId,
        action_id: actionId,
        input,
        status: "staged",
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    const runId = clean(body.run_id, 80);
    if (!UUID.test(runId)) return json({ error: "invalid_run_id" }, 400);
    const { data: run, error: runError } = await db
      .from("integration_runs")
      .select("*")
      .eq("id", runId)
      .eq("connection_id", connectionId)
      .maybeSingle();
    if (runError) throw runError;
    if (!run) return json({ error: "run_not_found" }, 404);

    if (action === "approve_run" || action === "cancel_run") {
      const nextStatus = action === "approve_run" ? "approved" : "cancelled";
      const { data, error } = await db.from("integration_runs").update({
        status: nextStatus,
        approved_at: nextStatus === "approved" ? new Date().toISOString() : run.approved_at,
        updated_at: new Date().toISOString(),
      }).eq("id", runId).eq("status", "staged").select("id").maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "run_state_conflict" }, 409);
      return json(await list());
    }

    if (action === "execute_run") {
      if (run.status !== "approved") return json({ error: "run_not_approved" }, 409);
      const allowed = Array.isArray(connection.allowed_actions) ? connection.allowed_actions : [];
      if (!allowed.includes(run.action_id)) return json({ error: "action_no_longer_allowlisted" }, 403);

      const { data: locked, error: lockError } = await db.from("integration_runs").update({
        status: "running",
        updated_at: new Date().toISOString(),
      }).eq("id", runId).eq("status", "approved").select("*").maybeSingle();
      if (lockError) throw lockError;
      if (!locked) return json({ error: "run_state_conflict" }, 409);

      try {
        const res = await fetch(
          `${connector.baseUrl}/v1/actions/${encodeURIComponent(run.action_id)}`,
          {
            method: "POST",
            signal: AbortSignal.timeout(30_000),
            headers: {
              ...authHeaders(connector.token),
              "x-oo-connector-alias": connection.connection_alias,
              "Idempotency-Key": run.idempotency_key,
            },
            body: JSON.stringify({ input: run.input ?? {} }),
          },
        );
        const payload = await res.json().catch(() => ({}));
        const summary = safeOutputSummary(payload);
        const executionId = clean((payload?.meta as Record<string, unknown> | undefined)?.executionId, 180) || null;
        await db.from("integration_runs").update({
          status: res.ok && payload?.success !== false ? "succeeded" : "failed",
          output_summary: summary,
          execution_id: executionId,
          executed_at: new Date().toISOString(),
          last_error: res.ok ? null : clean(payload?.message || `HTTP ${res.status}`, 500),
          updated_at: new Date().toISOString(),
        }).eq("id", runId);
      } catch (error) {
        await db.from("integration_runs").update({
          status: "failed",
          executed_at: new Date().toISOString(),
          last_error: (error instanceof Error ? error.message : String(error)).slice(0, 500),
          updated_at: new Date().toISOString(),
        }).eq("id", runId);
      }
      return json(await list());
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /invalid|too_many|required|allowlist|state_conflict/.test(message) ? 400 : 500;
    return json({ error: message.slice(0, 500) }, status);
  }
});

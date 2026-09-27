import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VERTICALS = new Set(["traffic_school","stay","transport","service","other"]);
const STATUSES = new Set(["intake","design","approved","provisioning","live","evaluating","paused","completed","rejected"]);
const PROVIDERS = new Set(["pipecat","aurora_connect","other"]);
const OUTCOMES = new Set(["faq_resolved","lead_captured","booking_request","handoff","abandoned","failed","other"]);

function adminAuthorized(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const allowed = [Deno.env.get("FAQ_ANALYTICS_PASSWORD"), Deno.env.get("ADMIN_SECRET")].filter(Boolean);
  return Boolean(token && allowed.includes(token));
}

async function provisionRuntime(pilot: Record<string, unknown>) {
  const baseUrl = (Deno.env.get("VOICE_RUNTIME_URL") ?? "").replace(/\/+$/, "");
  const token = Deno.env.get("VOICE_RUNTIME_TOKEN") ?? "";
  if (!baseUrl || !token) throw new Error("voice_runtime_not_configured");
  const response = await fetch(baseUrl + "/v1/pilots", {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(20_000),
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({
      customer_name: pilot.customer_name,
      vertical: pilot.vertical,
      use_case: pilot.use_case,
      opening_hours: pilot.opening_hours,
      handoff_number: pilot.handoff_number,
      disclosure_text: pilot.disclosure_text,
      retention_days: pilot.retention_days,
      integration_target: pilot.integration_target,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(clean(payload?.error || ("runtime_http_" + response.status), 500));
  const externalId = clean(payload?.id || payload?.pilot_id, 300);
  if (!externalId) throw new Error("runtime_missing_pilot_id");
  return externalId;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!adminAuthorized(req)) return json({ error: "unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) return json({ error: "supabase_not_configured" }, 500);
  const db = createClient(url, key, { auth: { persistSession: false } });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return json({ error: "invalid_json" }, 400);
  const action = clean(body.action || "list", 40);

  const list = async () => {
    const [pilots, calls] = await Promise.all([
      db.from("voice_pilots").select("*").order("created_at", { ascending: false }),
      db.from("voice_pilot_calls").select("*").order("occurred_at", { ascending: false }).limit(1000),
    ]);
    const error = pilots.error || calls.error;
    if (error) throw error;
    return { pilots: pilots.data ?? [], calls: calls.data ?? [], runtimeConfigured: Boolean(Deno.env.get("VOICE_RUNTIME_URL") && Deno.env.get("VOICE_RUNTIME_TOKEN")) };
  };

  try {
    if (action === "list") return json(await list());

    if (action === "create_pilot") {
      const vertical = clean(body.vertical, 30);
      if (!VERTICALS.has(vertical)) return json({ error: "invalid_vertical" }, 400);
      const { error } = await db.from("voice_pilots").insert({
        customer_name: clean(body.customer_name, 160),
        vertical,
        use_case: clean(body.use_case, 2000),
        opening_hours: clean(body.opening_hours, 500) || null,
        handoff_number: clean(body.handoff_number, 100) || null,
        integration_target: clean(body.integration_target, 300) || null,
        runtime_provider: clean(body.runtime_provider || "pipecat", 30),
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    if (action === "update_pilot") {
      const id = clean(body.pilot_id, 80);
      const status = clean(body.status, 30);
      const provider = clean(body.runtime_provider, 30);
      if (!UUID.test(id) || !STATUSES.has(status) || !PROVIDERS.has(provider)) return json({ error: "invalid_pilot_update" }, 400);
      const retention = Math.round(Number(body.retention_days));
      if (!Number.isFinite(retention) || retention < 1 || retention > 365) return json({ error: "invalid_retention" }, 400);
      const setup = Math.round(Number(body.setup_price_sek));
      const monthly = Math.round(Number(body.monthly_price_sek));
      if (!Number.isFinite(setup) || !Number.isFinite(monthly) || setup < 0 || monthly < 0) return json({ error: "invalid_price" }, 400);
      const { error } = await db.from("voice_pilots").update({
        status,
        runtime_provider: provider,
        retention_days: retention,
        setup_price_sek: setup,
        monthly_price_sek: monthly,
        opening_hours: clean(body.opening_hours, 500) || null,
        handoff_number: clean(body.handoff_number, 100) || null,
        integration_target: clean(body.integration_target, 300) || null,
        notes: clean(body.notes, 3000) || null,
        approved_at: status === "approved" ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      return json(await list());
    }

    if (action === "provision") {
      const id = clean(body.pilot_id, 80);
      if (!UUID.test(id)) return json({ error: "invalid_pilot_id" }, 400);
      const { data: pilot, error } = await db.from("voice_pilots").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!pilot) return json({ error: "pilot_not_found" }, 404);
      if (pilot.status !== "approved") return json({ error: "pilot_must_be_approved" }, 409);
      await db.from("voice_pilots").update({ status: "provisioning", updated_at: new Date().toISOString() }).eq("id", id);
      try {
        const externalId = await provisionRuntime(pilot);
        await db.from("voice_pilots").update({
          status: "live",
          external_pilot_id: externalId,
          provisioned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", id);
      } catch (runtimeError) {
        await db.from("voice_pilots").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", id);
        throw runtimeError;
      }
      return json(await list());
    }

    if (action === "record_call") {
      const pilotId = clean(body.pilot_id, 80);
      const outcome = clean(body.outcome, 30);
      if (!UUID.test(pilotId) || !OUTCOMES.has(outcome)) return json({ error: "invalid_call" }, 400);
      const duration = Math.max(0, Math.min(86400, Math.round(Number(body.duration_seconds) || 0)));
      const cost = Number(body.cost_ore);
      const { error } = await db.from("voice_pilot_calls").insert({
        pilot_id: pilotId,
        external_call_id: clean(body.external_call_id, 300) || null,
        duration_seconds: duration,
        outcome,
        automated: Boolean(body.automated),
        handoff_reason: clean(body.handoff_reason, 1000) || null,
        summary: clean(body.summary, 3000) || null,
        cost_ore: Number.isFinite(cost) && cost >= 0 ? Math.round(cost) : null,
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    console.error("[admin-voice-pilots]", error);
    return json({ error: error instanceof Error ? error.message.slice(0, 500) : "unknown_error" }, 500);
  }
});

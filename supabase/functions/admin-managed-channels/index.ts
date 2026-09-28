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
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const E164 = /^\+[1-9][0-9]{7,14}$/;
const ENV_KEY = /^[A-Z][A-Z0-9_]{2,79}$/;
const PLANS = new Set(["starter", "team", "agency"]);
const SUBSCRIPTION_STATUSES = new Set(["trialing", "active", "past_due", "paused", "canceled"]);
const ONBOARDING_STATUSES = new Set(["draft", "configuring", "ready", "live", "paused"]);
const PIPELINE_STAGES = new Set(["new", "qualified", "followup", "meeting", "customer", "lost"]);

type Workspace = {
  id: string;
  name: string;
  base_url: string;
  credential_env_name: string;
  active: boolean;
  plan?: string;
  subscription_status?: string;
  onboarding_status?: string;
};

function adminAuthorized(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const allowed = [Deno.env.get("FAQ_ANALYTICS_PASSWORD"), Deno.env.get("ADMIN_SECRET")].filter(Boolean);
  return Boolean(token && allowed.includes(token));
}

function normalizeBaseUrl(raw: unknown) {
  const value = clean(raw, 500).replace(/\/+$/, "");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("invalid_base_url"); }
  if (url.protocol !== "https:") throw new Error("https_required");
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const privateIpv4 = /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
  const privateIpv6 = /^(::1$|::$|fc|fd|fe8|fe9|fea|feb)/;
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || privateIpv4.test(host) || privateIpv6.test(host)) {
    throw new Error("private_hosts_not_allowed");
  }
  return url.toString().replace(/\/$/, "");
}

async function providerRequest(workspace: Workspace, path: string, init: RequestInit = {}) {
  if (!ENV_KEY.test(workspace.credential_env_name)) throw new Error("invalid_credential_reference");
  const apiKey = Deno.env.get(workspace.credential_env_name) ?? "";
  if (!apiKey) throw new Error(`missing_secret:${workspace.credential_env_name}`);
  const response = await fetch(`${workspace.base_url}${path}`, {
    ...init,
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.error) {
    const message = payload?.error?.message || payload?.error?.code || `WACRM HTTP ${response.status}`;
    throw new Error(String(message).slice(0, 500));
  }
  return payload;
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
  const action = clean(body.action || "list", 40);

  const list = async () => {
    const [workspaces, outbox, pipeline] = await Promise.all([
      db.from("managed_channel_workspaces").select("*").order("created_at", { ascending: true }),
      db.from("managed_channel_outbox").select("*").order("created_at", { ascending: false }).limit(100),
      db.from("managed_channel_pipeline").select("*").order("updated_at", { ascending: false }).limit(250),
    ]);
    const error = workspaces.error || outbox.error || pipeline.error;
    if (error) throw error;
    return { workspaces: workspaces.data ?? [], outbox: outbox.data ?? [], pipeline: pipeline.data ?? [] };
  };

  const getWorkspace = async (id: unknown) => {
    const workspaceId = clean(id, 80);
    if (!UUID.test(workspaceId)) throw new Error("invalid_workspace_id");
    const { data, error } = await db.from("managed_channel_workspaces").select("*").eq("id", workspaceId).eq("active", true).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("workspace_not_found");
    return data as Workspace;
  };

  try {
    if (action === "list") return json(await list());

    if (action === "create_workspace") {
      const name = clean(body.name, 160);
      const credentialEnvName = clean(body.credential_env_name || "WACRM_API_KEY", 80);
      if (!name || !ENV_KEY.test(credentialEnvName)) return json({ error: "invalid_workspace" }, 400);
      const plan = clean(body.plan || "starter", 20);
      if (!PLANS.has(plan)) return json({ error: "invalid_plan" }, 400);
      const defaults = plan === "agency"
        ? { monthly_price_sek: 2495, included_seats: 15 }
        : plan === "team"
          ? { monthly_price_sek: 1295, included_seats: 5 }
          : { monthly_price_sek: 695, included_seats: 1 };
      const { error } = await db.from("managed_channel_workspaces").insert({
        name,
        customer_name: clean(body.customer_name || name, 200) || name,
        base_url: normalizeBaseUrl(body.base_url),
        credential_env_name: credentialEnvName,
        plan,
        ...defaults,
        trial_ends_at: new Date(Date.now() + 14 * 86_400_000).toISOString(),
        onboarding_status: "draft",
        subscription_status: "trialing",
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    const workspace = await getWorkspace(body.workspace_id);

    if (action === "update_commercial") {
      const plan = clean(body.plan ?? workspace.plan ?? "starter", 20);
      const subscriptionStatus = clean(body.subscription_status ?? workspace.subscription_status ?? "trialing", 30);
      const onboardingStatus = clean(body.onboarding_status ?? workspace.onboarding_status ?? "draft", 30);
      const price = Math.round(Number(body.monthly_price_sek));
      const seats = Math.round(Number(body.included_seats));
      if (!PLANS.has(plan) || !SUBSCRIPTION_STATUSES.has(subscriptionStatus) || !ONBOARDING_STATUSES.has(onboardingStatus)) {
        return json({ error: "invalid_commercial_status" }, 400);
      }
      if (!Number.isFinite(price) || price < 0 || price > 100000 || !Number.isFinite(seats) || seats < 1 || seats > 100) {
        return json({ error: "invalid_commercial_numbers" }, 400);
      }
      const trialEndsAtRaw = clean(body.trial_ends_at, 80);
      const trialEndsAt = trialEndsAtRaw ? new Date(trialEndsAtRaw) : null;
      if (trialEndsAt && !Number.isFinite(trialEndsAt.getTime())) return json({ error: "invalid_trial_end" }, 400);
      const { error } = await db.from("managed_channel_workspaces").update({
        customer_name: clean(body.customer_name, 200) || null,
        plan,
        monthly_price_sek: price,
        included_seats: seats,
        subscription_status: subscriptionStatus,
        onboarding_status: onboardingStatus,
        trial_ends_at: trialEndsAt ? trialEndsAt.toISOString() : null,
        commercial_notes: clean(body.commercial_notes, 2000) || null,
        updated_at: new Date().toISOString(),
      }).eq("id", workspace.id);
      if (error) throw error;
      return json(await list());
    }

    if (action === "upsert_pipeline") {
      const conversationId = clean(body.provider_conversation_id, 300);
      if (!conversationId) return json({ error: "conversation_id_required" }, 400);
      const rawPhone = clean(body.phone, 30).replace(/[\s()-]/g, "");
      const phone = rawPhone && E164.test(rawPhone) ? rawPhone : null;
      const now = new Date().toISOString();
      const { error } = await db.from("managed_channel_pipeline").upsert({
        workspace_id: workspace.id,
        provider_conversation_id: conversationId,
        contact_name: clean(body.contact_name, 200) || null,
        phone,
        company: clean(body.company, 200) || null,
        last_message: clean(body.last_message, 4000) || null,
        last_provider_update_at: now,
        updated_at: now,
      }, { onConflict: "workspace_id,provider_conversation_id" });
      if (error) throw error;
      return json(await list(), 201);
    }

    if (action === "update_pipeline") {
      const pipelineId = clean(body.pipeline_id, 80);
      const stage = clean(body.stage, 30);
      if (!UUID.test(pipelineId) || !PIPELINE_STAGES.has(stage)) return json({ error: "invalid_pipeline_update" }, 400);
      const followupRaw = clean(body.followup_at, 80);
      const followup = followupRaw ? new Date(followupRaw) : null;
      if (followup && !Number.isFinite(followup.getTime())) return json({ error: "invalid_followup" }, 400);
      const { data, error } = await db.from("managed_channel_pipeline").update({
        stage,
        owner_name: clean(body.owner_name, 160) || null,
        followup_at: followup ? followup.toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("id", pipelineId).eq("workspace_id", workspace.id).select("id").maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "pipeline_item_not_found" }, 404);
      return json(await list());
    }

    if (action === "verify") {
      try {
        const payload = await providerRequest(workspace, "/api/v1/me");
        const account = payload?.data?.account ?? {};
        const scopes = Array.isArray(payload?.data?.key?.scopes) ? payload.data.key.scopes.map(String) : [];
        await db.from("managed_channel_workspaces").update({
          status: "connected",
          external_account_id: clean(account.id, 200) || null,
          external_account_name: clean(account.name, 200) || null,
          scopes,
          last_verified_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString(),
        }).eq("id", workspace.id);
        return json(await list());
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await db.from("managed_channel_workspaces").update({ status: "error", last_error: message, updated_at: new Date().toISOString() }).eq("id", workspace.id);
        return json({ error: message }, 502);
      }
    }

    if (["contacts", "conversations", "messages"].includes(action)) {
      let path = `/api/v1/${action}?limit=100`;
      if (action === "messages") {
        const conversationId = encodeURIComponent(clean(body.conversation_id, 200));
        if (!conversationId) return json({ error: "conversation_id_required" }, 400);
        path = `/api/v1/conversations/${conversationId}/messages?limit=100`;
      }
      const payload = await providerRequest(workspace, path);
      return json(payload);
    }

    if (action === "stage_message") {
      const recipient = clean(body.recipient_e164, 20).replace(/[\s()-]/g, "");
      const message = clean(body.message_body, 4096);
      if (!E164.test(recipient) || !message) return json({ error: "valid_recipient_and_message_required" }, 400);
      const { error } = await db.from("managed_channel_outbox").insert({
        workspace_id: workspace.id,
        recipient_e164: recipient,
        message_body: message,
        status: "staged",
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    const outboxId = clean(body.outbox_id, 80);
    if (!UUID.test(outboxId)) return json({ error: "invalid_outbox_id" }, 400);

    if (action === "approve_message" || action === "cancel_message") {
      const status = action === "approve_message" ? "approved" : "cancelled";
      const allowedStatus = action === "approve_message" ? "staged" : "staged,approved,failed";
      const query = db.from("managed_channel_outbox").update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("id", outboxId).eq("workspace_id", workspace.id);
      const { data, error } = action === "approve_message"
        ? await query.eq("status", allowedStatus).select("id").maybeSingle()
        : await query.in("status", allowedStatus.split(",")).select("id").maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "outbox_state_conflict" }, 409);
      return json(await list());
    }

    if (action === "send_message") {
      const { data: item, error } = await db.from("managed_channel_outbox")
        .update({ status: "sending", last_error: null, updated_at: new Date().toISOString() })
        .eq("id", outboxId).eq("workspace_id", workspace.id).eq("status", "approved")
        .select("id,recipient_e164,message_body").maybeSingle();
      if (error) throw error;
      if (!item) return json({ error: "message_must_be_approved" }, 409);
      try {
        const payload = await providerRequest(workspace, "/api/v1/messages", {
          method: "POST",
          body: JSON.stringify({ to: item.recipient_e164, type: "text", text: item.message_body }),
        });
        await db.from("managed_channel_outbox").update({
          status: "sent",
          provider_message_id: clean(payload?.data?.message_id, 300) || null,
          conversation_id: clean(payload?.data?.conversation_id, 300) || null,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", item.id);
      } catch (sendError) {
        const message = sendError instanceof Error ? sendError.message : String(sendError);
        await db.from("managed_channel_outbox").update({ status: "failed", last_error: message, updated_at: new Date().toISOString() }).eq("id", item.id);
        return json({ error: message }, 502);
      }
      return json(await list());
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ error: message.slice(0, 500) }, 500);
  }
});

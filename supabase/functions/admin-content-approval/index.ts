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

const encoder = new TextEncoder();
const hex = (bytes: Uint8Array) => Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
const randomToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return hex(bytes);
};
const hashToken = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return hex(new Uint8Array(digest));
};

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

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
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const action = clean(body.action || "list", 40);

  if (action === "list") {
    const { data: items, error } = await admin
      .from("content_approval_items")
      .select("id,client_name,client_email,title,channel,body,media_url,status,expires_at,approved_at,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return json({ error: error.message }, 500);

    const ids = (items ?? []).map((item) => item.id);
    let comments: unknown[] = [];
    if (ids.length > 0) {
      const result = await admin
        .from("content_approval_comments")
        .select("id,approval_id,author_name,comment,created_at")
        .in("approval_id", ids)
        .order("created_at", { ascending: true });
      if (result.error) return json({ error: result.error.message }, 500);
      comments = result.data ?? [];
    }
    return json({ items: items ?? [], comments });
  }

  if (action === "create") {
    const clientName = clean(body.client_name, 160);
    const title = clean(body.title, 220);
    const content = clean(body.body, 20_000);
    if (!clientName || !title || !content) {
      return json({ error: "client_name, title and body are required" }, 400);
    }

    const approvalToken = randomToken();
    const tokenHash = await hashToken(approvalToken);
    const expiresAt = new Date(Date.now() + 30 * 86400_000).toISOString();
    const { data: item, error } = await admin
      .from("content_approval_items")
      .insert({
        client_name: clientName,
        client_email: clean(body.client_email, 320) || null,
        title,
        channel: clean(body.channel || "social", 80) || "social",
        body: content,
        media_url: clean(body.media_url, 2_000) || null,
        status: "awaiting_approval",
        approval_token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .select("id,client_name,client_email,title,channel,body,media_url,status,expires_at,created_at")
      .single();
    if (error) return json({ error: error.message }, 500);

    return json({
      item,
      approval_url: `${supabaseUrl}/functions/v1/content-approval-public?token=${encodeURIComponent(approvalToken)}`,
    });
  }

  if (action === "link") {
    const id = clean(body.id, 80);
    if (!id) return json({ error: "id_required" }, 400);
    const approvalToken = randomToken();
    const tokenHash = await hashToken(approvalToken);
    const expiresAt = new Date(Date.now() + 30 * 86400_000).toISOString();
    const { error } = await admin
      .from("content_approval_items")
      .update({ approval_token_hash: tokenHash, expires_at: expiresAt, updated_at: new Date().toISOString() })
      .eq("id", id)
      .neq("status", "cancelled");
    if (error) return json({ error: error.message }, 500);
    return json({
      approval_url: `${supabaseUrl}/functions/v1/content-approval-public?token=${encodeURIComponent(approvalToken)}`,
      expires_at: expiresAt,
    });
  }

  if (action === "cancel") {
    const id = clean(body.id, 80);
    if (!id) return json({ error: "id_required" }, 400);
    const { error } = await admin
      .from("content_approval_items")
      .update({ status: "cancelled", approval_token_hash: null, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "unknown_action" }, 400);
});

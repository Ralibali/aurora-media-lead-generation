import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PLANS = new Set(["audit","monitor","monitor_plus"]);
const FREQUENCIES = new Set(["manual","weekly","daily"]);
const ACCOUNT_STATUSES = new Set(["onboarding","active","paused","churned"]);
const ONBOARDING = new Set(["scope","configured","baseline","live"]);
const TASK_STATUSES = new Set(["open","triaged","in_progress","verify","done","wont_fix"]);

function adminAuthorized(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const allowed = [Deno.env.get("FAQ_ANALYTICS_PASSWORD"), Deno.env.get("ADMIN_SECRET")].filter(Boolean);
  return Boolean(token && allowed.includes(token));
}

function normalizeHttps(raw: unknown) {
  const value = clean(raw, 500).replace(/\/+$/, "");
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("https_required");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) {
    throw new Error("private_hosts_not_allowed");
  }
  return url.toString().replace(/\/$/, "");
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
    const [accounts, scans, tasks] = await Promise.all([
      db.from("accessibility_accounts").select("*").order("created_at", { ascending: false }),
      db.from("accessibility_scan_runs").select("*").order("generated_at", { ascending: false }).limit(500),
      db.from("accessibility_remediation_tasks").select("*").order("updated_at", { ascending: false }).limit(1000),
    ]);
    const error = accounts.error || scans.error || tasks.error;
    if (error) throw error;
    return { accounts: accounts.data ?? [], scans: scans.data ?? [], tasks: tasks.data ?? [] };
  };

  try {
    if (action === "list") return json(await list());

    if (action === "create_account") {
      const plan = clean(body.plan || "monitor", 30);
      if (!PLANS.has(plan)) return json({ error: "invalid_plan" }, 400);
      const baseUrl = normalizeHttps(body.base_url);
      const defaults = plan === "audit"
        ? { monthly_price_sek: 2995, scan_frequency: "manual" }
        : plan === "monitor_plus"
          ? { monthly_price_sek: 995, scan_frequency: "weekly" }
          : { monthly_price_sek: 495, scan_frequency: "weekly" };
      const { error } = await db.from("accessibility_accounts").insert({
        customer_name: clean(body.customer_name, 160),
        site_name: clean(body.site_name, 160),
        base_url: baseUrl,
        plan,
        ...defaults,
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    if (action === "update_account") {
      const id = clean(body.account_id, 80);
      const plan = clean(body.plan, 30);
      const frequency = clean(body.scan_frequency, 20);
      const status = clean(body.status, 30);
      const onboarding = clean(body.onboarding_status, 30);
      const price = Math.round(Number(body.monthly_price_sek));
      if (!UUID.test(id) || !PLANS.has(plan) || !FREQUENCIES.has(frequency) || !ACCOUNT_STATUSES.has(status) || !ONBOARDING.has(onboarding)) {
        return json({ error: "invalid_account_update" }, 400);
      }
      if (!Number.isFinite(price) || price < 0 || price > 100000) return json({ error: "invalid_price" }, 400);
      const dueRaw = clean(body.manual_review_due_at, 80);
      const due = dueRaw ? new Date(dueRaw) : null;
      if (due && !Number.isFinite(due.getTime())) return json({ error: "invalid_manual_review_due_at" }, 400);
      const { error } = await db.from("accessibility_accounts").update({
        plan,
        monthly_price_sek: price,
        scan_frequency: frequency,
        status,
        onboarding_status: onboarding,
        manual_review_due_at: due ? due.toISOString() : null,
        notes: clean(body.notes, 3000) || null,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      return json(await list());
    }

    if (action === "record_scan") {
      const accountId = clean(body.account_id, 80);
      if (!UUID.test(accountId)) return json({ error: "invalid_account_id" }, 400);
      const numeric = (name: string) => Math.max(0, Math.round(Number(body[name]) || 0));
      const { error } = await db.from("accessibility_scan_runs").insert({
        account_id: accountId,
        source: clean(body.source || "guard", 20),
        external_run_id: clean(body.external_run_id, 200) || null,
        pages_scanned: numeric("pages_scanned"),
        critical_count: numeric("critical_count"),
        serious_count: numeric("serious_count"),
        moderate_count: numeric("moderate_count"),
        minor_count: numeric("minor_count"),
        scan_errors: numeric("scan_errors"),
        report_url: clean(body.report_url, 1000) || null,
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    if (action === "upsert_task") {
      const accountId = clean(body.account_id, 80);
      const findingKey = clean(body.finding_key, 500);
      if (!UUID.test(accountId) || !findingKey) return json({ error: "invalid_task" }, 400);
      const { error } = await db.from("accessibility_remediation_tasks").upsert({
        account_id: accountId,
        finding_key: findingKey,
        title: clean(body.title, 300),
        severity: clean(body.severity, 20),
        issue_url: clean(body.issue_url, 1000) || null,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "account_id,finding_key" });
      if (error) throw error;
      return json(await list(), 201);
    }

    if (action === "update_task") {
      const id = clean(body.task_id, 80);
      const status = clean(body.status, 30);
      if (!UUID.test(id) || !TASK_STATUSES.has(status)) return json({ error: "invalid_task_update" }, 400);
      const estimate = Number(body.estimated_minutes);
      const { error } = await db.from("accessibility_remediation_tasks").update({
        status,
        owner_name: clean(body.owner_name, 160) || null,
        estimated_minutes: Number.isFinite(estimate) && estimate > 0 ? Math.min(10000, Math.round(estimate)) : null,
        notes: clean(body.notes, 3000) || null,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      return json(await list());
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    console.error("[admin-accessibility-care]", error);
    return json({ error: error instanceof Error ? error.message.slice(0, 500) : "unknown_error" }, 500);
  }
});

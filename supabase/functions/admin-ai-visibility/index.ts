import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DOMAIN = /^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const ENGINES = new Set(["chatgpt","perplexity","google_ai","copilot","other"]);
const PLANS = new Set(["scan","monitor","managed"]);
const PROJECT_STATUSES = new Set(["onboarding","active","paused","churned"]);
const ACTION_STATUSES = new Set(["proposed","approved","in_progress","done","rejected"]);

function adminAuthorized(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const allowed = [Deno.env.get("FAQ_ANALYTICS_PASSWORD"), Deno.env.get("ADMIN_SECRET")].filter(Boolean);
  return Boolean(token && allowed.includes(token));
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
    const [projects, prompts, observations, actions] = await Promise.all([
      db.from("ai_visibility_projects").select("*").order("created_at", { ascending: false }),
      db.from("ai_visibility_prompts").select("*").order("created_at", { ascending: true }),
      db.from("ai_visibility_observations").select("*").order("observed_at", { ascending: false }).limit(1000),
      db.from("ai_visibility_actions").select("*").order("created_at", { ascending: false }),
    ]);
    const error = projects.error || prompts.error || observations.error || actions.error;
    if (error) throw error;
    return { projects: projects.data ?? [], prompts: prompts.data ?? [], observations: observations.data ?? [], actions: actions.data ?? [] };
  };

  try {
    if (action === "list") return json(await list());

    if (action === "create_project") {
      const domain = clean(body.domain, 200).toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
      const plan = clean(body.plan || "monitor", 20);
      if (!DOMAIN.test(domain) || !PLANS.has(plan)) return json({ error: "invalid_project" }, 400);
      const defaults = plan === "managed" ? 2495 : plan === "scan" ? 0 : 499;
      const { error } = await db.from("ai_visibility_projects").insert({
        customer_name: clean(body.customer_name, 160),
        brand_name: clean(body.brand_name, 160),
        domain,
        plan,
        monthly_price_sek: defaults,
        competitor_domains: Array.isArray(body.competitor_domains)
          ? body.competitor_domains.map((value) => clean(value, 200).toLowerCase()).filter((value) => DOMAIN.test(value)).slice(0, 10)
          : [],
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    if (action === "update_project") {
      const id = clean(body.project_id, 80);
      const plan = clean(body.plan, 20);
      const status = clean(body.status, 20);
      if (!UUID.test(id) || !PLANS.has(plan) || !PROJECT_STATUSES.has(status)) return json({ error: "invalid_project_update" }, 400);
      const price = Math.round(Number(body.monthly_price_sek));
      if (!Number.isFinite(price) || price < 0 || price > 100000) return json({ error: "invalid_price" }, 400);
      const { error } = await db.from("ai_visibility_projects").update({
        plan,
        status,
        monthly_price_sek: price,
        notes: clean(body.notes, 3000) || null,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      return json(await list());
    }

    if (action === "create_prompt") {
      const projectId = clean(body.project_id, 80);
      const prompt = clean(body.prompt, 1000);
      if (!UUID.test(projectId) || prompt.length < 5) return json({ error: "invalid_prompt" }, 400);
      const { error } = await db.from("ai_visibility_prompts").insert({
        project_id: projectId,
        prompt,
        category: clean(body.category || "commercial", 30),
        weight: Math.min(5, Math.max(1, Math.round(Number(body.weight) || 1))),
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    if (action === "record_observation") {
      const projectId = clean(body.project_id, 80);
      const promptId = clean(body.prompt_id, 80);
      const engine = clean(body.engine, 30);
      if (!UUID.test(projectId) || !UUID.test(promptId) || !ENGINES.has(engine)) return json({ error: "invalid_observation" }, 400);
      const positionRaw = Number(body.position);
      const position = Number.isFinite(positionRaw) && positionRaw >= 1 && positionRaw <= 50 ? Math.round(positionRaw) : null;
      const citedUrls = Array.isArray(body.cited_urls) ? body.cited_urls.map((value) => clean(value, 500)).filter(Boolean).slice(0, 20) : [];
      const competitorMentions = Array.isArray(body.competitor_mentions) ? body.competitor_mentions.map((value) => clean(value, 200)).filter(Boolean).slice(0, 20) : [];
      const { error } = await db.from("ai_visibility_observations").insert({
        project_id: projectId,
        prompt_id: promptId,
        engine,
        brand_mentioned: Boolean(body.brand_mentioned),
        position,
        cited_urls: citedUrls,
        competitor_mentions: competitorMentions,
        answer_excerpt: clean(body.answer_excerpt, 4000) || null,
        source: clean(body.source || "manual", 20),
        provider_run_id: clean(body.provider_run_id, 200) || null,
      });
      if (error) throw error;
      await db.from("ai_visibility_projects").update({ last_measured_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", projectId);
      return json(await list(), 201);
    }

    if (action === "create_action") {
      const projectId = clean(body.project_id, 80);
      if (!UUID.test(projectId)) return json({ error: "invalid_project_id" }, 400);
      const { error } = await db.from("ai_visibility_actions").insert({
        project_id: projectId,
        title: clean(body.title, 240),
        rationale: clean(body.rationale, 3000) || null,
        kind: clean(body.kind || "content", 30),
        priority: clean(body.priority || "medium", 20),
        estimated_minutes: Number.isFinite(Number(body.estimated_minutes)) ? Math.round(Number(body.estimated_minutes)) : null,
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    if (action === "update_action") {
      const id = clean(body.action_id, 80);
      const status = clean(body.status, 30);
      if (!UUID.test(id) || !ACTION_STATUSES.has(status)) return json({ error: "invalid_action_update" }, 400);
      const { error } = await db.from("ai_visibility_actions").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      return json(await list());
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    console.error("[admin-ai-visibility]", error);
    return json({ error: error instanceof Error ? error.message.slice(0, 500) : "unknown_error" }, 500);
  }
});

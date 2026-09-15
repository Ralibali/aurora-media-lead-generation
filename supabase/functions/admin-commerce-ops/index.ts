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
const KINDS = new Set(["listing_update", "price_update", "inventory_action", "promotion", "campaign"]);
const PLATFORMS = new Set(["manual", "shopify", "woocommerce", "other"]);
const PROTECTED_FIELDS = new Set(["payment", "payout", "bank_account", "tax", "credentials", "owner"]);

type ChangeItem = { target?: unknown; field?: unknown; before?: unknown; after?: unknown };

function adminAuthorized(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const allowed = [Deno.env.get("FAQ_ANALYTICS_PASSWORD"), Deno.env.get("ADMIN_SECRET")].filter(Boolean);
  return Boolean(token && allowed.includes(token));
}

function finiteNumber(value: unknown, options: { min?: number; max?: number; nullable: true }): number | null;
function finiteNumber(value: unknown, options?: { min?: number; max?: number; nullable?: false }): number;
function finiteNumber(value: unknown, options: { min?: number; max?: number; nullable?: boolean } = {}): number | null {
  if ((value === null || value === undefined || value === "") && options.nullable) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error("invalid_number");
  if (options.min !== undefined && number < options.min) throw new Error("number_below_minimum");
  if (options.max !== undefined && number > options.max) throw new Error("number_above_maximum");
  return number;
}

function validateItems(kind: string, raw: unknown) {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 10) throw new Error("items_must_contain_1_to_10_rows");
  const notes: string[] = [];
  const seen = new Set<string>();
  const items = raw.map((entry) => {
    const item = (entry ?? {}) as ChangeItem;
    const target = clean(item.target, 200);
    const field = clean(item.field, 80).toLowerCase();
    if (!target || !field) throw new Error("each_item_requires_target_and_field");
    if (PROTECTED_FIELDS.has(field)) throw new Error(`protected_field:${field}`);
    const key = `${target}:${field}`;
    if (seen.has(key)) throw new Error(`duplicate_item:${key}`);
    seen.add(key);

    if (kind === "price_update" || kind === "promotion") {
      const before = finiteNumber(item.before, { min: 0.01 });
      const after = finiteNumber(item.after, { min: 0.01 });
      const movement = Math.abs(after - before) / before * 100;
      const cap = kind === "promotion" ? 40 : 20;
      if (movement > cap) throw new Error(`price_guardrail:${movement.toFixed(1)}>${cap}`);
      notes.push(`Prisrörelse ${movement.toFixed(1)}% (tak ${cap}%).`);
    }
    if (kind === "inventory_action" && field === "stock") {
      const before = finiteNumber(item.before, { min: 0 });
      const after = finiteNumber(item.after, { min: 0 });
      if (after - before > 500) throw new Error("restock_guardrail:500");
    }
    if (kind === "campaign" && field === "budget") {
      const budget = finiteNumber(item.after, { min: 0 });
      if (budget > 20_000) throw new Error("campaign_budget_guardrail:20000");
    }
    return { target, field, before: item.before ?? null, after: item.after ?? null };
  });
  return { items, notes: [...new Set(notes)] };
}

function extractJson(raw: string) {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("ai_response_not_json");
  return JSON.parse(cleaned.slice(start, end + 1));
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
    const [stores, snapshots, changes] = await Promise.all([
      db.from("commerce_ops_stores").select("*").order("created_at", { ascending: true }),
      db.from("commerce_ops_snapshots").select("*").order("period_end", { ascending: false }).limit(500),
      db.from("commerce_ops_changes").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    const error = stores.error || snapshots.error || changes.error;
    if (error) throw error;
    return {
      stores: (stores.data ?? []).map((store) => ({
        ...store,
        snapshots: (snapshots.data ?? []).filter((snapshot) => snapshot.store_id === store.id),
        changes: (changes.data ?? []).filter((change) => change.store_id === store.id),
      })),
    };
  };

  try {
    if (action === "list") return json(await list());

    if (action === "create_store") {
      const name = clean(body.name, 160);
      const platform = clean(body.platform || "manual", 30);
      const currency = clean(body.currency || "SEK", 3).toUpperCase();
      if (!name || !PLATFORMS.has(platform) || !/^[A-Z]{3}$/.test(currency)) return json({ error: "invalid_store" }, 400);
      const { error } = await db.from("commerce_ops_stores").insert({
        name,
        platform,
        shop_domain: clean(body.shop_domain, 300) || null,
        currency,
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    const storeId = clean(body.store_id, 80);
    if (!UUID.test(storeId)) return json({ error: "invalid_store_id" }, 400);
    const { data: store, error: storeError } = await db.from("commerce_ops_stores").select("*").eq("id", storeId).eq("active", true).maybeSingle();
    if (storeError) throw storeError;
    if (!store) return json({ error: "store_not_found" }, 404);

    if (action === "import_snapshot") {
      const start = clean(body.period_start, 10);
      const end = clean(body.period_end, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || end < start) return json({ error: "invalid_period" }, 400);
      const sales = finiteNumber(body.sales, { min: 0 });
      const orders = Math.floor(finiteNumber(body.orders, { min: 0 }));
      const averageOrderValue = orders > 0 ? sales / orders : 0;
      const { error } = await db.from("commerce_ops_snapshots").upsert({
        store_id: storeId,
        period_start: start,
        period_end: end,
        sales,
        orders,
        traffic: body.traffic === "" ? null : Math.floor(finiteNumber(body.traffic, { min: 0, nullable: true }) ?? 0),
        conversion_rate: body.conversion_rate === "" ? null : finiteNumber(body.conversion_rate, { min: 0, max: 1, nullable: true }),
        average_order_value: averageOrderValue,
        sales_change_pct: finiteNumber(body.sales_change_pct, { nullable: true }),
        low_stock_count: Math.floor(finiteNumber(body.low_stock_count ?? 0, { min: 0 })),
        slow_movers_count: Math.floor(finiteNumber(body.slow_movers_count ?? 0, { min: 0 })),
        order_issues_count: Math.floor(finiteNumber(body.order_issues_count ?? 0, { min: 0 })),
        note: clean(body.note, 500) || null,
        source: "manual",
        captured_at: new Date().toISOString(),
      }, { onConflict: "store_id,period_start,period_end,source" });
      if (error) throw error;
      return json(await list());
    }

    if (action === "stage_change") {
      const kind = clean(body.kind, 40);
      if (!KINDS.has(kind)) return json({ error: "invalid_change_kind" }, 400);
      const summary = clean(body.summary, 500);
      if (!summary) return json({ error: "summary_required" }, 400);
      const checked = validateItems(kind, body.items);
      const { error } = await db.from("commerce_ops_changes").insert({
        store_id: storeId,
        kind,
        summary,
        rationale: clean(body.rationale, 2000) || null,
        items: checked.items,
        guardrail_notes: checked.notes,
        source: clean(body.source, 20) === "ai" ? "ai" : "operator",
      });
      if (error) throw error;
      return json(await list(), 201);
    }

    if (action === "analyze") {
      const lovableKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
      if (!lovableKey) return json({ error: "LOVABLE_API_KEY_missing" }, 500);
      const { data: snapshot, error } = await db.from("commerce_ops_snapshots").select("*").eq("store_id", storeId).order("period_end", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      if (!snapshot) return json({ error: "snapshot_required" }, 409);
      const prompt = `Du är Aurora Commerce Ops. Analysera endast verifierade siffror i JSON. Hitta högst tre konkreta åtgärdsförslag. Du får aldrig påstå en orsak som inte syns i datan. Alla ändringar ska bara vara utkast för mänskligt godkännande. Returnera strikt JSON: {"changes":[{"kind":"listing_update|inventory_action|campaign","summary":"kort svenska","rationale":"vad siffrorna visar och vad som är okänt","items":[{"target":"identifierbar målgrupp eller objekt","field":"content|stock|budget","before":0,"after":0}]}]}. Använd inte price_update eller promotion utan verkliga produktpriser. Butik: ${JSON.stringify({ name: store.name, platform: store.platform, currency: store.currency })}. Snapshot: ${JSON.stringify(snapshot)}.`;
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(30_000),
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-pro", temperature: 0.2, max_tokens: 2500, messages: [{ role: "user", content: prompt }] }),
      });
      if (!response.ok) return json({ error: `ai_gateway_${response.status}` }, response.status === 429 ? 429 : 502);
      const completion = await response.json();
      const parsed = extractJson(String(completion?.choices?.[0]?.message?.content ?? ""));
      const suggestions = Array.isArray(parsed?.changes) ? parsed.changes.slice(0, 3) : [];
      let staged = 0;
      const rejected: string[] = [];
      for (const suggestion of suggestions) {
        try {
          const kind = clean(suggestion?.kind, 40);
          const summary = clean(suggestion?.summary, 500);
          if (!KINDS.has(kind) || !summary) throw new Error("invalid_ai_change");
          const checked = validateItems(kind, suggestion?.items);
          const result = await db.from("commerce_ops_changes").insert({
            store_id: storeId,
            kind,
            summary,
            rationale: clean(suggestion?.rationale, 2000) || null,
            items: checked.items,
            guardrail_notes: checked.notes,
            source: "ai",
          });
          if (result.error) throw result.error;
          staged++;
        } catch (suggestionError) {
          rejected.push(suggestionError instanceof Error ? suggestionError.message : String(suggestionError));
        }
      }
      return json({ ...(await list()), analysis: { staged, rejected } });
    }

    const changeId = clean(body.change_id, 80);
    if (!UUID.test(changeId)) return json({ error: "invalid_change_id" }, 400);
    if (action === "approve_change" || action === "discard_change") {
      const status = action === "approve_change" ? "approved" : "discarded";
      const { data, error } = await db.from("commerce_ops_changes").update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq("id", changeId).eq("store_id", storeId).eq("status", "staged").select("id").maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "change_state_conflict" }, 409);
      return json(await list());
    }
    if (action === "mark_applied") {
      if (body.confirmation !== "APPLIED_EXTERNALLY") return json({ error: "external_application_confirmation_required" }, 400);
      const { data, error } = await db.from("commerce_ops_changes").update({
        status: "applied",
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", changeId).eq("store_id", storeId).eq("status", "approved").select("id").maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "change_must_be_approved" }, 409);
      return json(await list());
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /invalid|required|guardrail|protected|duplicate|items_/.test(message) ? 400 : 500;
    return json({ error: message.slice(0, 500) }, status);
  }
});

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
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

function adminAuthorized(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const allowed = [Deno.env.get("FAQ_ANALYTICS_PASSWORD"), Deno.env.get("ADMIN_SECRET")].filter(Boolean);
  return Boolean(token && allowed.includes(token));
}

function finiteOrNull(value: unknown, min = 0) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min) throw new Error("invalid_number");
  return number;
}

function extractJson(raw: string) {
  const fence = String.fromCharCode(96).repeat(3);
  const cleaned = raw.replace(fence + "json", "").replaceAll(fence, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("ai_response_not_json");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeItem(raw: unknown) {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const externalId = clean(item.external_id ?? item.externalId ?? item.sku ?? item.id, 180);
  const title = clean(item.title ?? item.name, 240);
  if (!externalId || !title) throw new Error("catalog_item_requires_external_id_and_title");
  return {
    external_id: externalId,
    title,
    description: clean(item.description, 4000) || null,
    product_url: clean(item.product_url ?? item.url, 1000) || null,
    price: finiteOrNull(item.price),
    inventory: item.inventory === null || item.inventory === undefined || item.inventory === ""
      ? null
      : Math.floor(finiteOrNull(item.inventory) ?? 0),
    category: clean(item.category, 180) || null,
    active: item.active === undefined ? true : Boolean(item.active),
    metadata: item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata)
      ? item.metadata
      : {},
  };
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

  const list = async (storeId?: string) => {
    const stores = await db.from("commerce_ops_stores").select("*").eq("active", true).order("name");
    if (stores.error) throw stores.error;

    let catalogQuery = db.from("commerce_ops_catalog").select("*").order("updated_at", { ascending: false }).limit(1000);
    let sessionQuery = db.from("commerce_agent_sessions").select("*").order("created_at", { ascending: false }).limit(100);
    if (storeId) {
      catalogQuery = catalogQuery.eq("store_id", storeId);
      sessionQuery = sessionQuery.eq("store_id", storeId);
    }
    const [catalog, sessions] = await Promise.all([catalogQuery, sessionQuery]);
    if (catalog.error || sessions.error) throw catalog.error || sessions.error;
    return { stores: stores.data ?? [], catalog: catalog.data ?? [], sessions: sessions.data ?? [] };
  };

  try {
    if (action === "list") {
      const storeId = clean(body.store_id, 80);
      if (storeId && !UUID.test(storeId)) return json({ error: "invalid_store_id" }, 400);
      return json(await list(storeId || undefined));
    }

    if (action === "ensure_honsgarden_pilot") {
      const { data: existing } = await db
        .from("commerce_ops_stores")
        .select("id")
        .eq("name", "Hönsgården")
        .maybeSingle();
      if (!existing) {
        const { error } = await db.from("commerce_ops_stores").insert({
          name: "Hönsgården",
          platform: "manual",
          shop_domain: "honsgarden.se",
          currency: "SEK",
        });
        if (error) throw error;
      }
      return json(await list(), existing ? 200 : 201);
    }

    const storeId = clean(body.store_id, 80);
    if (!UUID.test(storeId)) return json({ error: "invalid_store_id" }, 400);
    const { data: store, error: storeError } = await db
      .from("commerce_ops_stores")
      .select("*")
      .eq("id", storeId)
      .eq("active", true)
      .maybeSingle();
    if (storeError) throw storeError;
    if (!store) return json({ error: "store_not_found" }, 404);

    if (action === "import_catalog") {
      if (!Array.isArray(body.items)) return json({ error: "items_required" }, 400);
      const rows = body.items.slice(0, 500).map(normalizeItem);
      if (!rows.length) return json({ error: "catalog_empty" }, 400);
      const source = ["shopify", "woocommerce", "import"].includes(clean(body.source, 30))
        ? clean(body.source, 30)
        : "manual";
      const { error } = await db.from("commerce_ops_catalog").upsert(
        rows.map((row) => ({ ...row, store_id: storeId, source, updated_at: new Date().toISOString() })),
        { onConflict: "store_id,external_id" },
      );
      if (error) throw error;
      return json({ ...(await list(storeId)), imported: rows.length });
    }

    if (action === "clear_catalog") {
      if (body.confirmation !== "CLEAR_CATALOG") return json({ error: "confirmation_required" }, 400);
      const { error } = await db.from("commerce_ops_catalog").delete().eq("store_id", storeId);
      if (error) throw error;
      return json(await list(storeId));
    }

    if (action === "shopping_query") {
      const question = clean(body.question, 1200);
      if (question.length < 2) return json({ error: "question_required" }, 400);
      const { data: products, error: catalogError } = await db
        .from("commerce_ops_catalog")
        .select("id,external_id,title,description,product_url,price,inventory,category,metadata")
        .eq("store_id", storeId)
        .eq("active", true)
        .order("updated_at", { ascending: false })
        .limit(250);
      if (catalogError) throw catalogError;
      if (!products?.length) return json({ error: "catalog_required" }, 409);

      const lovableKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
      if (!lovableKey) return json({ error: "LOVABLE_API_KEY_missing" }, 500);

      const catalog = products.map((product) => ({
        id: product.id,
        externalId: product.external_id,
        title: product.title,
        description: product.description,
        url: product.product_url,
        price: product.price,
        inventory: product.inventory,
        category: product.category,
      }));

      const prompt = `Du är en shoppingassistent för ${store.name}. Besvara kundens fråga ENDAST med information i katalogen nedan.
Regler:
- Hitta aldrig på produkter, pris, lager, egenskaper eller leveranstid.
- Om fakta saknas: säg att den uppgiften inte finns i katalogen.
- Rekommendera högst 5 produkter.
- Om inventory är 0 får produkten inte rekommenderas som köpbar.
- Om price är null får du inte ange ett pris.
- Returnera strikt JSON: {"answer":"svenskt svar","recommendedProductIds":["uuid"],"reasoningNotes":["kort verifierbar motivering"],"missingFacts":["saknad fakta"]}.
- recommendedProductIds måste vara exakta id från katalogen.

Kundfråga: ${question}
Katalog: ${JSON.stringify(catalog)}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(30_000),
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          temperature: 0.1,
          max_tokens: 2500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!response.ok) return json({ error: `ai_gateway_${response.status}` }, response.status === 429 ? 429 : 502);
      const completion = await response.json();
      const parsed = extractJson(String(completion?.choices?.[0]?.message?.content ?? ""));

      const productMap = new Map(products.map((product) => [product.id, product]));
      const recommendedIds = Array.isArray(parsed.recommendedProductIds)
        ? [...new Set(parsed.recommendedProductIds.map((id: unknown) => clean(id, 80)))]
            .filter((id) => productMap.has(id) && productMap.get(id)?.inventory !== 0)
            .slice(0, 5)
        : [];
      const answer = clean(parsed.answer, 4000);
      if (!answer) throw new Error("ai_answer_empty");

      const { data: session, error: sessionError } = await db.from("commerce_agent_sessions").insert({
        store_id: storeId,
        question,
        answer,
        recommended_product_ids: recommendedIds,
        status: "completed",
        model: "google/gemini-2.5-pro",
      }).select("id").single();
      if (sessionError) throw sessionError;

      return json({
        session_id: session.id,
        answer,
        recommendations: recommendedIds.map((id) => productMap.get(id)),
        reasoning_notes: Array.isArray(parsed.reasoningNotes)
          ? parsed.reasoningNotes.map((item: unknown) => clean(item, 500)).filter(Boolean).slice(0, 8)
          : [],
        missing_facts: Array.isArray(parsed.missingFacts)
          ? parsed.missingFacts.map((item: unknown) => clean(item, 500)).filter(Boolean).slice(0, 8)
          : [],
      });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /invalid|required|confirmation|catalog_item|catalog_empty/.test(message) ? 400 : 500;
    return json({ error: message.slice(0, 500) }, status);
  }
});

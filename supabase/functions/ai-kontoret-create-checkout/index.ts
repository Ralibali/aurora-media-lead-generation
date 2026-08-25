// AI-KONTORET — skapar Stripe Checkout Session server-side.
// Belopp och SKU sätts ALLTID här; klienten kan bara välja produkt.
import {
  corsHeaders,
  json,
  CATALOG,
  isProduct,
  launchReadiness,
  stripeFetch,
  SITE_URL,
  PRODUCT_VERSION,
} from "../_shared/aiKontoret.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const product = body?.product;
    const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
    const legalAck = body?.legal_ack === true;

    if (!isProduct(product)) return json({ error: "invalid_product" }, 400);
    if (!legalAck) return json({ error: "legal_ack_required" }, 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return json({ error: "invalid_email" }, 400);
    }

    // Lanseringsspärr: inget köpflöde innan allt är på plats.
    const readiness = await launchReadiness();
    if (!readiness.ready) {
      return json({ error: "not_ready", checks: readiness.checks }, 409);
    }

    const item = CATALOG[product];
    const form: Record<string, string> = {
      mode: "payment",
      "payment_method_types[0]": "card",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": item.currency,
      "line_items[0][price_data][unit_amount]": String(item.amount),
      "line_items[0][price_data][product_data][name]": item.name,
      "line_items[0][price_data][product_data][description]":
        `Digital produkt (PDF), version ${PRODUCT_VERSION}. Levereras direkt via e-post.`,
      success_url: `${SITE_URL}/grok-bot?checkout=return&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/grok-bot?checkout=cancel`,
      "metadata[sku]": item.sku,
      "metadata[product]": product,
      "metadata[version]": PRODUCT_VERSION,
      "metadata[legal_ack]": "true",
      "payment_intent_data[metadata][sku]": item.sku,
      "payment_intent_data[metadata][product]": product,
      allow_promotion_codes: "false",
      locale: "sv",
    };
    if (email) {
      form.customer_email = email;
      form["metadata[email]"] = email;
    }

    const res = await stripeFetch("checkout/sessions", { method: "POST", body: form });
    if (!res.ok || !res.data?.url) {
      console.error("[ai-kontoret-create-checkout] stripe error", res.status, res.data?.error?.code);
      return json({ error: "stripe_error" }, 502);
    }

    return json({ url: res.data.url, session_id: res.data.id, product });
  } catch (err) {
    console.error("[ai-kontoret-create-checkout]", err);
    return json({ error: "unexpected_error" }, 500);
  }
});

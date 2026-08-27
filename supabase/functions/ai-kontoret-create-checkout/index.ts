// AI-KONTORET — skapar Stripe Checkout Session server-side.
// Belopp och SKU sätts ALLTID här; klienten kan bara välja produkt.
import {
  corsHeaders,
  json,
  isProduct,
  launchReadiness,
  stripeFetch,
  SITE_URL,
  buildStripeCheckoutForm,
  checkoutRequestGuard,
} from "../_shared/aiKontoret.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const product = body?.product;
    const email = typeof body?.email === "string" ? body.email.trim().slice(0, 200) : "";
    const legalAck = body?.legal_ack === true;

    const guard = checkoutRequestGuard({ product, legal_ack: legalAck });
    if (!guard.ok) return json({ error: guard.error }, 400);
    if (!isProduct(product)) return json({ error: "invalid_product" }, 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return json({ error: "invalid_email" }, 400);
    }

    // Lanseringsspärr: inget köpflöde innan allt är på plats.
    const readiness = await launchReadiness();
    if (!readiness.ready) {
      return json({ error: "not_ready", checks: readiness.checks }, 409);
    }

    const form = buildStripeCheckoutForm(product, {
      email: email || undefined,
      successUrl: `${SITE_URL}/grok-bot?checkout=return&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${SITE_URL}/grok-bot?checkout=cancel`,
    });

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

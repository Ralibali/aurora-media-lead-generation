// ============================================================================
// AI-KONTORET — Stripe webhook + säker leverans.
//
// POST utan x-admin-token  → Stripe webhook (checkout.session.completed)
// POST med  x-admin-token  → ägaren återutfärdar leveranslänkar (reissue)
//
// Regler:
//  - webhooksignatur verifieras server-side (aldrig tillit till query params)
//  - idempotent: stripe_session_id är unik, event_id loggas
//  - fel belopp/valuta/SKU levererar INTE
//  - nedladdningslänkar är korta, signerade URL:er mot en PRIVAT bucket
// ============================================================================
import {
  corsHeaders,
  json,
  CATALOG,
  isAdmin,
  webhookSecret,
  verifyStripeSignature,
  stripeFetch,
  activeAssets,
  createSignedUrl,
  dbSelect,
  dbInsert,
  dbPatch,
  SIGNED_URL_TTL,
  SUPPORT_EMAIL,
  PRODUCT_VERSION,
  LEGAL_ACK_TEXT,
  SITE_URL,
  validateSession,
  buildConsentRecord,
  type Product,
} from "../_shared/aiKontoret.ts";

const FROM = "Christoffer på Aurora Media <christoffer@auroramedia.se>";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function buildLinks(product: Product) {
  const assets = await activeAssets();
  const wanted = CATALOG[product].assets;
  const out: { label: string; url: string }[] = [];
  for (const key of wanted) {
    const asset = assets.find((a) => a.product === key);
    if (!asset) continue;
    const url = await createSignedUrl(asset.storage_path);
    if (url) out.push({ label: asset.label, url });
  }
  return out;
}

async function sendDeliveryEmail(
  email: string,
  product: Product,
  links: { label: string; url: string }[],
  consentAtIso?: string,
) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return { ok: false, reason: "email_not_configured" };
  const days = Math.round(SIGNED_URL_TTL / 86400);
  const item = CATALOG[product];
  const consent = buildConsentRecord({ product, atIso: consentAtIso ?? new Date().toISOString() });
  const list = links
    .map((l) => `<li style="margin:8px 0"><a href="${l.url}">${esc(l.label)}</a></li>`)
    .join("");
  const textList = links.map((l) => `- ${l.label}: ${l.url}`).join("\n");
  const html = `<!doctype html><html lang="sv"><body style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#11151a;line-height:1.6">
<p>Tack för ditt köp av AI-KONTORET (version ${PRODUCT_VERSION}).</p>
<p>Här är dina nedladdningar:</p>
<ul>${list}</ul>
<p>Länkarna är personliga och gäller i ${days} dygn. Behöver du nya länkar – svara på detta mejl eller skriv till <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
<p><strong>Bekräftelse av avtalet</strong></p>
<p>Produkt: ${esc(item.name)}. Belopp: ${item.amount / 100} kr inklusive moms.</p>
<p>Vid köpet samtyckte du aktivt till följande (kryssrutan var inte förifylld):</p>
<blockquote style="margin:12px 0;padding:12px 14px;border-left:3px solid #11151a;background:#f6f5f1">${esc(LEGAL_ACK_TEXT)}</blockquote>
<p>Tidpunkt: ${esc(consent.legal_ack_at)}. Villkor: <a href="${SITE_URL}/villkor#ai-kontoret">${SITE_URL}/villkor#ai-kontoret</a>.</p>
<p>Lycka till med kontoret.<br/>Christoffer, Aurora Media AB</p>
</body></html>`;
  const text = `Tack för ditt köp av AI-KONTORET (version ${PRODUCT_VERSION}).

Dina nedladdningar:
${textList}

Länkarna gäller i ${days} dygn. Behöver du nya länkar, skriv till ${SUPPORT_EMAIL}.

Bekräftelse av avtalet
Produkt: ${item.name}
Belopp: ${item.amount / 100} kr inklusive moms
Vid köpet samtyckte du aktivt till följande (kryssrutan var inte förifylld):
"${LEGAL_ACK_TEXT}"
Tidpunkt: ${consent.legal_ack_at}
Villkor: ${SITE_URL}/villkor#ai-kontoret

Christoffer, Aurora Media AB`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      reply_to: SUPPORT_EMAIL,
      subject: `Din AI-KONTORET-leverans (${product === "bundle" ? "Guide + Prompt Vault" : product === "vault" ? "Prompt Vault" : "Guide"}) v${PRODUCT_VERSION}`,
      html,
      text,
    }),
  });
  if (!res.ok) {
    console.error("[ai-kontoret-deliver] resend error", res.status);
    return { ok: false, reason: "email_failed" };
  }
  return { ok: true };
}


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // ── Ägarens reissue-flöde ────────────────────────────────────────
  if (req.headers.get("x-admin-token")) {
    if (!isAdmin(req)) return json({ error: "unauthorized" }, 401);
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body?.session_id === "string" ? body.session_id : "";
    const email = typeof body?.email === "string" ? body.email.toLowerCase() : "";
    const filter = sessionId
      ? `stripe_session_id=eq.${encodeURIComponent(sessionId)}`
      : email
      ? `email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=1`
      : "";
    if (!filter) return json({ error: "session_id_or_email_required" }, 400);
    const rows = await dbSelect(`ai_kontoret_purchases?${filter}&select=*`);
    const purchase = rows[0];
    if (!purchase) return json({ error: "purchase_not_found" }, 404);
    const links = await buildLinks(purchase.product as Product);
    if (links.length === 0) return json({ error: "assets_missing" }, 409);
    const mail = await sendDeliveryEmail(
      purchase.email,
      purchase.product as Product,
      links,
      purchase.metadata?.legal_ack_at,
    );
    await dbPatch(`ai_kontoret_purchases`, `id=eq.${purchase.id}`, {
      last_delivery_at: new Date().toISOString(),
      delivery_count: (purchase.delivery_count ?? 0) + 1,
      ...(mail.ok && !purchase.delivered_at ? { delivered_at: new Date().toISOString() } : {}),
    });
    return json({ reissued: true, emailed: mail.ok, links: links.length });
  }

  // ── Stripe webhook ───────────────────────────────────────────
  const secret = webhookSecret();
  if (!secret) return json({ error: "webhook_not_configured" }, 503);

  const raw = await req.text();
  const valid = await verifyStripeSignature(raw, req.headers.get("stripe-signature"), secret);
  if (!valid) return json({ error: "invalid_signature" }, 400);

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const eventId = String(event?.id ?? "");
  const eventType = String(event?.type ?? "");
  if (!eventId) return json({ error: "invalid_event" }, 400);

  // Idempotens 1: har eventet redan setts?
  const seen = await dbSelect(`ai_kontoret_webhook_events?event_id=eq.${encodeURIComponent(eventId)}&select=event_id,handled`);
  if (seen.length > 0) return json({ received: true, duplicate: true });
  await dbInsert("ai_kontoret_webhook_events", { event_id: eventId, event_type: eventType });

  if (eventType !== "checkout.session.completed") {
    await dbPatch("ai_kontoret_webhook_events", `event_id=eq.${encodeURIComponent(eventId)}`, {
      handled: true,
      note: "ignored_event_type",
    });
    return json({ received: true, ignored: eventType });
  }

  try {
    // Hämta sessionen från Stripe igen – payloaden i sig är inte källan till sanning.
    const sessionId = String(event?.data?.object?.id ?? "");
    if (!sessionId) return json({ received: true, ignored: "no_session_id" });
    const fetched = await stripeFetch(`checkout/sessions/${encodeURIComponent(sessionId)}`);
    const session = fetched.ok ? fetched.data : event.data.object;

    const check = validateSession(session);
    if (!check.ok) {
      await dbPatch("ai_kontoret_webhook_events", `event_id=eq.${encodeURIComponent(eventId)}`, {
        handled: true,
        note: `rejected:${check.reason}`,
      });
      console.warn("[ai-kontoret-deliver] rejected session", sessionId, check.reason);
      return json({ received: true, delivered: false, reason: check.reason });
    }

    const email = String(
      session?.customer_details?.email ?? session?.customer_email ?? session?.metadata?.email ?? "",
    ).trim();
    if (!email) return json({ received: true, delivered: false, reason: "no_email" });

    // Idempotens 2: unik stripe_session_id.
    const existing = await dbSelect(
      `ai_kontoret_purchases?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=id,delivered_at`,
    );
    if (existing.length > 0 && existing[0].delivered_at) {
      return json({ received: true, duplicate: true, delivered: true });
    }

    let purchaseId = existing[0]?.id as string | undefined;
    if (!purchaseId) {
      const consent = buildConsentRecord({ product: check.product, atIso: new Date().toISOString() });
      const ins = await dbInsert("ai_kontoret_purchases", {
        email,
        product: check.product,
        amount: Number(session.amount_total),
        currency: String(session.currency).toLowerCase(),
        stripe_session_id: sessionId,
        stripe_payment_intent_id: session.payment_intent ?? null,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        stripe_event_id: eventId,
        metadata: {
          sku: session?.metadata?.sku ?? null,
          version: session?.metadata?.version ?? null,
          vat_class: session?.metadata?.vat_class ?? CATALOG[check.product].vat_class,
          ...consent,
        },
      });
      if (!ins.ok) {
        // Race: en parallell webhook hann före → hämta raden.
        const again = await dbSelect(
          `ai_kontoret_purchases?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=id,delivered_at`,
        );
        if (again[0]?.delivered_at) return json({ received: true, duplicate: true });
        purchaseId = again[0]?.id;
      } else {
        purchaseId = Array.isArray(ins.data) ? ins.data[0]?.id : ins.data?.id;
      }
    }

    const links = await buildLinks(check.product);
    if (links.length !== CATALOG[check.product].assets.length) {
      console.error("[ai-kontoret-deliver] assets missing for", check.product);
      return json({ received: true, delivered: false, reason: "assets_missing" });
    }
    const mail = await sendDeliveryEmail(email, check.product, links, new Date().toISOString());
    const now = new Date().toISOString();
    if (purchaseId) {
      await dbPatch("ai_kontoret_purchases", `id=eq.${purchaseId}`, {
        ...(mail.ok ? { delivered_at: now } : {}),
        last_delivery_at: now,
        delivery_count: 1,
      });
    }
    await dbPatch("ai_kontoret_webhook_events", `event_id=eq.${encodeURIComponent(eventId)}`, {
      handled: true,
      note: mail.ok ? "delivered" : "delivery_email_failed",
    });

    // 2xx även om mejlet fallerade – Stripe ska inte spamma om samma event.
    return json({ received: true, delivered: mail.ok });
  } catch (err) {
    console.error("[ai-kontoret-deliver]", err);
    return json({ received: true, error: "handler_error" }, 200);
  }
});

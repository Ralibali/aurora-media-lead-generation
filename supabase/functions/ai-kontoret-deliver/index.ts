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
//  - betalning kan vara paid medan leverans är failed/pending (delivered_at=null)
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
  WITHDRAWAL_PATH,
  validateSession,
  buildConsentRecord,
  buildAgreementCopy,
  purchaseDeliveryPatch,
  webhookIdempotencyDecision,
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
  consentAtIso: string,
  deliveryInitiated: boolean,
  deliveryStatus: "pending" | "failed" | "delivered",
) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return { ok: false, reason: "email_not_configured" };
  const days = Math.round(SIGNED_URL_TTL / 86400);
  const item = CATALOG[product];
  const consent = buildConsentRecord({ product, atIso: consentAtIso });
  const agreement = buildAgreementCopy({
    product,
    legalAckAt: consent.legal_ack_at,
    deliveryInitiated,
    deliveryStatus,
  });
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
${agreement.htmlBlocks.map((b) => `<p>${esc(b)}</p>`).join("\n")}
<blockquote style="margin:12px 0;padding:12px 14px;border-left:3px solid #11151a;background:#f6f5f1">${esc(LEGAL_ACK_TEXT)}</blockquote>
<p>Villkor: <a href="${SITE_URL}/villkor#ai-kontoret">${SITE_URL}/villkor#ai-kontoret</a>. Ångerfunktion: <a href="${SITE_URL}${WITHDRAWAL_PATH}">${SITE_URL}${WITHDRAWAL_PATH}</a>.</p>
<p>Lycka till med kontoret.<br/>Christoffer, Aurora Media AB</p>
</body></html>`;
  const text = `Tack för ditt köp av AI-KONTORET (version ${PRODUCT_VERSION}).

Dina nedladdningar:
${textList}

Länkarna gäller i ${days} dygn. Behöver du nya länkar, skriv till ${SUPPORT_EMAIL}.

Bekräftelse av avtalet
${agreement.text}

Samtyckestext (samma som i kassan):
"${LEGAL_ACK_TEXT}"

Villkor: ${SITE_URL}/villkor#ai-kontoret
Ångerfunktion: ${SITE_URL}${WITHDRAWAL_PATH}

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

async function persistPaidPurchase(input: {
  purchaseId?: string;
  email: string;
  product: Product;
  session: any;
  eventId: string;
  sessionId: string;
  consentAt: string;
}) {
  const consent = buildConsentRecord({ product: input.product, atIso: input.consentAt });
  const row = {
    email: input.email,
    product: input.product,
    amount: Number(input.session.amount_total),
    currency: String(input.session.currency).toLowerCase(),
    stripe_session_id: input.sessionId,
    stripe_payment_intent_id: input.session.payment_intent ?? null,
    stripe_customer_id: typeof input.session.customer === "string" ? input.session.customer : null,
    stripe_event_id: input.eventId,
    payment_status: "paid",
    delivery_status: "pending",
    delivered_at: null,
    metadata: {
      sku: input.session?.metadata?.sku ?? null,
      version: input.session?.metadata?.version ?? null,
      vat_class: input.session?.metadata?.vat_class ?? CATALOG[input.product].vat_class,
      ...consent,
    },
  };
  if (input.purchaseId) {
    await dbPatch("ai_kontoret_purchases", `id=eq.${input.purchaseId}`, {
      payment_status: "paid",
      delivery_status: "pending",
    });
    return input.purchaseId;
  }
  const ins = await dbInsert("ai_kontoret_purchases", row);
  if (!ins.ok) {
    const again = await dbSelect(
      `ai_kontoret_purchases?stripe_session_id=eq.${encodeURIComponent(input.sessionId)}&select=id,delivered_at,delivery_status`,
    );
    return again[0]?.id as string | undefined;
  }
  return (Array.isArray(ins.data) ? ins.data[0]?.id : ins.data?.id) as string | undefined;
}

async function attemptDelivery(input: {
  purchaseId?: string;
  email: string;
  product: Product;
  consentAt: string;
}) {
  const now = new Date().toISOString();
  const links = await buildLinks(input.product);
  const linksOk = links.length === CATALOG[input.product].assets.length;
  let emailOk = false;
  if (linksOk) {
    const mail = await sendDeliveryEmail(
      input.email,
      input.product,
      links,
      input.consentAt,
      true,
      "delivered",
    );
    emailOk = mail.ok;
  }
  const patch = purchaseDeliveryPatch({ linksOk, emailOk, nowIso: now });
  if (input.purchaseId) {
    const current = await dbSelect(
      `ai_kontoret_purchases?id=eq.${input.purchaseId}&select=delivery_count`,
    );
    const nextCount = Number(current[0]?.delivery_count ?? 0) + 1;
    await dbPatch("ai_kontoret_purchases", `id=eq.${input.purchaseId}`, {
      ...patch,
      delivery_count: nextCount,
    });
  }
  return { ...patch, linksOk, emailOk, links };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // ── Ägarens reissue-flöde ──────────────────────────────────
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
    const result = await attemptDelivery({
      purchaseId: purchase.id,
      email: purchase.email,
      product: purchase.product as Product,
      consentAt: purchase.metadata?.legal_ack_at ?? new Date().toISOString(),
    });
    return json({
      reissued: true,
      emailed: result.emailOk,
      links: result.links.length,
      delivery_status: result.delivery_status,
      delivered_at: result.delivered_at,
    });
  }

  // ── Stripe webhook ───────────────────────────────────────
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

  const seen = await dbSelect(`ai_kontoret_webhook_events?event_id=eq.${encodeURIComponent(eventId)}&select=event_id,handled`);
  const sessionIdHint = String(event?.data?.object?.id ?? "");
  const existingHint = sessionIdHint
    ? await dbSelect(
        `ai_kontoret_purchases?stripe_session_id=eq.${encodeURIComponent(sessionIdHint)}&select=id,delivered_at`,
      )
    : [];
  const decision = webhookIdempotencyDecision({
    eventAlreadySeen: seen.length > 0,
    purchaseAlreadyDelivered: Boolean(existingHint[0]?.delivered_at),
  });
  if (decision === "duplicate_delivery") {
    return json({ received: true, duplicate: true, delivered: true });
  }
  if (seen.length === 0) {
    await dbInsert("ai_kontoret_webhook_events", { event_id: eventId, event_type: eventType });
  }

  if (eventType !== "checkout.session.completed") {
    await dbPatch("ai_kontoret_webhook_events", `event_id=eq.${encodeURIComponent(eventId)}`, {
      handled: true,
      note: "ignored_event_type",
    });
    return json({ received: true, ignored: eventType });
  }

  try {
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

    const existing = await dbSelect(
      `ai_kontoret_purchases?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=id,delivered_at,metadata,delivery_status`,
    );
    if (existing[0]?.delivered_at) {
      return json({ received: true, duplicate: true, delivered: true });
    }

    const consentAt = existing[0]?.metadata?.legal_ack_at ?? new Date().toISOString();
    const purchaseId = await persistPaidPurchase({
      purchaseId: existing[0]?.id,
      email,
      product: check.product,
      session,
      eventId,
      sessionId,
      consentAt,
    });

    const result = await attemptDelivery({
      purchaseId,
      email,
      product: check.product,
      consentAt,
    });

    await dbPatch("ai_kontoret_webhook_events", `event_id=eq.${encodeURIComponent(eventId)}`, {
      handled: true,
      note: result.delivery_status === "delivered" ? "delivered" : `delivery_${result.delivery_status}`,
    });

    return json({
      received: true,
      delivered: result.delivery_status === "delivered",
      payment_status: result.payment_status,
      delivery_status: result.delivery_status,
      delivered_at: result.delivered_at,
    });
  } catch (err) {
    console.error("[ai-kontoret-deliver]", err);
    return json({ received: true, error: "handler_error" }, 200);
  }
});

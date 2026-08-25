// AI-KONTORET — serververifiering av checkout-retur.
// Klienten skickar session_id från success-URL:en; endast Stripe/databasen
// avgör om köpet är betalt. En query-parameter är ALDRIG bevis i sig.
import {
  corsHeaders,
  json,
  CATALOG,
  isProduct,
  stripeFetch,
  dbSelect,
  stripeKey,
} from "../_shared/aiKontoret.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body?.session_id === "string" ? body.session_id.trim() : "";
    if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) {
      return json({ paid: false, reason: "invalid_session_id" }, 400);
    }
    if (!stripeKey()) return json({ paid: false, reason: "stripe_not_configured" }, 200);

    // 1) Redan verifierat och registrerat av webhooken?
    const rows = await dbSelect(
      `ai_kontoret_purchases?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=product,delivered_at,email`,
    );
    if (rows[0]) {
      return json({
        paid: true,
        product: rows[0].product,
        delivered: Boolean(rows[0].delivered_at),
        email_masked: maskEmail(String(rows[0].email ?? "")),
      });
    }

    // 2) Annars: fråga Stripe direkt (webhooken kan ligga någon sekund efter).
    const res = await stripeFetch(`checkout/sessions/${encodeURIComponent(sessionId)}`);
    if (!res.ok) return json({ paid: false, reason: "session_not_found" }, 200);
    const s = res.data;
    const product = s?.metadata?.product;
    if (!isProduct(product)) return json({ paid: false, reason: "not_ai_kontoret" }, 200);
    const item = CATALOG[product];
    const valid =
      s?.payment_status === "paid" &&
      s?.metadata?.sku === item.sku &&
      Number(s?.amount_total) === item.amount &&
      String(s?.currency ?? "").toLowerCase() === item.currency;
    if (!valid) return json({ paid: false, reason: "not_paid" }, 200);

    return json({ paid: true, product, delivered: false, pending_delivery: true });
  } catch (err) {
    console.error("[ai-kontoret-verify-session]", err);
    return json({ paid: false, reason: "unexpected_error" }, 200);
  }
});

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "";
  const shown = local.slice(0, 1);
  return `${shown}${"*".repeat(Math.max(1, local.length - 1))}@${domain}`;
}

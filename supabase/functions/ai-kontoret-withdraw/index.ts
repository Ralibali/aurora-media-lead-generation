// AI-KONTORET — DAL 2 kap. 10 a § elektronisk ångerfunktion.
// Tar emot begäran, sparar den, skickar mottagningsbevis. Inget automatiskt juridiskt beslut.
import {
  corsHeaders,
  json,
  dbInsert,
  dbPatch,
  SUPPORT_EMAIL,
  validateWithdrawalRequest,
  withdrawalInsertRow,
  buildWithdrawalReceiptCopy,
  withdrawalReceiptIsReceiptOnly,
} from "../_shared/aiKontoret.ts";

const FROM = "Aurora Media AB <info@auroramedia.se>";

async function sendReceipt(to: string, copy: { subject: string; html: string; text: string }) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return { ok: false, reason: "email_not_configured" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: SUPPORT_EMAIL,
      subject: copy.subject,
      html: copy.html,
      text: copy.text,
    }),
  });
  if (!res.ok) {
    console.error("[ai-kontoret-withdraw] resend error", res.status);
    return { ok: false, reason: "email_failed" };
  }
  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = validateWithdrawalRequest({
      name: body?.name,
      email: body?.email,
      sessionId: body?.session_id ?? body?.sessionId,
      product: body?.product || null,
      description: body?.description,
      confirm: body?.confirm === true,
    });
    if (!parsed.ok) return json({ error: parsed.reason }, 400);

    const submittedAt = new Date().toISOString();
    const row = withdrawalInsertRow(parsed.data, submittedAt);
    const ins = await dbInsert("ai_kontoret_withdrawals", {
      ...row,
      metadata: { source: "angra-kop", receipt_only: true },
    });
    if (!ins.ok) {
      console.error("[ai-kontoret-withdraw] persist failed", ins.status);
      return json({ error: "persist_failed" }, 500);
    }
    const saved = Array.isArray(ins.data) ? ins.data[0] : ins.data;
    const requestId = saved?.id ? String(saved.id) : undefined;
    const copy = buildWithdrawalReceiptCopy({
      name: parsed.data.name,
      email: parsed.data.email,
      submittedAt,
      sessionId: parsed.data.session_id,
      product: parsed.data.product,
      description: parsed.data.description,
      requestId,
    });
    if (!withdrawalReceiptIsReceiptOnly(copy.text)) {
      return json({ error: "receipt_copy_invalid" }, 500);
    }
    const mail = await sendReceipt(parsed.data.email, copy);
    if (requestId) {
      await dbPatch("ai_kontoret_withdrawals", `id=eq.${requestId}`, {
        receipt_emailed: mail.ok,
      });
    }

    return json({
      received: true,
      decision: "none",
      submitted_at: submittedAt,
      request_id: requestId ?? null,
      receipt_emailed: mail.ok,
      status: "received",
    });
  } catch (err) {
    console.error("[ai-kontoret-withdraw]", err);
    return json({ error: "unexpected_error" }, 500);
  }
});

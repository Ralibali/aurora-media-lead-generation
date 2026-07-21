// Edge Function: send-ai-map-pdf
// Mejlar den färdiga AI-kartan som PDF-bilaga till leadens egen adress.
// Anropas från resultatsidan direkt efter att wizarden slutförts.
//
// Säkerhet: kräver leadens share_token (16–64 hex, ogissningsbar) och slår
// upp e-postadressen server-side – klienten skickar aldrig adressen själv,
// så funktionen kan inte missbrukas för att mejla godtyckliga mottagare.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body?.token ?? "").trim();
    const pdfBase64 = String(body?.pdfBase64 ?? "");
    const filename = String(body?.filename ?? "aurora-ai-karta.pdf").replace(/[^\w.\-]/g, "-").slice(0, 120);

    if (!/^[a-f0-9]{16,64}$/i.test(token)) return json({ error: "invalid_token" }, 400);
    // jsPDF-bilagor är normalt 100–400 kB → base64 ~150–550 tusen tecken. Tak: 10 MB.
    if (!pdfBase64 || pdfBase64.length > 10_000_000) return json({ error: "invalid_pdf" }, 400);
    if (/[^A-Za-z0-9+/=]/.test(pdfBase64.slice(0, 400))) return json({ error: "invalid_pdf" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "server_misconfigured" }, 500);
    if (!RESEND_API_KEY) return json({ error: "email_not_configured" }, 500);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: lead, error } = await admin
      .from("ai_map_leads")
      .select("email, contact_name, company_name, total_potential")
      .eq("share_token", token)
      .maybeSingle();

    if (error) {
      console.error("[send-ai-map-pdf] lead err", error);
      return json({ error: "server_error" }, 500);
    }
    if (!lead?.email) return json({ error: "not_found" }, 404);

    const firstName = escape((lead.contact_name || "").split(" ")[0] || "där");
    const company = escape(lead.company_name || "ert företag");
    const resultUrl = `https://auroramedia.se/ai-karta/resultat?t=${encodeURIComponent(token)}&ref=email-pdf`;

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;color:#14171A;line-height:1.55;">
        <h1 style="margin:0 0 14px;font-size:22px;letter-spacing:-0.01em;">Hej ${firstName}!</h1>
        <p style="margin:0 0 14px;">Här är er AI-karta för <strong>${company}</strong> – bifogad som PDF. Den visar vad era processer kostar idag, vilken som bör automatiseras först och vad ett första bygge kostar med återbetalningstid.</p>
        <p style="margin:0 0 18px;">Kartan finns också kvar online om du vill se den igen eller dela den med kollegor:</p>
        <p style="margin:0 0 20px;">
          <a href="${resultUrl}" style="display:inline-block;background:#E8500A;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:10px;font-size:15px;font-weight:600;">Öppna er AI-karta →</a>
        </p>
        <p style="margin:0 0 6px;">Vill du att jag pekar ut exakt vad första bygget blir för er? Svara direkt på det här mejlet, eller boka 20 minuter via knappen i kartan – kostnadsfritt och utan köpkrav.</p>
        <p style="margin:22px 0 0;">/ Christoffer<br/><span style="color:#4A5058;font-size:13px;">Aurora Media AB · Linköping · christoffer@auroramedia.se</span></p>
      </div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Aurora Media <noreply@auroramedia.se>",
        to: [lead.email],
        reply_to: "christoffer@auroramedia.se",
        subject: `Er AI-karta – ${lead.company_name || "personlig analys"}`,
        html,
        attachments: [{ filename, content: pdfBase64 }],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("[send-ai-map-pdf] resend error", resp.status, txt);
      return json({ error: "email_failed" }, 502);
    }

    console.log("[send-ai-map-pdf] sent to", lead.email, "lead token", token.slice(0, 8));
    return json({ ok: true });
  } catch (e) {
    console.error("[send-ai-map-pdf] threw", e);
    return json({ error: "server_error" }, 500);
  }
});

// Edge Function: ai-map-unsubscribe
// GET /?token=XXX[&reason=not_now][&pause=6m]
// Markerar drip-sekvensen som avregistrerad och returnerar en HTML-sida.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function pageHtml(title: string, message: string, ok = true): string {
  const accent = ok ? "#0f5132" : "#b91c1c";
  return `<!doctype html><html lang="sv"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title></head>
<body style="margin:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
<div style="max-width:560px;margin:60px auto;padding:0 16px;">
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
    <div style="background:${accent};padding:18px 24px;color:#ffffff;font-weight:600;letter-spacing:0.08em;">AURORA MEDIA</div>
    <div style="padding:32px 28px;">
      <h1 style="font-size:22px;margin:0 0 12px;font-weight:700;">${title}</h1>
      <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px;">${message}</p>
      <a href="https://auroramedia.se" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:999px;font-size:14px;font-weight:600;">Tillbaka till auroramedia.se</a>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 24px;font-size:12px;color:#64748b;">
      Aurora Media AB · Org.nr 559272-0220 · Linköping
    </div>
  </div>
</div></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const token = url.searchParams.get("token")?.trim() ?? "";
  const reasonParam = url.searchParams.get("reason")?.trim().slice(0, 40) ?? "";
  const pause = url.searchParams.get("pause")?.trim().slice(0, 10) ?? "";
  const reason = reasonParam || (pause ? `pause_${pause}` : "user_request");

  if (!token) {
    return new Response(pageHtml("Ogiltig länk", "Avregistreringslänken saknar token. Kontakta info@auroramedia.se om du behöver hjälp.", false), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: row, error: selErr } = await admin
    .from("ai_map_email_sequence")
    .select("id, unsubscribed_at")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (selErr || !row) {
    return new Response(pageHtml("Ogiltig länk", "Vi hittade ingen prenumeration som matchar den här länken. Den kan redan ha tagits bort.", false), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (row.unsubscribed_at) {
    return new Response(pageHtml("Redan avregistrerad", "Du är redan borttagen från uppföljningen för denna AI-karta. Vi hör inte av oss mer."), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  await admin
    .from("ai_map_email_sequence")
    .update({ unsubscribed_at: new Date().toISOString(), unsubscribed_reason: reason })
    .eq("id", row.id);

  const msg = pause === "6m"
    ? "Vi pausar uppföljningen. Du hör inte av oss mer om denna analys – men hör gärna av dig själv om något ändras."
    : "Du är avregistrerad. Inget mer mejl kommer från denna analys. Hör gärna av dig om något ändras.";

  return new Response(pageHtml("Tack – du är avregistrerad", msg), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
});

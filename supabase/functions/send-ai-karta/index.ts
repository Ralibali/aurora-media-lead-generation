// Edge Function: send-ai-karta
// Lead-magnet endpoint för AI-kartan. Tar emot namn + e-post (+ valfritt företag),
// sparar leadet i `leads`, genererar en signerad nedladdningsURL till PDF:en
// i Supabase Storage-bucket `lead-magnets`, och mailar både användaren och info@.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  name: string;
  email: string;
  company?: string;
  website?: string; // honeypot
  _renderedAt?: number;
}

type RateEntry = { count: number; windowStart: number; lastAt: number };
const RATE_BUCKET = new Map<string, RateEntry>();
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX_PER_WINDOW = 5;
const RATE_MIN_GAP_MS = 20 * 1000;

function checkRateLimit(ip: string): { ok: boolean; reason?: string } {
  const now = Date.now();
  const entry = RATE_BUCKET.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    RATE_BUCKET.set(ip, { count: 1, windowStart: now, lastAt: now });
    return { ok: true };
  }
  if (now - entry.lastAt < RATE_MIN_GAP_MS) {
    return { ok: false, reason: "Vänta en stund innan du försöker igen." };
  }
  if (entry.count >= RATE_MAX_PER_WINDOW) {
    return { ok: false, reason: "För många nedladdningar. Försök igen om en stund." };
  }
  entry.count += 1;
  entry.lastAt = now;
  return { ok: true };
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const PDF_BUCKET = "lead-magnets";
const PDF_PATH = "aurora-ai-karta.pdf";
const SIGNED_URL_TTL_SEC = 60 * 60 * 24 * 7; // 7 dagar

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Body;

    if (typeof body.website === "string" && body.website.trim() !== "") {
      console.warn("[send-ai-karta] honeypot triggered", { ip: getClientIp(req) });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof body._renderedAt === "number" && body._renderedAt > 0) {
      const elapsed = Date.now() - body._renderedAt;
      if (elapsed < 3000) {
        console.warn("[send-ai-karta] submitted too fast", { elapsed, ip: getClientIp(req) });
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const ip = getClientIp(req);
    const rate = checkRateLimit(ip);
    if (!rate.ok) {
      return new Response(JSON.stringify({ error: rate.reason ?? "Rate limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = String(body.name ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().slice(0, 160);
    const company = String(body.company ?? "").trim().slice(0, 120);
    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? "";

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Namn och e-post krävs." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Ogiltig e-postadress." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const admin = SUPABASE_URL && SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY) : null;

    if (!admin) {
      console.error("[send-ai-karta] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(JSON.stringify({ error: "Server-konfiguration saknas." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: signed, error: signErr } = await admin.storage
      .from(PDF_BUCKET)
      .createSignedUrl(PDF_PATH, SIGNED_URL_TTL_SEC, { download: "aurora-ai-karta.pdf" });

    if (signErr || !signed?.signedUrl) {
      console.error("[send-ai-karta] failed to sign url", signErr);
      return new Response(JSON.stringify({ error: "Kunde inte generera nedladdningslänk." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const downloadUrl = signed.signedUrl;

    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: dupes } = await admin
        .from("leads")
        .select("id")
        .eq("email", email)
        .eq("paket", "ai-karta")
        .gte("created_at", fiveMinAgo)
        .limit(1);
      if (dupes && dupes.length > 0) {
        return new Response(
          JSON.stringify({ ok: true, leadId: dupes[0].id, downloadUrl, deduplicated: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (e) {
      console.error("[send-ai-karta] dedupe threw", e);
    }

    let leadId: string | null = null;
    try {
      const { data, error } = await admin
        .from("leads")
        .insert({
          name,
          email,
          company: company || null,
          paket: "ai-karta",
          lead_label: "AI-kartan – nedladdning",
          message: company ? `Hämtade AI-kartan från ${company}.` : "Hämtade AI-kartan.",
          ip,
          user_agent: userAgent || null,
        })
        .select("id")
        .single();
      if (error) console.error("[send-ai-karta] failed to save lead", error);
      else leadId = data.id;
    } catch (e) {
      console.error("[send-ai-karta] lead save threw", e);
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: true, leadId, downloadUrl, queued: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = escape(name.split(" ")[0]);
    const userHtml = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#0f172a;">
  <div style="padding:32px 32px 16px;border-bottom:1px solid #e2e8f0;">
    <div style="display:inline-flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;border-radius:10px;background:#0f5132;color:#ffffff;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-family:Georgia,serif;">A</div>
      <strong style="letter-spacing:0.18em;font-size:12px;color:#0f172a;">AURORA MEDIA</strong>
    </div>
  </div>
  <div style="padding:32px;">
    <h1 style="font-size:26px;line-height:1.2;margin:0 0 16px;color:#0f172a;">Här är din AI-karta, ${firstName}!</h1>
    <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 22px;">
      Tack för att du hämtade Aurora AI-karta. Det här är en arbetsmall som hjälper er identifiera vilka uppgifter, system och processer som faktiskt kan automatiseras eller byggas om med AI – inte ännu ett strategidokument.
    </p>
    <div style="margin:28px 0;">
      <a href="${downloadUrl}" style="display:inline-block;background:#0f5132;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 26px;border-radius:999px;font-size:15px;">Ladda ner AI-kartan (PDF)</a>
    </div>
    <p style="font-size:13px;color:#64748b;margin:0 0 28px;">
      Länken är giltig i 7 dagar. Om den slutar fungera, hämta en ny på <a href="https://auroramedia.se/ai-karta" style="color:#0f5132;">auroramedia.se/ai-karta</a>.
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <h2 style="font-size:18px;margin:0 0 12px;color:#0f172a;">Så använder ni mallen</h2>
    <ol style="padding-left:20px;color:#334155;font-size:14px;line-height:1.7;margin:0 0 24px;">
      <li>Skriv ut den, eller fyll i digitalt.</li>
      <li>Sätt er med ledningsgrupp eller team i 30–60 minuter.</li>
      <li>Lista era uppgifter, bedöm AI-potential 1–5, prioritera A/B/C.</li>
      <li>Plocka ut topp-3 – det är där ni börjar bygga.</li>
    </ol>
    <h2 style="font-size:18px;margin:0 0 12px;color:#0f172a;">Vill ni hjälp att gå igenom svaren?</h2>
    <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 20px;">
      Boka en kostnadsfri AI-genomlysning så går vi igenom era topp-3 case och ger en uppskattning av tid och kostnad för det första bygget.
    </p>
    <a href="https://auroramedia.se/kontakt" style="display:inline-block;border:1px solid #0f5132;color:#0f5132;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-size:14px;">Boka AI-genomlysning →</a>
  </div>
  <div style="padding:24px 32px;background:#f8fafc;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;">
    Aurora Media AB · Org.nr 559272-0220 · Linköping, Sverige<br />
    Du fick det här mejlet eftersom du hämtade AI-kartan på auroramedia.se/ai-karta.
  </div>
</div>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Aurora Media <noreply@auroramedia.se>",
        to: [email],
        reply_to: "info@auroramedia.se",
        subject: "Din Aurora AI-karta är här",
        html: userHtml,
      }),
    }).catch((e) => console.error("[send-ai-karta] user mail threw", e));

    const INTERNAL_LEADS_EMAIL = Deno.env.get("INTERNAL_LEADS_EMAIL")?.trim();
    const internalTo = INTERNAL_LEADS_EMAIL || "info@auroramedia.se";
    const internalHtml = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
  <h2 style="margin:0 0 12px;">Ny AI-karta-nedladdning</h2>
  <p style="margin:0 0 16px;color:#64748b;font-size:13px;">AI-kartan – nedladdning</p>
  <p><strong>Namn:</strong> ${escape(name)}</p>
  <p><strong>E-post:</strong> ${escape(email)}</p>
  <p><strong>Företag:</strong> ${escape(company || "—")}</p>
  <p><strong>IP:</strong> ${escape(ip)}</p>
  ${leadId ? `<p><strong>Lead-ID:</strong> ${escape(leadId)} · <a href="https://auroramedia.se/admin/leads">/admin/leads</a></p>` : ""}
</div>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Aurora Media <noreply@auroramedia.se>",
        to: [internalTo],
        reply_to: email,
        subject: `Ny lead – AI-kartan – ${name}`,
        html: internalHtml,
      }),
    }).catch((e) => console.error("[send-ai-karta] internal mail threw", e));

    return new Response(JSON.stringify({ ok: true, leadId, downloadUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-ai-karta] error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

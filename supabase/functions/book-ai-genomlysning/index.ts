// Edge Function: book-ai-genomlysning
// Sparar bokningen i genomlysning_leads och skickar mejl till info@auroramedia.se.
// Mejlet skickas alltid – DB-insert är best effort så att inga bokningar tappas.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  contact_name: string;
  email: string;
  company_name?: string;
  phone?: string;
  message?: string;
  total_potential?: string;
  totalSavedPerYear?: number;
  topProcesses?: string[];
  preferred_time?: string;
  website?: string; // honeypot
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Body;

    if (typeof body.website === "string" && body.website.trim() !== "") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contact_name = String(body.contact_name ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().slice(0, 160);
    const company_name = String(body.company_name ?? "").trim().slice(0, 120);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const message = String(body.message ?? "").trim().slice(0, 1000);
    const preferred_time = String(body.preferred_time ?? "").trim().slice(0, 120);
    const total_potential = String(body.total_potential ?? "").trim().slice(0, 40);
    const totalSavedPerYear = Number(body.totalSavedPerYear ?? 0) || 0;
    const topProcesses = Array.isArray(body.topProcesses)
      ? body.topProcesses.slice(0, 5).map((s) => String(s).slice(0, 160))
      : [];

    if (!contact_name || !email) {
      return new Response(JSON.stringify({ error: "Namn och e-post krävs." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Ogiltig e-postadress." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Best-effort: spara bokningen i genomlysning_leads. Misslyckas den så mejlar vi ändå.
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_KEY) {
        const admin = createClient(SUPABASE_URL, SERVICE_KEY);
        const composedMessage = [
          preferred_time ? `Önskad tid: ${preferred_time}` : "",
          total_potential ? `AI-potential: ${total_potential}` : "",
          totalSavedPerYear ? `Uppskattad besparing: ~${totalSavedPerYear} h/år` : "",
          topProcesses.length ? `Topp-processer: ${topProcesses.join(", ")}` : "",
          message,
        ].filter(Boolean).join("\n");
        const { error: insErr } = await admin.from("genomlysning_leads").insert({
          name: contact_name,
          email,
          phone: phone || null,
          company: company_name || null,
          message: composedMessage || null,
        });
        if (insErr) console.error("[book-ai-genomlysning] db insert failed", insErr);
      } else {
        console.warn("[book-ai-genomlysning] Supabase env missing – skipping DB insert");
      }
    } catch (e) {
      console.error("[book-ai-genomlysning] db insert threw", e);
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.warn("[book-ai-genomlysning] RESEND_API_KEY not set – logging only", { contact_name, email });
      return new Response(JSON.stringify({ ok: true, queued: false }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `Bokning av AI-genomlysning – ${contact_name}${company_name ? ` (${company_name})` : ""}`;
    const internalHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;color:#0f172a;">
        <h2 style="margin:0 0 12px;">Ny bokning av AI-genomlysning</h2>
        <p style="font-size:14px;padding:8px 12px;background:#f3f6f4;border-left:3px solid #1f7a5e;display:inline-block;border-radius:4px;">
          Önskar bli kontaktad för att boka tid (45 min, kostnadsfri).
        </p>
        <p><strong>Namn:</strong> ${escape(contact_name)}</p>
        <p><strong>E-post:</strong> <a href="mailto:${escape(email)}">${escape(email)}</a></p>
        ${company_name ? `<p><strong>Företag:</strong> ${escape(company_name)}</p>` : ""}
        ${phone ? `<p><strong>Telefon:</strong> ${escape(phone)}</p>` : ""}
        ${preferred_time ? `<p><strong>Önskad tid:</strong> ${escape(preferred_time)}</p>` : ""}
        ${total_potential ? `<p><strong>AI-potential (scoring):</strong> ${escape(total_potential)}</p>` : ""}
        ${totalSavedPerYear ? `<p><strong>Uppskattad besparing:</strong> ~${totalSavedPerYear} h/år</p>` : ""}
        ${topProcesses.length ? `<p><strong>Topp-3 processer:</strong></p><ul>${topProcesses.map((p) => `<li>${escape(p)}</li>`).join("")}</ul>` : ""}
        ${message ? `<hr/><p style="white-space:pre-wrap;"><strong>Meddelande:</strong><br/>${escape(message)}</p>` : ""}
        <hr/>
        <p style="font-size:12px;color:#666;">Skickat från /ai-karta/resultat – AI-kartan</p>
      </div>
    `;

    const customerHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;color:#0f172a;">
        <h2 style="margin:0 0 12px;">Tack ${escape(contact_name.split(" ")[0])}!</h2>
        <p>Vi har tagit emot din bokningsförfrågan för en kostnadsfri AI-genomlysning (45 min).</p>
        <p>Du får en kalenderinbjudan inom kort – oftast samma arbetsdag. Hör gärna av dig till
          <a href="mailto:info@auroramedia.se">info@auroramedia.se</a> om du har frågor under tiden.</p>
        <p style="margin-top:24px;">Hälsningar,<br/>Aurora Media</p>
      </div>
    `;

    // Mejla info@
    const internalRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Aurora Media <noreply@auroramedia.se>",
        to: ["info@auroramedia.se"],
        reply_to: email,
        subject,
        html: internalHtml,
      }),
    });
    if (!internalRes.ok) {
      const text = await internalRes.text();
      console.error("[book-ai-genomlysning] internal email failed", internalRes.status, text);
      return new Response(JSON.stringify({ error: "E-post kunde inte skickas." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Bekräftelse till kunden (best effort)
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Aurora Media <noreply@auroramedia.se>",
          to: [email],
          reply_to: "info@auroramedia.se",
          subject: "Bekräftelse: AI-genomlysning på väg",
          html: customerHtml,
        }),
      });
    } catch (e) {
      console.error("[book-ai-genomlysning] customer confirmation failed", e);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[book-ai-genomlysning] error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

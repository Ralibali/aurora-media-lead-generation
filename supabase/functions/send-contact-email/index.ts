// Edge Function: send-contact-email
// Receives contact form submissions, saves them to the `leads` table,
// and emails info@auroramedia.se (+ optional internal BCC) via Resend.

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
  paket: string;
  platform?: string;
  leadLabel?: string;
  internalNote?: string;
  message: string;
  website?: string; // honeypot — ska vara tomt
  _renderedAt?: number; // klienttid när formuläret renderades (ms)
}

// Enkel in-memory rate limiter per IP. Återställs när funktionen kallstartar,
// vilket räcker för att stoppa enkel skräp-trafik.
type RateEntry = { count: number; windowStart: number; lastAt: number };
const RATE_BUCKET = new Map<string, RateEntry>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 timme
const RATE_MAX_PER_WINDOW = 3;
const RATE_MIN_GAP_MS = 30 * 1000; // 30s mellan submits

function checkRateLimit(ip: string): { ok: boolean; reason?: string } {
  const now = Date.now();
  const entry = RATE_BUCKET.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    RATE_BUCKET.set(ip, { count: 1, windowStart: now, lastAt: now });
    return { ok: true };
  }
  if (now - entry.lastAt < RATE_MIN_GAP_MS) {
    return { ok: false, reason: "Vänta en stund innan du skickar igen." };
  }
  if (entry.count >= RATE_MAX_PER_WINDOW) {
    return { ok: false, reason: "För många förfrågningar. Försök igen om en stund." };
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

    // 1) Honeypot — bots fyller i dolda fält
    if (typeof body.website === "string" && body.website.trim() !== "") {
      console.warn("[send-contact-email] honeypot triggered", { ip: getClientIp(req) });
      // Svara 200 så bot inte vet att den blev avvisad
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Min-fill-time — formulär submittade < 3s efter render = troligen bot
    if (typeof body._renderedAt === "number" && body._renderedAt > 0) {
      const elapsed = Date.now() - body._renderedAt;
      if (elapsed < 3000) {
        console.warn("[send-contact-email] submitted too fast", { elapsed, ip: getClientIp(req) });
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3) Rate limit per IP
    const ip = getClientIp(req);
    const rate = checkRateLimit(ip);
    if (!rate.ok) {
      console.warn("[send-contact-email] rate limited", { ip, reason: rate.reason });
      return new Response(JSON.stringify({ error: rate.reason ?? "Rate limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = String(body.name ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().slice(0, 160);
    const company = String(body.company ?? "").trim().slice(0, 120);
    const paket = String(body.paket ?? "").trim().slice(0, 60);
    const platform = String(body.platform ?? "").trim().slice(0, 40);
    const leadLabel = String(body.leadLabel ?? "").trim().slice(0, 160);
    const internalNote = String(body.internalNote ?? "").trim().slice(0, 500);
    const message = String(body.message ?? "").trim().slice(0, 2000);
    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? "";

    if (!name || !email || !paket || message.length < 20) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const admin = SUPABASE_URL && SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY) : null;

    // Deduplicering — samma namn+email+meddelande inom 10 min = duplikat
    if (admin) {
      try {
        const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { data: dupes, error: dupErr } = await admin
          .from("leads")
          .select("id")
          .eq("email", email)
          .eq("name", name)
          .eq("message", message)
          .gte("created_at", tenMinAgo)
          .limit(1);
        if (dupErr) {
          console.error("[send-contact-email] dedupe check failed", dupErr);
        } else if (dupes && dupes.length > 0) {
          console.log("[send-contact-email] duplicate suppressed", { email, leadId: dupes[0].id });
          // Svara 200 så användaren inte tror att något gick fel
          return new Response(JSON.stringify({ ok: true, leadId: dupes[0].id, deduplicated: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.error("[send-contact-email] dedupe threw", e);
      }
    }

    // Spara leadet i databasen (best effort — bryt inte mailet om det failar)
    let leadId: string | null = null;
    if (admin) {
      try {
        const { data, error } = await admin
          .from("leads")
          .insert({
            name,
            email,
            company: company || null,
            paket,
            platform: platform || null,
            lead_label: leadLabel || null,
            internal_note: internalNote || null,
            message,
            ip,
            user_agent: userAgent || null,
          })
          .select("id")
          .single();
        if (error) {
          console.error("[send-contact-email] failed to save lead", error);
        } else {
          leadId = data.id;
        }
      } catch (e) {
        console.error("[send-contact-email] lead save threw", e);
      }
    }

    // Använd den fullständiga lead-etiketten i ämnesraden om den finns,
    // annars fall tillbaka på paket-värdet.
    const subjectLabel = leadLabel || `Intresserad av: ${paket}`;
    const subject = `Ny förfrågan – ${subjectLabel} – ${name}`;
    const html = `
      <h2>Ny projektförfrågan</h2>
      <p style="font-size:14px;padding:8px 12px;background:#f3f6f4;border-left:3px solid #1f7a5e;display:inline-block;border-radius:4px;">
        <strong>${escape(leadLabel || `Intresserad av: ${paket}`)}</strong>
      </p>
      ${internalNote ? `
      <p style="font-size:13px;padding:10px 12px;margin-top:8px;background:#fff8e1;border-left:3px solid #d97706;border-radius:4px;">
        <strong>Intern notering:</strong><br/>${escape(internalNote)}
      </p>` : ""}
      <p><strong>Namn:</strong> ${escape(name)}</p>
      <p><strong>E-post:</strong> ${escape(email)}</p>
      <p><strong>Företag:</strong> ${escape(company || "—")}</p>
      <p><strong>Paket (värde):</strong> ${escape(paket)}</p>
      ${platform ? `<p><strong>Plattform:</strong> ${escape(platform)}</p>` : ""}
      <hr />
      <p style="white-space: pre-wrap;">${escape(message)}</p>
      ${leadId ? `<p style="margin-top:16px;font-size:12px;color:#666;">Lead-ID: ${escape(leadId)} · sparad i adminpanelen (/admin/leads)</p>` : ""}
    `;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.log("[send-contact-email] RESEND_API_KEY not set – logging only", {
        name, email, company, paket, messageLength: message.length, leadId,
      });
      return new Response(JSON.stringify({ ok: true, queued: false, leadId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Intern BCC-mottagare (kopia av varje lead). Faller tillbaka till info@.
    const INTERNAL_LEADS_EMAIL = Deno.env.get("INTERNAL_LEADS_EMAIL")?.trim();
    const bcc = INTERNAL_LEADS_EMAIL && INTERNAL_LEADS_EMAIL !== "info@auroramedia.se"
      ? [INTERNAL_LEADS_EMAIL]
      : undefined;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Aurora Media <noreply@auroramedia.se>",
        to: ["info@auroramedia.se"],
        ...(bcc ? { bcc } : {}),
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[send-contact-email] Resend error", res.status, text);
      return new Response(JSON.stringify({ error: "Email provider failed", leadId }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, leadId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-contact-email] error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
  }
});

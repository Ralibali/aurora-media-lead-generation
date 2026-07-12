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

// Enkel in-memory rate limiter per IP (snabbfilter). Persistent DB-limit görs
// dessutom senare via RPC `try_contact_rate_limit` — den är den auktoritativa.
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

// Godkända origins för att stoppa cross-site postningar från bot-nät.
const ALLOWED_ORIGIN_HOSTS = new Set([
  "auroramedia.se",
  "www.auroramedia.se",
  "media-magic-leads.lovable.app",
  "localhost",
  "127.0.0.1",
]);

function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    if (ALLOWED_ORIGIN_HOSTS.has(host)) return true;
    // Tillåt Lovable preview-subdomäner (id-preview--*.lovable.app)
    if (host.endsWith(".lovable.app")) return true;
    return false;
  } catch {
    return false;
  }
}

// Innehållsheuristik — plockar upp uppenbara skräpmönster som slipper igenom Zod.
function looksLikeSpam(name: string, message: string): string | null {
  const combined = `${name}\n${message}`;
  const urlMatches = combined.match(/(https?:\/\/|www\.)/gi) ?? [];
  if (urlMatches.length > 3) return "too_many_links";

  // Övervägande icke-latinska tecken (kyrilliska/CJK) i namn = ofta spam-bot
  const nonLatin = (name.match(/[\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/g) ?? []).length;
  if (name.length > 0 && nonLatin / name.length > 0.5) return "non_latin_name";

  // Meddelande där > 70% är versaler och > 40 tecken långt
  const letters = message.replace(/[^A-Za-zÅÄÖåäö]/g, "");
  if (letters.length > 40) {
    const upper = letters.replace(/[^A-ZÅÄÖ]/g, "").length;
    if (upper / letters.length > 0.7) return "all_caps";
  }

  // BBCode / vanliga spam-triggers
  if (/\[url=|\[link=|<a\s+href=/i.test(message)) return "bbcode_or_html_link";

  return null;
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

    // Auto-svar till avsändaren — bekräftelse på att vi tagit emot meddelandet
    try {
      const autoReplyHtml = `
        <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <h2 style="font-size:20px;margin:0 0 16px;color:#0f1f1a;">Tack ${escape(name)} – vi har tagit emot din förfrågan!</h2>
          <p style="font-size:15px;line-height:1.55;color:#333;margin:0 0 16px;">
            Vi återkommer personligen inom 24 timmar (vardagar) med nästa steg. Under tiden – om något brådskar
            är du välkommen att svara direkt på det här mejlet eller ringa oss.
          </p>
          <div style="padding:14px 16px;background:#f3f6f4;border-left:3px solid #1f7a5e;border-radius:4px;margin:18px 0;">
            <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#1f7a5e;font-weight:600;">Din förfrågan</p>
            <p style="margin:0 0 4px;font-size:14px;"><strong>Ämne:</strong> ${escape(subjectLabel)}</p>
            ${company ? `<p style="margin:0 0 4px;font-size:14px;"><strong>Företag:</strong> ${escape(company)}</p>` : ""}
            <p style="margin:8px 0 0;font-size:14px;white-space:pre-wrap;color:#444;">${escape(message)}</p>
          </div>
          <p style="font-size:14px;color:#555;margin:18px 0 4px;">Vänliga hälsningar,</p>
          <p style="font-size:14px;color:#1a1a1a;margin:0;font-weight:600;">Aurora Media</p>
          <p style="font-size:13px;color:#666;margin:2px 0 0;">info@auroramedia.se · auroramedia.se</p>
          <hr style="border:none;border-top:1px solid #eee;margin:22px 0 12px;" />
          <p style="font-size:11px;color:#999;line-height:1.5;">
            Det här är ett automatiskt bekräftelsemejl. Du behöver inte svara – ett personligt svar är på väg.
          </p>
        </div>
      `;
      const autoRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Aurora Media <noreply@auroramedia.se>",
          to: [email],
          reply_to: "info@auroramedia.se",
          subject: "Vi har tagit emot din förfrågan – Aurora Media",
          html: autoReplyHtml,
        }),
      });
      if (!autoRes.ok) {
        const t = await autoRes.text();
        console.error("[send-contact-email] auto-reply failed", autoRes.status, t);
      }
    } catch (e) {
      console.error("[send-contact-email] auto-reply threw", e);
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

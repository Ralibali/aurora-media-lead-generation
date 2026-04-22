// Edge Function: send-contact-email
// Receives contact form submissions and emails info@auroramedia.se via Resend.
// Uses RESEND_API_KEY secret if available; otherwise logs and returns ok so the UI flow works.

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
  leadLabel?: string;
  message: string;
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
    const name = String(body.name ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().slice(0, 160);
    const company = String(body.company ?? "").trim().slice(0, 120);
    const paket = String(body.paket ?? "").trim().slice(0, 60);
    const message = String(body.message ?? "").trim().slice(0, 2000);

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

    const subject = `Ny förfrågan – ${paket} – ${name}`;
    const html = `
      <h2>Ny projektförfrågan</h2>
      <p><strong>Namn:</strong> ${escape(name)}</p>
      <p><strong>E-post:</strong> ${escape(email)}</p>
      <p><strong>Företag:</strong> ${escape(company || "—")}</p>
      <p><strong>Paket:</strong> ${escape(paket)}</p>
      <hr />
      <p style="white-space: pre-wrap;">${escape(message)}</p>
    `;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.log("[send-contact-email] RESEND_API_KEY not set – logging only", {
        name, email, company, paket, messageLength: message.length,
      });
      return new Response(JSON.stringify({ ok: true, queued: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Aurora Media <noreply@auroramedia.se>",
        to: ["info@auroramedia.se"],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[send-contact-email] Resend error", res.status, text);
      return new Response(JSON.stringify({ error: "Email provider failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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

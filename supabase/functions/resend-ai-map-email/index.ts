// Edge Function: resend-ai-map-email
// Re-skickar mini-analysen till kundens egen e-post (meta.email).
// Får data direkt i bodyn (samma som visas på resultatsidan) – ingen DB-läsning behövs.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TopCase {
  process_name: string;
  potential: string;
  recommended_solution: string;
  next_step?: string;
  saved_hours_per_week?: number;
}

interface Body {
  email: string;
  contact_name: string;
  company_name: string;
  total_potential: string;
  top3: TopCase[];
  totalSavedPerWeek?: number;
  totalSavedPerYear?: number;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const PASSWORD = Deno.env.get("FAQ_ANALYTICS_PASSWORD") ?? "";
  const ADMIN = Deno.env.get("ADMIN_SECRET") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || (token !== PASSWORD && token !== ADMIN)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  try {
    const body = (await req.json()) as Body;

    const email = String(body.email ?? "").trim().slice(0, 160);
    const contact_name = String(body.contact_name ?? "").trim().slice(0, 80);
    const company_name = String(body.company_name ?? "").trim().slice(0, 120);
    const total_potential = String(body.total_potential ?? "").trim().slice(0, 40);
    const top3 = Array.isArray(body.top3) ? body.top3.slice(0, 5) : [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Ogiltig e-postadress." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!contact_name || !company_name || top3.length === 0) {
      return new Response(JSON.stringify({ error: "Ofullständig data." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "E-posttjänst ej konfigurerad." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = escape(contact_name.split(" ")[0]);
    const savedLine =
      body.totalSavedPerWeek && body.totalSavedPerWeek > 0
        ? `<p style="margin:0 0 16px;">Uppskattad tidsbesparing: <strong>~${body.totalSavedPerWeek} h/vecka</strong>${body.totalSavedPerYear ? ` (≈ ${body.totalSavedPerYear} h/år)` : ""}.</p>`
        : "";

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;color:#0f172a;">
        <h1 style="margin:0 0 12px;">Hej ${firstName}!</h1>
        <p style="margin:0 0 16px;">Här är er AI-karta-analys för <strong>${escape(company_name)}</strong> en gång till, som ni bad om.</p>
        <p style="margin:0 0 8px;">Total potential: <strong>${escape(total_potential)}</strong></p>
        ${savedLine}
        <h3 style="margin:24px 0 8px;">Era topp ${top3.length} case</h3>
        <ol style="padding-left:18px;">
          ${top3
            .map(
              (t) =>
                `<li style="margin:0 0 10px;"><strong>${escape(t.process_name)}</strong> (${escape(t.potential)})<br/>Rekommenderat: ${escape(t.recommended_solution)}${t.next_step ? `<br/><span style="color:#475569;">Nästa steg: ${escape(t.next_step)}</span>` : ""}</li>`
            )
            .join("")}
        </ol>
        <p style="margin-top:24px;">
          <a href="https://auroramedia.se/kontakt" style="display:inline-block;background:#0f5132;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;">Boka kostnadsfri AI-genomlysning →</a>
        </p>
        <p style="font-size:12px;color:#64748b;margin-top:24px;">Aurora Media AB · info@auroramedia.se</p>
      </div>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Aurora Media <noreply@auroramedia.se>",
        to: [email],
        reply_to: "info@auroramedia.se",
        subject: `Er AI-karta från Aurora Media (kopia)`,
        html,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("[resend-ai-map-email] Resend error", resp.status, txt);
      return new Response(JSON.stringify({ error: "Mail kunde inte skickas." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, sent_to: email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[resend-ai-map-email] error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

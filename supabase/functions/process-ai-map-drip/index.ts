// Edge Function: process-ai-map-drip
// Cron-driven follow-up sequence for AI-karta leads (day 2/5/9/14).
// Auth: requires header `x-cron-secret` matching CRON_SECRET env.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const SITE_URL = "https://auroramedia.se";
const UNSUB_BASE = "https://cyymcdqkpvcvwjoqxbco.functions.supabase.co/ai-map-unsubscribe";
const FROM = "Christoffer på Aurora Media <christoffer@auroramedia.se>";
const REPLY_TO = "christoffer@auroramedia.se";
const MAX_PER_RUN = 50;

type Step = "step_2" | "step_5" | "step_9" | "step_14";

interface Sequence {
  id: string;
  lead_id: string;
  email: string;
  unsubscribe_token: string;
  step_2_sent_at: string | null;
  step_5_sent_at: string | null;
  step_9_sent_at: string | null;
  step_14_sent_at: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  pain_areas: string[];
  total_potential: string;
}

interface Process {
  process_name: string;
  potential: string;
  recommended_solution: string;
  score: number;
}

const escape = (s: string) =>
  (s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

function normalizeCompanyName(name: string): string {
  if (!name) return "ert företag";
  const t = name.trim();
  if (t === t.toLowerCase() || t === t.toUpperCase()) {
    return t.toLowerCase().split(/\s+/).map((w) =>
      /^(ab|hb|kb|as)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)
    ).join(" ");
  }
  return t;
}

function daysSince(ts: string): number {
  return (Date.now() - new Date(ts).getTime()) / 86400000;
}

function pickStep(age: number, s: Sequence): Step | null {
  if (age >= 13.5 && age <= 16 && !s.step_14_sent_at) return "step_14";
  if (age >= 8.5 && age <= 12 && !s.step_9_sent_at) return "step_9";
  if (age >= 4.5 && age <= 7.5 && !s.step_5_sent_at) return "step_5";
  if (age >= 2 && age <= 3.5 && !s.step_2_sent_at) return "step_2";
  return null;
}

function shellHtml(opts: {
  preheader?: string;
  eyebrow?: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  unsubUrl: string;
}): string {
  const { preheader = "", eyebrow = "", title, bodyHtml, ctaLabel, ctaHref, unsubUrl } = opts;
  return `<div style="background:#f8fafc;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:#f8fafc;">${escape(preheader)}</div>` : ""}
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="background:#0f5132;padding:20px 28px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
      <tr>
        <td style="vertical-align:middle;width:42px;">
          <div style="width:36px;height:36px;border-radius:10px;background:#ffffff;color:#0f5132;font-weight:700;font-size:18px;text-align:center;line-height:36px;">A</div>
        </td>
        <td style="vertical-align:middle;padding-left:12px;color:#ffffff;font-size:14px;font-weight:600;letter-spacing:0.08em;">AURORA MEDIA</td>
      </tr>
    </table>
  </div>
  <div style="padding:32px 28px 8px;">
    ${eyebrow ? `<div style="font-size:12px;font-weight:600;color:#0f5132;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">${escape(eyebrow)}</div>` : ""}
    <h1 style="font-size:24px;line-height:1.25;color:#0f172a;margin:0 0 16px;font-weight:700;">${title}</h1>
  </div>
  <div style="padding:0 28px 8px;font-size:15px;line-height:1.6;color:#334155;">
    ${bodyHtml}
  </div>
  ${ctaLabel && ctaHref ? `
  <div style="padding:16px 28px 28px;">
    <a href="${ctaHref}" style="display:inline-block;background:#0f5132;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:999px;font-size:14px;font-weight:600;">${escape(ctaLabel)} →</a>
  </div>` : ""}
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 28px;font-size:12px;color:#64748b;line-height:1.6;">
    <div style="margin:0 0 4px;"><strong style="color:#334155;">Aurora Media AB</strong> · Org.nr 559272-0220 · Linköping, Sverige</div>
    <div style="margin:0 0 8px;">
      <a href="https://auroramedia.se" style="color:#0f5132;text-decoration:none;">auroramedia.se</a> ·
      <a href="mailto:christoffer@auroramedia.se" style="color:#0f5132;text-decoration:none;">christoffer@auroramedia.se</a>
    </div>
    <div style="color:#94a3b8;">
      Du får det här mejlet eftersom du fyllde i AI-kartan på auroramedia.se.
      <a href="${unsubUrl}" style="color:#94a3b8;text-decoration:underline;">Avregistrera dig från uppföljningen</a> – då hör jag inte av mig mer om just denna analys.
    </div>
  </div>
</div></div>`;
}

function buildEmail(step: Step, lead: Lead, top: Process[], token: string): { subject: string; html: string } {
  const firstName = escape((lead.contact_name || "").split(" ")[0] || "där");
  const company = normalizeCompanyName(lead.company_name);
  const companyDisplay = escape(company);
  const top1 = top[0];
  const unsubUrl = `${UNSUB_BASE}?token=${encodeURIComponent(token)}`;
  const unsubPauseUrl = `${unsubUrl}&pause=6m`;
  const unsubNotNowUrl = `${unsubUrl}&reason=not_now`;
  const painFiltered = (lead.pain_areas || []).filter((p) => p && p.toLowerCase() !== "annat");

  if (step === "step_2") {
    const savedNote = "frekvensen och affärsvärdet talar för det.";
    const top1Name = top1 ? escape(top1.process_name) : "ert högst rankade område";
    const body = `
      <p style="margin:0 0 16px;">Jag tänkte höra hur du hunnit smälta resultatet från AI-kartan. Just nu sticker <strong>${top1Name}</strong> ut som det område där ni snabbast skulle se effekt – ${savedNote}</p>
      <p style="margin:0 0 16px;">Det vanligaste jag hör i det här läget är "vi vet att vi borde göra något, men inte var vi ska börja". Det är precis därför jag erbjuder en kostnadsfri 45-minuters genomlysning där vi tittar på just ert första case och jag berättar konkret vad ett bygge skulle innebära – tid, pris och risker.</p>
      <p style="margin:0 0 8px;">Inga säljmöten, inga PDF:er som efterskott. Bara en arbetsgenomgång där du går från analys till beslutsunderlag.</p>
      <p style="margin:18px 0 0;font-size:13px;color:#64748b;"><em>P.S. Behöver du läsa analysen igen? Svara bara på det här mejlet så skickar jag tillbaka en sammanfattning.</em></p>`;
    return {
      subject: `Hann ni titta på er AI-analys, ${(lead.contact_name || "").split(" ")[0] || ""}?`.trim(),
      html: shellHtml({
        preheader: `Snabb uppföljning kring ${top1Name}`,
        eyebrow: "Uppföljning · dag 2",
        title: `Hej igen ${firstName}`,
        bodyHtml: body,
        ctaLabel: "Boka 45 min – kostnadsfritt",
        ctaHref: `${SITE_URL}/kontakt?ref=drip-d2`,
        unsubUrl,
      }),
    };
  }

  if (step === "step_5") {
    const top1Name = top1 ? escape(top1.process_name) : "ett av era topp-områden";
    const subjectSolution = top1 ? escape(top1.recommended_solution).toLowerCase() : "en konkret AI-lösning";
    const body = `
      <p style="margin:0 0 16px;">När jag pratar med VD:ar som ni märker jag att det svåra inte är att förstå att AI kan hjälpa – det är att se vad det betyder i vardagen. Så här ser det ut konkret för ett område som <strong>${top1Name}</strong>:</p>
      <p style="margin:0 0 16px;"><strong style="color:#0f172a;">Idag:</strong> Någon i teamet får en förfrågan, öppnar Word eller mall-systemet, kopierar in tidigare exempel, justerar för den nya kunden, dubbelkollar siffror, granskar, sparar som PDF. Det tar typiskt 30–60 minuter per dokument och repeteras flera gånger i veckan.</p>
      <p style="margin:0 0 16px;"><strong style="color:#0f172a;">Med AI-assistent:</strong> Personen klistrar in eller dikterar nyckelinfo. Systemet genererar ett komplett utkast på 30 sekunder, formaterat enligt er mall, med priser hämtade från ert prislista-system. Personen granskar, justerar de fem till tio procent som är specifikt och skickar. Total tid: 5–10 minuter.</p>
      <p style="margin:0 0 16px;">Skillnaden? Inte att tekniken är magisk – utan att det administrativa motståndet försvinner. Folk gör fler offerter, snabbare svar till kund, högre konvertering.</p>
      <p style="margin:0 0 8px;">Är det här relevant för hur ni jobbar idag, eller skiljer det sig?</p>`;
    return {
      subject: `Så ser ${subjectSolution} ut i praktiken`,
      html: shellHtml({
        preheader: "Konkret exempel: hur en lösning faktiskt skulle kännas",
        eyebrow: "Uppföljning · dag 5",
        title: "Konkret exempel: hur en lösning faktiskt skulle kännas",
        bodyHtml: body,
        ctaLabel: "Boka kort genomgång – jag visar live",
        ctaHref: `${SITE_URL}/kontakt?ref=drip-d5`,
        unsubUrl,
      }),
    };
  }

  if (step === "step_9") {
    const tipsMail = `mailto:info@auroramedia.se?subject=${encodeURIComponent(`AI-tips för ${company}`)}`;
    const body = `
      <p style="margin:0 0 16px;">Hej igen. Det här är inte ett standardiserat säljmejl – jag försöker förstå var ni står.</p>
      <p style="margin:0 0 16px;">När någon laddar ner AI-kartan brukar det landa i en av tre situationer:</p>
      <p style="margin:0 0 16px;"><strong style="color:#0f172a;">1. Ni testar själva.</strong> Helt ok – AI-verktygen är så pass bra nu att en kunnig person internt kan komma långt med ChatGPT, Claude och no-code-automation. Om ni vill ha tips på var jag skulle börja om jag var i ert ställe, <a href="${tipsMail}" style="color:#0f5132;">svara bara på det här mejlet</a>.</p>
      <p style="margin:0 0 16px;"><strong style="color:#0f172a;">2. Ni har kört fast.</strong> Vanligast. Ni har testat ChatGPT, fått det att funka för enskilda fall, men inte fått det in i flödet på riktigt. Det är där en konsult med byggar-bakgrund (snarare än "AI-rådgivare som aldrig levererat") gör skillnad. <a href="${SITE_URL}/kontakt?ref=drip-d9" style="color:#0f5132;">Boka 45 min</a> så pekar jag ut blockaderna.</p>
      <p style="margin:0 0 16px;"><strong style="color:#0f172a;">3. Ni har lagt det på hyllan.</strong> Också ok – timing är allt. Säg gärna till om jag ska <a href="${unsubPauseUrl}" style="color:#0f5132;">höra av mig om ett halvår istället</a>, eller skippa uppföljning helt.</p>`;
    return {
      subject: "Hur långt kommer ni på egen hand?",
      html: shellHtml({
        preheader: "Tre vanliga situationer – var står ni?",
        eyebrow: "Uppföljning · dag 9",
        title: "Ärlig fråga: bygger ni det själva?",
        bodyHtml: body,
        unsubUrl,
      }),
    };
  }

  // step_14
  const painLine = painFiltered.length > 0
    ? `Det är inte alla VD:ar som faktiskt sätter sig och kartlägger ${escape(painFiltered.slice(0, 2).join(" och ").toLowerCase())} på riktigt.`
    : "";
  const body = `
    <p style="margin:0 0 16px;">Det här är mitt sista uppföljningsmejl om AI-kartan ni gjorde för <strong>${companyDisplay}</strong>.</p>
    <p style="margin:0 0 16px;">Antingen är det rätt timing och du vill boka 45 min – då finns länken nedan. Eller så är det inte rätt timing, och då är det inte värt att jag tröttar dig vidare.</p>
    <p style="margin:0 0 12px;">Skulle uppskatta ett av två svar:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px;">
      <tr>
        <td style="padding-right:10px;">
          <a href="${SITE_URL}/kontakt?ref=drip-d14" style="display:inline-block;background:#0f5132;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:600;">Boka genomlysning</a>
        </td>
        <td>
          <a href="${unsubNotNowUrl}" style="display:inline-block;background:#ffffff;color:#0f5132;text-decoration:none;padding:11px 19px;border:1px solid #0f5132;border-radius:999px;font-size:14px;font-weight:600;">Inte just nu</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;">Antingen vägen, tack för att du tog dig tid att fylla i analysen. ${painLine}</p>
    <p style="margin:18px 0 0;color:#0f172a;">/Christoffer<br/>Aurora Media AB<br/><a href="mailto:christoffer@auroramedia.se" style="color:#0f5132;">christoffer@auroramedia.se</a></p>`;
  return {
    subject: "Sista pinget – ska vi prata, eller pausar jag?",
    html: shellHtml({
      preheader: "Två minuter av din tid",
      eyebrow: "Uppföljning · dag 14",
      title: "Två minuter av din tid",
      bodyHtml: body,
      unsubUrl,
    }),
  };
}

async function sendEmail(apiKey: string, to: string, subject: string, html: string, token: string): Promise<boolean> {
  const unsubUrl = `${UNSUB_BASE}?token=${encodeURIComponent(token)}`;
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: REPLY_TO,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>, <mailto:unsubscribe@auroramedia.se?subject=unsubscribe-${token}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  if (!resp.ok) {
    console.error("[drip] resend error", resp.status, await resp.text());
    return false;
  }
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const cronSecret = req.headers.get("x-cron-secret");
  const expected = Deno.env.get("CRON_SECRET");
  if (!expected || cronSecret !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: sequences, error: seqErr } = await admin
    .from("ai_map_email_sequence")
    .select("*")
    .is("unsubscribed_at", null)
    .gte("created_at", new Date(Date.now() - 20 * 86400000).toISOString())
    .order("created_at", { ascending: true })
    .limit(500);

  if (seqErr) {
    console.error("[drip] sequence query failed", seqErr);
    return new Response(JSON.stringify({ error: "DB error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let processed = 0, sent = 0, skipped = 0, errors = 0;

  for (const s of (sequences as Sequence[] | null) ?? []) {
    if (sent >= MAX_PER_RUN) break;
    processed++;
    const age = daysSince(s.created_at);
    const step = pickStep(age, s);
    if (!step) { skipped++; continue; }

    const { data: lead } = await admin
      .from("ai_map_leads")
      .select("id, company_name, contact_name, email, pain_areas, total_potential")
      .eq("id", s.lead_id)
      .maybeSingle();

    if (!lead) { skipped++; continue; }

    const { data: procs } = await admin
      .from("ai_map_processes")
      .select("process_name, potential, recommended_solution, score")
      .eq("lead_id", s.lead_id)
      .order("score", { ascending: false })
      .limit(3);

    const { subject, html } = buildEmail(step, lead as Lead, (procs as Process[]) ?? [], s.unsubscribe_token);
    const ok = await sendEmail(RESEND_API_KEY, s.email, subject, html, s.unsubscribe_token);

    if (!ok) { errors++; continue; }

    const update: Record<string, string> = {};
    update[`${step}_sent_at`] = new Date().toISOString();
    const { error: updErr } = await admin
      .from("ai_map_email_sequence")
      .update(update)
      .eq("id", s.id);
    if (updErr) {
      console.error("[drip] update failed", updErr);
      errors++;
    } else {
      sent++;
    }
  }

  return new Response(JSON.stringify({ ok: true, processed, sent, skipped, errors }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

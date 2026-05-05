// Edge Function: submit-ai-map
// Tar emot AI-kartläggning, beräknar scoring + rekommendationer, sparar lead i
// ai_map_leads + ai_map_processes och mailar både kunden och info@.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProcessIn {
  process_name: string;
  frequency: "daily" | "weekly" | "monthly" | "rare";
  weekly_time: "0-1" | "1-3" | "3-5" | "5-10" | "10+";
  systems?: string;
  rule_based: "yes" | "partial" | "no";
  data_available: "yes" | "partial" | "no";
  business_value: "high" | "medium" | "low";
}

interface Body {
  company_name: string;
  industry: string;
  employee_count: string;
  contact_name: string;
  email: string;
  phone?: string;
  pain_areas: string[];
  consent: boolean;
  processes: ProcessIn[];
  website?: string; // honeypot
}

const FREQ = { daily: 3, weekly: 2, monthly: 1, rare: 0 } as const;
const TIME = { "0-1": 0, "1-3": 1, "3-5": 2, "5-10": 3, "10+": 4 } as const;
const RULE = { yes: 3, partial: 2, no: 0 } as const;
const DATA = { yes: 3, partial: 2, no: 0 } as const;
const VALUE = { high: 3, medium: 2, low: 1 } as const;

function potentialFromScore(score: number): string {
  if (score >= 13) return "Direkt AI-case";
  if (score >= 9) return "Hög potential";
  if (score >= 5) return "Medelpotential";
  return "Låg potential";
}

function totalPotentialLabel(avg: number): string {
  if (avg >= 12) return "Mycket hög";
  if (avg >= 9) return "Hög";
  if (avg >= 5) return "Medel";
  return "Låg";
}

function recommendSolution(p: ProcessIn, painAreas: string[], score: number): string {
  const text = `${p.process_name} ${painAreas.join(" ")} ${p.systems ?? ""}`.toLowerCase();
  if (/(kund|support|fråga|chat|ärende)/.test(text)) return "AI-assistent för kundservice";
  if (/(offert|avtal|dokument|mall|kontrakt)/.test(text)) return "Offert- och dokumentautomation";
  if (/(rapport|excel|data|dashboard|analys|kpi)/.test(text)) return "Dashboard och AI-rapportering";
  if (/(intern|rutin|kunskap|onboarding|wiki|policy)/.test(text)) return "Intern AI-kunskapsbank";
  if (p.data_available === "yes" && score >= 9) return "Integrationer och automationer";
  return "Skräddarsydd AI-automation eller internt system";
}

function recommendNextStep(p: ProcessIn, score: number): string {
  // Mer specifika rekommendationer baserat på data + regelstyrning, inte bara score
  if (score >= 13) {
    if (p.data_available === "yes" && p.rule_based === "yes")
      return "Pilot inom 2–4 veckor – datan finns och processen är regelstyrd. Vi kan börja bygga direkt.";
    return "Boka AI-genomlysning – detta case är moget för pilot inom 2–4 veckor.";
  }
  if (score >= 9) {
    if (p.rule_based === "no")
      return "Workshop 90 min för att kartlägga beslutslogik – AI-assistent är troligt rätt väg.";
    if (p.data_available === "partial")
      return "Workshop 60 min + dataförberedelse i parallell innan pilot kan starta.";
    return "Workshop 60 min för att avgränsa scope och välja teknisk lösning.";
  }
  if (score >= 5) {
    if (p.data_available === "no")
      return "Börja med datainsamling – strukturera underlaget innan AI introduceras.";
    if (p.rule_based === "no")
      return "Kort förstudie för att förstå undantag och variationer i processen.";
    return "Kort förstudie för att kvalitetssäkra data och systemintegrationer.";
  }
  if (p.data_available === "no" && p.rule_based === "no")
    return "Inte AI-moget ännu – fokusera först på att digitalisera och strukturera processen.";
  if (p.data_available === "no")
    return "Bygg upp datagrund först – utan data ingen AI. Vi hjälper er strukturera.";
  return "Samla mer underlag innan AI-pilot – börja med dataförberedelse.";
}

// Uppskattad veckotid (h) per process baserat på weekly_time
const HOURS_PER_WEEK: Record<string, number> = {
  "0-1": 0.5, "1-3": 2, "3-5": 4, "5-10": 7.5, "10+": 12,
};
// Uppskattad automationsgrad (andel som kan automatiseras)
function automationFactor(p: ProcessIn): number {
  let f = 0.3;
  if (p.rule_based === "yes") f += 0.3;
  else if (p.rule_based === "partial") f += 0.15;
  if (p.data_available === "yes") f += 0.25;
  else if (p.data_available === "partial") f += 0.1;
  return Math.min(f, 0.85);
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

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
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const company_name = String(body.company_name ?? "").trim().slice(0, 120);
    const industry = String(body.industry ?? "").trim().slice(0, 80);
    const employee_count = String(body.employee_count ?? "").trim().slice(0, 20);
    const contact_name = String(body.contact_name ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().slice(0, 160);
    const phone = body.phone ? String(body.phone).trim().slice(0, 40) : null;
    const pain_areas = Array.isArray(body.pain_areas) ? body.pain_areas.slice(0, 12).map((s) => String(s).slice(0, 60)) : [];
    const consent = body.consent === true;
    const processes = Array.isArray(body.processes) ? body.processes.slice(0, 5) : [];

    if (!company_name || !industry || !employee_count || !contact_name || !email) {
      return new Response(JSON.stringify({ error: "Obligatoriska fält saknas." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Ogiltig e-postadress." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!consent) {
      return new Response(JSON.stringify({ error: "Samtycke krävs." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (processes.length < 3) {
      return new Response(JSON.stringify({ error: "Minst 3 processer krävs." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scored = processes.map((p, idx) => {
      const f = FREQ[p.frequency] ?? 0;
      const t = TIME[p.weekly_time] ?? 0;
      const r = RULE[p.rule_based] ?? 0;
      const d = DATA[p.data_available] ?? 0;
      const v = VALUE[p.business_value] ?? 1;
      const score = f + t + r + d + v;
      const potential = potentialFromScore(score);
      const recommended_solution = recommendSolution(p, pain_areas, score);
      return {
        position: idx,
        process_name: String(p.process_name ?? "").trim().slice(0, 160),
        frequency: p.frequency,
        weekly_time: p.weekly_time,
        systems: p.systems ? String(p.systems).slice(0, 200) : null,
        rule_based: p.rule_based,
        data_available: p.data_available,
        business_value: p.business_value,
        score,
        potential,
        recommended_solution,
        next_step: recommendNextStep(score),
      };
    });

    const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
    const avg = scored.length ? totalScore / scored.length : 0;
    const total_potential = totalPotentialLabel(avg);

    const top3 = [...scored].sort((a, b) => b.score - a.score).slice(0, 3);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Server-konfiguration saknas." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: lead, error: leadErr } = await admin
      .from("ai_map_leads")
      .insert({
        company_name, industry, employee_count, contact_name, email, phone,
        pain_areas, consent,
        total_score: totalScore,
        total_potential,
        ip: getClientIp(req),
        user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      })
      .select("id")
      .single();

    if (leadErr || !lead) {
      console.error("[submit-ai-map] lead insert failed", leadErr);
      return new Response(JSON.stringify({ error: "Kunde inte spara lead." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const leadId = lead.id;

    const procRows = scored.map((s) => ({
      lead_id: leadId,
      position: s.position,
      process_name: s.process_name,
      frequency: s.frequency,
      weekly_time: s.weekly_time,
      systems: s.systems,
      rule_based: s.rule_based,
      data_available: s.data_available,
      business_value: s.business_value,
      score: s.score,
      potential: s.potential,
      recommended_solution: s.recommended_solution,
    }));
    const { error: procErr } = await admin.from("ai_map_processes").insert(procRows);
    if (procErr) console.error("[submit-ai-map] process insert failed", procErr);

    // Notifiera info@ via Resend (om nyckel finns)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const internalHtml = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;color:#0f172a;">
          <h2 style="margin:0 0 12px;">Ny AI-karta inskickad</h2>
          <p><strong>Företag:</strong> ${escape(company_name)} (${escape(industry)}, ${escape(employee_count)} anst.)</p>
          <p><strong>Kontakt:</strong> ${escape(contact_name)} · ${escape(email)}${phone ? " · " + escape(phone) : ""}</p>
          <p><strong>Total potential:</strong> ${escape(total_potential)} (snitt ${avg.toFixed(1)}, totalt ${totalScore})</p>
          <h3 style="margin-top:18px;">Topp 3 case</h3>
          <ol>${top3.map((t) => `<li><strong>${escape(t.process_name)}</strong> – ${escape(t.potential)} (${t.score} p)<br/>→ ${escape(t.recommended_solution)}</li>`).join("")}</ol>
          <p><a href="https://auroramedia.se/admin/leads">Öppna admin/leads</a> · Lead-ID: ${leadId}</p>
        </div>`;
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Aurora Media <noreply@auroramedia.se>",
          to: [Deno.env.get("INTERNAL_LEADS_EMAIL")?.trim() || "info@auroramedia.se"],
          reply_to: email,
          subject: `Ny AI-karta – ${company_name} (${total_potential})`,
          html: internalHtml,
        }),
      }).catch((e) => console.error("[submit-ai-map] internal mail threw", e));

      // Bekräftelse till kunden
      const firstName = escape(contact_name.split(" ")[0]);
      const userHtml = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;color:#0f172a;">
          <h1 style="margin:0 0 12px;">Tack ${firstName}!</h1>
          <p>Vi har tagit emot er AI-karta för <strong>${escape(company_name)}</strong>. Total potential: <strong>${escape(total_potential)}</strong>.</p>
          <h3>Era topp 3 case</h3>
          <ol>${top3.map((t) => `<li><strong>${escape(t.process_name)}</strong> (${escape(t.potential)})<br/>Rekommenderat: ${escape(t.recommended_solution)}</li>`).join("")}</ol>
          <p style="margin-top:18px;"><a href="https://auroramedia.se/kontakt" style="display:inline-block;background:#0f5132;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;">Boka kostnadsfri AI-genomlysning →</a></p>
          <p style="font-size:12px;color:#64748b;margin-top:24px;">Aurora Media AB · info@auroramedia.se</p>
        </div>`;
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Aurora Media <noreply@auroramedia.se>",
          to: [email],
          reply_to: "info@auroramedia.se",
          subject: "Er AI-karta från Aurora Media",
          html: userHtml,
        }),
      }).catch((e) => console.error("[submit-ai-map] user mail threw", e));
    }

    return new Response(
      JSON.stringify({
        ok: true,
        leadId,
        totalScore,
        avg: Number(avg.toFixed(1)),
        total_potential,
        processes: scored,
        top3,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[submit-ai-map] error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

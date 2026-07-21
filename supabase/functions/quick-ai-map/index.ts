// Edge Function: quick-ai-map
// Snabbvarianten av AI-kartan: besökaren beskriver sin vardag i fritext +
// anger sin e-post. AI tolkar texten till samma datastruktur som wizarden
// (processer, scoring, lösningar), leaden sparas i samma tabeller och får
// samma drip – och resultatsidan/PDF:en fungerar exakt som för fulla kartan.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

// Samma scoring-tabeller som submit-ai-map – deterministiskt och konsekvent.
const FREQ = { daily: 3, weekly: 2, monthly: 1, rare: 0, unknown: 1 } as const;
const TIME = { "0-1": 0, "1-3": 1, "3-5": 2, "5-10": 3, "10+": 4, unknown: 1 } as const;
const RULE = { yes: 3, partial: 2, no: 0, unknown: 1 } as const;
const DATA = { yes: 3, partial: 2, no: 0, unknown: 1 } as const;
const VALUE = { high: 3, medium: 2, low: 1, unknown: 2 } as const;

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

const HOURS_PER_WEEK: Record<string, number> = {
  "0-1": 0.5, "1-3": 2, "3-5": 4, "5-10": 7.5, "10+": 12,
};

function automationFactor(p: { rule_based: string; data_available: string }): number {
  let f = 0.3;
  if (p.rule_based === "yes") f += 0.3;
  else if (p.rule_based === "partial") f += 0.15;
  if (p.data_available === "yes") f += 0.25;
  else if (p.data_available === "partial") f += 0.1;
  return Math.min(f, 0.85);
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function normalizeCompanyName(name: string): string {
  if (!name) return "ert företag";
  const trimmed = name.trim();
  if (trimmed === trimmed.toLowerCase() || trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (/^(ab|hb|kb|as)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(" ");
  }
  return trimmed;
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

interface AiProcess {
  process_name: string;
  frequency: string;
  weekly_time: string;
  systems?: string | null;
  rule_based: string;
  data_available: string;
  business_value: string;
  recommended_solution: string;
  next_step: string;
  quick_wins?: string[];
}

interface AiQuickResult {
  company_name?: string;
  industry?: string;
  employee_count?: string;
  summary: string;
  processes: AiProcess[];
}

const VALID_FREQ = new Set(["daily", "weekly", "monthly", "rare"]);
const VALID_TIME = new Set(["0-1", "1-3", "3-5", "5-10", "10+"]);
const VALID_YPN = new Set(["yes", "partial", "no"]);
const VALID_VALUE = new Set(["high", "medium", "low"]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return json({ ok: true });
    }

    const fritext = String(body.fritext ?? "").trim().slice(0, 2500);
    const email = String(body.email ?? "").trim().slice(0, 160);
    const contact_name = String(body.contact_name ?? "").trim().slice(0, 80);
    const companyInput = String(body.company_name ?? "").trim().slice(0, 120);
    const consent = body.consent === true;

    if (fritext.length < 30) return json({ error: "Beskriv gärna lite mer – minst några meningar om er vardag." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Ogiltig e-postadress." }, 400);
    if (!consent) return json({ error: "Samtycke krävs." }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI-tjänst ej konfigurerad." }, 500);

    // ---------- 1. Tolka fritexten med AI ----------
    const systemPrompt = `Du är en senior AI- och automationsrådgivare på Aurora Media (Linköping).
Du analyserar en fri text där ett företag beskriver sin vardag, och identifierar vilka manuella processer som kan automatiseras.
Du skriver på enkel, tydlig svenska för en VD som INTE är tekniker. Konkret, mänskligt, aldrig säljigt. Inga emojis.
VIKTIGT:
- Utgå bara från vad texten faktiskt säger. Hitta inte på processer som inte nämns eller tydligt antyds.
- Uppskatta tider konservativt utifrån vad som är rimligt för den typen av företag.
- recommended_solution: konkret och specifik för deras situation, inte generisk.
- next_step: ett enkelt första steg de kan ta, även utan oss.
- quick_wins: 2-3 korta saker de kan göra direkt.
- Om företagsnamn framgår av texten, ange det i company_name – annars utelämna det.`;

    const userPrompt = `Här är företagets egen beskrivning:
"""
${fritext}
"""
${companyInput ? `De uppgav själva företagsnamnet: ${companyInput}` : ""}

Identifiera 2-3 manuella processer i texten som bäst lämpar sig för automation, och bedöm varje process med samma fält som en strukturerad kartläggning. Skriv också en summary (3-4 meningar till VD:n: var den största hävstången finns).`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "deliver_quick_analysis",
              description: "Strukturerad snabbanalys av fritext på svenska",
              parameters: {
                type: "object",
                properties: {
                  company_name: { type: "string" },
                  industry: { type: "string" },
                  employee_count: { type: "string" },
                  summary: { type: "string" },
                  processes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        process_name: { type: "string" },
                        frequency: { type: "string", enum: ["daily", "weekly", "monthly", "rare"] },
                        weekly_time: { type: "string", enum: ["0-1", "1-3", "3-5", "5-10", "10+"] },
                        systems: { type: "string" },
                        rule_based: { type: "string", enum: ["yes", "partial", "no"] },
                        data_available: { type: "string", enum: ["yes", "partial", "no"] },
                        business_value: { type: "string", enum: ["high", "medium", "low"] },
                        recommended_solution: { type: "string" },
                        next_step: { type: "string" },
                        quick_wins: { type: "array", items: { type: "string" } },
                      },
                      required: [
                        "process_name", "frequency", "weekly_time", "rule_based",
                        "data_available", "business_value", "recommended_solution", "next_step",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["summary", "processes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "deliver_quick_analysis" } },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("[quick-ai-map] AI error", aiResp.status, txt);
      return json({ error: "Analysen misslyckades – försök igen, eller gör AI-kartan med tre snabba frågor istället." }, 502);
    }

    const aiJson = await aiResp.json();
    const argsStr = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let ai: AiQuickResult | null = null;
    try {
      ai = argsStr ? JSON.parse(argsStr) : null;
    } catch (e) {
      console.error("[quick-ai-map] parse failed", e);
    }
    if (!ai || !Array.isArray(ai.processes) || ai.processes.length === 0) {
      return json({ error: "Kunde inte tolka texten – försök beskriva lite mer konkret vad som tar tid i er vardag." }, 422);
    }

    // ---------- 2. Scora deterministiskt (samma logik som wizarden) ----------
    const scored = ai.processes.slice(0, 3).map((p, idx) => {
      const frequency = VALID_FREQ.has(p.frequency) ? p.frequency : "weekly";
      const weekly_time = VALID_TIME.has(p.weekly_time) ? p.weekly_time : "1-3";
      const rule_based = VALID_YPN.has(p.rule_based) ? p.rule_based : "partial";
      const data_available = VALID_YPN.has(p.data_available) ? p.data_available : "partial";
      const business_value = VALID_VALUE.has(p.business_value) ? p.business_value : "medium";
      const score = (FREQ as any)[frequency] + (TIME as any)[weekly_time] + (RULE as any)[rule_based] + (DATA as any)[data_available] + (VALUE as any)[business_value];
      const weeklyHours = HOURS_PER_WEEK[weekly_time] ?? 2;
      const savedHoursPerWeek = Math.round(weeklyHours * automationFactor({ rule_based, data_available }) * 10) / 10;
      return {
        position: idx,
        process_name: String(p.process_name).trim().slice(0, 160),
        frequency, weekly_time, rule_based, data_available, business_value,
        systems: p.systems ? String(p.systems).slice(0, 200) : null,
        score,
        potential: potentialFromScore(score),
        recommended_solution: String(p.recommended_solution ?? "Skräddarsydd AI-automation").slice(0, 300),
        next_step: String(p.next_step ?? "").slice(0, 300),
        saved_hours_per_week: savedHoursPerWeek,
        quick_wins: Array.isArray(p.quick_wins) ? p.quick_wins.slice(0, 3).map((s) => String(s).slice(0, 200)) : [],
      };
    });

    const totalScore = scored.reduce((s, p) => s + p.score, 0);
    const avg = scored.length ? totalScore / scored.length : 0;
    const total_potential = totalPotentialLabel(avg);
    const totalSavedPerWeek = Math.round(scored.reduce((s, p) => s + (p.saved_hours_per_week || 0), 0) * 10) / 10;
    const totalSavedPerYear = Math.round(totalSavedPerWeek * 46);
    const top3 = [...scored].sort((a, b) => b.score - a.score).slice(0, 3);

    const company_name = normalizeCompanyName(companyInput || ai.company_name || "");
    const industry = String(ai.industry ?? "Annan bransch").slice(0, 80);
    const employee_count = String(ai.employee_count ?? "okänt").slice(0, 20);

    const aiAnalysis = {
      executive_summary: String(ai.summary ?? "").slice(0, 1200),
      maturity_note: "",
      overall_recommendation: "",
      cases: scored.map((p) => ({
        process_name: p.process_name,
        why_it_matters: "",
        deep_analysis: "",
        concrete_example: "",
        quick_wins: p.quick_wins,
        risks: "",
      })),
    };

    // ---------- 3. Spara lead + processer + drip ----------
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "server_misconfigured" }, 500);
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: lead, error: leadErr } = await admin
      .from("ai_map_leads")
      .insert({
        company_name: company_name || "Okänt företag",
        industry,
        employee_count,
        contact_name: contact_name || "–",
        email,
        phone: null,
        pain_areas: ["Snabbanalys (fritext)"],
        consent,
        total_score: totalScore,
        total_potential,
        ai_analysis: aiAnalysis,
        ip: getClientIp(req),
        user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      })
      .select("id, share_token")
      .single();

    if (leadErr || !lead) {
      console.error("[quick-ai-map] lead insert failed", leadErr);
      return json({ error: "Kunde inte spara analysen." }, 500);
    }

    const leadId = lead.id;
    const shareToken = lead.share_token as string;

    const procRows = scored.map((p) => ({
      lead_id: leadId,
      position: p.position,
      process_name: p.process_name,
      frequency: p.frequency,
      weekly_time: p.weekly_time,
      systems: p.systems,
      rule_based: p.rule_based,
      data_available: p.data_available,
      business_value: p.business_value,
      score: p.score,
      potential: p.potential,
      recommended_solution: p.recommended_solution,
      next_step: p.next_step,
      saved_hours_per_week: p.saved_hours_per_week,
    }));
    const { error: procErr } = await admin.from("ai_map_processes").insert(procRows);
    if (procErr) console.error("[quick-ai-map] process insert failed", procErr);

    // Drip-sekvens (samma som wizarden)
    try {
      const { error: dripErr } = await admin.from("ai_map_email_sequence").insert({ lead_id: leadId, email });
      if (dripErr) console.error("[quick-ai-map] drip enqueue failed", dripErr);
    } catch (e) {
      console.error("[quick-ai-map] drip enqueue threw", e);
    }

    // Intern notis (samma mönster som wizarden)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const internalHtml = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;color:#0f172a;">
          <h2 style="margin:0 0 12px;">Ny SNABBANALYS (fritext)</h2>
          <p><strong>Företag:</strong> ${escape(company_name || "–")} (${escape(industry)})</p>
          <p><strong>Kontakt:</strong> ${escape(contact_name || "–")} · ${escape(email)}</p>
          <p><strong>Total potential:</strong> ${escape(total_potential)} · Sparad tid: ~${totalSavedPerWeek} h/vecka</p>
          <h3 style="margin-top:16px;">Fritexten:</h3>
          <p style="background:#f1f5f9;padding:12px;border-radius:8px;font-size:13px;line-height:1.6;">${escape(fritext.slice(0, 900))}</p>
          <h3>Topp-case</h3>
          <ol>${top3.map((t) => `<li><strong>${escape(t.process_name)}</strong> – ${escape(t.potential)} (${t.score} p)</li>`).join("")}</ol>
          <p>Lead-ID: ${leadId}</p>
        </div>`;
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Aurora Media <noreply@auroramedia.se>",
          to: [Deno.env.get("INTERNAL_LEADS_EMAIL")?.trim() || "info@auroramedia.se"],
          reply_to: email,
          subject: `Snabbanalys – ${company_name || "okänt"} (${total_potential})`,
          html: internalHtml,
        }),
      }).catch((e) => console.error("[quick-ai-map] internal mail threw", e));
    }

    // ---------- 4. Samma svar som wizarden ----------
    return json({
      ok: true,
      leadId,
      shareToken,
      totalScore,
      avg: Number(avg.toFixed(1)),
      total_potential,
      processes: scored,
      top3,
      totalSavedPerWeek,
      totalSavedPerYear,
      pain_areas: ["Snabbanalys (fritext)"],
      ai_analysis: aiAnalysis,
      meta: { company_name: company_name || "Okänt företag", contact_name: contact_name || "", email, industry, employee_count },
    });
  } catch (err) {
    console.error("[quick-ai-map] error", err);
    return json({ error: "Internal error" }, 500);
  }
});

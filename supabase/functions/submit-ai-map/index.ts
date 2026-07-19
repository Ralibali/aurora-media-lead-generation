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
  frequency: "daily" | "weekly" | "monthly" | "rare" | "unknown";
  weekly_time: "0-1" | "1-3" | "3-5" | "5-10" | "10+" | "unknown";
  systems?: string;
  rule_based: "yes" | "partial" | "no" | "unknown";
  data_available: "yes" | "partial" | "no" | "unknown";
  business_value: "high" | "medium" | "low" | "unknown";
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

function normalizeCompanyName(name: string): string {
  if (!name) return "ert företag";
  const trimmed = name.trim();
  if (trimmed === trimmed.toLowerCase() || trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((w) => {
        if (/^(ab|hb|kb|as)$/i.test(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(" ");
  }
  return trimmed;
}

function readablePotential(p: string): string {
  if (p === "Direkt AI-case") return "Direkt redo";
  return p;
}

function topAreasTitle(count: number): string {
  if (count === 1) return "Ert högst rankade AI-område";
  if (count === 2) return "Era topp 2 AI-områden";
  return "Era topp 3 AI-områden";
}

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
    const phone: string | null = null;
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
    if (processes.length < 1) {
      return new Response(JSON.stringify({ error: "Minst 1 process krävs." }), {
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
      const weeklyHours = HOURS_PER_WEEK[p.weekly_time] ?? 0;
      const savedHoursPerWeek = Math.round(weeklyHours * automationFactor(p) * 10) / 10;
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
        next_step: recommendNextStep(p, score),
        saved_hours_per_week: savedHoursPerWeek,
      };
    });

    const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
    const avg = scored.length ? totalScore / scored.length : 0;
    const total_potential = totalPotentialLabel(avg);
    const totalSavedPerWeek = scored.reduce((s, p) => s + (p.saved_hours_per_week || 0), 0);
    const totalSavedPerYear = Math.round(totalSavedPerWeek * 46); // 46 arbetsveckor

    const top3 = [...scored].sort((a, b) => b.score - a.score).slice(0, 3);

    // ===== Lovable AI: djupare, personlig analys på enkel svenska =====
    let aiAnalysis: {
      executive_summary: string;
      maturity_note: string;
      cases: Array<{
        process_name: string;
        why_it_matters: string;
        deep_analysis: string;
        concrete_example: string;
        quick_wins: string[];
        risks: string;
      }>;
      overall_recommendation: string;
    } | null = null;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const aiPayload = {
          company: { name: company_name, industry, employee_count },
          pain_areas,
          total_potential,
          total_saved_per_week: Math.round(totalSavedPerWeek * 10) / 10,
          total_saved_per_year: totalSavedPerYear,
          top3: top3.map((p) => ({
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
            saved_hours_per_week: p.saved_hours_per_week,
          })),
        };

        const systemPrompt = `Du är en senior AI- och automationsrådgivare på Aurora Media (Linköping).
Du skriver på enkel, tydlig svenska för en VD eller verksamhetsansvarig som INTE är tekniker.
Undvik buzzwords ("synergier", "leverage", "AI-driven transformation"). Skriv konkret, mänskligt och rådgivande – aldrig säljigt.
Använd "ni" och "ert" när du tilltalar företaget. Var specifik utifrån branschen och de processer kunden faktiskt beskrivit.
Inga emojis. Inga rubriker i texten. Använd korta stycken. Aldrig "som AI-modell..." eller liknande meta-prat.`;

        const userPrompt = `Företag: ${company_name} (${industry}, ${employee_count} anställda)
Utmaningsområden de pekat ut: ${pain_areas.join(", ") || "—"}
Total AI-potential enligt scoring: ${total_potential}
Uppskattad tidsbesparing totalt: ~${Math.round(totalSavedPerWeek * 10) / 10} h/vecka (~${totalSavedPerYear} h/år)

Här är de tre processer som scorade högst (med kundens egna svar):
${top3
  .map(
    (p, i) => `
${i + 1}. "${p.process_name}"
   - Frekvens: ${p.frequency}, Tid: ${p.weekly_time} h/v, System: ${p.systems || "ej angivet"}
   - Regelstyrd: ${p.rule_based}, Data tillgänglig: ${p.data_available}, Affärsvärde: ${p.business_value}
   - Vår tekniska rekommendation: ${p.recommended_solution}
   - Uppskattad besparing: ~${p.saved_hours_per_week} h/vecka`,
  )
  .join("\n")}

Skriv en djupare mini-analys där du för varje case förklarar:
- why_it_matters: VARFÖR just denna process är värd att titta på (1–2 meningar, koppla till deras bransch och utmaning)
- deep_analysis: vad som händer idag och vad AI/automation realistiskt kan ta över (3–5 meningar, konkret)
- concrete_example: ett konkret, hands-on exempel på hur lösningen skulle kännas i deras vardag (2–3 meningar, "Tänk er att...")
- quick_wins: 2–3 korta punkter på vad de kan göra de första 2 veckorna (även utan oss)
- risks: en mening om vad de bör vara uppmärksamma på (data, juridik, förändringsledning)

Skriv också:
- executive_summary: 3–4 meningar för VD:n, ärlig och konkret om var den största hävstången finns
- maturity_note: 1–2 meningar om var ${company_name} står mognadsmässigt jämfört med liknande bolag
- overall_recommendation: en tydlig rekommendation om vilket case som bör prioriteras först och varför`;

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
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
                  name: "deliver_analysis",
                  description: "Strukturerad mini-analys på svenska",
                  parameters: {
                    type: "object",
                    properties: {
                      executive_summary: { type: "string" },
                      maturity_note: { type: "string" },
                      overall_recommendation: { type: "string" },
                      cases: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            process_name: { type: "string" },
                            why_it_matters: { type: "string" },
                            deep_analysis: { type: "string" },
                            concrete_example: { type: "string" },
                            quick_wins: {
                              type: "array",
                              items: { type: "string" },
                            },
                            risks: { type: "string" },
                          },
                          required: [
                            "process_name",
                            "why_it_matters",
                            "deep_analysis",
                            "concrete_example",
                            "quick_wins",
                            "risks",
                          ],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: [
                      "executive_summary",
                      "maturity_note",
                      "overall_recommendation",
                      "cases",
                    ],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "deliver_analysis" } },
          }),
        });

        if (aiResp.ok) {
          const aiJson = await aiResp.json();
          const argsStr =
            aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
          if (argsStr) {
            try {
              aiAnalysis = JSON.parse(argsStr);
            } catch (e) {
              console.error("[submit-ai-map] failed to parse AI args", e);
            }
          }
        } else {
          console.error("[submit-ai-map] AI gateway error", aiResp.status, await aiResp.text());
        }
      } catch (e) {
        console.error("[submit-ai-map] AI analysis threw", e);
      }
    }

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
        ai_analysis: aiAnalysis ?? null,
        ip: getClientIp(req),
        user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      })
      .select("id, share_token")
      .single();

    if (leadErr || !lead) {
      console.error("[submit-ai-map] lead insert failed", leadErr);
      return new Response(JSON.stringify({ error: "Kunde inte spara lead." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const leadId = lead.id;
    const shareToken = lead.share_token as string;

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
      next_step: s.next_step ?? null,
      saved_hours_per_week: s.saved_hours_per_week ?? null,
    }));
    const { error: procErr } = await admin.from("ai_map_processes").insert(procRows);
    if (procErr) console.error("[submit-ai-map] process insert failed", procErr);

    // Skriv in lead i drip-sekvensen för automatiska uppföljningsmail (dag 2/5/9/14)
    try {
      const { error: dripErr } = await admin
        .from("ai_map_email_sequence")
        .insert({ lead_id: leadId, email });
      if (dripErr) console.error("[submit-ai-map] failed to enqueue drip", dripErr);
    } catch (e) {
      console.error("[submit-ai-map] drip enqueue threw", e);
    }

    // Notifiera info@ via Resend (om nyckel finns)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const companyNormalized = normalizeCompanyName(company_name);
      const savedWeekRounded = Math.round(totalSavedPerWeek * 10) / 10;

      const internalHtml = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;color:#0f172a;">
          <h2 style="margin:0 0 12px;">Ny AI-karta inskickad</h2>
          <p><strong>Företag:</strong> ${escape(companyNormalized)} (${escape(industry)}, ${escape(employee_count)} anst.)</p>
          <p><strong>Kontakt:</strong> ${escape(contact_name)} · ${escape(email)}</p>
          <p><strong>Total potential:</strong> ${escape(total_potential)} (snitt ${avg.toFixed(1)}, totalt ${totalScore})</p>
          <p><strong>Sparad tid (uppskattat):</strong> ~${savedWeekRounded} h/vecka · ~${totalSavedPerYear} h/år</p>
          <h3 style="margin-top:18px;">Topp 3 AI-områden</h3>
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
          subject: `Ny AI-karta – ${companyNormalized} (${total_potential})`,
          html: internalHtml,
        }),
      }).catch((e) => console.error("[submit-ai-map] internal mail threw", e));

      // Bekräftelse till kunden
      const firstName = escape(contact_name.split(" ")[0]);
      const companyDisplay = escape(companyNormalized);
      const painAreasFiltered = pain_areas.filter((p) => p && p.toLowerCase() !== "annat");
      const painChips = painAreasFiltered
        .slice(0, 8)
        .map(
          (p) =>
            `<span style="display:inline-block;background:#eef2ff;border:1px solid #c7d2fe;color:#3730a3;font-size:13px;padding:6px 12px;border-radius:999px;margin:0 6px 6px 0;">${escape(p)}</span>`
        )
        .join("");

      const aiCaseLookup = (name: string) =>
        aiAnalysis?.cases?.find(
          (c) => c.process_name.trim().toLowerCase() === name.trim().toLowerCase()
        ) ?? null;

      const topCasesHtml = top3
        .map((t, i) => {
          const potentialColor =
            t.potential === "Direkt AI-case" ? "#16a34a"
            : t.potential === "Hög potential" ? "#2563eb"
            : t.potential === "Medelpotential" ? "#ca8a04"
            : "#64748b";
          const potentialBg =
            t.potential === "Direkt AI-case" ? "#dcfce7"
            : t.potential === "Hög potential" ? "#dbeafe"
            : t.potential === "Medelpotential" ? "#fef3c7"
            : "#f1f5f9";
          const ai = aiCaseLookup(t.process_name);
          const aiBlock = ai
            ? `
              <div style="margin-top:14px;padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;">
                <div style="font-size:11px;font-weight:600;color:#0f5132;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px;">Aurora-analys</div>
                <p style="font-size:13px;line-height:1.6;color:#0f172a;margin:0 0 8px;"><strong>Varför just detta:</strong> ${escape(ai.why_it_matters)}</p>
                <p style="font-size:13px;line-height:1.6;color:#334155;margin:0 0 8px;"><strong style="color:#0f172a;">Vad AI kan ta över:</strong> ${escape(ai.deep_analysis)}</p>
                <p style="font-size:13px;line-height:1.6;color:#334155;font-style:italic;margin:0 0 8px;">${escape(ai.concrete_example)}</p>
                ${
                  ai.quick_wins?.length
                    ? `<div style="margin:8px 0 0;"><div style="font-size:12px;font-weight:600;color:#0f172a;margin:0 0 4px;">Snabba vinster:</div><ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.6;color:#334155;">${ai.quick_wins.map((q) => `<li>${escape(q)}</li>`).join("")}</ul></div>`
                    : ""
                }
                ${ai.risks ? `<p style="font-size:12px;line-height:1.5;color:#92400e;margin:10px 0 0;"><strong>Att vara uppmärksam på:</strong> ${escape(ai.risks)}</p>` : ""}
              </div>`
            : "";
          return `
            <div style="border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin:0 0 12px;background:#ffffff;">
              <div style="margin:0 0 10px;">
                <span style="display:inline-block;font-size:12px;font-weight:600;color:#64748b;letter-spacing:0.04em;margin-right:8px;">#${i + 1}</span>
                <span style="display:inline-block;background:${potentialBg};color:${potentialColor};font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;">${escape(readablePotential(t.potential))}</span>
              </div>
              <div style="font-size:16px;font-weight:600;color:#0f172a;margin:0 0 6px;">${escape(t.process_name)}</div>
              <div style="font-size:14px;color:#334155;margin:0 0 ${t.saved_hours_per_week > 0 ? "10" : "0"}px;">
                <strong style="color:#0f172a;">Rekommenderat:</strong> ${escape(t.recommended_solution)}
              </div>
              ${
                t.saved_hours_per_week > 0
                  ? `<div style="font-size:13px;color:#0f5132;background:#f0fdf4;border:1px solid #bbf7d0;padding:8px 12px;border-radius:8px;display:inline-block;">≈ ${t.saved_hours_per_week} h/vecka kan automatiseras</div>`
                  : ""
              }
              ${aiBlock}
            </div>`;
        })
        .join("");

      const aiSummaryHtml = aiAnalysis
        ? `
        <div style="padding:24px 28px 8px;">
          <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border:1px solid #bbf7d0;border-radius:12px;padding:20px 22px;">
            <div style="font-size:11px;font-weight:600;color:#0f5132;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">Aurora-analys för er</div>
            <p style="font-size:14px;line-height:1.6;color:#0f172a;margin:0 0 12px;">${escape(aiAnalysis.executive_summary)}</p>
            <p style="font-size:13px;line-height:1.6;color:#334155;margin:0 0 12px;"><strong style="color:#0f172a;">Mognadsläge:</strong> ${escape(aiAnalysis.maturity_note)}</p>
            <div style="background:#ffffff;border:1px solid #bbf7d0;border-radius:8px;padding:12px 14px;">
              <div style="font-size:11px;font-weight:600;color:#0f5132;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">Vår rekommendation</div>
              <p style="font-size:14px;line-height:1.6;color:#0f172a;margin:0;">${escape(aiAnalysis.overall_recommendation)}</p>
            </div>
          </div>
        </div>`
        : "";

      const userHtml = `
<div style="background:#f8fafc;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">

    <div style="background:#0f5132;padding:20px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr>
          <td style="vertical-align:middle;width:42px;">
            <div style="width:36px;height:36px;border-radius:10px;background:#ffffff;color:#0f5132;font-weight:700;font-size:18px;text-align:center;line-height:36px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">A</div>
          </td>
          <td style="vertical-align:middle;padding-left:12px;color:#ffffff;font-size:14px;font-weight:600;letter-spacing:0.08em;">AURORA MEDIA</td>
        </tr>
      </table>
    </div>

    <div style="padding:32px 28px 8px;">
      <div style="font-size:12px;font-weight:600;color:#0f5132;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">AI-Analys klar</div>
      <h1 style="font-size:24px;line-height:1.25;color:#0f172a;margin:0 0 12px;font-weight:700;">Tack ${firstName}, här är er analys</h1>
      <p style="font-size:15px;line-height:1.55;color:#334155;margin:0 0 20px;">
        Vi har gått igenom era svar för <strong>${companyDisplay}</strong> och räknat på hur stor AI-potential ni har just nu.
      </p>
    </div>

    <div style="padding:0 28px 8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:8px 0;">
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 12px;text-align:center;width:33.33%;">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">Total potential</div>
            <div style="font-size:18px;color:#0f172a;font-weight:700;">${escape(total_potential)}</div>
          </td>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 12px;text-align:center;width:33.33%;">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">Sparad tid / vecka</div>
            <div style="font-size:18px;color:#0f172a;font-weight:700;">${savedWeekRounded} h</div>
          </td>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 12px;text-align:center;width:33.33%;">
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">Sparad tid / år</div>
            <div style="font-size:18px;color:#0f172a;font-weight:700;">${totalSavedPerYear} h</div>
          </td>
        </tr>
      </table>
    </div>

    ${
      painAreasFiltered.length > 0
        ? `
    <div style="padding:24px 28px 8px;">
      <h2 style="font-size:14px;color:#0f172a;margin:0 0 12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Områden ni lyfte</h2>
      <div>${painChips}</div>
    </div>`
        : ""
    }

    ${aiSummaryHtml}

    <div style="padding:24px 28px 8px;">
      <h2 style="font-size:14px;color:#0f172a;margin:0 0 14px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${escape(topAreasTitle(top3.length))}</h2>
      ${topCasesHtml}
    </div>

    <div style="padding:20px 28px 28px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:22px 24px;">
        <h2 style="font-size:16px;color:#0f172a;margin:0 0 10px;font-weight:700;">Vad händer nu?</h2>
        <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 18px;">
          Ni har två vägar framåt. Antingen tar ni resultatet internt och börjar testa själva – det är därför vi gjorde analysen synlig på er skärm direkt. Eller så bokar ni en kostnadsfri AI-genomlysning där vi går igenom era topp-områden tillsammans och jag ger en konkret uppskattning av tid och kostnad för det första bygget.
        </p>
        <a href="https://auroramedia.se/kontakt" style="display:inline-block;background:#0f5132;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:999px;font-size:14px;font-weight:600;">Boka AI-genomlysning (20 min, gratis) →</a>
      </div>
    </div>

    <div style="padding:0 28px 28px;">
      <p style="font-size:13px;line-height:1.6;color:#64748b;margin:0;">
        Har ni redan en bild av vilket område ni vill börja med? Svara bara på det här mejlet med en mening – jag läser allt själv och hör av mig inom en arbetsdag.
      </p>
    </div>

    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 28px;font-size:12px;color:#64748b;line-height:1.6;">
      <div style="margin:0 0 4px;"><strong style="color:#334155;">Aurora Media AB</strong> · Org.nr 559272-0220 · Linköping, Sverige</div>
      <div style="margin:0 0 8px;">
        <a href="https://auroramedia.se" style="color:#0f5132;text-decoration:none;">auroramedia.se</a> ·
        <a href="mailto:info@auroramedia.se" style="color:#0f5132;text-decoration:none;">info@auroramedia.se</a>
      </div>
      <div style="color:#94a3b8;">Du fick det här mejlet eftersom du nyss skickade in AI-kartan på auroramedia.se/ai-karta.</div>
    </div>
  </div>
</div>`;

      const subjectLine =
        total_potential === "Mycket hög" || total_potential === "Hög"
          ? `Er AI-analys är klar – ${total_potential.toLowerCase()} potential identifierad`
          : `Er AI-analys är klar – ${companyNormalized}`;

      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Aurora Media <noreply@auroramedia.se>",
          to: [email],
          reply_to: "info@auroramedia.se",
          subject: subjectLine,
          html: userHtml,
        }),
      }).catch((e) => console.error("[submit-ai-map] user mail threw", e));
    }

    return new Response(
      JSON.stringify({
        ok: true,
        leadId,
        shareToken,
        totalScore,
        avg: Number(avg.toFixed(1)),
        total_potential,
        processes: scored,
        top3,
        totalSavedPerWeek: Math.round(totalSavedPerWeek * 10) / 10,
        totalSavedPerYear,
        pain_areas,
        ai_analysis: aiAnalysis,
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

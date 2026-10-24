export type ProspectRadarLead = {
  id: string;
  company_name: string;
  domain?: string | null;
  fit_score?: number | null;
  status?: string | null;
  audit?: {
    status?: string | null;
    opportunity_score?: number | null;
    audit_signals?: { signal: string; evidence: string; points: number }[] | null;
  } | null;
};

export type ProspectRadarResult = {
  leadId: string;
  companyName: string;
  score: number;
  segment: "hot" | "warm" | "nurture" | "ignore";
  recommendedOffer: "hemsida" | "lokal-seo" | "seo-autopilot" | "ai-automation" | "manuell-granskning";
  nextAction: string;
  reasons: string[];
};

const NEGATIVE_STATUSES = new Set(["rejected", "do_not_contact"]);
const CUSTOMER_STATUSES = new Set(["converted"]);

const signalText = (lead: ProspectRadarLead) =>
  (lead.audit?.audit_signals ?? [])
    .map((signal) => `${signal.signal} ${signal.evidence}`.toLowerCase())
    .join(" ");

export function classifyProspectRadarLead(lead: ProspectRadarLead): ProspectRadarResult {
  const fit = Math.max(0, Math.min(100, Math.round(Number(lead.fit_score ?? 0))));
  const opportunity = Math.max(0, Math.min(100, Math.round(Number(lead.audit?.opportunity_score ?? 0))));
  const audited = lead.audit?.status === "completed";
  const status = lead.status ?? "new";
  const text = signalText(lead);

  if (NEGATIVE_STATUSES.has(status) || CUSTOMER_STATUSES.has(status)) {
    return {
      leadId: lead.id,
      companyName: lead.company_name,
      score: 0,
      segment: "ignore",
      recommendedOffer: "manuell-granskning",
      nextAction: "Ingen åtgärd. Leadet är stängt eller markerat som ej kontaktbart.",
      reasons: ["Leadets status gör att det inte ska drivas vidare."],
    };
  }

  const score = Math.max(fit, Math.round((fit * 0.45) + (opportunity * 0.55))) + (audited ? 6 : 0);
  const normalizedScore = Math.max(0, Math.min(100, score));
  const reasons: string[] = [];
  if (fit >= 60) reasons.push("Bra match mot kampanjens bransch/geografi.");
  if (opportunity >= 60) reasons.push("Automatisk audit har verifierat konkreta förbättringsmöjligheter.");
  if (!audited) reasons.push("Saknar djupare webb-audit – kör audit innan kontakt.");

  let recommendedOffer: ProspectRadarResult["recommendedOffer"] = "manuell-granskning";
  if (/viewport|title|meta|canonical|noindex|seo|robots/.test(text)) recommendedOffer = "seo-autopilot";
  if (/cta|kontakt|offert|placeholder|http_problem|missing_title/.test(text)) recommendedOffer = "hemsida";
  if (/location|google|recension|review|local/.test(text)) recommendedOffer = "lokal-seo";
  if (/automation|manuellt|ai/.test(text)) recommendedOffer = "ai-automation";

  const segment: ProspectRadarResult["segment"] = normalizedScore >= 76
    ? "hot"
    : normalizedScore >= 55
      ? "warm"
      : normalizedScore >= 35
        ? "nurture"
        : "ignore";

  const nextAction = segment === "hot"
    ? "Skapa personligt underlag och kontakta manuellt samma dag."
    : segment === "warm"
      ? "Granska bevisen, välj erbjudande och lägg i uppföljningskö."
      : segment === "nurture"
        ? "Spara för senare eller kör en extra audit innan någon kontakt."
        : "Lägg inte säljtid här just nu.";

  return {
    leadId: lead.id,
    companyName: lead.company_name,
    score: normalizedScore,
    segment,
    recommendedOffer,
    nextAction,
    reasons: reasons.length ? reasons : ["För svaga signaler för direkt säljinsats."],
  };
}

export function buildProspectRadar(leads: ProspectRadarLead[]) {
  const results = leads.map(classifyProspectRadarLead).sort((a, b) => b.score - a.score);
  const counts = results.reduce<Record<ProspectRadarResult["segment"], number>>((acc, item) => {
    acc[item.segment] += 1;
    return acc;
  }, { hot: 0, warm: 0, nurture: 0, ignore: 0 });
  const top = results.filter((item) => item.segment === "hot" || item.segment === "warm").slice(0, 10);
  return { results, counts, top };
}

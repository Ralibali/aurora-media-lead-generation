export interface ProcessIn {
  process_name: string;
  frequency: "daily" | "weekly" | "monthly" | "rare" | "unknown";
  weekly_time: "0-1" | "1-3" | "3-5" | "5-10" | "10+" | "unknown";
  systems?: string;
  rule_based: "yes" | "partial" | "no" | "unknown";
  data_available: "yes" | "partial" | "no" | "unknown";
  business_value: "high" | "medium" | "low" | "unknown";
}

export interface Body {
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

export const FREQ = { daily: 3, weekly: 2, monthly: 1, rare: 0, unknown: 1 } as const;
export const TIME = { "0-1": 0, "1-3": 1, "3-5": 2, "5-10": 3, "10+": 4, unknown: 1 } as const;
export const RULE = { yes: 3, partial: 2, no: 0, unknown: 1 } as const;
export const DATA = { yes: 3, partial: 2, no: 0, unknown: 1 } as const;
export const VALUE = { high: 3, medium: 2, low: 1, unknown: 2 } as const;

export function potentialFromScore(score: number): string {
  if (score >= 13) return "Direkt AI-case";
  if (score >= 9) return "Hög potential";
  if (score >= 5) return "Medelpotential";
  return "Låg potential";
}

export function totalPotentialLabel(avg: number): string {
  if (avg >= 12) return "Mycket hög";
  if (avg >= 9) return "Hög";
  if (avg >= 5) return "Medel";
  return "Låg";
}

export function recommendSolution(p: ProcessIn, _painAreas: string[], score: number): string {
  const text = `${p.process_name} ${p.systems ?? ""}`.toLowerCase();
  if (/(kund|support|fråga|chat|ärende)/.test(text)) return "AI-assistent för kundservice";
  if (/(offert|avtal|dokument|mall|kontrakt)/.test(text)) return "Offert- och dokumentautomation";
  if (/(rapport|excel|data|dashboard|analys|kpi)/.test(text)) return "Dashboard och AI-rapportering";
  if (/(intern|rutin|kunskap|onboarding|wiki|policy)/.test(text)) return "Intern AI-kunskapsbank";
  if (p.data_available === "yes" && score >= 9) return "Integrationer och automationer";
  return "Skräddarsydd AI-automation eller internt system";
}

export function recommendNextStep(p: ProcessIn, score: number): string {
  // Mer specifika rekommendationer baserat på data + regelstyrning, inte bara score
  if (score >= 13) {
    if (p.data_available === "yes" && p.rule_based === "yes")
      return "Avgränsa en pilot och granska ett riktigt dataexempel. Bekräfta åtkomst, undantag, ansvar och tidsplan innan bygget startar.";
    return "Boka en genomgång för att kontrollera data och avgränsa ett möjligt pilotprojekt.";
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
export const HOURS_PER_WEEK: Record<string, number> = {
  "0-1": 0.5, "1-3": 2, "3-5": 4, "5-10": 7.5, "10+": 12,
};
// Uppskattad automationsgrad (andel som kan automatiseras)
export function automationFactor(p: ProcessIn): number {
  let f = 0.3;
  if (p.rule_based === "yes") f += 0.3;
  else if (p.rule_based === "partial") f += 0.15;
  if (p.data_available === "yes") f += 0.25;
  else if (p.data_available === "partial") f += 0.1;
  return Math.min(f, 0.85);
}

export function validProcesses(value: unknown): value is ProcessIn[] {
  return Array.isArray(value) && value.length >= 1 && value.length <= 5 && value.every((p) =>
    p && typeof p === "object" && typeof p.process_name === "string" &&
    p.process_name.trim().length >= 2 && p.process_name.length <= 160 &&
    (p.systems == null || (typeof p.systems === "string" && p.systems.length <= 200)) &&
    Object.prototype.hasOwnProperty.call(FREQ, p.frequency) && Object.prototype.hasOwnProperty.call(TIME, p.weekly_time) &&
    Object.prototype.hasOwnProperty.call(RULE, p.rule_based) && Object.prototype.hasOwnProperty.call(DATA, p.data_available) && Object.prototype.hasOwnProperty.call(VALUE, p.business_value));
}

// Delade typer + scoringkonstanter för AI-kartan-formuläret.
// Scoring körs både klient- och serverside; servern är auktoritativ.
export type Frequency = "daily" | "weekly" | "monthly" | "rare" | "unknown";
export type WeeklyTime = "0-1" | "1-3" | "3-5" | "5-10" | "10+" | "unknown";
export type YesPartialNo = "yes" | "partial" | "no" | "unknown";
export type BusinessValue = "high" | "medium" | "low" | "unknown";

export interface ProcessInput {
  process_name: string;
  frequency: Frequency | "";
  weekly_time: WeeklyTime | "";
  systems: string;
  rule_based: YesPartialNo | "";
  data_available: YesPartialNo | "";
  business_value: BusinessValue | "";
}

export interface AiMapFormState {
  company_name: string;
  industry: string;
  employee_count: string;
  contact_name: string;
  email: string;
  pain_areas: string[];
  processes: ProcessInput[];
  consent: boolean;
}

export const FREQ_LABELS: Record<Frequency, string> = {
  daily: "Dagligen",
  weekly: "Veckovis",
  monthly: "Månadsvis",
  rare: "Sällan",
  unknown: "Vet ej",
};
export const TIME_LABELS: Record<WeeklyTime, string> = {
  "0-1": "0–1 h/vecka",
  "1-3": "1–3 h/vecka",
  "3-5": "3–5 h/vecka",
  "5-10": "5–10 h/vecka",
  "10+": "10+ h/vecka",
  unknown: "Vet ej",
};
export const YPN_LABELS: Record<YesPartialNo, string> = {
  yes: "Ja",
  partial: "Delvis",
  no: "Nej",
  unknown: "Vet ej",
};
export const VALUE_LABELS: Record<BusinessValue, string> = {
  high: "Hög",
  medium: "Medel",
  low: "Låg",
  unknown: "Vet ej",
};

export const PAIN_AREAS = [
  "Administration",
  "Kundservice/support",
  "Sälj och offerter",
  "Ekonomi och fakturor",
  "Rapportering/Excel",
  "Intern kunskap och rutiner",
  "Projektledning",
  "HR/onboarding",
  "Lager/logistik",
  "Annat",
];

export const EMPLOYEE_OPTIONS = ["1–5", "6–20", "21–50", "51–200", "200+"];

export function emptyProcess(): ProcessInput {
  return {
    process_name: "",
    frequency: "",
    weekly_time: "",
    systems: "",
    rule_based: "",
    data_available: "",
    business_value: "",
  };
}

export function emptyForm(): AiMapFormState {
  return {
    company_name: "",
    industry: "",
    employee_count: "",
    contact_name: "",
    email: "",
    pain_areas: [],
    processes: [emptyProcess()],
    consent: false,
  };
}

export interface ScoredProcess {
  position: number;
  process_name: string;
  frequency: Frequency;
  weekly_time: WeeklyTime;
  systems: string | null;
  rule_based: YesPartialNo;
  data_available: YesPartialNo;
  business_value: BusinessValue;
  score: number;
  potential: string;
  recommended_solution: string;
  next_step: string;
  saved_hours_per_week?: number;
}

export interface AiAnalysisCase {
  process_name: string;
  why_it_matters: string;
  deep_analysis: string;
  concrete_example: string;
  quick_wins: string[];
  risks: string;
}

export interface AiAnalysis {
  executive_summary: string;
  maturity_note: string;
  overall_recommendation: string;
  cases: AiAnalysisCase[];
}

export interface AiMapResult {
  leadId: string;
  shareToken?: string;
  totalScore: number;
  avg: number;
  total_potential: string;
  processes: ScoredProcess[];
  top3: ScoredProcess[];
  totalSavedPerWeek?: number;
  totalSavedPerYear?: number;
  pain_areas?: string[];
  ai_analysis?: AiAnalysis | null;
  meta: {
    company_name: string;
    contact_name: string;
    email: string;
  };
}

import { z } from "zod";
import type { AiMapResult } from "./aiMap";
const Process = z.object({
  position: z.number(), process_name: z.string().min(1),
  frequency: z.enum(["daily", "weekly", "monthly", "rare", "unknown"]),
  weekly_time: z.enum(["0-1", "1-3", "3-5", "5-10", "10+", "unknown"]),
  systems: z.string().nullable(), rule_based: z.enum(["yes", "partial", "no", "unknown"]),
  data_available: z.enum(["yes", "partial", "no", "unknown"]),
  business_value: z.enum(["high", "medium", "low", "unknown"]),
  score: z.number().min(0).max(16), potential: z.string(), recommended_solution: z.string(),
  next_step: z.string().nullish().transform(value => value || "Kontrollera data och avgränsa en pilot."),
  saved_hours_per_week: z.number().finite().min(0).nullish().transform(value => value ?? 0),
}).passthrough();
const Result = z.object({
  leadId: z.string().min(1), shareToken: z.string().optional(),
  totalScore: z.number().finite(), avg: z.number().finite(), total_potential: z.string(),
  processes: z.array(Process).min(1).max(5), top3: z.array(Process).min(1).max(3),
  totalSavedPerWeek: z.number().finite().min(0).optional(), totalSavedPerYear: z.number().finite().min(0).optional(),
  meta: z.object({ company_name: z.string(), industry: z.string(), employee_count: z.string(), contact_name: z.string(), email: z.string() }),
  ai_analysis: z.object({
    executive_summary: z.string(), maturity_note: z.string(), overall_recommendation: z.string(),
    cases: z.array(z.object({ process_name: z.string(), why_it_matters: z.string(), deep_analysis: z.string(), concrete_example: z.string(), quick_wins: z.array(z.string()), risks: z.string() })),
  }).nullish(), pain_areas: z.array(z.string()).optional(),
}).passthrough();
export function parseAiMapResult(value: unknown): AiMapResult | null {
  const parsed = Result.safeParse(value);
  return parsed.success ? parsed.data as AiMapResult : null;
}

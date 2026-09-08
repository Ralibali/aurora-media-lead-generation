import { z } from "zod";
import { emptyForm, type AiMapFormState } from "./aiMap";

const choice = <T extends string>(values: readonly [T, ...T[]]) => z.enum(values);
const ProcessDraft = z.object({
  process_name: z.string().max(160), systems: z.string().max(200),
  frequency: choice(["", "daily", "weekly", "monthly", "rare", "unknown"]),
  weekly_time: choice(["", "0-1", "1-3", "3-5", "5-10", "10+", "unknown"]),
  rule_based: choice(["", "yes", "partial", "no", "unknown"]),
  data_available: choice(["", "yes", "partial", "no", "unknown"]),
  business_value: choice(["", "high", "medium", "low", "unknown"]),
});
const DraftSchema = z.object({
  form: z.object({
    company_name: z.string().max(120), industry: z.string().max(80),
    employee_count: z.string().max(20), contact_name: z.string().max(80),
    email: z.string().max(160), pain_areas: z.array(z.string().max(60)).max(12),
    processes: z.array(ProcessDraft).min(1).max(5), consent: z.boolean(),
  }),
  industry: z.enum(["", "transport", "bygg", "besok", "tillverk", "handel", "tjanste", "annat"]),
  step: z.number().int().min(1).max(3),
});
export function parseAiMapDraft(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = DraftSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const { form, industry, step } = parsed.data;
    if (!form.industry && !form.company_name && !form.processes.some(p => p.process_name)) return null;
    return { form: { ...emptyForm(), ...form, consent: false } as AiMapFormState, industry, step };
  } catch { return null; }
}

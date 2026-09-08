import type { ScoredProcess, WeeklyTime } from "./aiMap";
export const HOURLY_RATE = 600;
export const WORKING_WEEKS = 46;
export const WEEKS_PER_MONTH = WORKING_WEEKS / 12;
export const WEEKLY_HOURS: Record<WeeklyTime, number> = { "0-1": 0.5, "1-3": 2, "3-5": 4, "5-10": 7.5, "10+": 12, unknown: 0 };
export function estimatedTimeValue(hoursPerWeek: number) {
  return Math.round(Math.max(0, Number.isFinite(hoursPerWeek) ? hoursPerWeek : 0) * WEEKS_PER_MONTH * HOURLY_RATE);
}
export function estimatedPayback(process: Pick<ScoredProcess, "saved_hours_per_week">, budget: number) {
  const value = estimatedTimeValue(process.saved_hours_per_week ?? 0);
  return value > 0 ? Math.ceil(budget / value) : null;
}

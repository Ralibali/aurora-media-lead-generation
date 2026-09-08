import { describe, expect, it } from "vitest";
import { emptyForm, emptyProcess } from "./aiMap";
import { parseAiMapDraft } from "./aiMapDraft";
import { parseAiMapResult } from "./aiMapResult";
import { estimatedTimeValue, estimatedPayback } from "./aiMapEstimates";
import { csvCell, followupQueue, needsFollowup, pipelineSummary, type PipelineLead } from "./leadPipeline";
import { recommendSolution, validProcesses } from "../../supabase/functions/_shared/aiMapScoring";
const process = { ...emptyProcess(), process_name: "Sammanställ veckorapport", frequency: "weekly" as const, weekly_time: "3-5" as const, systems: "Excel", rule_based: "yes" as const, data_available: "yes" as const, business_value: "high" as const };
describe("AI-karta: customer data and estimates", () => {
  it("restores a real draft but requires new consent", () => {
    const form = { ...emptyForm(), company_name: "Exempelbolaget", industry: "Transport", processes: [process], consent: true };
    expect(parseAiMapDraft(JSON.stringify({ form, industry: "transport", step: 2 }))).toEqual({ form: { ...form, consent: false }, industry: "transport", step: 2 });
  });
  it("rejects corrupt, empty and structurally invalid drafts", () => {
    for (const raw of [null, "{broken", "null", JSON.stringify({ form: emptyForm(), industry: "", step: 1 }), JSON.stringify({ form: { ...emptyForm(), company_name: "Test", processes: [null] }, industry: "", step: 2 })]) expect(parseAiMapDraft(raw)).toBeNull();
  });
  it("does not classify reports as customer support because of another pain area", () => {
    expect(recommendSolution(process, ["Kundservice/support"], 14)).toBe("Dashboard och AI-rapportering");
    expect(recommendSolution({ ...process, process_name: "Skapa offert", systems: "CRM" }, ["Kundservice/support"], 14)).toBe("Offert- och dokumentautomation");
  });
  it("rejects invalid process values before scoring or storage", () => {
    expect(validProcesses([process])).toBe(true);
    for (const value of [[null], [], [{ ...process, frequency: "__proto__" }], [{ ...process, process_name: "" }], [{ ...process, data_available: "" }], Array(6).fill(process)]) expect(validProcesses(value)).toBe(false);
  });
  it("uses 46 working weeks consistently and prices one process against its own time", () => {
    expect(estimatedTimeValue(10)).toBe(23000);
    expect(estimatedTimeValue(NaN)).toBe(0);
    expect(estimatedTimeValue(-4)).toBe(0);
    expect(estimatedPayback({ saved_hours_per_week: 0 }, 4900)).toBeNull();
    expect(estimatedPayback({ saved_hours_per_week: 1 }, 4900)).toBe(3);
  });
  it("rejects broken report data instead of crashing the result page", () => {
    expect(parseAiMapResult({ top3: [process] })).toBeNull();
    expect(parseAiMapResult(null)).toBeNull();
  });
});
const now = new Date(2026, 8, 8, 12);
const lead = (id: string, status: string, date: string | null): PipelineLead => ({ id, source: "genomlysning", name: "Test", email: "test@example.test", company: null, status, followup_at: date, created_at: "2026-09-01T10:00:00Z" });
describe("admin sales pipeline", () => {
  it("does not count a meeting request as a booked meeting", () => expect(pipelineSummary([lead("a", "ny", null)], now).meetings).toBe(0));
  it("shows due followups before new leads and excludes closed business", () => {
    const items = [lead("new", "ny", null), lead("closed", "kund", "2026-09-06"), lead("due", "kontaktad", "2026-09-08"), lead("later", "kontaktad", "2026-09-09")];
    expect(followupQueue(items, now).map(l => l.id)).toEqual(["due", "new"]);
    expect(needsFollowup(items[2], now)).toBe(true);
    expect(pipelineSummary(items, now)).toMatchObject({ followups: 1, unhandled: 1, customers: 1 });
  });
  it("exports quoted text safely when leads contain spreadsheet formulas", () => {
    expect(csvCell('A "quote"')).toBe('"A ""quote"""');
    expect(csvCell("=HYPERLINK(1)")).toBe('"\'=HYPERLINK(1)"');
    expect(csvCell("  +123")).toBe('"\'  +123"');
  });
});

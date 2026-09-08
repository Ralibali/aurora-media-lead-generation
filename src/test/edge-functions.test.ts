// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// Compile the production handler with only its Supabase client factory replaced.
// All network I/O is mocked; these tests cannot write to a live database or send mail.
async function handler(name: string, client: unknown, environment: Record<string, string> = {}) {
  const sourceFile = resolve(__dirname, `../../supabase/functions/${name}/index.ts`);
  const source = (await readFile(sourceFile, "utf8")).replace(/^import \{ createClient \} from [^\n]+;/m, "const createClient = () => globalThis.__auroraTestClient;");
  const compiled = await build({ stdin: { contents: source, sourcefile: sourceFile, resolveDir: dirname(sourceFile), loader: "ts" }, bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  let serve: (request: Request) => Promise<Response>;
  vi.stubGlobal("__auroraTestClient", client);
  vi.stubGlobal("Deno", { env: { get: (key: string) => ({ SUPABASE_URL: "https://local.invalid", SUPABASE_SERVICE_ROLE_KEY: "local-test-key", ...environment })[key] }, serve: (fn: typeof serve) => { serve = fn; } });
  await import(/* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString("base64")}#${Math.random()}`);
  return (body: unknown, headers: Record<string, string> = {}) => serve(new Request("https://local.invalid/function", { method: "POST", headers: { "Content-Type": "application/json", origin: "https://auroramedia.se", "x-forwarded-for": "local-test", ...headers }, body: JSON.stringify(body) }));
}
beforeEach(() => { vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const contact = { name: "Alex", email: "test@example.test", message: "Vi vill samla våra rapporter i ett eget system.", _renderedAt: Date.now() - 5000 };
function contactDb(saveFails: boolean) {
  const chain = { select: () => chain, eq: () => chain, gte: () => chain, limit: async () => ({ data: [] }), insert: () => chain, single: async () => saveFails ? { error: new Error("local write failure") } : { data: { id: "local-lead" } } };
  return { rpc: async () => ({ data: true }), from: () => chain };
}
describe("contact handler receipts", () => {
  it("never confirms a lead that could not be persisted", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const submit = await handler("send-contact-email", contactDb(true));
    const response = await submit(contact);
    expect(response.status).toBe(503);
    expect((await response.json()).ok).not.toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("accepts a generic request and preserves its receipt when mail fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("local unavailable", { status: 503 })));
    const submit = await handler("send-contact-email", contactDb(false), { RESEND_API_KEY: "local-test-key" });
    const response = await submit(contact);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, leadId: "local-lead", notification_sent: false });
  });
});
describe("AI map handler integrity", () => {
  it("rejects malformed processes before database or paid AI work", async () => {
    const from = vi.fn(); const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const submit = await handler("submit-ai-map", { from }, { LOVABLE_API_KEY: "local-test-key" });
    expect((await submit({ processes: [null] })).status).toBe(400);
    expect(from).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it("does not request paid analysis when the database rejects a submission", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const chain = { insert: () => chain, select: () => chain, single: async () => ({ error: new Error("RATE_LIMIT_IP") }) };
    const submit = await handler("submit-ai-map", { from: () => chain }, { LOVABLE_API_KEY: "local-test-key" });
    const response = await submit({ company_name: "Test", industry: "Transport", employee_count: "1–5", contact_name: "Test", email: "test@example.test", pain_areas: [], consent: true, processes: [{ process_name: "Rapportera tid", frequency: "weekly", weekly_time: "1-3", rule_based: "yes", data_available: "yes", business_value: "high" }] });
    expect(response.status).toBe(500);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("returns a saved report using the process-specific recommendation", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    let storedProcesses: unknown;
    const lead = { insert: () => lead, select: () => lead, single: async () => ({ data: { id: "local-map", share_token: "abcdef0123456789" } }) };
    const client = { from: (table: string) => table === "ai_map_leads" ? lead : { insert: async (rows: unknown) => { if (table === "ai_map_processes") storedProcesses = rows; return { error: null }; } } };
    const submit = await handler("submit-ai-map", client);
    const response = await submit({ company_name: "Test", industry: "Transport", employee_count: "1–5", contact_name: "Test", email: "test@example.test", pain_areas: ["Kundservice/support"], consent: true, processes: [{ process_name: "Sammanställ veckorapport", frequency: "weekly", weekly_time: "3-5", rule_based: "yes", data_available: "yes", business_value: "high", systems: "Excel" }] });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, leadId: "local-map", totalSavedPerWeek: 3.4, ai_analysis: null });
    expect(body.processes[0].recommended_solution).toBe("Dashboard och AI-rapportering");
    expect(storedProcesses).toHaveLength(1);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("removes only its new incomplete submission if process storage fails", async () => {
    const cleanup = vi.fn(async () => ({ error: null }));
    const lead = { insert: () => lead, select: () => lead, single: async () => ({ data: { id: "incomplete-map", share_token: "abcdef0123456789" } }), delete: () => ({ eq: cleanup }) };
    const submit = await handler("submit-ai-map", { from: (table: string) => table === "ai_map_leads" ? lead : { insert: async () => ({ error: new Error("process failure") }) } });
    const response = await submit({ company_name: "Test", industry: "Transport", employee_count: "1–5", contact_name: "Test", email: "test@example.test", pain_areas: [], consent: true, processes: [{ process_name: "Rapportera tid", frequency: "weekly", weekly_time: "1-3", rule_based: "yes", data_available: "yes", business_value: "high" }] });
    expect(response.status).toBe(503);
    expect(cleanup).toHaveBeenCalledWith("id", "incomplete-map");
  });

});

describe("admin write receipts", () => {
  const id = "00000000-0000-4000-8000-000000000001";
  const headers = { authorization: "Bearer local-admin" };
  const environment = { FAQ_ANALYTICS_PASSWORD: "local-admin" };
  it("rejects unknown sources, malformed dates and oversized notes before a write", async () => {
    const from = vi.fn();
    const submit = await handler("list-leads", { from }, environment);
    for (const patch of [{ source: "unknown", notes: "test" }, { followup_at: "2026-02-30" }, { followup_at: "tomorrow" }, { notes: "a".repeat(2001) }]) {
      const response = await submit({ action: "update", id, source: "kontakt", ...patch }, headers);
      expect(response.status).toBe(400);
    }
    expect(from).not.toHaveBeenCalled();
  });
  it("does not confirm an update when no matching record exists", async () => {
    const chain = { update: () => chain, eq: () => chain, select: () => chain, maybeSingle: async () => ({ data: null }) };
    const submit = await handler("list-leads", { from: () => chain }, environment);
    const response = await submit({ action: "update", id, source: "kontakt", notes: "Nästa steg" }, headers);
    expect(response.status).toBe(404);
    expect((await response.json()).ok).not.toBe(true);
  });
  it("returns the stored record after a successful update", async () => {
    const saved = { id, status: "kontaktad", notes: "Nästa steg", followup_at: "2026-09-12" };
    const update = vi.fn(() => chain);
    const chain = { update, eq: () => chain, select: () => chain, maybeSingle: async () => ({ data: saved }) };
    const submit = await handler("list-leads", { from: () => chain }, environment);
    const response = await submit({ action: "update", source: "kontakt", ...saved }, headers);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, lead: saved });
    expect(update).toHaveBeenCalledWith({ status: "kontaktad", notes: "Nästa steg", followup_at: "2026-09-12" });
  });
});
describe("tool context receipt", () => {
  it("persists project context longer than the former hidden 500-character limit", async () => {
    const note = "Behov och funktionsval från verktyget. ".repeat(35);
    const insert = vi.fn(() => chain);
    const chain = { select: () => chain, eq: () => chain, gte: () => chain, limit: async () => ({ data: [] }), insert, single: async () => ({ data: { id: "local-lead" } }) };
    const submit = await handler("send-contact-email", { rpc: async () => ({ data: true }), from: () => chain });
    const response = await submit({ ...contact, internalNote: note });
    expect(response.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ internal_note: note.trim() }));
  });
});

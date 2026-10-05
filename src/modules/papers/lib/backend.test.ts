import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { handlePapersOperation, matchesFileSignature } from "../../../../supabase/functions/aurora-product-api/papers/index";

describe("private document processing", () => {
  it("accepts the supported original signatures", () => {
    expect(matchesFileSignature(new TextEncoder().encode("%PDF-1.7\n"), "application/pdf")).toBe(true);
    expect(matchesFileSignature(new Uint8Array([255, 216, 255, 224]), "image/jpeg")).toBe(true);
    expect(matchesFileSignature(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), "image/png")).toBe(true);
  });
  it("rejects a spoofed MIME type, empty input, and truncated originals", () => {
    expect(matchesFileSignature(new TextEncoder().encode("<script>"), "application/pdf")).toBe(false);
    expect(matchesFileSignature(new Uint8Array(), "image/jpeg")).toBe(false);
    expect(matchesFileSignature(new Uint8Array([137, 80, 78]), "image/png")).toBe(false);
    expect(matchesFileSignature(new TextEncoder().encode("%PDF-1.7"), "text/html")).toBe(false);
  });
  it("requires the gateway's verified Papers identity before accessing documents", async () => {
    const from = vi.fn();
    const client = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("expired") }) }, from };
    await expect(handlePapersOperation("processDocument", { documentId: "30000000-0000-4000-8000-000000000001" }, client as unknown as SupabaseClient)).rejects.toThrow("Logga in");
    expect(from).not.toHaveBeenCalled();
  });
  it("rejects a malformed identifier before querying data", async () => {
    const from = vi.fn();
    const client = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test" } }, error: null }) }, from };
    await expect(handlePapersOperation("processDocument", { documentId: "../other-tenant" }, client as unknown as SupabaseClient, "20000000-0000-4000-8000-000000000001")).rejects.toThrow("Ogiltig");
    expect(from).not.toHaveBeenCalled();
  });
  it("returns an already completed export without changing it or starting another export", async () => {
    const exportId = "40000000-0000-4000-8000-000000000001";
    const single = vi.fn().mockResolvedValue({ data: { id: exportId, csv: "existing CSV", document_count: 2 }, error: null });
    const from = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single }) }) });
    const rpc = vi.fn();
    const client = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test" } }, error: null }) }, from, rpc };
    await expect(handlePapersOperation("recoverExport", { exportId }, client as unknown as SupabaseClient, "20000000-0000-4000-8000-000000000001")).resolves.toEqual({ exportId, count: 2, csv: "existing CSV" });
    expect(from).toHaveBeenCalledExactlyOnceWith("exports");
    expect(rpc).not.toHaveBeenCalled();
  });
  it("recovers a pending CSV from locked export documents without creating a second export", async () => {
    const exportId = "40000000-0000-4000-8000-000000000001";
    const row = { id: "document", vendor: "=SUM(1;2)", invoice_number: "F1", invoice_date: "2026-10-05", due_date: null, net_amount: 80, vat_amount: 20, gross_amount: 100, currency: "SEK", ocr_reference: null, file_name: "original.pdf", approved_at: "2026-10-05T10:00:00Z" };
    const reading = {
      select() { return this; }, eq() { return this; },
      single: vi.fn().mockResolvedValue({ data: { id: exportId, csv: null, document_count: 1 }, error: null }),
    };
    const documents = {
      select() { return this; }, eq() { return this; }, order() { return this; },
      then(resolve: (value: { data: typeof row[]; error: null }) => unknown) { return Promise.resolve({ data: [row], error: null as null }).then(resolve); },
    };
    let savedCsv = "";
    const update = vi.fn((payload: { csv: string }) => { savedCsv = payload.csv; return writing; });
    const writing = {
      update, eq() { return this; }, is() { return this; }, select() { return this; },
      async maybeSingle() { return { data: { csv: savedCsv }, error: null }; },
    };
    let exportReads = 0;
    const from = vi.fn((table: string) => table === "documents" ? documents : exportReads++ === 0 ? reading : writing);
    const rpc = vi.fn();
    const client = { from, rpc };
    const result = await handlePapersOperation("recoverExport", { exportId }, client as unknown as SupabaseClient, "20000000-0000-4000-8000-000000000001");
    expect(result).toEqual({ exportId, count: 1, csv: savedCsv });
    expect(savedCsv).toContain('"\'=SUM(1;2)"');
    expect(savedCsv).toContain("80,00;20,00;100,00;SEK");
    expect(update).toHaveBeenCalledOnce();
    expect(rpc).not.toHaveBeenCalled();
  });
});

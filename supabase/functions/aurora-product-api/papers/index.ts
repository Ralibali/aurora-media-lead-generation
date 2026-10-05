import type { SupabaseClient } from "npm:@supabase/supabase-js@2.104.0";
import { buildCsv, type ExportRow } from "./csv.ts";

const MAX_BYTES = 20 * 1024 * 1024;
const MIME = ["application/pdf", "image/jpeg", "image/png"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function idFrom(data: unknown, field: string): string {
  const value = data && typeof data === "object" ? (data as Record<string, unknown>)[field] : undefined;
  if (typeof value !== "string" || !UUID.test(value)) throw new Error("Ogiltig dokument- eller organisationsreferens");
  return value;
}

export function matchesFileSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === "application/pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return mime === "image/png" && [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
}

async function processDocument(data: unknown, sb: SupabaseClient) {
  const documentId = idFrom(data, "documentId");
  const { data: doc, error } = await sb.from("documents").select("*").eq("id", documentId).single();
  if (error || !doc) throw new Error("Dokumentet hittades inte");
  if (doc.status !== "new") return { status: doc.status, duplicateOf: doc.duplicate_of };
  if (!doc.storage_path || !MIME.includes(doc.mime_type)) throw new Error("Originalfilen saknas eller har fel filtyp");
  const { data: blob, error: downloadError } = await sb.storage.from("originals").download(doc.storage_path);
  if (downloadError || !blob) throw new Error("Kunde inte läsa originalfilen");
  if (!blob.size || blob.size > MAX_BYTES) throw new Error("Filen måste vara mellan 1 byte och 20 MB");
  const buffer = await blob.arrayBuffer();
  if (!matchesFileSignature(new Uint8Array(buffer), doc.mime_type)) throw new Error("Filens innehåll stämmer inte med PDF, JPG eller PNG");
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", buffer))).map((b) => b.toString(16).padStart(2, "0")).join("");
  // No provider is configured. All live invoice values remain for manual review.
  // A future ExtractionProvider belongs here on the server; never send its credentials to the client.
  const { data: updated, error: updateError } = await sb.from("documents").update({
    file_hash: hash,
    size_bytes: buffer.byteLength,
    status: "needs_review",
    extraction_provider: "none",
    extraction_note: "Ingen tolkningstjänst är konfigurerad. Fälten fylls i manuellt vid granskning.",
  }).eq("id", documentId).eq("status", "new").select("status, duplicate_of").single();
  if (updateError || !updated) throw new Error(updateError?.message ?? "Dokumentet kunde inte bearbetas");
  return { status: updated.status, duplicateOf: updated.duplicate_of };
}

/** Idempotently materializes a CSV from the export's already locked, tenant-scoped documents. */
async function finishExport(exportId: string, sb: SupabaseClient) {
  const { data: existing, error } = await sb.from("exports").select("id, csv, document_count").eq("id", exportId).single();
  if (error || !existing) throw new Error("Exporten hittades inte");
  if (existing.csv) return { exportId, count: existing.document_count, csv: existing.csv as string };
  const { data: rows, error: readError } = await sb.from("documents").select(
    "id, vendor, invoice_number, invoice_date, due_date, net_amount, vat_amount, gross_amount, currency, ocr_reference, file_name, approved_at",
  ).eq("export_id", exportId).eq("status", "exported").order("invoice_date", { ascending: true }).order("id");
  if (readError || !rows?.length || rows.length !== existing.document_count) throw new Error("Exportens dokument kunde inte läsas fullständigt. Försök igen.");
  const csv = buildCsv(rows as ExportRow[]);
  const { data: saved, error: saveError } = await sb.from("exports").update({ csv }).eq("id", exportId).is("csv", null).select("csv").maybeSingle();
  if (saveError) throw new Error("CSV-filen kunde inte sparas. Owner eller admin kan återuppta exporten med knappen CSV.");
  if (saved?.csv) return { exportId, count: rows.length, csv: saved.csv as string };
  // Another request may have completed the same export while this one generated it.
  const { data: completed, error: concurrentError } = await sb.from("exports").select("csv").eq("id", exportId).single();
  if (concurrentError || !completed?.csv) throw new Error("CSV-filen kunde inte sparas. Försök igen.");
  return { exportId, count: rows.length, csv: completed.csv as string };
}

export async function handlePapersOperation(operation: string, data: unknown, sb: SupabaseClient, verifiedUserId?: string): Promise<unknown> {
  // The gateway passes this only after getUser(token) succeeds against the Papers project.
  // The RLS client uses that same token; it intentionally has no persisted Auth session.
  if (!verifiedUserId || !UUID.test(verifiedUserId)) throw new Error("Logga in till dokumentinkorgen igen");
  if (operation === "processDocument") return processDocument(data, sb);
  if (operation === "recoverExport") return finishExport(idFrom(data, "exportId"), sb);
  if (operation === "exportApproved") {
    const { data: exportId, error } = await sb.rpc("create_export", { _org: idFrom(data, "orgId") });
    if (error || !exportId) throw new Error(error?.message ?? "Exporten kunde inte skapas");
    try { return await finishExport(exportId as string, sb); }
    catch { throw new Error("Exporten har sparats, men CSV-filen är inte klar. Klicka på CSV i exportlistan för att försöka igen."); }
  }
  throw new Error("Åtgärden stöds inte för dokumentinkorgen");
}

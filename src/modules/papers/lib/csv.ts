// Pure CSV builder for Aurora Receipt exports. Semicolon-separated (Swedish Excel default), UTF-8 with BOM.

export const CSV_SEPARATOR = ";";

export type ExportRow = {
  id: string;
  vendor: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  net_amount: number | string | null;
  vat_amount: number | string | null;
  gross_amount: number | string | null;
  currency: string | null;
  ocr_reference: string | null;
  file_name: string;
  approved_at: string | null;
};

export const CSV_HEADERS = [
  "dokument_id",
  "leverantor",
  "fakturanummer",
  "fakturadatum",
  "forfallodatum",
  "netto",
  "moms",
  "brutto",
  "valuta",
  "ocr",
  "filnamn",
  "godkand",
];

/** Escapes one text cell: quotes when needed, doubles quotes, neutralises spreadsheet formulas. */
export function escapeTextCell(value: string | null | undefined): string {
  if (value == null) return "";
  let v = String(value);
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  if (v.includes('"') || v.includes(CSV_SEPARATOR) || v.includes(",") || /[\r\n]/.test(v) || v !== v.trim()) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/** Numbers are written with two decimals and a comma decimal separator (sv-SE). */
export function formatAmountCell(value: number | string | null | undefined): string {
  if (value == null || value === "") return "";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toFixed(2).replace(".", ",");
}

export function buildCsv(rows: ExportRow[]): string {
  const lines = [CSV_HEADERS.join(CSV_SEPARATOR)];
  for (const r of rows) {
    lines.push(
      [
        escapeTextCell(r.id),
        escapeTextCell(r.vendor),
        escapeTextCell(r.invoice_number),
        escapeTextCell(r.invoice_date),
        escapeTextCell(r.due_date),
        formatAmountCell(r.net_amount),
        formatAmountCell(r.vat_amount),
        formatAmountCell(r.gross_amount),
        escapeTextCell(r.currency),
        escapeTextCell(r.ocr_reference),
        escapeTextCell(r.file_name),
        escapeTextCell(r.approved_at),
      ].join(CSV_SEPARATOR),
    );
  }
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}


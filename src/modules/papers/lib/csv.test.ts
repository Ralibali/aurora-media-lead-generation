import { describe, expect, test } from "vitest";

import { buildCsv, escapeTextCell, formatAmountCell } from "./csv";

describe("CSV escaping", () => {
  test("plain values untouched", () => expect(escapeTextCell("Exempel AB")).toBe("Exempel AB"));
  test("null -> empty", () => expect(escapeTextCell(null)).toBe(""));
  test("separator is quoted", () => expect(escapeTextCell("A;B")).toBe('"A;B"'));
  test("quotes doubled", () => expect(escapeTextCell('Säg "hej"')).toBe('"Säg ""hej"""'));
  test("newlines quoted", () => expect(escapeTextCell("rad1\nrad2")).toBe('"rad1\nrad2"'));
  test("formula injection neutralised", () => {
    expect(escapeTextCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(escapeTextCell("+46")).toBe("'+46");
    expect(escapeTextCell("@x")).toBe("'@x");
  });
  test("amounts use comma decimals, negatives allowed", () => {
    expect(formatAmountCell(1234.5)).toBe("1234,50");
    expect(formatAmountCell("-10")).toBe("-10,00");
    expect(formatAmountCell(null)).toBe("");
  });
  test("full file has BOM, header and CRLF", () => {
    const csv = buildCsv([
      { id: "1", vendor: 'A;"B"', invoice_number: "F-1", invoice_date: "2026-01-02", due_date: null, net_amount: 80, vat_amount: 20, gross_amount: 100, currency: "SEK", ocr_reference: null, file_name: "a.pdf", approved_at: null },
    ]);
    expect(csv.startsWith("\uFEFFdokument_id;leverantor;")).toBe(true);
    const lines = csv.slice(1).split("\r\n");
    expect(lines[1]).toBe('1;"A;""B""";F-1;2026-01-02;;80,00;20,00;100,00;SEK;;a.pdf;');
    expect(lines.length).toBe(3);
  });
});


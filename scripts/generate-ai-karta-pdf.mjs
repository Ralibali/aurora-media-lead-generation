// Genererar den ifyllbara Aurora AI-karta PDF:en (arbetsblad + AcroForm-fält).
// Output: public/downloads/aurora-ai-karta.pdf
// Kör: node scripts/generate-ai-karta-pdf.mjs
import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, "..", "public", "downloads", "aurora-ai-karta.pdf");

// Aurora-palett (dark theme, teal-aurora-grön)
const COLORS = {
  bg: rgb(0.043, 0.071, 0.125),         // #0B1220
  panel: rgb(0.067, 0.106, 0.169),      // #112B - slight lighter
  border: rgb(0.18, 0.78, 0.6),         // #2EC799 (aurora teal)
  borderSoft: rgb(1, 1, 1),
  primary: rgb(0.204, 0.831, 0.616),    // #34D49D
  primarySoft: rgb(0.18, 0.78, 0.6),
  text: rgb(0.93, 0.96, 0.97),
  muted: rgb(0.65, 0.72, 0.76),
  accentDim: rgb(0.063, 0.149, 0.169),
  fieldBg: rgb(0.027, 0.082, 0.094),    // dark teal
  fieldBorder: rgb(0.18, 0.78, 0.6),
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 48;

const PAIN_AREAS = [
  "Administration", "Kundservice/support",
  "Sälj och offerter", "Ekonomi och fakturor",
  "Rapportering/Excel", "Intern kunskap och rutiner",
  "Projektledning", "HR/onboarding",
  "Lager/logistik", "Annat",
];

const FREQUENCIES = [
  ["daily", "Dagligen"],
  ["weekly", "Veckovis"],
  ["monthly", "Månadsvis"],
  ["rare", "Sällan"],
];
const TIMES = [
  ["0-1", "0-1 h/v"],
  ["1-3", "1-3 h/v"],
  ["3-5", "3-5 h/v"],
  ["5-10", "5-10 h/v"],
  ["10+", "10+ h/v"],
];
const YPN = [
  ["yes", "Ja"],
  ["partial", "Delvis"],
  ["no", "Nej"],
];
const VALUES = [
  ["high", "Hög"],
  ["medium", "Medel"],
  ["low", "Låg"],
];

async function build() {
  const doc = await PDFDocument.create();
  doc.setTitle("Aurora AI-karta · Arbetsblad");
  doc.setAuthor("Aurora Media AB");
  doc.setSubject("Aurora AI-karta · Arbetsblad");
  doc.setKeywords(["Aurora Media", "AI-karta", "AI", "automation"]);
  doc.setProducer("Aurora Media AB");
  doc.setCreator("Aurora Media AB");

  const fontReg = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontIt = await doc.embedFont(StandardFonts.HelveticaOblique);
  const form = doc.getForm();

  // ---------- helpers ----------
  const fillBg = (page) => {
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLORS.bg });
    // Aurora gradient hint top-right
    for (let i = 0; i < 30; i++) {
      const r = 220 - i * 6;
      const op = 0.012;
      page.drawCircle({
        x: PAGE_W - 80, y: PAGE_H - 60, size: r,
        color: COLORS.primary, opacity: op,
      });
    }
    // Subtle bottom-left orb
    for (let i = 0; i < 20; i++) {
      page.drawCircle({
        x: 20, y: 80, size: 160 - i * 5,
        color: COLORS.primary, opacity: 0.008,
      });
    }
  };

  const drawHeader = (page, label, pageInfo) => {
    // Top brand row
    page.drawCircle({ x: M + 6, y: PAGE_H - M - 6, size: 5, color: COLORS.primary });
    page.drawText("AURORA MEDIA", {
      x: M + 18, y: PAGE_H - M - 9, size: 9, font: fontBold, color: COLORS.text,
    });
    if (pageInfo) {
      const w = fontReg.widthOfTextAtSize(pageInfo, 9);
      page.drawText(pageInfo, {
        x: PAGE_W - M - w, y: PAGE_H - M - 9, size: 9, font: fontReg, color: COLORS.muted,
      });
    }
    // Thin divider
    page.drawLine({
      start: { x: M, y: PAGE_H - M - 22 },
      end: { x: PAGE_W - M, y: PAGE_H - M - 22 },
      thickness: 0.4, color: COLORS.primary, opacity: 0.35,
    });
    if (label) {
      page.drawText(label.toUpperCase(), {
        x: M, y: PAGE_H - M - 38, size: 9, font: fontBold, color: COLORS.primary,
        opacity: 0.85,
      });
    }
  };

  const drawFooter = (page, num, total) => {
    page.drawLine({
      start: { x: M, y: M + 18 },
      end: { x: PAGE_W - M, y: M + 18 },
      thickness: 0.4, color: COLORS.primary, opacity: 0.25,
    });
    page.drawText("Aurora AI-karta · Arbetsblad", {
      x: M, y: M + 4, size: 8, font: fontReg, color: COLORS.muted,
    });
    const right = `Sida ${num} av ${total}  ·  auroramedia.se/ai-karta`;
    const w = fontReg.widthOfTextAtSize(right, 8);
    page.drawText(right, {
      x: PAGE_W - M - w, y: M + 4, size: 8, font: fontReg, color: COLORS.muted,
    });
  };

  const drawSectionTitle = (page, y, title) => {
    // Aurora accent bar
    page.drawRectangle({
      x: M, y: y - 3, width: 3, height: 18,
      color: COLORS.primary,
    });
    page.drawText(title, {
      x: M + 12, y, size: 14, font: fontBold, color: COLORS.text,
    });
    return y - 24;
  };

  const drawLabel = (page, x, y, text) => {
    page.drawText(text.toUpperCase(), {
      x, y, size: 7.5, font: fontBold, color: COLORS.muted,
    });
  };

  const addTextField = (name, opts = {}) => {
    const f = form.createTextField(name);
    if (opts.multiline) f.enableMultiline();
    if (opts.maxLength) f.setMaxLength(opts.maxLength);
    return f;
  };

  // ====================== PAGE 1 — COVER ======================
  let p1 = doc.addPage([PAGE_W, PAGE_H]);
  fillBg(p1);
  drawHeader(p1, null, null);

  // Big brand block
  const brandTop = PAGE_H - M - 90;
  p1.drawText("AURORA MEDIA AB", {
    x: M, y: brandTop, size: 11, font: fontBold, color: COLORS.primary,
  });
  p1.drawText("Aurora", {
    x: M, y: brandTop - 78, size: 56, font: fontBold, color: COLORS.text,
  });
  p1.drawText("AI-karta", {
    x: M, y: brandTop - 138, size: 56, font: fontBold, color: COLORS.primary,
  });
  p1.drawText("Arbetsblad för småföretag som vill", {
    x: M, y: brandTop - 178, size: 13, font: fontReg, color: COLORS.muted,
  });
  p1.drawText("kartlägga sin AI-potential på 10 minuter.", {
    x: M, y: brandTop - 196, size: 13, font: fontReg, color: COLORS.muted,
  });

  // How-it-works box
  const hbY = 180;
  p1.drawRectangle({
    x: M, y: hbY, width: PAGE_W - M * 2, height: 140,
    color: COLORS.panel, borderColor: COLORS.primary, borderWidth: 0.6, opacity: 0.9, borderOpacity: 0.5,
  });
  p1.drawText("Så funkar det", {
    x: M + 18, y: hbY + 110, size: 13, font: fontBold, color: COLORS.primary,
  });
  const steps = [
    "1.  Fyll i fälten i PDF:en (eller skriv ut och fyll i för hand).",
    "2.  Spara PDF:en på din dator.",
    "3.  Ladda upp den på auroramedia.se/ai-karta - vi räknar fram er topp-3.",
    "4.  Du får en mini-analys direkt + ett mejl med detaljerna.",
  ];
  steps.forEach((s, i) => {
    p1.drawText(s, {
      x: M + 18, y: hbY + 86 - i * 18, size: 10.5, font: fontReg, color: COLORS.text,
    });
  });

  // Footer block
  p1.drawText("Aurora Media AB · Linköping · auroramedia.se · info@auroramedia.se", {
    x: M, y: M + 4, size: 8, font: fontReg, color: COLORS.muted,
  });

  // ====================== PAGE 2 — Företag + utmaningar ======================
  let p2 = doc.addPage([PAGE_W, PAGE_H]);
  fillBg(p2);
  drawHeader(p2, "Steg 1 · Företaget", "Arbetsblad · 1 av 2");

  let y = PAGE_H - M - 70;
  y = drawSectionTitle(p2, y, "1. Företaget");
  p2.drawText("Vi använder uppgifterna för att skicka resultatet och, om du vill, höra av oss.", {
    x: M, y, size: 9.5, font: fontReg, color: COLORS.muted,
  });
  y -= 26;

  // Field grid: row1 (företagsnamn / bransch), row2 (anställda / kontakt), row3 (email full)
  const colW = (PAGE_W - M * 2 - 16) / 2;
  const fieldH = 26;

  const placeField = (name, label, x, y, w) => {
    drawLabel(p2, x, y + fieldH + 6, label);
    p2.drawRectangle({
      x, y, width: w, height: fieldH,
      color: COLORS.fieldBg, borderColor: COLORS.fieldBorder,
      borderWidth: 0.5, borderOpacity: 0.55,
    });
    const f = addTextField(name);
    f.addToPage(p2, {
      x: x + 1, y: y + 1, width: w - 2, height: fieldH - 2,
      borderWidth: 0,
      textColor: rgb(1, 1, 1),
    });
  };

  placeField("company_name", "Företagsnamn *", M, y - fieldH, colW);
  placeField("industry", "Bransch *", M + colW + 16, y - fieldH, colW);
  y -= fieldH + 32;

  placeField("employee_count", "Antal anställda * (1-5 / 6-20 / 21-50 / 51-200 / 200+)", M, y - fieldH, colW);
  placeField("contact_name", "Kontaktperson *", M + colW + 16, y - fieldH, colW);
  y -= fieldH + 32;

  placeField("email", "E-post *", M, y - fieldH, PAGE_W - M * 2);
  y -= fieldH + 40;

  // Section 2: utmaningsområden
  y = drawSectionTitle(p2, y, "2. Era utmaningsområden (bocka i)");
  p2.drawText("Vilka områden tar mest tid eller skapar mest friktion idag?", {
    x: M, y, size: 9.5, font: fontReg, color: COLORS.muted,
  });
  y -= 22;

  const boxSize = 12;
  const colsPerRow = 2;
  const cellW = (PAGE_W - M * 2) / colsPerRow;
  PAIN_AREAS.forEach((area, i) => {
    const col = i % colsPerRow;
    const row = Math.floor(i / colsPerRow);
    const cx = M + col * cellW;
    const cy = y - row * 24;
    // Box
    p2.drawRectangle({
      x: cx, y: cy - boxSize, width: boxSize, height: boxSize,
      color: COLORS.fieldBg, borderColor: COLORS.fieldBorder,
      borderWidth: 0.5, borderOpacity: 0.6,
    });
    const cb = form.createCheckBox(`pain_${slug(area)}`);
    cb.addToPage(p2, {
      x: cx, y: cy - boxSize, width: boxSize, height: boxSize,
      borderWidth: 0,
    });
    p2.drawText(area, {
      x: cx + boxSize + 8, y: cy - boxSize + 3,
      size: 10, font: fontReg, color: COLORS.text,
    });
  });
  y -= Math.ceil(PAIN_AREAS.length / colsPerRow) * 24 + 18;

  // Consent
  p2.drawRectangle({
    x: M, y: y - 38, width: PAGE_W - M * 2, height: 38,
    color: COLORS.panel, borderColor: COLORS.primary, borderWidth: 0.4,
    opacity: 0.7, borderOpacity: 0.4,
  });
  p2.drawRectangle({
    x: M + 14, y: y - 25, width: boxSize, height: boxSize,
    color: COLORS.fieldBg, borderColor: COLORS.fieldBorder, borderWidth: 0.5,
  });
  const consentBox = form.createCheckBox("consent");
  consentBox.addToPage(p2, {
    x: M + 14, y: y - 25, width: boxSize, height: boxSize, borderWidth: 0,
  });
  p2.drawText("Jag samtycker till att Aurora Media kontaktar mig om mini-analysen.", {
    x: M + 14 + boxSize + 8, y: y - 22, size: 10, font: fontReg, color: COLORS.text,
  });

  drawFooter(p2, 2, 4);

  // ====================== PAGE 3 — Processer 1-2 ======================
  let p3 = doc.addPage([PAGE_W, PAGE_H]);
  fillBg(p3);
  drawHeader(p3, "Steg 2 · Era processer", "Arbetsblad · 2 av 2");

  y = PAGE_H - M - 70;
  y = drawSectionTitle(p3, y, "3. Era 3 mest tidskrävande processer");
  p3.drawText("Beskriv minst 3 återkommande arbetsmoment. Vi räknar ut topp-3 åt er.", {
    x: M, y, size: 9.5, font: fontReg, color: COLORS.muted,
  });
  y -= 14;

  drawProcessBlock(p3, form, fontReg, fontBold, 1, y - 8);
  y -= 260;
  drawProcessBlock(p3, form, fontReg, fontBold, 2, y - 8);

  drawFooter(p3, 3, 4);

  // ====================== PAGE 4 — Process 3 + skicka in ======================
  let p4 = doc.addPage([PAGE_W, PAGE_H]);
  fillBg(p4);
  drawHeader(p4, "Steg 2 · Era processer (forts.)", null);

  y = PAGE_H - M - 70;
  drawProcessBlock(p4, form, fontReg, fontBold, 3, y);

  // Skicka in / CTA
  y -= 270;
  p4.drawRectangle({
    x: M, y: y - 110, width: PAGE_W - M * 2, height: 130,
    color: COLORS.panel, borderColor: COLORS.primary, borderWidth: 0.6,
    opacity: 0.95, borderOpacity: 0.55,
  });
  p4.drawText("KLAR? SÅ HÄR LÄMNAR DU IN", {
    x: M + 18, y: y + 8, size: 9, font: fontBold, color: COLORS.primary,
  });
  p4.drawText("Spara PDF:en och ladda upp den här:", {
    x: M + 18, y: y - 12, size: 11, font: fontBold, color: COLORS.text,
  });
  p4.drawText("auroramedia.se/ai-karta  ->  knappen \"Ladda upp ifylld PDF\"", {
    x: M + 18, y: y - 30, size: 11, font: fontReg, color: COLORS.text,
  });
  p4.drawText("Vi räknar fram er topp-3, total tidsbesparing och nästa steg.", {
    x: M + 18, y: y - 50, size: 9.5, font: fontReg, color: COLORS.muted,
  });
  p4.drawText("Du får mini-analysen direkt på skärmen + ett mejl med detaljerna.", {
    x: M + 18, y: y - 64, size: 9.5, font: fontReg, color: COLORS.muted,
  });
  p4.drawText("Inte digital? Mejla in PDF:en till info@auroramedia.se så hör vi av oss.", {
    x: M + 18, y: y - 86, size: 9, font: fontIt, color: COLORS.muted,
  });

  drawFooter(p4, 4, 4);

  // Form appearance: dark fields with light text
  form.updateFieldAppearances(fontReg);

  const bytes = await doc.save();
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, bytes);
  console.log(`✔ Wrote ${OUTPUT} (${bytes.length} bytes)`);
}

function slug(s) {
  return s
    .toLowerCase()
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function drawProcessBlock(page, form, fontReg, fontBold, idx, yTop) {
  const w = PAGE_W - M * 2;
  const h = 240;
  // Card
  page.drawRectangle({
    x: M, y: yTop - h, width: w, height: h,
    color: COLORS.panel, borderColor: COLORS.primary,
    borderWidth: 0.4, opacity: 0.85, borderOpacity: 0.4,
  });
  // Index badge
  page.drawRectangle({
    x: M + 14, y: yTop - 26, width: 22, height: 18,
    color: COLORS.primary,
  });
  page.drawText(String(idx), {
    x: M + 22, y: yTop - 22, size: 11, font: fontBold, color: COLORS.bg,
  });
  page.drawText(`Process ${idx}`, {
    x: M + 44, y: yTop - 22, size: 11, font: fontBold, color: COLORS.text,
  });

  // Process name field (full width)
  let cy = yTop - 70;
  page.drawText("PROCESSNAMN", {
    x: M + 14, y: cy + 28, size: 7.5, font: fontBold, color: COLORS.muted,
  });
  page.drawRectangle({
    x: M + 14, y: cy, width: w - 28, height: 22,
    color: COLORS.fieldBg, borderColor: COLORS.fieldBorder,
    borderWidth: 0.5, borderOpacity: 0.6,
  });
  const tf = form.createTextField(`p${idx}_process_name`);
  tf.addToPage(page, {
    x: M + 15, y: cy + 1, width: w - 30, height: 20,
    borderWidth: 0, textColor: rgb(1, 1, 1),
  });

  cy -= 16;
  // Systems field
  page.drawText("SYSTEM/VERKTYG (ex. Fortnox, Excel, Outlook)", {
    x: M + 14, y: cy, size: 7.5, font: fontBold, color: COLORS.muted,
  });
  cy -= 26;
  page.drawRectangle({
    x: M + 14, y: cy, width: w - 28, height: 20,
    color: COLORS.fieldBg, borderColor: COLORS.fieldBorder,
    borderWidth: 0.5, borderOpacity: 0.6,
  });
  const sysF = form.createTextField(`p${idx}_systems`);
  sysF.addToPage(page, {
    x: M + 15, y: cy + 1, width: w - 30, height: 18,
    borderWidth: 0, textColor: rgb(1, 1, 1),
  });

  // Radio rows: frequency, time, rule_based, data_available, business_value
  cy -= 22;
  drawRadioRow(page, form, fontReg, fontBold, `p${idx}_frequency`, "Hur ofta görs den?", FREQUENCIES, M + 14, cy);
  cy -= 22;
  drawRadioRow(page, form, fontReg, fontBold, `p${idx}_weekly_time`, "Tid per vecka?", TIMES, M + 14, cy);
  cy -= 22;
  drawRadioRow(page, form, fontReg, fontBold, `p${idx}_rule_based`, "Regelstyrd?", YPN, M + 14, cy);
  cy -= 22;
  drawRadioRow(page, form, fontReg, fontBold, `p${idx}_data_available`, "Data finns?", YPN, M + 14, cy);
  cy -= 22;
  drawRadioRow(page, form, fontReg, fontBold, `p${idx}_business_value`, "Affärsnytta?", VALUES, M + 14, cy);
}

function drawRadioRow(page, form, fontReg, fontBold, name, label, options, x, y) {
  page.drawText(label.toUpperCase(), {
    x, y, size: 7.5, font: fontBold, color: COLORS.muted,
  });
  const labelW = 110;
  let cx = x + labelW;
  const group = form.createRadioGroup(name);
  for (const [val, lbl] of options) {
    // Radio circle
    page.drawCircle({
      x: cx + 6, y: y + 3, size: 5,
      borderColor: COLORS.fieldBorder, borderWidth: 0.6, color: COLORS.fieldBg,
      borderOpacity: 0.7,
    });
    group.addOptionToPage(val, page, {
      x: cx, y: y - 3, width: 12, height: 12, borderWidth: 0,
    });
    page.drawText(lbl, {
      x: cx + 16, y: y, size: 9, font: fontReg, color: COLORS.text,
    });
    const tw = fontReg.widthOfTextAtSize(lbl, 9);
    cx += 16 + tw + 16;
  }
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});

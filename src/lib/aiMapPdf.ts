// AI-planen – Aurora Medias PDF-produkt.
// En verkstad-stylad, företagsspecifik rapport som genereras i webbläsaren:
// vad processerna kostar idag (i kronor), vad som bör byggas först, vad det
// kostar och hur snabbt det betalar sig. Byggs som jsPDF-dokument så att
// samma fil både kan laddas ner och mejlas som bilaga.
import { jsPDF } from "jspdf";
import {
  AiMapResult,
  ScoredProcess,
  FREQ_LABELS,
  TIME_LABELS,
  TIERS,
  TierKey,
  tierForProcess,
} from "@/lib/aiMap";

// Verkstad-paletten (samma som sajten).
const PAPER = [246, 245, 241] as const;
const CARD = [255, 255, 255] as const;
const INK = [20, 23, 26] as const;
const MUTED = [74, 80, 88] as const;
const LINE = [226, 224, 218] as const;
const ORANGE = [232, 80, 10] as const;
const ORANGE_SOFT = [252, 235, 228] as const;
const GREEN = [15, 81, 50] as const;
const GREEN_SOFT = [231, 240, 234] as const;

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

const HOURLY_RATE = 600;
const WEEKS_PER_MONTH = 4.33;

type RGB = readonly number[];
const rgb = (c: RGB) => c as unknown as [number, number, number];

interface Cursor { y: number; }

// jsPDF:s standardtypsnitt saknar vissa glyfer – mappa till säkra varianter.
function pdfSafe(s: string): string {
  return (s || "")
    .replace(/→/g, "›")
    .replace(/≈/g, "~")
    .replace(/[✓✔]/g, "+")
    .replace(/≥/g, "minst ")
    .replace(/≤/g, "högst ")
    .replace(/[""]/g, '"')
    .replace(/['′]/g, "'");
}

function normalizeCompanyName(name: string): string {
  if (!name) return "ert företag";
  const trimmed = name.trim();
  if (trimmed === trimmed.toLowerCase() || trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (/^(ab|hb|kb|as)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(" ");
  }
  return trimmed;
}

function slugifyCompany(name: string): string {
  return normalizeCompanyName(name)
    .toLowerCase()
    .replace(/å|ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/é|è|ê/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "ai-karta";
}

function todayStr(): string {
  return new Date().toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" });
}

function fmtKr(n: number): string {
  return `${Math.round(n).toLocaleString("sv-SE").replace(/,/g, " ")} kr`;
}

function hoursPerWeek(p: ScoredProcess): number {
  return p.saved_hours_per_week ?? 0;
}

function costPerMonth(p: ScoredProcess): number {
  return Math.round(hoursPerWeek(p) * WEEKS_PER_MONTH * HOURLY_RATE);
}

function paybackMonths(p: ScoredProcess): number | null {
  const monthly = costPerMonth(p);
  if (monthly <= 0) return null;
  return Math.max(1, Math.round(TIERS[tierForProcess(p)].price / monthly));
}

function ensureSpace(doc: jsPDF, cur: Cursor, needed: number, company: string) {
  if (cur.y + needed > PAGE_H - 20) {
    doc.addPage();
    addPageHeader(doc, cur, company);
  }
}

function wordmark(doc: jsPDF, x: number, y: number, dark = true) {
  doc.setFillColor(...rgb(ORANGE));
  doc.rect(x, y - 2.6, 2.6, 2.6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...rgb(dark ? INK : PAPER));
  doc.text("aurora media", x + 4.5, y);
}

function addPageHeader(doc: jsPDF, cur: Cursor, company: string) {
  doc.setFillColor(...rgb(PAPER));
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  wordmark(doc, MARGIN, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...rgb(MUTED));
  doc.text(pdfSafe(`AI-KARTA · ${company.toUpperCase()}`.slice(0, 60)), PAGE_W - MARGIN, 14, { align: "right" });
  doc.setDrawColor(...rgb(LINE));
  doc.setLineWidth(0.2);
  doc.line(MARGIN, 18, PAGE_W - MARGIN, 18);
  cur.y = 30;
}

function monoLabel(doc: jsPDF, text: string, x: number, y: number, color: RGB = MUTED) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...rgb(color));
  doc.text(pdfSafe(text.toUpperCase()), x, y);
}

function paragraph(doc: jsPDF, cur: Cursor, text: string, company: string, opts: { size?: number; color?: RGB; bold?: boolean; width?: number; x?: number; lineH?: number } = {}) {
  const size = opts.size ?? 10.5;
  const width = opts.width ?? CONTENT_W;
  const x = opts.x ?? MARGIN;
  const lineH = opts.lineH ?? size * 0.48 + 0.8;
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...rgb(opts.color ?? INK));
  const lines = doc.splitTextToSize(pdfSafe(text), width);
  for (const line of lines) {
    ensureSpace(doc, cur, lineH + 1, company);
    doc.text(line, x, cur.y);
    cur.y += lineH;
  }
  cur.y += 2;
}

// ---------- SIDA 1: OMSLAG ----------
function coverPage(doc: jsPDF, result: AiMapResult, company: string) {
  const { meta } = result;
  doc.setFillColor(...rgb(PAPER));
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  wordmark(doc, MARGIN, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...rgb(MUTED));
  doc.text(todayStr(), PAGE_W - MARGIN, 20, { align: "right" });
  doc.setDrawColor(...rgb(LINE));
  doc.setLineWidth(0.2);
  doc.line(MARGIN, 25, PAGE_W - MARGIN, 25);

  // Orange markör + mono-etikett
  doc.setFillColor(...rgb(ORANGE));
  doc.circle(MARGIN + 1.2, 47, 1.2, "F");
  monoLabel(doc, "AI-karta · Personlig analys", MARGIN + 5, 48.5);

  // Titel
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...rgb(INK));
  const titleLines = doc.splitTextToSize(pdfSafe(`Er AI-plan, ${company}`), CONTENT_W);
  let ty = 62;
  for (const line of titleLines) {
    doc.text(line, MARGIN, ty);
    ty += 12;
  }

  // Underrad
  const subBits = [
    meta.contact_name && `Sammanställd för ${meta.contact_name}`,
    meta.industry,
    meta.employee_count && `${meta.employee_count} anställda`,
  ].filter(Boolean).join(" · ");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...rgb(MUTED));
  doc.text(doc.splitTextToSize(pdfSafe(subBits || "Baserad på era svar i AI-kartan"), CONTENT_W), MARGIN, ty + 2);
  ty += 12;

  // Tre sifferkort
  const sorted = [...result.processes].sort((a, b) => costPerMonth(b) - costPerMonth(a));
  const totalW = result.totalSavedPerWeek ?? sorted.reduce((s, p) => s + hoursPerWeek(p), 0);
  const perMonth = Math.round(totalW * WEEKS_PER_MONTH * 10) / 10;
  const krMonth = Math.round(totalW * WEEKS_PER_MONTH * HOURLY_RATE);
  const krYear = krMonth * 12;

  const gap = 5;
  const w = (CONTENT_W - gap * 2) / 3;
  const h = 30;
  const y0 = ty + 6;
  const stats: { label: string; value: string; accent: RGB }[] = [
    { label: "Tid som går åt / vecka", value: `${Math.round(totalW * 10) / 10} h`, accent: INK },
    { label: "Kostnad / månad", value: fmtKr(krMonth), accent: ORANGE },
    { label: "Kostnad / år", value: fmtKr(krYear), accent: GREEN },
  ];
  stats.forEach((s, i) => {
    const x = MARGIN + i * (w + gap);
    doc.setFillColor(...rgb(CARD));
    doc.setDrawColor(...rgb(LINE));
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y0, w, h, 2.5, 2.5, "FD");
    doc.setFillColor(...rgb(s.accent));
    doc.rect(x, y0, w, 2, "F");
    monoLabel(doc, s.label, x + 4, y0 + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...rgb(INK));
    doc.text(pdfSafe(s.value), x + 4, y0 + 20);
  });

  // Introtext
  const cur: Cursor = { y: y0 + h + 12 };
  const intro = result.ai_analysis?.executive_summary
    ? result.ai_analysis.executive_summary
    : `Ni har kartlagt ${result.processes.length} ${result.processes.length === 1 ? "process" : "processer"} hos ${company}. Tillsammans binder de ungefär ${Math.round(totalW * 10) / 10} timmar i veckan – motsvarande ${fmtKr(krMonth)} i månaden räknat på ${HOURLY_RATE} kr/h. I den här rapporten ser ni vad varje process kostar, vilken som bör automatiseras först och vad ett första bygge kostar.`;
  paragraph(doc, cur, intro, company, { size: 11, lineH: 5.6 });

  // "Så läser du kartan"
  cur.y += 4;
  const guideW = (CONTENT_W - 10) / 3;
  const guide: { n: string; t: string }[] = [
    { n: "01", t: "Se vad processerna kostar idag – i timmar och kronor." },
    { n: "02", t: "Välj första bygget utifrån återbetalningstid." },
    { n: "03", t: "Boka 20 min – vi pekar ut exakt första steget." },
  ];
  guide.forEach((g, i) => {
    const x = MARGIN + i * (guideW + 5);
    doc.setFillColor(...rgb(ORANGE_SOFT));
    doc.roundedRect(x, cur.y, guideW, 22, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...rgb(ORANGE));
    doc.text(g.n, x + 4, cur.y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    doc.setTextColor(...rgb(INK));
    const lines = doc.splitTextToSize(g.t, guideW - 8);
    doc.text(lines.slice(0, 2), x + 4, cur.y + 12.5);
  });

  // Baslinje på omslaget
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...rgb(MUTED));
  doc.text(pdfSafe(`Räknat på ${HOURLY_RATE} kr/h intern arbetstid och 4,3 veckor per månad. Kartan är gratis och er att behålla.`), MARGIN, PAGE_H - 26, { align: "left" });
}

// ---------- SIDA 2: KOSTNAD IDAG (STAPELGRAF) ----------
function costChartPage(doc: jsPDF, result: AiMapResult, company: string) {
  doc.addPage();
  const cur: Cursor = { y: 0 };
  addPageHeader(doc, cur, company);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...rgb(INK));
  doc.text("Vad det kostar er idag", MARGIN, cur.y);
  cur.y += 8;
  paragraph(doc, cur, `Processerna rankade efter månadskostnad – intern tid omräknad till ${HOURLY_RATE} kr/h.`, company, { color: MUTED, size: 10 });
  cur.y += 2;

  const ranked = [...result.processes]
    .map((p) => ({ p, cost: costPerMonth(p) }))
    .filter((r) => r.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 6);
  const maxCost = ranked[0]?.cost ?? 1;

  const labelW = 62;
  const barX = MARGIN + labelW;
  const barMaxW = CONTENT_W - labelW - 26;
  const rowH = 15;

  ranked.forEach((r, i) => {
    ensureSpace(doc, cur, rowH, company);
    const y = cur.y;
    // etikett
    doc.setFont("helvetica", i === 0 ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...rgb(INK));
    const name = doc.splitTextToSize(pdfSafe(r.p.process_name), labelW - 4);
    doc.text(name.slice(0, 2), MARGIN, y + 4);
    // spår + stapel
    doc.setFillColor(...rgb(LINE));
    doc.roundedRect(barX, y, barMaxW, 7, 3.5, 3.5, "F");
    const wBar = Math.max(3, (r.cost / maxCost) * barMaxW);
    doc.setFillColor(...rgb(i === 0 ? ORANGE : i === 1 ? GREEN : [140, 145, 150]));
    doc.roundedRect(barX, y, wBar, 7, 3.5, 3.5, "F");
    // värde
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(fmtKr(r.cost), barX + barMaxW + 23, y + 5, { align: "right" });
    // timmar under stapeln
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...rgb(MUTED));
    doc.text(pdfSafe(`${hoursPerWeek(r.p)} h/vecka · ${FREQ_LABELS[r.p.frequency]}`), barX, y + 12);
    cur.y += rowH;
  });

  if (ranked.length === 0) {
    paragraph(doc, cur, "Ingen tidsuppskattning angavs – kostnaden kan inte räknas ut per process.", company, { color: MUTED });
  }

  // Topp-3 tabell
  cur.y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...rgb(INK));
  ensureSpace(doc, cur, 14, company);
  doc.text("Era hetaste områden", MARGIN, cur.y);
  cur.y += 6;

  result.top3.forEach((p, i) => {
    const tier = tierForProcess(p);
    const pb = paybackMonths(p);
    const rowH2 = 13;
    ensureSpace(doc, cur, rowH2, company);
    doc.setFillColor(...rgb(CARD));
    doc.setDrawColor(...rgb(LINE));
    doc.setLineWidth(0.25);
    doc.roundedRect(MARGIN, cur.y, CONTENT_W, rowH2, 2, 2, "FD");
    // rank
    doc.setFillColor(...rgb(i === 0 ? ORANGE : INK));
    doc.circle(MARGIN + 6, cur.y + rowH2 / 2, 2.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), MARGIN + 6, cur.y + rowH2 / 2 + 1.6, { align: "center" });
    // namn
    doc.setFontSize(9.5);
    doc.setTextColor(...rgb(INK));
    doc.text(doc.splitTextToSize(pdfSafe(p.process_name), 74)[0], MARGIN + 13, cur.y + rowH2 / 2 + 1.8);
    // nivå + pris
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...rgb(MUTED));
    doc.text(pdfSafe(`${TIERS[tier].label} · ${TIERS[tier].priceLabel}`), MARGIN + 92, cur.y + rowH2 / 2 + 1.8);
    // återbetalning
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...rgb(GREEN));
    doc.text(pb ? pdfSafe(`betalar sig på ~${pb} mån`) : "–", PAGE_W - MARGIN - 5, cur.y + rowH2 / 2 + 1.8, { align: "right" });
    cur.y += rowH2 + 3;
  });
}

// ---------- SIDA 3: TOPP 3 I DETALJ ----------
function processCardsPage(doc: jsPDF, result: AiMapResult, company: string) {
  doc.addPage();
  const cur: Cursor = { y: 0 };
  addPageHeader(doc, cur, company);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...rgb(INK));
  doc.text(result.top3.length > 1 ? "Era topp-3 – i detalj" : "Ert hetaste område – i detalj", MARGIN, cur.y);
  cur.y += 10;

  const findCase = (name: string) =>
    result.ai_analysis?.cases?.find((c) => c.process_name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null;

  result.top3.forEach((p, i) => {
    const tier = tierForProcess(p);
    const tierMeta = TIERS[tier];
    const monthly = costPerMonth(p);
    const pb = paybackMonths(p);
    const aiCase = findCase(p.process_name);

    // Kortets höjd uppskattas löpande – börja på ny sida om det inte rymmer grunden
    ensureSpace(doc, cur, 60, company);
    const cardY = cur.y;

    // Sidomarkör
    doc.setFillColor(...rgb(i === 0 ? ORANGE : INK));
    doc.rect(MARGIN, cardY, 1.6, 10, "F");

    // Titel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(...rgb(INK));
    doc.text(doc.splitTextToSize(pdfSafe(`#${i + 1}  ${p.process_name}`), CONTENT_W - 60), MARGIN + 6, cardY + 6);
    // Nivå-chip
    doc.setFontSize(8);
    const chipText = pdfSafe(`${tierMeta.label} · ${tierMeta.priceLabel}`);
    const chipW = doc.getTextWidth(chipText) + 8;
    doc.setFillColor(...rgb(INK));
    doc.roundedRect(PAGE_W - MARGIN - chipW, cardY, chipW, 7, 3.5, 3.5, "F");
    doc.setTextColor(...rgb(PAPER));
    doc.setFont("helvetica", "bold");
    doc.text(chipText, PAGE_W - MARGIN - chipW / 2, cardY + 4.8, { align: "center" });
    cur.y = cardY + 14;

    // Pengarad
    if (monthly > 0) {
      doc.setFillColor(...rgb(ORANGE_SOFT));
      const pbText = pb ? ` · betalar sig på ~${pb} mån` : "";
      const moneyText = pdfSafe(`Kostar idag ~${fmtKr(monthly)}/mån (${hoursPerWeek(p)} h/vecka × ${HOURLY_RATE} kr)${pbText}`);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.6);
      const mw = Math.min(CONTENT_W, doc.getTextWidth(moneyText) + 10);
      doc.roundedRect(MARGIN + 6, cur.y, mw, 7.5, 2, 2, "F");
      doc.setTextColor(...rgb(INK));
      doc.text(moneyText, MARGIN + 11, cur.y + 5.2);
      cur.y += 11;
    }

    // Meta-rad
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...rgb(MUTED));
    doc.text(pdfSafe(`${FREQ_LABELS[p.frequency]} · ${TIME_LABELS[p.weekly_time]} · Score ${p.score} p`), MARGIN + 6, cur.y);
    cur.y += 6;

    paragraph(doc, cur, `Rekommendation: ${p.recommended_solution}`, company, { size: 9.8, x: MARGIN + 6, width: CONTENT_W - 6 });
    paragraph(doc, cur, `Första steget: ${p.next_step}`, company, { size: 9.8, color: MUTED, x: MARGIN + 6, width: CONTENT_W - 6 });

    if (aiCase?.quick_wins?.length) {
      cur.y += 1;
      monoLabel(doc, "Snabba vinster", MARGIN + 6, cur.y, GREEN);
      cur.y += 4.5;
      for (const qw of aiCase.quick_wins.slice(0, 3)) {
        doc.setFillColor(...rgb(GREEN));
        doc.circle(MARGIN + 8, cur.y - 1.3, 1, "F");
        paragraph(doc, cur, qw, company, { size: 9.3, x: MARGIN + 13, width: CONTENT_W - 13, lineH: 4.6 });
      }
    }
    cur.y += 6;
  });
}

// ---------- SIDA 4: FÖRSTA BYGGET ----------
const TIER_BUILD: Record<TierKey, { title: string; includes: string[] }> = {
  prototyp: {
    title: "Prototyp – bevisa värdet på 1–2 veckor",
    includes: [
      "Klickbar/testbar version av flödet på era riktiga exempel",
      "Mätning av tidsbesparing mot dagens arbetssätt",
      "Beslutsunderlag: skala vidare eller lägg ner billigt",
    ],
  },
  mvp: {
    title: "MVP – skarp drift i ett avgränsat flöde",
    includes: [
      "Fungerande automation kopplad på era system",
      "Människa-godkänner-steg där det behövs",
      "Drift, loggning och uppföljning av sparad tid",
    ],
  },
  saas: {
    title: "SaaS – ett komplett internt system",
    includes: [
      "Flera flöden i samma system med roller och behörigheter",
      "Integrationer mot befintliga system och datakällor",
      "Drift, övervakning och vidareutveckling över tid",
    ],
  },
};

function buildPlanPage(doc: jsPDF, result: AiMapResult, company: string) {
  const top = result.top3[0];
  if (!top) return;
  const tier = tierForProcess(top);
  const tierMeta = TIERS[tier];
  const plan = TIER_BUILD[tier];
  const pb = paybackMonths(top);

  doc.addPage();
  const cur: Cursor = { y: 0 };
  addPageHeader(doc, cur, company);

  monoLabel(doc, "Rekommenderat första bygge", MARGIN, cur.y, ORANGE);
  cur.y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...rgb(INK));
  const titleLines = doc.splitTextToSize(pdfSafe(top.process_name), CONTENT_W);
  for (const line of titleLines.slice(0, 2)) {
    doc.text(line, MARGIN, cur.y);
    cur.y += 9;
  }
  cur.y += 4;

  // Pris + återbetalning-kort
  doc.setFillColor(...rgb(GREEN_SOFT));
  doc.setDrawColor(...rgb(GREEN));
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, 22, 2.5, 2.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...rgb(GREEN));
  doc.text(pdfSafe(`${tierMeta.label} · Fast pris ${tierMeta.priceLabel}`), MARGIN + 6, cur.y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...rgb(INK));
  doc.text(pdfSafe(pb ? `Återbetalning på ~${pb} mån – sedan är besparingen er varje månad.` : "Fast pris – exakt omfattning sätts före start."), MARGIN + 6, cur.y + 16);
  cur.y += 30;

  // Vad som byggs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...rgb(INK));
  doc.text(pdfSafe(plan.title), MARGIN, cur.y);
  cur.y += 7;
  for (const inc of plan.includes) {
    doc.setFillColor(...rgb(ORANGE));
    doc.circle(MARGIN + 1.5, cur.y - 1.3, 1, "F");
    paragraph(doc, cur, inc, company, { size: 10, x: MARGIN + 7, width: CONTENT_W - 7 });
  }
  cur.y += 4;

  // 4-veckorsplan
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...rgb(INK));
  doc.text("Så går det till – fyra veckor", MARGIN, cur.y);
  cur.y += 7;

  const weeks: { w: string; t: string }[] = [
    { w: "Vecka 1", t: "Kickoff 30 min. Vi kartlägger flödet i detalj och designar lösningen tillsammans med er." },
    { w: "Vecka 2", t: "Vi bygger. Ni ser en första version och ger feedback i vardagslaget." },
    { w: "Vecka 3", t: "Test med skarpa fall. Vi justerar tills flödet håller i verkligheten." },
    { w: "Vecka 4", t: "Lansering. Vi mäter sparad tid från dag ett – och ni bestämmer nästa steg." },
  ];
  weeks.forEach((wk) => {
    ensureSpace(doc, cur, 12, company);
    doc.setFillColor(...rgb(CARD));
    doc.setDrawColor(...rgb(LINE));
    doc.setLineWidth(0.25);
    doc.roundedRect(MARGIN, cur.y, CONTENT_W, 10, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...rgb(ORANGE));
    doc.text(wk.w.toUpperCase(), MARGIN + 5, cur.y + 6.4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...rgb(INK));
    doc.text(doc.splitTextToSize(pdfSafe(wk.t), CONTENT_W - 42)[0], MARGIN + 38, cur.y + 6.4);
    cur.y += 13;
  });

  // Det behövs från er
  cur.y += 4;
  monoLabel(doc, "Det vi behöver från er", MARGIN, cur.y);
  cur.y += 5;
  const needs = [
    "30 minuter för kickoff – vi sköter resten",
    top.systems ? `Tillgång till: ${top.systems}` : "Tillgång till de system som rör processen",
    "En person som kan testa på riktiga fall (ca 1 timme)",
  ];
  for (const n of needs) {
    doc.setFillColor(...rgb(INK));
    doc.circle(MARGIN + 1.5, cur.y - 1.3, 1, "F");
    paragraph(doc, cur, n, company, { size: 9.8, x: MARGIN + 7, width: CONTENT_W - 7 });
  }
}

// ---------- SIDA 5: NÄSTA STEG ----------
function ctaPage(doc: jsPDF, result: AiMapResult, company: string, shareUrl?: string) {
  doc.addPage();
  const cur: Cursor = { y: 0 };
  addPageHeader(doc, cur, company);

  // Mörkt CTA-kort (höjd räknas ut från innehållet)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const ctaBody = doc.splitTextToSize(
    pdfSafe("Boka 20 minuter så går vi igenom er karta tillsammans. Jag visar konkret hur första bygget ser ut för just er – tid, pris och vad som händer vecka ett. Inga köpkrav."),
    CONTENT_W - 16
  );
  const cardH = 24 + ctaBody.length * 5 + 24;

  doc.setFillColor(...rgb(INK));
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, cardH, 3, 3, "F");
  doc.setFillColor(...rgb(ORANGE));
  doc.rect(MARGIN, cur.y, CONTENT_W, 2.4, "F");

  let y = cur.y + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...rgb(PAPER));
  doc.text("Vill ni se första bygget – live?", MARGIN + 8, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(210, 212, 216);
  for (const line of ctaBody) {
    doc.text(line, MARGIN + 8, y);
    y += 5;
  }
  y += 4;

  // Knapp
  const btnLabel = "Boka 20 min – gratis";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  const btnW = doc.getTextWidth(btnLabel) + 14;
  doc.setFillColor(...rgb(ORANGE));
  doc.roundedRect(MARGIN + 8, y, btnW, 10, 5, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(btnLabel, MARGIN + 8 + btnW / 2, y + 6.8, { align: "center" });
  // Klickbar yta över knappen
  const link = shareUrl || "https://auroramedia.se/ai-karta";
  doc.link(MARGIN + 8, y, btnW, 10, { url: link });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(210, 212, 216);
  doc.text("christoffer@auroramedia.se", PAGE_W - MARGIN - 8, y + 6.8, { align: "right" });
  cur.y += cardH + 12;

  // Om Aurora
  monoLabel(doc, "Om Aurora Media", MARGIN, cur.y);
  cur.y += 6;
  paragraph(
    doc,
    cur,
    "Aurora Media är en AI-byrå i Linköping som bygger AI-system, appar och automationer för svenska företag. Vi driver sju egna produkter i skarp drift – samma stack som vi bygger åt kunder. Fast pris, första versionen på veckor, och koden äger ni själva.",
    company,
    { size: 10, color: MUTED }
  );

  if (shareUrl) {
    cur.y += 2;
    monoLabel(doc, "Er karta online", MARGIN, cur.y);
    cur.y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...rgb(GREEN));
    const short = shareUrl.replace(/^https?:\/\//, "");
    doc.textWithLink(pdfSafe(short), MARGIN, cur.y, { url: shareUrl });
    cur.y += 6;
    doc.setFontSize(8.5);
    doc.setTextColor(...rgb(MUTED));
    doc.text(pdfSafe("Spara länken – där kan ni alltid se kartan igen och ladda ner den här PDF:en."), MARGIN, cur.y);
  }
}

// ---------- SIDFOT ----------
function addFooters(doc: jsPDF, company: string) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...rgb(LINE));
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...rgb(MUTED));
    doc.text(pdfSafe(`Aurora Media · AI-karta för ${company} · auroramedia.se`), MARGIN, PAGE_H - 9);
    doc.text(`Sida ${i} av ${total}`, PAGE_W - MARGIN, PAGE_H - 9, { align: "right" });
  }
}

// ---------- PUBLIK API ----------
export interface AiMapPdfOptions {
  shareUrl?: string | null;
}

export function aiMapPdfFilename(result: AiMapResult): string {
  return `aurora-ai-karta-${slugifyCompany(result.meta.company_name)}.pdf`;
}

export function buildAiMapPdf(result: AiMapResult, opts: AiMapPdfOptions = {}): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const company = normalizeCompanyName(result.meta.company_name);

  coverPage(doc, result, company);
  costChartPage(doc, result, company);
  processCardsPage(doc, result, company);
  buildPlanPage(doc, result, company);
  ctaPage(doc, result, company, opts.shareUrl ?? undefined);
  addFooters(doc, company);

  return doc;
}

export function downloadAiMapPdf(result: AiMapResult, opts: AiMapPdfOptions = {}) {
  const doc = buildAiMapPdf(result, opts);
  doc.save(aiMapPdfFilename(result));
}

export function aiMapPdfBase64(result: AiMapResult, opts: AiMapPdfOptions = {}): string {
  const doc = buildAiMapPdf(result, opts);
  const uri = doc.output("datauristring");
  return uri.slice(uri.indexOf(",") + 1);
}

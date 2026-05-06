// Rich PDF export of the AI-karta result. Uses jsPDF directly so we don't
// rely on the browser print dialog (which gave a generic, off-brand layout).
import { jsPDF } from "jspdf";
import {
  AiMapResult,
  FREQ_LABELS,
  TIME_LABELS,
  YPN_LABELS,
  VALUE_LABELS,
  ScoredProcess,
} from "@/lib/aiMap";

// Aurora brand-ish palette (dark theme translated to a print-friendly look).
const COLOR_BG = [12, 16, 28] as const;          // deep navy for hero
const COLOR_CARD = [248, 250, 252] as const;     // soft white card
const COLOR_TEXT = [17, 24, 39] as const;        // near-black body
const COLOR_MUTED = [107, 114, 128] as const;    // muted gray
const COLOR_PRIMARY = [56, 189, 248] as const;   // aurora cyan
const COLOR_ACCENT = [139, 92, 246] as const;    // aurora violet
const COLOR_BORDER = [226, 232, 240] as const;
const COLOR_SUCCESS = [34, 197, 94] as const;
const COLOR_SUCCESS_BG = [220, 252, 231] as const;
const COLOR_WARNING = [251, 146, 60] as const;
const COLOR_CHIP_BG = [238, 242, 255] as const;
const COLOR_CHIP_BORDER = [199, 210, 254] as const;

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;

interface Cursor { y: number; page: number; }

function hex(c: readonly number[]) { return c as unknown as [number, number, number]; }

function normalizeCompanyName(name: string): string {
  if (!name) return "ert företag";
  const trimmed = name.trim();
  if (trimmed === trimmed.toLowerCase() || trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((w) => {
        if (/^(ab|hb|kb|as)$/i.test(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
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
  return new Date().toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ensureSpace(doc: jsPDF, cur: Cursor, needed: number) {
  if (cur.y + needed > PAGE_H - 22) {
    doc.addPage();
    cur.page += 1;
    cur.y = MARGIN + 4;
    addPageHeader(doc, cur);
  }
}

function addPageHeader(doc: jsPDF, cur: Cursor) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...hex(COLOR_PRIMARY));
  doc.text("AURORA MEDIA · AI-KARTAN", MARGIN, MARGIN);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...hex(COLOR_MUTED));
  doc.text(todayStr(), PAGE_W - MARGIN, MARGIN, { align: "right" });
  doc.setDrawColor(...hex(COLOR_BORDER));
  doc.setLineWidth(0.2);
  doc.line(MARGIN, MARGIN + 2, PAGE_W - MARGIN, MARGIN + 2);
  cur.y = MARGIN + 10;
}

function heading(doc: jsPDF, cur: Cursor, text: string, size = 16) {
  ensureSpace(doc, cur, size + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(...hex(COLOR_TEXT));
  doc.text(text, MARGIN, cur.y);
  cur.y += size * 0.45 + 4;
}

function subheading(doc: jsPDF, cur: Cursor, text: string) {
  ensureSpace(doc, cur, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...hex(COLOR_ACCENT));
  doc.text(text.toUpperCase(), MARGIN, cur.y);
  cur.y += 5;
}

function paragraph(doc: jsPDF, cur: Cursor, text: string, opts: { size?: number; color?: readonly number[]; bold?: boolean; width?: number; x?: number } = {}) {
  const size = opts.size ?? 10.5;
  const width = opts.width ?? CONTENT_W;
  const x = opts.x ?? MARGIN;
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...hex(opts.color ?? COLOR_TEXT));
  const lines = doc.splitTextToSize(text, width);
  for (const line of lines) {
    ensureSpace(doc, cur, size * 0.45 + 1);
    doc.text(line, x, cur.y);
    cur.y += size * 0.45 + 1;
  }
  cur.y += 2;
}

function bullet(doc: jsPDF, cur: Cursor, text: string) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...hex(COLOR_TEXT));
  const lines = doc.splitTextToSize(text, CONTENT_W - 6);
  ensureSpace(doc, cur, 6);
  doc.setFillColor(...hex(COLOR_PRIMARY));
  doc.circle(MARGIN + 1.5, cur.y - 1.4, 1, "F");
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) ensureSpace(doc, cur, 5);
    doc.text(lines[i], MARGIN + 6, cur.y);
    cur.y += 4.8;
  }
  cur.y += 1;
}

function card(doc: jsPDF, cur: Cursor, height: number, draw: (cur: Cursor) => void) {
  ensureSpace(doc, cur, height + 4);
  doc.setFillColor(...hex(COLOR_CARD));
  doc.setDrawColor(...hex(COLOR_BORDER));
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, height, 3, 3, "FD");
  const inner = { ...cur, y: cur.y + 6 };
  draw(inner);
  cur.y += height + 5;
}

function statBox(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string, accent: readonly number[]) {
  // shadow
  doc.setFillColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  doc.roundedRect(x + 0.5, y + 0.5, w, h, 2.5, 2.5, "F");
  // body
  doc.setFillColor(...hex(COLOR_CARD));
  doc.setDrawColor(...hex(COLOR_BORDER));
  doc.roundedRect(x, y, w, h, 2.5, 2.5, "FD");
  // accent strip
  doc.setFillColor(...hex(accent));
  doc.rect(x, y, w, 2.2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...hex(COLOR_MUTED));
  doc.text(label.toUpperCase(), x + 4, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...hex(COLOR_TEXT));
  doc.text(value, x + 4, y + 19);
}

function painChips(doc: jsPDF, cur: Cursor, items: string[]) {
  const filtered = items.filter((i) => i && i.trim().toLowerCase() !== "annat");
  if (!filtered.length) return;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let x = MARGIN;
  let y = cur.y + 2;
  for (const item of filtered) {
    const w = doc.getTextWidth(item) + 8;
    if (x + w > PAGE_W - MARGIN) { x = MARGIN; y += 8.5; }
    doc.setFillColor(...hex(COLOR_CHIP_BG));
    doc.setDrawColor(...hex(COLOR_CHIP_BORDER));
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y - 4.5, w, 6.8, 3, 3, "FD");
    doc.setTextColor(...hex(COLOR_TEXT));
    doc.text(item, x + 4, y);
    x += w + 3;
  }
  cur.y = y + 6;
}

function maturityDots(doc: jsPDF, x: number, y: number, level: number) {
  for (let i = 0; i < 5; i++) {
    if (i < level) {
      doc.setFillColor(...hex(COLOR_ACCENT));
      doc.circle(x + i * 5, y, 1.5, "F");
    } else {
      doc.setDrawColor(...hex(COLOR_BORDER));
      doc.setFillColor(255, 255, 255);
      doc.circle(x + i * 5, y, 1.5, "FD");
    }
  }
}

function maturityLevelFromText(t: string): number {
  const s = (t || "").toLowerCase();
  if (s.includes("mycket hög") || s.includes("mycket hog")) return 5;
  if (s.includes("hög") || s.includes("hog")) return 4;
  if (s.includes("medel")) return 3;
  if (s.includes("låg") || s.includes("lag")) return 2;
  if (s.includes("mycket låg") || s.includes("mycket lag")) return 1;
  return 3;
}

function topSectionTitle(n: number): string {
  if (n <= 1) return "Ert högst rankade AI-område";
  if (n === 2) return "Era topp 2 AI-områden";
  return "Era topp-3 AI-områden";
}

function potentialPillColor(potential: string): readonly number[] {
  const p = potential.toLowerCase();
  if (p.startsWith("direkt")) return COLOR_SUCCESS;
  if (p.startsWith("pågående") || p.startsWith("pagaende")) return COLOR_WARNING;
  return COLOR_MUTED;
}

function shortPotential(p: string): string {
  return p.replace(/AI-case/i, "").replace(/\s+/g, " ").trim();
}

function weeklyHoursForP(p: ScoredProcess): number {
  // Map TIME labels to hours
  const map: Record<string, number> = {
    "<1h": 0.5,
    "1-3h": 2,
    "3-5h": 4,
    "5-10h": 7.5,
    "10h+": 12,
  };
  const label = TIME_LABELS[p.weekly_time] ?? "";
  for (const k of Object.keys(map)) if (label.includes(k)) return map[k];
  return 0;
}

function metaStats(doc: jsPDF, cur: Cursor, p: ScoredProcess) {
  const items = [
    { label: "Frekvens", value: FREQ_LABELS[p.frequency] },
    { label: "Tid/v", value: TIME_LABELS[p.weekly_time] },
    { label: "Regelstyrd", value: YPN_LABELS[p.rule_based] },
    { label: "Data", value: YPN_LABELS[p.data_available] },
    { label: "Värde", value: VALUE_LABELS[p.business_value] },
  ];
  const gap = 3;
  const w = (CONTENT_W - gap * 4) / 5;
  const h = 12;
  ensureSpace(doc, cur, h + 4);
  items.forEach((it, i) => {
    const x = MARGIN + i * (w + gap);
    doc.setFillColor(...hex(COLOR_CARD));
    doc.setDrawColor(...hex(COLOR_BORDER));
    doc.setLineWidth(0.2);
    doc.roundedRect(x, cur.y, w, h, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...hex(COLOR_MUTED));
    doc.text(it.label.toUpperCase(), x + 2, cur.y + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...hex(COLOR_TEXT));
    const val = doc.splitTextToSize(it.value, w - 4)[0] || "";
    doc.text(val, x + 2, cur.y + 9.5);
  });
  cur.y += h + 4;
}

function savingsBanner(doc: jsPDF, cur: Cursor, p: ScoredProcess) {
  const wk = weeklyHoursForP(p);
  if (wk <= 0) return;
  const yr = Math.round(wk * 46);
  ensureSpace(doc, cur, 10);
  doc.setFillColor(...hex(COLOR_SUCCESS_BG));
  doc.setDrawColor(...hex(COLOR_SUCCESS));
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, 8, 2, 2, "FD");
  // checkmark dot
  doc.setFillColor(...hex(COLOR_SUCCESS));
  doc.circle(MARGIN + 4, cur.y + 4, 1.6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(21, 94, 56);
  doc.text(`Beräknad besparing: ~${wk} timmar/vecka  ·  ~${yr} timmar/år`, MARGIN + 9, cur.y + 5.6);
  cur.y += 11;
}

function nextStepCallout(doc: jsPDF, cur: Cursor, text: string) {
  const lines = doc.splitTextToSize(text, CONTENT_W - 12);
  const h = 10 + lines.length * 4.8;
  ensureSpace(doc, cur, h + 2);
  doc.setFillColor(...hex(COLOR_CARD));
  doc.setDrawColor(...hex(COLOR_BORDER));
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, h, 2, 2, "FD");
  doc.setFillColor(...hex(COLOR_PRIMARY));
  doc.rect(MARGIN, cur.y, 1.5, h, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...hex(COLOR_PRIMARY));
  doc.text("NÄSTA STEG", MARGIN + 6, cur.y + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...hex(COLOR_TEXT));
  let yy = cur.y + 10;
  for (const line of lines) {
    doc.text(line, MARGIN + 6, yy);
    yy += 4.8;
  }
  cur.y += h + 4;
}

function processBlock(doc: jsPDF, cur: Cursor, p: ScoredProcess, idx: number, deep?: { why_it_matters: string; deep_analysis: string; concrete_example: string; quick_wins: string[]; risks: string } | null) {
  // Title bar
  ensureSpace(doc, cur, 18);
  doc.setFillColor(...hex(COLOR_BG));
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, 14, 2.5, 2.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`#${idx + 1}  ${p.process_name}`, MARGIN + 5, cur.y + 9);
  // potential pill
  const label = shortPotential(p.potential);
  const pillColor = potentialPillColor(p.potential);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const pillW = doc.getTextWidth(label) + 6;
  const pillH = 6;
  const pillX = PAGE_W - MARGIN - 4 - pillW;
  const pillY = cur.y + 4;
  doc.setFillColor(...hex(pillColor));
  doc.roundedRect(pillX, pillY, pillW, pillH, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(label, pillX + pillW / 2, pillY + 4.3, { align: "center" });
  cur.y += 17;

  metaStats(doc, cur, p);
  savingsBanner(doc, cur, p);

  paragraph(doc, cur, `Rekommenderad lösning: ${p.recommended_solution}`, { bold: true });
  nextStepCallout(doc, cur, p.next_step);

  if (deep) {
    subheading(doc, cur, "Varför det spelar roll");
    paragraph(doc, cur, deep.why_it_matters);
    subheading(doc, cur, "Djupanalys");
    paragraph(doc, cur, deep.deep_analysis);
    subheading(doc, cur, "Konkret exempel");
    paragraph(doc, cur, deep.concrete_example);
    if (deep.quick_wins?.length) {
      subheading(doc, cur, "Snabba vinster");
      for (const qw of deep.quick_wins) bullet(doc, cur, qw);
    }
    subheading(doc, cur, "Risker att hantera");
    paragraph(doc, cur, deep.risks);
  }
  cur.y += 4;
}

function methodStep(doc: jsPDF, cur: Cursor, num: number, title: string, body: string) {
  const cardH = 24;
  ensureSpace(doc, cur, cardH + 4);
  doc.setFillColor(...hex(COLOR_CARD));
  doc.setDrawColor(...hex(COLOR_BORDER));
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, cardH, 2.5, 2.5, "FD");
  // number badge
  doc.setFillColor(...hex(COLOR_BG));
  doc.roundedRect(MARGIN + 3, cur.y + 3, 18, 18, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...hex(COLOR_PRIMARY));
  doc.text(String(num), MARGIN + 12, cur.y + 16, { align: "center" });
  // title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...hex(COLOR_TEXT));
  doc.text(title, MARGIN + 26, cur.y + 8);
  // body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...hex(COLOR_MUTED));
  const bodyLines = doc.splitTextToSize(body, CONTENT_W - 32);
  let yy = cur.y + 13;
  for (const line of bodyLines.slice(0, 3)) {
    doc.text(line, MARGIN + 26, yy);
    yy += 4.5;
  }
  cur.y += cardH + 3;
}

export function downloadAiMapPdf(result: AiMapResult) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur: Cursor = { y: 0, page: 1 };
  const company = normalizeCompanyName(result.meta.company_name);
  const today = todayStr();

  // ---------- HERO PAGE ----------
  const heroH = 88;
  doc.setFillColor(...hex(COLOR_BG));
  doc.rect(0, 0, PAGE_W, heroH, "F");
  doc.setFillColor(...hex(COLOR_PRIMARY));
  doc.rect(0, heroH, PAGE_W, 1.2, "F");
  doc.setFillColor(...hex(COLOR_ACCENT));
  doc.rect(0, heroH + 1.2, PAGE_W, 0.6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...hex(COLOR_PRIMARY));
  doc.text("AURORA MEDIA · AI-KARTAN", MARGIN, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 230, 245);
  doc.text(today, PAGE_W - MARGIN, 18, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  const title = doc.splitTextToSize(`AI-analys för ${company}`, CONTENT_W);
  let ty = 36;
  for (const line of title) {
    doc.text(line, MARGIN, ty);
    ty += 10;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(220, 230, 245);
  const sub = doc.splitTextToSize(
    `Sammanfattad analys av era processer, AI-potential och konkreta automatiseringsförslag. Framtagen åt ${result.meta.contact_name} (${result.meta.email}).`,
    CONTENT_W
  );
  for (const line of sub) {
    doc.text(line, MARGIN, ty);
    ty += 5;
  }

  // Mini sub-header strip
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...hex(COLOR_MUTED));
  doc.text("RAPPORT", MARGIN, heroH + 10);
  doc.text(today.toUpperCase(), PAGE_W - MARGIN, heroH + 10, { align: "right" });
  doc.setDrawColor(...hex(COLOR_BORDER));
  doc.setLineWidth(0.2);
  doc.line(MARGIN, heroH + 12, PAGE_W - MARGIN, heroH + 12);

  // Stat row
  const statY = heroH + 18;
  const statW = (CONTENT_W - 8) / 3;
  const hasSavings = (result.totalSavedPerWeek ?? 0) > 0;
  statBox(doc, MARGIN, statY, statW, 26, "Total AI-potential", result.total_potential, COLOR_PRIMARY);
  if (hasSavings) {
    statBox(doc, MARGIN + statW + 4, statY, statW, 26, "Tid sparad / vecka", `${result.totalSavedPerWeek ?? 0} h`, COLOR_ACCENT);
    statBox(doc, MARGIN + (statW + 4) * 2, statY, statW, 26, "Tid sparad / år", `${result.totalSavedPerYear ?? 0} h`, COLOR_SUCCESS);
  } else {
    statBox(doc, MARGIN + statW + 4, statY, statW, 26, "AI-områden", `${result.processes.length}`, COLOR_ACCENT);
    statBox(doc, MARGIN + (statW + 4) * 2, statY, statW, 26, "I topp-listan", `${result.top3.length}`, COLOR_SUCCESS);
  }

  cur.y = statY + 34;

  if (result.ai_analysis?.executive_summary) {
    heading(doc, cur, "Sammanfattning", 14);
    // tinted background + accent line
    const txt = result.ai_analysis.executive_summary;
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(txt, CONTENT_W - 10);
    const boxH = lines.length * 5 + 8;
    ensureSpace(doc, cur, boxH + 2);
    doc.setFillColor(...hex(COLOR_CARD));
    doc.setDrawColor(...hex(COLOR_BORDER));
    doc.roundedRect(MARGIN, cur.y, CONTENT_W, boxH, 2, 2, "FD");
    doc.setFillColor(...hex(COLOR_PRIMARY));
    doc.rect(MARGIN, cur.y, 1, boxH, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...hex(COLOR_TEXT));
    let yy = cur.y + 6;
    for (const line of lines) {
      doc.text(line, MARGIN + 6, yy);
      yy += 5;
    }
    cur.y += boxH + 6;
  }

  if (result.ai_analysis?.maturity_note) {
    ensureSpace(doc, cur, 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...hex(COLOR_ACCENT));
    doc.text("A I - M O G N A D", MARGIN, cur.y);
    // dots
    const lvl = maturityLevelFromText(result.total_potential);
    maturityDots(doc, MARGIN + 40, cur.y - 1, lvl);
    cur.y += 4;
    paragraph(doc, cur, result.ai_analysis.maturity_note);
  }

  if (result.pain_areas?.length) {
    subheading(doc, cur, "Smärtområden ni lyfte");
    painChips(doc, cur, result.pain_areas);
  }

  // ---------- TOP AI-OMRÅDEN ----------
  doc.addPage();
  cur.page += 1;
  cur.y = MARGIN + 4;
  addPageHeader(doc, cur);
  heading(doc, cur, topSectionTitle(result.top3.length), 18);
  paragraph(doc, cur, "Här är processerna med högst AI-potential just nu, baserat på frekvens, tid, regelbundenhet, datatillgång och affärsvärde.", { color: COLOR_MUTED });

  const findCase = (name: string) =>
    result.ai_analysis?.cases?.find(c => c.process_name.trim().toLowerCase() === name.trim().toLowerCase()) ?? null;

  result.top3.forEach((p, i) => processBlock(doc, cur, p, i, findCase(p.process_name)));

  // ---------- ALL PROCESSES (compact) ----------
  if (result.processes.length > result.top3.length) {
    doc.addPage();
    cur.page += 1;
    cur.y = MARGIN + 4;
    addPageHeader(doc, cur);
    heading(doc, cur, "Alla kartlagda processer", 16);
    for (const p of result.processes) {
      card(doc, cur, 26, (inner) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...hex(COLOR_TEXT));
        doc.text(p.process_name, MARGIN + 5, inner.y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...hex(COLOR_MUTED));
        doc.text(`Potential: ${shortPotential(p.potential)}   ·   Score: ${p.score}`, PAGE_W - MARGIN - 5, inner.y, { align: "right" });
        const meta = `${FREQ_LABELS[p.frequency]} · ${TIME_LABELS[p.weekly_time]} · Regelstyrd: ${YPN_LABELS[p.rule_based]} · Data: ${YPN_LABELS[p.data_available]} · Värde: ${VALUE_LABELS[p.business_value]}`;
        const lines = doc.splitTextToSize(meta, CONTENT_W - 10);
        let yy = inner.y + 5;
        for (const line of lines) { doc.text(line, MARGIN + 5, yy); yy += 4.4; }
        doc.setTextColor(...hex(COLOR_TEXT));
        doc.text(doc.splitTextToSize(`Lösning: ${p.recommended_solution}`, CONTENT_W - 10)[0], MARGIN + 5, yy + 1);
      });
    }
  }

  // ---------- METHOD GUIDE & CTA ----------
  doc.addPage();
  cur.page += 1;
  cur.y = MARGIN + 4;
  addPageHeader(doc, cur);
  heading(doc, cur, "Så automatiserar ni", 18);
  paragraph(doc, cur, "Aurora Medias metodguide för att gå från idé till driftsatt AI-lösning – samma metod som vi använder med våra kunder.", { color: COLOR_MUTED });

  const playbook: { title: string; body: string }[] = [
    { title: "Välj första piloten med disciplin", body: "Börja med EN process med tydlig ägare, mätbar tidsbesparing och låg integrationskostnad. Det skapar fart och ett internt referensexempel." },
    { title: "Kartlägg data och system", body: "Säkerställ att data finns digitalt och åtkomstbart (CRM, mejl, Excel, ärendesystem). AI utan data är bara ett tomt skal." },
    { title: "Designa människa + AI tillsammans", body: "Bestäm var AI agerar autonomt och var en människa godkänner. Detta minskar risk och bygger förtroende internt." },
    { title: "Bygg minsta möjliga arbetsflöde", body: "Använd LLM, automation (n8n/Make/Zapier) och era befintliga system. Lansera i 2–4 veckor – inte 6 månader." },
    { title: "Mät, justera, skala", body: "Mät tid sparad, kvalitet och användarnöjdhet. När piloten levererar – skala till nästa process i er topp-lista." },
    { title: "Bygg en AI-färdplan", body: "Använd AI-kartan som levande dokument. Uppdatera kvartalsvis – nya processer dyker upp i takt med att personalen förstår vad AI kan." },
  ];
  playbook.forEach((item, i) => methodStep(doc, cur, i + 1, item.title, item.body));

  if (result.ai_analysis?.overall_recommendation) {
    heading(doc, cur, "Aurora Medias rekommendation", 14);
    paragraph(doc, cur, result.ai_analysis.overall_recommendation);
  }

  // CTA box
  ensureSpace(doc, cur, 46);
  const ctaH = 42;
  doc.setFillColor(...hex(COLOR_BG));
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, ctaH, 3, 3, "F");
  // accent overlay
  doc.setFillColor(30, 58, 110);
  doc.rect(MARGIN, cur.y, CONTENT_W, ctaH * 0.6, "F");
  // Re-draw bottom darker portion already covered by base; now title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Vill ni att vi bygger första piloten åt er?", MARGIN + 6, cur.y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(220, 230, 245);
  doc.text("Boka en kostnadsfri AI-genomlysning (45 min). Vi går igenom era svar och pekar ut bästa första pilot.", MARGIN + 6, cur.y + 20);

  // pill button
  const btnLabel = "Boka kostnadsfri AI-genomlysning  ->";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const btnW = doc.getTextWidth(btnLabel) + 10;
  const btnH = 8;
  const btnX = MARGIN + 6;
  const btnY = cur.y + ctaH - 14;
  doc.setFillColor(...hex(COLOR_PRIMARY));
  doc.roundedRect(btnX, btnY, btnW, btnH, 4, 4, "F");
  doc.setTextColor(...hex(COLOR_BG));
  doc.text(btnLabel, btnX + btnW / 2, btnY + 5.4, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 230, 245);
  doc.text("auroramedia.se  ·  info@auroramedia.se", PAGE_W - MARGIN - 6, btnY + 5.4, { align: "right" });

  cur.y += ctaH + 4;

  // ---------- FINAL FOOTER PASS (page X of Y) ----------
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...hex(COLOR_BORDER));
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...hex(COLOR_MUTED));
    doc.text("auroramedia.se · info@auroramedia.se", MARGIN, PAGE_H - 9);
    doc.text(`Sida ${i} av ${total}`, PAGE_W - MARGIN, PAGE_H - 9, { align: "right" });
  }

  doc.save(`aurora-ai-karta-${slugifyCompany(result.meta.company_name)}.pdf`);
}

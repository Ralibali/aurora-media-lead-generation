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

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;

interface Cursor { y: number; page: number; }

function hex(c: readonly number[]) { return c as unknown as [number, number, number]; }

function ensureSpace(doc: jsPDF, cur: Cursor, needed: number) {
  if (cur.y + needed > PAGE_H - 22) {
    addFooter(doc, cur);
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
  doc.setDrawColor(...hex(COLOR_BORDER));
  doc.setLineWidth(0.2);
  doc.line(MARGIN, MARGIN + 2, PAGE_W - MARGIN, MARGIN + 2);
  cur.y = MARGIN + 10;
}

function addFooter(doc: jsPDF, cur: Cursor) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...hex(COLOR_MUTED));
  doc.text("auroramedia.se · info@auroramedia.se", MARGIN, PAGE_H - 10);
  doc.text(`Sida ${cur.page}`, PAGE_W - MARGIN, PAGE_H - 10, { align: "right" });
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

function paragraph(doc: jsPDF, cur: Cursor, text: string, opts: { size?: number; color?: readonly number[]; bold?: boolean } = {}) {
  const size = opts.size ?? 10.5;
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(size);
  doc.setTextColor(...hex(opts.color ?? COLOR_TEXT));
  const lines = doc.splitTextToSize(text, CONTENT_W);
  for (const line of lines) {
    ensureSpace(doc, cur, size * 0.45 + 1);
    doc.text(line, MARGIN, cur.y);
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

function statBox(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string) {
  doc.setFillColor(...hex(COLOR_CARD));
  doc.setDrawColor(...hex(COLOR_BORDER));
  doc.roundedRect(x, y, w, h, 2.5, 2.5, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...hex(COLOR_MUTED));
  doc.text(label.toUpperCase(), x + 4, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...hex(COLOR_TEXT));
  doc.text(value, x + 4, y + 14);
}

function processBlock(doc: jsPDF, cur: Cursor, p: ScoredProcess, idx: number, deep?: { why_it_matters: string; deep_analysis: string; concrete_example: string; quick_wins: string[]; risks: string } | null) {
  // Title bar
  ensureSpace(doc, cur, 14);
  doc.setFillColor(...hex(COLOR_BG));
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, 11, 2.5, 2.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`#${idx + 1}  ${p.process_name}`, MARGIN + 4, cur.y + 7.2);
  doc.setTextColor(...hex(COLOR_PRIMARY));
  doc.text(`Potential: ${p.potential}`, PAGE_W - MARGIN - 4, cur.y + 7.2, { align: "right" });
  cur.y += 14;

  // Meta line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...hex(COLOR_MUTED));
  const meta = [
    `Frekvens: ${FREQ_LABELS[p.frequency]}`,
    `Tid: ${TIME_LABELS[p.weekly_time]}`,
    `Regelstyrd: ${YPN_LABELS[p.rule_based]}`,
    `Data: ${YPN_LABELS[p.data_available]}`,
    `Värde: ${VALUE_LABELS[p.business_value]}`,
  ].join("   ·   ");
  const metaLines = doc.splitTextToSize(meta, CONTENT_W);
  for (const line of metaLines) {
    ensureSpace(doc, cur, 4.5);
    doc.text(line, MARGIN, cur.y);
    cur.y += 4.5;
  }
  cur.y += 2;

  paragraph(doc, cur, `Rekommenderad lösning: ${p.recommended_solution}`, { bold: true });
  paragraph(doc, cur, `Nästa konkreta steg: ${p.next_step}`);

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

export function downloadAiMapPdf(result: AiMapResult) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur: Cursor = { y: 0, page: 1 };

  // ---------- HERO PAGE ----------
  doc.setFillColor(...hex(COLOR_BG));
  doc.rect(0, 0, PAGE_W, 110, "F");
  // Aurora gradient-ish accent bar
  doc.setFillColor(...hex(COLOR_PRIMARY));
  doc.rect(0, 110, PAGE_W, 1.2, "F");
  doc.setFillColor(...hex(COLOR_ACCENT));
  doc.rect(0, 111.2, PAGE_W, 0.6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...hex(COLOR_PRIMARY));
  doc.text("AURORA MEDIA · AI-KARTAN", MARGIN, 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  const title = doc.splitTextToSize(`AI-analys för ${result.meta.company_name}`, CONTENT_W);
  let ty = 40;
  for (const line of title) {
    doc.text(line, MARGIN, ty);
    ty += 11;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(220, 230, 245);
  const sub = doc.splitTextToSize(
    `Sammanfattad analys av era processer, AI-potential och konkreta automatiseringsförslag. Framtagen åt ${result.meta.contact_name} (${result.meta.email}).`,
    CONTENT_W
  );
  for (const line of sub) {
    doc.text(line, MARGIN, ty);
    ty += 5.5;
  }

  // Stat row
  const statY = 122;
  const statW = (CONTENT_W - 8) / 3;
  statBox(doc, MARGIN, statY, statW, 22, "Total AI-potential", result.total_potential);
  statBox(doc, MARGIN + statW + 4, statY, statW, 22, "Tid sparad / vecka", `${result.totalSavedPerWeek ?? 0} h`);
  statBox(doc, MARGIN + (statW + 4) * 2, statY, statW, 22, "Tid sparad / år", `${result.totalSavedPerYear ?? 0} h`);

  cur.y = statY + 32;

  if (result.ai_analysis?.executive_summary) {
    heading(doc, cur, "Sammanfattning", 14);
    paragraph(doc, cur, result.ai_analysis.executive_summary);
  }

  if (result.ai_analysis?.maturity_note) {
    subheading(doc, cur, "AI-mognad");
    paragraph(doc, cur, result.ai_analysis.maturity_note);
  }

  if (result.pain_areas?.length) {
    subheading(doc, cur, "Smärtområden ni lyfte");
    paragraph(doc, cur, result.pain_areas.join(" · "), { color: COLOR_MUTED });
  }

  // ---------- TOP 3 ----------
  doc.addPage();
  cur.page += 1;
  cur.y = MARGIN + 4;
  addPageHeader(doc, cur);
  heading(doc, cur, "Era topp-3 AI-case", 18);
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
        doc.text(`Potential: ${p.potential}   ·   Score: ${p.score}`, PAGE_W - MARGIN - 5, inner.y, { align: "right" });
        const meta = `${FREQ_LABELS[p.frequency]} · ${TIME_LABELS[p.weekly_time]} · Regelstyrd: ${YPN_LABELS[p.rule_based]} · Data: ${YPN_LABELS[p.data_available]} · Värde: ${VALUE_LABELS[p.business_value]}`;
        const lines = doc.splitTextToSize(meta, CONTENT_W - 10);
        let yy = inner.y + 5;
        for (const line of lines) { doc.text(line, MARGIN + 5, yy); yy += 4.4; }
        doc.setTextColor(...hex(COLOR_TEXT));
        doc.text(doc.splitTextToSize(`Lösning: ${p.recommended_solution}`, CONTENT_W - 10)[0], MARGIN + 5, yy + 1);
      });
    }
  }

  // ---------- HOW TO AUTOMATE ----------
  doc.addPage();
  cur.page += 1;
  cur.y = MARGIN + 4;
  addPageHeader(doc, cur);
  heading(doc, cur, "Så automatiserar ni ert företag", 18);
  paragraph(doc, cur, "Aurora Medias metodguide för att gå från idé till driftsatt AI-lösning – samma metod som vi använder med våra kunder.", { color: COLOR_MUTED });

  const playbook: { title: string; body: string }[] = [
    { title: "1. Välj första piloten med disciplin", body: "Börja med ETT case med tydlig ägare, mätbar tidsbesparing och låg integrationskostnad. Det skapar momentum och en intern referenscase." },
    { title: "2. Kartlägg data och system", body: "Säkerställ att data finns digitalt och åtkomstbart (CRM, mejl, Excel, ärendesystem). AI utan data är bara ett interface." },
    { title: "3. Designa människa + AI tillsammans", body: "Bestäm var AI agerar autonomt och var en människa godkänner. Detta minskar risk och bygger förtroende internt." },
    { title: "4. Bygg minsta möjliga arbetsflöde", body: "Använd LLM, automation (n8n/Make/Zapier) och era befintliga system. Lansera i 2–4 veckor – inte 6 månader." },
    { title: "5. Mät, justera, skala", body: "Mät tid sparad, kvalitet och användarnöjdhet. När piloten levererar – skala till nästa process i er topp-lista." },
    { title: "6. Bygg en AI-roadmap", body: "Använd AI-kartan som levande dokument. Uppdatera kvartalsvis – nya processer dyker upp i takt med att teamet förstår vad AI kan." },
  ];
  for (const item of playbook) {
    subheading(doc, cur, item.title);
    paragraph(doc, cur, item.body);
  }

  if (result.ai_analysis?.overall_recommendation) {
    heading(doc, cur, "Aurora Medias rekommendation", 14);
    paragraph(doc, cur, result.ai_analysis.overall_recommendation);
  }

  // CTA box
  ensureSpace(doc, cur, 38);
  doc.setFillColor(...hex(COLOR_BG));
  doc.roundedRect(MARGIN, cur.y, CONTENT_W, 32, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("Vill ni att vi bygger första piloten åt er?", MARGIN + 6, cur.y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(220, 230, 245);
  doc.text("Boka en kostnadsfri AI-genomlysning (45 min). Vi går igenom era svar och pekar ut bästa första pilot.", MARGIN + 6, cur.y + 18);
  doc.setTextColor(...hex(COLOR_PRIMARY));
  doc.setFont("helvetica", "bold");
  doc.text("auroramedia.se/kontakt  ·  info@auroramedia.se", MARGIN + 6, cur.y + 26);
  cur.y += 36;

  addFooter(doc, cur);

  const safeName = result.meta.company_name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "ai-karta";
  doc.save(`aurora-ai-karta-${safeName}.pdf`);
}

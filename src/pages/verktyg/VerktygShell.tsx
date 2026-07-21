import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Check, Copy, FileDown } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  VerkstadLayout,
  Reveal,
} from "@/components/verkstad/VerkstadLayout";
import {
  setSEOMeta,
  setBreadcrumb,
  setJsonLd,
  removeJsonLd,
  SITE_URL,
} from "@/lib/seoHelpers";
import { trackEvent } from "@/lib/analytics";

/* ─────────────────────────────────────────────────────────────
   ToolShell – gemensam layout för alla /verktyg-sidor.
   Nordisk Verkstad-designen. Enhetlig hero, breadcrumbs, FAQ.
   ───────────────────────────────────────────────────────────── */

export type ToolMeta = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  estimatedTime: string;
  faq: { q: string; a: string }[];
};

export const TOOLS: ToolMeta[] = [
  {
    slug: "ai-roi-kalkylator",
    title: "AI ROI-kalkylator",
    seoTitle: "AI ROI-kalkylator – räkna ut besparing & återbetalning | Aurora Media",
    description:
      "Räkna ut hur mycket AI och automation kan spara ert företag per år, återbetalningstid och 3-års nettovärde. Live-uppdaterat, gratis, utan inloggning.",
    intro:
      "Justera antaganden och se en transparent uppskattning av besparingar, återbetalningstid och nettovärde när ni automatiserar repetitivt arbete.",
    estimatedTime: "≈ 1 min",
    faq: [
      { q: "Hur räknas besparingen ut?", a: "Antal anställda × timmar/vecka × 46 arbetsveckor × timkostnad × automatiseringsgrad. Scenariot skalar automatiseringsgraden konservativt, realistiskt eller offensivt." },
      { q: "Är resultaten en offert?", a: "Nej. Kalkylatorn är en fingervisning för planering, inte en garanti eller offert." },
      { q: "Sparas något?", a: "Nej. Allt körs lokalt i webbläsaren. Om ni delar länken skickas endast siffrorna via URL:en." },
    ],
  },
  {
    slug: "app-prisraknare",
    title: "App-prisräknare",
    seoTitle: "App-prisräknare – vad kostar en app eller SaaS? | Aurora Media",
    description:
      "Uppskatta priset för app, SaaS eller intern plattform. Välj plattform, funktioner och integrationer och få ett transparent prisintervall och rekommenderat paket.",
    intro:
      "Konfigurera scope visuellt och se ett rimligt prisintervall baserat på Aurora Medias fasta paket. Ingen offert – bara en snabb fingervisning.",
    estimatedTime: "≈ 2 min",
    faq: [
      { q: "Är detta en bindande offert?", a: "Nej. Slutpriset sätts efter en kort scope-genomgång och kan avvika beroende på verkliga krav." },
      { q: "Ingår drift?", a: "Grundpriset avser bygget. Drift/hosting/underhåll tillkommer och prissätts separat." },
      { q: "Vad påverkar priset mest?", a: "Antal integrationer (Fortnox, Stripe m.fl.), inloggning/roller, offline-läge och antalet unika vyer." },
    ],
  },
  {
    slug: "seo-kalkylator",
    title: "SEO-kalkylator",
    seoTitle: "SEO-kalkylator – räkna ut potentiell omsättning från SEO | Aurora Media",
    description:
      "Se hur mycket extra omsättning och bruttovinst SEO kan ge er per månad och år, baserat på trafik, konvertering och ordervärde.",
    intro:
      "Ange dagens siffror och en realistisk trafikökning. Kalkylatorn räknar ut potentiell extra omsättning och bruttovinst per månad och år.",
    estimatedTime: "≈ 1 min",
    faq: [
      { q: "Vad är en rimlig trafikökning?", a: "20–60 % över 6–12 månader är vanligt för aktivt SEO-arbete på en liten sajt." },
      { q: "Räknas Google Ads in?", a: "Nej, kalkylatorn avser organisk trafik från sökmotorer." },
      { q: "Hur bör konverteringsgraden sättas?", a: "Använd faktisk siffra från Google Analytics – e-handel ligger ofta 1–3 %, B2B-leads 1–5 %." },
    ],
  },
  {
    slug: "ai-mognadsanalys",
    title: "AI-mognadsanalys",
    seoTitle: "AI-mognadsanalys – gratis test i wizard-format | Aurora Media",
    description:
      "Testa er AI-mognad i en tydlig steg-för-steg-wizard. Få nivå, poäng, styrkor, risker och en konkret 30-dagars handlingsplan – gratis och utan inloggning.",
    intro:
      "Gå igenom tio korta frågor i en wizard. Ni får en poäng, en mognadsnivå, era styrkor, risker och en konkret 30-dagars handlingsplan.",
    estimatedTime: "≈ 3 min",
    faq: [
      { q: "Sparas svaren?", a: "Nej, allt körs lokalt i webbläsaren. Inget skickas till oss." },
      { q: "Vad menas med mognad?", a: "Hur väl företaget är rustat att införa och drifta AI-lösningar på ett tryggt sätt." },
      { q: "Hur tolkas nivåerna?", a: "Nivå 1 är utforskande, nivå 5 är operationaliserad AI i kärnprocesser." },
    ],
  },
  {
    slug: "personalkostnad-vs-ai",
    title: "Personalkostnad vs AI",
    seoTitle: "Personalkostnad vs AI – jämför årskostnad | Aurora Media",
    description:
      "Jämför årlig personalkostnad med AI/automation baserat på lön, sociala avgifter och driftkostnad. Se frigjord kapacitet – syftet är inte att ersätta människor.",
    intro:
      "Jämför årlig personalkostnad med kostnaden för AI/automation. Målet är att frigöra kapacitet till kvalificerat arbete – inte att ersätta människor.",
    estimatedTime: "≈ 1 min",
    faq: [
      { q: "Är AI en ersättning för personal?", a: "Nej. Kalkylen visar frigjord kapacitet som kan läggas på mer värdeskapande arbete." },
      { q: "Vad är rimlig andel automatiserbart?", a: "10–40 % av administrativt/repetitivt arbete är vanligt beroende på roll." },
      { q: "Räknas semester in?", a: "Ja, kalkylen använder 12 månader × månadslön inkl. sociala avgifter." },
    ],
  },
  {
    slug: "prompt-generator",
    title: "Prompt-generator",
    seoTitle: "Prompt-generator – bygg strukturerade AI-prompts på svenska | Aurora Media",
    description:
      "Generera strukturerade svenska AI-prompts för ChatGPT, Claude och Gemini. Välj mall, roll, mål, ton, detaljnivå och outputstruktur. Kopiera på ett klick.",
    intro:
      "Välj en mall, justera parametrar och få en tydlig, strukturerad prompt på svenska som fungerar i ChatGPT, Claude, Gemini och Copilot.",
    estimatedTime: "≈ 2 min",
    faq: [
      { q: "Skickas något till en AI-tjänst?", a: "Nej. Prompten byggs lokalt i webbläsaren." },
      { q: "Funkar den för alla AI-verktyg?", a: "Ja, strukturen fungerar bra i ChatGPT, Claude, Gemini och Copilot." },
      { q: "Hur mäts prompt-kvaliteten?", a: "En enkel checklista räknar hur många nyckelkomponenter (roll, mål, målgrupp, ton, begränsningar, exempel, output) som är ifyllda." },
    ],
  },
];

export const toolByslug = (slug: string) => TOOLS.find((t) => t.slug === slug)!;

/* ────────── Shared UI primitives ────────── */

export const CopyButton = ({
  text,
  label = "Kopiera",
  event,
  onCopied,
}: {
  text: string;
  label?: string;
  event?: string;
  onCopied?: () => void;
}) => {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className={`vk-copybtn ${ok ? "ok" : ""}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          if (event) trackEvent(event);
          onCopied?.();
          setTimeout(() => setOk(false), 1800);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {ok ? <Check size={13} /> : <Copy size={13} />}
      {ok ? "Kopierat" : label}
    </button>
  );
};

export type Scenario = "konservativ" | "realistisk" | "offensiv";
export const SCENARIO_FACTOR: Record<Scenario, number> = {
  konservativ: 0.7,
  realistisk: 1,
  offensiv: 1.3,
};

export const ScenarioSwitcher = ({
  value,
  onChange,
  event,
}: {
  value: Scenario;
  onChange: (s: Scenario) => void;
  event?: string;
}) => (
  <div className="vk-scenario" role="tablist" aria-label="Välj scenario">
    {(["konservativ", "realistisk", "offensiv"] as Scenario[]).map((s) => (
      <button
        key={s}
        type="button"
        role="tab"
        aria-pressed={value === s}
        onClick={() => {
          onChange(s);
          if (event) trackEvent(event, { scenario: s });
        }}
      >
        {s}
      </button>
    ))}
  </div>
);

export const NumberField = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
}) => {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="vk-field">
      <label htmlFor={id} className="vk-field-label">
        <span>{label}{suffix ? ` (${suffix})` : ""}</span>
        {hint && <span className="vk-field-hint">{hint}</span>}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        className="vk-input"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
};

export const Metric = ({
  label,
  value,
  hero = false,
  span2 = false,
}: {
  label: string;
  value: string;
  hero?: boolean;
  span2?: boolean;
}) => (
  <div className={`vk-metric ${hero ? "hero" : ""} ${span2 ? "span-2" : ""}`}>
    <div className="vk-metric-label">{label}</div>
    <div className="vk-metric-value">{value}</div>
  </div>
);

export const ProgressBar = ({
  value,
  max,
  warn = false,
}: {
  value: number;
  max: number;
  warn?: boolean;
}) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="vk-bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`vk-bar-fill ${warn ? "warn" : ""}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

/* ────────── Verktyg 2.0 – slider, presets, PDF, grafer ────────── */

export const fmtKr = (n: number) =>
  new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(n));

export const SliderField = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
  hint,
  format,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  hint?: string;
  format?: (n: number) => string;
}) => {
  const id = label.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const display = format ? format(value) : `${new Intl.NumberFormat("sv-SE").format(value)}${suffix ? ` ${suffix}` : ""}`;
  return (
    <div className="vk-slider-field">
      <div className="vk-slider-head">
        <label htmlFor={id} className="vk-slider-label">{label}</label>
        <span className="vk-slider-value">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        className="vk-slider"
        style={{ ["--fill" as string]: `${Math.min(100, Math.max(0, fill))}%` }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={display}
      />
      {hint && <div className="vk-slider-hint">{hint}</div>}
    </div>
  );
};

export const PresetChips = ({
  presets,
  onPick,
  event,
}: {
  presets: { label: string; values: Record<string, number | string> }[];
  onPick: (values: Record<string, number | string>) => void;
  event?: string;
}) => (
  <div className="vk-presets" role="group" aria-label="Färdiga exempel">
    {presets.map((p) => (
      <button
        key={p.label}
        type="button"
        className="vk-preset"
        onClick={() => {
          onPick(p.values);
          if (event) trackEvent(event, { preset: p.label });
        }}
      >
        {p.label}
      </button>
    ))}
  </div>
);

export const PdfButton = ({
  title,
  subtitle,
  lines,
  filename,
  event,
}: {
  title: string;
  subtitle?: string;
  lines: string[];
  filename: string;
  event?: string;
}) => {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="vk-copybtn"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const { jsPDF } = await import("jspdf");
          const doc = new jsPDF({ unit: "pt", format: "a4" });
          const margin = 56;
          const pageW = doc.internal.pageSize.getWidth();
          let y = 64;

          // Header
          doc.setFillColor(15, 81, 50);
          doc.rect(0, 0, pageW, 6, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(120, 128, 136);
          doc.text("AURORA MEDIA AB · AURORAMEDIA.SE", margin, y);
          y += 30;
          doc.setFontSize(22);
          doc.setTextColor(20, 23, 26);
          doc.text(title, margin, y);
          y += 24;
          if (subtitle) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(74, 80, 88);
            doc.text(doc.splitTextToSize(subtitle, pageW - margin * 2), margin, y);
            y += 18 * (doc.splitTextToSize(subtitle, pageW - margin * 2).length) + 6;
          }
          doc.setDrawColor(226, 224, 218);
          doc.line(margin, y, pageW - margin, y);
          y += 24;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
          for (const raw of lines) {
            const wrapped: string[] = raw.trim()
              ? doc.splitTextToSize(raw, pageW - margin * 2)
              : [""];
            for (const w of wrapped) {
              if (y > 780) {
                doc.addPage();
                y = 64;
              }
              if (/^(Årsbesparing|Netto|Frigjord|Extra|Prisintervall|Rekommenderat|Poäng|Nivå)/.test(w)) {
                doc.setFont("helvetica", "bold");
                doc.setTextColor(15, 81, 50);
              } else {
                doc.setFont("helvetica", "normal");
                doc.setTextColor(20, 23, 26);
              }
              doc.text(w, margin, y);
              y += 18;
            }
          }

          const pageH = doc.internal.pageSize.getHeight();
          doc.setFontSize(9);
          doc.setTextColor(140, 146, 152);
          doc.text(
            `Skapad ${new Date().toLocaleDateString("sv-SE")} · Förenklad uppskattning – inte en offert · info@auroramedia.se`,
            margin,
            pageH - 32,
          );
          doc.save(filename);
          if (event) trackEvent(event);
        } catch {
          /* PDF blockerad */
        } finally {
          setBusy(false);
        }
      }}
    >
      <FileDown size={13} /> {busy ? "Skapar…" : "Spara PDF"}
    </button>
  );
};

/* ── Grafer (recharts) ── */

const CHART_GRAN = "#0F5132";
const CHART_VARSEL = "#E8500A";
const CHART_MUT = "#9AA1A9";

export type ChartPoint = { name: string; [key: string]: number | string };

const ChartTooltip = ({ active, payload, label, kr }: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
  kr?: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E0DA", borderRadius: 10,
      padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 12, boxShadow: "0 8px 24px rgba(20,23,26,.12)",
    }}>
      {label !== undefined && <div style={{ marginBottom: 6, color: "#4A5058", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color || CHART_GRAN, fontWeight: 600 }}>
          {p.name}: {kr ? `${fmtKr(Number(p.value))} kr` : new Intl.NumberFormat("sv-SE").format(Number(p.value))}
        </div>
      ))}
    </div>
  );
};

export const AreaChartPanel = ({
  title,
  data,
  series,
  breakEvenLabel,
  height = 240,
  kr = true,
}: {
  title: string;
  data: ChartPoint[];
  series: { key: string; label: string; color?: string }[];
  breakEvenLabel?: string;
  height?: number;
  kr?: boolean;
}) => (
  <div className="vk-chart">
    <div className="vk-chart-title"><span>{title}</span>{breakEvenLabel && <span style={{ color: CHART_VARSEL }}>{breakEvenLabel}</span>}</div>
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#E2E0DA" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART_MUT, fontFamily: "Spline Sans Mono" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_MUT, fontFamily: "Spline Sans Mono" }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v: number) => (kr ? `${Math.round(v / 1000)}k` : String(v))}
        />
        <Tooltip content={<ChartTooltip kr={kr} />} />
        {breakEvenLabel && <ReferenceLine y={0} stroke={CHART_VARSEL} strokeDasharray="4 3" />}
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color || CHART_GRAN}
            fill={s.color || CHART_GRAN}
            fillOpacity={0.12}
            strokeWidth={2.5}
            dot={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
    <div className="vk-chart-legend">
      {series.map((s) => (
        <span key={s.key}><i style={{ background: s.color || CHART_GRAN }} />{s.label}</span>
      ))}
    </div>
  </div>
);

export const BarComparePanel = ({
  title,
  data,
  series,
  height = 220,
  kr = true,
}: {
  title: string;
  data: ChartPoint[];
  series: { key: string; label: string; color?: string }[];
  height?: number;
  kr?: boolean;
}) => (
  <div className="vk-chart">
    <div className="vk-chart-title"><span>{title}</span></div>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barGap={6}>
        <CartesianGrid stroke="#E2E0DA" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART_MUT, fontFamily: "Spline Sans Mono" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_MUT, fontFamily: "Spline Sans Mono" }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v: number) => (kr ? `${Math.round(v / 1000)}k` : String(v))}
        />
        <Tooltip content={<ChartTooltip kr={kr} />} cursor={{ fill: "rgba(15,81,50,.05)" }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color || CHART_GRAN} radius={[6, 6, 0, 0]} maxBarSize={42} />
        ))}
      </BarChart>
    </ResponsiveContainer>
    <div className="vk-chart-legend">
      {series.map((s) => (
        <span key={s.key}><i style={{ background: s.color || CHART_GRAN }} />{s.label}</span>
      ))}
    </div>
  </div>
);

export const RadarPanel = ({
  title,
  data,
  height = 300,
}: {
  title: string;
  data: { topic: string; score: number }[];
  height?: number;
}) => (
  <div className="vk-chart">
    <div className="vk-chart-title"><span>{title}</span><span>0–2 per område</span></div>
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#E2E0DA" />
        <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10.5, fill: "#4A5058", fontFamily: "Spline Sans Mono" }} />
        <Radar dataKey="score" stroke={CHART_GRAN} fill={CHART_GRAN} fillOpacity={0.25} strokeWidth={2} />
        <Tooltip content={<ChartTooltip kr={false} />} />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

export const DriverBars = ({ items, kr = true }: { items: { label: string; value: number }[]; kr?: boolean }) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="vk-driver">
      {items.map((i) => (
        <div className="vk-driver-row" key={i.label}>
          <span className="dl">{i.label}</span>
          <span className="dv">{kr ? `${fmtKr(i.value)} kr` : i.value}</span>
          <span className="vk-driver-bar"><i style={{ width: `${(i.value / max) * 100}%` }} /></span>
        </div>
      ))}
    </div>
  );
};

/* ────────── Shell ────────── */

export const ToolShell = ({
  meta,
  children,
  ctaHref,
  ctaLabel,
}: {
  meta: ToolMeta;
  children: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
}) => {
  useEffect(() => {
    setSEOMeta({
      title: meta.seoTitle,
      description: meta.description,
      canonical: `/verktyg/${meta.slug}`,
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Verktyg", url: "/verktyg" },
      { name: meta.title, url: `/verktyg/${meta.slug}` },
    ]);
    setJsonLd(`tool-${meta.slug}-schema`, {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: meta.title,
      url: `${SITE_URL}/verktyg/${meta.slug}`,
      description: meta.description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      inLanguage: "sv-SE",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "SEK" },
      publisher: { "@id": `${SITE_URL}/#organization` },
    });
    setJsonLd(`tool-${meta.slug}-faq`, {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: meta.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    trackEvent("verktyg_view", { tool: meta.slug });
    return () => {
      removeJsonLd(`tool-${meta.slug}-schema`);
      removeJsonLd(`tool-${meta.slug}-faq`);
    };
  }, [meta]);

  return (
    <VerkstadLayout>
      <section className="vk-section vk-tool-hero">
        <div className="vk-wrap">
          <nav aria-label="Brödsmulor" className="vk-tool-crumb">
            <Link to="/">Hem</Link>
            <ChevronRight size={12} className="vk-tool-crumb-sep" />
            <Link to="/verktyg">Verktyg</Link>
            <ChevronRight size={12} className="vk-tool-crumb-sep" />
            <span>{meta.title}</span>
          </nav>
          <Reveal>
            <p className="vk-mono">Verktyg · {meta.estimatedTime} · gratis</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 style={{ marginTop: 20, maxWidth: "18ch" }}>{meta.title}</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ marginTop: 24, maxWidth: "60ch", fontSize: 18, color: "var(--granbark-mut)" }}>
              {meta.intro}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="vk-section" style={{ paddingTop: 0 }}>
        <div className="vk-wrap">{children}</div>
      </section>

      <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
        <div className="vk-wrap" style={{ maxWidth: 820 }}>
          <span className="vk-mono">Vanliga frågor</span>
          <h2 style={{ marginTop: 12 }}>Det ni behöver veta.</h2>
          <div className="vk-faq" style={{ marginTop: 32 }}>
            {meta.faq.map((f) => (
              <details key={f.q} className="vk-faq-item" style={{ padding: "6px 0" }}>
                <summary
                  className="vk-faq-q"
                  style={{ listStyle: "none", cursor: "pointer" }}
                >
                  {f.q}
                </summary>
                <p className="vk-faq-a">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="vk-mono" style={{ marginTop: 24, maxWidth: "60ch" }}>
            Disclaimer: verktyget ger en förenklad uppskattning för planering.
            Resultaten är inte en garanti, prognos eller offert.
          </p>
          {ctaHref && (
            <div style={{ marginTop: 32 }}>
              <Link
                to={ctaHref}
                className="vk-btn vk-btn-primary"
                onClick={() => trackEvent("verktyg_shell_cta", { tool: meta.slug, target: ctaHref })}
              >
                {ctaLabel ?? "Läs mer"} →
              </Link>
            </div>
          )}
        </div>
      </section>
    </VerkstadLayout>
  );
};

export default ToolShell;

/* Bakåtkompatibilitet – tidigare namn */
export const VerktygShell = ToolShell;

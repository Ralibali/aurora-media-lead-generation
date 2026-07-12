import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Check, Copy } from "lucide-react";
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

export const Bar = ({
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

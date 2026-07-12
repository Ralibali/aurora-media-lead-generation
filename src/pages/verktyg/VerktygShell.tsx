import { ReactNode, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { setSEOMeta, setBreadcrumb, setJsonLd, removeJsonLd, SITE_URL } from "@/lib/seoHelpers";

export type ToolMeta = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  faq: { q: string; a: string }[];
};

export const TOOLS: ToolMeta[] = [
  {
    slug: "ai-roi-kalkylator",
    title: "AI ROI-kalkylator",
    seoTitle: "AI ROI-kalkylator – räkna ut besparing & återbetalning | Aurora Media",
    description:
      "Räkna ut hur mycket AI och automation kan spara ert företag per år, återbetalningstid och 3-års nettovärde. Gratis kalkylator utan inloggning.",
    intro:
      "Fyll i några få siffror och se en transparent uppskattning av besparingar, återbetalningstid och nettovärde när ni automatiserar repetitivt arbete.",
    faq: [
      {
        q: "Hur räknas besparingen ut?",
        a: "Antal anställda × timmar/vecka repetitivt arbete × 46 arbetsveckor × timkostnad × automatiseringsgrad.",
      },
      {
        q: "Är resultaten en offert?",
        a: "Nej. Kalkylatorn är en fingervisning för planering, inte en garanti eller offert.",
      },
    ],
  },
  {
    slug: "app-prisraknare",
    title: "App-prisräknare",
    seoTitle: "App-prisräknare – vad kostar en app eller SaaS? | Aurora Media",
    description:
      "Uppskatta priset för app, SaaS eller intern plattform. Välj funktioner, integrationer och tidsram och få ett transparent prisintervall.",
    intro:
      "Konfigurera scope och se ett rimligt prisintervall baserat på Aurora Medias fasta paket. Ingen offert – bara en snabb fingervisning.",
    faq: [
      { q: "Är detta en bindande offert?", a: "Nej. Slutpriset sätts efter en kort scope-genomgång." },
      { q: "Ingår drift?", a: "Grundpriset avser bygget. Drift/hosting tillkommer beroende på lösning." },
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
    faq: [
      { q: "Vad är en rimlig trafikökning?", a: "20–60 % över 6–12 månader är vanligt för aktivt SEO-arbete på en liten sajt." },
      { q: "Räknas Google Ads in?", a: "Nej, kalkylatorn avser organisk trafik från sökmotorer." },
    ],
  },
  {
    slug: "ai-mognadsanalys",
    title: "AI-mognadsanalys",
    seoTitle: "AI-mognadsanalys – gratis test på 2 minuter | Aurora Media",
    description:
      "Testa er AI-mognad på 2 minuter. Få en poäng, nivå 1–5 och tre konkreta nästa steg – helt gratis och utan inloggning.",
    intro:
      "Svara på 10 korta frågor. Ni får en poäng, en mognadsnivå och tre konkreta rekommendationer att jobba vidare med.",
    faq: [
      { q: "Sparas svaren?", a: "Nej, allt körs lokalt i webbläsaren. Inget skickas till oss." },
      { q: "Vad menas med mognad?", a: "Hur väl företaget är rustat att införa och drifta AI-lösningar på ett tryggt sätt." },
    ],
  },
  {
    slug: "personalkostnad-vs-ai",
    title: "Personalkostnad vs AI",
    seoTitle: "Personalkostnad vs AI – jämför årskostnad | Aurora Media",
    description:
      "Jämför årlig personalkostnad med AI/automation baserat på lön, sociala avgifter och driftkostnad. Se potentialen utan att ersätta människor.",
    intro:
      "Jämför årlig personalkostnad med kostnaden för AI/automation. Målet är att frigöra tid till kvalificerat arbete – inte att ersätta människor.",
    faq: [
      { q: "Är AI en ersättning för personal?", a: "Nej. Kalkylen visar frigjord tid som kan läggas på mer värdeskapande arbete." },
      { q: "Vad är rimlig andel automatiserbart?", a: "10–40 % av administrativt/repetitivt arbete är vanligt." },
    ],
  },
  {
    slug: "prompt-generator",
    title: "Prompt-generator",
    seoTitle: "Prompt-generator – bygg strukturerade AI-prompts på svenska | Aurora Media",
    description:
      "Generera strukturerade svenska AI-prompts för ChatGPT, Claude och Gemini. Fyll i mål, roll, målgrupp och ton – kopiera resultatet med ett klick.",
    intro:
      "Fyll i formuläret – vi bygger en tydlig, strukturerad prompt på svenska som fungerar i ChatGPT, Claude och Gemini.",
    faq: [
      { q: "Skickas något till en AI-tjänst?", a: "Nej. Prompten byggs lokalt i webbläsaren." },
      { q: "Funkar den för alla AI-verktyg?", a: "Ja, strukturen fungerar bra i ChatGPT, Claude, Gemini och Copilot." },
    ],
  },
];

export const toolByslug = (slug: string) => TOOLS.find((t) => t.slug === slug)!;

export const VerktygShell = ({
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
    return () => {
      removeJsonLd(`tool-${meta.slug}-schema`);
      removeJsonLd(`tool-${meta.slug}-faq`);
    };
  }, [meta]);

  return (
    <NordicLayout>
      <section className="section">
        <div className="wrap max-w-4xl mx-auto px-6 pt-24 pb-8">
          <nav
            aria-label="Brödsmulor"
            className="flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground mb-6"
          >
            <Link to="/" className="hover:text-primary">Hem</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/verktyg" className="hover:text-primary">Verktyg</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{meta.title}</span>
          </nav>
          <Reveal>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
              {meta.title}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{meta.intro}</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap max-w-4xl mx-auto px-6 pb-16">{children}</div>
      </section>

      <section className="section">
        <div className="wrap max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">Vanliga frågor</h2>
          <div className="space-y-4">
            {meta.faq.map((f) => (
              <details
                key={f.q}
                className="rounded-2xl border border-border bg-secondary/40 p-5 open:bg-secondary/60 transition"
              >
                <summary className="cursor-pointer font-semibold text-foreground">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-xs text-muted-foreground max-w-2xl leading-relaxed">
            <strong>Disclaimer:</strong> Kalkylatorn ger en förenklad uppskattning för planering.
            Resultaten är inte en garanti, prognos eller offert. Verkligt utfall beror på
            verksamhet, marknadsläge och genomförande.
          </p>
          {ctaHref && (
            <div className="mt-8">
              <Link
                to={ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
              >
                {ctaLabel ?? "Läs mer"} →
              </Link>
            </div>
          )}
        </div>
      </section>
    </NordicLayout>
  );
};

export default VerktygShell;

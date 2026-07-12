import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Bot, TrendingUp, Sparkles, Users, MessageSquare } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { setSEOMeta, setBreadcrumb, setJsonLd, removeJsonLd, SITE_URL } from "@/lib/seoHelpers";
import { trackEvent } from "@/lib/analytics";
import { TOOLS } from "./VerktygShell";

const ICONS: Record<string, typeof Calculator> = {
  "ai-roi-kalkylator": Calculator,
  "app-prisraknare": Sparkles,
  "seo-kalkylator": TrendingUp,
  "ai-mognadsanalys": Bot,
  "personalkostnad-vs-ai": Users,
  "prompt-generator": MessageSquare,
};

const VerktygIndex = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Gratis verktyg – kalkylatorer, ROI och AI-mognad | Aurora Media",
      description:
        "Aurora Medias gratis verktyg för svenska företag: AI ROI-kalkylator, app-prisräknare, SEO-kalkylator, AI-mognadsanalys, personalkostnadsjämförelse och prompt-generator.",
      canonical: "/verktyg",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Verktyg", url: "/verktyg" },
    ]);
    setJsonLd("verktyg-itemlist", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Aurora Media gratisverktyg",
      itemListElement: TOOLS.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/verktyg/${t.slug}`,
        name: t.title,
      })),
    });
    return () => removeJsonLd("verktyg-itemlist");
  }, []);

  return (
    <NordicLayout>
      <section className="section">
        <div className="wrap max-w-6xl mx-auto px-6 pt-24 pb-12">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              verktyg · gratis · ingen inloggning
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground max-w-3xl">
              Gratis verktyg för <span className="text-primary">AI, SaaS och tillväxt.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Kalkylatorer och mini-analyser byggda av Aurora Media. Allt fungerar lokalt i din
              webbläsare – inga konton, ingen data lämnar sidan.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap max-w-6xl mx-auto px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t, i) => {
              const Icon = ICONS[t.slug] ?? Calculator;
              return (
                <Reveal key={t.slug} delay={i * 0.05}>
                  <Link
                    to={`/verktyg/${t.slug}`}
                    onClick={() =>
                      trackEvent("verktyg_hub_click", { tool: t.slug })
                    }
                    className="group flex h-full flex-col justify-between rounded-3xl border border-border bg-secondary/40 p-6 transition hover:border-primary hover:bg-secondary/60"
                  >
                    <div>
                      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-foreground">{t.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Öppna verktyg <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </NordicLayout>
  );
};

export default VerktygIndex;

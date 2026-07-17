import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, Bot, TrendingUp, Sparkles, Users, MessageSquare } from "lucide-react";
import { VerkstadLayout, Reveal } from "@/components/verkstad/VerkstadLayout";
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

const OUTCOME: Record<string, string> = {
  "ai-roi-kalkylator": "Årsbesparing, payback och 3-årsvärde.",
  "app-prisraknare": "Prisintervall, rekommenderat paket och leveranstid.",
  "seo-kalkylator": "Extra trafik, order, omsättning och bruttovinst.",
  "ai-mognadsanalys": "Mognadsnivå, styrkor, risker och 30-dagarsplan.",
  "personalkostnad-vs-ai": "Frigjord kapacitet och nettovärde år 1–2.",
  "prompt-generator": "Färdig, strukturerad prompt på svenska.",
};

const VerktygIndex = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Gratis verktyg – kalkylatorer, ROI och AI-mognad | Aurora Media",
      description:
        "Aurora Medias gratis verktyg för svenska företag: AI ROI-kalkylator, app-prisräknare, SEO-kalkylator, AI-mognadsanalys, personalkostnadsjämförelse och prompt-generator. Allt körs lokalt i webbläsaren.",
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
    <VerkstadLayout>
      <section className="vk-section vk-tool-hero">
        <div className="vk-wrap">
          <Reveal>
            <p className="vk-mono">Verktyg · gratis · ingen inloggning</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 style={{ marginTop: 20, maxWidth: "16ch" }}>
              Räkna, jämför, planera. <span className="accent" style={{ color: "var(--gran)" }}>På minuter.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ marginTop: 24, maxWidth: "60ch", fontSize: 18, color: "var(--granbark-mut)" }}>
              Sex gratisverktyg byggda av Aurora Media – med live-grafer, scenarier
              och PDF-export. Allt körs lokalt i din webbläsare: inga konton,
              ingen data lämnar sidan.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="vk-section" style={{ paddingTop: 0 }}>
        <div className="vk-wrap">
          <div className="vk-hub-grid">
            {TOOLS.map((t, i) => {
              const Icon = ICONS[t.slug] ?? Calculator;
              return (
                <Reveal key={t.slug} delay={i * 0.05}>
                  <Link
                    to={`/verktyg/${t.slug}`}
                    onClick={() => trackEvent("verktyg_hub_click", { tool: t.slug })}
                    className="vk-hub-card"
                  >
                    <div>
                      <div className="vk-hub-icon"><Icon size={22} /></div>
                      <h2 className="vk-hub-title">{t.title}</h2>
                      <p className="vk-hub-desc">{OUTCOME[t.slug]}</p>
                    </div>
                    <div className="vk-hub-meta">
                      <span className="time">{t.estimatedTime}</span>
                      <span className="cta">Öppna <ArrowRight size={12} /></span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <div className="vk-trust" aria-label="Om verktygen">
            <div className="vk-trust-item">
              <span className="dot" />
              <div>
                <h5>Helt gratis</h5>
                <p>Ingen inloggning, ingen prenumeration, inga dolda kostnader.</p>
              </div>
            </div>
            <div className="vk-trust-item">
              <span className="dot" />
              <div>
                <h5>Kör i webbläsaren</h5>
                <p>All logik körs lokalt – ingen data lämnar din enhet.</p>
              </div>
            </div>
            <div className="vk-trust-item">
              <span className="dot" />
              <div>
                <h5>Byggt av Aurora Media</h5>
                <p>Svenska verktyg för svenska småföretag. Uppdateras löpande.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </VerkstadLayout>
  );
};

export default VerktygIndex;

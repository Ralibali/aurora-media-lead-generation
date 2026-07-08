import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Reveal, VkNav, VkFooter } from "@/pages/Index";
import { setBreadcrumb, setJsonLd, removeJsonLd, SITE_URL } from "@/lib/seoHelpers";
import "@/styles/verkstad.css";

const SECTIONS = [
  { h: "Vem skriver innehållet?", p: "Allt innehåll på auroramedia.se skrivs av Christoffer Holstensson, grundare av Aurora Media AB. Inga ghostwriters, inga generiska SEO-texter köpta utomlands." },
  { h: "Hur används AI i texterna?", p: "AI-verktyg används för att utkast-skriva, strukturera och redigera. Varje publicerad artikel går igenom manuell revision där AI-fluff stryks, konkreta exempel läggs till och viktiga siffror verifieras. Ingen artikel publiceras helt AI-genererad utan mänsklig granskning." },
  { h: "Faktakontroll", p: "Priser, leveranstider och statistik kommer från egna projekt eller publika källor som myndigheter och leverantörers prislistor. Externa källhänvisningar länkas direkt i texten." },
  { h: "Uppdateringar", p: "Varje artikel har ett uppdaterad-datum som speglar senaste verkliga genomgång. Artiklar äldre än sex månader granskas på nytt eller markeras som arkiverade." },
  { h: "Sponsring och affiliate", p: "Aurora Media tar inte emot betalning för att skriva positivt om verktyg. Inga affiliate-länkar. Om ett verktyg rekommenderas är det för att det används i egna projekt eller har ett verkligt värde för målgruppen." },
  { h: "Rättelser", p: "Hittar du ett fel? Mejla info@auroramedia.se. Vi rättar inom 48 timmar när felet är bekräftat." },
  { h: "Källor och referenser", p: "Siffror från externa källor länkas direkt i texten. Vid avsaknad av extern källa är påståendet baserat på konkret erfarenhet — det skrivs ut tydligt." },
];

const RedaktionellPolicy = () => {
  useEffect(() => {
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Redaktionell policy", url: "/redaktionell-policy" }]);
    setJsonLd("policy-webpage", {
      "@context": "https://schema.org", "@type": "WebPage",
      name: "Redaktionell policy",
      url: `${SITE_URL}/redaktionell-policy`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "sv-SE",
    });
    return () => { removeJsonLd("breadcrumb-jsonld"); removeJsonLd("policy-webpage"); };
  }, []);

  return (
    <>
      <SEO
        title="Redaktionell policy – Aurora Media"
        description="Hur Aurora Media arbetar med innehåll, AI, faktakontroll och rättelser."
        canonical="/redaktionell-policy"
      />
      <div className="verkstad">
        <VkNav />
        <main id="main">
          <section className="vk-section vk-hero">
            <div className="vk-wrap" style={{ maxWidth: 760 }}>
              <Reveal>
                <p className="vk-mono">transparens · redaktion</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 style={{ marginTop: 18 }}>Redaktionell policy</h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p style={{ marginTop: 20, fontSize: 18, lineHeight: 1.65, color: "#3E444B", maxWidth: "56ch" }}>
                  Hur vi arbetar med innehåll, AI, fakta och rättelser. Senast uppdaterad{" "}
                  {new Date().toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })}.
                </p>
              </Reveal>

              <div style={{ marginTop: 48 }}>
                {SECTIONS.map((s, i) => (
                  <Reveal key={s.h} delay={Math.min(i * 0.03, 0.2)}>
                    <div style={{ paddingBlock: 32, borderBottom: "1px solid var(--linje)" }}>
                      <h2 style={{ fontSize: "clamp(20px, 2.4vw, 26px)", marginBottom: 14 }}>{s.h}</h2>
                      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3E444B" }}>{s.p}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--linje)" }}>
                <p className="vk-mono" style={{ marginBottom: 16 }}>läs vidare</p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    { to: "/om", label: "Om Aurora" },
                    { to: "/integritetspolicy", label: "Integritetspolicy" },
                    { to: "/blog", label: "Alla artiklar" },
                  ].map((r) => (
                    <Link
                      key={r.to}
                      to={r.to}
                      style={{ fontSize: 15, color: "var(--granbark)", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid var(--linje)", paddingBottom: 2 }}
                    >
                      {r.label} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default RedaktionellPolicy;

import { useEffect } from "react";
import { Link } from "react-router-dom";
import NordicLayout from "@/components/nordic/NordicLayout";
import { setSEOMeta, setBreadcrumb, setJsonLd, SITE_URL } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

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
    setSEOMeta({
      title: "Redaktionell policy – Aurora Media",
      description: "Hur Aurora Media arbetar med innehåll, AI, faktakontroll och rättelser.",
      canonical: "/redaktionell-policy",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Redaktionell policy", url: "/redaktionell-policy" }]);
    setJsonLd("policy-webpage", {
      "@context": "https://schema.org", "@type": "WebPage",
      name: "Redaktionell policy",
      url: `${SITE_URL}/redaktionell-policy`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "sv-SE",
    });
  }, []);

  return (
    <NordicLayout>
      <main id="main" style={{ paddingTop: "clamp(88px,12vw,120px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
        <div className="wrap" style={{ maxWidth: 700 }}>

          <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20 }}>transparens</p>
          <h1 style={{ fontFamily: F, fontSize: "clamp(28px,5vw,48px)", color: C, lineHeight: 1.05, letterSpacing: "-0.02em", fontWeight: 400, marginBottom: 12 }}>
            Redaktionell policy
          </h1>
          <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.45)", marginBottom: 48 }}>
            Hur vi arbetar med innehåll, AI, fakta och rättelser.{" "}
            Senast uppdaterad {new Date().toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })}.
          </p>

          {SECTIONS.map((s) => (
            <div key={s.h} style={{ paddingBlock: 28, borderBottom: "0.5px solid rgba(237,233,220,0.08)" }}>
              <h2 style={{ fontFamily: F, fontSize: "clamp(17px,2.2vw,22px)", color: C, marginBottom: 10, fontWeight: 400 }}>{s.h}</h2>
              <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.75, color: "rgba(237,233,220,0.65)" }}>{s.p}</p>
            </div>
          ))}

          <div style={{ marginTop: 40, paddingTop: 28, borderTop: "0.5px solid rgba(237,233,220,0.08)" }}>
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.30)", marginBottom: 16 }}>läs vidare</p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { to: "/om", label: "Om Aurora" },
                { to: "/integritetspolicy", label: "Integritetspolicy" },
                { to: "/blogg", label: "Alla artiklar" },
              ].map((r) => (
                <Link key={r.to} to={r.to}
                  style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.40)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.40)")}>
                  {r.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      </NordicLayout>
  );
};

export default RedaktionellPolicy;

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Reveal, VkNav, VkFooter } from "@/pages/Index";
import { setBreadcrumb, setJsonLd, removeJsonLd, SITE_URL } from "@/lib/seoHelpers";
import "@/styles/verkstad.css";

const UPDATED = "27 april 2026";

const SECTIONS = [
  { h: "1. Personuppgiftsansvarig", content: ["Aurora Media AB, org.nr 559272-0220, är personuppgiftsansvarig för behandlingen av personuppgifter som sker via denna webbplats, kontaktformulär, offertförfrågningar och digitala marknadsföringskanaler.", "Kontakt: info@auroramedia.se. Bolaget är baserat i Linköping, Sverige."] },
  { h: "2. Vilka personuppgifter vi behandlar", content: ["När du kontaktar oss kan vi behandla namn, e-post, telefonnummer, företagsnamn, webbplats, meddelanden samt uppgifter om vilken tjänst du är intresserad av.", "Vid besök på webbplatsen kan vi, beroende på dina cookieval, behandla IP-adress, enhetsinformation, webbläsare och användningsdata."] },
  { h: "3. Varför vi behandlar personuppgifter", content: ["Vi behandlar personuppgifter för att besvara förfrågningar, lämna offerter, boka möten, leverera våra tjänster och följa upp pågående dialoger.", "Vi kan även använda uppgifter för att förbättra webbplatsen, mäta annonsering och analysera efterfrågan."] },
  { h: "4. Laglig grund", content: ["Kontaktförfrågningar: berättigat intresse.", "Avtal: fullgörande av avtal.", "Bokföring: rättslig förpliktelse.", "Icke-nödvändiga cookies: samtycke."] },
  { h: "5. Cookies och analys", content: ["Webbplatsen kan använda tekniskt nödvändiga cookies och, efter samtycke, analysverktyg som Google Analytics och Meta Pixel.", "Vi strävar efter dataminimering och behandlar inga känsliga personuppgifter via spårning."] },
  { h: "6. Mottagare", content: ["Personuppgifter kan delas med leverantörer för hosting, e-post, CRM, analys och bokföring. De agerar personuppgiftsbiträden enligt våra instruktioner."] },
  { h: "7. Överföring utanför EU/EES", content: ["Vid överföring utanför EU/EES sker det med stöd av EU-kommissionens standardavtalsklausuler eller annat tillåtet rättsligt stöd."] },
  { h: "8. Lagringstid", content: ["Förfrågningar sparas så länge dialogen är aktiv. Kund- och avtalsuppgifter sparas enligt avtal och bokföringsregler."] },
  { h: "9. Dina rättigheter", content: ["Du har rätt till tillgång, rättelse, radering, begränsning, invändning och dataportabilitet. Kontakta info@auroramedia.se. Klagomål riktas till Integritetsskyddsmyndigheten (IMY)."] },
  { h: "10. Ändringar", content: ["Vi kan uppdatera denna policy när tjänster eller regler ändras. Den senaste versionen finns alltid på denna sida."] },
];

const Integritetspolicy = () => {
  useEffect(() => {
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Integritetspolicy", url: "/integritetspolicy" }]);
    setJsonLd("privacy-policy-webpage", {
      "@context": "https://schema.org", "@type": "WebPage",
      name: "Integritetspolicy",
      url: `${SITE_URL}/integritetspolicy`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "sv-SE", dateModified: "2026-04-27",
    });
    return () => { removeJsonLd("breadcrumb-jsonld"); removeJsonLd("privacy-policy-webpage"); };
  }, []);

  return (
    <>
      <SEO
        title="Integritetspolicy – Aurora Media AB"
        description="Hur Aurora Media behandlar personuppgifter, cookies, analys och annonsering."
        canonical="/integritetspolicy"
      />
      <div className="verkstad">
        <VkNav />
        <main id="main">
          <section className="vk-section vk-hero">
            <div className="vk-wrap" style={{ maxWidth: 760 }}>
              <Reveal>
                <p className="vk-mono">juridik · integritet</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 style={{ marginTop: 18 }}>Integritetspolicy</h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="vk-mono" style={{ marginTop: 16, color: "var(--granbark-mut)" }}>
                  Senast uppdaterad {UPDATED}
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <div
                  style={{
                    marginTop: 40,
                    padding: "24px 28px",
                    border: "1px solid var(--linje)",
                    borderRadius: 14,
                    background: "var(--bjork-djup)",
                  }}
                >
                  <p className="vk-mono" style={{ color: "var(--gran)" }}>Kort sammanfattning</p>
                  <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.7, color: "var(--granbark)" }}>
                    Vi samlar in uppgifter ni själva lämnar vid kontakt, samt teknisk data om ni godkänner cookies. Uppgifterna används för att svara på förfrågningar, leverera tjänster och förbättra webbplatsen.
                  </p>
                </div>
              </Reveal>

              <div style={{ marginTop: 48 }}>
                {SECTIONS.map((s, i) => (
                  <Reveal key={s.h} delay={Math.min(i * 0.03, 0.2)}>
                    <div style={{ paddingBlock: 32, borderBottom: "1px solid var(--linje)" }}>
                      <h2 style={{ fontSize: "clamp(20px, 2.4vw, 26px)", marginBottom: 14 }}>{s.h}</h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {s.content.map((p) => (
                          <p key={p} style={{ fontSize: 16, lineHeight: 1.7, color: "#3E444B" }}>{p}</p>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.1}>
                <div
                  style={{
                    marginTop: 48,
                    padding: "24px 28px",
                    border: "1px solid var(--linje)",
                    borderRadius: 14,
                    background: "#fff",
                  }}
                >
                  <h2 style={{ fontSize: 22, marginBottom: 10 }}>Kontakt</h2>
                  <p style={{ fontSize: 16, color: "#3E444B", lineHeight: 1.7 }}>
                    Frågor om personuppgifter:{" "}
                    <a href="mailto:info@auroramedia.se" style={{ color: "var(--gran)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
                      info@auroramedia.se
                    </a>
                  </p>
                </div>
              </Reveal>

              <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--linje)" }}>
                <p className="vk-mono" style={{ marginBottom: 16 }}>läs vidare</p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    { to: "/kontakt", label: "Kontakt" },
                    { to: "/redaktionell-policy", label: "Redaktionell policy" },
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

export default Integritetspolicy;

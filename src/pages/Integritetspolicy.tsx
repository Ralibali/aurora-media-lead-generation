import { useEffect } from "react";
import { Link } from "react-router-dom";
import NordicLayout from "@/components/nordic/NordicLayout";
import { setSEOMeta, setBreadcrumb, setJsonLd, SITE_URL } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";
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
    setSEOMeta({
      title: "Integritetspolicy – Aurora Media AB",
      description: "Hur Aurora Media behandlar personuppgifter, cookies, analys och annonsering.",
      canonical: "/integritetspolicy",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Integritetspolicy", url: "/integritetspolicy" }]);
    setJsonLd("privacy-policy-webpage", {
      "@context": "https://schema.org", "@type": "WebPage",
      name: "Integritetspolicy",
      url: `${SITE_URL}/integritetspolicy`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "sv-SE", dateModified: "2026-04-27",
    });
  }, []);

  return (
    <NordicLayout>
      <main id="main" style={{ paddingTop: "clamp(88px,12vw,120px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
        <div className="wrap" style={{ maxWidth: 720 }}>

          <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20, textTransform: "lowercase" }}>juridik · integritet</p>
          <h1 style={{ fontFamily: F, fontSize: "clamp(28px,5vw,48px)", color: C, lineHeight: 1.05, letterSpacing: "-0.02em", fontWeight: 400, marginBottom: 12 }}>
            Integritetspolicy
          </h1>
          <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.45)", marginBottom: 40 }}>
            Senast uppdaterad {UPDATED}.
          </p>

          {/* Summary box */}
          <div style={{ padding: "20px 24px", border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 6, background: "rgba(237,233,220,0.02)", marginBottom: 48 }}>
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>kort sammanfattning</p>
            <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.65)" }}>
              Vi samlar in uppgifter ni själva lämnar vid kontakt, samt teknisk data om ni godkänner cookies. Uppgifterna används för att svara på förfrågningar, leverera tjänster och förbättra webbplatsen.
            </p>
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {SECTIONS.map((s) => (
              <div key={s.h} style={{ paddingBlock: 28, borderBottom: "0.5px solid rgba(237,233,220,0.08)" }}>
                <h2 style={{ fontFamily: F, fontSize: "clamp(17px,2.2vw,22px)", color: C, marginBottom: 12, fontWeight: 400 }}>{s.h}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.content.map((p) => (
                    <p key={p} style={{ fontFamily: I, fontSize: 13, lineHeight: 1.75, color: "rgba(237,233,220,0.65)" }}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{ marginTop: 48, padding: "20px 24px", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6 }}>
            <h2 style={{ fontFamily: F, fontSize: 20, color: C, marginBottom: 8, fontWeight: 400 }}>Kontakt</h2>
            <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.60)", lineHeight: 1.7 }}>
              Frågor om personuppgifter:{" "}
              <a href="mailto:info@auroramedia.se" style={{ color: C, textDecoration: "none", borderBottom: "0.5px solid rgba(237,233,220,0.30)" }}>
                info@auroramedia.se
              </a>
            </p>
          </div>

          {/* Related */}
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: "0.5px solid rgba(237,233,220,0.08)" }}>
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.30)", marginBottom: 16 }}>läs vidare</p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { to: "/kontakt", label: "Kontakt" },
                { to: "/redaktionell-policy", label: "Redaktionell policy" },
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

export default Integritetspolicy;

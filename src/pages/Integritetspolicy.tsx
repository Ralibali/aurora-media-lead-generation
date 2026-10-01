import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Reveal, VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { setBreadcrumb, setJsonLd, removeJsonLd, SITE_URL } from "@/lib/seoHelpers";
import "@/styles/verkstad.css";

const UPDATED = "1 oktober 2026";

const SECTIONS = [
  { h: "1. Personuppgiftsansvarig", content: ["Aurora Media AB, org.nr 559272-0220, är personuppgiftsansvarig för behandlingen av personuppgifter som sker via denna webbplats, kontaktformulär, offertförfrågningar och digitala marknadsföringskanaler.", "Kontakt: info@auroramedia.se. Bolaget är baserat i Linköping, Sverige."] },
  { h: "2. Vilka personuppgifter vi behandlar", content: ["När du kontaktar oss kan vi behandla namn, e-post, telefonnummer, företagsnamn, webbplats, meddelanden samt uppgifter om vilken tjänst du är intresserad av.", "Vid besök på webbplatsen kan vi, beroende på dina cookieval, behandla IP-adress, enhetsinformation, webbläsare och användningsdata."] },
  { h: "3. Varför vi behandlar personuppgifter", content: ["Vi behandlar personuppgifter för att besvara förfrågningar, lämna offerter, boka möten, leverera våra tjänster och följa upp pågående dialoger.", "Vi kan även använda uppgifter för att förbättra webbplatsen, mäta annonsering och analysera efterfrågan."] },
  { h: "4. Laglig grund", content: ["Kontaktförfrågningar: berättigat intresse.", "Avtal: fullgörande av avtal.", "Bokföring: rättslig förpliktelse.", "Icke-nödvändiga cookies: samtycke. Tips och erbjudanden via AI-kartans automatiska mejlsekvens: separat, valfritt samtycke som kan återkallas med länken i varje mejl."] },
  { h: "5. Cookies och analys", content: ["Webbplatsen kan använda tekniskt nödvändiga cookies och, efter samtycke, Google Analytics 4 för statistik och Google Ads för marknadsföringsmätning enligt dina separata cookieval.", "Du väljer statistik och marknadsföring separat i Cookieinställningar. auroramedia_cookie_consent_v2 är vår nödvändiga localStorage-post med kategori-val, datum och version; den används i högst 12 månader. Vid återkallelse stoppas mätningen för den kategori du nekat och kända mätcookies raderas. Typsnitten levereras från vår egen webbplats.", "Google Analytics kan efter statistikval sätta _ga och _ga_* med pseudonyma besöks- och sessionsidentifierare. Googles standardlivslängd är två år. Google Ads kan efter marknadsföringsval använda _gcl_*-cookies med annonsklick och konverteringsidentifierare, normalt i 90 dagar. Inställningar och webbläsaren kan begränsa dessa tider.", "För kontofunktioner kan Supabase använda nödvändig localStorage med namnet sb-*-auth-token för inloggningssessionen tills du loggar ut, sessionen upphör eller lagringen rensas. aurora_lead, ai-karta-draft och ai_map_result sparar kontaktuppgifter, formulärutkast respektive den beställda analysen i sessionStorage för det begärda formulärflödet; de försvinner när fliken stängs eller du rensar lagringen."] },
  { h: "6. Mottagare", content: ["Webbplatsen använder Supabase för databas och formulärhantering, Resend för beställda mejl och, efter respektive cookieval, Google Analytics och Google Ads. AI-kartans text och processbeskrivningar skickas till Lovables AI-tjänst, som använder Google Gemini för den begärda analysen. Personuppgifter du skriver i beskrivningen kan därför omfattas; skriv bara det som behövs för analysen. Uppgifter kan även behandlas av leverantörer för webbdrift och bokföring när det behövs för tjänsten."] },
  { h: "7. Överföring utanför EU/EES", content: ["Vissa leverantörer kan behandla uppgifter utanför EU/EES. Sådana överföringar kräver rättsligt stöd och skyddsåtgärder enligt GDPR. Kontakta info@auroramedia.se för information om aktuella behandlingsländer och dokumenterade skyddsåtgärder."] },
  { h: "8. Lagringstid", content: ["Förfrågningar sparas så länge dialogen är aktiv. Kund- och avtalsuppgifter sparas enligt avtal och bokföringsregler. Formulärutkast och kontaktuppgifter för förifyllning sparas endast i den aktuella webbläsarfliken (sessionStorage)."] },
  { h: "9. Dina rättigheter", content: ["Du kan, beroende på omständigheterna, begära tillgång, rättelse, radering, begränsning och dataportabilitet samt invända mot behandling som grundas på berättigat intresse. Samtycke kan återkallas för framtida behandling utan att påverka lagligheten före återkallelsen. Kontakta info@auroramedia.se; vi kan behöva verifiera din identitet och svarar normalt inom en månad. Klagomål kan lämnas till Integritetsskyddsmyndigheten (IMY)."] },
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
      inLanguage: "sv-SE", dateModified: "2026-10-01",
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

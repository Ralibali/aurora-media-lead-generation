import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import "@/styles/verkstad.css";

/*
 * VILLKOR – samtycke för AI-kartan.
 * Kort, mänskligt och utan juristkrångel: vad som händer när man
 * fyller i AI-kartan, vilka mejl man får och hur man avslutar.
 */

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Vad du godkänner",
    body: [
      "När du fyller i AI-kartan och kryssar i rutan godkänner du två saker:",
      "1. Att Aurora Media skickar din AI-karta till den e-postadress du anger – tillsammans med upp till fyra korta uppföljningsmejl med konkreta tips kopplade till just din kartläggning.",
      "2. Att Aurora Media får höra av sig till dig för uppföljning – till exempel för att fråga hur det gick, svara på frågor om kartan eller föreslå ett kostnadsfritt 20-minuterssamtal om första bygget.",
    ],
  },
  {
    title: "Vad vi sparar – och varför",
    body: [
      "Vi sparar det du själv fyller i: namn, e-post, företagsnamn, bransch och svaren i kartläggningen. Uppgifterna används bara för att ta fram din AI-karta och för den uppföljning du godkänt ovan. Vi säljer aldrig vidare dina uppgifter till tredje part.",
      "Behandlingen sker enligt GDPR med ditt samtycke som rättslig grund. Aurora Media AB (org.nr 559272-0220, Linköping) är personuppgiftsansvarig.",
    ],
  },
  {
    title: "Du kan avsluta när du vill",
    body: [
      "Varje mejl har en avregistreringslänk längst ner – ett klick och uppföljningen slutar direkt. Du kan också när som helst mejla christoffer@auroramedia.se och be oss radera allt vi har om dig. Det gör vi utan diskussion.",
      "Samtycket gäller tills du drar tillbaka det. AI-kartan du fått är din att behålla oavsett.",
    ],
  },
  {
    title: "Kort sagt",
    body: [
      "Du får din karta på mejlen. Vi kan höra av oss för uppföljning. Du kan avsluta när du vill. Det är allt.",
    ],
  },
];

const Villkor = () => {
  useEffect(() => {
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Villkor", url: "/villkor" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <>
      <SEO
        title="Villkor | Aurora Media"
        description="Villkor för AI-kartan och för köp av AI-KONTORET: vad du godkänner, hur digital leverans fungerar, och hur du avslutar."
        canonical="/villkor"
        noindex
      />
      <div className="verkstad">
        <VkNav />
        <main id="main">
          <section className="vk-section" style={{ paddingTop: "clamp(110px,14vw,160px)" }}>
            <div className="vk-wrap" style={{ maxWidth: 720 }}>
              <p className="vk-mono">Villkor · AI-kartan och AI-KONTORET</p>
              <h1 style={{ marginTop: 14, marginBottom: 18 }}>
                Det här godkänner du – kort version
              </h1>
              <p style={{ maxWidth: 620, color: "var(--granbark-mut)", fontSize: 17, lineHeight: 1.6 }}>
                Inga dolda klausuler, ingen juristprosa. Först AI-kartan. Längre ner: villkoren för köp av AI-KONTORET.
              </p>

              <div style={{ marginTop: 44, display: "grid", gap: 18 }}>
                {SECTIONS.map((s) => (
                  <div
                    key={s.title}
                    style={{
                      border: "1px solid var(--linje)",
                      borderRadius: 14,
                      padding: "24px 26px",
                      background: "#FDFCF8",
                    }}
                  >
                    <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", marginBottom: 10 }}>
                      {s.title}
                    </h2>
                    {s.body.map((p, i) => (
                      <p
                        key={i}
                        style={{
                          color: "var(--granbark-mut)",
                          fontSize: 15.5,
                          lineHeight: 1.65,
                          marginTop: i === 0 ? 0 : 10,
                        }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              <div id="ai-kontoret" style={{ marginTop: 56 }}>
                <p className="vk-mono">Villkor · AI-KONTORET</p>
                <h2 style={{ marginTop: 14, marginBottom: 18, fontSize: 28, letterSpacing: "-0.02em" }}>
                  Köp av AI-KONTORET
                </h2>
                <p style={{ maxWidth: 620, color: "var(--granbark-mut)", fontSize: 17, lineHeight: 1.6 }}>
                  Det här gäller när du köper Guiden, Prompt Vault eller bundlet på /grok-bot. Texten är ett utkast tills ägaren bekräftat den slutliga formuleringen.
                </p>
                <div style={{ marginTop: 28, display: "grid", gap: 18 }}>
                  {[
                    {
                      title: "Näringsidkare",
                      body: [
                        "Säljare: Aurora Media AB, organisationsnummer 559272-0220, Linköping, Sverige. Support och kontakt: info@auroramedia.se.",
                        "Fullständig postadress saknas i de verifierade källorna i projektet och kompletteras av näringsidkaren innan live. Hitta oss tills dess via e-post och organisationsnummer.",
                      ],
                    },
                    {
                      title: "Vad du köper och pris",
                      body: [
                        "AI-KONTORET är digitalt innehåll i PDF: Guiden, Prompt Vault, eller båda i bundlet. Leveransen skickas till den e-postadress du anger, med tidsbegränsade nedladdningslänkar.",
                        "Konsumentpriserna är 199 kr för Guiden, 199 kr för Prompt Vault och 349 kr för bundlet. Alla priser inkluderar moms. Vi lägger inte på moms ovanpå det du ser.",
                        "Bundlet är två tillhandahållanden. Bundlerabatten fördelas lika: Guide 174,50 kr och Prompt Vault 174,50 kr, totalt 349,00 kr. Guide behandlas som kandidat för 6 % elektronisk publikation. Vault behandlas som kandidat för 25 % elektroniskt tillhandahållen tjänst. Klasserna är inte ägargodkända.",
                      ],
                    },
                    {
                      title: "Direkt leverans och ångerrätt",
                      body: [
                        "Filerna levereras efter betald checkout. Enligt distansavtalslagen kan ångerrätten för digitalt innehåll upphöra när leveransen påbörjats, men bara om du först fått information om det och aktivt samtyckt.",
                        "Samtyckestexten i kassan (utkast, inte ägargodkänd) är: Jag samtycker uttryckligen till att leveransen av det digitala innehållet påbörjas omedelbart och går med på att det därigenom inte finns någon ångerrätt när leveransen har påbörjats.",
                        "Rutan är inte förifylld. Utan det aktiva krysset öppnas inte kassan. Ångerrätten kan fortfarande gälla om samtycket saknades eller leveransen inte startade.",
                      ],
                    },
                    {
                      title: "Så utövar du ångerrätt",
                      body: [
                        "Använd den elektroniska ångerfunktionen på /angra-kop. Där anger du namn, e-post, avtals- eller Stripe-id och skickar en uttrycklig begäran. Du får omedelbart ett mottagningsbevis med tidpunkt. Beviset bekräftar bara mottagandet – inte att ångerrätten är giltig.",
                        "Du kan också mejla samma uppgifter till info@auroramedia.se. Standardinformation om ångerrätt finns hos Konsumentverket: https://www.konsumentverket.se/for-konsument/kopa-varor-och-tjanster/angerratt/",
                      ],
                    },
                    {
                      title: "Bekräftelse av avtalet",
                      body: [
                        "Efter köpet får du ett leveransmejl med nedladdningarna och en hållbar avtalsbekräftelse: näringsidkare, organisationsnummer, produkt, totalt pris inklusive moms, momsfördelning, samtyckestext, tidpunkt, leveransvillkor, reklamation, ångerinformation och länk till /angra-kop. Spara mejlet.",
                        "Betalningen hanteras av Stripe. Aurora Media lagrar inte kortuppgifter. En länk i webbläsaren är aldrig ett köpbevis – bara den verifierade sessionen och mejlet.",
                      ],
                    },
                    {
                      title: "Reklamation och support",
                      body: [
                        "Fel i den levererade filen anmäls till info@auroramedia.se. Konsumentköplagens reklamationsregler gäller för digitalt innehåll.",
                        "Frågor om leverans, nya länkar eller köpet: info@auroramedia.se. Personuppgifter för köpet behandlas för att fullgöra avtalet och skicka filerna. Läs mer i integritetspolicyn.",
                      ],
                    },
                  ].map((s) => (
                    <div
                      key={s.title}
                      style={{
                        border: "1px solid var(--linje)",
                        borderRadius: 14,
                        padding: "24px 26px",
                        background: "#FDFCF8",
                      }}
                    >
                      <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em", marginBottom: 10 }}>
                        {s.title}
                      </h3>
                      {s.body.map((p, i) => (
                        <p
                          key={i}
                          style={{
                            color: "var(--granbark-mut)",
                            fontSize: 15.5,
                            lineHeight: 1.65,
                            marginTop: i === 0 ? 0 : 10,
                          }}
                        >
                          {p.includes("/angra-kop") ? (
                            <>
                              {p.split("/angra-kop")[0]}
                              <Link to="/angra-kop" style={{ fontWeight: 600 }}>
                                /angra-kop
                              </Link>
                              {p.split("/angra-kop")[1]}
                            </>
                          ) : (
                            p
                          )}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <p style={{ marginTop: 32, fontSize: 14, color: "var(--granbark-mut)", lineHeight: 1.6 }}>
                Frågor om villkoren eller dina uppgifter? Mejla{" "}
                <a href="mailto:christoffer@auroramedia.se" style={{ color: "var(--gran)", fontWeight: 600 }}>
                  christoffer@auroramedia.se
                </a>{" "}
                – jag svarar personligen inom 24 timmar.
              </p>
              <p style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--granbark-mut)", letterSpacing: "0.04em" }}>
                Senast uppdaterad: augusti 2026
              </p>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default Villkor;

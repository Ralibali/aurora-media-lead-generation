import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { VkNav, VkFooter } from "@/components/verkstad/VerkstadLayout";
import { LEGAL_ACK_TEXT, PRICES, PRODUCT_NAME } from "@/config/aiKontoret";
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
        title="Villkor för AI-kartan | Aurora Media"
        description="Villkoren för AI-kartan: du får kartan på mejl, Aurora Media kan höra av sig för uppföljning, och du kan avsluta när du vill. Kort och mänskligt."
        canonical="/villkor"
        noindex
      />
      <div className="verkstad">
        <VkNav />
        <main id="main">
          <section className="vk-section" style={{ paddingTop: "clamp(110px,14vw,160px)" }}>
            <div className="vk-wrap" style={{ maxWidth: 720 }}>
              <p className="vk-mono">Villkor · AI-kartan</p>
              <h1 style={{ marginTop: 14, marginBottom: 18 }}>
                Det här godkänner du – kort version
              </h1>
              <p style={{ maxWidth: 620, color: "var(--granbark-mut)", fontSize: 17, lineHeight: 1.6 }}>
                Inga dolda klausuler, ingen juristprosa. Så här funkar det när du fyller i AI-kartan på auroramedia.se.
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

              <p style={{ marginTop: 32, fontSize: 14, color: "var(--granbark-mut)", lineHeight: 1.6 }}>
                Frågor om villkoren eller dina uppgifter? Mejla{" "}
                <a href="mailto:christoffer@auroramedia.se" style={{ color: "var(--gran)", fontWeight: 600 }}>
                  christoffer@auroramedia.se
                </a>{" "}
                – jag svarar personligen inom 24 timmar.
              </p>
              <p style={{ marginTop: 10, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--granbark-mut)", letterSpacing: "0.04em" }}>
                Senast uppdaterad: juli 2026
              </p>

              {/* UTKAST: AI-KONTORET digital PDF – inte juridiskt granskat, checkout inte öppet. */}
              <section
                id="ai-kontoret"
                aria-labelledby="ai-kontoret-villkor-heading"
                style={{
                  marginTop: 56,
                  padding: "28px 26px 26px",
                  border: "1px dashed var(--gran)",
                  borderRadius: 14,
                  background: "#F7F4EC",
                }}
              >
                <p className="vk-mono" style={{ color: "var(--gran)" }}>
                  UTKAST · inte juridiskt granskat
                </p>
                <h2
                  id="ai-kontoret-villkor-heading"
                  style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em", marginTop: 10, marginBottom: 10 }}
                >
                  {PRODUCT_NAME} – digital PDF
                </h2>
                <p style={{ color: "var(--granbark-mut)", fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>
                  Det här avsnittet är ett utkast för kommande försäljning av {PRODUCT_NAME} som
                  digital PDF. Det är inte juridiskt granskat och ska inte läsas som gällande
                  köpvillkor förrän ägaren bekräftat texten. Köpflödet är stängt tills vidare.
                </p>

                <div style={{ marginTop: 22, display: "grid", gap: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Vad du köper</h3>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>
                      Engångsköp av digital nedladdning (PDF): Guide {PRICES.guide} kr, Prompt Vault{" "}
                      {PRICES.vault} kr, eller paketet Guide + Vault {PRICES.bundle} kr. Priserna
                      anges i svenska kronor. Det är ingen prenumeration.
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Leverans</h3>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>
                      Efter verifierad betalning skickas filerna till den e-postadress du anger.
                      Nedladdningen sker via personliga, tidsbegränsade signerade länkar. När en
                      länk gått ut skickar vi en ny utan extra kostnad.
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Ångerrätt</h3>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>
                      Du har som utgångspunkt 14 dagars ångerrätt enligt distansavtalslagen. För
                      digitalt innehåll som levereras omedelbart gäller det vanliga undantaget:
                      ångerrätten upphör när leveransen av det digitala innehållet har påbörjats,
                      om du dessförinnan samtyckt och erkänt att rätten då faller bort.
                    </p>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 15.5, lineHeight: 1.65, marginTop: 10 }}>
                      Innan du betalar måste du kryssa i samma text som i kassan:
                    </p>
                    <blockquote
                      style={{
                        margin: "12px 0 0",
                        padding: "14px 16px",
                        borderLeft: "3px solid var(--gran)",
                        background: "#FDFCF8",
                        color: "var(--granbark)",
                        fontSize: 15,
                        lineHeight: 1.6,
                      }}
                    >
                      {LEGAL_ACK_TEXT}
                    </blockquote>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Support</h3>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>
                      Frågor, felaktig fil eller ny nedladdningslänk:{" "}
                      <a href="mailto:info@auroramedia.se" style={{ color: "var(--gran)", fontWeight: 600 }}>
                        info@auroramedia.se
                      </a>
                      . Ersättningslänkar skickas utan extra kostnad. Hur vi behandlar
                      köpuppgifter beskrivs i utkastet på{" "}
                      <Link to="/integritetspolicy#ai-kontoret" style={{ color: "var(--gran)", fontWeight: 600 }}>
                        integritetspolicyn
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default Villkor;

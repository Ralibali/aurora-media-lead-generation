import { useEffect } from "react";
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
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default Villkor;

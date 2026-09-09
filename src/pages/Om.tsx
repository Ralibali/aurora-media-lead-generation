import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta } from "@/lib/seoHelpers";

const VALUES = [
  { title: "Ärlighet framför allt", desc: "Om något inte är möjligt eller inte passar ert behov — vi säger det direkt. Ingen projektledning för projektledningens skull." },
  { title: "Snabbhet är ett designval", desc: "Leveranstakt på veckor är inte en gimmick. Det är resultatet av en process utan onödiga överlämningar och med rätt verktyg." },
  { title: "Ni äger allt", desc: "Källkod, domän, databas, drift. Allt överlämnas. Ni ska inte vara beroende av oss för att er produkt ska leva." },
  { title: "Enkelt är svårare", desc: "Vi undviker onödig komplexitet. Vi väljer lösningar som går att förstå, underhålla och bygga vidare på." },
  { title: "Kontroll över er data", desc: "Vi går igenom lagring, behörigheter och vilka tjänster som behandlar er data. Krav på drift och personuppgifter bestäms innan vi väljer lösning." },
];

const FACTS: [string, string][] = [
  ["Bolag", "Aurora Media AB"],
  ["Org.nr", "559272-0220"],
  ["Bas", "Linköping"],
  ["Sedan", "2021"],
  ["Kontakt", "info@auroramedia.se"],
  ["Specialitet", "SaaS, AI, interna system"],
];

const Om = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Om Aurora Media AB — AI-driven mjukvarubyrå i Linköping",
      description: "Aurora Media AB bygger SaaS, AI-automation och interna system för svenska bolag. Fast pris, fast scope, leverans på veckor.",
      canonical: "/om", ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">om aurora media ab · linköping</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "18ch" }}>
Ett litet team som <span className="it">bygger.</span>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal>
              <div>
                <div style={{ width: 84, height: 84, borderRadius: "50%", border: "1px solid var(--hair)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--bone)", fontStyle: "italic" }}>AM</span>
                </div>
                <p style={{ color: "var(--bone)", fontSize: 15, fontWeight: 500 }}>Aurora Media AB</p>
                <p className="body" style={{ fontSize: 13, marginTop: 2 }}>AI-driven mjukvarubyrå i Linköping</p>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
                  <tbody>
                    {FACTS.map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: "1px solid var(--hair)" }}>
                        <td style={{ padding: "9px 0", fontSize: 12, color: "var(--bone-mute)", fontFamily: "var(--font-mono)" }}>{k}</td>
                        <td style={{ padding: "9px 0", fontSize: 13, color: "var(--bone)", textAlign: "right" }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <p className="lead">
                  Aurora Media AB bygger digitala verktyg för företag som vill få mer gjort. Arbetet börjar i er vardag: vad tar tid, var fastnar informationen och vad behöver fungera bättre?
                </p>
                <p className="body">
                  Vi arbetar i små team utan onödiga överlämningar. Samma personer följer projektet från första skissen till driftsatt produkt, så att ni alltid pratar med dem som faktiskt bygger. Vi avgränsar en första version och sätter tidsplanen utifrån vad den behöver klara.
                </p>
                <p className="body">
                  Leveransmodellen är fast pris, fast omfattning och fast deadline. Prototyp på ett par veckor, MVP därefter, och vidareutveckling i korta iterationer när produkten är i drift.
                </p>
                <p className="body">
                  Kompetensområdena är SaaS-utveckling, AI-automation, integrationer, interna system och webb. När ett projekt kräver specialistkompetens vi inte har internt tar vi in den med ert godkännande — eller hänvisar vidare.
                </p>
                <p className="body" style={{ color: "var(--bone-mute)" }}>
                  Aurora Media AB, org.nr 559272-0220, med bas i Linköping. Kunder finns i hela Sverige och arbetet sker digitalt med gemensamma genomgångar av testbara versioner.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Värderingar</div></Reveal>
            <Reveal delay={0.1}><h2 className="h2">Hur vi <span className="it">jobbar.</span></h2></Reveal>
          </div>
          <div className="feat-list" style={{ marginTop: 0 }}>
            {VALUES.map((v, i) => (
              <div key={v.title} className="feat-row">
                <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="feat-title">{v.title}</span>
                <span className="feat-body">{v.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Nästa steg</div>
          <h2 className="h2" style={{ marginTop: 18 }}>Vill ni jobba <span className="it">med oss?</span></h2>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Begär offert <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default Om;

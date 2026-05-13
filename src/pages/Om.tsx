import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta } from "@/lib/seoHelpers";

const VALUES = [
  { title: "Ärlighet framför allt", desc: "Om något inte är möjligt eller inte passar ert behov — vi säger det direkt. Ingen projektledning för projektledningens skull." },
  { title: "Snabbhet är ett designval", desc: "Leveranstakt på veckor är inte en gimmick. Det är resultatet av en process utan onödiga överlämningar och med rätt verktyg." },
  { title: "Ni äger allt", desc: "Källkod, domän, databas, drift. Allt överlämnas. Ni ska inte vara beroende av oss för att er produkt ska leva." },
  { title: "Enkelt är svårare", desc: "Vi undviker onödig komplexitet. En lösning som funkar i tre år utan underhåll är bättre än en som imponerar men spricker." },
  { title: "Data stannar i EU", desc: "Alla produkter vi bygger är GDPR-anpassade och körs på EU-baserad infrastruktur som standard." },
];

const FACTS: [string, string][] = [
  ["Bas", "Linköping"],
  ["Sedan", "2021"],
  ["Utbildning", "Södertörns högskola"],
  ["Produkter", "6 i drift"],
  ["Specialitet", "SaaS, AI, system"],
];

const Om = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Om aurora — Christoffer Holstensson | Aurora Media",
      description: "Aurora Media är byggt av en person. En person bygger hela vägen, från skiss till driftsatt produkt.",
      canonical: "/om", ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">om aurora · christoffer holstensson</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "18ch" }}>
              Aurora är en person. <span className="it">Det är en feature.</span>
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
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--bone)", fontStyle: "italic" }}>C</span>
                </div>
                <p style={{ color: "var(--bone)", fontSize: 15, fontWeight: 500 }}>Christoffer Holstensson</p>
                <p className="body" style={{ fontSize: 13, marginTop: 2 }}>Grundare och utvecklare</p>
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
                  De flesta byråer skickar runt projekt mellan projektledare, designers, utvecklare och konsulter. Något försvinner i varje överlämning.
                </p>
                <p className="body">
                  Aurora Media är annorlunda byggt: en person bygger hela vägen, från första skissen till driftsatt produkt. Det är därför vi kan leverera på veckor istället för månader — och det är därför ni alltid pratar med personen som faktiskt kodar.
                </p>
                <p className="body">
                  När projektet växer förbi vad en person rimligen klarar säger vi det rakt ut. Då tar vi in externa specialister med ert godkännande — eller så hänvisar vi vidare.
                </p>
                <p className="body" style={{ color: "var(--bone-mute)" }}>
                  Bakgrunden är inom säkerhet och systemvetenskap — studerade vid Södertörns högskola och hamnade sedan i skärningspunkten mellan teknisk problemlösning och affärsnytta.
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

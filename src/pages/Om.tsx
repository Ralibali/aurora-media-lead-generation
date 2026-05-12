import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta } from "@/lib/seoHelpers";

const Rule = () => <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)" }} />;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'JetBrains Mono',ui-monospace,monospace",
      fontSize: 11, letterSpacing: "0.1em",
      color: "rgba(237,233,220,0.40)",
      marginBottom: 20, textTransform: "lowercase",
    }}>{children}</p>
  );
}

const VALUES = [
  { title: "Ärlighet framför allt", desc: "Om något inte är möjligt eller inte passar ert behov — vi säger det direkt. Ingen projektledning för projektledningens skull." },
  { title: "Snabbhet är ett designval", desc: "Leveranstakt på veckor är inte en gimmick. Det är resultatet av en process utan onödiga överlämningar och med rätt verktyg." },
  { title: "Ni äger allt", desc: "Källkod, domän, databas, drift. Allt överlämnas. Ni ska inte vara beroende av oss för att er produkt ska leva." },
  { title: "Enkelt är svårare", desc: "Vi undviker onödig komplexitet. En lösning som funkar i tre år utan underhåll är bättre än en som imponerar men spricker." },
  { title: "Data stannar i EU", desc: "Alla produkter vi bygger är GDPR-anpassade och körs på EU-baserad infrastruktur som standard." },
];

const Om = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Om aurora — Christoffer Holstensson | Aurora Media",
      description: "Aurora Media är byggt av en person. En person bygger hela vägen, från skiss till driftsatt produkt.",
      canonical: "/om", ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">

        {/* Hero */}
        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <Label>om aurora</Label>
            <h1 className="t-h1 c-cream anim-fade-up" style={{ maxWidth: 600 }}>
              Aurora är en person.
              <br /><em>Det är en feature.</em>
            </h1>
          </div>
        </section>

        {/* Bio */}
        <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <div style={{ display: "grid", gap: "clamp(32px,5vw,64px)" }} className="sm:grid-cols-[240px_1fr]">

              {/* card */}
              <div>
                <div style={{ width: 72, height: 72, borderRadius: "50%", border: "0.5px solid rgba(237,233,220,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: 28, color: "#EDE9DC", fontStyle: "italic" }}>C</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif" }}>Christoffer Holstensson</p>
                <p style={{ fontSize: 13, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif", marginTop: 2 }}>Grundare och utvecklare</p>

                <table style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
                  {[["Bas","Linköping"],["Sedan","2021"],["Utbildning","Södertörns högskola"],["Produkter","6 i drift"],["Specialitet","SaaS, AI, system"]].map(([k,v]) => (
                    <tr key={k} style={{ borderBottom: "0.5px solid rgba(237,233,220,0.08)" }}>
                      <td style={{ padding: "8px 0", fontSize: 12, color: "rgba(237,233,220,0.40)", fontFamily: "'Inter',system-ui,sans-serif" }}>{k}</td>
                      <td style={{ padding: "8px 0", fontSize: 12, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif", textAlign: "right" }}>{v}</td>
                    </tr>
                  ))}
                </table>

                <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                  {[["LinkedIn ↗","https://linkedin.com"],["GitHub ↗","https://github.com/ralibali"]].map(([l,h]) => (
                    <a key={l as string} href={h as string} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "rgba(237,233,220,0.40)", textDecoration: "none", transition: "color 0.15s", fontFamily: "'Inter',system-ui,sans-serif" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#EDE9DC")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.40)")}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>

              {/* prose */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(237,233,220,0.70)", fontFamily: "'Inter',system-ui,sans-serif" }}>
                  De flesta byråer skickar runt projekt mellan projektledare, designers, utvecklare och konsulter. Något försvinner i varje överlämning.
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(237,233,220,0.80)", fontFamily: "'Inter',system-ui,sans-serif" }}>
                  Aurora Media är annorlunda byggt: en person bygger hela vägen, från första skissen till driftsatt produkt. Det är därför vi kan leverera på veckor istället för månader — och det är därför ni alltid pratar med personen som faktiskt kodar.
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(237,233,220,0.55)", fontFamily: "'Inter',system-ui,sans-serif" }}>
                  När projektet växer förbi vad en person rimligen klarar säger vi det rakt ut. Då tar vi in externa specialister med ert godkännande — eller så hänvisar vi vidare.
                </p>
                <div style={{ height: "0.5px", background: "rgba(237,233,220,0.08)", marginBlock: 4 }} />
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.45)", fontFamily: "'Inter',system-ui,sans-serif" }}>
                  Bakgrunden är inom säkerhet och systemvetenskap — studerade vid Södertörns högskola och hamnade sedan i skärningspunkten mellan teknisk problemlösning och affärsnytta. AI-byrå-spåret kom naturligt när moderna verktyg förändrade vad en person faktiskt kan bygga.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <Label>värderingar</Label>
            <h2 className="t-h2 c-cream" style={{ marginBottom: 40 }}>Hur vi jobbar.</h2>

            {VALUES.map((v, i) => (
              <div key={v.title} style={{
                display: "grid", gap: "8px 40px", padding: "24px 0",
                borderBottom: "0.5px solid rgba(237,233,220,0.08)",
              }} className="sm:grid-cols-[200px_1fr]">
                <p style={{ fontSize: 14, fontWeight: 500, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif" }}>{v.title}</p>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(237,233,220,0.55)", fontFamily: "'Inter',system-ui,sans-serif" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <Label>nästa steg</Label>
            <h2 className="t-h2 c-cream" style={{ marginBottom: 28 }}>Vill ni jobba med oss?</h2>
            <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default Om;

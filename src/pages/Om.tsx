import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta } from "@/lib/seoHelpers";

const BORDER = "rgba(237, 233, 220, 0.15)";
const SectionBorder = () => <div style={{ height: "0.5px", backgroundColor: BORDER }} />;

const Om = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Om aurora — Christoffer Holstensson | Aurora Media",
      description:
        "Aurora Media är byggt av en person — Christoffer Holstensson. En person bygger hela vägen, från skiss till driftsatt produkt.",
      canonical: "/om",
      ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">
        <section className="section-pad pt-[120px]">
          <div className="site-container">
            <p className="eyebrow mb-4">Om aurora</p>
            <h1 className="hero-h1 text-cream max-w-[580px]">
              Aurora är en person.{" "}
              <em>Det är en feature.</em>
            </h1>
          </div>
        </section>

        <section className="section-pad">
          <SectionBorder />
          <div className="site-container pt-14">
            <div className="grid gap-12 sm:grid-cols-[280px_1fr]">
              <div>
                <div
                  className="flex h-[80px] w-[80px] items-center justify-center rounded-full mb-5"
                  style={{ border: `0.5px solid ${BORDER}` }}
                >
                  <span className="font-serif text-[32px] text-cream">C</span>
                </div>
                <p className="font-sans text-[15px] font-medium text-cream">Christoffer Holstensson</p>
                <p className="font-sans text-[13px] mt-1" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                  Grundare och utvecklare
                </p>

                <table className="mt-6 w-full">
                  <tbody>
                    {[
                      ["Bas", "Linköping"],
                      ["Sedan", "2021"],
                      ["Utbildning", "Södertörns högskola"],
                      ["Specialitet", "SaaS, AI, system"],
                      ["Egna produkter", "6 i drift"],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b" style={{ borderColor: BORDER, borderWidth: "0.5px" }}>
                        <td className="py-2.5 font-sans text-[12px]" style={{ color: "rgba(237, 233, 220, 0.50)" }}>{k}</td>
                        <td className="py-2.5 font-sans text-[12px] text-right text-cream">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-6 flex gap-4">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                    className="font-sans text-[13px] transition-opacity hover:opacity-70"
                    style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                    LinkedIn ↗
                  </a>
                  <a href="https://github.com/ralibali" target="_blank" rel="noopener noreferrer"
                    className="font-sans text-[13px] transition-opacity hover:opacity-70"
                    style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                    GitHub: ralibali ↗
                  </a>
                </div>
              </div>

              <div className="space-y-5 font-sans text-[14px] leading-[1.7]" style={{ color: "rgba(237, 233, 220, 0.80)" }}>
                <p>
                  De flesta byråer skickar runt projekt mellan projektledare, designers, utvecklare och
                  konsulter. Något försvinner i varje överlämning.
                </p>
                <p>
                  Aurora Media är annorlunda byggt: en person bygger hela vägen, från första skissen till
                  driftsatt produkt. Det är därför vi kan leverera på veckor istället för månader — och
                  det är därför ni alltid pratar med personen som faktiskt kodar.
                </p>
                <p>
                  När projektet växer förbi vad en person rimligen klarar säger vi det rakt ut. Då tar vi
                  in externa specialister med ert godkännande — eller så hänvisar vi vidare.
                </p>

                <SectionBorder />

                <p className="font-sans text-[13px]" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                  Bakgrunden är inom säkerhet och systemvetenskap — studerade vid Södertörns högskola och
                  hamnade sedan i skärningspunkten mellan teknisk problemlösning och affärsnytta.
                  AI-byrå-spåret kom naturligt när det stod klart att moderna verktyg förändrade vad en
                  person faktiskt kan bygga.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <SectionBorder />
          <div className="site-container pt-14">
            <p className="eyebrow mb-4">Värderingar</p>
            <h2 className="section-h2 text-cream mb-8">Hur vi jobbar.</h2>

            <div>
              {[
                {
                  title: "Ärlighet framför allt",
                  desc: "Om något inte är möjligt eller inte passar ert behov — vi säger det direkt. Ingen projektledning för projektledningens skull.",
                },
                {
                  title: "Snabbhet är ett designval",
                  desc: "Leveranstakt på veckor är inte en gimmick. Det är resultatet av en process utan onödiga överlämningar och med rätt verktyg.",
                },
                {
                  title: "Ni äger allt",
                  desc: "Källkod, domän, databas, drift. Allt överlämnas. Ni ska inte vara beroende av oss för att er produkt ska leva.",
                },
                {
                  title: "Enkelt är svårare",
                  desc: "Vi undviker onödig komplexitet. En lösning som funkar i tre år utan att kräva underhåll är bättre än en som imponerar men spricker.",
                },
                {
                  title: "Data stannar i EU",
                  desc: "Alla produkter vi bygger är GDPR-anpassade och körs på EU-baserad infrastruktur som standard.",
                },
              ].map((v, i, arr) => (
                <div
                  key={v.title}
                  className="grid gap-4 py-5 sm:grid-cols-[200px_1fr]"
                  style={{ borderBottom: i < arr.length - 1 ? `0.5px solid ${BORDER}` : "none" }}
                >
                  <p className="font-sans text-[14px] font-medium text-cream">{v.title}</p>
                  <p className="font-sans text-[13px] leading-relaxed" style={{ color: "rgba(237, 233, 220, 0.65)" }}>
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad">
          <SectionBorder />
          <div className="site-container pt-14">
            <p className="eyebrow mb-4">Nästa steg</p>
            <h2 className="section-h2 text-cream mb-6">Vill ni jobba med oss?</h2>
            <Link
              to="/kontakt"
              className="inline-flex items-center rounded-lg px-[18px] py-[10px] font-sans text-[13px] font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#EDE9DC", color: "#100F0D" }}
            >
              Begär offert →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Om;

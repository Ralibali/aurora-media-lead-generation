import { useEffect } from "react";
import { ArrowRight, Mail } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const FACTS: [string, string][] = [
  ["Plats", "Linköping, Sverige"],
  ["Org.nr", "559272-0220"],
  ["VAT", "SE559272022001"],
  ["Leverans", "Veckor, inte månader"],
];

const Kontakt = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Kontakt — begär offert | Aurora Media",
      description: "Berätta vad ni vill bygga. Vi återkommer med offert inom 24 timmar.",
      canonical: "/kontakt",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Kontakt", url: "/kontakt" }]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">kontakt · svar inom 24 timmar</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "14ch" }}>
              Berätta vad ni <span className="it">vill bygga.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Klicka på knappen nedan så öppnas ett enkelt formulär. Vi återkommer med förslag, tidsplan och ungefärlig budget — utan kostnad och bindning.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 16 }}>
              <button onClick={() => open()} className="btn btn-moss">
                Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
              </button>
              <a href="mailto:info@auroramedia.se" className="btn btn-ghost">
                <Mail size={14} /> info@auroramedia.se
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Direktkontakt</div></Reveal>
            <Reveal delay={0.1}>
              <div>
                <a href="mailto:info@auroramedia.se" className="cta-email">info@auroramedia.se →</a>
                <p className="body" style={{ marginTop: 18 }}>Svar inom 24 timmar vardagar.</p>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 32, maxWidth: 480 }}>
                  <tbody>
                    {FACTS.map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: "1px solid var(--hair)" }}>
                        <td style={{ padding: "11px 0", fontSize: 12, color: "var(--bone-mute)", fontFamily: "var(--font-mono)" }}>{k}</td>
                        <td style={{ padding: "11px 0", fontSize: 13, color: "var(--bone)", textAlign: "right" }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </NordicLayout>
  );
};

export default Kontakt;

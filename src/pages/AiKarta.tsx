import { useEffect } from "react";
import { Link } from "react-router-dom";
import NordicLayout from "@/components/nordic/NordicLayout";
import { setSEOMeta, setJsonLd, setBreadcrumb } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const RULE = { height: "0.5px", background: "rgba(237,233,220,0.12)" } as const;

const proofStats = [
  { value: "5–15 h", label: "sparat per anställd och vecka", sub: "i typiska AI-piloter som vi byggt" },
  { value: "Några min", label: "att fylla i online", sub: "klart innan ditt nästa möte" },
  { value: "0 kr", label: "för analysen", sub: "och inget säljmöte krävs" },
];

const valueStack = [
  { title: "Personlig topp-3-analys", body: "Vilka av era processer som ger störst effekt först – inte en generisk lista." },
  { title: "Konkret tidsbesparing i timmar", body: "Beräknat per process, per vecka och per år. Lätt att räkna ROI på." },
  { title: "Förslag på lösning per område", body: "AI-assistent, automation, dashboard, internt system eller integration – med motivering." },
  { title: "Djupanalys av Aurora-analysen", body: "Snabba vinster, risker att hantera och en rekommenderad ordning på pilotprojekten." },
  { title: "Innehållsrik PDF att dela internt", body: "Snyggt formaterad, byggd för att ta med till ledningsmöte eller workshop med personalen." },
  { title: "Metodguide: Så automatiserar ni", body: "Aurora Medias 6-stegsmetod för att gå från idé till driftsatt AI-lösning på två till fyra veckor." },
];

const objections = [
  { q: "Vi är inte tekniska – förstår vi ens svaren?", a: "Ja. Allt är på vanlig svenska, utan AI-jargong. Du svarar på frågor om hur ni jobbar idag – vi översätter till lösningar." },
  { q: "Är det här bara ett sätt att fånga in leads för att ringa oss sen?", a: "Nej. Ni får hela analysen och PDF:en direkt på skärmen, utan säljmöte. Vill ni boka en genomlysning är det helt frivilligt – och alltid kostnadsfritt." },
  { q: "Vi har redan testat ChatGPT, behöver vi det här?", a: "ChatGPT är ett verktyg. AI-kartan handlar om VAD i er verksamhet som faktiskt sparar tid och pengar att automatisera – och i vilken ordning." },
  { q: "Hur vet ni vad som passar just oss?", a: "Analysen är byggd på era egna svar om frekvens, tidsåtgång, regelstyrning, datatillgång och affärsvärde – samma kriterier som vi använder med betalande kunder." },
];

const steps = [
  { num: "01", title: "Fyll i AI-kartan online", body: "Några minuter. Lista era vanligaste tidskrävande processer.", time: "Några min" },
  { num: "02", title: "Få mini-analys direkt", body: "Topp-3 områden, tidsbesparing, lösningsförslag och AI-djupanalys – på skärmen, direkt.", time: "Direkt" },
  { num: "03", title: "Ladda ner PDF:en", body: "Innehållsrikt underlag att dela med ledning, personal eller styrelse.", time: "1 klick" },
  { num: "04", title: "(Valfritt) Boka genomlysning", body: "Vi går igenom era svar och pekar ut bästa första pilot. Helt kostnadsfritt.", time: "45 min" },
];

const examples = [
  "kundfrågor som besvaras om och om igen",
  "CRM-uppdateringar efter möten och säljsamtal",
  "Excel-listor som uppdateras manuellt",
  "rapporter som sammanställs från flera källor",
  "offerter, avtal eller dokument som följer mallar",
  "fakturor, kostnader eller ärenden som kontrolleras enligt regler",
  "intern kunskap som personal behöver leta efter",
  "uppföljningar till leads som lätt glöms bort",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DigitalDocument",
  name: "Aurora AI-karta",
  description:
    "Kostnadsfri AI-analys för svenska företag. Identifiera vilka processer som kan automatiseras med AI – på några minuter, utan säljmöte.",
  provider: { "@type": "Organization", name: "Aurora Media AB", url: "https://auroramedia.se" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: objections.map((o) => ({
    "@type": "Question",
    name: o.q,
    acceptedAnswer: { "@type": "Answer", text: o.a },
  })),
};

const AiKarta = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Kostnadsfri AI-analys för ditt företag | Aurora Media",
      description:
        "Ta reda på exakt vilka processer i ditt företag som kan automatiseras med AI. Personlig analys + innehållsrik PDF – på några minuter, helt kostnadsfritt.",
      canonical: "/ai-karta",
    });
    setBreadcrumb([
      { name: "Start", url: "/" },
      { name: "AI-kartan", url: "/ai-karta" },
    ]);
    setJsonLd("ai-karta-jsonld", jsonLd);
    setJsonLd("ai-karta-faq-jsonld", faqJsonLd);
  }, []);

  return (
    <NordicLayout>
      <main id="main">

        {/* ============== HERO ============== */}
        <section style={{ paddingTop: "clamp(80px,10vw,140px)", paddingBottom: "clamp(40px,6vw,80px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 14, textTransform: "lowercase" }}>
              kostnadsfri ai-analys · 2 min
            </p>
            <h1 style={{
              fontFamily: F,
              fontSize: "clamp(32px,6vw,72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: C,
              fontWeight: 400,
              maxWidth: 760,
              marginBottom: 16,
            }}>
              Vad i ert företag kan AI sköta åt er?
            </h1>
            <p style={{
              fontFamily: I,
              fontSize: "clamp(15px,1.6vw,18px)",
              lineHeight: 1.6,
              color: "rgba(237,233,220,0.60)",
              maxWidth: 520,
              marginBottom: 24,
            }}>
              Få en personlig analys på <strong style={{ color: C, fontWeight: 500 }}>2 minuter</strong> – topp-3 processer som sparar mest tid hos er, helt kostnadsfritt och utan säljmöte.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/ai-karta/start" className="btn-primary">Starta gratis (2 min) →</Link>
              <Link to="/kontakt" className="btn-ghost">Hellre prata direkt?</Link>
            </div>

            {/* Proof stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
              gap: 1,
              marginTop: 52,
              border: "0.5px solid rgba(237,233,220,0.12)",
              borderRadius: 8,
              overflow: "hidden",
            }}>
              {proofStats.map((s, i) => (
                <div key={s.label} style={{
                  padding: "24px 24px",
                  borderLeft: i > 0 ? "0.5px solid rgba(237,233,220,0.10)" : "none",
                }}>
                  <p style={{ fontFamily: F, fontSize: "clamp(26px,3vw,36px)", color: C, fontWeight: 400, lineHeight: 1, marginBottom: 8 }}>
                    {s.value}
                  </p>
                  <p style={{ fontFamily: I, fontSize: 13, fontWeight: 500, color: "rgba(237,233,220,0.75)", marginBottom: 4 }}>
                    {s.label}
                  </p>
                  <p style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.35)" }}>
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============== PROBLEM ============== */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={RULE} />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <h2 style={{
              fontFamily: F,
              fontSize: "clamp(24px,3.5vw,40px)",
              color: C,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              maxWidth: 640,
              marginBottom: 32,
              lineHeight: 1.15,
            }}>
              Ni vet att AI borde fixa det här. Men vad ska ni börja med?
            </h2>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "0 32px" }}>
              {examples.map((ex, i) => (
                <li key={ex} style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "baseline",
                  padding: "14px 0",
                  borderBottom: "0.5px solid rgba(237,233,220,0.08)",
                }}>
                  <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.28)", flexShrink: 0, paddingTop: 2 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontFamily: I, fontSize: 14, color: "rgba(237,233,220,0.65)", lineHeight: 1.55 }}>
                    {ex}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============== VALUE STACK ============== */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={RULE} />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 12 }}>
              Vad ni får – allt kostnadsfritt
            </p>
            <h2 style={{
              fontFamily: F,
              fontSize: "clamp(24px,3.5vw,40px)",
              color: C,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              maxWidth: 600,
              marginBottom: 36,
              lineHeight: 1.15,
            }}>
              Inte ännu en AI-rapport. <em>Ett färdigt beslutsunderlag.</em>
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
              gap: 10,
            }}>
              {valueStack.map((item, i) => (
                <div
                  key={item.title}
                  style={{
                    padding: "24px 24px",
                    border: "0.5px solid rgba(237,233,220,0.10)",
                    borderRadius: 8,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,233,220,0.025)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <p style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.28)", marginBottom: 12 }}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p style={{ fontFamily: F, fontSize: 18, color: C, marginBottom: 8, lineHeight: 1.2 }}>
                    {item.title}
                  </p>
                  <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.50)", lineHeight: 1.65 }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Mid-page CTA row */}
            <div style={{
              marginTop: 40,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              padding: "28px 28px",
              border: "0.5px solid rgba(237,233,220,0.12)",
              borderRadius: 8,
            }}>
              <div>
                <p style={{ fontFamily: F, fontSize: "clamp(18px,2vw,22px)", color: C, marginBottom: 4 }}>
                  Redo att se vad AI kan göra för er?
                </p>
                <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.40)" }}>
                  Några minuter. Direktanalys. Ingen kontaktinfo krävs förrän ni vill ha PDF:en.
                </p>
              </div>
              <Link to="/ai-karta/start" className="btn-primary" style={{ flexShrink: 0 }}>
                Starta nu →
              </Link>
            </div>
          </div>
        </section>

        {/* ============== HOW IT WORKS ============== */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={RULE} />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>
              Så fungerar det
            </p>
            <h2 style={{
              fontFamily: F,
              fontSize: "clamp(24px,3.5vw,40px)",
              color: C,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              marginBottom: 36,
              lineHeight: 1.15,
            }}>
              Från första klick till färdig AI-plan.
            </h2>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  style={{
                    display: "grid",
                    gap: "8px 40px",
                    padding: "24px 0",
                    borderBottom: i < steps.length - 1 ? "0.5px solid rgba(237,233,220,0.08)" : "none",
                    alignItems: "baseline",
                  }}
                  className="sm:grid-cols-[40px_200px_1fr_80px]"
                >
                  <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)" }}>
                    {step.num}
                  </span>
                  <span style={{ fontFamily: I, fontSize: 14, fontWeight: 500, color: C }}>
                    {step.title}
                  </span>
                  <span style={{ fontFamily: I, fontSize: 13, lineHeight: 1.65, color: "rgba(237,233,220,0.50)" }}>
                    {step.body}
                  </span>
                  <span style={{
                    fontFamily: M,
                    fontSize: 10,
                    letterSpacing: "0.06em",
                    color: "rgba(237,233,220,0.35)",
                    border: "0.5px solid rgba(237,233,220,0.15)",
                    borderRadius: 4,
                    padding: "3px 8px",
                    whiteSpace: "nowrap",
                    justifySelf: "start",
                  }}>
                    {step.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============== FAQ / OBJECTIONS ============== */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={RULE} />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)", maxWidth: 760 }}>
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>
              Vanliga frågor
            </p>
            <h2 style={{
              fontFamily: F,
              fontSize: "clamp(24px,3.5vw,40px)",
              color: C,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              marginBottom: 32,
              lineHeight: 1.15,
            }}>
              Innan ni klickar – det här undrar de flesta.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {objections.map((o, i) => (
                <details
                  key={o.q}
                  style={{
                    borderTop: "0.5px solid rgba(237,233,220,0.10)",
                    borderBottom: i === objections.length - 1 ? "0.5px solid rgba(237,233,220,0.10)" : "none",
                  }}
                >
                  <summary style={{
                    fontFamily: F,
                    fontSize: "clamp(16px,1.8vw,20px)",
                    color: C,
                    fontWeight: 400,
                    padding: "18px 0",
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}>
                    {o.q}
                    <span style={{ fontFamily: M, fontSize: 18, color: "rgba(237,233,220,0.30)", flexShrink: 0, lineHeight: 1 }}>+</span>
                  </summary>
                  <p style={{
                    fontFamily: I,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "rgba(237,233,220,0.55)",
                    paddingBottom: 20,
                    marginTop: -4,
                    maxWidth: 620,
                  }}>
                    {o.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============== FINAL CTA ============== */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={RULE} />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <h2 style={{
              fontFamily: F,
              fontStyle: "italic",
              fontSize: "clamp(26px,4vw,52px)",
              color: C,
              fontWeight: 400,
              letterSpacing: "-0.025em",
              maxWidth: 720,
              lineHeight: 1.1,
              marginBottom: 16,
            }}>
              Några minuter nu kan spara er verksamhet hundratals timmar nästa år.
            </h2>
            <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.40)", marginBottom: 28 }}>
              Helt kostnadsfritt. Inget säljmöte krävs.
            </p>
            <Link to="/ai-karta/start" className="btn-primary">Starta min AI-analys →</Link>
          </div>
        </section>

      </main>
      </NordicLayout>
  );
};

export default AiKarta;

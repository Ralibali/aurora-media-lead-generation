import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta } from "@/lib/seoHelpers";

const Rule = () => <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)" }} />;
const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20, textTransform: "lowercase" }}>{children}</p>
);

const STEPS = [
  {
    num: "01", name: "Samtal", time: "30 min",
    desc: "Ni berättar om problemet eller idén. Vi ställer frågor. Vi säger ja eller nej och varför — ett av de viktigaste momenten. Inget värde i att dra igång ett projekt som inte borde startas.",
    deliverable: "Tydlig bild av om vi ska jobba ihop.",
  },
  {
    num: "02", name: "Offert", time: "< 24h",
    desc: "Skriftligt förslag med fast pris, fast scope och fast deadline. Inga löpande timmar, inga obehagliga överraskningar. Ni vet exakt vad ni betalar och vad ni får.",
    deliverable: "Skriftlig offert med specifikation.",
  },
  {
    num: "03", name: "Bygge", time: "1–6 veckor",
    desc: "Ni har tillgång till live-versionen från dag ett och kan följa varje deploy i realtid. Ingen lång tyst period. Körstämning varje vecka — kort, fokuserat. Moderna AI-verktyg håller tempot uppe.",
    deliverable: "Driftsatt produkt ni kan använda.",
  },
  {
    num: "04", name: "Lansering", time: "1 dag",
    desc: "Domän, repo, databas, dokumentation och drift överlämnas med en genomgång. Allt är ert. Ni kan driva vidare själva, anlita vem som helst, eller fortsätta med oss på supportavtal.",
    deliverable: "Fullständig kodöverlämning.",
  },
];

const DELIVERABLES = [
  "Fullständig källkod i ert GitHub-repo",
  "Databas och alla era data",
  "Domän och DNS-konfiguration",
  "Hosting-konton (Vercel, Supabase, m.fl.)",
  "Teknisk dokumentation",
  "Genomgång vid överlämning",
  "Inga låsningsklausuler",
  "Rätt att modifiera och vidareutveckla",
];

const FAQS = [
  { q: "Vad händer om något går fel under bygget?", a: "Vi kommunicerar det direkt och löser det utan extra kostnad om det är inom scopet. Fast pris finns just för att undvika den friktion som uppstår när varje timme debiteras." },
  { q: "Kan ni ta er an projekt utanför Linköping?", a: "Ja. Vi arbetar med kunder i hela Sverige digitalt. Fysiska möten kan arrangeras vid behov." },
  { q: "Vad äger vi när projektet är klart?", a: "Allt. Källkod, databas, domän, hosting-konton. Vi behåller ingenting. Ni ska inte vara beroende av oss för att er produkt ska leva." },
  { q: "Kan ni ta hand om drift och underhåll?", a: "Ja, vi erbjuder supportavtal för löpande underhåll och vidareutveckling. Det är valfritt, inte obligatoriskt." },
  { q: "Hur snabbt kan ni börja?", a: "Oftast inom en vecka från accepterad offert. Vi kör inte parallella projekt — det är en av anledningarna till att leveranstakten är hög." },
  { q: "Vad ingår inte i fast pris?", a: "Tredjepartstjänster (Stripe, Twilio, externa API:er), domäner och hosting betalas av er direkt. Vi sätter upp allt och guider er." },
];

const Process = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Process — från samtal till lansering på veckor | Aurora Media",
      description: "Hur Aurora Media jobbar: samtal, fast offert, bygge med live-access, fullständig kodöverlämning.",
      canonical: "/process", ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">

        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <Label>process</Label>
            <h1 className="t-h1 c-cream anim-fade-up" style={{ maxWidth: 580 }}>
              Från samtal till live{" "}
              <em>på fyra veckor.</em>
            </h1>
            <p style={{ marginTop: 16, maxWidth: 440, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", fontFamily: "'Inter',system-ui,sans-serif" }}>
              Ni betalar för bygget — inte för att vi lär oss nya ramverk.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <Label>fyra steg</Label>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{
                display: "grid", gap: "12px 32px", padding: "clamp(20px,3vw,32px) 0",
                borderBottom: "0.5px solid rgba(237,233,220,0.08)",
              }} className="sm:grid-cols-[28px_180px_1fr_120px]">
                <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.25)", paddingTop: 3 }}>{s.num}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 4 }}>{s.name}</p>
                  <p style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.30)" }}>{s.time}</p>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.55)", fontFamily: "'Inter',system-ui,sans-serif" }} className="hidden sm:block">{s.desc}</p>
                <p style={{ fontSize: 12, color: "rgba(237,233,220,0.40)", fontFamily: "'Inter',system-ui,sans-serif", lineHeight: 1.5, fontStyle: "italic" }} className="hidden sm:block">{s.deliverable}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Deliverables */}
        <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <Label>vad ni får tillbaka</Label>
            <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(22px,3vw,30px)", color: "#EDE9DC", marginBottom: 32, letterSpacing: "-0.01em" }}>
              Allt är ert. <em>Alltid.</em>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0 }}>
              {DELIVERABLES.map((item, i) => (
                <div key={item} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)" }}>
                  <span style={{ fontSize: 13, color: "rgba(237,233,220,0.25)", fontFamily: "'Inter',system-ui,sans-serif", flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: "rgba(237,233,220,0.70)", fontFamily: "'Inter',system-ui,sans-serif" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <Label>vanliga frågor</Label>
            {FAQS.map((f, i) => (
              <div key={f.q} style={{
                display: "grid", gap: "8px 40px", padding: "22px 0",
                borderBottom: "0.5px solid rgba(237,233,220,0.07)",
              }} className="sm:grid-cols-[1fr_1.4fr]">
                <p style={{ fontSize: 14, fontWeight: 500, color: "#EDE9DC", fontFamily: "'Inter',system-ui,sans-serif" }}>{f.q}</p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.50)", fontFamily: "'Inter',system-ui,sans-serif" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingBlock: "clamp(56px,8vw,88px)" }}>
          <Rule />
          <div className="wrap" style={{ paddingTop: "clamp(40px,6vw,64px)" }}>
            <Label>redo?</Label>
            <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(24px,3.5vw,36px)", color: "#EDE9DC", marginBottom: 10, letterSpacing: "-0.015em" }}>
              Starta med ett samtal.
            </h2>
            <p style={{ fontSize: 13, color: "rgba(237,233,220,0.45)", fontFamily: "'Inter',system-ui,sans-serif", marginBottom: 28, maxWidth: 380 }}>
              30 minuter. Ni berättar. Vi berättar om det är genomförbart och vad det kostar.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
              <a href="https://cal.com" target="_blank" rel="noopener noreferrer" className="btn-ghost">Boka 30 min ↗</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Process;

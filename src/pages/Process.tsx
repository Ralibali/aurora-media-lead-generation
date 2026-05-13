import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta } from "@/lib/seoHelpers";

const STEPS = [
  { num: "01", name: "Samtal", time: "30 min", desc: "Ni berättar om problemet eller idén. Vi ställer frågor. Vi säger ja eller nej och varför.", deliverable: "Tydlig bild av om vi ska jobba ihop." },
  { num: "02", name: "Offert", time: "< 24h", desc: "Skriftligt förslag med fast pris, fast scope och fast deadline. Inga löpande timmar.", deliverable: "Skriftlig offert med specifikation." },
  { num: "03", name: "Bygge", time: "1–6 veckor", desc: "Ni har tillgång till live-versionen från dag ett och kan följa varje deploy i realtid.", deliverable: "Driftsatt produkt ni kan använda." },
  { num: "04", name: "Lansering", time: "1 dag", desc: "Domän, repo, databas, dokumentation och drift överlämnas med en genomgång. Allt är ert.", deliverable: "Fullständig kodöverlämning." },
];

const DELIVERABLES = [
  "Fullständig källkod i ert GitHub-repo", "Databas och alla era data", "Domän och DNS-konfiguration",
  "Hosting-konton (Vercel, Supabase, m.fl.)", "Teknisk dokumentation", "Genomgång vid överlämning",
  "Inga låsningsklausuler", "Rätt att modifiera och vidareutveckla",
];

const FAQS = [
  { q: "Vad händer om något går fel under bygget?", a: "Vi kommunicerar det direkt och löser det utan extra kostnad om det är inom scopet. Fast pris finns just för att undvika den friktion som uppstår när varje timme debiteras." },
  { q: "Kan ni ta er an projekt utanför Linköping?", a: "Ja. Vi arbetar med kunder i hela Sverige digitalt. Fysiska möten kan arrangeras vid behov." },
  { q: "Vad äger vi när projektet är klart?", a: "Allt. Källkod, databas, domän, hosting-konton. Vi behåller ingenting." },
  { q: "Kan ni ta hand om drift och underhåll?", a: "Ja, vi erbjuder supportavtal för löpande underhåll och vidareutveckling. Det är valfritt." },
  { q: "Hur snabbt kan ni börja?", a: "Oftast inom en vecka från accepterad offert. Vi kör inte parallella projekt." },
  { q: "Vad ingår inte i fast pris?", a: "Tredjepartstjänster (Stripe, Twilio, externa API:er), domäner och hosting betalas av er direkt." },
];

const Process = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Process — från samtal till lansering på veckor | Aurora Media",
      description: "Hur Aurora Media jobbar: samtal, fast offert, bygge med live-access, fullständig kodöverlämning.",
      canonical: "/process", ogImage: "/og-image-sv.jpg",
    });
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">process · fyra steg</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "16ch" }}>
              Från samtal till live <span className="it">på fyra veckor.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Ni betalar för bygget — inte för att vi lär oss nya ramverk.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="meta-label">Fyra steg</div>
          <div className="proc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            {STEPS.map((s) => (
              <div key={s.num} className="proc-step">
                <span className="proc-num">{s.num}</span>
                <h3 className="proc-name">{s.name}</h3>
                <p className="mono" style={{ marginBottom: 12 }}>{s.time}</p>
                <p className="body">{s.desc}</p>
                <p className="body" style={{ marginTop: 14, fontStyle: "italic", color: "var(--bone-mute)" }}>{s.deliverable}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Vad ni får tillbaka</div></Reveal>
            <Reveal delay={0.1}><h2 className="h2">Allt är ert. <span className="it">Alltid.</span></h2></Reveal>
          </div>
          <div className="ind-grid">
            {DELIVERABLES.map((item) => (<div key={item} className="ind-cell">→ {item}</div>))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="meta-label">Vanliga frågor</div>
          <div className="feat-list" style={{ marginTop: 28 }}>
            {FAQS.map((f) => (
              <div key={f.q} className="feat-row" style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <p className="feat-title" style={{ marginBottom: 8 }}>{f.q}</p>
                  <p className="feat-body">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Redo?</div>
          <h2 className="h2" style={{ marginTop: 18 }}>Starta med <span className="it">ett samtal.</span></h2>
          <p className="lead" style={{ marginTop: 22 }}>30 minuter. Ni berättar. Vi berättar om det är genomförbart och vad det kostar.</p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Begär offert <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default Process;

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { setSEOMeta, setJsonLd, setBreadcrumb } from "@/lib/seoHelpers";
import { trackEvent } from "@/lib/analytics";
import AiKartaShell from "@/components/aikarta/AiKartaShell";

const BRANSCH_CHIPS = [
  { key: "transport", label: "Transport & logistik" },
  { key: "bygg", label: "Bygg & hantverk" },
  { key: "besok", label: "Besöksnäring" },
  { key: "tillverk", label: "Tillverkning & verkstad" },
  { key: "handel", label: "Handel & e-handel" },
  { key: "tjanste", label: "Tjänsteföretag" },
] as const;

/* ─────────────────────────────────────────────────────────────
   AI-kartan – landning (verkstad-tema)
   ───────────────────────────────────────────────────────────── */

const CSS = `
.aik-wrap { max-width: 1080px; margin: 0 auto; padding-inline: clamp(20px, 4vw, 48px); }
.aik-hero { padding-top: clamp(56px, 8vw, 96px); padding-bottom: clamp(40px, 6vw, 72px); }
.aik-mono {
  font-family: var(--font-mono); font-size: 12.5px; font-weight: 500;
  letter-spacing: .08em; text-transform: uppercase; color: #3E444B;
  display: inline-flex; align-items: center; gap: 8px;
}
.aik-mono::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: #E8500A; display: inline-block;
}
.aik-h1 {
  margin-top: 18px;
  font-family: var(--font-sans); font-weight: 800;
  font-size: clamp(40px, 6vw, 68px); line-height: 1.03;
  letter-spacing: -0.028em; color: #14171A; max-width: 20ch;
}
.aik-h1 em { font-style: normal; color: #0F5132; }
.aik-sub {
  margin-top: 22px; max-width: 56ch;
  font-size: 17px; line-height: 1.6; color: #4A5058;
}
.aik-cta-row { margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap; }
.aik-cta-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 24px; min-height: 48px;
  background: #E8500A; color: #fff !important;
  font-family: var(--font-sans); font-size: 15px; font-weight: 600;
  border-radius: 10px; text-decoration: none; border: none; cursor: pointer;
  transition: background .15s ease;
}
.aik-cta-primary:hover { background: #C64308; }
.aik-cta-primary svg, .aik-cta-primary .arr { color: #fff; }
.aik-cta-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 13px 22px; min-height: 48px;
  color: #14171A; border: 1px solid #14171A; border-radius: 10px;
  text-decoration: none; font-size: 15px; font-weight: 500;
  transition: background .15s ease, color .15s ease;
}
.aik-cta-ghost:hover { background: #14171A; color: #F6F5F1; }
.aik-micro { margin-top: 14px; font-size: 13px; color: #4A5058; }
.aik-bransch { margin-top: 26px; }
.aik-bransch-label {
  display: block;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em;
  text-transform: uppercase; color: #3E444B; margin-bottom: 10px;
}
.aik-bransch-chips { display: flex; flex-wrap: wrap; gap: 8px; max-width: 640px; }
.aik-bransch-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-sans); font-size: 13.5px; font-weight: 600;
  padding: 9px 15px; border-radius: 999px;
  border: 1px solid #14171A; color: #14171A; background: #fff;
  text-decoration: none; transition: background .15s ease, color .15s ease;
}
.aik-bransch-chip:hover { background: #14171A; color: #F6F5F1; }
.aik-bransch-chip .arr { transition: transform .15s ease; }
.aik-bransch-chip:hover .arr { transform: translateX(3px); }
.aik-altband-wrap { background: #F6F5F1; }
.aik-altband {
  display: flex; align-items: center; gap: 16px;
  margin: -18px 0 8px; padding: 16px 20px;
  background: #fff; border: 1px dashed #14171A; border-radius: 14px;
  text-decoration: none; color: #14171A;
  transition: background .15s ease, border-color .15s ease;
}
.aik-altband:hover { background: var(--gran-soft); border-color: var(--gran); }
.aik-altband-badge {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase;
  background: #E8500A; color: #fff; border-radius: 999px; padding: 5px 11px; white-space: nowrap;
}
.aik-altband-text { font-size: 14.5px; line-height: 1.5; color: #3E444B; }
.aik-altband-text strong { color: #14171A; }
.aik-altband-arr { font-size: 20px; margin-left: auto; transition: transform .15s ease; }
.aik-altband:hover .aik-altband-arr { transform: translateX(4px); }
@media (max-width: 640px) { .aik-altband { flex-wrap: wrap; gap: 10px; } .aik-altband-arr { margin-left: 0; } }
.aik-valuechips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.aik-valuechips .chip {
  font-family: "Spline Sans Mono", ui-monospace, monospace; font-size: 11.5px; letter-spacing: .03em;
  padding: 7px 13px; border-radius: 999px; border: 1px solid #E2E0DA; color: #4A5058; background: #fff;
}
.aik-valuechips .chip s { opacity: .75; }
.aik-valuechips .chip.hot { background: #0F5132; border-color: #0F5132; color: #fff; font-weight: 700; }

/* Exempelkarta – statisk mock */
.aik-preview {
  margin-top: 48px;
  border: 1px solid #D8D5CC; border-radius: 14px; overflow: hidden;
  background: #fff;
}
.aik-preview-header {
  padding: 14px 20px; border-bottom: 1px solid #D8D5CC;
  background: #EBE9E3;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.aik-preview-header .label {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em;
  text-transform: uppercase; color: #3E444B;
}
.aik-preview-header .co {
  font-family: var(--font-sans); font-weight: 700; color: #14171A; font-size: 14px;
}
.aik-preview-row {
  display: grid; grid-template-columns: 1fr 100px 90px;
  gap: 16px; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #EBE9E3;
}
.aik-preview-row:last-child { border-bottom: 0; }
.aik-preview-row .name { font-weight: 600; color: #14171A; font-size: 15px; }
.aik-preview-row .name small {
  display: block; margin-top: 2px; font-weight: 400; font-size: 12.5px; color: #4A5058;
}
.aik-preview-bar {
  height: 8px; background: #EBE9E3; border-radius: 4px; overflow: hidden;
}
.aik-preview-bar > i { display: block; height: 100%; background: linear-gradient(90deg, #0F5132, #7FE3B0); }
.aik-preview-score {
  font-family: var(--font-mono); font-size: 13px; color: #14171A;
  text-align: right; font-weight: 600;
}
.aik-flag {
  display: inline-flex; align-items: center; gap: 6px;
  background: #E8500A; color: #fff;
  font-family: var(--font-sans); font-size: 10.5px; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 4px; margin-left: 10px;
}
@media (max-width: 560px) {
  .aik-preview-row { grid-template-columns: 1fr 60px; }
  .aik-preview-bar { display: none; }
}

/* Sektioner */
.aik-section { padding-block: clamp(48px, 7vw, 80px); border-top: 1px solid #D8D5CC; }
.aik-section h2 {
  font-family: var(--font-sans); font-weight: 700;
  font-size: clamp(28px, 4vw, 42px); line-height: 1.1;
  letter-spacing: -0.024em; color: #14171A;
  max-width: 22ch;
}
.aik-section .lead { margin-top: 16px; max-width: 60ch; color: #4A5058; font-size: 16px; }

.aik-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 32px; }
.aik-card {
  background: #fff; border: 1px solid #D8D5CC; border-radius: 12px;
  padding: 22px;
}
.aik-card .num {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em;
  color: #0F5132; text-transform: uppercase;
}
.aik-card h3 {
  margin-top: 10px; font-family: var(--font-sans);
  font-size: 17px; font-weight: 700; color: #14171A; line-height: 1.3;
}
.aik-card p { margin-top: 6px; font-size: 14px; color: #4A5058; line-height: 1.55; }

.aik-steps { margin-top: 28px; display: flex; flex-direction: column; }
.aik-step {
  display: grid; grid-template-columns: 44px 1fr auto;
  gap: 16px; align-items: baseline;
  padding: 20px 0; border-bottom: 1px solid #EBE9E3;
}
.aik-step:last-child { border-bottom: 0; }
.aik-step .n { font-family: var(--font-mono); font-size: 12px; color: #3E444B; letter-spacing: .06em; }
.aik-step .t { font-weight: 700; color: #14171A; font-size: 16px; }
.aik-step .t small { display: block; margin-top: 4px; font-weight: 400; color: #4A5058; font-size: 14px; }
.aik-step .time {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em;
  color: #3E444B; border: 1px solid #D8D5CC; border-radius: 4px; padding: 3px 8px;
  white-space: nowrap;
}

.aik-faq { margin-top: 28px; }
.aik-faq details {
  border-bottom: 1px solid #D8D5CC;
  padding: 18px 0;
}
.aik-faq summary {
  cursor: pointer; list-style: none;
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  font-family: var(--font-sans); font-weight: 600; font-size: 17px; color: #14171A;
}
.aik-faq summary::-webkit-details-marker { display: none; }
.aik-faq summary::after { content: "+"; color: #0F5132; font-size: 22px; line-height: 1; }
.aik-faq details[open] summary::after { content: "−"; }
.aik-faq p { margin-top: 12px; color: #4A5058; font-size: 15px; line-height: 1.65; max-width: 62ch; }

.aik-final {
  margin-top: 56px; padding: clamp(40px, 6vw, 64px);
  background: #14171A; color: #F6F5F1; border-radius: 16px;
}
.aik-final h2 { color: #F6F5F1; max-width: 24ch; }
.aik-final p { margin-top: 14px; color: rgba(246,245,241,.72); max-width: 52ch; font-size: 16px; }
.aik-final .aik-cta-row { margin-top: 22px; }
.aik-final .aik-cta-ghost { color: #F6F5F1; border-color: rgba(246,245,241,.5); }
.aik-final .aik-cta-ghost:hover { background: #F6F5F1; color: #14171A; }

/* Sticky mobil-CTA */
.aik-sticky {
  position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 40;
  box-shadow: 0 12px 32px rgba(0,0,0,.25);
  display: none;
}
@media (max-width: 760px) { .aik-sticky { display: inline-flex; } }
`;

const previewRows = [
  { name: "Fakturaunderlag efter körning", sub: "Manuell sammanställning från Excel + mail", score: 92, flag: true },
  { name: "Svara på ETA-frågor från kunder", sub: "Återkommande frågor, samma info varje gång", score: 78, flag: false },
  { name: "Rapport till ledning varje måndag", sub: "Sammanställs från 3 system", score: 64, flag: false },
];

const valueStack = [
  { t: "Personlig topp-lista", b: "Vilka av era processer som ger störst effekt först – inte en generisk lista." },
  { t: "Konkret tidsbesparing", b: "Beräknat per process, per vecka och per år. Lätt att räkna ROI på." },
  { t: "Förslag på lösning", b: "AI-assistent, automation, dashboard eller integration – med motivering." },
  { t: "Djupanalys", b: "Snabba vinster, risker och rekommenderad ordning på pilotprojekten." },
  { t: "PDF att dela internt", b: "Snyggt formaterad, byggd för ledningsmöte eller workshop." },
  { t: "Metodguide", b: "Aurora Medias 6-stegsmetod för att gå från idé till driftsatt lösning på 2–4 veckor." },
];

const steps = [
  { n: "01", t: "Fyll i AI-kartan online", s: "Några minuter. Lista era vanligaste tidskrävande processer.", time: "2 min" },
  { n: "02", t: "Få analysen direkt", s: "Topp-processer, tidsbesparing, lösningsförslag och AI-djupanalys – på skärmen.", time: "Direkt" },
  { n: "03", t: "Ladda ner PDF:en", s: "Innehållsrikt underlag att dela med ledning, personal eller styrelse.", time: "1 klick" },
  { n: "04", t: "(Valfritt) Boka genomlysning", s: "Vi går igenom kartan tillsammans och pekar ut bästa första pilot.", time: "20 min" },
];

const objections = [
  { q: "Vi är inte tekniska – förstår vi svaren?", a: "Ja. Allt är på vanlig svenska, utan AI-jargong. Du svarar på hur ni jobbar idag – vi översätter till lösningar." },
  { q: "Är det ett sätt att fånga leads för att ringa oss sen?", a: "Nej. Ni får hela analysen och PDF:en direkt på skärmen, utan säljmöte. Vill ni boka en genomlysning är det helt frivilligt." },
  { q: "Vi har redan testat ChatGPT – behöver vi det här?", a: "ChatGPT är ett verktyg. AI-kartan handlar om VAD i er verksamhet som faktiskt sparar tid och pengar att automatisera – och i vilken ordning." },
  { q: "Hur vet ni vad som passar just oss?", a: "Analysen är byggd på era egna svar om frekvens, tid, regelstyrning, data och affärsvärde – samma kriterier som med betalande kunder." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DigitalDocument",
  name: "Aurora AI-karta",
  description:
    "Kostnadsfri AI-kartläggning för svenska företag. Se vilka processer som kan automatiseras med AI – på några minuter, utan säljmöte.",
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
      title: "AI-kartan – gratis AI-kartläggning för svenska företag | Aurora Media",
      description:
        "Svara på några frågor om era flöden. Ni får en konkret karta: vilka processer som går att automatisera, vad de kostar er idag och var ni ska börja.",
      canonical: "https://auroramedia.se/ai-karta",
    });
    setBreadcrumb([
      { name: "Start", url: "/" },
      { name: "AI-kartan", url: "/ai-karta" },
    ]);
    setJsonLd("ai-karta-jsonld", jsonLd);
    setJsonLd("ai-karta-faq-jsonld", faqJsonLd);
  }, []);

  return (
    <AiKartaShell>
      <style>{CSS}</style>

      {/* HERO */}
      <section className="aik-hero">
        <div className="aik-wrap">
          <span className="aik-mono">Gratis · 2 min · Resultat direkt</span>
          <h1 className="aik-h1">
            Vad kan AI <em>automatisera</em> hos er?
          </h1>
          <p className="aik-sub">
            Svara på några frågor om era flöden. Ni får en konkret karta: vilka processer som går att
            automatisera, vad de kostar er idag och var ni ska börja.
          </p>

          {/* Bransch-chips: direkt in i verktyget med rätt exempel ifyllda */}
          <div className="aik-bransch">
            <span className="aik-bransch-label">Starta direkt med er bransch:</span>
            <div className="aik-bransch-chips">
              {BRANSCH_CHIPS.map((c) => (
                <Link
                  key={c.key}
                  to={`/ai-karta/start?bransch=${c.key}`}
                  className="aik-bransch-chip"
                  onClick={() => trackEvent("ai_karta_hero_bransch", { bransch: c.key })}
                >
                  {c.label} <span className="arr">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="aik-cta-row">
            <Link to="/ai-karta/start" className="aik-cta-primary">
              Starta kartläggningen <span className="arr">→</span>
            </Link>
            <Link to="/kontakt" className="aik-cta-ghost">Hellre prata direkt?</Link>
          </div>
          <p className="aik-micro">
            Inget säljsamtal · 4 uppföljande tips via mejl · Avsluta när ni vill
          </p>

          {/* Värdeframgång */}
          <div className="aik-valuechips">
            <span className="chip"><s>Värde som konsult ~12 000 kr</s></span>
            <span className="chip hot">0 kr för dig</span>
            <span className="chip">Personligt svar inom 24 h</span>
          </div>

          {/* Exempelkarta */}
          <div className="aik-preview" aria-label="Exempel på hur er AI-karta kommer se ut">
            <div className="aik-preview-header">
              <span className="label">Exempel · Transportföretag</span>
              <span className="co">AI-karta · 3 processer</span>
            </div>
            {previewRows.map((r) => (
              <div key={r.name} className="aik-preview-row">
                <div className="name">
                  {r.name}
                  {r.flag && <span className="aik-flag">Börja här</span>}
                  <small>{r.sub}</small>
                </div>
                <div className="aik-preview-bar" aria-hidden>
                  <i style={{ width: `${r.score}%` }} />
                </div>
                <div className="aik-preview-score">{r.score}/100</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SNABBVARIANT: fritext för den som inte vill svara på frågor */}
      <section className="aik-altband-wrap">
        <div className="aik-wrap">
          <Link to="/ai-snabbanalys" className="aik-altband" onClick={() => trackEvent("ai_karta_to_snabbanalys")}>
            <span className="aik-altband-badge">Snabbvariant</span>
            <span className="aik-altband-text">
              Vill du hellre bara <strong>beskriva er vardag i fritext</strong>? Vår AI hittar automationscasen åt dig – AI-planen kommer som PDF på mejlen.
            </span>
            <span className="aik-altband-arr" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* VALUE STACK */}
      <section className="aik-section">
        <div className="aik-wrap">
          <span className="aik-mono">Vad ni får – kostnadsfritt</span>
          <h2 style={{ marginTop: 12 }}>Inte ännu en AI-rapport. Ett färdigt beslutsunderlag.</h2>
          <div className="aik-grid">
            {valueStack.map((v, i) => (
              <div key={v.t} className="aik-card">
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.t}</h3>
                <p>{v.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FREE */}
      <section className="aik-section" style={{ background: "#14171A", color: "#F6F5F1" }}>
        <div className="aik-wrap">
          <span className="aik-mono" style={{ color: "rgba(246,245,241,0.55)" }}>Varför gratis?</span>
          <h2 style={{ marginTop: 12, color: "#F6F5F1", maxWidth: "20ch" }}>
            Ärligt svar: det är vår bästa försäljning.
          </h2>
          <p style={{ marginTop: 16, maxWidth: "62ch", color: "rgba(246,245,241,0.8)", fontSize: 17, lineHeight: 1.65 }}>
            En konsult tar 12 000 kr för samma kartläggning. Vi ger den gratis — för ungefär
            var femte kartläggning blir ett byggprojekt, och de kunderna stannar i flera år.
            För er är det riskfritt: ni får ett beslutsunderlag oavsett om vi jobbar ihop eller inte.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
            <Link to="/arbete" className="aik-cta-ghost" style={{ color: "#F6F5F1", borderColor: "rgba(246,245,241,0.35)" }}>
              Se vad vi byggt tidigare →
            </Link>
            <Link to="/oppna-siffror" className="aik-cta-ghost" style={{ color: "#F6F5F1", borderColor: "rgba(246,245,241,0.35)" }}>
              Våra öppna siffror →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="aik-section">
        <div className="aik-wrap">
          <span className="aik-mono">Så fungerar det</span>
          <h2 style={{ marginTop: 12 }}>Från första klick till färdig AI-plan.</h2>
          <div className="aik-steps">
            {steps.map((s) => (
              <div key={s.n} className="aik-step">
                <span className="n">{s.n}</span>
                <span className="t">{s.t}<small>{s.s}</small></span>
                <span className="time">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="aik-section">
        <div className="aik-wrap" style={{ maxWidth: 760 }}>
          <span className="aik-mono">Vanliga frågor</span>
          <h2 style={{ marginTop: 12 }}>Innan ni klickar – det här undrar de flesta.</h2>
          <div className="aik-faq">
            {objections.map((o) => (
              <details key={o.q}>
                <summary>{o.q}</summary>
                <p>{o.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="aik-wrap">
          <div className="aik-final">
            <span className="aik-mono" style={{ color: "rgba(246,245,241,.75)" }}>
              Redo? Det tar 2 minuter.
            </span>
            <h2 style={{ marginTop: 12 }}>Några minuter nu kan spara er hundratals timmar nästa år.</h2>
            <p>Helt kostnadsfritt. Inget säljmöte krävs.</p>
            <div className="aik-cta-row">
              <Link to="/ai-karta/start" className="aik-cta-primary">
                Starta min AI-karta <span className="arr">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky mobil-CTA */}
      <Link to="/ai-karta/start" className="aik-cta-primary aik-sticky" aria-label="Starta gratis AI-analys">
        Starta gratis (2 min) <span className="arr">→</span>
      </Link>
    </AiKartaShell>
  );
};

export default AiKarta;

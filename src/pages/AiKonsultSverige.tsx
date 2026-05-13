import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta } from "@/lib/seoHelpers";

const COMPARE: [string, string][] = [
  ["Workshops och strategi",       "Färdig produkt som används"],
  ["Offert efter analys",          "Fast pris från start"],
  ["3–6 månader",                  "Prototyp på 1–2 veckor"],
  ["Verktygsutbildning",           "System som gör jobbet"],
  ["Konsultberoende",              "Kod och repo ni äger"],
];

const JOURNEY = [
  { n: "01", name: "Idé & scope",      desc: "Vi kokar ner AI-snacket till en tydlig produkt, automation eller intern app." },
  { n: "02", name: "Prototyp",         desc: "Klickbar version snabbt — ni ser vad som ska byggas." },
  { n: "03", name: "MVP",              desc: "Inloggning, databas, betalning, admin och kärnflöden — inget fluff." },
  { n: "04", name: "Integrationer",    desc: "Supabase, Stripe, Brevo, Fortnox, interna API:er och behörigheter." },
  { n: "05", name: "AI-automation",    desc: "Flöden som gör jobbet, inte bara imponerar på en workshop." },
  { n: "06", name: "Kodöverlämning",   desc: "Repo, dokumentation och en grund ni kan bygga vidare på." },
];

const TRUST = [
  { title: "GDPR från start",    desc: "Tydliga roller, datagränser och behörigheter inbyggt." },
  { title: "Riktig datamodell",  desc: "Databas, RLS och struktur som håller för produktion." },
  { title: "Ni äger koden",      desc: "GitHub-repo och frihet att ta produkten vidare." },
  { title: "AI som process",     desc: "Automationer som passar hur bolaget faktiskt jobbar." },
];

const AiKonsultSverige = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "AI-konsult Sverige – vi bygger produkten | Aurora Media AB",
      description: "AI-konsulter pratar strategi. Aurora Media bygger produkten: SaaS, interna appar och AI-automationer med fast pris och kod ni äger.",
      canonical: "/ai-konsult-sverige",
    });
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">ai-konsult sverige · fast pris · kod ni äger</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "18ch" }}>
              AI-konsulter pratar strategi. <span className="it">Vi bygger produkten.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Behöver ni ännu en workshop? Förmodligen inte. Ni behöver ett system, en SaaS eller en automation som faktiskt används. Vi bygger det på veckor — fast pris, modern stack, kod ni äger.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => open()} className="btn btn-moss">
                Begär offert <span className="a"><ArrowRight size={14} /></span>
              </button>
              <Link to="/priser" className="btn btn-ghost">Se fasta paket</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">AI-builder vs AI-konsult</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Skillnaden är <span className="it">enkel.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list" style={{ marginTop: 0 }}>
            {COMPARE.map(([left, right], i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div className="feat-row" style={{ gridTemplateColumns: "60px 1fr 1fr" }}>
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-body" style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: 0.55 }}>
                    <X size={14} style={{ marginTop: 4, flexShrink: 0 }} /> {left}
                  </span>
                  <span className="feat-body" style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--bone)" }}>
                    <Check size={14} style={{ marginTop: 4, color: "var(--moss)", flexShrink: 0 }} /> {right}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Från idé till leverans</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Resan tar <span className="it">veckor</span>, inte månader.</h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {JOURNEY.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <div className="feat-row">
                  <span className="feat-num">{s.n}</span>
                  <span className="feat-title">{s.name}</span>
                  <span className="feat-body">{s.desc}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Varför ni kan lita på oss</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Byggt för <span className="it">produktion.</span></h2>
            </Reveal>
          </div>
          <div className="ind-grid">
            {TRUST.map((t) => (
              <div key={t.title} className="ind-cell" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="meta-label">{t.title}</span>
                <span className="body" style={{ fontSize: "0.9rem" }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Nästa steg</div>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Redo att <span className="it">sluta workshoppa?</span>
          </h2>
          <p className="lead" style={{ marginTop: 22 }}>Offert inom 24 timmar.</p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Begär offert <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default AiKonsultSverige;

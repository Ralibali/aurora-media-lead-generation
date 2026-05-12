import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const COMPARE = [
  ["Workshops och strategi",       "Färdig produkt som används"],
  ["Offert efter analys",          "Fast pris från start"],
  ["3–6 månader",                  "Prototyp på 1–2 veckor"],
  ["Verktygsutbildning",           "System som gör jobbet"],
  ["Konsultberoende",              "Kod och repo ni äger"],
];

const JOURNEY = [
  ["01", "Idé & scope",      "Vi kokar ner AI-snacket till en tydlig produkt, automation eller intern app."],
  ["02", "Prototyp",         "Klickbar version snabbt — ni ser vad som ska byggas."],
  ["03", "MVP",              "Inloggning, databas, betalning, admin och kärnflöden — inget fluff."],
  ["04", "Integrationer",    "Supabase, Stripe, Brevo, Fortnox, interna API:er och behörigheter."],
  ["05", "AI-automation",    "Flöden som gör jobbet, inte bara imponerar på en workshop."],
  ["06", "Kodöverlämning",   "Repo, dokumentation och en grund ni kan bygga vidare på."],
];

const TRUST = [
  { title: "GDPR från start",    desc: "Tydliga roller, datagränser och behörigheter inbyggt." },
  { title: "Riktig datamodell",  desc: "Databas, RLS och struktur som håller för produktion." },
  { title: "Ni äger koden",      desc: "GitHub-repo och frihet att ta produkten vidare." },
  { title: "AI som process",     desc: "Automationer som passar hur bolaget faktiskt jobbar." },
];

const AiKonsultSverige = () => {
  useEffect(() => {
    setSEOMeta({
      title: "AI-konsult Sverige – vi bygger produkten | Aurora Media AB",
      description: "AI-konsulter pratar strategi. Aurora Media bygger produkten: SaaS, interna appar och AI-automationer med fast pris och kod ni äger.",
      canonical: "/ai-konsult-sverige",
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
            <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20 }}>ai-konsult sverige · fast pris · kod ni äger</p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(36px,6vw,64px)", lineHeight: 1.02, letterSpacing: "-0.025em", color: C, fontWeight: 400, maxWidth: 660, marginBottom: 16 }}>
              AI-konsulter pratar strategi.
              <br /><em>Vi bygger produkten.</em>
            </h1>
            <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 480, marginBottom: 32 }}>
              Behöver ni ännu en workshop? Förmodligen inte. Ni behöver ett system, en SaaS eller en automation som faktiskt används. Vi bygger det på veckor — fast pris, modern stack, kod ni äger.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
              <Link to="/priser" className="btn-ghost">Se fasta paket</Link>
            </div>
          </div>
        </section>

        {/* Builder vs Consultant */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 12 }}>ai-builder vs ai-konsult</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>
              Skillnaden är enkel.
            </h2>
            <div style={{ border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "0.5px solid rgba(237,233,220,0.10)", background: "rgba(237,233,220,0.02)" }}>
                <div style={{ padding: "10px 16px", fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)" }}>traditionell ai-konsult</div>
                <div style={{ padding: "10px 16px", fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", borderLeft: "0.5px solid rgba(237,233,220,0.08)" }}>aurora (ai-builder)</div>
              </div>
              {COMPARE.map(([left, right], i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: i < COMPARE.length - 1 ? "0.5px solid rgba(237,233,220,0.07)" : "none" }}>
                  <div style={{ padding: "13px 16px", fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.40)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "rgba(237,233,220,0.20)" }}>✗</span> {left}
                  </div>
                  <div style={{ padding: "13px 16px", fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.75)", borderLeft: "0.5px solid rgba(237,233,220,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "rgba(80,200,120,0.8)" }}>✓</span> {right}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>från idé till leverans</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>Resan tar veckor, inte månader.</h2>
            {JOURNEY.map(([n, name, desc]) => (
              <div key={n} style={{ display: "grid", gap: "8px 40px", padding: "20px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)" }} className="sm:grid-cols-[28px_160px_1fr]">
                <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)" }}>{n}</span>
                <span style={{ fontFamily: I, fontSize: 14, fontWeight: 500, color: C }}>{name}</span>
                <span style={{ fontFamily: I, fontSize: 13, lineHeight: 1.65, color: "rgba(237,233,220,0.50)" }}>{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 28 }}>varför ni kan lita på oss</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 10 }}>
              {TRUST.map((t) => (
                <div key={t.title} style={{ padding: "22px 22px", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6, transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,233,220,0.025)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <p style={{ fontFamily: F, fontSize: 18, color: C, marginBottom: 8 }}>{t.title}</p>
                  <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.50)", lineHeight: 1.6 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <h2 style={{ fontFamily: F, fontStyle: "italic", fontSize: "clamp(22px,3vw,36px)", color: C, marginBottom: 10, letterSpacing: "-0.015em" }}>
              Redo att sluta workshoppa?
            </h2>
            <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.45)", marginBottom: 24 }}>Offert inom 24 timmar.</p>
            <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default AiKonsultSverige;

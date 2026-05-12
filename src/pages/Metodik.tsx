import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setBreadcrumb, setJsonLd, SITE_URL } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const STEPS = [
  { title: "Idé & scope", body: "Vi klipper bort fluffet. Vad ska byggas, vem ska använda det, vad måste fungera i v1 och vad kan vänta? Fast pris och tydlig spec innan start." },
  { title: "Prototyp", body: "En klickbar version snabbt — ni, era medarbetare eller kunden kan känna på flödet. Validering innan produkten blir dyr." },
  { title: "MVP", body: "Första versionen som faktiskt kan användas: login, databas, admin, betalning och kärnfunktioner." },
  { title: "Data & integrationer", body: "Supabase, Stripe, Brevo, Fortnox, interna API:er eller AI-flöden kopplas på. Behörigheter och datagränser sätts tidigt." },
  { title: "QA & lansering", body: "Manuell testning, gränsfall, RLS/behörigheter, prestanda och driftsättning. GitHub-repo, dokumentation och genomgång." },
  { title: "Skala vidare", body: "När riktiga användare börjar använda produkten bygger vi vidare baserat på data — inte gissningar från en workshop." },
];

const PRINCIPLES = [
  { title: "Mindre workshop", desc: "Målet är inte en strategi som samlar damm. Målet är en produkt som används." },
  { title: "Fast pris", desc: "Ni vet vad det kostar innan vi bygger. Scope först, offert sen, kod därefter." },
  { title: "Kod ni äger", desc: "Repo, databasstruktur och dokumentation lämnas över. Ingen vendor lock-in." },
  { title: "Riktig grund", desc: "Auth, behörigheter och integrationer byggs för verklig drift — inte demo." },
];

const TOOLS = [
  { name: "React + TypeScript", use: "Frontend och appar med tydlig struktur och bra underhållbarhet." },
  { name: "Supabase", use: "Postgres, Auth, RLS, Storage och Edge Functions." },
  { name: "Cursor + Claude", use: "Refaktorering, komplex logik och arbete i riktiga repon." },
  { name: "Stripe", use: "Betalflöden, prenumerationer och fakturering." },
  { name: "Brevo / Resend", use: "E-post, notifikationer och marknadsföringsflöden." },
  { name: "Vite + Vercel", use: "Snabba builds och enkel deployment med preview-URLs." },
];

const Metodik = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Metodik – från idé till färdig produkt | Aurora Media",
      description: "Så Aurora Media går från idé till driftsatt produkt. Sex steg, fast pris, ingen onödig byråprocess.",
      canonical: "/metodik",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Metodik", url: "/metodik" }]);
    setJsonLd("metodik-howto", {
      "@context": "https://schema.org", "@type": "HowTo",
      name: "Aurora Produktresan",
      description: "Från idé till fungerande produkt med Aurora Media.",
      step: STEPS.map((s, i) => ({
        "@type": "HowToStep", position: i + 1, name: s.title, text: s.body,
      })),
      author: { "@id": `${SITE_URL}/#organization` },
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">

        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20, textTransform: "lowercase" }}>metodik · aurora produktresan</p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(36px,6vw,60px)", lineHeight: 1.02, letterSpacing: "-0.025em", color: C, fontWeight: 400, maxWidth: 560, marginBottom: 16 }}>
              Från idé till
              <br /><em>använd produkt.</em>
            </h1>
            <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 440, marginBottom: 32 }}>
              En rak process för att bygga SaaS, MVP:er och AI-automationer utan att fastna i månader av möten.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
              <Link to="/priser" className="btn-ghost">Se priser</Link>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>steg för steg</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 32, letterSpacing: "-0.015em" }}>Så går det till.</h2>
            {STEPS.map((s, i) => (
              <div key={s.title} style={{ display: "grid", gap: "8px 40px", padding: "22px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)" }} className="sm:grid-cols-[28px_180px_1fr]">
                <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)", paddingTop: 2 }}>0{i + 1}</span>
                <span style={{ fontFamily: I, fontSize: 14, fontWeight: 500, color: C }}>{s.title}</span>
                <span style={{ fontFamily: I, fontSize: 13, lineHeight: 1.65, color: "rgba(237,233,220,0.55)" }}>{s.body}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>principer</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 32, letterSpacing: "-0.015em" }}>Det här styr varje projekt.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10 }}>
              {PRINCIPLES.map((p) => (
                <div key={p.title} style={{ padding: "clamp(20px,2.5vw,28px)", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6, transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,233,220,0.025)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <p style={{ fontFamily: F, fontSize: "clamp(17px,2vw,20px)", color: C, marginBottom: 8 }}>{p.title}</p>
                  <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.55)", lineHeight: 1.65 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>stack</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 32, letterSpacing: "-0.015em" }}>Verktygen väljs efter jobbet.</h2>
            {TOOLS.map((t) => (
              <div key={t.name} style={{ display: "grid", gap: "8px 40px", padding: "16px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)" }} className="sm:grid-cols-[160px_1fr]">
                <span style={{ fontFamily: I, fontSize: 13, fontWeight: 500, color: C }}>{t.name}</span>
                <span style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.50)", lineHeight: 1.6 }}>{t.use}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 12 }}>nästa steg</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 10, letterSpacing: "-0.015em" }}>
              Redo att börja?
            </h2>
            <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.45)", marginBottom: 24, maxWidth: 380 }}>
              Berätta om projektet. Vi återkommer med offert inom 24 timmar.
            </p>
            <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Metodik;

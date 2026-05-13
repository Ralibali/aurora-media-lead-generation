import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, setJsonLd, SITE_URL } from "@/lib/seoHelpers";

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
  const { open } = useContactModal();
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
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">metodik · aurora produktresan</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "16ch" }}>
              Från idé till <span className="it">använd produkt.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              En rak process för att bygga SaaS, MVP:er och AI-automationer utan att fastna i månader av möten.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => open()} className="btn btn-moss">
                Begär offert <span className="a"><ArrowRight size={14} /></span>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Steg för steg</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2"><span className="it">Så</span> går det till.</h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <div className="feat-row">
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{s.title}</span>
                  <span className="feat-body">{s.body}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Principer</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Det här <span className="it">styr</span> varje projekt.</h2>
            </Reveal>
          </div>
          <div className="card-grid">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="card">
                  <h3 className="h3">{p.title}</h3>
                  <p className="body" style={{ marginTop: 10 }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Stack</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Verktygen väljs <span className="it">efter</span> jobbet.</h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {TOOLS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.04}>
                <div className="feat-row" style={{ gridTemplateColumns: "60px 200px 1fr" }}>
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{t.name}</span>
                  <span className="feat-body">{t.use}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Nästa steg</div>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Redo att <span className="it">börja?</span>
          </h2>
          <p className="lead" style={{ marginTop: 22 }}>Berätta om projektet. Offert inom 24 timmar.</p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Begär offert <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default Metodik;

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, setJsonLd, removeJsonLd } from "@/lib/seoHelpers";

const FAQS = [
  { q: "Är Aurora Media en webbyrå i Linköping?", a: "Ja, Aurora Media AB är baserat i Linköping men jobbar med kunder i hela Sverige. Fokus är inte bara hemsidor — vi bygger SaaS, AI-automationer, interna appar och moderna webbplattformar." },
  { q: "Vad kostar en hemsida eller webbplattform?", a: "Det beror på omfattning. En landningssida är billigare än en plattform med databas, login och integrationer. SaaS och MVP börjar från 14 900 kr för prototyp och 34 900 kr för MVP." },
  { q: "Hur skiljer ni er från en traditionell webbyrå?", a: "Aurora jobbar som AI-builder snarare än klassisk byrå. Mindre workshop, snabbare prototyp, fast pris, modern kodbas och direktkontakt med personen som bygger." },
  { q: "Bygger ni WordPress?", a: "Nej. Vi bygger med React, TypeScript, Supabase och modern hosting. Det ger bättre kontroll, prestanda och ägande." },
];

const BUILDS = [
  "Företagshemsidor med stark SEO och modern design",
  "SaaS och MVP med login, databas och betalning",
  "Interna verktyg som ersätter Excel och manuella flöden",
  "AI-automationer kopplade till riktiga arbetsprocesser",
  "E-handel och betalflöden med Stripe",
  "SEO-hubbar, artiklar och AI-vänlig informationsstruktur",
];

const RELATED = [
  { to: "/ai-konsult-sverige", label: "AI-konsult Sverige" },
  { to: "/priser", label: "Priser & paket" },
  { to: "/arbete", label: "Vårt arbete" },
  { to: "/metodik", label: "Metodik" },
  { to: "/tjanster/hemsidor", label: "Hemsidor" },
  { to: "/tjanster/seo", label: "SEO" },
  { to: "/blogg", label: "Blogg" },
  { to: "/kontakt", label: "Kontakt" },
];

const WebbyraLinkoping = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Webbyrå Linköping – SaaS, webb och AI | Aurora Media",
      description: "Aurora Media är en AI-driven webbyrå i Linköping som bygger SaaS, MVP, hemsidor och AI-automationer. Fast pris, kod ni äger.",
      canonical: "/webbyra-linkoping",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Webbyrå Linköping", url: "/webbyra-linkoping" }]);
    setJsonLd("webbyra-faq", {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    return () => { removeJsonLd("breadcrumb-jsonld"); removeJsonLd("webbyra-faq"); };
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">webbyrå linköping · ai-builder</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "18ch" }}>
              Webbyrå för dig som vill bygga <span className="it">mer än en broschyr.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Hemsidor, SaaS, MVP:er, interna appar och AI-automationer. Mindre byråprocess. Mer färdig produkt.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => open()} className="btn btn-moss">
                Begär offert <span className="a"><ArrowRight size={14} /></span>
              </button>
              <Link to="/ai-konsult-sverige" className="btn btn-ghost">AI-konsult vs AI-builder</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Varför Aurora</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Lokal partner. <span className="it">Modern leverans.</span></h2>
            </Reveal>
          </div>
          <div style={{ display: "grid", gap: "clamp(20px,3vw,40px)", maxWidth: 800 }}>
            <Reveal>
              <p className="lead">
                Aurora Media AB drivs från Linköping. Vi bygger inte bara snygga ytor — vi bygger digitala produkter som kan ha login, databas, betalning, admin, automationer och integrationer.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="body">
                Det innebär en partner som kan ta er från idé till fungerande system utan att ni behöver koordinera designer, utvecklare, SEO-person och projektledare separat.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Vad vi bygger</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Från hemsida till <span className="it">SaaS.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {BUILDS.map((item, i) => (
              <Reveal key={item} delay={i * 0.04}>
                <div className="feat-row" style={{ gridTemplateColumns: "60px 1fr" }}>
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-body">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Vanliga frågor</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Webbyrå i Linköping — <span className="it">FAQ.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.04}>
                <div className="feat-row">
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{f.q}</span>
                  <span className="feat-body">{f.a}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Relaterade sidor</div></Reveal>
            <Reveal delay={0.1}><h2 className="h2">Läs vidare.</h2></Reveal>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {RELATED.map((r) => (
              <Link key={r.to} to={r.to} className="pill">{r.label} →</Link>
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
          <p className="lead" style={{ marginTop: 22 }}>Offert inom 24 timmar.</p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Begär offert <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default WebbyraLinkoping;

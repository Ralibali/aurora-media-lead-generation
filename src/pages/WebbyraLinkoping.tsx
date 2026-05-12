import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setBreadcrumb, setJsonLd, removeJsonLd } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

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
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">

        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20 }}>webbyrå linköping · ai-builder</p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(36px,6vw,60px)", lineHeight: 1.02, letterSpacing: "-0.025em", color: C, fontWeight: 400, maxWidth: 620, marginBottom: 16 }}>
              Webbyrå för dig som vill
              <br /><em>bygga mer än en broschyr.</em>
            </h1>
            <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 460, marginBottom: 32 }}>
              Hemsidor, SaaS, MVP:er, interna appar och AI-automationer. Mindre byråprocess. Mer färdig produkt.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
              <Link to="/ai-konsult-sverige" className="btn-ghost">AI-konsult vs AI-builder</Link>
            </div>
          </div>
        </section>

        {/* Why */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap sm:grid-cols-[1fr_1.2fr]" style={{ display: "grid", gap: "clamp(28px,4vw,56px)" }}>
            <div>
              <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 12 }}>varför aurora</p>
              <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,30px)", color: C, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                Lokal partner. <em>Modern leverans.</em>
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.8, color: "rgba(237,233,220,0.70)" }}>
                Aurora Media AB drivs från Linköping. Jag bygger inte bara snygga ytor — jag bygger digitala produkter som kan ha login, databas, betalning, admin, automationer och integrationer.
              </p>
              <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.8, color: "rgba(237,233,220,0.55)" }}>
                Det innebär en partner som kan ta er från idé till fungerande system utan att ni behöver koordinera designer, utvecklare, SEO-person och projektledare separat.
              </p>
            </div>
          </div>
        </section>

        {/* What we build */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>vad vi bygger</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>
              Från hemsida till SaaS.
            </h2>
            {BUILDS.map((item, i) => (
              <div key={item} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)", alignItems: "center" }}>
                <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.70)" }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 24 }}>vanliga frågor om webbyrå i linköping</p>
            {FAQS.map((f) => (
              <div key={f.q} style={{ display: "grid", gap: "8px 40px", padding: "22px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)" }} className="sm:grid-cols-[1fr_1.4fr]">
                <p style={{ fontFamily: I, fontSize: 14, fontWeight: 500, color: C }}>{f.q}</p>
                <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.50)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related links */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(32px,4vw,48px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 20 }}>relaterade sidor</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 8 }}>
              {RELATED.map((r) => (
                <Link key={r.to} to={r.to}
                  style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.45)", textDecoration: "none", transition: "color 0.15s", padding: "10px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)", display: "block" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.45)")}>
                  {r.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <h2 style={{ fontFamily: F, fontStyle: "italic", fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 20 }}>
              Redo att börja?
            </h2>
            <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default WebbyraLinkoping;

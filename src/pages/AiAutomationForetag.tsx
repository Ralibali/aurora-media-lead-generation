import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setJsonLd, setBreadcrumb } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const PROBLEMS = [
  "Excel-filer som blivit affärskritiska men är svåra att lita på",
  "Kunddata utspridd i mejl, anteckningar, chattar och gamla system",
  "Leads som missas för att uppföljning sker manuellt",
  "Rapporter och administration som tar onödigt många timmar",
  "System som inte pratar med varandra och skapar dubbelarbete",
  "Intern kunskap som finns någonstans — men aldrig där ni behöver den",
];

const SERVICES = [
  { num: "01", name: "AI-genomlysning", desc: "Vi går igenom arbetsflöden, system och rutiner. Ni får en konkret lista på vad som kan automatiseras, vad som ger störst effekt och vad som bör byggas först." },
  { num: "02", name: "Automationer", desc: "Vi kopplar ihop formulär, mejl, CRM, kalkylblad och AI så att repetitiva moment sker automatiskt." },
  { num: "03", name: "Interna system", desc: "När Excel inte räcker bygger vi kundregister, dashboards, offertsystem och interna appar." },
  { num: "04", name: "AI-assistenter", desc: "Vi bygger assistenter för support, sälj och intern kunskap — tränade på företagets egna processer." },
  { num: "05", name: "Säljautomation", desc: "Leadflöden med kvalificering, CRM-koppling, automatiska uppföljningar och dashboards." },
  { num: "06", name: "SaaS och digitala produkter", desc: "Har ni en idé till en SaaS, kundportal eller MVP bygger vi lösningen från strategi till lansering." },
];

const BEFORE_AFTER = [
  ["Leads ligger i inkorgen",     "Leads hamnar direkt i CRM med ansvarig säljare"],
  ["Excel uppdateras manuellt",   "Dashboarden uppdateras automatiskt"],
  ["Kundfrågor skrivs från noll", "AI föreslår svar baserat på er kunskap"],
  ["Offerter tar för lång tid",   "Offertflödet blir snabbare och mer standardiserat"],
  ["Rapporter byggs för hand",    "Rapporter genereras på minuter"],
  ["Information är utspridd",     "Allt samlas i ett modernt arbetsflöde"],
];

const PACKAGES = [
  { name: "AI Start", price: "offert", desc: "AI-genomlysning, 3–5 konkreta automationsmöjligheter, prioriterad färdplan." },
  { name: "Automation Sprint", price: "offert", desc: "Kartläggning, bygge av 1–2 workflows, integrationer, testning och överlämning." },
  { name: "AI Growth System", price: "offert", desc: "Leadflöde, CRM-koppling, AI-kvalificering och automatiska uppföljningar." },
];

const AiAutomationForetag = () => {
  useEffect(() => {
    setSEOMeta({
      title: "AI automation för företag | Automatisera Excel, leads och administration",
      description: "Aurora Media hjälper företag ersätta Excel och manuella rutiner med AI-lösningar, automationer och interna system.",
      canonical: "/ai-automation-foretag",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "AI automation för företag", url: "/ai-automation-foretag" }]);
    setJsonLd("ai-automation-service", {
      "@context": "https://schema.org", "@type": "Service",
      name: "AI automation för företag",
      provider: { "@type": "Organization", name: "Aurora Media AB", url: "https://auroramedia.se" },
      areaServed: "Sverige",
      description: "Aurora Media hjälper företag att ersätta manuella rutiner med AI-lösningar och skräddarsydda system.",
    });
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">

        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20 }}>AI · automation · effektivisering</p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(36px,6vw,64px)", lineHeight: 1.02, letterSpacing: "-0.025em", color: C, fontWeight: 400, maxWidth: 640, marginBottom: 16 }}>
              Från Excel-kaos
              <br /><em>till smarta AI-flöden.</em>
            </h1>
            <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 480, marginBottom: 32 }}>
              Vi hjälper företag ersätta manuella rutiner, gamla system och tidskrävande administration med AI-lösningar och automationer som sparar tid och skapar fler affärer.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/kontakt" className="btn-primary">Boka AI-genomlysning →</Link>
              <Link to="/kontakt" className="btn-ghost">Berätta vad ni vill effektivisera</Link>
            </div>
          </div>
        </section>

        {/* Problems */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>känner ni igen er?</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>
              Det är inte personalen som är problemet.
              <br /><em>Det är arbetsflödena.</em>
            </h2>
            {PROBLEMS.map((p, i) => (
              <div key={p} style={{ display: "flex", gap: 16, padding: "13px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)", alignItems: "center" }}>
                <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.65)" }}>{p}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>det vi bygger</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>
              AI där det faktiskt <em>gör nytta.</em>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 8, overflow: "hidden" }}>
              {SERVICES.map((s, i) => (
                <div key={s.num} style={{
                  padding: "clamp(20px,2.5vw,28px)",
                  borderRight: (i + 1) % 2 === 0 ? "none" : "0.5px solid rgba(237,233,220,0.10)",
                  borderBottom: i < SERVICES.length - 2 ? "0.5px solid rgba(237,233,220,0.10)" : "none",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,233,220,0.025)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)", display: "block", marginBottom: 10 }}>{s.num}</span>
                  <p style={{ fontFamily: F, fontSize: "clamp(17px,2vw,20px)", color: C, marginBottom: 8 }}>{s.name}</p>
                  <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.50)", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before/After */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 24 }}>innan · efter</p>
            <div style={{ border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "rgba(237,233,220,0.02)", borderBottom: "0.5px solid rgba(237,233,220,0.10)" }}>
                <div style={{ padding: "10px 16px", fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.30)" }}>idag</div>
                <div style={{ padding: "10px 16px", fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.30)", borderLeft: "0.5px solid rgba(237,233,220,0.08)" }}>med aurora</div>
              </div>
              {BEFORE_AFTER.map(([before, after], i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: i < BEFORE_AFTER.length - 1 ? "0.5px solid rgba(237,233,220,0.07)" : "none" }}>
                  <div style={{ padding: "12px 16px", fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.40)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "rgba(237,233,220,0.20)" }}>✗</span> {before}
                  </div>
                  <div style={{ padding: "12px 16px", fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.75)", borderLeft: "0.5px solid rgba(237,233,220,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "rgba(80,200,120,0.8)" }}>✓</span> {after}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>upplägg</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>Välj startpunkt.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10 }}>
              {PACKAGES.map((p) => (
                <div key={p.name} style={{ padding: "clamp(20px,2.5vw,28px)", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6, display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontFamily: F, fontSize: "clamp(18px,2vw,22px)", color: C }}>{p.name}</p>
                  <p style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.35)", letterSpacing: "0.06em" }}>pris på {p.price}</p>
                  <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.50)", lineHeight: 1.6, flex: 1 }}>{p.desc}</p>
                  <Link to="/kontakt" className="btn-ghost" style={{ justifyContent: "center", textAlign: "center", fontSize: 12, marginTop: 4 }}>Välj upplägg</Link>
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
              Berätta vad som tar för lång tid.
            </h2>
            <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.45)", marginBottom: 24 }}>Vi återkommer med offert inom 24 timmar.</p>
            <Link to="/kontakt" className="btn-primary">Boka AI-genomlysning →</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default AiAutomationForetag;

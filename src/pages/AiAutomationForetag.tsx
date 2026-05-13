import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setJsonLd, setBreadcrumb } from "@/lib/seoHelpers";

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

const BEFORE_AFTER: [string, string][] = [
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
  const { open } = useContactModal();
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
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">ai · automation · effektivisering</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "18ch" }}>
              Från Excel-kaos till <span className="it">smarta AI-flöden.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Vi hjälper företag ersätta manuella rutiner, gamla system och tidskrävande administration med AI-lösningar och automationer som sparar tid och skapar fler affärer.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => open()} className="btn btn-moss">
                Boka AI-genomlysning <span className="a"><ArrowRight size={14} /></span>
              </button>
              <Link to="/kontakt" className="btn btn-ghost">Berätta vad ni vill effektivisera</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Känner ni igen er?</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Det är inte personalen. <span className="it">Det är arbetsflödena.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {PROBLEMS.map((p, i) => (
              <Reveal key={p} delay={i * 0.04}>
                <div className="feat-row" style={{ gridTemplateColumns: "60px 1fr" }}>
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-body">{p}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Det vi bygger</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">AI där det faktiskt <span className="it">gör nytta.</span></h2>
            </Reveal>
          </div>
          <div className="svc-grid">
            {SERVICES.map((s) => (
              <div key={s.num} className="svc-cell">
                <span className="svc-num">{s.num}</span>
                <h3 className="svc-title">{s.name}</h3>
                <p className="body" style={{ marginTop: 8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Innan · efter</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Hur vardagen <span className="it">förändras.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list" style={{ marginTop: 0 }}>
            {BEFORE_AFTER.map(([before, after], i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div className="feat-row" style={{ gridTemplateColumns: "60px 1fr 1fr" }}>
                  <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="feat-body" style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: 0.55 }}>
                    <X size={14} style={{ marginTop: 4, flexShrink: 0 }} /> {before}
                  </span>
                  <span className="feat-body" style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--bone)" }}>
                    <Check size={14} style={{ marginTop: 4, color: "var(--moss)", flexShrink: 0 }} /> {after}
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
            <Reveal><div className="meta-label">Upplägg</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Välj <span className="it">startpunkt.</span></h2>
            </Reveal>
          </div>
          <div className="price-grid">
            {PACKAGES.map((p) => (
              <div key={p.name} className="price-card">
                <h3>{p.name}</h3>
                <span className="meta-label">Pris på {p.price}</span>
                <p className="body" style={{ marginTop: 18, flex: 1 }}>{p.desc}</p>
                <button onClick={() => open()} className="btn btn-ghost" style={{ marginTop: 24 }}>
                  Välj upplägg <span className="a"><ArrowRight size={14} /></span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Nästa steg</div>
          <h2 className="h2" style={{ marginTop: 18 }}>
            Berätta vad som <span className="it">tar för lång tid.</span>
          </h2>
          <p className="lead" style={{ marginTop: 22 }}>Offert inom 24 timmar.</p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Boka AI-genomlysning <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default AiAutomationForetag;

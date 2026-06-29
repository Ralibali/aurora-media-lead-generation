import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const SERVICES = [
  {
    num: "01", name: "Prototyp och MVP", price: "från 14 900 kr", time: "1–5 veckor",
    desc: "Testa en idé eller lansera den viktigaste fungerande kärnan med riktiga användare, data och en tydlig väg vidare.",
    includes: ["Klickbart huvudflöde", "Databas och användare vid behov", "Admin och kärnfunktion", "Viktigaste integrationen", "Driftsatt testversion", "Kodöverlämning"],
  },
  {
    num: "02", name: "Internt system", price: "pris på offert", time: "2–8 veckor",
    desc: "Ersätt kalkylblad, mejltrådar och dubbelregistrering med ett verktyg byggt efter den verkliga processen.",
    includes: ["Processkartläggning", "Roller och behörigheter", "Databas och API", "Status och historik", "Rapporter och export", "Systemintegrationer"],
  },
  {
    num: "03", name: "AI och automation", price: "pris på offert", time: "1–6 veckor",
    desc: "Låt AI tolka information och låt automation flytta, kontrollera och följa upp data med mänsklig kontroll där den behövs.",
    includes: ["AI-kartläggning", "Dokument- och mejltolkning", "Intern kunskapsassistent", "Regelstyrda flöden", "Loggning och felhantering", "Effektmätning"],
  },
  {
    num: "04", name: "App, SaaS och integrationer", price: "pris på offert", time: "3–10 veckor",
    desc: "Bygg en ny digital produkt eller koppla ihop de system som verksamheten redan använder.",
    includes: ["Webbapp eller React Native", "SaaS och betalningar", "Fortnox, Visma och API", "E-post och notifikationer", "Driftsättning", "Kod ni äger"],
  },
];

const Tjanster = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Tjänster – AI, interna system, SaaS och appar | Aurora Media",
      description: "Aurora Media bygger AI-lösningar, interna verksamhetssystem, SaaS, appar och integrationer med tydligt scope och kod kunden äger.",
      canonical: "/tjanster",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Tjänster", url: "/tjanster" }]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <NordicLayout>
      <div id="main">
        <section className="page-hero">
          <div className="wrap">
            <Reveal><p className="mono">ai · interna system · saas · appar · integrationer</p></Reveal>
            <Reveal delay={0.1}><h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "18ch" }}>Vi bygger lösningen runt <span className="it">arbetsflödet.</span></h1></Reveal>
            <Reveal delay={0.2}><p className="lead" style={{ marginTop: 24 }}>Börja med ett tydligt problem, testa tidigt och bygg vidare när lösningen visar verklig nytta.</p></Reveal>
            <Reveal delay={0.3}><div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}><Link to="/ai-karta" className="btn btn-moss">Gör kostnadsfri AI-karta <ArrowRight size={14} /></Link><button onClick={() => open()} className="btn btn-ghost">Boka rådgivning</button></div></Reveal>
          </div>
        </section>

        {SERVICES.map((service) => (
          <section key={service.num} className="section">
            <div className="wrap">
              <div className="sec-head">
                <Reveal><div><div className="meta-label">{service.num} · {service.price}</div><h2 className="h2" style={{ marginTop: 18 }}>{service.name}<span className="it">.</span></h2><p className="body" style={{ marginTop: 18 }}><span className="meta-label">Typisk tidsplan</span><br /><span style={{ color: "var(--bone)" }}>{service.time}</span></p><button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 24 }}>Diskutera behovet <ArrowRight size={14} /></button></div></Reveal>
                <Reveal delay={0.1}><div><p className="lead" style={{ marginBottom: 28 }}>{service.desc}</p><div className="meta-label" style={{ marginBottom: 14 }}>Kan ingå</div><div className="feat-list" style={{ marginTop: 0 }}>{service.includes.map((item, index) => <div key={item} className="feat-row" style={{ gridTemplateColumns: "60px 1fr" }}><span className="feat-num">{String(index + 1).padStart(2, "0")}</span><span className="feat-body">{item}</span></div>)}</div></div></Reveal>
              </div>
            </div>
          </section>
        ))}

        <section className="cta-band">
          <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
            <div className="meta-label">Osäker på rätt lösning?</div>
            <h2 className="h2" style={{ marginTop: 18 }}>Börja med processen som tar <span className="it">onödig tid.</span></h2>
            <p className="lead" style={{ marginTop: 22 }}>AI-kartan hjälper er skilja mellan AI, automation, integration och ett nytt internt system.</p>
            <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}><Link to="/ai-karta" className="btn btn-moss">Starta AI-kartan <ArrowRight size={14} /></Link><button onClick={() => open()} className="btn btn-ghost">Boka rådgivning</button></div>
          </div>
        </section>
      </div>
    </NordicLayout>
  );
};

export default Tjanster;

import { useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const PACKAGES = [
  { num: "01", name: "Aurora Sprint", modalValue: "Prototyp", price: "Från 14 900 kr", time: "1–2 veckor",
    desc: "Klickbar prototyp eller första fungerande version för att validera idén snabbt.",
    features: ["Produktworkshop light", "Klickbart huvudflöde", "Modern design", "Demo-URL", "Nästa-steg-rekommendation"] },
  { num: "02", name: "Aurora MVP", modalValue: "MVP", price: "Från 34 900 kr", time: "3–5 veckor", featured: true,
    desc: "Lanseringsbar MVP med riktiga användare, data och kärnfunktioner.",
    features: ["Inloggning och autentisering", "Databas", "Admin-panel", "Betalflöde vid behov", "GitHub-repo och dokumentation"] },
  { num: "03", name: "Aurora Scale", modalValue: "Skraddarsytt", price: "Från 89 000 kr", time: "6–10 veckor",
    desc: "Skalbar SaaS eller intern plattform med roller, integrationer och automation.",
    features: ["Skalbar struktur", "Roller och behörigheter", "Tredjepartsintegrationer", "AI-flöden", "Teknisk överlämning"] },
  { num: "04", name: "Aurora AI Ops", modalValue: "Skraddarsytt", price: "Fast offert", time: "Efter scope",
    desc: "AI-automationer och interna verktyg för företag som vill minska manuellt arbete.",
    features: ["Processkartläggning", "AI- och automationsflöden", "API-kopplingar", "Behörighetshantering", "Driftbar lösning"] },
];

const COMPARE = [
  ["Fast pris innan start", true, true, true, true],
  ["Kod/repo ni äger", true, true, true, true],
  ["Klickbar produkt", true, true, true, false],
  ["Databas och autentisering", false, true, true, true],
  ["Betalningar", false, true, true, false],
  ["Roller och behörigheter", false, false, true, true],
  ["Integrationer", false, "Enkel", true, true],
  ["AI-automation", false, "Tillägg", true, true],
] as const;

const Priser = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setSEOMeta({
      title: "Priser – prototyp, MVP och AI-lösningar | Aurora Media",
      description: "Prototyp från 14 900 kr, MVP från 34 900 kr och skalbar lösning från 89 000 kr. Tydligt scope och kod ni äger.",
      canonical: "/priser",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Priser", url: "/priser" }]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <NordicLayout>
      <div id="main">
        <section className="page-hero">
          <div className="wrap">
            <Reveal><p className="mono">priser · tydligt scope · kod ni äger</p></Reveal>
            <Reveal delay={0.1}><h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "16ch" }}>Ni ska veta priset <span className="it">innan vi börjar.</span></h1></Reveal>
            <Reveal delay={0.2}><p className="lead" style={{ marginTop: 24 }}>Vi ramar in scope, pris och leverans. Större eller osäkra projekt börjar med en avgränsad kartläggning.</p></Reveal>
            <Reveal delay={0.3}><div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}><Link to="/ai-karta" className="btn btn-moss">Gör AI-kartan <ArrowRight size={14} /></Link><button onClick={() => open()} className="btn btn-ghost">Boka rådgivning</button></div></Reveal>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="meta-label">Upplägg</div>
            <div className="price-grid" style={{ marginTop: 32, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
              {PACKAGES.map((pack) => <Reveal key={pack.num}><div className={`price-card ${pack.featured ? "featured" : ""}`}>
                {pack.featured && <span className="price-tag">Vanlig start</span>}
                <span className="price-num">{pack.num}</span><h3>{pack.name}</h3><p className="mono" style={{ marginTop: 4 }}>{pack.time}</p>
                <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.6rem", color: "var(--bone)", marginTop: 12 }}>{pack.price}</p>
                <p className="body" style={{ marginTop: 14 }}>{pack.desc}</p>
                <ul className="price-list">{pack.features.map((feature) => <li key={feature}><Check size={14} strokeWidth={2.5} /> {feature}</li>)}</ul>
                <button onClick={() => open(pack.modalValue, { internalNote: `Prisupplägg: ${pack.name}` })} className={`btn ${pack.featured ? "btn-moss" : "btn-ghost"}`}>Diskutera upplägget <ArrowRight size={14} /></button>
              </div></Reveal>)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="meta-label">Jämförelse</div><h2 className="h2" style={{ marginTop: 18 }}>Vad <span className="it">ingår?</span></h2>
            <div style={{ marginTop: 32, overflowX: "auto", border: "1px solid var(--hair)", borderRadius: 10 }}>
              <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", textAlign: "left" }}><thead><tr style={{ borderBottom: "1px solid var(--hair)" }}><th style={{ padding: "14px 18px" }} />{PACKAGES.map((pack) => <th key={pack.num} style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--bone)", whiteSpace: "nowrap" }}>{pack.name}</th>)}</tr></thead><tbody>
                {COMPARE.map((row) => <tr key={row[0] as string} style={{ borderBottom: "1px solid var(--hair)" }}><td style={{ padding: "13px 18px", fontSize: 13, color: "var(--bone-soft)" }}>{row[0]}</td>{(row.slice(1) as (boolean | string)[]).map((value, index) => <td key={index} style={{ padding: "13px 18px", fontSize: 13, color: "var(--bone-soft)" }}>{typeof value === "boolean" ? (value ? <span style={{ color: "var(--moss)" }}>✓</span> : <span style={{ color: "var(--bone-faint)" }}>—</span>) : value}</td>)}</tr>)}
              </tbody></table>
            </div>
          </div>
        </section>

        <section className="cta-band"><div className="wrap" style={{ position: "relative", zIndex: 1 }}><div className="meta-label">Osäker på nivå?</div><h2 className="h2" style={{ marginTop: 18 }}>Kartlägg processen först.</h2><p className="lead" style={{ marginTop: 22 }}>Se om behovet bäst löses med AI, automation, integration eller ett nytt system.</p><Link to="/ai-karta" className="btn btn-moss" style={{ marginTop: 28 }}>Starta AI-kartan <ArrowRight size={14} /></Link></div></section>
      </div>
    </NordicLayout>
  );
};

export default Priser;

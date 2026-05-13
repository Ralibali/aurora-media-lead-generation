import { useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const PACKAGES = [
  { num: "01", name: "Aurora Sprint", price: "Från 14 900 kr", time: "1–2 veckor",
    desc: "Klickbar prototyp eller första fungerande version för att validera idén snabbt.",
    features: ["Produktworkshop light", "Klickbart huvudflöde", "Modern design", "Demo-URL", "Nästa-steg-rekommendation"] },
  { num: "02", name: "Aurora MVP", price: "Från 34 900 kr", time: "3–5 veckor", featured: true,
    desc: "Lanseringsbar MVP med riktiga användare, data och kärnfunktioner.",
    features: ["Inloggning och autentisering", "Databas (Supabase/Postgres)", "Admin-panel", "Betalflöde med Stripe", "GitHub-repo och dokumentation"] },
  { num: "03", name: "Aurora Scale", price: "Från 89 000 kr", time: "6–10 veckor",
    desc: "Skalbar SaaS eller intern plattform med roller, integrationer och automation.",
    features: ["Multi-tenant-struktur", "Roller och behörigheter", "Tredjepartsintegrationer", "AI-flöden", "Teknisk överlämning"] },
  { num: "04", name: "Aurora AI Ops", price: "Fast offert", time: "Variabel",
    desc: "AI-automationer och interna verktyg för företag som vill kapa manuellt arbete.",
    features: ["Processkartläggning", "AI-agent-flöden", "API-kopplingar", "Behörighetshantering", "Driftbar lösning"] },
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
      title: "Priser – SaaS, MVP och AI-automation | Aurora Media",
      description: "Prototyp från 14 900 kr, MVP från 34 900 kr, skalbar SaaS från 89 000 kr. Fast pris, snabb leverans, kod ni äger.",
      canonical: "/priser",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Priser", url: "/priser" }]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <Reveal><p className="mono">priser · fast scope · ingen timrapport</p></Reveal>
          <Reveal delay={0.1}>
            <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5.4vw,4.4rem)", maxWidth: "16ch" }}>
              Ni ska veta priset <span className="it">innan vi börjar.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="lead" style={{ marginTop: 24 }}>
              Inga diffusa timbanker. Vi ramar in scope, pris och leverans — sedan bygger vi en produkt som faktiskt används.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="meta-label">Paket</div>
          <div className="price-grid" style={{ marginTop: 32, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {PACKAGES.map((p) => (
              <Reveal key={p.num}>
                <div className={`price-card ${p.featured ? "featured" : ""}`}>
                  {p.featured && <span className="price-tag">Populärast</span>}
                  <span className="price-num">{p.num}</span>
                  <h3>{p.name}</h3>
                  <p className="mono" style={{ marginTop: 4 }}>{p.time}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.6rem", color: "var(--bone)", marginTop: 12 }}>{p.price}</p>
                  <p className="body" style={{ marginTop: 14 }}>{p.desc}</p>
                  <ul className="price-list">
                    {p.features.map((f) => (<li key={f}><Check size={14} strokeWidth={2.5} /> {f}</li>))}
                  </ul>
                  <button onClick={() => open(p.name)} className={`btn ${p.featured ? "btn-moss" : "btn-ghost"}`}>
                    Välj upplägg <span className="a"><ArrowRight size={14} /></span>
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="meta-label">Jämförelse</div>
          <h2 className="h2" style={{ marginTop: 18 }}>Vad <span className="it">ingår?</span></h2>
          <div style={{ marginTop: 32, overflowX: "auto", border: "1px solid var(--hair)", borderRadius: 10 }}>
            <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--hair)" }}>
                  <th style={{ padding: "14px 18px" }} />
                  {PACKAGES.map((p) => (
                    <th key={p.num} style={{ padding: "14px 18px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--bone)", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row[0] as string} style={{ borderBottom: "1px solid var(--hair)" }}>
                    <td style={{ padding: "13px 18px", fontSize: 13, color: "var(--bone-soft)" }}>{row[0]}</td>
                    {(row.slice(1) as (boolean | string)[]).map((v, i) => (
                      <td key={i} style={{ padding: "13px 18px", fontSize: 13, color: "var(--bone-soft)" }}>
                        {typeof v === "boolean" ? (v ? <span style={{ color: "var(--moss)" }}>✓</span> : <span style={{ color: "var(--bone-faint)" }}>—</span>) : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Osäker på nivå?</div>
          <h2 className="h2" style={{ marginTop: 18 }}>Boka 30 minuter.</h2>
          <p className="lead" style={{ marginTop: 22 }}>
            Ni får ett ärligt svar på om ni behöver prototyp, MVP, scale — eller om idén behöver tänkas om först.
          </p>
          <button onClick={() => open()} className="btn btn-moss" style={{ marginTop: 28 }}>
            Begär offert <span className="a"><ArrowRight size={14} /></span>
          </button>
        </div>
      </section>
    </NordicLayout>
  );
};

export default Priser;

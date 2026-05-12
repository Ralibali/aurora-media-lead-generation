import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const PACKAGES = [
  {
    num: "01", name: "Aurora Sprint", price: "Från 14 900 kr", time: "1–2 veckor",
    desc: "Klickbar prototyp eller första fungerande version för att validera idén snabbt.",
    features: ["Produktworkshop light", "Klickbart huvudflöde", "Modern design", "Demo-URL", "Nästa-steg-rekommendation"],
  },
  {
    num: "02", name: "Aurora MVP", price: "Från 34 900 kr", time: "3–5 veckor", featured: true,
    desc: "Lanseringsbar MVP med riktiga användare, data och kärnfunktioner.",
    features: ["Inloggning och autentisering", "Databas (Supabase/Postgres)", "Admin-panel", "Betalflöde med Stripe", "GitHub-repo och dokumentation"],
  },
  {
    num: "03", name: "Aurora Scale", price: "Från 89 000 kr", time: "6–10 veckor",
    desc: "Skalbar SaaS eller intern plattform med roller, integrationer och automation.",
    features: ["Multi-tenant-struktur", "Roller och behörigheter", "Tredjepartsintegrationer", "AI-flöden", "Teknisk överlämning"],
  },
  {
    num: "04", name: "Aurora AI Ops", price: "Fast offert", time: "Variabel",
    desc: "AI-automationer och interna verktyg för företag som vill kapa manuellt arbete.",
    features: ["Processkartläggning", "AI-agent-flöden", "API-kopplingar", "Behörighetshantering", "Driftbar lösning"],
  },
];

const COMPARE_ROWS = [
  ["Fast pris innan start",        true,  true,  true,  true],
  ["Kod/repo ni äger",             true,  true,  true,  true],
  ["Klickbar produkt",             true,  true,  true,  false],
  ["Databas och autentisering",    false, true,  true,  true],
  ["Betalningar",                  false, true,  true,  false],
  ["Roller och behörigheter",      false, false, true,  true],
  ["Integrationer",                false, "Enkel", true, true],
  ["AI-automation",                false, "Tillägg", true, true],
] as const;

const Priser = () => {
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
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">

        {/* Hero */}
        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20, textTransform: "lowercase" }}>priser · fast scope · ingen timrapport</p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(36px,6vw,60px)", lineHeight: 1.02, letterSpacing: "-0.025em", color: C, fontWeight: 400, maxWidth: 580, marginBottom: 16 }}>
              Ni ska veta priset
              <br /><em>innan vi börjar.</em>
            </h1>
            <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 440, marginBottom: 32 }}>
              Inga diffusa timbanker. Vi ramar in scope, pris och leverans — sedan bygger vi en produkt som faktiskt används.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
              <Link to="/process" className="btn-ghost">Hur processen ser ut</Link>
            </div>
          </div>
        </section>

        {/* Packages */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 28 }}>paket</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10 }}>
              {PACKAGES.map((p) => (
                <div
                  key={p.num}
                  style={{
                    display: "flex", flexDirection: "column",
                    padding: "clamp(20px,3vw,28px)",
                    border: p.featured ? "0.5px solid rgba(237,233,220,0.30)" : "0.5px solid rgba(237,233,220,0.10)",
                    borderRadius: 8,
                    background: p.featured ? "rgba(237,233,220,0.025)" : "transparent",
                    position: "relative",
                  }}
                >
                  {p.featured && (
                    <span style={{ position: "absolute", top: -10, left: 20, fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: C, background: "#100F0D", padding: "0 8px", border: "0.5px solid rgba(237,233,220,0.25)", borderRadius: 3 }}>
                      populärast
                    </span>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)", letterSpacing: "0.06em" }}>{p.num}</span>
                    <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.35)" }}>{p.time}</span>
                  </div>
                  <p style={{ fontFamily: F, fontSize: "clamp(18px,2.2vw,22px)", color: C, lineHeight: 1.2, marginBottom: 6 }}>{p.name}</p>
                  <p style={{ fontFamily: F, fontSize: "clamp(20px,2.5vw,28px)", color: C, lineHeight: 1, marginBottom: 12, fontStyle: "italic" }}>{p.price}</p>
                  <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.50)", lineHeight: 1.6, marginBottom: 20 }}>{p.desc}</p>
                  <ul style={{ flex: 1, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    {p.features.map((f) => (
                      <li key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "rgba(237,233,220,0.40)", flexShrink: 0 }}>→</span>
                        <span style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.65)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/kontakt" className={p.featured ? "btn-primary" : "btn-ghost"} style={{ textAlign: "center", justifyContent: "center" }}>
                    Välj upplägg
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 16 }}>jämförelse</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>Vad ingår?</h2>
            <div style={{ overflowX: "auto", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 8 }}>
              <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid rgba(237,233,220,0.10)", background: "rgba(237,233,220,0.02)" }}>
                    <th style={{ padding: "12px 16px", fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.30)" }}></th>
                    {PACKAGES.map((p) => (
                      <th key={p.num} style={{ padding: "12px 16px", fontFamily: I, fontSize: 12, fontWeight: 500, color: C, whiteSpace: "nowrap" }}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row[0] as string} style={{ borderBottom: "0.5px solid rgba(237,233,220,0.07)" }}>
                      <td style={{ padding: "11px 16px", fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.65)" }}>{row[0]}</td>
                      {(row.slice(1) as (boolean | string)[]).map((v, i) => (
                        <td key={i} style={{ padding: "11px 16px", fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.50)" }}>
                          {typeof v === "boolean" ? (v ? <span style={{ color: "rgba(80,200,120,0.9)" }}>✓</span> : <span style={{ color: "rgba(237,233,220,0.20)" }}>—</span>) : v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ inline */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 20 }}>osäker på nivå?</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 12, letterSpacing: "-0.015em" }}>
              Boka 30 minuter.
            </h2>
            <p style={{ fontFamily: I, fontSize: 14, color: "rgba(237,233,220,0.50)", marginBottom: 28, maxWidth: 420, lineHeight: 1.7 }}>
              Ni får ett ärligt svar på om ni behöver prototyp, MVP, scale — eller om idén behöver tänkas om först.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
              <a href="https://cal.com" target="_blank" rel="noopener noreferrer" className="btn-ghost">Boka 30 min ↗</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Priser;

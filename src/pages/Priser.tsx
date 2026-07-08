import { useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { Reveal, VkNav, VkFooter } from "@/pages/Index";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import "@/styles/verkstad.css";

const PACKAGES = [
  {
    num: "01",
    name: "Aurora Sprint",
    time: "1–2 veckor",
    desc: "Klickbar prototyp eller första fungerande version för att validera idén snabbt.",
    features: [
      "Produktworkshop light",
      "Klickbart huvudflöde",
      "Modern design",
      "Demo-URL",
      "Nästa-steg-rekommendation",
    ],
  },
  {
    num: "02",
    name: "Aurora MVP",
    time: "3–5 veckor",
    featured: true,
    desc: "Lanseringsbar MVP med riktiga användare, data och kärnfunktioner.",
    features: [
      "Inloggning och autentisering",
      "Databas (Supabase/Postgres)",
      "Admin-panel",
      "Betalflöde med Stripe",
      "GitHub-repo och dokumentation",
    ],
  },
  {
    num: "03",
    name: "Aurora Scale",
    time: "6–10 veckor",
    desc: "Skalbar SaaS eller intern plattform med roller, integrationer och automation.",
    features: [
      "Multi-tenant-struktur",
      "Roller och behörigheter",
      "Tredjepartsintegrationer",
      "AI-flöden",
      "Teknisk överlämning",
    ],
  },
  {
    num: "04",
    name: "Aurora AI Ops",
    time: "Variabel",
    desc: "AI-automationer och interna verktyg för företag som vill kapa manuellt arbete.",
    features: [
      "Processkartläggning",
      "AI-agent-flöden",
      "API-kopplingar",
      "Behörighetshantering",
      "Driftbar lösning",
    ],
  },
] as const;


const COMPARE: readonly (readonly [string, boolean | string, boolean | string, boolean | string, boolean | string])[] = [
  ["Fast pris innan start", true, true, true, true],
  ["Kod/repo ni äger", true, true, true, true],
  ["Klickbar produkt", true, true, true, false],
  ["Databas och autentisering", false, true, true, true],
  ["Betalningar", false, true, true, false],
  ["Roller och behörigheter", false, false, true, true],
  ["Integrationer", false, "Enkel", true, true],
  ["AI-automation", false, "Tillägg", true, true],
];

const Priser = () => {
  const { open } = useContactModal();
  useEffect(() => {
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Priser", url: "/priser" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <>
      <SEO
        title="Priser – SaaS, MVP och AI-automation | Aurora Media"
        description="Fast pris, snabb leverans, kod ni äger. Ni får en exakt offert inom 24 timmar — och priset kommer överraska positivt."
        canonical="/priser"
      />
      <div className="verkstad">
        <VkNav />
        <main>
          {/* ── Hero ── */}
          <section className="vk-section vk-hero">
            <div className="vk-wrap">
              <Reveal>
                <p className="vk-mono">priser · fast scope · ingen timrapport</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 style={{ marginTop: 18, maxWidth: "16ch" }}>
                  Ni ska veta priset{" "}
                  <span className="accent" style={{ fontStyle: "italic" }}>
                    innan vi börjar.
                  </span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="vk-hero-sub">
                  Inga diffusa timbanker. Vi ramar in scope, pris och leverans — sedan bygger vi en produkt som faktiskt används.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="vk-hero-cta">
                  <button onClick={() => open()} className="vk-btn vk-btn-primary">
                    Begär offert <ArrowRight size={16} />
                  </button>
                  <a href="#paket" className="vk-btn vk-btn-ghost">
                    Se paket
                  </a>
                </div>
              </Reveal>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ── Paket ── */}
          <section id="paket" className="vk-section">
            <div className="vk-wrap">
              <Reveal>
                <p className="vk-mono">Paket</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14, maxWidth: "18ch" }}>
                  Fyra tydliga upplägg.{" "}
                  <span style={{ color: "var(--gran)", fontStyle: "italic" }}>Fast pris.</span>
                </h2>
              </Reveal>

              <div className="vk-receipts" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                {PACKAGES.map((p, i) => (
                  <Reveal key={p.num} delay={i * 0.06}>
                    <article
                      className="vk-receipt"
                      style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}
                    >
                      {(p as any).featured && <span className="vk-receipt-flag">POPULÄRAST</span>}
                      <span className="vk-receipt-stamp">Fast pris</span>
                      <div className="vk-receipt-tier">{p.num} · {p.time}</div>
                      <h3 style={{ marginTop: 2 }}>{p.name}</h3>
                      <div
                        className="vk-receipt-price"
                        aria-label="Pris döljs – avslöjas i offerten"
                        style={{
                          display: "inline-block",
                          marginTop: 2,
                          padding: "6px 12px",
                          borderRadius: 6,
                          background:
                            "linear-gradient(90deg, var(--granbark) 0 40%, var(--granbark-mut) 40% 70%, var(--granbark) 70% 100%)",
                          color: "transparent",
                          letterSpacing: "0.15em",
                          userSelect: "none",
                        }}
                      >
                        ██ ███:-
                      </div>
                      <p className="vk-mono" style={{ marginTop: 4, color: "var(--gran)", fontSize: 11 }}>
                        Häpnadsväckande bra — får ni i offerten
                      </p>
                      <p className="vk-receipt-desc">{p.desc}</p>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: "6px 0 0",
                          display: "grid",
                          gap: 8,
                          flex: 1,
                        }}
                      >
                        {p.features.map((f) => (
                          <li
                            key={f}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 10,
                              fontFamily: "var(--font-sans)",
                              fontSize: 14,
                              color: "var(--granbark)",
                            }}
                          >
                            <Check
                              size={14}
                              strokeWidth={2.5}
                              style={{ color: "var(--gran)", flexShrink: 0, marginTop: 3 }}
                            />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => open(p.name)}
                        className={`vk-btn ${(p as any).featured ? "vk-btn-primary" : "vk-btn-ghost"}`}
                        style={{ justifyContent: "center", marginTop: 12, width: "100%" }}
                        aria-label={`Få pris i offerten för ${p.name}`}
                      >
                        Få pris i offerten <ArrowRight size={14} />
                      </button>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <hr className="vk-hair" />

          {/* ── Jämförelse ── */}
          <section className="vk-section">
            <div className="vk-wrap">
              <Reveal>
                <p className="vk-mono">Jämförelse</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14 }}>
                  Vad{" "}
                  <span style={{ color: "var(--gran)", fontStyle: "italic" }}>ingår?</span>
                </h2>
              </Reveal>

              <Reveal delay={0.1}>
                <div
                  style={{
                    marginTop: 40,
                    overflowX: "auto",
                    border: "1px solid var(--linje)",
                    borderRadius: 14,
                    background: "#fff",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      minWidth: 680,
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--linje)" }}>
                        <th style={{ padding: "16px 20px" }} />
                        {PACKAGES.map((p) => (
                          <th
                            key={p.num}
                            style={{
                              padding: "16px 20px",
                              fontFamily: "var(--font-mono)",
                              fontSize: 12,
                              color: "var(--granbark)",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              letterSpacing: ".06em",
                              textTransform: "uppercase",
                            }}
                          >
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE.map((row) => (
                        <tr
                          key={row[0]}
                          style={{ borderBottom: "1px solid var(--linje)" }}
                        >
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 14,
                              color: "var(--granbark)",
                              fontWeight: 500,
                            }}
                          >
                            {row[0]}
                          </td>
                          {row.slice(1).map((v, i) => (
                            <td
                              key={i}
                              style={{
                                padding: "14px 20px",
                                fontSize: 14,
                                color: "var(--granbark)",
                              }}
                            >
                              {typeof v === "boolean" ? (
                                v ? (
                                  <Check
                                    size={16}
                                    strokeWidth={2.5}
                                    style={{ color: "var(--gran)" }}
                                  />
                                ) : (
                                  <span style={{ color: "#B7B4A9" }}>—</span>
                                )
                              ) : (
                                <span style={{ color: "var(--granbark-mut)" }}>{v}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── Dark CTA ── */}
          <section className="vk-dark">
            <div className="vk-wrap">
              <Reveal>
                <p className="vk-mono">Osäker på nivå?</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 style={{ marginTop: 14 }}>Boka 30 minuter.</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ marginTop: 20, maxWidth: "58ch", fontSize: 18 }}>
                  Ni får ett ärligt svar på om ni behöver prototyp, MVP, scale — eller om idén behöver tänkas om först.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div style={{ marginTop: 28 }}>
                  <button onClick={() => open()} className="vk-btn vk-btn-primary">
                    Begär offert <ArrowRight size={16} />
                  </button>
                </div>
              </Reveal>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default Priser;

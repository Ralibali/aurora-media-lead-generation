import { useEffect } from "react";
import { Link } from "react-router-dom";
import { VkNav as SiteHeader, VkFooter as SiteFooter } from "@/pages/Index";
import "@/styles/verkstad.css";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#14171A";

const RULE = {
  height: "0.5px",
  background: "#D8D5CC",
  marginBottom: "clamp(40px,6vw,64px)",
} as const;

const eyebrow = {
  fontFamily: M,
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "#4A5058",
  marginBottom: 16,
};

const includes = [
  "Meta Business Manager-uppsättning",
  "Meta Pixel-installation och Conversion API",
  "Custom audiences från din kunddata",
  "Lookalike audiences",
  "1–3 kampanjer med annonsgrupper och annonsmaterial",
  "A/B-test av två annonsmaterial per kampanj",
  "30 dagars uppföljning ingår",
  "Rapport med rekommendationer",
];

const process = [
  { title: "Strategi", body: "Vem köper, vad är värdet av en konvertering, vilka annonsmaterial funkar i din bransch?" },
  { title: "Pixel + tracking", body: "Pixel + CAPI installeras innan vi spenderar en krona på annonser." },
  { title: "Lansering", body: "Mjukstart, justering, full lansering. 5–7 dagar." },
  { title: "Överlämning", body: "Du får tillgång och dokumentation. Vill du att jag optimerar vidare är det ett val." },
];

const faqs = [
  { q: "Hjälper du med annonsmaterial (bilder/video)?", a: "Statiska annonsmaterial ingår. Behöver du video kan jag koppla in fotograf eller hjälpa till med snabba mobilfilmer själv." },
  { q: "Hur stor annonsbudget krävs?", a: "Minst 3 000–5 000 kr/mån för att få stabil data. Mindre och Meta lär sig aldrig din målgrupp." },
  { q: "Vad är CAPI och varför ska jag bry mig?", a: "Conversion API skickar data direkt server-till-server. Med iOS-restriktioner är Pixel ensam inte längre tillförlitlig. CAPI är skillnaden mellan att veta och gissa." },
  { q: "Får jag tillgång till kontot?", a: "Alltid. Det är ditt Business Manager-konto, jag är bara inbjuden som partner." },
];

const related = [
  { name: "Google Ads", price: "3 900 kr setup", to: "/tjanster/google-ads" },
  { name: "Content", price: "1 490 kr/artikel", to: "/tjanster/content" },
  { name: "Fotografering", price: "4 900 kr/halvdag", to: "/tjanster/fotografering" },
];

const MetaAds = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Meta Ads (Facebook + Instagram) från 3 900 kr | Aurora Media",
      description:
        "Setup av Facebook + Instagram-annonser med Meta Pixel, custom audiences och conversion tracking. Fast pris från 3 900 kr.",
      canonical: "/tjanster/meta-ads",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "Meta Ads", url: "/tjanster/meta-ads" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <div className="verkstad" style={{ minHeight: "100vh" }}>
      <a
        href="#main"
        className="skip-link"
        style={{ position: "absolute", left: -9999, top: "auto", width: 1, height: 1, overflow: "hidden" }}
      >
        Hoppa till innehåll
      </a>
      <SiteHeader />
      <main id="main">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="wrap"
          style={{
            paddingTop: "clamp(120px,14vw,160px)",
            paddingBottom: "clamp(64px,8vw,96px)",
          }}
        >
          <p style={eyebrow}>Meta Ads</p>
          <h1
            style={{
              fontFamily: F,
              fontSize: "clamp(2.8rem,6vw,5.5rem)",
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: C,
              maxWidth: 820,
              marginBottom: "clamp(20px,3vw,32px)",
            }}
          >
            Facebook och Instagram-annonser{" "}
            <em style={{ fontStyle: "italic", color: "#3E444B" }}>
              som mäts rätt.
            </em>
          </h1>
          <p
            style={{
              fontFamily: I,
              fontSize: "clamp(1rem,1.8vw,1.2rem)",
              color: "#3E444B",
              lineHeight: 1.7,
              maxWidth: 640,
              marginBottom: "clamp(32px,4vw,48px)",
            }}
          >
            Riktig Pixel-installation, Conversion API och tydliga annonsgrupper. Fast setup från 3&nbsp;900 kr. Inga månadsavgifter du inte beställt.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/kontakt" className="btn-primary">Boka genomgång →</Link>
            <Link to="/priser" className="btn-ghost">Se priser</Link>
          </div>
        </section>

        {/* ── Vad som ingår ────────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(64px,8vw,96px)" }}>
          <div style={RULE} />
          <p style={eyebrow}>vad som ingår</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {includes.map((item, i) => (
              <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                <span style={{ fontFamily: M, fontSize: 10, color: "#8A8578", letterSpacing: "0.05em", minWidth: 24, paddingTop: 3 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: I, fontSize: "clamp(0.9rem,1.4vw,1rem)", color: "#3E444B", lineHeight: 1.6 }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Process ──────────────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(64px,8vw,96px)" }}>
          <div style={RULE} />
          <p style={eyebrow}>så jobbar vi</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "0.5px solid #EBE9E3" }}>
            {process.map((step, i) => (
              <div
                key={step.title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 2fr",
                  gap: "clamp(16px,2vw,32px)",
                  padding: "clamp(20px,3vw,28px) 0",
                  borderBottom: "0.5px solid #EBE9E3",
                  alignItems: "start",
                }}
              >
                <span style={{ fontFamily: M, fontSize: 10, color: "#8A8578", letterSpacing: "0.05em", paddingTop: 3 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: F, fontSize: "clamp(1rem,1.6vw,1.15rem)", fontWeight: 400, color: C, letterSpacing: "-0.01em" }}>
                  {step.title}
                </span>
                <span style={{ fontFamily: I, fontSize: "clamp(0.875rem,1.3vw,0.95rem)", color: "#3E444B", lineHeight: 1.65 }}>
                  {step.body}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(64px,8vw,96px)" }}>
          <div style={RULE} />
          <p style={eyebrow}>vanliga frågor</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "0.5px solid #EBE9E3" }}>
            {faqs.map((faq) => (
              <div
                key={faq.q}
                style={{
                  padding: "clamp(20px,3vw,28px) 0",
                  borderBottom: "0.5px solid #EBE9E3",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "clamp(16px,2vw,48px)",
                }}
              >
                <p style={{ fontFamily: F, fontSize: "clamp(1rem,1.5vw,1.1rem)", fontWeight: 400, color: C, letterSpacing: "-0.01em", lineHeight: 1.4 }}>
                  {faq.q}
                </p>
                <p style={{ fontFamily: I, fontSize: "clamp(0.875rem,1.3vw,0.95rem)", color: "#3E444B", lineHeight: 1.65 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Relaterat ────────────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(64px,8vw,96px)" }}>
          <div style={RULE} />
          <p style={eyebrow}>relaterade tjänster</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {related.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                style={{
                  fontFamily: I,
                  fontSize: 13,
                  color: "#3E444B",
                  textDecoration: "none",
                  border: "0.5px solid #D8D5CC",
                  borderRadius: 6,
                  padding: "8px 16px",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C;
                  e.currentTarget.style.borderColor = "#4A5058";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#3E444B";
                  e.currentTarget.style.borderColor = "#D8D5CC";
                }}
              >
                {r.name} — {r.price}
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(80px,10vw,120px)" }}>
          <div style={RULE} />
          <h2
            style={{
              fontFamily: F,
              fontSize: "clamp(2rem,4vw,3.2rem)",
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              color: C,
              maxWidth: 600,
              marginBottom: "clamp(16px,2vw,24px)",
              lineHeight: 1.15,
            }}
          >
            Tracking rätt från start.
          </h2>
          <p
            style={{
              fontFamily: I,
              fontSize: "clamp(0.95rem,1.5vw,1.05rem)",
              color: "#3E444B",
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: "clamp(24px,3vw,36px)",
            }}
          >
            Berätta målgrupp och erbjudande så skissar jag kampanjvinkel och funnel.
          </p>
          <Link to="/kontakt" className="btn-primary">Kontakta mig →</Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default MetaAds;

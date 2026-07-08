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
  "Google Ads-konto och faktureringssetup",
  "Sökordsanalys för din nisch",
  "1–3 sökkampanjer med ad groups, annonser, extensions",
  "Performance Max-kampanj om relevant",
  "Conversion tracking via GA4 + Google Tag Manager",
  "Negativa sökord-lista från start",
  "30 dagars uppföljning ingår",
  "Rapport och rekommendationer",
];

const process = [
  { title: "Strategi", body: "30 min samtal: vad säljer du, till vem, vad är värdet av en konvertering?" },
  { title: "Setup", body: "Konto, kampanjer, annonser, tracking. 3–5 dagar." },
  { title: "Lansering", body: "Mjukstart med liten budget. Justeringar dag 3 och 7." },
  { title: "Överlämning", body: "Du får tillgång till kontot. Vill du att jag fortsätter? Det är ett val, inte ett tvång." },
];

const faqs = [
  { q: "Hur stor budget bör jag ha?", a: "Minst 5 000–10 000 kr/mån i annonsbudget för att få meningsfull data inom rimlig tid. Mindre än så och vi gissar." },
  { q: "Kan jag göra det själv efter setup?", a: "Ja. Du får full tillgång till kontot, jag dokumenterar struktur och varför. Många kör vidare själv efter tre månader." },
  { q: "Krävs det att jag har Analytics?", a: "Nej, jag sätter upp GA4 och Tag Manager om du inte har det. Ingår i setup." },
  { q: "Jobbar du med Performance Max?", a: "Ja, men bara när det passar. Pmax är inte alltid rätt val – det är en strategifråga vi reder ut i steg 1." },
];

const related = [
  { name: "Meta Ads", price: "3 900 kr setup", to: "/tjanster/meta-ads" },
  { name: "SEO", price: "Från 4 900 kr", to: "/tjanster/seo" },
  { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
];

const GoogleAds = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Google Ads från 3 900 kr setup | Aurora Media Linköping",
      description:
        "Google Ads-setup, sökkampanjer, Performance Max, conversion tracking. Fast pris från 3 900 kr. Optimering 2 490 kr/mån.",
      canonical: "/tjanster/google-ads",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "Google Ads", url: "/tjanster/google-ads" },
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
          <p style={eyebrow}>Google Ads</p>
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
            Annonser som{" "}
            <em style={{ fontStyle: "italic", color: "#3E444B" }}>
              faktiskt konverterar.
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
            Sök- och Performance Max-kampanjer med fast pris. Setup från 3&nbsp;900 kr. Inga 6-månadersbindningar.
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
                <span style={{ fontFamily: M, fontSize: 10, color: "#4A5058", letterSpacing: "0.05em", minWidth: 24, paddingTop: 3 }}>
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
                <span style={{ fontFamily: M, fontSize: 10, color: "#4A5058", letterSpacing: "0.05em", paddingTop: 3 }}>
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
            Sluta gissa. Börja mäta.
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
            Skicka mål, budget och nuvarande konto så får du en konkret struktur istället för gissningar.
          </p>
          <Link to="/kontakt" className="btn-primary">Kontakta mig →</Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default GoogleAds;

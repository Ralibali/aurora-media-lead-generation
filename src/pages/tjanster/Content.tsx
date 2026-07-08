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
  "1 200–1 800 ord per artikel",
  "Sökordsanalys för varje rubrik",
  "Tydlig struktur (H2/H3, listor, FAQ-sektion)",
  "Internlänkning till befintligt innehåll",
  "Optimerad meta-titel och beskrivning",
  "Faktagranskning av relevanta uppgifter",
  "Levererat som markdown eller direkt i WordPress",
  "Två revisionsrundor ingår",
];

const process = [
  { title: "Brief", body: "Du säger ämne och målgrupp. Jag föreslår vinkel och sökord." },
  { title: "Utkast", body: "AI-genererat utkast inom några timmar. Du läser och tipsar om vinkel." },
  { title: "Redigering", body: "Jag finputsar manuellt – ton, fakta, citat, exempel." },
  { title: "Leverans", body: "Markdown, Word eller direkt i ditt CMS – samma dag." },
];

const faqs = [
  { q: "Är det inte uppenbart AI-skrivet?", a: "Inte med min process. AI gör utkast, jag skriver om allt som låter generiskt – meningsstruktur, exempel, ton. Lägg gärna en blindtest-artikel mot din befintliga byrås text och jämför." },
  { q: "Vilka ämnen klarar du?", a: "Jag kan skriva om de flesta ämnen eftersom jag grundar alla texter på vetenskapliga artiklar, branschrapporter och primärkällor. Jag faktagranskar alltid noggrant och anger källor när det behövs. För djupt nischade områden, som avancerad medicin eller juridik på paragrafnivå, erbjuder jag istället en expertintervju eller granskning av en sakkunnig." },
  { q: "Vem äger texten?", a: "Du. Helt och hållet. Jag använder den inte någon annanstans." },
  { q: "Kan jag få bilder också?", a: "Ja, jag kan generera AI-bilder eller koppla in fotograf. Diskuteras per artikel." },
];

const related = [
  { name: "SEO", price: "Från 4 900 kr", to: "/tjanster/seo" },
  { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
  { name: "Grafisk profil", price: "Från 5 900 kr", to: "/tjanster/grafisk-profil" },
];

const Content = () => {
  useEffect(() => {
    setSEOMeta({
      title: "SEO-content från 995 kr/artikel | Aurora Media Linköping",
      description:
        "SEO-optimerade artiklar 1 200–1 800 ord, levererade inom en dag. AI-skrivet, mänskligt redigerat. Volymrabatt vid pakets-köp.",
      canonical: "/tjanster/content",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "Content", url: "/tjanster/content" },
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
          <p style={eyebrow}>Content</p>
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
            SEO-artiklar som{" "}
            <em style={{ fontStyle: "italic", color: "#3E444B" }}>
              faktiskt rankar.
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
            SEO-optimerade artiklar skrivna med AI och redigerade av en människa. 1&nbsp;200–1&nbsp;800 ord, klar inom en dag. Från 995 kr/artikel.
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
                <span style={{ fontFamily: I, fontSize: "clamp(0.9rem,1.4vw,1rem)", color: "rgba(237,233,220,0.72)", lineHeight: 1.6 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "0.5px solid rgba(237,233,220,0.10)" }}>
            {process.map((step, i) => (
              <div
                key={step.title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 2fr",
                  gap: "clamp(16px,2vw,32px)",
                  padding: "clamp(20px,3vw,28px) 0",
                  borderBottom: "0.5px solid rgba(237,233,220,0.10)",
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
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "0.5px solid rgba(237,233,220,0.10)" }}>
            {faqs.map((faq) => (
              <div
                key={faq.q}
                style={{
                  padding: "clamp(20px,3vw,28px) 0",
                  borderBottom: "0.5px solid rgba(237,233,220,0.10)",
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
                  border: "0.5px solid rgba(237,233,220,0.15)",
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
            Skicka ett ämne, få en artikel.
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
            Berätta om ämne och målgrupp så föreslår jag vinkel och sökord – kostnadsfritt.
          </p>
          <Link to="/kontakt" className="btn-primary">Kontakta mig →</Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default Content;

import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setJsonLd, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const RULE = {
  height: "0.5px",
  background: "rgba(237,233,220,0.12)",
  marginBottom: "clamp(40px,6vw,64px)",
} as const;

const eyebrow = {
  fontFamily: M,
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "rgba(237,233,220,0.35)",
  marginBottom: 16,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "React Native apputveckling",
  provider: {
    "@type": "Organization",
    name: "Aurora Media AB",
    url: "https://auroramedia.se",
  },
  areaServed: "Sverige",
  serviceType: "Mobilapputveckling, React Native, appar för iOS och Android",
  description:
    "Aurora Media bygger moderna appar med React Native för företag som vill lansera skalbara mobilappar, interna appar, kundappar och AI-drivna mobila lösningar.",
};

const includes = [
  "React Native-app för iOS och Android med en kodbas",
  "Snabb utveckling utan att kompromissa med känsla eller prestanda",
  "Kopplingar till API:er, Supabase, Stripe, CRM och AI-flöden",
  "Tydlig produktstrategi, UX och teknikval innan vi bygger",
  "Kodstruktur som går att vidareutveckla, äga och skala",
  "Lanseringsfokus från dag ett – inte bara en snygg prototyp",
];

const process = [
  { title: "Strategi", body: "Vi reder ut om du faktiskt behöver app, PWA eller bara bättre mobil webb. Scope, plattform och teknik väljs utifrån affären." },
  { title: "Design & UX", body: "Flöden, skärmar och interaktioner designas. Du ser och testar löpande." },
  { title: "Bygg", body: "React Native-appen byggs med native känsla för både iOS och Android. Integrationer kopplas på." },
  { title: "Lansering", body: "App Store och Google Play-publicering, testflöde, feedback och överlämning med fullständig dokumentation." },
];

const faqs = [
  { q: "Behöver jag verkligen en app?", a: "Inte alltid. Om behovet kan mötas av en snabb webbsajt eller PWA säger jag det. App passar bäst när du behöver pushnotiser, offline-funktioner, kameraåtkomst eller en stark appupplevelse." },
  { q: "Hur lång tid tar det att bygga en app?", a: "En enkel MVP tar 4–8 veckor. Mer komplexa appar med login, betalning och integrationer tar längre. Vi sätter scope innan vi sätter tidsplan." },
  { q: "Äger jag koden?", a: "Ja. Du får hela kodbas, repo och dokumentation. Du ska inte bli beroende av Aurora Media för att vidareutveckla." },
  { q: "Kan appen kopplas till AI-funktioner?", a: "Ja. Vi kan integrera AI-flöden, OpenAI, Anthropic eller dina egna modeller direkt i appen." },
];

const related = [
  { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
  { name: "E-handel", price: "Shopify eller skräddarsytt", to: "/tjanster/ehandel" },
  { name: "SEO", price: "Från 2 490 kr", to: "/tjanster/seo" },
];

const Mobilapp = () => {
  useEffect(() => {
    setSEOMeta({
      title: "React Native apputveckling | Appar för iOS och Android | Aurora Media",
      description:
        "Aurora Media är experter på React Native och bygger moderna appar för iOS och Android: kundappar, interna appar, MVP:er, SaaS-appar och AI-drivna mobila lösningar.",
      canonical: "/tjanster/mobilapp",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "Mobilappar", url: "/tjanster/mobilapp" },
    ]);
    setJsonLd("react-native-app-service", jsonLd);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
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
          <p style={eyebrow}>React Native · iOS · Android</p>
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
            Appar byggda av experter,{" "}
            <em style={{ fontStyle: "italic", color: "rgba(237,233,220,0.65)" }}>
              kod du äger.
            </em>
          </h1>
          <p
            style={{
              fontFamily: I,
              fontSize: "clamp(1rem,1.8vw,1.2rem)",
              color: "rgba(237,233,220,0.60)",
              lineHeight: 1.7,
              maxWidth: 640,
              marginBottom: "clamp(32px,4vw,48px)",
            }}
          >
            Aurora Media bygger moderna mobilappar med React Native för företag som vill lansera snabbt, skala smart och äga sin kod – för iOS och Android med en kodbas.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/kontakt" className="btn-primary">Boka appgenomgång →</Link>
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
                <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)", letterSpacing: "0.05em", minWidth: 24, paddingTop: 3 }}>
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
                <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)", letterSpacing: "0.05em", paddingTop: 3 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: F, fontSize: "clamp(1rem,1.6vw,1.15rem)", fontWeight: 400, color: C, letterSpacing: "-0.01em" }}>
                  {step.title}
                </span>
                <span style={{ fontFamily: I, fontSize: "clamp(0.875rem,1.3vw,0.95rem)", color: "rgba(237,233,220,0.55)", lineHeight: 1.65 }}>
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
                <p style={{ fontFamily: I, fontSize: "clamp(0.875rem,1.3vw,0.95rem)", color: "rgba(237,233,220,0.55)", lineHeight: 1.65 }}>
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
                  color: "rgba(237,233,220,0.55)",
                  textDecoration: "none",
                  border: "0.5px solid rgba(237,233,220,0.15)",
                  borderRadius: 6,
                  padding: "8px 16px",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C;
                  e.currentTarget.style.borderColor = "rgba(237,233,220,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(237,233,220,0.55)";
                  e.currentTarget.style.borderColor = "rgba(237,233,220,0.15)";
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
            Från appidé till riktig produkt.
          </h2>
          <p
            style={{
              fontFamily: I,
              fontSize: "clamp(0.95rem,1.5vw,1.05rem)",
              color: "rgba(237,233,220,0.55)",
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: "clamp(24px,3vw,36px)",
            }}
          >
            Vi tar reda på om du faktiskt behöver app, PWA eller bara bättre mobil webb – och bygger sedan rätt sak.
          </p>
          <Link to="/kontakt" className="btn-primary">Kontakta mig →</Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default Mobilapp;

import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

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

const includes = [
  "Modern React/TypeScript-sajt utan mall-låsning",
  "Responsiv design för mobil, surfplatta och desktop",
  "SEO-grund med metadata, sitemap, struktur och prestanda",
  "Snabb hosting och SSL via modern plattform",
  "Kontaktflöde, CTA-struktur och mätning",
  "Möjlighet till blogg/innehållsnav för organisk trafik",
  "Kan byggas vidare till app, SaaS eller kundportal",
  "Källkod och dokumentation lämnas över",
];

const process = [
  { title: "Scope", body: "Vi bestämmer vad sajten ska göra: sälja, förklara, generera leads, ranka på Google eller fungera som bas för en produkt." },
  { title: "Struktur", body: "Jag sätter sidstruktur, budskap, SEO-grund och CTA-flöden så sajten inte bara blir snygg utan också användbar." },
  { title: "Bygg", body: "Sajten byggs i riktig kod med snabb preview-länk. Du kan se och testa löpande istället för att vänta på statiska skisser." },
  { title: "Lansering", body: "Domän, SSL, metadata, mätning, sitemap och överlämning fixas innan sidan går live." },
];

const faqs = [
  { q: "Är det WordPress?", a: "Nej, huvudspåret är React/TypeScript med modern hosting. Det passar bäst när du vill ha prestanda, kontroll och möjlighet att bygga vidare till app eller plattform." },
  { q: "Kan jag uppdatera innehåll själv?", a: "Ja. Beroende på behov kan vi lägga till CMS, enkel datakälla eller ett adminflöde." },
  { q: "Äger jag sajten?", a: "Ja. Du får kod, repo och dokumentation. Du ska inte bli låst till Aurora Media." },
  { q: "Kan hemsidan bli en app eller SaaS senare?", a: "Ja. Det är en av poängerna med att bygga i riktig kod istället för mallverktyg." },
  { q: "Vad kostar det?", a: "Det beror på omfattning. En enkel landningssida är mindre. En webbplattform med login, databas eller betalning hamnar närmare MVP-upplägget." },
];

const related = [
  { name: "AI-konsult Sverige", price: "Från strategi till produkt", to: "/ai-konsult-sverige" },
  { name: "SEO", price: "Teknisk SEO och content", to: "/tjanster/seo" },
  { name: "Priser", price: "Se aktuella paket", to: "/priser" },
  { name: "Kontakt", price: "Boka AI-genomgång", to: "/kontakt" },
];

const Hemsidor = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Hemsidor & webbplattformar – modern React-sajt | Aurora Media",
      description:
        "Aurora Media bygger moderna hemsidor, landningssidor och webbplattformar med React, SEO, snabb laddning och kod kunden äger. För svenska företag som vill växa digitalt.",
      canonical: "/tjanster/hemsidor",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "Hemsidor", url: "/tjanster/hemsidor" },
    ]);
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
          <p style={eyebrow}>Webb &amp; plattformar</p>
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
            Hemsidor som känns som en produkt,{" "}
            <em style={{ fontStyle: "italic", color: "rgba(237,233,220,0.65)" }}>
              inte en mall.
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
            Modern React-sajt, landningssida eller webbplattform byggd med samma tänk som en SaaS: snabb, sökbar, konverterande och med kod du äger. För företag som vill mer än att bara ha en digital broschyr.
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
            Bygg en sajt som kan växa vidare.
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
            Skriv vad sajten ska göra: sälja, ranka, förklara eller bli en plattform. Jag svarar med konkret nästa steg.
          </p>
          <Link to="/kontakt" className="btn-primary">Kontakta mig →</Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default Hemsidor;

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
  "Plattformsval: Shopify, Stripe eller skräddarsydd lösning",
  "Produkt- och kategoristruktur",
  "Betalflöde med kort, Klarna, Swish eller Stripe där det passar",
  "Frakt-, order- och kundflöden",
  "Mobiloptimerad köpupplevelse",
  "SEO-grund för produkter och kategorier",
  "Mätning: Google Analytics, Meta Pixel och konverteringar",
  "Möjlighet till Fortnox, Brevo, Klaviyo eller andra integrationer",
];

const process = [
  { title: "Affärsflöde", body: "Vi går igenom vad du säljer, hur betalning/frakt ska fungera och vilka system e-handeln måste prata med." },
  { title: "Tekniskt val", body: "Shopify om det är smartast. Egen lösning om regler, checkout eller data kräver mer kontroll." },
  { title: "Bygg & kopplingar", body: "Butik, produktstruktur, betalning, mätning, e-postflöden och integrationer byggs ihop." },
  { title: "Lansering", body: "Mjukstart, testköp, spårning, justeringar och överlämning så du kan börja sälja tryggt." },
];

const faqs = [
  { q: "Shopify eller egen lösning?", a: "Shopify är ofta bäst när du vill sälja standardprodukter snabbt. Egen lösning passar när du har specialregler, kundportal, avancerad checkout eller vill äga hela flödet." },
  { q: "Kan ni koppla Klarna, Swish eller Stripe?", a: "Ja. Exakt betalflöde beror på plattform och affärsmodell. Stripe är ofta bäst för SaaS och skräddarsydda flöden, medan Shopify har färdiga alternativ." },
  { q: "Hjälper ni med annonsering?", a: "Ja. Google Ads och Meta Ads kan kopplas på tillsammans med rätt tracking och landningssidor." },
  { q: "Kan e-handeln bli en app senare?", a: "Ja. Om produkten behöver återkommande användning, pushnotiser eller appkänsla kan vi bygga PWA eller app-liknande lösning senare." },
  { q: "Äger jag koden?", a: "Om vi bygger skräddarsytt får du repo och kod. Om vi bygger på Shopify äger du butiken och kontot, men själva Shopify-plattformen är förstås extern." },
];

const related = [
  { name: "Google Ads", price: "Kampanj och tracking", to: "/tjanster/google-ads" },
  { name: "Meta Ads", price: "Facebook och Instagram", to: "/tjanster/meta-ads" },
  { name: "SEO", price: "Produkt- och kategorisynlighet", to: "/tjanster/seo" },
  { name: "Kontakt", price: "Boka AI-genomgång", to: "/kontakt" },
];

const Ehandel = () => {
  useEffect(() => {
    setSEOMeta({
      title: "E-handel, Shopify och Stripe-lösningar | Aurora Media",
      description:
        "Aurora Media bygger e-handel, Shopify-flöden och skräddarsydda Stripe-lösningar med SEO, mätning, betalning och integrationer för svenska företag.",
      canonical: "/tjanster/ehandel",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "E-handel", url: "/tjanster/ehandel" },
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
          <p style={eyebrow}>E-handel &amp; betalflöden</p>
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
            E-handel som kan{" "}
            <em style={{ fontStyle: "italic", color: "#3E444B" }}>
              sälja, mäta och växa.
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
            Shopify, Stripe eller skräddarsydd checkout beroende på vad du faktiskt behöver. Fokus är inte bara en snygg butik — utan produktstruktur, betalflöde, mätning och en grund som går att skala.
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
            Bygg en butik som faktiskt säljer.
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
            Berätta kort om sortiment, betalflöde och nuläge så tar vi fram rätt nivå – Shopify, Stripe eller skräddarsytt.
          </p>
          <Link to="/kontakt" className="btn-primary">Kontakta mig →</Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default Ehandel;

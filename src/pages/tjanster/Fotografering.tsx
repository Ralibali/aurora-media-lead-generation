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
  "Halvdag (4 timmar) eller heldag (8 timmar) på plats",
  "Råbilder + 30 redigerade per halvdag",
  "Webb- och tryckformat (JPG + RAW)",
  "Fri användning för ditt företag",
  "Porträtt, miljö, produktfoto eller mix",
  "Stativ, ljus, snabb objektiv på plats",
  "Lokalt: ingen reseersättning inom Linköping",
  "Levererat via WeTransfer eller Drive",
];

const process = [
  { title: "Brief", body: "20 min samtal: vad ska bilderna användas till, vilken känsla." },
  { title: "Plats & dag", body: "Vi bestämmer plats och tid. Inomhus, utomhus eller mix." },
  { title: "Fotografering", body: "Halvdag eller heldag, du är med och styr eller låter mig jobba." },
  { title: "Leverans", body: "Redigerade bilder inom 5 dagar via WeTransfer." },
];

const faqs = [
  { q: "Var fotograferar du?", a: "Linköping, Norrköping, Mjölby, Motala – ingen reseersättning. Andra städer i Östergötland: 250 kr/h körning." },
  { q: "Behövs studio?", a: "För större produktbatcher hyr vi studio – 1 500 kr extra. Mindre setup gör jag i din lokal." },
  { q: "Får jag rättigheterna?", a: "Ja, fri användning för ditt företag. Säljer jag inte bilderna vidare." },
  { q: "Hur många kan vara med på en halvdag?", a: "Upp till fem personer för porträtt. Fler – välj heldag." },
];

const related = [
  { name: "Grafisk profil", price: "Från 5 900 kr", to: "/tjanster/grafisk-profil" },
  { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
  { name: "E-handel", price: "Från 19 900 kr", to: "/tjanster/ehandel" },
];

const Fotografering = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Fotograf Linköping – 4 900 kr/halvdag | Aurora Media",
      description:
        "Produktfoto, miljöfoto och porträtt i Linköping och Östergötland. Halvdag 4 900 kr, heldag 7 900 kr. Bilderna redigerade och klara inom 5 dagar.",
      canonical: "/tjanster/fotografering",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "Fotografering", url: "/tjanster/fotografering" },
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
          <p style={eyebrow}>Fotografering</p>
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
            Bilder som{" "}
            <em style={{ fontStyle: "italic", color: "#3E444B" }}>
              faktiskt används.
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
            Produkt-, miljö- och porträttfoto i Linköping och Östergötland. Levererat redigerat inom 5 dagar. Halvdag 4&nbsp;900 kr.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/kontakt" className="btn-primary">Planera foto →</Link>
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
            Boka en halvdag och se skillnaden.
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
            Berätta vad som ska fotograferas, var och varför – så får du ett rimligt upplägg.
          </p>
          <Link to="/kontakt" className="btn-primary">Kontakta mig →</Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default Fotografering;

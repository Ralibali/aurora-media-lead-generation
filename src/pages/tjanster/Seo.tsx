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
  "Teknisk audit (Core Web Vitals, indexering, schema)",
  "Sitemap, robots.txt och canonical-strategi",
  "On-page-optimering av nyckelsidor",
  "Schema.org-markup (Organization, FAQ, Article)",
  "Lokal SEO (Google Business Profile, citations)",
  "Search Console- och GA4-uppsättning",
  "Konkurrentanalys på dina viktigaste sökord",
  "Rapport med 30-dagars åtgärdslista",
];

const process = [
  { title: "Audit", body: "Crawl + manuell genomgång. Du får en prioriterad lista." },
  { title: "Snabba vinster", body: "Allt som kan fixas på en vecka körs först. Tekniska fel, schema, indexering." },
  { title: "On-page", body: "Titlar, meta, intern länkning, innehåll. Sida för sida." },
  { title: "Mätning", body: "GSC + GA4-uppsättning så du själv kan följa effekten." },
];

const faqs = [
  { q: "Hur lång tid tar det att se resultat?", a: "Tekniska fixar syns ofta inom två till fyra veckor. On-page tar en till tre månader. Innehållsbaserad ranking tre till sex månader. Inga garantier på exakta positioner – det vore fusk." },
  { q: "Kan ni garantera plats 1 på Google?", a: "Nej. Den som lovar det ljuger. Jag lovar mätbara förbättringar i synlighet, klick och konvertering." },
  { q: "Behöver jag löpande SEO?", a: "Inte alltid. Många klarar sig med en grundlig audit + fix, sen content varje månad. Jag säger till om du behöver mer." },
  { q: "Hjälper du med innehåll?", a: "Ja, se Content-tjänsten. SEO-optimerade artiklar från 995 kr/styck." },
  { q: "Hjälper SEO även för en mobilapp?", a: "Ja, men på två sätt. Indirekt: en SEO-optimerad webb driver nedladdningar till din app. Direkt: App Store / Play Store har egen sökoptimering (ASO). Bygger du en app med mig kombinerar vi ofta SEO på sajten med ASO – läs mer på /tjanster/mobilapp." },
  { q: "Är det inte lite dyrt?", a: "Jag förstår reaktionen, men jämför med vad du faktiskt får. I Audit ingår teknisk crawl, on-page-genomgång, konkurrentanalys och en prioriterad åtgärdslista – arbete som tar mig två fulla dagar. Audit + fix lägger till själva implementationen av tekniska fixar, on-page och schema, vilket annars motsvarar 8–12 timmars utvecklarjobb hos en byrå (15 000–25 000 kr). Jag jobbar med fast pris så att du vet exakt vad du betalar – inga timmar som tickar, inga överraskningar och inga månadsbindningar." },
];

const related = [
  { name: "Content", price: "995 kr/artikel", to: "/tjanster/content" },
  { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
  { name: "Mobilapp", price: "Från 6 900 kr", to: "/tjanster/mobilapp" },
  { name: "Google Ads", price: "3 900 kr setup", to: "/tjanster/google-ads" },
];

const Seo = () => {
  useEffect(() => {
    setSEOMeta({
      title: "SEO Linköping från 2 490 kr – teknisk + lokal SEO | Aurora Media",
      description:
        "Tekniskt SEO-paket för svenska sajter. Audit, on-page, lokal SEO för Linköping och Östergötland. Fast pris från 2 490 kr. Inga månadsbindningar.",
      canonical: "/tjanster/seo",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "SEO", url: "/tjanster/seo" },
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
          <p style={eyebrow}>SEO</p>
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
            Synlighet byggd på{" "}
            <em style={{ fontStyle: "italic", color: "rgba(237,233,220,0.65)" }}>
              mätbara förbättringar.
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
            Teknisk SEO, on-page och lokal SEO för Linköping. Inga 12-månadersbindningar. Fast pris från 2&nbsp;490 kr.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/kontakt" className="btn-primary">Boka SEO-genomgång →</Link>
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

        {/* ── Paket jämförelse ─────────────────────────────────────────── */}
        <section className="wrap" style={{ paddingBottom: "clamp(64px,8vw,96px)" }}>
          <div style={RULE} />
          <p style={eyebrow}>paket</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {[
              {
                name: "Audit",
                price: "2 490 kr",
                time: "Två dagar",
                desc: "Teknisk crawl + åtgärdslista. Du fixar själv eller betalar för implementation.",
              },
              {
                name: "Audit + fix",
                price: "6 900 kr",
                time: "En vecka",
                desc: "Allt i Audit – plus jag fixar de tekniska och on-page-bitarna.",
                featured: true,
              },
              {
                name: "Lokal SEO",
                price: "Från 4 900 kr",
                time: "En vecka",
                desc: "Google Business Profile, citations, lokala sidor.",
              },
            ].map((tier) => (
              <div
                key={tier.name}
                style={{
                  padding: "clamp(24px,3vw,32px)",
                  border: tier.featured
                    ? "0.5px solid rgba(237,233,220,0.35)"
                    : "0.5px solid rgba(237,233,220,0.10)",
                  borderRadius: 4,
                  position: "relative",
                }}
              >
                {tier.featured && (
                  <span
                    style={{
                      position: "absolute",
                      top: -10,
                      left: 20,
                      fontFamily: M,
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: C,
                      background: "#100F0D",
                      padding: "2px 8px",
                    }}
                  >
                    Populärast
                  </span>
                )}
                <p
                  style={{
                    fontFamily: M,
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(237,233,220,0.35)",
                    marginBottom: 12,
                  }}
                >
                  {tier.name}
                </p>
                <p
                  style={{
                    fontFamily: F,
                    fontSize: "clamp(1.6rem,3vw,2rem)",
                    fontWeight: 400,
                    color: C,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    marginBottom: 4,
                  }}
                >
                  {tier.price}
                </p>
                <p
                  style={{
                    fontFamily: M,
                    fontSize: 10,
                    letterSpacing: "0.05em",
                    color: "rgba(237,233,220,0.35)",
                    marginBottom: 16,
                  }}
                >
                  {tier.time}
                </p>
                <p
                  style={{
                    fontFamily: I,
                    fontSize: "clamp(0.875rem,1.3vw,0.95rem)",
                    color: "rgba(237,233,220,0.55)",
                    lineHeight: 1.6,
                  }}
                >
                  {tier.desc}
                </p>
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
            Börja med en audit. Vet vad som bromsar.
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
            Skicka URL:en så tittar jag på struktur, indexering och vad som mest sannolikt bromsar synligheten.
          </p>
          <Link to="/kontakt" className="btn-primary">Kontakta mig →</Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
};

export default Seo;

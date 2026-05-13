import { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { getCity, getCitySeo, cities } from "@/lib/cityContent";
import { paket } from "@/components/PaketSection";
import {
  setSEOMeta,
  setJsonLd,
  setBreadcrumb,
  removeJsonLd,
  organizationSchema,
  SITE_URL,
} from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const rule: React.CSSProperties = {
  height: "0.5px",
  background: "rgba(237,233,220,0.12)",
  border: "none",
  margin: "0",
};

const eyebrow: React.CSSProperties = {
  fontFamily: M,
  fontSize: 10,
  letterSpacing: "0.1em",
  color: "rgba(237,233,220,0.35)",
  textTransform: "uppercase",
  marginBottom: "1rem",
};

export default function CityPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const isAiVariant = location.pathname.startsWith("/ai-byra-");
  const routeVariant = isAiVariant ? "ai-byra" : "saas-utveckling";

  const city = slug ? getCity(slug) : null;
  const seo = slug ? getCitySeo(slug) : null;
  const seoTitle = seo ? (isAiVariant ? seo.metaTitleAI : seo.metaTitleSaaS) : "";
  const seoDescription = seo ? (isAiVariant ? seo.metaDescAI : seo.metaDescSaaS) : "";

  useEffect(() => {
    if (!city || !seo || !slug) {
      navigate("/404", { replace: true });
      return;
    }

    setSEOMeta({
      title: seoTitle,
      description: seoDescription,
      canonical: `${SITE_URL}/${routeVariant}-${slug}`,
    });

    // Keyword meta tag
    let metaKw = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (seo.keywords) {
      if (!metaKw) {
        metaKw = document.createElement("meta");
        metaKw.setAttribute("name", "keywords");
        document.head.appendChild(metaKw);
      }
      metaKw.setAttribute(
        "content",
        Array.isArray(seo.keywords) ? seo.keywords.join(", ") : seo.keywords,
      );
    }

    const breadcrumbLabel = isAiVariant
      ? `AI-byrå ${city.city}`
      : `SaaS-utveckling ${city.city}`;

    setBreadcrumb([
      { name: "Hem", url: SITE_URL },
      {
        name: breadcrumbLabel,
        url: `${SITE_URL}/${routeVariant}-${slug}`,
      },
    ]);

    setJsonLd("city-localbusiness", {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/${routeVariant}-${slug}#service`,
      name: `Plymate – ${breadcrumbLabel}`,
      description: seoDescription,
      url: `${SITE_URL}/${routeVariant}-${slug}`,
      areaServed: {
        "@type": "City",
        name: city.city,
      },
      makesOffer: paket.map((p: { name: string; price?: string }) => ({
        "@type": "Offer",
        name: p.name,
        priceCurrency: "SEK",
      })),
    });

    const faqItems = city.faqs ?? [];
    if (faqItems.length > 0) {
      setJsonLd("city-faq", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item: { q: string; a: string }) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      });
    }

    setJsonLd("city-organization", organizationSchema);

    return () => {
      removeJsonLd("city-localbusiness");
      removeJsonLd("city-faq");
      removeJsonLd("city-organization");
    };
  }, [slug, city, seo, isAiVariant, routeVariant, navigate]);

  if (!city || !seo || !slug) return null;

  const breadcrumbLabel = isAiVariant
    ? `AI-byrå ${city.city}`
    : `SaaS-utveckling ${city.city}`;

  const altPath = isAiVariant
    ? `/saas-utveckling-${slug}`
    : `/ai-byra-${slug}`;
  const altLabel = isAiVariant
    ? `SaaS-utveckling i ${city.city}`
    : `AI-byrå i ${city.city}`;

  const otherCities = cities.filter((c) => c.slug !== slug).slice(0, 5);
  const faqItems: { q: string; a: string }[] = city.faqs ?? [];

  return (
    <div style={{ background: "#100F0D", color: C, fontFamily: I, minHeight: "100vh" }}>
      <SiteHeader />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section style={{ padding: "clamp(5rem,12vw,9rem) 0 clamp(3rem,6vw,5rem)" }}>
          <div className="wrap">
            <p style={eyebrow}>
              {isAiVariant ? "AI-byrå" : "SaaS-utveckling"}&nbsp;·&nbsp;{city.city}
            </p>
            <h1
              style={{
                fontFamily: F,
                fontSize: "clamp(2.2rem,5.5vw,4.2rem)",
                fontWeight: 300,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                marginBottom: "clamp(1.25rem,3vw,2rem)",
                maxWidth: "820px",
              }}
            >
              {seo.h1Pre}{" "}
              <em style={{ fontStyle: "italic" }}>{seo.h1Em}</em>
            </h1>
            <p
              style={{
                fontFamily: I,
                fontSize: "clamp(1rem,1.8vw,1.15rem)",
                lineHeight: 1.7,
                color: "rgba(237,233,220,0.7)",
                maxWidth: "620px",
                marginBottom: "clamp(2rem,4vw,3rem)",
              }}
            >
              {city.intro}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <a href="/kontakt" className="btn-primary">
                Starta projekt&nbsp;→
              </a>
              <a href="mailto:hej@plymate.se" className="btn-ghost">
                Maila oss
              </a>
            </div>
          </div>
        </section>

        <hr style={rule} />

        {/* ── Lokal kontext ─────────────────────────────────────────────── */}
        <section style={{ padding: "clamp(3rem,6vw,5rem) 0" }}>
          <div className="wrap">
            <p style={eyebrow}>Lokal kontext</p>
            <h2
              style={{
                fontFamily: F,
                fontSize: "clamp(1.6rem,3.5vw,2.6rem)",
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: "1.5rem",
                maxWidth: "680px",
              }}
            >
              {isAiVariant
                ? `AI-kompetens förankrad i ${city.city}`
                : `SaaS-erfarenhet i ${city.city}s marknad`}
            </h2>
            <p
              style={{
                fontFamily: I,
                fontSize: "clamp(0.95rem,1.6vw,1.05rem)",
                lineHeight: 1.75,
                color: "rgba(237,233,220,0.65)",
                maxWidth: "700px",
              }}
            >
              {city.localContext}
            </p>
          </div>
        </section>

        <hr style={rule} />

        {/* ── Tjänster / paket ──────────────────────────────────────────── */}
        <section style={{ padding: "clamp(3rem,6vw,5rem) 0" }}>
          <div className="wrap">
            <p style={eyebrow}>Tjänster</p>
            <h2
              style={{
                fontFamily: F,
                fontSize: "clamp(1.6rem,3.5vw,2.6rem)",
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: "1rem",
                maxWidth: "680px",
              }}
            >
              Tjänster för företag i {city.city}
            </h2>
            {seo.tjansterIntro && (
              <p
                style={{
                  fontFamily: I,
                  fontSize: "clamp(0.95rem,1.6vw,1.05rem)",
                  lineHeight: 1.75,
                  color: "rgba(237,233,220,0.65)",
                  maxWidth: "680px",
                  marginBottom: "2.5rem",
                }}
              >
                {seo.tjansterIntro}
              </p>
            )}
            <ol
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 2.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0",
              }}
            >
              {paket.map(
                (p: { name: string; features: string[] }, i: number) => (
                  <li
                    key={p.name}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "1.25rem",
                      padding: "1rem 0",
                      borderBottom: "0.5px solid rgba(237,233,220,0.08)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: M,
                        fontSize: 11,
                        color: "rgba(237,233,220,0.3)",
                        minWidth: "1.6rem",
                        flexShrink: 0,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: I,
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: C,
                        minWidth: "9rem",
                        flexShrink: 0,
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      style={{
                        fontFamily: I,
                        fontSize: "0.875rem",
                        color: "rgba(237,233,220,0.5)",
                        lineHeight: 1.5,
                      }}
                    >
                      {p.features.slice(0, 3).join(" · ")}
                    </span>
                  </li>
                ),
              )}
            </ol>
            <a
              href="/priser"
              style={{
                fontFamily: M,
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "rgba(237,233,220,0.5)",
                textDecoration: "none",
                borderBottom: "0.5px solid rgba(237,233,220,0.2)",
                paddingBottom: "1px",
              }}
            >
              Se fullständiga priser&nbsp;→
            </a>
          </div>
        </section>

        <hr style={rule} />

        {/* ── Jämförelse ────────────────────────────────────────────────── */}
        <section style={{ padding: "clamp(3rem,6vw,5rem) 0" }}>
          <div className="wrap">
            <p style={eyebrow}>Jämförelse</p>
            <h2
              style={{
                fontFamily: F,
                fontSize: "clamp(1.6rem,3.5vw,2.6rem)",
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: "1.5rem",
                maxWidth: "680px",
              }}
            >
              Så skiljer vi oss
            </h2>
            <p
              style={{
                fontFamily: I,
                fontSize: "clamp(0.95rem,1.6vw,1.05rem)",
                lineHeight: 1.75,
                color: "rgba(237,233,220,0.65)",
                maxWidth: "700px",
              }}
            >
              {city.comparison}
            </p>
            {city.caseNote && (
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1.25rem 1.5rem",
                  border: "0.5px solid rgba(237,233,220,0.15)",
                  borderRadius: "4px",
                  maxWidth: "640px",
                }}
              >
                <p
                  style={{
                    fontFamily: I,
                    fontSize: "0.9rem",
                    color: "rgba(237,233,220,0.55)",
                    lineHeight: 1.65,
                    margin: "0 0 0.75rem",
                  }}
                >
                  {city.caseNote}
                </p>
                <a
                  href="/arbete"
                  style={{
                    fontFamily: M,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "rgba(237,233,220,0.45)",
                    textDecoration: "none",
                    borderBottom: "0.5px solid rgba(237,233,220,0.15)",
                    paddingBottom: "1px",
                  }}
                >
                  Se vårt arbete&nbsp;→
                </a>
              </div>
            )}
          </div>
        </section>

        <hr style={rule} />

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        {faqItems.length > 0 && (
          <section style={{ padding: "clamp(3rem,6vw,5rem) 0" }}>
            <div className="wrap">
              <p style={eyebrow}>Vanliga frågor</p>
              <h2
                style={{
                  fontFamily: F,
                  fontSize: "clamp(1.6rem,3.5vw,2.6rem)",
                  fontWeight: 300,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: "2.5rem",
                  maxWidth: "680px",
                }}
              >
                FAQ – {breadcrumbLabel}
              </h2>
              <div style={{ maxWidth: "720px" }}>
                {faqItems.map((item, idx) => (
                  <div key={idx}>
                    {idx > 0 && (
                      <div
                        style={{
                          height: "0.5px",
                          background: "rgba(237,233,220,0.08)",
                        }}
                      />
                    )}
                    <details style={{ padding: "1.25rem 0" }}>
                      <summary
                        style={{
                          fontFamily: I,
                          fontSize: "clamp(0.95rem,1.6vw,1.05rem)",
                          fontWeight: 500,
                          color: C,
                          listStyle: "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1rem",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        {item.q}
                        <span
                          style={{
                            fontFamily: M,
                            fontSize: 16,
                            color: "rgba(237,233,220,0.3)",
                            flexShrink: 0,
                            lineHeight: 1,
                          }}
                        >
                          +
                        </span>
                      </summary>
                      <p
                        style={{
                          fontFamily: I,
                          fontSize: "0.925rem",
                          lineHeight: 1.72,
                          color: "rgba(237,233,220,0.6)",
                          marginTop: "0.875rem",
                          marginBottom: "0",
                        }}
                      >
                        {item.a}
                      </p>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <hr style={rule} />

        {/* ── Internlänkar ─────────────────────────────────────────────── */}
        <section style={{ padding: "clamp(3rem,6vw,5rem) 0" }}>
          <div className="wrap">
            <p style={eyebrow}>Relaterade sidor</p>
            <nav
              style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.5rem" }}
              aria-label="Internlänkar"
            >
              {[
                { href: altPath, label: altLabel },
                { href: "/priser", label: "Priser" },
                { href: "/arbete", label: "Vårt arbete" },
                { href: "/metodik", label: "Metodik" },
                ...(slug === "linkoping"
                  ? [{ href: "/webbyra-linkoping", label: "Webbyrå Linköping" }]
                  : []),
                { href: "/blogg", label: "Blogg" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  style={{
                    fontFamily: I,
                    fontSize: "0.9rem",
                    color: "rgba(237,233,220,0.55)",
                    textDecoration: "none",
                    borderBottom: "0.5px solid rgba(237,233,220,0.15)",
                    paddingBottom: "1px",
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </section>

        <hr style={rule} />

        {/* ── Andra städer ─────────────────────────────────────────────── */}
        {otherCities.length > 0 && (
          <>
            <section style={{ padding: "clamp(2.5rem,5vw,4rem) 0" }}>
              <div className="wrap">
                <p style={eyebrow}>Andra städer</p>
                <nav
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.5rem" }}
                  aria-label="Andra städer"
                >
                  {otherCities.map((c) => (
                    <a
                      key={c.slug}
                      href={`/${routeVariant}-${c.slug}`}
                      style={{
                        fontFamily: I,
                        fontSize: "0.9rem",
                        color: "rgba(237,233,220,0.5)",
                        textDecoration: "none",
                        borderBottom: "0.5px solid rgba(237,233,220,0.12)",
                        paddingBottom: "1px",
                      }}
                    >
                      {isAiVariant
                        ? `AI-byrå ${c.city}`
                        : `SaaS-utveckling ${c.city}`}
                    </a>
                  ))}
                </nav>
              </div>
            </section>
            <hr style={rule} />
          </>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section style={{ padding: "clamp(4rem,9vw,7rem) 0" }}>
          <div className="wrap">
            <h2
              style={{
                fontFamily: F,
                fontStyle: "italic",
                fontSize: "clamp(1.8rem,4vw,3.2rem)",
                fontWeight: 300,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                marginBottom: "2rem",
                maxWidth: "560px",
              }}
            >
              Redo att börja?
            </h2>
            <a href="/kontakt" className="btn-primary">
              Starta ett projekt&nbsp;→
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

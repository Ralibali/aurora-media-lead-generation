import { useEffect } from "react";
import { Link } from "react-router-dom";
import NordicLayout from "@/components/nordic/NordicLayout";
import { articles } from "@/lib/articles";
import { setSEOMeta, setJsonLd, setBreadcrumb, SITE_URL } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("sv-SE", { year: "numeric", month: "short", day: "numeric" });

const Blog = () => {
  const [featured, ...rest] = articles;

  useEffect(() => {
    setSEOMeta({
      title: "Artiklar om AI och SaaS-utveckling | Aurora Media",
      description: "Konkreta guider om AI-kodning, SaaS-arkitektur, MVP:er och interna verktyg — skrivna från verkliga projekt.",
      canonical: "/blogg",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Blogg", url: "/blogg" }]);
    setJsonLd("blog-collection-jsonld", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Blogg – Aurora Media",
      url: `${SITE_URL}/blogg`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: articles.map((a, i) => ({
          "@type": "ListItem", position: i + 1,
          url: `${SITE_URL}/blogg/${a.slug}`, name: a.title,
        })),
      },
    });
  }, []);

  return (
    <NordicLayout>
      <main id="main">

        {/* Hero */}
        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(40px,6vw,64px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20, textTransform: "lowercase" }}>
              blogg · {articles.length} artiklar
            </p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(36px,6vw,64px)", lineHeight: 1.02, letterSpacing: "-0.025em", color: C, fontWeight: 400, maxWidth: 620, marginBottom: 16 }}>
              Artiklar som gör
              <br /><em>idéer till produkter.</em>
            </h1>
            <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 420 }}>
              Raka guider om AI-kodning, SaaS, MVP:er och interna verktyg — skrivna från verkliga projekt.
            </p>
          </div>
        </section>

        {/* Featured */}
        {featured && (
          <section style={{ paddingBottom: "clamp(32px,5vw,56px)", borderBottom: "0.5px solid rgba(237,233,220,0.10)" }}>
            <div className="wrap">
              <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 16 }}>rekommenderad läsning</p>
              <Link
                to={`/blogg/${featured.slug}`}
                style={{
                  display: "block",
                  border: "0.5px solid rgba(237,233,220,0.14)",
                  borderRadius: 8, padding: "clamp(24px,4vw,40px)",
                  textDecoration: "none",
                  background: "rgba(237,233,220,0.02)",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(237,233,220,0.28)"; e.currentTarget.style.background = "rgba(237,233,220,0.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(237,233,220,0.14)"; e.currentTarget.style.background = "rgba(237,233,220,0.02)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.08em", color: "rgba(237,233,220,0.40)", border: "0.5px solid rgba(237,233,220,0.14)", borderRadius: 3, padding: "3px 8px" }}>{featured.category}</span>
                    <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.30)" }}>{featured.readMinutes} min</span>
                    <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)" }} className="hidden sm:inline">{formatDate(featured.publishedDate)}</span>
                  </div>
                  <span style={{ fontFamily: I, fontSize: 14, color: "rgba(237,233,220,0.35)" }}>↗</span>
                </div>

                <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3.5vw,38px)", color: C, lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 400, marginBottom: 12 }}>
                  {featured.title}
                </h2>
                <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.7, color: "rgba(237,233,220,0.55)", maxWidth: 560 }}>
                  {featured.intro}
                </p>

                <div style={{ marginTop: 24, display: "grid", gap: 8 }} className="sm:grid-cols-2 lg:grid-cols-4">
                  {featured.sections.slice(0, 4).map((s, i) => (
                    <div key={s.heading} style={{ padding: "12px 14px", border: "0.5px solid rgba(237,233,220,0.08)", borderRadius: 6 }}>
                      <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.28)", marginBottom: 4 }}>0{i + 1}</p>
                      <p style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.65)", lineHeight: 1.5 }}>{s.heading}</p>
                    </div>
                  ))}
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Article list */}
        <section style={{ paddingBlock: "clamp(40px,6vw,64px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 28 }}>alla artiklar</p>

            {rest.map((a, i) => (
              <Link
                key={a.slug}
                to={`/blogg/${a.slug}`}
                style={{
                  display: "grid",
                  gap: "8px 28px",
                  padding: "20px 0",
                  borderBottom: "0.5px solid rgba(237,233,220,0.08)",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  marginInline: "-12px",
                  paddingInline: "12px",
                  borderRadius: 4,
                }}
                className="sm:grid-cols-[100px_1fr_auto]"
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(237,233,220,0.025)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.30)", alignSelf: "center" }} className="hidden sm:block">
                  {formatDate(a.publishedDate)}
                </span>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.35)", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 3, padding: "2px 7px" }}>{a.category}</span>
                    <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)" }}>{a.readMinutes} min</span>
                  </div>
                  <p style={{ fontFamily: F, fontSize: "clamp(16px,2vw,20px)", color: C, lineHeight: 1.2, fontWeight: 400 }}>{a.title}</p>
                  <p style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.45)", marginTop: 4, lineHeight: 1.5 }} className="hidden md:block line-clamp-1">{a.intro}</p>
                </div>
                <span style={{ fontFamily: I, fontSize: 14, color: "rgba(237,233,220,0.25)", alignSelf: "center" }}>↗</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Inline CTA */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap" style={{ borderTop: "0.5px solid rgba(237,233,220,0.10)", paddingTop: "clamp(40px,6vw,64px)" }}>
            <p style={{ fontFamily: "'Fraunces',Georgia,serif", fontStyle: "italic", fontSize: "clamp(20px,2.8vw,28px)", color: "#EDE9DC", lineHeight: 1.2, marginBottom: 16 }}>
              Har ni en idé som behöver bli verklig?
            </p>
            <p style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, color: "rgba(237,233,220,0.45)", marginBottom: 20 }}>
              Prototyp från 14 900 kr. Fast pris, kod ni äger.
            </p>
            <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          </div>
        </section>

      </main>
      </NordicLayout>
  );
};

export default Blog;

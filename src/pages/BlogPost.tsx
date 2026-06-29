import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import NordicLayout from "@/components/nordic/NordicLayout";
import { getArticle, getRelatedArticles } from "@/lib/articles";
import {
  setSEOMeta,
  setJsonLd,
  setBreadcrumb,
  removeJsonLd,
  SITE_URL,
} from "@/lib/seoHelpers";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const BlogPost = () => {
  const { slug = "" } = useParams();
  const article = getArticle(slug);

  useEffect(() => {
    if (!article) return;

    setSEOMeta({
      title: article.metaTitle,
      description: article.metaDesc,
      canonical: `/blogg/${article.slug}`,
      ogType: "article",
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
    });

    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Blogg", url: "/blogg" },
      { name: article.title, url: `/blogg/${article.slug}` },
    ]);

    setJsonLd("blogpost-jsonld", {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.metaDesc,
      datePublished: article.publishedDate,
      dateModified: article.updatedDate,
      author: {
        "@type": "Person",
        name: "Christoffer Holstensson",
        url: `${SITE_URL}/om`,
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: `${SITE_URL}/blogg/${article.slug}`,
      keywords: article.keyword,
      articleSection: article.category,
      inLanguage: "sv-SE",
    });

    setJsonLd("blogpost-faq-jsonld", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });

    return () => {
      removeJsonLd("blogpost-jsonld");
      removeJsonLd("blogpost-faq-jsonld");
      removeJsonLd("breadcrumb-jsonld");
    };
  }, [article]);

  if (!article) return <Navigate to="/blogg" replace />;

  const related = getRelatedArticles(article.relatedSlugs);
  const midpoint = Math.floor(article.sections.length / 2);
  const ctaHref = article.ctaHref ?? "/kontakt";
  const ctaLabel = article.ctaLabel ?? "Begär offert";
  const ctaTitle = article.ctaTitle ?? "Behöver ni det här byggt?";
  const ctaText =
    article.ctaText ?? "Beskriv behovet och få ett konkret förslag på nästa steg.";

  return (
    <NordicLayout>
      <main
        id="main"
        style={{
          paddingTop: "clamp(110px,14vw,150px)",
          paddingBottom: "clamp(56px,8vw,88px)",
        }}
      >
        <div className="wrap">
          <nav
            aria-label="Brödsmulor"
            style={{
              marginBottom: 32,
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Hem", to: "/" },
              { label: "Blogg", to: "/blogg" },
              { label: article.category },
            ].map((crumb, index, items) => (
              <span key={crumb.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="mono"
                    style={{ color: "var(--bone-mute)", textDecoration: "none" }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="mono" style={{ color: "var(--bone-soft)" }}>
                    {crumb.label}
                  </span>
                )}
                {index < items.length - 1 && (
                  <span style={{ color: "var(--bone-faint)", fontSize: 11 }}>›</span>
                )}
              </span>
            ))}
          </nav>

          <div className="article-grid">
            <article>
              <header
                style={{
                  marginBottom: 48,
                  paddingBottom: 32,
                  borderBottom: "1px solid var(--hair)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    marginBottom: 22,
                    flexWrap: "wrap",
                  }}
                >
                  <span className="chip">{article.category}</span>
                  <span className="chip chip-mute">{article.readMinutes} min</span>
                  <span className="chip chip-mute">{formatDate(article.publishedDate)}</span>
                </div>
                <h1
                  className="hero-line"
                  style={{ fontSize: "clamp(1.8rem,4.6vw,3.4rem)", marginBottom: 22 }}
                >
                  {article.title}
                </h1>
                <p className="lead">{article.intro}</p>
                <p className="mono" style={{ marginTop: 22, color: "var(--bone-mute)" }}>
                  Skriven av Christoffer Holstensson · Aurora Media AB, Linköping
                </p>
              </header>

              <div className="prose">
                {article.sections.map((section, index) => (
                  <section key={section.heading} className="prose-section">
                    <h2>{section.heading}</h2>
                    <p style={{ whiteSpace: "pre-line" }}>{section.content}</p>

                    {section.code && (
                      <pre className="pre-block">
                        <code>{section.code}</code>
                      </pre>
                    )}

                    {section.table && (
                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              {section.table.headers.map((header) => (
                                <th key={header}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, rowIndex) => (
                              <tr key={row.join("-")}>
                                {row.map((cell, cellIndex) => (
                                  <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {index === midpoint && (
                      <div className="surface surface-pad" style={{ marginTop: 28 }}>
                        <p className="eyebrow" style={{ marginBottom: 10 }}>
                          konkret nästa steg
                        </p>
                        <p
                          className="h2"
                          style={{
                            fontSize: "clamp(1.2rem,2vw,1.6rem)",
                            marginBottom: 8,
                          }}
                        >
                          {ctaTitle}
                        </p>
                        <p className="body" style={{ marginBottom: 18 }}>
                          {ctaText}
                        </p>
                        <Link to={ctaHref} className="btn btn-moss">
                          {ctaLabel} <span className="a">→</span>
                        </Link>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              <section
                style={{
                  marginTop: 48,
                  paddingTop: 32,
                  borderTop: "1px solid var(--hair)",
                }}
              >
                <h2
                  className="h2"
                  style={{ fontSize: "clamp(1.4rem,2.8vw,2rem)", marginBottom: 20 }}
                >
                  Vanliga <span className="it">frågor</span>
                </h2>
                {article.faq.map((item) => (
                  <details key={item.q} className="faq-row">
                    <summary>
                      <span>{item.q}</span>
                    </summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </section>

              <section className="surface surface-pad" style={{ marginTop: 48, textAlign: "center" }}>
                <p className="eyebrow" style={{ marginBottom: 10 }}>
                  nästa steg
                </p>
                <h2
                  className="h2"
                  style={{ fontSize: "clamp(1.4rem,2.4vw,1.8rem)", marginBottom: 10 }}
                >
                  {ctaTitle}
                </h2>
                <p className="body" style={{ marginBottom: 22 }}>
                  {ctaText}
                </p>
                <Link to={ctaHref} className="btn btn-moss">
                  {ctaLabel} <span className="a">→</span>
                </Link>
              </section>

              {related.length > 0 && (
                <section style={{ marginTop: 48 }}>
                  <p className="kicker" style={{ marginBottom: 18 }}>
                    relaterade artiklar
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                    }}
                  >
                    {related.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/blogg/${item.slug}`}
                        className="surface surface-pad"
                      >
                        <p className="chip" style={{ marginBottom: 10 }}>
                          {item.category}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 15,
                            color: "var(--bone)",
                            lineHeight: 1.3,
                          }}
                        >
                          {item.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </article>

            <aside style={{ display: "none" }} className="lg:block">
              <div style={{ position: "sticky", top: 96 }}>
                <p className="kicker" style={{ marginBottom: 16 }}>
                  innehåll
                </p>
                {article.sections.map((section) => (
                  <p
                    key={section.heading}
                    style={{
                      fontSize: 12,
                      color: "var(--bone-mute)",
                      lineHeight: 1.5,
                      padding: "6px 0",
                      borderBottom: "1px solid var(--hair)",
                    }}
                  >
                    {section.heading}
                  </p>
                ))}
                <div className="surface surface-pad" style={{ marginTop: 24 }}>
                  <p className="eyebrow" style={{ marginBottom: 10 }}>
                    praktisk hjälp
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      color: "var(--bone)",
                      fontSize: 18,
                      marginBottom: 8,
                    }}
                  >
                    {ctaTitle}
                  </p>
                  <p className="body" style={{ marginBottom: 14, fontSize: 13 }}>
                    {ctaText}
                  </p>
                  <Link to={ctaHref} className="btn btn-moss" style={{ fontSize: 11 }}>
                    {ctaLabel} <span className="a">→</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </NordicLayout>
  );
};

export default BlogPost;

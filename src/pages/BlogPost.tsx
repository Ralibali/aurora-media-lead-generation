import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import NordicLayout from "@/components/nordic/NordicLayout";
import { getArticle, getRelatedArticles } from "@/lib/articles";
import { setSEOMeta, setJsonLd, setBreadcrumb, SITE_URL } from "@/lib/seoHelpers";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("sv-SE", { year: "numeric", month: "short", day: "numeric" });

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
      author: { "@type": "Organization", name: "Aurora Media AB", url: SITE_URL },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: `${SITE_URL}/blogg/${article.slug}`,
      keywords: article.keyword,
      articleSection: article.category,
    });
    setJsonLd("blogpost-faq-jsonld", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }, [article]);

  if (!article) return <Navigate to="/blogg" replace />;

  const related = getRelatedArticles(article.relatedSlugs);
  const midpoint = Math.floor(article.sections.length / 2);

  return (
    <NordicLayout>
      <main id="main" style={{ paddingTop: "clamp(110px,14vw,150px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
        <div className="wrap">
          {/* Breadcrumb */}
          <nav aria-label="Brödsmulor" style={{ marginBottom: 32, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { label: "Hem", to: "/" },
              { label: "Blogg", to: "/blogg" },
              { label: article.category },
            ].map((crumb, i, arr) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {crumb.to ? (
                  <Link to={crumb.to} className="mono" style={{ color: "var(--bone-mute)", textDecoration: "none" }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="mono" style={{ color: "var(--bone-soft)" }}>{crumb.label}</span>
                )}
                {i < arr.length - 1 && <span style={{ color: "var(--bone-faint)", fontSize: 11 }}>›</span>}
              </span>
            ))}
          </nav>

          <div className="article-grid">
            {/* Article */}
            <article>
              <header style={{ marginBottom: 48, paddingBottom: 32, borderBottom: "1px solid var(--hair)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
                  <span className="chip">{article.category}</span>
                  <span className="chip chip-mute">{article.readMinutes} min</span>
                  <span className="chip chip-mute">{formatDate(article.publishedDate)}</span>
                </div>
                <h1 className="hero-line" style={{ fontSize: "clamp(1.8rem,4.6vw,3.4rem)", marginBottom: 22 }}>
                  {article.title}
                </h1>
                <p className="lead">{article.intro}</p>
              </header>

              <div className="prose">
                {article.sections.map((s, i) => (
                  <section key={i} className="prose-section">
                    <h2>{s.heading}</h2>
                    <p style={{ whiteSpace: "pre-line" }}>{s.content}</p>

                    {s.code && (
                      <pre className="pre-block">
                        <code>{s.code}</code>
                      </pre>
                    )}

                    {s.table && (
                      <div className="table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              {s.table.headers.map((h) => <th key={h}>{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {s.table.rows.map((row, ri) => (
                              <tr key={ri}>
                                {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {i === midpoint && (
                      <div className="surface surface-pad" style={{ marginTop: 28 }}>
                        <p className="eyebrow" style={{ marginBottom: 10 }}>nästa steg</p>
                        <p className="h2" style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", marginBottom: 8 }}>
                          Behöver ni det här <span className="it">byggt?</span>
                        </p>
                        <p className="body" style={{ marginBottom: 18 }}>
                          Prototyp från 14 900 kr. Fast pris. Svar inom 24h.
                        </p>
                        <Link to="/kontakt" className="btn btn-moss">
                          Begär offert <span className="a">→</span>
                        </Link>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* FAQ */}
              <section style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--hair)" }}>
                <h2 className="h2" style={{ fontSize: "clamp(1.4rem,2.8vw,2rem)", marginBottom: 20 }}>
                  Vanliga <span className="it">frågor</span>
                </h2>
                {article.faq.map((f, i) => (
                  <details key={i} className="faq-row">
                    <summary><span>{f.q}</span></summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </section>

              {/* Bottom CTA */}
              <section className="surface surface-pad" style={{ marginTop: 48, textAlign: "center" }}>
                <p className="eyebrow" style={{ marginBottom: 10 }}>kontakt</p>
                <h2 className="h2" style={{ fontSize: "clamp(1.4rem,2.4vw,1.8rem)", marginBottom: 10 }}>
                  Har ni en idé värd att <span className="it">bygga?</span>
                </h2>
                <p className="body" style={{ marginBottom: 22 }}>
                  Svar inom 24 timmar. Fast pris från 14 900 kr.
                </p>
                <Link to="/kontakt" className="btn btn-moss">
                  Begär offert <span className="a">→</span>
                </Link>
              </section>

              {/* Related */}
              {related.length > 0 && (
                <section style={{ marginTop: 48 }}>
                  <p className="kicker" style={{ marginBottom: 18 }}>relaterade artiklar</p>
                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                    {related.map((r) => (
                      <Link key={r.slug} to={`/blogg/${r.slug}`} className="surface surface-pad">
                        <p className="chip" style={{ marginBottom: 10 }}>{r.category}</p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--bone)", lineHeight: 1.3 }}>{r.title}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Sidebar */}
            <aside style={{ display: "none" }} className="lg:block">
              <div style={{ position: "sticky", top: 96 }}>
                <p className="kicker" style={{ marginBottom: 16 }}>innehåll</p>
                {article.sections.map((s, i) => (
                  <p key={i} style={{ fontSize: 12, color: "var(--bone-mute)", lineHeight: 1.5, padding: "6px 0", borderBottom: "1px solid var(--hair)" }}>
                    {s.heading}
                  </p>
                ))}
                <div className="surface surface-pad" style={{ marginTop: 24 }}>
                  <p className="eyebrow" style={{ marginBottom: 10 }}>bygg det</p>
                  <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--bone)", fontSize: 18, marginBottom: 6 }}>
                    Vill ni bygga det själva?
                  </p>
                  <p className="body" style={{ marginBottom: 14, fontSize: 13 }}>Från 14 900 kr.</p>
                  <Link to="/kontakt" className="btn btn-moss" style={{ fontSize: 11 }}>
                    Offert <span className="a">→</span>
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

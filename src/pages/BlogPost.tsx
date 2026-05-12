import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { getArticle, getRelatedArticles } from "@/lib/articles";
import { setSEOMeta, setJsonLd, setBreadcrumb, SITE_URL } from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

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
        "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }, [article]);

  if (!article) return <Navigate to="/blogg" replace />;

  const related = getRelatedArticles(article.relatedSlugs);
  const midpoint = Math.floor(article.sections.length / 2);

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main" style={{ paddingTop: "clamp(88px,12vw,120px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
        <div className="wrap">

          {/* Breadcrumb */}
          <nav aria-label="Brödsmulor" style={{ marginBottom: 32, display: "flex", gap: 8, alignItems: "center" }}>
            {[
              { label: "Hem", to: "/" },
              { label: "Blogg", to: "/blogg" },
              { label: article.category },
            ].map((crumb, i, arr) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {crumb.to
                  ? <Link to={crumb.to} style={{ fontFamily: M, fontSize: 11, color: "rgba(237,233,220,0.35)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = C)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.35)")}>{crumb.label}</Link>
                  : <span style={{ fontFamily: M, fontSize: 11, color: "rgba(237,233,220,0.50)" }}>{crumb.label}</span>}
                {i < arr.length - 1 && <span style={{ color: "rgba(237,233,220,0.20)", fontSize: 11 }}>›</span>}
              </span>
            ))}
          </nav>

          <div style={{ display: "grid", gap: "clamp(32px,6vw,80px)" }} className="lg:grid-cols-[1fr_240px]">

            {/* Article */}
            <article>
              <header style={{ marginBottom: 48, paddingBottom: 32, borderBottom: "0.5px solid rgba(237,233,220,0.10)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.08em", color: "rgba(237,233,220,0.40)", border: "0.5px solid rgba(237,233,220,0.14)", borderRadius: 3, padding: "3px 8px" }}>{article.category}</span>
                  <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.30)" }}>{article.readMinutes} min</span>
                  <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)" }}>
                    {new Date(article.publishedDate).toLocaleDateString("sv-SE", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                <h1 style={{ fontFamily: F, fontSize: "clamp(28px,5vw,48px)", color: C, lineHeight: 1.05, letterSpacing: "-0.02em", fontWeight: 400, marginBottom: 20 }}>
                  {article.title}
                </h1>
                <p style={{ fontFamily: I, fontSize: 16, lineHeight: 1.75, color: "rgba(237,233,220,0.70)", fontWeight: 500 }}>
                  {article.intro}
                </p>
              </header>

              <div>
                {article.sections.map((s, i) => (
                  <section key={i} style={{ marginBottom: 48 }}>
                    <h2 style={{ fontFamily: F, fontSize: "clamp(20px,2.8vw,28px)", color: C, lineHeight: 1.15, letterSpacing: "-0.015em", fontWeight: 400, marginBottom: 16 }}>
                      {s.heading}
                    </h2>
                    <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.8, color: "rgba(237,233,220,0.72)", whiteSpace: "pre-line" }}>
                      {s.content}
                    </p>

                    {s.code && (
                      <pre style={{ marginTop: 20, overflowX: "auto", borderRadius: 6, border: "0.5px solid rgba(237,233,220,0.10)", background: "rgba(0,0,0,0.4)", padding: "16px 20px", fontFamily: M, fontSize: 12, lineHeight: 1.65, color: "rgba(237,233,220,0.80)" }}>
                        <code>{s.code}</code>
                      </pre>
                    )}

                    {s.table && (
                      <div style={{ marginTop: 20, overflowX: "auto", borderRadius: 6, border: "0.5px solid rgba(237,233,220,0.10)" }}>
                        <table style={{ width: "100%", minWidth: 640, textAlign: "left", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ borderBottom: "0.5px solid rgba(237,233,220,0.10)", background: "rgba(237,233,220,0.03)" }}>
                              {s.table.headers.map((h) => <th key={h} style={{ padding: "10px 14px", fontFamily: I, fontSize: 12, fontWeight: 500, color: C }}>{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {s.table.rows.map((row, ri) => (
                              <tr key={ri} style={{ borderBottom: "0.5px solid rgba(237,233,220,0.06)" }}>
                                {row.map((cell, ci) => <td key={ci} style={{ padding: "10px 14px", fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.65)" }}>{cell}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {i === midpoint && (
                      <div style={{ marginTop: 28, padding: "22px 24px", border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 6, background: "rgba(237,233,220,0.02)" }}>
                        <p style={{ fontFamily: F, fontSize: 18, color: C, marginBottom: 6, fontStyle: "italic" }}>
                          Behöver ni det här byggt?
                        </p>
                        <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.50)", marginBottom: 16 }}>
                          Prototyp från 14 900 kr. Fast pris. Svar inom 24h.
                        </p>
                        <Link to="/kontakt" className="btn-primary" style={{ fontSize: 12, padding: "9px 18px" }}>
                          Begär offert →
                        </Link>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* FAQ */}
              <section style={{ marginTop: 48, paddingTop: 32, borderTop: "0.5px solid rgba(237,233,220,0.10)" }}>
                <h2 style={{ fontFamily: F, fontSize: "clamp(20px,2.8vw,28px)", color: C, lineHeight: 1.15, fontWeight: 400, marginBottom: 24 }}>
                  Vanliga frågor
                </h2>
                {article.faq.map((f, i) => (
                  <details key={i} style={{ padding: "16px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)" }}>
                    <summary style={{ fontFamily: I, fontSize: 14, fontWeight: 500, color: C, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                      <span>{f.q}</span>
                      <span style={{ color: "rgba(237,233,220,0.35)", fontSize: 16, flexShrink: 0 }}>+</span>
                    </summary>
                    <p style={{ marginTop: 12, fontFamily: I, fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.55)" }}>{f.a}</p>
                  </details>
                ))}
              </section>

              {/* Bottom CTA */}
              <section style={{ marginTop: 48, padding: "28px 28px", border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 8, textAlign: "center" }}>
                <h2 style={{ fontFamily: F, fontSize: "clamp(20px,2.8vw,26px)", color: C, marginBottom: 8, fontStyle: "italic", fontWeight: 400 }}>
                  Har ni en idé värd att bygga?
                </h2>
                <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.45)", marginBottom: 20 }}>
                  Svar inom 24 timmar. Fast pris från 14 900 kr.
                </p>
                <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
              </section>

              {/* Related */}
              {related.length > 0 && (
                <section style={{ marginTop: 48 }}>
                  <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 20 }}>relaterade artiklar</p>
                  <div style={{ display: "grid", gap: 8 }} className="sm:grid-cols-2">
                    {related.map((r) => (
                      <Link key={r.slug} to={`/blogg/${r.slug}`}
                        style={{ display: "block", padding: "16px", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6, textDecoration: "none", transition: "border-color 0.15s, background 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(237,233,220,0.25)"; e.currentTarget.style.background = "rgba(237,233,220,0.025)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(237,233,220,0.10)"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.30)", marginBottom: 6 }}>{r.category}</p>
                        <p style={{ fontFamily: F, fontSize: 16, color: C, lineHeight: 1.2, fontWeight: 400 }}>{r.title}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Sidebar */}
            <aside style={{ display: "none" }} className="lg:block">
              <div style={{ position: "sticky", top: 88 }}>
                <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 16 }}>innehåll</p>
                {article.sections.map((s, i) => (
                  <p key={i} style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.40)", lineHeight: 1.5, padding: "5px 0", borderBottom: "0.5px solid rgba(237,233,220,0.06)" }}>
                    {s.heading}
                  </p>
                ))}
                <div style={{ marginTop: 28, padding: "18px", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6, background: "rgba(237,233,220,0.02)" }}>
                  <p style={{ fontFamily: F, fontSize: 15, color: C, marginBottom: 8, fontStyle: "italic", fontWeight: 400 }}>Bygg det själv?</p>
                  <p style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.45)", marginBottom: 14 }}>Från 14 900 kr.</p>
                  <Link to="/kontakt" className="btn-primary" style={{ fontSize: 11, padding: "8px 14px", display: "block", textAlign: "center" }}>
                    Offert →
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default BlogPost;

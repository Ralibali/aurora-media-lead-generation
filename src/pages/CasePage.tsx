import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import NordicLayout from "@/components/nordic/NordicLayout";
import {
  setSEOMeta, setBreadcrumb, removeJsonLd, setJsonLd, SITE_URL,
} from "@/lib/seoHelpers";
import {
  getPortfolioBySlug, getRelatedPortfolio,
  CATEGORY_LABEL, STATUS_LABEL,
} from "@/data/portfolio";

const CasePage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const project = getPortfolioBySlug(slug);

  useEffect(() => {
    if (!project) return;
    setSEOMeta({
      title: `${project.name} – Case | Aurora Media`,
      description: project.description,
      canonical: `/arbete/${project.slug}`,
      ogType: "article",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Arbete", url: "/arbete" },
      { name: project.name, url: `/arbete/${project.slug}` },
    ]);
    setJsonLd("case-creativework", {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.name,
      url: `${SITE_URL}/arbete/${project.slug}`,
      description: project.description,
      creator: { "@id": `${SITE_URL}/#organization` },
      keywords: project.stack.join(", "),
    });
    return () => {
      removeJsonLd("breadcrumb-jsonld");
      removeJsonLd("case-creativework");
    };
  }, [project]);

  if (!project) return <Navigate to="/arbete" replace />;

  const related = getRelatedPortfolio(project.slug, 3);

  return (
    <NordicLayout>
      <main id="main" style={{ paddingTop: "clamp(110px,14vw,150px)" }}>
        {/* Back */}
        <div className="wrap" style={{ paddingBottom: 20 }}>
          <Link to="/arbete" className="mono" style={{ color: "var(--bone-mute)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            ← Tillbaka till arbete
          </Link>
        </div>

        {/* Hero */}
        <section className="wrap section-pad-sm" style={{ paddingTop: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
            <span className="chip">{CATEGORY_LABEL[project.category]}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className={`dot ${project.status === "live" ? "live" : ""}`} />
              <span className="mono" style={{ color: "var(--bone-mute)" }}>{STATUS_LABEL[project.status]}</span>
            </span>
          </div>

          <h1 className="hero-line" style={{ maxWidth: 820, marginBottom: 18 }}>{project.name}</h1>
          <p className="lead" style={{ marginBottom: 28 }}>{project.tagline}</p>

          <a href={project.url} target="_blank" rel="noreferrer" className="btn btn-moss">
            Besök {project.domain} <span className="a">↗</span>
          </a>
        </section>

        {/* Screenshot */}
        <section className="wrap section-pad-sm" style={{ paddingTop: 0 }}>
          <div className="browser-frame">
            <div className="browser-bar">
              {[1, 2, 3].map((n) => <i key={n} />)}
              <span className="url">{project.domain}</span>
            </div>
            {project.screenshot ? (
              <img
                src={project.screenshot}
                alt={`Skärmavbild av ${project.name}`}
                style={{ width: "100%", display: "block", aspectRatio: "16/10", objectFit: "cover" }}
                loading="lazy"
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "16/10", background: "rgba(233,228,214,0.01)" }}>
                <div style={{ textAlign: "center" }}>
                  <p className="eyebrow" style={{ marginBottom: 14 }}>preview</p>
                  <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--bone-mute)", fontSize: "clamp(28px,5vw,52px)" }}>
                    {project.domain}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="wrap section-pad-sm">
          <div className="article-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Problemet", content: project.problem },
                { label: "Vad vi byggde", content: project.solution },
                { label: "Lärdomar", content: project.lessons },
              ].filter((s) => s.content).map((s) => (
                <div key={s.label} className="prose-section" style={{ paddingBottom: 28, borderBottom: "1px solid var(--hair)" }}>
                  <p className="kicker" style={{ marginBottom: 12 }}>{s.label}</p>
                  <p className="prose">{s.content}</p>
                </div>
              ))}
            </div>

            {/* Meta sidebar */}
            <aside style={{ alignSelf: "start" }}>
              <div className="case-meta" style={{ position: "sticky", top: 96 }}>
                {project.buildTime && (
                  <div className="case-meta-block">
                    <p className="kicker" style={{ marginBottom: 8 }}>leveranstid</p>
                    <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--bone)", fontSize: 24 }}>
                      {project.buildTime}
                    </p>
                  </div>
                )}

                {project.results && project.results.length > 0 && (
                  <div className="case-meta-block">
                    <p className="kicker" style={{ marginBottom: 12 }}>resultat</p>
                    {project.results.map((r) => (
                      <div key={r.label} style={{ marginBottom: 12 }}>
                        <span className="stat-num" style={{ fontSize: r.value.length <= 6 ? "1.8rem" : "1.4rem" }}>{r.value}</span>
                        <p className="mono" style={{ color: "var(--bone-mute)", marginTop: 4 }}>{r.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="case-meta-block">
                  <p className="kicker" style={{ marginBottom: 12 }}>teknisk stack</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {project.stack.map((t) => (
                      <span key={t} className="chip chip-mute">{t}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="kicker" style={{ marginBottom: 8 }}>live på</p>
                  <a href={project.url} target="_blank" rel="noreferrer" className="text-link mono">
                    {project.domain} ↗
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="section-pad-sm divide-top">
            <div className="wrap">
              <p className="kicker" style={{ marginBottom: 22 }}>andra projekt</p>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                {related.map((r) => (
                  <Link key={r.slug} to={`/arbete/${r.slug}`} className="surface surface-pad">
                    <span className="chip" style={{ marginBottom: 10 }}>{CATEGORY_LABEL[r.category]}</span>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 17, color: "var(--bone)", lineHeight: 1.25, marginTop: 8 }}>{r.name}</p>
                    <p className="body" style={{ fontSize: 13, marginTop: 6 }}>{r.tagline}</p>
                    <p className="mono" style={{ color: "var(--moss)", marginTop: 16 }}>Läs caset ↗</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <section className="cta-band">
          <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
            <p className="mono" style={{ marginBottom: 18 }}>nästa steg</p>
            <h2 className="h2" style={{ maxWidth: 760, marginBottom: 28 }}>
              Vill ni ha ett liknande projekt <span className="it">byggt?</span>
            </h2>
            <Link to="/kontakt" className="btn btn-moss">
              Begär offert <span className="a">→</span>
            </Link>
          </div>
        </section>
      </main>
    </NordicLayout>
  );
};

export default CasePage;

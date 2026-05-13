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

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

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
      "@context": "https://schema.org", "@type": "CreativeWork",
      name: project.name,
      url: `${SITE_URL}/arbete/${project.slug}`,
      description: project.description,
      creator: { "@id": `${SITE_URL}/#organization` },
      keywords: project.stack.join(", "),
    });
    return () => { removeJsonLd("breadcrumb-jsonld"); removeJsonLd("case-creativework"); };
  }, [project]);

  if (!project) return <Navigate to="/arbete" replace />;

  const related = getRelatedPortfolio(project.slug, 3);

  return (
    <NordicLayout>
      <main id="main" style={{ paddingTop: "clamp(88px,12vw,120px)" }}>

        {/* Back */}
        <div className="wrap" style={{ paddingBottom: 20 }}>
          <Link to="/arbete"
            style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.40)", textDecoration: "none", transition: "color 0.15s", display: "inline-flex", alignItems: "center", gap: 6 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.40)")}>
            ← Tillbaka till arbete
          </Link>
        </div>

        {/* Hero */}
        <section className="wrap" style={{ paddingBottom: "clamp(32px,5vw,56px)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", border: "0.5px solid rgba(237,233,220,0.14)", borderRadius: 3, padding: "3px 8px" }}>
              {CATEGORY_LABEL[project.category]}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: project.status === "live" ? "rgba(80,200,120,0.9)" : "rgba(237,233,220,0.35)", display: "block" }} />
              <span style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.35)" }}>{STATUS_LABEL[project.status]}</span>
            </span>
          </div>

          <h1 style={{ fontFamily: F, fontSize: "clamp(32px,6vw,60px)", color: C, lineHeight: 1.02, letterSpacing: "-0.025em", fontWeight: 400, maxWidth: 700, marginBottom: 16 }}>
            {project.name}
          </h1>
          <p style={{ fontFamily: I, fontSize: "clamp(15px,2vw,18px)", color: "rgba(237,233,220,0.60)", lineHeight: 1.65, maxWidth: 540, marginBottom: 28 }}>
            {project.tagline}
          </p>

          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            Besök {project.domain} ↗
          </a>
        </section>

        {/* Screenshot */}
        <section className="wrap" style={{ paddingBottom: "clamp(32px,5vw,56px)" }}>
          <div style={{ border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 8, overflow: "hidden" }}>
            {/* Browser chrome */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, borderBottom: "0.5px solid rgba(237,233,220,0.08)", padding: "10px 16px", background: "rgba(237,233,220,0.02)" }}>
              {[1, 2, 3].map((n) => <span key={n} style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(237,233,220,0.12)", display: "block" }} />)}
              <span style={{ marginLeft: 12, fontFamily: M, fontSize: 11, color: "rgba(237,233,220,0.30)" }}>{project.domain}</span>
            </div>
            {project.screenshot
              ? <img src={project.screenshot} alt={`Skärmavbild av ${project.name}`} style={{ width: "100%", display: "block", aspectRatio: "16/10", objectFit: "cover" }} loading="lazy" />
              : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "16/10", background: "rgba(237,233,220,0.01)" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.12em", color: "rgba(237,233,220,0.25)", marginBottom: 12 }}>preview</p>
                    <p style={{ fontFamily: F, fontSize: "clamp(28px,5vw,52px)", color: "rgba(237,233,220,0.35)", fontStyle: "italic" }}>{project.domain}</p>
                  </div>
                </div>
              )
            }
          </div>
        </section>

        {/* Content */}
        <section className="wrap" style={{ paddingBottom: "clamp(40px,6vw,64px)" }}>
          <div style={{ display: "grid", gap: "clamp(32px,6vw,64px)" }} className="md:grid-cols-[1fr_220px]">

            {/* Prose */}
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {[
                { label: "Problemet", content: project.problem },
                { label: "Vad vi byggde", content: project.solution },
                { label: "Lärdomar", content: project.lessons },
              ].filter((s) => s.content).map((s) => (
                <div key={s.label} style={{ paddingBottom: 32, borderBottom: "0.5px solid rgba(237,233,220,0.07)" }}>
                  <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 12, textTransform: "lowercase" }}>{s.label}</p>
                  <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.8, color: "rgba(237,233,220,0.70)" }}>{s.content}</p>
                </div>
              ))}
            </div>

            {/* Meta sidebar */}
            <aside style={{ position: "sticky", top: 88, alignSelf: "start" }}>
              <div style={{ border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 8, padding: 20 }}>

                {project.buildTime && (
                  <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "0.5px solid rgba(237,233,220,0.07)" }}>
                    <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.30)", marginBottom: 6, textTransform: "lowercase" }}>leveranstid</p>
                    <p style={{ fontFamily: F, fontSize: 24, color: C, fontStyle: "italic" }}>{project.buildTime}</p>
                  </div>
                )}

                {project.results && project.results.length > 0 && (
                  <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "0.5px solid rgba(237,233,220,0.07)" }}>
                    <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.30)", marginBottom: 10, textTransform: "lowercase" }}>resultat</p>
                    {project.results.map((r) => (
                      <div key={r.label} style={{ marginBottom: 10 }}>
                        <p style={{ fontFamily: F, fontSize: r.value.length <= 6 ? 28 : 20, color: C, lineHeight: 1, fontStyle: "italic" }}>{r.value}</p>
                        <p style={{ fontFamily: M, fontSize: 9, color: "rgba(237,233,220,0.30)", letterSpacing: "0.08em", marginTop: 3 }}>{r.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "0.5px solid rgba(237,233,220,0.07)" }}>
                  <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.30)", marginBottom: 10, textTransform: "lowercase" }}>teknisk stack</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {project.stack.map((t) => (
                      <span key={t} style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.06em", color: "rgba(237,233,220,0.45)", border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 3, padding: "3px 7px" }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.30)", marginBottom: 8, textTransform: "lowercase" }}>live på</p>
                  <a href={project.url} target="_blank" rel="noreferrer"
                    style={{ fontFamily: M, fontSize: 11, color: "rgba(237,233,220,0.55)", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(237,233,220,0.55)")}>
                    {project.domain} ↗
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section style={{ borderTop: "0.5px solid rgba(237,233,220,0.10)", paddingBlock: "clamp(40px,6vw,64px)" }}>
            <div className="wrap">
              <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 24 }}>andra projekt</p>
              <div style={{ display: "grid", gap: 10 }} className="sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} to={`/arbete/${r.slug}`}
                    style={{ display: "flex", flexDirection: "column", padding: "20px", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6, textDecoration: "none", transition: "border-color 0.15s, background 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(237,233,220,0.25)"; e.currentTarget.style.background = "rgba(237,233,220,0.025)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(237,233,220,0.10)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.30)", marginBottom: 8 }}>{CATEGORY_LABEL[r.category]}</span>
                    <span style={{ fontFamily: F, fontSize: 18, color: C, lineHeight: 1.2, fontWeight: 400 }}>{r.name}</span>
                    <span style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.40)", marginTop: 4 }}>{r.tagline}</span>
                    <span style={{ marginTop: 16, fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.35)" }}>Läs caset ↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer CTA */}
        <section style={{ borderTop: "0.5px solid rgba(237,233,220,0.10)", paddingBlock: "clamp(40px,6vw,64px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: F, fontStyle: "italic", fontSize: "clamp(20px,2.8vw,28px)", color: C, marginBottom: 16 }}>
              Vill ni ha ett liknande projekt byggt?
            </p>
            <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          </div>
        </section>

      </main>
      </NordicLayout>
  );
};

export default CasePage;

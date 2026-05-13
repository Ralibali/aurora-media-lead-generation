import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import NordicLayout from "@/components/nordic/NordicLayout";
import { setSEOMeta, setBreadcrumb, removeJsonLd, setJsonLd, SITE_URL } from "@/lib/seoHelpers";
import {
  PORTFOLIO,
  CATEGORY_LABEL,
  STATUS_LABEL,
  type PortfolioCategory,
  type PortfolioItem,
} from "@/data/portfolio";

type Filter = "alla" | PortfolioCategory;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "alla", label: "Alla" },
  { value: "saas", label: "SaaS" },
  { value: "development", label: "Utveckling" },
  { value: "seo", label: "SEO" },
  { value: "marketing", label: "Marknadsföring" },
];

const Arbete = () => {
  const [active, setActive] = useState<Filter>("alla");

  const sorted = useMemo(() => [...PORTFOLIO].sort((a, b) => a.order - b.order), []);
  const liveCount = useMemo(() => sorted.filter((p) => p.status === "live").length, [sorted]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { alla: sorted.length, saas: 0, development: 0, seo: 0, marketing: 0 };
    sorted.forEach((p) => { c[p.category] += 1; });
    return c;
  }, [sorted]);
  const filtered = useMemo(
    () => (active === "alla" ? sorted : sorted.filter((p) => p.category === active)),
    [active, sorted],
  );

  useEffect(() => {
    setSEOMeta({
      title: `Arbete – ${PORTFOLIO.length} projekt | Aurora Media`,
      description: "Egna SaaS-produkter, utvecklings- och SEO-uppdrag med riktiga användare och resultat.",
      canonical: "/arbete",
    });
    setBreadcrumb([{ name: "Hem", url: "/" }, { name: "Arbete", url: "/arbete" }]);
    setJsonLd("portfolio-itemlist", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Aurora Media – Portfolio",
      itemListElement: PORTFOLIO.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/arbete/${p.slug}`,
        name: p.name,
      })),
    });
    return () => {
      removeJsonLd("breadcrumb-jsonld");
      removeJsonLd("portfolio-itemlist");
    };
  }, []);

  return (
    <NordicLayout>
      <main id="main">
        {/* Hero */}
        <section className="section-pad" style={{ paddingTop: "clamp(120px,14vw,160px)" }}>
          <div className="wrap">
            <p className="mono" style={{ marginBottom: 20 }}>
              arbete · {sorted.length} projekt
            </p>
            <h1 className="hero-line" style={{ maxWidth: 820, marginBottom: 18 }}>
              Projekt som redan <span className="it">är ute i verkligheten.</span>
            </h1>
            <p className="lead" style={{ marginBottom: 36 }}>
              Egna SaaS-produkter, appar, webbplattformar och SEO-uppdrag med riktiga användare, kunder och resultat.
            </p>

            <div style={{ display: "flex", gap: "clamp(28px,4vw,48px)", flexWrap: "wrap" }}>
              {[
                { val: sorted.length, label: "projekt totalt" },
                { val: liveCount, label: "live idag" },
                { val: counts.saas, label: "egna SaaS" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="stat-num bone">{s.val}</span>
                  <p className="kicker" style={{ marginTop: 6 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="wrap">
            <div className="row">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActive(f.value)}
                  className={`filter-chip ${f.value === active ? "on" : ""}`}
                >
                  {f.label} · {counts[f.value]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        <section className="section-pad-sm">
          <div className="wrap">
            <AnimatePresence mode="popLayout">
              <motion.div layout className="card-grid">
                {filtered.map((item, i) => (
                  <ProjectCard key={item.slug} item={item} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <p className="body" style={{ textAlign: "center", paddingBlock: 40 }}>
                Inga projekt i den här kategorin än.
              </p>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-band">
          <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
            <p className="mono" style={{ marginBottom: 18 }}>nästa steg</p>
            <h2 className="h2" style={{ maxWidth: 760, marginBottom: 28 }}>
              Vill ni ha ett eget projekt på <span className="it">den här listan?</span>
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

const ProjectCard = ({ item, index }: { item: PortfolioItem; index: number }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.15), ease: [0.16, 1, 0.3, 1] }}
  >
    <Link
      to={`/arbete/${item.slug}`}
      aria-label={`Läs caset om ${item.name}`}
      className={`surface surface-pad ${item.featured ? "featured" : ""}`}
      style={{ display: "flex", flexDirection: "column", minHeight: 220, height: "100%" }}
    >
      {item.featured && (
        <p className="eyebrow" style={{ marginBottom: 14 }}>★ flaggskepp</p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: "auto" }}>
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(17px,2vw,20px)", color: "var(--bone)", lineHeight: 1.25, marginBottom: 6, letterSpacing: "-0.01em" }}>
            {item.name}
          </p>
          <p className="body" style={{ fontSize: 13 }}>{item.tagline}</p>
        </div>
        <span style={{ fontSize: 16, color: "var(--bone-faint)", flexShrink: 0, marginTop: 2 }}>↗</span>
      </div>

      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span className="mono" style={{ color: "var(--bone-mute)" }}>{item.domain}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className={`dot ${item.status === "live" ? "live" : ""}`} />
          <span className="mono" style={{ color: "var(--bone-mute)" }}>{STATUS_LABEL[item.status]}</span>
        </span>
        {item.buildTime && (
          <span className="mono" style={{ color: "var(--bone-faint)" }}>· {item.buildTime}</span>
        )}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span className="chip">{CATEGORY_LABEL[item.category]}</span>
        {item.stack.slice(0, 3).map((t) => (
          <span key={t} className="chip chip-mute">{t}</span>
        ))}
      </div>
    </Link>
  </motion.div>
);

export default Arbete;

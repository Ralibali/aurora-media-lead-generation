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

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";
const BG = "#100F0D";

type Filter = "alla" | PortfolioCategory;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "alla", label: "Alla" },
  { value: "saas", label: "SaaS" },
  { value: "development", label: "Utveckling" },
  { value: "seo", label: "SEO" },
  { value: "marketing", label: "Marknadsföring" },
];

const STATUS_COLORS: Record<string, string> = {
  live: "rgba(80,200,120,0.9)",
  pågående: "rgba(230,180,60,0.9)",
  beta: "rgba(90,160,220,0.9)",
  planerad: "rgba(237,233,220,0.3)",
};

const Arbete = () => {
  const [active, setActive] = useState<Filter>("alla");

  const sorted = useMemo(() => [...PORTFOLIO].sort((a, b) => a.order - b.order), []);
  const flagship = useMemo(() => sorted.find((p) => p.featured) ?? sorted[0], [sorted]);
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
      "@context": "https://schema.org", "@type": "ItemList",
      name: "Aurora Media – Portfolio",
      itemListElement: PORTFOLIO.map((p, i) => ({
        "@type": "ListItem", position: i + 1,
        url: `${SITE_URL}/arbete/${p.slug}`, name: p.name,
      })),
    });
    return () => { removeJsonLd("breadcrumb-jsonld"); removeJsonLd("portfolio-itemlist"); };
  }, []);

  return (
    <NordicLayout>
      <main id="main">

        {/* Hero */}
        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(40px,6vw,64px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20, textTransform: "lowercase" }}>
              arbete · {sorted.length} projekt
            </p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(36px,6vw,64px)", lineHeight: 1.02, letterSpacing: "-0.025em", color: C, fontWeight: 400, maxWidth: 640, marginBottom: 16 }}>
              Projekt som redan
              <br /><em>är ute i verkligheten.</em>
            </h1>
            <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 420, marginBottom: 32 }}>
              Egna SaaS-produkter, appar, webbplattformar och SEO-uppdrag med riktiga användare, kunder och resultat.
            </p>

            {/* quick stats */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[
                { val: sorted.length, label: "projekt totalt" },
                { val: liveCount, label: "live idag" },
                { val: counts.saas, label: "egna SaaS" },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ fontFamily: F, fontSize: "clamp(28px,4vw,36px)", color: C, lineHeight: 1, marginBottom: 4 }}>{s.val}</p>
                  <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <div style={{
          position: "sticky", top: 63, zIndex: 50,
          borderBlock: "0.5px solid rgba(237,233,220,0.10)",
          backgroundColor: "rgba(16,15,13,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
          <div className="wrap" style={{ paddingBlock: 10, display: "flex", gap: 8, overflowX: "auto" }}>
            {FILTERS.map((f) => {
              const on = f.value === active;
              return (
                <button
                  key={f.value}
                  onClick={() => setActive(f.value)}
                  style={{
                    flexShrink: 0,
                    fontFamily: M, fontSize: 10, letterSpacing: "0.1em",
                    padding: "6px 14px", borderRadius: 4,
                    border: `0.5px solid ${on ? "rgba(237,233,220,0.40)" : "rgba(237,233,220,0.12)"}`,
                    background: on ? "rgba(237,233,220,0.08)" : "transparent",
                    color: on ? C : "rgba(237,233,220,0.45)",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {f.label} · {counts[f.value]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        <section style={{ paddingBlock: "clamp(32px,5vw,56px)" }}>
          <div className="wrap">
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}
              >
                {filtered.map((item, i) => (
                  <ProjectCard key={item.slug} item={item} index={i} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.40)", textAlign: "center", paddingBlock: 40 }}>
                Inga projekt i den här kategorin än.
              </p>
            )}
          </div>
        </section>

        {/* CTA */}
        <section style={{ paddingBlock: "clamp(40px,6vw,64px)", borderTop: "0.5px solid rgba(237,233,220,0.10)" }}>
          <div className="wrap">
            <p style={{ fontFamily: F, fontStyle: "italic", fontSize: "clamp(22px,3vw,32px)", color: C, lineHeight: 1.2, marginBottom: 20 }}>
              Vill ni ha ett eget projekt på den här listan?
            </p>
            <Link to="/kontakt" className="btn-primary">Begär offert →</Link>
          </div>
        </section>

      </main>
      </div>
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
      style={{
        display: "flex", flexDirection: "column",
        padding: "clamp(20px,3vw,28px)",
        border: "0.5px solid rgba(237,233,220,0.10)",
        borderRadius: 8, textDecoration: "none",
        backgroundColor: item.featured ? "rgba(237,233,220,0.025)" : "transparent",
        transition: "border-color 0.15s, background 0.15s",
        minHeight: 220, height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(237,233,220,0.28)";
        e.currentTarget.style.background = "rgba(237,233,220,0.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(237,233,220,0.10)";
        e.currentTarget.style.background = item.featured ? "rgba(237,233,220,0.025)" : "transparent";
      }}
    >
      {item.featured && (
        <p style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9, letterSpacing: "0.12em", color: "rgba(237,233,220,0.40)", marginBottom: 12, textTransform: "uppercase" }}>
          ★ flaggskepp
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: "auto" }}>
        <div>
          <p style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: "clamp(18px,2.2vw,22px)", color: "#EDE9DC", lineHeight: 1.2, marginBottom: 6, fontWeight: 400 }}>
            {item.name}
          </p>
          <p style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 13, color: "rgba(237,233,220,0.55)", lineHeight: 1.55 }}>
            {item.tagline}
          </p>
        </div>
        <span style={{ fontFamily: "'Inter',system-ui,sans-serif", fontSize: 16, color: "rgba(237,233,220,0.25)", flexShrink: 0, marginTop: 2, transition: "color 0.15s" }}>↗</span>
      </div>

      <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.30)" }}>
          {item.domain}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_COLORS[item.status] ?? "rgba(237,233,220,0.3)", display: "block", flexShrink: 0 }} />
          <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.35)" }}>{STATUS_LABEL[item.status]}</span>
        </span>
        {item.buildTime && (
          <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 10, color: "rgba(237,233,220,0.25)" }}>· {item.buildTime}</span>
        )}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.45)", border: "0.5px solid rgba(237,233,220,0.15)", borderRadius: 3, padding: "3px 7px" }}>
          {CATEGORY_LABEL[item.category]}
        </span>
        {item.stack.slice(0, 3).map((t) => (
          <span key={t} style={{ fontFamily: "'JetBrains Mono',ui-monospace,monospace", fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.30)", border: "0.5px solid rgba(237,233,220,0.08)", borderRadius: 3, padding: "3px 7px" }}>{t}</span>
        ))}
      </div>
    </Link>
  </motion.div>
);

export default Arbete;

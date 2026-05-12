import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import PortfolioPlaceholder from "@/components/PortfolioPlaceholder";
import {
  PORTFOLIO,
  CATEGORY_LABEL,
  CATEGORY_BADGE,
  STATUS_LABEL,
  STATUS_DOT,
  getLocalizedTagline,
  type PortfolioCategory,
} from "@/data/portfolio";
import {
  setSEOMeta,
  setBreadcrumb,
  removeJsonLd,
  setJsonLd,
  setHreflang,
  organizationSchemaEn,
  SITE_URL,
} from "@/lib/seoHelpers";

const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

type Filter = "all" | PortfolioCategory;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "saas", label: "SaaS" },
  { value: "seo", label: "SEO" },
  { value: "development", label: "Development" },
];

const stack = [
  "Lovable",
  "Bolt.new",
  "Emergent",
  "Claude",
  "Cursor",
  "Supabase",
  "Stripe",
  "React",
  "TypeScript",
  "Next.js",
  "Tailwind",
  "Capacitor",
];

const trustItems = [
  "7 SaaS shipped",
  "$1,400 starting price",
  "5-day prototype",
  "Sweden-based",
];

const pricing = [
  {
    name: "Prototype",
    price: "from $1,400",
    timeline: "3–5 days",
    blurb: "Clickable prototype to validate the idea.",
  },
  {
    name: "MVP",
    price: "from $3,300",
    timeline: "2 weeks",
    blurb: "Launch-ready product with auth, payments, core flows.",
  },
  {
    name: "Production SaaS",
    price: "from $6,500",
    timeline: "4 weeks",
    blurb: "Full product. Polished UI, integrations, real users on day one.",
    featured: true,
  },
  {
    name: "Custom",
    price: "from $8,500",
    timeline: "4–8 weeks",
    blurb: "Complex scope, multiple integrations, mobile wrap.",
  },
  {
    name: "Hourly",
    price: "$130 / h",
    timeline: "Fractional CTO / consulting",
    blurb: "Architecture review, code review, weekly sync.",
  },
];

const whyMe = [
  "I built and shipped 7 of my own SaaS products before taking client work. I know what breaks at scale.",
  "Fixed price, fixed timeline, source code is yours.",
  "I don't subcontract. The person you talk to is the person who builds it.",
];

const process = [
  {
    n: "01",
    title: "Discovery call",
    body: "Free 30-minute call. We scope the idea, the must-haves, the constraints.",
  },
  {
    n: "02",
    title: "Fixed quote within 24h",
    body: "You get a written quote with scope, timeline and price — no surprises later.",
  },
  {
    n: "03",
    title: "Working prototype on day 3–5",
    body: "Live URL, real data, you click through it. We iterate from there.",
  },
];

const EnIndex = () => {
  const [active, setActive] = useState<Filter>("all");

  useEffect(() => {
    setSEOMeta({
      title: "Ship SaaS in Weeks, Not Months | Aurora Media – AI Builder from Sweden",
      description:
        "Sweden-based AI-augmented builder shipping production SaaS in 2–4 weeks. Lovable, Bolt, Claude, Cursor. 7 products live. Fixed price from $1,400. Book a free intro call.",
      canonical: "/en",
      ogImage: "/og-image-en.jpg",
      ogType: "website",
      ogLocale: "en_US",
      keywords:
        "SaaS development, AI coding, MVP development, Lovable expert, Bolt.new, Claude, Cursor, fixed price SaaS, fractional CTO, Sweden developer",
    });
    setHreflang("/", "/en");
    setBreadcrumb([
      { name: "Home", url: "/en" },
    ]);
    setJsonLd("organization-en", organizationSchemaEn);
    setJsonLd("portfolio-itemlist-en", {
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
      removeJsonLd("organization-en");
      removeJsonLd("portfolio-itemlist-en");
      removeJsonLd("breadcrumb-jsonld");
    };
  }, []);

  const filtered = useMemo(() => {
    const base =
      active === "all" ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === active);
    return [...base].sort(
      (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order,
    );
  }, [active]);

  const saasCount = PORTFOLIO.filter((p) => p.category === "saas").length;

  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">
        {/* HERO */}
        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 20 }}>Aurora Media · Sweden</p>
            <h1 style={{ fontFamily: F, fontSize: "clamp(36px,7vw,72px)", lineHeight: 1.02, letterSpacing: "-0.025em", color: C, fontWeight: 400, maxWidth: 720, marginBottom: 20 }}>
              I ship SaaS in weeks.{" "}
              <em>Not months. Not quarters.</em>
            </h1>
            <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 480, marginBottom: 32 }}>
              AI-augmented developer based in Sweden. 7 SaaS shipped in 18 months. All live. All paying.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="mailto:info@auroramedia.se" className="btn-primary">Start a project →</a>
              <a href="#work" className="btn-ghost">See my work</a>
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <section>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)" }} />
          <div className="wrap" style={{ paddingBlock: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 32px", justifyContent: "flex-start" }}>
              {trustItems.map((t) => (
                <span key={t} style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.12em", color: "rgba(237,233,220,0.45)" }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)" }} />
        </section>

        {/* STACK */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>stack</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 24, letterSpacing: "-0.015em" }}>
              The tools I build with every day.
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {stack.map((s) => (
                <span key={s} style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.08em", color: "rgba(237,233,220,0.55)", border: "0.5px solid rgba(237,233,220,0.15)", borderRadius: 100, padding: "5px 14px" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* PORTFOLIO */}
        <section id="work" style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>work · 2024–2026</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,36px)", color: C, marginBottom: 8, letterSpacing: "-0.015em" }}>
              {saasCount} SaaS, <em>live right now.</em>
            </h2>
            <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.50)", marginBottom: 28 }}>
              Plus {PORTFOLIO.length - saasCount} development and SEO engagements. All real. All clickable.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {filters.map((f) => (
                <button key={f.value} onClick={() => setActive(f.value)} style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.08em", padding: "6px 16px", borderRadius: 100, border: "0.5px solid", borderColor: f.value === active ? C : "rgba(237,233,220,0.20)", background: f.value === active ? C : "transparent", color: f.value === active ? "#100F0D" : "rgba(237,233,220,0.55)", cursor: "pointer", transition: "all 0.15s" }}>
                  {f.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="popLayout">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {filtered.map((c, i) => (
                  <motion.div key={c.slug} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.25) }}>
                    <a href={c.url} target="_blank" rel="noreferrer" style={{ display: "block", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6, overflow: "hidden", transition: "border-color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(237,233,220,0.25)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(237,233,220,0.10)")}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderBottom: "0.5px solid rgba(237,233,220,0.08)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(237,233,220,0.15)" }} />
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(237,233,220,0.15)" }} />
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(237,233,220,0.15)" }} />
                        <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.35)", marginLeft: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.domain}</span>
                      </div>
                      {c.screenshot ? (
                        <img src={c.screenshot} alt={`Screenshot of ${c.name}`} style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", display: "block" }} loading="lazy" />
                      ) : (
                        <PortfolioPlaceholder domain={c.domain} />
                      )}
                      <div style={{ padding: "16px 18px" }}>
                        <span style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)" }}>{CATEGORY_LABEL[c.category]}</span>
                        <h3 style={{ fontFamily: F, fontSize: "clamp(17px,2vw,20px)", color: C, marginTop: 6, marginBottom: 6 }}>{c.name}</h3>
                        <p style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.50)", lineHeight: 1.6 }}>{getLocalizedTagline(c, "en")}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                          {c.stack.slice(0, 3).map((tag) => (
                            <span key={tag} style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.35)", border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 100, padding: "3px 10px" }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </section>

        {/* PRICING */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>pricing</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>
              Fixed price. <em>Fixed timeline.</em>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 10, marginBottom: 20 }}>
              {pricing.map((p, i) => (
                <div key={p.name} style={{ padding: "clamp(18px,2.5vw,24px)", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6, display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.35)", letterSpacing: "0.08em" }}>{p.timeline}</p>
                  <p style={{ fontFamily: F, fontSize: "clamp(18px,2vw,22px)", color: C }}>{p.name}</p>
                  <p style={{ fontFamily: F, fontSize: "clamp(16px,1.8vw,20px)", color: "rgba(237,233,220,0.75)" }}>{p.price}</p>
                  <p style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.50)", lineHeight: 1.6 }}>{p.blurb}</p>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.30)", letterSpacing: "0.06em" }}>
              Pricing in USD, invoiced in SEK from Aurora Media AB (Swedish corp, VAT-exempt for non-EU clients).
            </p>
          </div>
        </section>

        {/* WHY ME */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>why me</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>
              What you actually get.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10 }}>
              {whyMe.map((w, i) => (
                <div key={i} style={{ padding: "22px 22px", border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6 }}>
                  <p style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.30)", marginBottom: 12, letterSpacing: "0.08em" }}>0{i + 1}</p>
                  <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.70)" }}>{w}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>process</p>
            <h2 style={{ fontFamily: F, fontSize: "clamp(22px,3vw,32px)", color: C, marginBottom: 28, letterSpacing: "-0.015em" }}>
              Three steps. <em>No surprises.</em>
            </h2>
            {process.map((p) => (
              <div key={p.n} style={{ display: "grid", gap: "8px 40px", padding: "20px 0", borderBottom: "0.5px solid rgba(237,233,220,0.07)" }} className="sm:grid-cols-[28px_160px_1fr]">
                <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.25)" }}>{p.n}</span>
                <span style={{ fontFamily: I, fontSize: 14, fontWeight: 500, color: C }}>{p.title}</span>
                <span style={{ fontFamily: I, fontSize: 13, lineHeight: 1.65, color: "rgba(237,233,220,0.50)" }}>{p.body}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT CTA */}
        <section style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(40px,6vw,64px)" }} />
          <div className="wrap">
            <h2 style={{ fontFamily: F, fontStyle: "italic", fontSize: "clamp(22px,3vw,40px)", color: C, marginBottom: 16, letterSpacing: "-0.015em" }}>
              Let's talk about your project.
            </h2>
            <p style={{ fontFamily: I, fontSize: 14, color: "rgba(237,233,220,0.55)", marginBottom: 28, lineHeight: 1.7 }}>
              Email: <a href="mailto:info@auroramedia.se" style={{ color: C, textDecoration: "none" }}>info@auroramedia.se</a>
              <br /><span style={{ fontSize: 13 }}>Response within 24h on weekdays.</span>
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <a href="mailto:info@auroramedia.se?subject=Project%20inquiry" className="btn-primary">Email me directly →</a>
              <Link to="/" className="btn-ghost" style={{ fontSize: 13 }}>Gå till svenska sidan</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default EnIndex;

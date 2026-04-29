import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import FinalCTASection from "@/components/FinalCTASection";
import Reveal from "@/components/Reveal";
import { setSEOMeta, setBreadcrumb, removeJsonLd, setJsonLd, SITE_URL } from "@/lib/seoHelpers";
import { cn } from "@/lib/utils";
import {
  PORTFOLIO,
  CATEGORY_LABEL,
  STATUS_LABEL,
  STATUS_DOT,
  type PortfolioCategory,
  type PortfolioItem,
} from "@/data/portfolio";

type Filter = "alla" | PortfolioCategory;

const filters: { value: Filter; label: string }[] = [
  { value: "alla", label: "Allt" },
  { value: "saas", label: "SaaS" },
  { value: "development", label: "Utveckling" },
  { value: "seo", label: "SEO" },
  { value: "marketing", label: "Marknadsföring" },
];

const Arbete = () => {
  const [active, setActive] = useState<Filter>("alla");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  useEffect(() => {
    setSEOMeta({
      title: `Arbete – ${PORTFOLIO.length} projekt live | Aurora Media Linköping`,
      description:
        "Egna SaaS-produkter, utvecklings- och SEO-uppdrag. Aurora Transport, Updro, AgilityManager, Hönsgården, Yachting Sweden, Solcellsofferter, Minandel m.fl.",
      canonical: "/arbete",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Arbete", url: "/arbete" },
    ]);
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

  const stats = useMemo(() => {
    const live = PORTFOLIO.filter((p) => p.status === "live").length;
    const saas = PORTFOLIO.filter((p) => p.category === "saas").length;
    const dev = PORTFOLIO.filter((p) => p.category === "development").length;
    const seo = PORTFOLIO.filter((p) => p.category === "seo").length;
    return { live, saas, dev, seo };
  }, []);

  const featured = useMemo(
    () =>
      PORTFOLIO.find((p) => p.featured) ??
      PORTFOLIO.slice().sort((a, b) => a.order - b.order)[0],
    [],
  );

  const filtered = useMemo(() => {
    const base = active === "alla" ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === active);
    return [...base]
      .filter((p) => p.slug !== featured.slug || active !== "alla")
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
  }, [active, featured]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { alla: PORTFOLIO.length, saas: 0, seo: 0, development: 0, marketing: 0 };
    PORTFOLIO.forEach((p) => { c[p.category]++; });
    return c;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* HERO — editorial, asymmetric */}
        <section ref={heroRef} className="relative overflow-hidden border-b border-border">
          {/* Decorative grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          {/* Aurora glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(154 44% 45% / 0.6), transparent 65%)" }}
          />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="container relative mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-32 md:pb-24"
          >
            <div className="grid gap-10 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-8">
                <Reveal>
                  <div className="flex items-center gap-3">
                    <span className="h-px w-10 bg-foreground/40" />
                    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      Portfolio · Index {String(PORTFOLIO.length).padStart(2, "0")}
                    </p>
                  </div>
                  <h1 className="mt-6 font-serif text-[clamp(3.5rem,9vw,8rem)] font-light leading-[0.92] tracking-[-0.035em]">
                    Arbete<br />
                    <em className="italic text-primary">som lever.</em>
                  </h1>
                </Reveal>
              </div>
              <div className="flex flex-col justify-end md:col-span-4">
                <Reveal delay={0.15}>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                    Inga case från en byrå jag jobbade på 2018. Det här är{" "}
                    <span className="text-foreground">egna SaaS-produkter</span>,
                    utvecklingsuppdrag och SEO-arbeten — just nu, i drift.
                  </p>
                </Reveal>
              </div>
            </div>

            {/* Live stats strip */}
            <Reveal delay={0.25}>
              <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:mt-20 md:grid-cols-4">
                {[
                  { v: stats.live, l: "Live just nu", sub: "i produktion" },
                  { v: stats.saas, l: "SaaS-produkter", sub: "egna" },
                  { v: stats.dev, l: "Utvecklingsuppdrag", sub: "klientarbete" },
                  { v: stats.seo, l: "SEO-uppdrag", sub: "löpande" },
                ].map((s) => (
                  <div key={s.l} className="bg-background p-6 md:p-8">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-4xl tracking-tight md:text-5xl">{s.v}</span>
                      <span className="font-mono text-xs text-muted-foreground">/{PORTFOLIO.length}</span>
                    </div>
                    <p className="mt-3 text-sm text-foreground">{s.l}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.sub}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </motion.div>
        </section>

        {/* FEATURED CASE — only when "alla" */}
        {active === "alla" && (
          <section className="border-b border-border py-16 md:py-24">
            <div className="container mx-auto max-w-7xl px-6">
              <Reveal>
                <div className="mb-8 flex items-center gap-3">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    Featured case
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <Link
                  to={`/arbete/${featured.slug}`}
                  className="group grid gap-8 overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all duration-500 hover:border-primary md:grid-cols-12 md:gap-10 md:p-8"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-muted md:col-span-7">
                    {featured.screenshot ? (
                      <img
                        src={featured.screenshot}
                        alt={`Skärmavbild av ${featured.name}`}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-primary/10 to-background">
                        <p className="font-serif text-4xl text-foreground/70">{featured.domain}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between md:col-span-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-primary">
                          {CATEGORY_LABEL[featured.category]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", STATUS_DOT[featured.status])} />
                          {STATUS_LABEL[featured.status]}
                        </span>
                      </div>
                      <h2 className="mt-5 font-serif text-4xl tracking-tight md:text-6xl">
                        {featured.name}
                      </h2>
                      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        {featured.tagline}
                      </p>
                      {featured.results && featured.results.length > 0 && (
                        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
                          {featured.results.slice(0, 2).map((r) => (
                            <div key={r.label}>
                              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                {r.label}
                              </dt>
                              <dd className="mt-1 font-serif text-xl">{r.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">
                        {featured.stack.slice(0, 3).join(" · ")}
                      </span>
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 group-hover:rotate-45">
                        <ArrowUpRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            </div>
          </section>
        )}

        {/* FILTER RAIL — sticky */}
        <section className="sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="flex items-center gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filters.map((f) => {
                const isActive = f.value === active;
                const n = counts[f.value];
                return (
                  <button
                    key={f.value}
                    onClick={() => setActive(f.value)}
                    className={cn(
                      "group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                    )}
                  >
                    <span>{f.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 font-mono text-[10px]",
                        isActive ? "bg-background/15 text-background" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
              <span className="ml-auto hidden shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground md:block">
                {filtered.length} {filtered.length === 1 ? "projekt" : "projekt"}
              </span>
            </div>
          </div>
        </section>

        {/* GRID — asymmetric editorial */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="grid gap-x-6 gap-y-16 md:grid-cols-12 md:gap-y-24">
              <AnimatePresence mode="popLayout">
                {filtered.map((c, i) => (
                  <ProjectCard key={c.slug} item={c} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <p className="mt-12 text-center text-muted-foreground">
                Inga projekt i den här kategorin än.
              </p>
            )}
          </div>
        </section>

        <FinalCTASection />
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

/* ---------------- Project Card (asymmetric layout) ---------------- */

const ProjectCard = ({ item, index }: { item: PortfolioItem; index: number }) => {
  // Asymmetric pattern: alternates 7/5, 5/7, 12 (full-bleed every 5th)
  const pattern = index % 5;
  const isFull = pattern === 4;
  const isLeft = pattern === 0 || pattern === 3;
  const colSpan = isFull ? "md:col-span-12" : isLeft ? "md:col-span-7" : "md:col-span-5";
  const offset = !isFull && !isLeft ? "md:col-start-8" : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.25), ease: [0.32, 0.72, 0, 1] }}
      className={cn(colSpan, offset)}
    >
      <Link to={`/arbete/${item.slug}`} className="group block">
        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl bg-muted">
          {item.screenshot ? (
            <img
              src={item.screenshot}
              alt={`Skärmavbild av ${item.name}`}
              loading="lazy"
              className={cn(
                "w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]",
                isFull ? "aspect-[21/9]" : "aspect-[4/3]",
              )}
            />
          ) : (
            <div
              className={cn(
                "flex w-full items-center justify-center bg-gradient-to-br from-primary/15 via-background to-background transition-transform duration-700 group-hover:scale-[1.04]",
                isFull ? "aspect-[21/9]" : "aspect-[4/3]",
              )}
            >
              <p className="font-serif text-3xl text-foreground/60 md:text-5xl">{item.domain}</p>
            </div>
          )}
          {/* Status pill — top-right */}
          <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur-md">
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[item.status])} />
            {STATUS_LABEL[item.status]}
          </div>
          {/* Index number */}
          <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur-md">
            {String(item.order).padStart(2, "0")}
          </div>
          {/* Hover veil */}
          <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/15 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-black">
              Läs caset
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                {CATEGORY_LABEL[item.category]}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.type}
              </span>
            </div>
            <h3 className="mt-2 font-serif text-2xl tracking-tight transition-colors group-hover:text-primary md:text-3xl">
              {item.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-base">
              {item.tagline}
            </p>
          </div>
          <ArrowUpRight className="mt-3 h-5 w-5 shrink-0 text-muted-foreground transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>

        {/* Stack — minimal */}
        <p className="mt-3 font-mono text-[11px] text-muted-foreground/70">
          {item.stack.slice(0, 4).join(" / ")}
          {item.buildTime && <span className="text-foreground/60"> · {item.buildTime}</span>}
        </p>
      </Link>
    </motion.div>
  );
};

export default Arbete;

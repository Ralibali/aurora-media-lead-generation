import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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
  CATEGORY_BADGE,
  STATUS_LABEL,
  STATUS_DOT,
  type PortfolioCategory,
} from "@/data/portfolio";

type Filter = "alla" | PortfolioCategory;
type Sort = "featured" | "senast" | "kategori";

const filters: { value: Filter; label: string }[] = [
  { value: "alla", label: "Alla" },
  { value: "saas", label: "SaaS" },
  { value: "seo", label: "SEO" },
  { value: "development", label: "Utveckling" },
  { value: "marketing", label: "Marknadsföring" },
];

const sortOptions: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "senast", label: "Senast" },
  { value: "kategori", label: "Kategori" },
];

const Arbete = () => {
  const [active, setActive] = useState<Filter>("alla");
  const [sort, setSort] = useState<Sort>("featured");

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

  const filtered = useMemo(() => {
    const base = active === "alla" ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === active);
    const sorted = [...base];
    if (sort === "featured") {
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
    } else if (sort === "senast") {
      sorted.sort((a, b) => b.order - a.order);
    } else {
      sorted.sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);
    }
    return sorted;
  }, [active, sort]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="pt-16 pb-10 md:pt-24 md:pb-14">
          <div className="container mx-auto max-w-4xl px-6">
            <motion.div {...fadeUp}>
              <p className="label-caps">Arbete</p>
              <h1 className="mt-4 font-serif text-[clamp(2.75rem,7vw,6rem)] leading-[1.05] tracking-[-0.02em]">
                {PORTFOLIO.length} projekt.{" "}
                <em className="italic text-primary">Alla live eller pågående.</em>
              </h1>
              <p className="mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Egna SaaS-produkter, utvecklingsuppdrag och SEO-arbeten. Inga case-studies från en
                byrå jag jobbade på 2018 – det här är mitt arbete, just nu.
              </p>
            </motion.div>

            {/* Filters + Sort */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Filtrera arbete"
              >
                {filters.map((f) => {
                  const isActive = f.value === active;
                  return (
                    <button
                      key={f.value}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(f.value)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-transparent text-muted-foreground hover:border-primary hover:text-foreground",
                      )}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="sort" className="text-muted-foreground">
                  Sortera:
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-6 text-sm text-muted-foreground"
              aria-live="polite"
            >
              Visar {filtered.length} av {PORTFOLIO.length} projekt
            </motion.p>
          </div>
        </section>

        {/* Grid */}
        <section className="pb-24 md:pb-32">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-6 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((c, i) => (
                  <motion.div
                    key={c.slug}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <Link
                      to={`/arbete/${c.slug}`}
                      className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg md:p-9"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                            CATEGORY_BADGE[c.category],
                          )}
                        >
                          {CATEGORY_LABEL[c.category]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[c.status])} />
                          {STATUS_LABEL[c.status]}
                        </span>
                      </div>

                      <h2 className="mt-4 font-serif text-3xl md:text-4xl">{c.name}</h2>
                      <p className="mt-3 text-base leading-relaxed text-foreground/80 md:text-lg">
                        {c.tagline}
                      </p>

                      <div className="mt-7 space-y-2 border-t border-border pt-5 text-sm">
                        <p className="font-mono text-xs text-muted-foreground">
                          {c.stack.slice(0, 4).join(" · ")}
                        </p>
                        <p className="text-foreground/75">
                          {c.type}
                          {c.buildTime ? ` · ${c.buildTime}` : ""}
                        </p>
                      </div>

                      <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Läs caset
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </motion.div>
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

export default Arbete;

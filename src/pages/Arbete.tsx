import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Dog,
  Egg,
  HeartPulse,
  Sailboat,
  Sprout,
  Sun,
  Tent,
  Trophy,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import AuroraNavbar from "@/components/landing/AuroraNavbar";
import AuroraFooter from "@/components/landing/AuroraFooter";
import AuroraFinalCTA from "@/components/landing/AuroraFinalCTA";
import AuroraStickyMobileCTA from "@/components/landing/AuroraStickyMobileCTA";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setBreadcrumb, removeJsonLd, setJsonLd, SITE_URL } from "@/lib/seoHelpers";
import {
  PORTFOLIO,
  CATEGORY_LABEL,
  STATUS_LABEL,
  type PortfolioCategory,
  type PortfolioItem,
} from "@/data/portfolio";

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  "aurora-transport": Truck,
  updro: Users,
  agilitymanager: Dog,
  honsgarden: Egg,
  odlingsdagboken: Sprout,
  "goglamping-sweden": Tent,
  viriditas: HeartPulse,
  "yachting-sweden": Sailboat,
  solcellsofferter: Sun,
  minandel: Trophy,
};

const STATUS_DOT_COLOR: Record<string, string> = {
  live: "hsl(152 80% 55%)",
  pågående: "hsl(45 90% 60%)",
  beta: "hsl(210 80% 60%)",
  planerad: "hsl(var(--au-cream) / 0.4)",
};

type Filter = "alla" | PortfolioCategory;

const filters: { value: Filter; label: string }[] = [
  { value: "alla", label: "Alla" },
  { value: "saas", label: "SaaS" },
  { value: "development", label: "Utveckling" },
  { value: "seo", label: "SEO" },
  { value: "marketing", label: "Marknadsföring" },
];

const Arbete = () => {
  const { open } = useContactModal();
  const [active, setActive] = useState<Filter>("alla");

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

  const sorted = useMemo(() => [...PORTFOLIO].sort((a, b) => a.order - b.order), []);
  const flagship = useMemo(() => sorted.find((p) => p.featured) ?? sorted[0], [sorted]);
  const filtered = useMemo(
    () => (active === "alla" ? sorted : sorted.filter((p) => p.category === active)),
    [active, sorted],
  );
  const liveCount = useMemo(() => sorted.filter((p) => p.status === "live").length, [sorted]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { alla: sorted.length, saas: 0, development: 0, seo: 0, marketing: 0 };
    sorted.forEach((p) => {
      c[p.category] += 1;
    });
    return c;
  }, [sorted]);

  return (
    <div className="aurora-theme min-h-screen">
      <AuroraNavbar />
      <main id="main" className="overflow-hidden">
        <section className="aurora-bg relative min-h-[78vh] pt-28 md:pt-36">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 md:px-8 lg:grid-cols-12 lg:items-end lg:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
              className="lg:col-span-7"
            >
              <p className="au-eyebrow">REFERENSER · {sorted.length} PROJEKT</p>
              <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-[-0.045em]">
                Projekt som redan är ute i verkligheten.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "hsl(var(--au-cream) / 0.72)" }}>
                Egna SaaS-produkter, appar, webbplattformar och SEO-uppdrag med riktiga användare, kunder och resultat.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={() => open()} className="au-btn-coral">
                  Starta ett projekt
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
                <a href="#projekt" className="au-btn-ghost">
                  Se projekten
                  <ArrowUpRight size={16} strokeWidth={2.2} />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              className="grid gap-4 sm:grid-cols-3 lg:col-span-5"
            >
              {[
                { value: sorted.length, label: "projekt" },
                { value: liveCount, label: "live" },
                { value: counts.saas, label: "SaaS" },
              ].map((stat) => (
                <div key={stat.label} className="au-card-static p-5">
                  <p className="font-display text-4xl leading-none" style={{ color: "hsl(152 80% 60%)" }}>
                    {stat.value}
                  </p>
                  <p className="mt-2 font-mono-au text-[10px] uppercase tracking-[0.18em]" style={{ color: "hsl(var(--au-cream) / 0.55)" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="projekt" className="aurora-section-bg relative border-t py-20 md:py-28" style={{ borderColor: "hsl(var(--au-cream) / 0.08)" }}>
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <p className="au-eyebrow">PORTFÖLJ</p>
                <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
                  Samma system, samma känsla, alla case.
                </h2>
              </div>
              <div className="lg:col-span-7 lg:pt-2">
                <p className="text-base leading-relaxed md:text-lg" style={{ color: "hsl(var(--au-cream) / 0.7)" }}>
                  Filtrera efter typ av uppdrag och klicka vidare till detaljerna. Layouten följer samma Aurora-UX som resten av sajten.
                </p>
              </div>
            </div>

            <div className="sticky top-[68px] z-30 -mx-5 mt-10 border-y px-5 py-3 backdrop-blur-xl md:-mx-8 md:px-8" style={{ background: "hsl(var(--au-bg) / 0.78)", borderColor: "hsl(var(--au-cream) / 0.08)" }}>
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {filters.map((filter) => {
                  const isActive = filter.value === active;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => setActive(filter.value)}
                      className="shrink-0 rounded-full border px-4 py-2 font-mono-au text-[10px] uppercase tracking-[0.14em] transition-all duration-300"
                      style={{
                        background: isActive ? "hsl(var(--au-emerald) / 0.16)" : "hsl(var(--au-cream) / 0.035)",
                        borderColor: isActive ? "hsl(var(--au-emerald) / 0.55)" : "hsl(var(--au-cream) / 0.1)",
                        color: isActive ? "hsl(152 80% 70%)" : "hsl(var(--au-cream) / 0.68)",
                      }}
                    >
                      {filter.label} · {counts[filter.value]}
                    </button>
                  );
                })}
              </div>
            </div>

            {active === "alla" && flagship && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                className="mt-10 grid gap-4 lg:grid-cols-2"
              >
                <ProjectCard item={flagship} large />
                <div className="grid gap-4 sm:grid-cols-2">
                  {sorted.filter((p) => p.slug !== flagship.slug).slice(0, 4).map((item) => (
                    <ProjectCard key={item.slug} item={item} />
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              <motion.div layout className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(active === "alla" ? sorted.filter((p) => p.slug !== flagship.slug).slice(4) : filtered).map((item, index) => (
                  <ProjectCard key={item.slug} item={item} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <p className="mt-10 text-center text-sm" style={{ color: "hsl(var(--au-cream) / 0.6)" }}>
                Inga projekt i den här kategorin än.
              </p>
            )}
          </div>
        </section>

        <AuroraFinalCTA />
      </main>
      <AuroraFooter />
      <AuroraStickyMobileCTA />
    </div>
  );
};

const ProjectCard = ({ item, large = false, index = 0 }: { item: PortfolioItem; large?: boolean; index?: number }) => {
  const Icon = ICON_BY_SLUG[item.slug] ?? Code2;
  const isFlagship = item.featured;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.035, 0.18), ease: [0.32, 0.72, 0, 1] }}
    >
      <Link
        to={`/arbete/${item.slug}`}
        aria-label={`Läs caset om ${item.name}`}
        className={`group au-card relative flex h-full flex-col overflow-hidden ${large ? "min-h-[430px] p-8 md:p-10" : "min-h-[300px] p-6"}`}
        style={
          isFlagship
            ? {
                background: "linear-gradient(180deg, hsl(152 50% 10% / 0.55), hsl(156 14% 11%))",
                boxShadow: "0 0 0 1px hsl(152 80% 38% / 0.25), 0 30px 80px -30px hsl(152 80% 30% / 0.55)",
                borderColor: "hsl(152 80% 38% / 0.35)",
              }
            : undefined
        }
      >
        {isFlagship && (
          <span className="au-eyebrow mb-4 inline-block">FLAGGSKEPP</span>
        )}

        <div className="flex items-start justify-between gap-4">
          <span className="au-icon">
            <Icon size={20} strokeWidth={2} />
          </span>
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-300 group-hover:rotate-[20deg]"
            style={{
              background: "hsl(var(--au-cream) / 0.06)",
              border: "1px solid hsl(var(--au-cream) / 0.1)",
              color: "hsl(var(--au-cream) / 0.85)",
            }}
          >
            <ArrowUpRight size={15} strokeWidth={2.2} />
          </span>
        </div>

        <h3 className={`mt-5 font-display tracking-[-0.025em] ${large ? "text-3xl md:text-5xl" : "text-2xl"}`}>
          {item.name}
        </h3>
        <p className={`${large ? "mt-3 text-base md:text-lg" : "mt-2 text-sm"} leading-relaxed`} style={{ color: "hsl(152 80% 65%)" }}>
          {item.tagline}
        </p>
        {large && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: "hsl(var(--au-cream) / 0.65)" }}>
            {item.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono-au text-[11px]" style={{ color: "hsl(var(--au-cream) / 0.55)" }}>
          <span className="truncate">{item.domain}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_DOT_COLOR[item.status] }} />
            {STATUS_LABEL[item.status]}
          </span>
          {item.buildTime && <span className="opacity-80">· {item.buildTime}</span>}
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
          <span
            className="rounded-full px-2.5 py-1 font-mono-au text-[10px] uppercase tracking-[0.14em]"
            style={{
              background: "hsl(152 80% 38% / 0.12)",
              color: "hsl(152 80% 70%)",
              border: "1px solid hsl(152 80% 38% / 0.25)",
            }}
          >
            {CATEGORY_LABEL[item.category]}
          </span>
          {item.stack.slice(0, large ? 4 : 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-1 font-mono-au text-[10px] uppercase tracking-[0.14em]"
              style={{
                background: "hsl(var(--au-cream) / 0.04)",
                color: "hsl(var(--au-cream) / 0.6)",
                border: "1px solid hsl(var(--au-cream) / 0.08)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </motion.div>
  );
};

export default Arbete;

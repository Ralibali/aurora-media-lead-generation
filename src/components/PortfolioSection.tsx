import { ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PortfolioPlaceholder from "@/components/PortfolioPlaceholder";
import {
  PORTFOLIO,
  CATEGORY_LABEL,
  CATEGORY_BADGE,
  STATUS_LABEL,
  STATUS_DOT,
} from "@/data/portfolio";

const fadeUp = {
  initial: { opacity: 0, y: 32, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: [0.32, 0.72, 0, 1] as const },
};

// Bento spans for the standard grid (max 6 visible to keep startsidan ren)
const bentoLayout = [
  "lg:col-span-2 lg:row-span-1",
  "lg:col-span-1 lg:row-span-1",
  "lg:col-span-1 lg:row-span-2",
  "lg:col-span-1 lg:row-span-1",
  "lg:col-span-2 lg:row-span-1",
  "lg:col-span-1 lg:row-span-1",
];

const PortfolioSection = () => {
  // Sort by `order`, featured first.
  const sorted = [...PORTFOLIO].sort((a, b) => a.order - b.order);
  const featured = sorted.find((p) => p.featured) ?? sorted[0];
  const rest = sorted.filter((p) => p.slug !== featured.slug).slice(0, 6);
  const totalCount = PORTFOLIO.length;
  const saasCount = PORTFOLIO.filter((p) => p.category === "saas").length;

  return (
    <section id="portfolj" className="border-t border-border py-24 md:py-36">
      <div className="container mx-auto px-6">
        <motion.div {...fadeUp} className="flex items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="label-caps">Arbete · 2024–2026</p>
            <h2 className="mt-3 font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] tracking-[-0.025em]">
              {saasCount} SaaS,
              <br />
              <span className="italic text-primary">live just nu.</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Plus {totalCount - saasCount} utvecklings- och SEO-uppdrag.
            </p>
          </div>
          <p className="hidden max-w-xs text-base text-muted-foreground md:block">
            Inga vaporware-mockups. Inga case-studies från praktikperioden 2014. Klicka och se.
          </p>
        </motion.div>

        {/* LEVEL 1 – FEATURED Z-axis cascade */}
        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
            className="relative lg:col-span-7"
          >
            {/* Sister card behind */}
            <div
              aria-hidden
              className="bezel-shell pointer-events-none absolute -right-3 -top-4 hidden h-[calc(100%-1rem)] w-[88%] -rotate-[1.5deg] opacity-60 md:block"
              style={{ transform: "translate(-20px, 0) rotate(-1.5deg)" }}
            >
              <div className="bezel-core h-full" />
            </div>

            {/* Main card */}
            <Link
              to={`/arbete/${featured.slug}`}
              className="group relative block"
              aria-label={`Läs mer om ${featured.name}`}
            >
              <div
                className="bezel-shell transition-transform duration-700 group-hover:-translate-y-1"
                style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
              >
                <div className="bezel-core overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                    <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                      {featured.domain}
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[hsl(154_44%_45%)]/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[hsl(154_44%_35%)]">
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[featured.status]}`} />
                      {STATUS_LABEL[featured.status]}
                    </span>
                  </div>
                  {/* Screen */}
                  {featured.screenshot ? (
                    <img
                      src={featured.screenshot}
                      alt={`Skärmavbild av ${featured.name}`}
                      className="aspect-[16/10] w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative">
                      <PortfolioPlaceholder
                        domain={featured.domain}
                        label="01 — Featured"
                      />
                      <span
                        className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${CATEGORY_BADGE[featured.category]}`}
                      >
                        {CATEGORY_LABEL[featured.category]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Right: longform */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-col justify-center lg:col-span-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              {featured.shortLabel ?? featured.type}
            </p>
            <h3 className="mt-4 font-serif text-4xl leading-[1.05] md:text-5xl">{featured.name}</h3>
            <p className="mt-6 text-lg leading-relaxed text-foreground/80">{featured.tagline}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {featured.stack.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to={`/arbete/${featured.slug}`} className="group btn-pill">
                <span className="text-sm font-medium">Läs caset</span>
                <span className="btn-pill-icon">
                  <ArrowUpRight weight="bold" size={16} />
                </span>
              </Link>
              <a
                href={featured.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Eller besök {featured.domain}
              </a>
            </div>
          </motion.div>
        </div>

        {/* LEVEL 2 – Asymmetric bento */}
        <div className="mt-20 grid auto-rows-[minmax(280px,auto)] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: [0.32, 0.72, 0, 1] }}
              className={`group relative ${bentoLayout[i] ?? ""}`}
            >
              <Link
                to={`/arbete/${c.slug}`}
                aria-label={`Läs mer om ${c.name}`}
                className="block h-full"
              >
                <div
                  className="bezel-shell h-full transition-transform duration-700 group-hover:-translate-y-1"
                  style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
                >
                  <div className="bezel-core flex h-full flex-col overflow-hidden">
                    {/* Browser chrome */}
                    <div className="flex items-center gap-1.5 border-b border-border/40 px-3 py-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
                      <span className="ml-2 truncate font-mono text-[10px] text-muted-foreground">
                        {c.domain}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[c.status]}`} />
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>

                    {/* Screen */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${CATEGORY_BADGE[c.category]}`}
                        >
                          {CATEGORY_LABEL[c.category]}
                        </span>
                        <h3 className="mt-3 font-serif text-2xl leading-tight md:text-3xl">
                          {c.name}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                          {c.tagline}
                        </p>
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {c.stack.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-border/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground/60 transition-all duration-500 group-hover:bg-foreground group-hover:text-background"
                          style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
                        >
                          <ArrowUpRight weight="bold" size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA till full portfolio */}
        <div className="mt-16 text-center">
          <Link
            to="/arbete"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
          >
            Se alla {totalCount} projekt
            <ArrowUpRight weight="bold" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Backwards-compat export – några äldre filer importerade { cases }.
export const cases = PORTFOLIO;

export default PortfolioSection;

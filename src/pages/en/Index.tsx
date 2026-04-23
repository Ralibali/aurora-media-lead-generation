import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Envelope } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import Reveal from "@/components/Reveal";
import PortfolioPlaceholder from "@/components/PortfolioPlaceholder";
import { useContactModal } from "@/components/ContactModal";
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
import { cn } from "@/lib/utils";

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
  const { open: openModal } = useContactModal();

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* HERO */}
        <section className="pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto max-w-5xl px-6">
            <Reveal>
              <p className="label-caps">Aurora Media · Sweden</p>
              <h1 className="mt-5 font-serif text-[clamp(2.75rem,8vw,7rem)] leading-[1.02] tracking-[-0.025em]">
                I ship SaaS in weeks.{" "}
                <em className="italic text-primary">Not months. Not quarters.</em>
              </h1>
              <p className="mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
                AI-augmented developer based in Sweden. 7 SaaS shipped in 18 months.
                All live. All paying.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-3">
              <button onClick={() => openModal()} className="group btn-pill">
                <span className="text-sm font-medium">Start a project</span>
                <span className="btn-pill-icon">
                  <ArrowUpRight weight="bold" size={16} />
                </span>
              </button>
              <a href="#work" className="group btn-pill-ghost">
                <span className="text-sm font-medium">See my work</span>
                <span className="btn-pill-ghost-icon">
                  <ArrowUpRight weight="bold" size={16} />
                </span>
              </a>
            </Reveal>
          </div>
        </section>

        {/* TRUST BAR */}
        <section className="border-y border-border bg-secondary/40 py-6">
          <div className="container mx-auto max-w-5xl px-6">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:text-xs">
              {trustItems.map((t, i) => (
                <li key={t} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 md:inline-block" />}
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* STACK */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto max-w-5xl px-6">
            <Reveal>
              <p className="label-caps">Stack</p>
              <h2 className="mt-3 font-serif text-3xl md:text-5xl">
                The tools I build with every day.
              </h2>
            </Reveal>
            <Reveal delay={0.05} className="mt-10 flex flex-wrap gap-2">
              {stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border bg-card px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground"
                >
                  {s}
                </span>
              ))}
            </Reveal>
          </div>
        </section>

        {/* PORTFOLIO */}
        <section id="work" className="border-t border-border py-24 md:py-32">
          <div className="container mx-auto max-w-6xl px-6">
            <Reveal>
              <p className="label-caps">Work · 2024–2026</p>
              <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.02em]">
                {saasCount} SaaS, <span className="italic text-primary">live right now.</span>
              </h2>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                Plus {PORTFOLIO.length - saasCount} development and SEO engagements. All real.
                All clickable.
              </p>
            </Reveal>

            <Reveal delay={0.05} className="mt-10 flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActive(f.value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    f.value === active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-muted-foreground hover:border-primary hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block h-full"
                      aria-label={`Visit ${c.name}`}
                    >
                      <div className="bezel-shell h-full transition-transform duration-700 group-hover:-translate-y-1">
                        <div className="bezel-core flex h-full flex-col overflow-hidden">
                          <div className="flex items-center gap-1.5 border-b border-border/40 px-3 py-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
                            <span className="ml-2 truncate font-mono text-[10px] text-muted-foreground">
                              {c.domain}
                            </span>
                            <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80">
                              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[c.status])} />
                              {STATUS_LABEL[c.status]}
                            </span>
                          </div>

                          {c.screenshot ? (
                            <img
                              src={c.screenshot}
                              alt={`Screenshot of ${c.name}`}
                              className="aspect-[16/10] w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <PortfolioPlaceholder domain={c.domain} />
                          )}

                          <div className="flex flex-1 flex-col p-5">
                            <span
                              className={cn(
                                "inline-flex w-fit items-center rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                                CATEGORY_BADGE[c.category],
                              )}
                            >
                              {CATEGORY_LABEL[c.category]}
                            </span>
                            <h3 className="mt-3 font-serif text-2xl leading-tight">
                              {c.name}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                              {getLocalizedTagline(c, "en")}
                            </p>

                            <div className="mt-5 flex items-end justify-between gap-3">
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
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground/60 transition-all duration-500 group-hover:bg-foreground group-hover:text-background">
                                <ArrowUpRight weight="bold" size={14} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="border-t border-border py-24 md:py-32">
          <div className="container mx-auto max-w-5xl px-6">
            <Reveal>
              <p className="label-caps">Pricing</p>
              <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.02em]">
                Fixed price. <span className="italic text-primary">Fixed timeline.</span>
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {pricing.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.05}>
                  <div
                    className={cn(
                      "flex h-full flex-col rounded-2xl border bg-card p-7 transition-colors",
                      p.featured
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {p.timeline}
                    </p>
                    <h3 className="mt-3 font-serif text-3xl">{p.name}</h3>
                    <p className="mt-2 font-serif text-2xl text-primary">{p.price}</p>
                    <p className="mt-4 text-sm leading-relaxed text-foreground/75">
                      {p.blurb}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <p className="mt-10 max-w-2xl font-mono text-xs text-muted-foreground">
              Pricing in USD, invoiced in SEK from Aurora Media AB (Swedish corp,
              VAT-exempt for non-EU clients).
            </p>
          </div>
        </section>

        {/* WHY ME */}
        <section className="border-t border-border py-24 md:py-32">
          <div className="container mx-auto max-w-5xl px-6">
            <Reveal>
              <p className="label-caps">Why me</p>
              <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.02em]">
                What you actually get.
              </h2>
            </Reveal>

            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {whyMe.map((w, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <li className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                      0{i + 1}
                    </span>
                    <p className="mt-4 text-base leading-relaxed text-foreground/85 md:text-lg">
                      {w}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* PROCESS */}
        <section className="border-t border-border py-24 md:py-32">
          <div className="container mx-auto max-w-5xl px-6">
            <Reveal>
              <p className="label-caps">Process</p>
              <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1] tracking-[-0.02em]">
                Three steps. <span className="italic text-primary">No surprises.</span>
              </h2>
            </Reveal>

            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {process.map((p, i) => (
                <Reveal key={p.n} delay={i * 0.05}>
                  <li className="flex h-full flex-col rounded-2xl border border-border bg-card p-7">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                      Step {p.n}
                    </span>
                    <h3 className="mt-3 font-serif text-2xl md:text-3xl">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/75 md:text-base">
                      {p.body}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="border-t border-border py-24 md:py-32">
          <div className="container mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <p className="label-caps">Get in touch</p>
              <h2 className="mt-4 font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-[-0.02em]">
                Let's talk about <em className="italic text-primary">your project.</em>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Email:{" "}
                <a
                  href="mailto:info@auroramedia.se"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  info@auroramedia.se
                </a>
                <br />
                <span className="text-base">Response within 24h on weekdays.</span>
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => openModal()} className="group btn-pill">
                <span className="text-sm font-medium">Schedule a call</span>
                <span className="btn-pill-icon">
                  <ArrowUpRight weight="bold" size={16} />
                </span>
              </button>
              <a
                href="mailto:info@auroramedia.se?subject=Project%20inquiry"
                className="group btn-pill-ghost"
              >
                <Envelope weight="bold" size={16} />
                <span className="text-sm font-medium">Email me directly</span>
              </a>
            </Reveal>

            <p className="mt-10 text-sm text-muted-foreground">
              Prefer Swedish? <Link to="/" className="underline underline-offset-4 hover:text-foreground">Gå till svenska sidan →</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
};

export default EnIndex;

import { ArrowUpRight } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export const cases = [
  {
    name: "Aurora Transport",
    domain: "auroratransport.se",
    tagline: "Dispatching-SaaS för svenska transportbolag. CJ Bemanning var första kunden.",
    label: "FEATURED · TRANSPORT · B2B",
    meta: "3 veckor · Lovable · Supabase · Stripe · Fortnox",
    platforms: "WEB",
    featured: true,
  },
  {
    name: "Updro",
    domain: "updro.se",
    tagline: "Marknadsplats där företag jämför offerter från digitala byråer.",
    label: "MARKNADSPLATS",
    meta: "4 veckor · Stripe Connect",
    platforms: "WEB",
  },
  {
    name: "AgilityManager",
    domain: "agilitymanager.se",
    tagline: "Träningsapp för svenska agility-förare. iOS + Android planerade 2026.",
    label: "KONSUMENT · SAAS",
    meta: "3 veckor · Firecrawl",
    platforms: "WEB",
  },
  {
    name: "Hönsgården",
    domain: "honsgarden.se",
    tagline: "Freemium-app för svenska hönsägare. Webb + Google Play-app via Capacitor.",
    label: "KONSUMENT · MOBIL",
    meta: "2 veckor · RevenueCat · Capacitor",
    platforms: "WEB + PLAY",
  },
  {
    name: "Odlingsdagboken",
    domain: "odlingsdagboken.com",
    tagline: "Svensk odlings-SaaS med AI-coach.",
    label: "KONSUMENT · AI",
    meta: "3 veckor · Claude API",
    platforms: "WEB",
  },
  {
    name: "GoGlamping Sweden",
    domain: "goglampingsweden.se",
    tagline: "Bokningssajt för glamping vid Göta kanal.",
    label: "BOKNING",
    meta: "2 veckor · Sirvoy",
    platforms: "WEB",
  },
  {
    name: "Viriditas",
    domain: "viriditasmassage.se",
    tagline: "Bokningssajt för massagemottagning.",
    label: "BOKNING",
    meta: "1 vecka · React + Vite",
    platforms: "WEB",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 32, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: [0.32, 0.72, 0, 1] as const },
};

// Bento spans for the standard grid
const bentoLayout = [
  "lg:col-span-2 lg:row-span-1", // Updro – wide
  "lg:col-span-1 lg:row-span-1", // AgilityManager
  "lg:col-span-1 lg:row-span-2", // Hönsgården – tall
  "lg:col-span-1 lg:row-span-1", // Odlingsdagboken
  "lg:col-span-2 lg:row-span-1", // GoGlamping – wide
  "lg:col-span-1 lg:row-span-1", // Viriditas
];

const PortfolioSection = () => {
  const featured = cases[0];
  const rest = cases.slice(1);

  return (
    <section id="portfolj" className="border-t border-border py-24 md:py-36">
      <div className="container mx-auto px-6">
        <motion.div {...fadeUp} className="flex items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="label-caps">Arbete · 2024–2026</p>
            <h2 className="mt-3 font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] tracking-[-0.025em]">
              Sju SaaS,
              <br />
              <span className="italic text-primary">live just nu.</span>
            </h2>
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
            <a
              href={`https://${featured.domain}`}
              target="_blank"
              rel="noreferrer"
              className="group relative block"
            >
              <div className="bezel-shell transition-transform duration-700 group-hover:-translate-y-1" style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}>
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
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(154_44%_45%)]" />
                      Live
                    </span>
                  </div>
                  {/* Screen */}
                  <div className="relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-secondary via-accent to-secondary">
                    <div className="text-center">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        01 — Featured
                      </p>
                      <p className="mt-3 font-serif text-3xl text-foreground/70 md:text-5xl">
                        {featured.domain}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </a>
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
              {featured.label}
            </p>
            <h3 className="mt-4 font-serif text-4xl leading-[1.05] md:text-5xl">
              {featured.name}
            </h3>
            <p className="mt-6 text-lg leading-relaxed text-foreground/80">
              {featured.tagline}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {featured.meta.split(" · ").map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href={`https://${featured.domain}`}
              target="_blank"
              rel="noreferrer"
              className="group btn-pill mt-10 self-start"
            >
              <span className="text-sm font-medium">Se {featured.domain}</span>
              <span className="btn-pill-icon">
                <ArrowUpRight weight="bold" size={16} />
              </span>
            </a>
          </motion.div>
        </div>

        {/* LEVEL 2 – Asymmetric bento */}
        <div className="mt-20 grid auto-rows-[minmax(280px,auto)] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((c, i) => (
            <motion.a
              key={c.domain}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.07,
                ease: [0.32, 0.72, 0, 1],
              }}
              href={`https://${c.domain}`}
              target="_blank"
              rel="noreferrer"
              className={`group relative ${bentoLayout[i] ?? ""}`}
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
                    <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80">
                      0{i + 2}
                    </span>
                  </div>

                  {/* Screen */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        {c.label}
                      </p>
                      <h3 className="mt-3 font-serif text-2xl leading-tight md:text-3xl">
                        {c.name}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                        {c.tagline}
                      </p>
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {c.meta
                          .split(" · ")
                          .slice(0, 3)
                          .map((tag) => (
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
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;

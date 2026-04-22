import { ArrowUpRight } from "lucide-react";
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
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const PortfolioSection = () => {
  const featured = cases[0];
  const rest = cases.slice(1);

  return (
    <section id="portfolj" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="label-caps">Portfölj</p>
          <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]">
            Sju SaaS, byggda av mig.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Live. Används. Inga vaporware-mockups.
          </p>
        </motion.div>

        {/* Featured */}
        <motion.a
          {...fadeUp}
          href={`https://${featured.domain}`}
          target="_blank"
          rel="noreferrer"
          className="group mt-14 grid overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl lg:grid-cols-12"
        >
          <div className="relative flex aspect-[16/10] items-center justify-center border-b border-border bg-gradient-to-br from-secondary to-accent lg:col-span-7 lg:aspect-auto lg:border-b-0 lg:border-r">
            <span className="font-serif text-3xl text-foreground/60 md:text-5xl">
              {featured.domain}
            </span>
          </div>
          <div className="flex flex-col justify-between gap-6 p-8 md:p-10 lg:col-span-5">
            <div>
              <p className="label-caps !text-[10px]">{featured.label}</p>
              <h3 className="mt-3 font-serif text-3xl md:text-4xl">{featured.name}</h3>
              <p className="mt-4 text-base leading-relaxed text-foreground/80">
                {featured.tagline}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {featured.meta}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 font-medium text-primary">
                Se {featured.domain}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </motion.a>

        {/* Grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((c, i) => (
            <motion.a
              key={c.domain}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              href={`https://${c.domain}`}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <div className="flex aspect-[16/10] items-center justify-center border-b border-border bg-secondary/40">
                <span className="font-serif text-xl text-foreground/60">{c.domain}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="label-caps !text-[10px]">{c.label}</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <h3 className="font-serif text-2xl">{c.name}</h3>
                  <ArrowUpRight className="mt-1 h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-3 flex-1 text-sm text-foreground/75">{c.tagline}</p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.meta}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;

import { motion } from "framer-motion";
import { Truck, Egg, Sprout, Dog, Users, ArrowUpRight } from "lucide-react";

type Card = {
  icon: typeof Truck;
  name: string;
  tagline: string;
  desc: string;
  tags: string[];
  url?: string;
  flagship?: boolean;
  badge?: string;
};

const PRODUCTS: Card[] = [
  {
    icon: Truck,
    name: "Aurora Transport",
    tagline: "Dispatch-system för transportbolag",
    desc: "PWA för planering, bemanning och fakturering — byggd på Supabase med Stripe-billing och Fortnox-koppling.",
    tags: ["SaaS", "B2B", "PWA"],
    url: "https://auroratransport.se",
    flagship: true,
    badge: "FLAGGSKEPP",
  },
  {
    icon: Egg,
    name: "Hönsgården",
    tagline: "Hönshållarapp med freemium-modell",
    desc: "Full app för värphöns-uppfödare — webb och Google Play. Onboarding-wizard, foderlogg och premium-prenumeration.",
    tags: ["B2C", "Mobile", "Subscription"],
    url: "https://honsgarden.se",
  },
  {
    icon: Sprout,
    name: "Odlingsdagboken",
    tagline: "Odlingsdagbok med AI-coach",
    desc: "Köksträdgård-SaaS med AI-coachen Gro inbyggd. Programmatic SEO och 7-dagars Plus-trial driver konvertering.",
    tags: ["AI", "SaaS", "SEO"],
    url: "https://odlingsdagboken.com",
  },
  {
    icon: Dog,
    name: "AgilityManager",
    tagline: "Träningsapp för hundagility",
    desc: "Plattform för agilityförare att logga banor, träningar och tävlingar — byggd för svenska klubbar.",
    tags: ["B2C", "Niche", "Lovable"],
  },
  {
    icon: Users,
    name: "Updro",
    tagline: "Marknadsplats för digitala byråer",
    desc: "B2B-plattform som matchar byråer med kunder. Escrow-system, lead-pricing och 1 500+ programmatiska SEO-sidor.",
    tags: ["Marketplace", "B2B", "Escrow"],
    url: "https://updro.se",
  },
];

const ProductCard = ({ card, large = false }: { card: Card; large?: boolean }) => {
  const Icon = card.icon;
  const Wrapper: any = card.url ? "a" : "div";
  const linkProps = card.url
    ? { href: card.url, target: "_blank", rel: "noreferrer" }
    : {};
  return (
    <Wrapper
      {...linkProps}
      className={`group au-card relative flex h-full flex-col overflow-hidden ${large ? "p-8 md:p-10" : "p-6"}`}
      style={
        card.flagship
          ? {
              background:
                "linear-gradient(180deg, hsl(152 50% 10% / 0.55), hsl(156 14% 11%))",
              boxShadow:
                "0 0 0 1px hsl(152 80% 38% / 0.25), 0 30px 80px -30px hsl(152 80% 30% / 0.55)",
              borderColor: "hsl(152 80% 38% / 0.35)",
            }
          : undefined
      }
    >
      {card.flagship && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(152 80% 45% / 0.35) 0%, transparent 65%)",
              filter: "blur(20px)",
            }}
          />
          <span className="au-eyebrow mb-4 inline-block">{card.badge}</span>
        </>
      )}

      <div className="flex items-start justify-between">
        <span className="au-icon">
          <Icon size={20} strokeWidth={2} />
        </span>
        <span
          className="grid h-9 w-9 place-items-center rounded-full transition-all duration-300 group-hover:rotate-[20deg]"
          style={{
            background: "hsl(var(--au-cream) / 0.06)",
            border: "1px solid hsl(var(--au-cream) / 0.1)",
            color: "hsl(var(--au-cream) / 0.85)",
          }}
        >
          <ArrowUpRight size={15} strokeWidth={2.2} />
        </span>
      </div>

      <h3
        className={`mt-5 font-display tracking-[-0.025em] ${large ? "text-3xl md:text-4xl" : "text-xl"}`}
      >
        {card.name}
      </h3>
      <p className={`mt-1.5 ${large ? "text-base" : "text-sm"} text-[hsl(152 80% 65%)]`}>
        {card.tagline}
      </p>
      <p className={`mt-3 ${large ? "text-base" : "text-[13.5px]"} leading-relaxed text-[hsl(var(--au-cream)/0.65)]`}>
        {card.desc}
      </p>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
        {card.tags.map((t) => (
          <span
            key={t}
            className="rounded-full px-2.5 py-1 font-mono-au text-[10px] uppercase tracking-[0.14em]"
            style={{
              background: "hsl(var(--au-cream) / 0.04)",
              color: "hsl(var(--au-cream) / 0.6)",
              border: "1px solid hsl(var(--au-cream) / 0.08)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </Wrapper>
  );
};

const AuroraProducts = () => (
  <section id="projekt" className="aurora-section-bg relative overflow-hidden py-24 md:py-32">
    <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="au-eyebrow">EGNA PRODUKTER</p>
          <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
            Vi bygger inte bara åt andra.{" "}
            <span style={{ color: "hsl(152 80% 60%)" }}>
              Vi bygger åt oss själva.
            </span>
          </h2>
        </div>
        <div className="lg:col-span-7 lg:pt-2">
          <p className="text-base leading-relaxed text-[hsl(var(--au-cream)/0.7)] md:text-lg">
            Aurora Media driver en egen portfölj av SaaS-produkter med riktiga
            kunder, prenumerationer och MRR. Det betyder att vi inte bara bygger
            din produkt — vi vet vad det krävs för att den ska överleva på
            marknaden.
          </p>
        </div>
      </div>

      {/* Asymmetric grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="mt-14 grid gap-4 lg:grid-cols-2"
      >
        {/* Big flagship */}
        <div className="lg:row-span-2">
          <ProductCard card={PRODUCTS[0]} large />
        </div>
        {/* 2x2 to the right */}
        <div className="grid gap-4 sm:grid-cols-2">
          {PRODUCTS.slice(1).map((p) => (
            <ProductCard key={p.name} card={p} />
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default AuroraProducts;

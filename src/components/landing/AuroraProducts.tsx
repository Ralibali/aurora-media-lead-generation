import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Truck,
  Egg,
  Sprout,
  Dog,
  Users,
  Tent,
  HeartPulse,
  Sailboat,
  Sun,
  Trophy,
  Code2,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import {
  PORTFOLIO,
  CATEGORY_LABEL,
  STATUS_LABEL,
  type PortfolioItem,
} from "@/data/portfolio";

// Slug → Lucide-ikon. Fallback: Code2.
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

type CardProps = {
  item: PortfolioItem;
  large?: boolean;
};

const ProductCard = ({ item, large = false }: CardProps) => {
  const Icon = ICON_BY_SLUG[item.slug] ?? Code2;
  const isFlagship = item.featured;

  return (
    <Link
      to={`/arbete/${item.slug}`}
      aria-label={`Läs caset om ${item.name}`}
      className={`group au-card relative flex h-full flex-col overflow-hidden ${
        large ? "p-8 md:p-10" : "p-6"
      }`}
      style={
        isFlagship
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
      {isFlagship && (
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
          <span className="au-eyebrow mb-4 inline-block">FLAGGSKEPP</span>
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
        className={`mt-5 font-display tracking-[-0.025em] ${
          large ? "text-3xl md:text-4xl" : "text-xl"
        }`}
      >
        {item.name}
      </h3>
      <p
        className={`mt-1.5 ${large ? "text-base" : "text-sm"}`}
        style={{ color: "hsl(152 80% 65%)" }}
      >
        {item.tagline}
      </p>

      {large && (
        <p
          className="mt-3 text-base leading-relaxed"
          style={{ color: "hsl(var(--au-cream) / 0.65)" }}
        >
          {item.description}
        </p>
      )}

      {/* Domain + status */}
      <div
        className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono-au text-[11px]"
        style={{ color: "hsl(var(--au-cream) / 0.55)" }}
      >
        <span className="truncate">{item.domain}</span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: STATUS_DOT_COLOR[item.status] }}
          />
          {STATUS_LABEL[item.status]}
        </span>
        {item.buildTime && (
          <span className="opacity-80">· {item.buildTime}</span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
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
        {item.stack.slice(0, large ? 4 : 2).map((t) => (
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
    </Link>
  );
};

const AuroraProducts = () => {
  const sorted = [...PORTFOLIO].sort((a, b) => a.order - b.order);
  const flagship = sorted.find((p) => p.featured) ?? sorted[0];
  const rest = sorted.filter((p) => p.slug !== flagship.slug);
  const liveCount = sorted.filter((p) => p.status === "live").length;

  return (
    <section
      id="projekt"
      className="aurora-section-bg relative overflow-hidden py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="au-eyebrow">REFERENSER · {sorted.length} PROJEKT</p>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
              {liveCount} live just nu.{" "}
              <span style={{ color: "hsl(152 80% 60%)" }}>
                Inga case från praktiken.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-2">
            <p
              className="text-base leading-relaxed md:text-lg"
              style={{ color: "hsl(var(--au-cream) / 0.7)" }}
            >
              Aurora Media driver en egen portfölj av SaaS-produkter med riktiga
              kunder, prenumerationer och MRR — plus utvecklings- och
              SEO-uppdrag åt svenska bolag. Klicka och se. Allt nedan är på
              riktigt.
            </p>
          </div>
        </div>

        {/* Top: flagship + 2x2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mt-14 grid gap-4 lg:grid-cols-2"
        >
          <div className="lg:row-span-2">
            <ProductCard item={flagship} large />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} item={p} />
            ))}
          </div>
        </motion.div>

        {/* Resten av portföljen i 3-kol grid */}
        {rest.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {rest.slice(4).map((p) => (
              <ProductCard key={p.slug} item={p} />
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/arbete"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-sm tracking-[-0.01em] transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "hsl(var(--au-cream) / 0.04)",
              border: "1px solid hsl(var(--au-cream) / 0.12)",
              color: "hsl(var(--au-cream) / 0.9)",
            }}
          >
            Se alla {sorted.length} projekt i detalj
            <ArrowUpRight size={15} strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AuroraProducts;

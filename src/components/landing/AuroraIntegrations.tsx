import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type Item = { name: string; letter: string; bg: string; fg: string };

const INTEGRATIONS: Item[] = [
  { name: "Fortnox",       letter: "F", bg: "hsl(155 60% 22%)", fg: "hsl(155 80% 75%)" },
  { name: "BankID",        letter: "B", bg: "hsl(210 80% 28%)", fg: "hsl(210 90% 80%)" },
  { name: "Stripe",        letter: "S", bg: "hsl(258 65% 30%)", fg: "hsl(258 90% 82%)" },
  { name: "Slack",         letter: "S", bg: "hsl(0 65% 30%)",   fg: "hsl(338 80% 80%)" },
  { name: "Visma",         letter: "V", bg: "hsl(355 70% 30%)", fg: "hsl(355 90% 82%)" },
  { name: "Shopify",       letter: "S", bg: "hsl(95 55% 25%)",  fg: "hsl(95 75% 75%)" },
  { name: "Microsoft 365", letter: "M", bg: "hsl(212 70% 28%)", fg: "hsl(212 90% 82%)" },
  { name: "Supabase",      letter: "S", bg: "hsl(152 60% 22%)", fg: "hsl(152 80% 70%)" },
  { name: "OpenAI",        letter: "O", bg: "hsl(168 50% 22%)", fg: "hsl(168 75% 75%)" },
];

const AuroraIntegrations = () => (
  <section id="integrationer" className="aurora-section-bg relative overflow-hidden py-24 md:py-32">
    <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="au-eyebrow">INTEGRATIONER</p>
          <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
            Sömlöst kopplat till din{" "}
            <span style={{ color: "hsl(152 80% 60%)" }}>verksamhet.</span>
          </h2>
        </div>
        <div className="lg:col-span-7 lg:pt-2">
          <p className="text-base leading-relaxed text-[hsl(var(--au-cream)/0.7)] md:text-lg">
            Vi bygger anpassade integrationer mot REST/GraphQL-API:er, OAuth
            2.0-flöden och webhooks. Listan är bara en början — kan ditt verktyg
            prata API, kan vi koppla det.
          </p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
        {INTEGRATIONS.map((it, i) => (
          <motion.div
            key={it.name}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
            className="au-card flex items-center gap-3 p-4"
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-base"
              style={{
                background: it.bg,
                color: it.fg,
                border: "1px solid hsl(0 0% 100% / 0.06)",
              }}
            >
              {it.letter}
            </span>
            <span className="text-[15px] font-medium text-[hsl(var(--au-cream)/0.9)]">
              {it.name}
            </span>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 flex items-start gap-2.5 text-sm text-[hsl(var(--au-cream)/0.7)]">
        <Sparkles size={16} className="mt-0.5 shrink-0" color="hsl(152 80% 60%)" />
        <span>
          <span style={{ color: "hsl(152 80% 65%)" }} className="font-semibold">
            + Alla verktyg du inte ser
          </span>{" "}
          — vi bygger anpassade integrationer på begäran.
        </span>
      </p>
    </div>
  </section>
);

export default AuroraIntegrations;

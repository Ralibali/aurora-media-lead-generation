import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";

type Pkg = {
  num: string;
  name: string;
  price: string;
  intro: string;
  features: string[];
  cta: string;
  paket: string;
  popular?: boolean;
  filledCta?: boolean;
};

const PACKAGES: Pkg[] = [
  {
    num: "01",
    name: "Prototyp",
    price: "Från 14 900 kr",
    intro: "För dig som vill testa en idé snabbt innan större investering.",
    features: ["Klickbar prototyp", "1–2 användarflöden", "UX-genomgång", "Leverans 1–2 veckor"],
    cta: "Starta med prototyp",
    paket: "Prototyp",
  },
  {
    num: "02",
    name: "MVP",
    price: "Från 34 900 kr",
    intro: "För dig som vill lansera en första fungerande produkt med riktiga kunder.",
    features: [
      "Fungerande webb-/mobilapp",
      "Auth, betalningar, databas",
      "Stripe + valfri integration",
      "Leverans 3–4 veckor",
      "Du äger koden",
    ],
    cta: "Bygg min MVP",
    paket: "MVP",
    popular: true,
    filledCta: true,
  },
  {
    num: "03",
    name: "Skräddarsytt system",
    price: "Offert",
    intro: "För bolag som behöver affärssystem, integrationer eller intern plattform.",
    features: [
      "Anpassad arkitektur",
      "Fortnox/Visma-integration",
      "BankID & rollstyrning",
      "Multi-tenant SaaS",
      "Långsiktig utveckling",
    ],
    cta: "Boka rådgivning",
    paket: "Skraddarsytt",
  },
];

const AuroraPricing = () => {
  const { open } = useContactModal();
  return (
    <section id="paket" className="aurora-section-bg relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="au-eyebrow">PAKET</p>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
              Välj hur snabbt du vill{" "}
              <span style={{ color: "hsl(152 80% 60%)" }}>komma igång.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-2">
            <p className="text-base leading-relaxed text-[hsl(var(--au-cream)/0.7)] md:text-lg">
              Tre tydliga paketnivåer — från snabb prototyp till skräddarsytt
              affärssystem. Inga konstiga tilläggsfakturor, ingen
              abonnemangsfälla. Fast pris, fast leveranstid.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] }}
              className={`au-card-static relative flex flex-col p-7 md:p-8 ${p.popular ? "au-glow-ring lg:-mt-4 lg:mb-4" : ""}`}
              style={
                p.popular
                  ? {
                      background:
                        "linear-gradient(180deg, hsl(152 50% 9% / 0.7), hsl(156 14% 11%))",
                      boxShadow:
                        "0 0 0 1px hsl(152 80% 38% / 0.35), 0 30px 80px -30px hsl(152 80% 30% / 0.7)",
                    }
                  : undefined
              }
            >
              {p.popular && (
                <span
                  className="absolute left-1/2 -top-3 -translate-x-1/2 rounded-full px-3 py-1 font-mono-au text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    background: "linear-gradient(180deg, hsl(152 80% 50%), hsl(152 80% 38%))",
                    color: "hsl(160 24% 6%)",
                    boxShadow: "0 8px 24px -8px hsl(152 80% 50% / 0.7)",
                  }}
                >
                  POPULÄR
                </span>
              )}

              <div className="flex items-baseline justify-between">
                <p className="font-mono-au text-xs tracking-[0.18em] text-[hsl(var(--au-cream)/0.45)]">
                  {p.num}
                </p>
              </div>

              <h3 className="mt-2 font-display text-[28px] leading-tight tracking-[-0.025em]">
                {p.name}
              </h3>

              <p
                className="mt-2 font-display text-[26px] leading-none"
                style={{ color: "hsl(152 80% 60%)" }}
              >
                {p.price}
              </p>

              <p className="mt-3 text-[14.5px] leading-relaxed text-[hsl(var(--au-cream)/0.65)]">
                {p.intro}
              </p>

              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px] text-[hsl(var(--au-cream)/0.85)]">
                    <span
                      className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full"
                      style={{
                        background: "hsl(152 80% 18% / 0.6)",
                        border: "1px solid hsl(152 80% 50% / 0.4)",
                      }}
                    >
                      <Check size={11} color="hsl(152 80% 65%)" strokeWidth={3} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => open(p.paket)}
                className={`mt-7 ${p.filledCta ? "au-btn-coral" : "au-btn-ghost"} w-full justify-center`}
                style={{ width: "100%" }}
              >
                {p.cta}
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AuroraPricing;

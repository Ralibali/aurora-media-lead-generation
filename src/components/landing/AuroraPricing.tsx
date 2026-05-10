import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useContactModal } from "@/components/MvpContactModal";

type Pkg = {
  num: string;
  name: string;
  price: string;
  timeline: string;
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
    name: "Starter MVP",
    price: "49 000 kr",
    timeline: "3 veckor · 1 användartyp",
    intro: "För entreprenören som vill testa en SaaS-idé med en skarp första version.",
    features: [
      "Lovable + Supabase + Stripe-stack",
      "1 användartyp + grundfunktioner",
      "Auth, betalningar och basanalys",
      "Hosting & support i 3 månader",
      "1 revisionsrunda",
    ],
    cta: "Starta Starter MVP",
    paket: "Starter MVP",
  },
  {
    num: "02",
    name: "Standard MVP",
    price: "89 000 kr",
    timeline: "4 veckor · 2–3 användartyper",
    intro: "Bästa valet när produkten behöver roller, betalmodell och en tydlig lanseringssida.",
    features: [
      "Allt i Starter",
      "2–3 användartyper med roller",
      "Stripe-prenumeration eller freemium",
      "SEO-grundsetup + landningssida",
      "Hosting & support i 6 månader",
      "2 revisionsrundor",
    ],
    cta: "Bygg min MVP",
    paket: "Standard MVP",
    popular: true,
    filledCta: true,
  },
  {
    num: "03",
    name: "Premium MVP+",
    price: "149 000 kr",
    timeline: "5 veckor · färdig att marknadsföra",
    intro: "För dig som vill ha en MVP som både fungerar, säljer och är redo för trafik.",
    features: [
      "Allt i Standard",
      "iOS/Android via Capacitor",
      "Programmatisk SEO + bloggsystem",
      "Ad-creatives och lanseringstexter",
      "Hosting & support i 12 månader",
      "3 revisionsrundor",
    ],
    cta: "Planera Premium MVP+",
    paket: "Premium MVP+",
  },
];

const AuroraPricing = () => {
  const { open } = useContactModal();
  return (
    <section id="paket" className="aurora-section-bg relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="au-eyebrow">FASTA MVP-PAKET</p>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
              Tre paket. Fast pris. <span style={{ color: "hsl(152 80% 60%)" }}>Ingen offertdimma.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-2">
            <p className="text-base leading-relaxed text-[hsl(var(--au-cream)/0.7)] md:text-lg">
              Fast pris filtrerar bort fel leads, skyddar byggtid och gör beslutet enklare. Scope större än fem veckor delas upp i faser — aldrig öppen tidshorisont.
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
                  BÄST VAL
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
              <p className="mt-3 font-display text-4xl tracking-[-0.04em] text-foreground">
                {p.price}
              </p>
              <p className="mt-1 font-mono-au text-[11px] uppercase tracking-[0.16em] text-[hsl(152_80%_65%)]">
                {p.timeline}
              </p>

              <p className="mt-4 text-[14.5px] leading-relaxed text-[hsl(var(--au-cream)/0.65)]">
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

        <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center text-[hsl(var(--au-cream)/0.78)]">
          <p className="font-display text-2xl text-foreground">Efter MVP: 4 900 kr/mån</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed">
            Löpande buggfix, småändringar och övervakning. Uppsägning per månad. Kunden får ett företag bakom produkten utan att anställa.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AuroraPricing;

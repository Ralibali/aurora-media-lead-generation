import { motion } from "framer-motion";
import {
  Factory, HeartPulse, Briefcase, Sparkles,
  Cloud, ShoppingCart, Hammer, Tractor,
} from "lucide-react";

const INDUSTRIES = [
  { icon: Factory,     name: "Industri & Logistik" },
  { icon: HeartPulse,  name: "Vård & Hälsa" },
  { icon: Briefcase,   name: "Fintech & Kassa" },
  { icon: Sparkles,    name: "Skönhet & Wellness" },
  { icon: Cloud,       name: "SaaS & Tech" },
  { icon: ShoppingCart,name: "E-handel" },
  { icon: Hammer,      name: "Bygg & Hantverk" },
  { icon: Tractor,     name: "Lantbruk & Hippologi" },
];

const AuroraIndustries = () => (
  <section id="branscher" className="aurora-section-bg relative overflow-hidden py-24 md:py-32">
    <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="au-eyebrow">BRANSCHER</p>
          <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
            Byggt för{" "}
            <span style={{ color: "hsl(152 80% 60%)" }}>verkliga verksamheter.</span>
          </h2>
        </div>
        <div className="lg:col-span-7 lg:pt-2">
          <p className="text-base leading-relaxed text-[hsl(var(--au-cream)/0.7)] md:text-lg">
            Vi har levererat till svenska bolag i åtta olika branscher — från
            transportbolag och massageföretag till barnpsykiatri och e-handel.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {INDUSTRIES.map(({ icon: Icon, name }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="au-card flex items-center gap-3.5 p-4"
          >
            <span className="au-icon" style={{ width: "2.25rem", height: "2.25rem" }}>
              <Icon size={16} strokeWidth={2.2} />
            </span>
            <span className="text-[15px] font-medium text-[hsl(var(--au-cream)/0.9)]">
              {name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AuroraIndustries;

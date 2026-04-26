import { motion } from "framer-motion";
import {
  Layers, Plug, Smartphone, Brush, Globe, LayoutTemplate,
  Megaphone, Search, Sparkles, Compass, BarChart3, LifeBuoy,
} from "lucide-react";

const SERVICES = [
  { icon: Layers,         title: "System",                 desc: "Robusta affärssystem som växer med er — byggda i modern stack." },
  { icon: Plug,           title: "Integrationer",          desc: "Sömlösa kopplingar mellan Fortnox, Visma, Stripe och era befintliga verktyg." },
  { icon: Smartphone,     title: "Appar",                  desc: "iOS, Android och progressiva webbappar som folk faktiskt vill använda." },
  { icon: Brush,          title: "Redesign",               desc: "Modern UI/UX som lyfter varumärket och ökar konvertering." },
  { icon: Globe,          title: "Webb & plattformar",     desc: "Snabba, säkra och skalbara lösningar — från landningssida till SaaS." },
  { icon: LayoutTemplate, title: "Landningssidor",         desc: "Konverterande sidor som driver leads och säljer hela dygnet." },
  { icon: Megaphone,      title: "Digital marknadsföring", desc: "Meta Ads och Google Ads — datadriven annonsering med tydlig ROAS." },
  { icon: Search,         title: "SEO & innehåll",         desc: "Programmatic SEO och innehåll som rankar — och konverterar." },
  { icon: Sparkles,       title: "AI-integration",         desc: "GPT-driven automation, chatbottar och AI-coacher inbyggda i din produkt." },
  { icon: Compass,        title: "Strategi & rådgivning",  desc: "Tekniska audits, MVP-validering och digital strategi för bolag som vill växa rätt." },
  { icon: BarChart3,      title: "CRO & analys",           desc: "Datadriven optimering med GA4, Hotjar och A/B-testning som höjer konvertering." },
  { icon: LifeBuoy,       title: "Underhåll & support",    desc: "Löpande utveckling, säkerhetsuppdateringar och hosting — vi sover så du slipper." },
];

const AuroraServices = () => (
  <section id="tjanster" className="aurora-section-bg relative overflow-hidden py-24 md:py-32">
    <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="au-eyebrow">TJÄNSTER</p>
          <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
            Vi utvecklar mjukvara med{" "}
            <span style={{ color: "hsl(152 80% 60%)" }}>intention.</span>
          </h2>
        </div>
        <div className="lg:col-span-7 lg:pt-2">
          <p className="text-base leading-relaxed text-[hsl(var(--au-cream)/0.7)] md:text-lg">
            Varje system vi bygger är skräddarsytt efter er verksamhet — inte
            tvärtom. Snabb leverans, transparent kommunikation och kod du äger
            från dag ett. Vi kombinerar utveckling, marknadsföring och AI för
            att leverera något som faktiskt rör nålen.
          </p>
        </div>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.05, ease: [0.32, 0.72, 0, 1] }}
            className="au-card p-6"
          >
            <span className="au-icon">
              <Icon size={20} strokeWidth={2} />
            </span>
            <h3 className="mt-5 font-display text-xl tracking-[-0.02em]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--au-cream)/0.65)]">
              {desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AuroraServices;

import { motion } from "framer-motion";
import { Search, PenTool, Code, Users, Rocket } from "lucide-react";

const STEPS = [
  { num: "1", icon: Search,  title: "Vi kartlägger behovet",         desc: "Workshop där vi förstår er verksamhet och målbild." },
  { num: "2", icon: PenTool, title: "Vi designar flödet",            desc: "Wireframes, UX och tekniskt arkitekturförslag." },
  { num: "3", icon: Code,    title: "Vi bygger första versionen",    desc: "MVP byggd i modern stack med daglig avstämning." },
  { num: "4", icon: Users,   title: "Vi testar med riktiga användare", desc: "Iterationer baserat på faktisk användning." },
  { num: "5", icon: Rocket,  title: "Du lanserar och äger koden",    desc: "Full överlämning — kod, dokumentation och support." },
];

const AuroraProcess = () => (
  <section id="process" className="aurora-section-bg relative overflow-hidden py-24 md:py-32">
    <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
      <div className="max-w-3xl">
        <p className="au-eyebrow">PROCESS</p>
        <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.035em]">
          Från idé till lansering{" "}
          <span style={{ color: "hsl(152 80% 60%)" }}>utan kaos.</span>
        </h2>
      </div>

      {/* Desktop horizontal */}
      <div className="relative mt-20 hidden md:block">
        <div className="absolute left-[6%] right-[6%] top-[30px] h-px au-divider-x" />
        <div className="grid grid-cols-5 gap-4">
          {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center text-center"
            >
              <span
                className="grid h-[60px] w-[60px] place-items-center rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(152 60% 14% / 0.9), hsl(152 50% 8%))",
                  border: "1.5px solid hsl(152 80% 50% / 0.5)",
                  color: "hsl(152 80% 65%)",
                  boxShadow: "0 0 28px -8px hsl(152 80% 50% / 0.55)",
                }}
              >
                <Icon size={22} strokeWidth={2} />
              </span>
              <span
                className="mt-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 font-mono-au text-[11px] font-semibold"
                style={{
                  background: "hsl(152 80% 18% / 0.6)",
                  color: "hsl(152 80% 70%)",
                  border: "1px solid hsl(152 80% 50% / 0.35)",
                }}
              >
                {num}
              </span>
              <p className="mt-3 font-mono-au text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--au-cream)/0.45)]">
                Steg {num}
              </p>
              <h3 className="mt-1 max-w-[14ch] text-[15px] font-semibold leading-snug text-[hsl(var(--au-cream))]">
                {title}
              </h3>
              <p className="mt-2 max-w-[18ch] text-[12.5px] leading-relaxed text-[hsl(var(--au-cream)/0.6)]">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile vertical */}
      <div className="relative mt-12 md:hidden">
        <div className="absolute left-[29px] top-4 bottom-4 w-px au-divider-y" />
        <div className="flex flex-col gap-7">
          {STEPS.map(({ num, icon: Icon, title, desc }) => (
            <div key={num} className="relative flex gap-4 pl-0">
              <span
                className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, hsl(152 60% 14% / 0.9), hsl(152 50% 8%))",
                  border: "1.5px solid hsl(152 80% 50% / 0.5)",
                  color: "hsl(152 80% 65%)",
                }}
              >
                <Icon size={20} strokeWidth={2} />
              </span>
              <div>
                <p className="font-mono-au text-[10px] uppercase tracking-[0.18em] text-[hsl(152 80% 65%)]">
                  Steg {num}
                </p>
                <h3 className="mt-1 text-base font-semibold text-[hsl(var(--au-cream))]">
                  {title}
                </h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[hsl(var(--au-cream)/0.65)]">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AuroraProcess;

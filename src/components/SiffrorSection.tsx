import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

const stats = [
  { value: 7, label: "egna SaaS lanserade" },
  { value: 10, suffix: "+", label: "levererade kundprojekt" },
  { value: 0, label: "projekt försenade" },
  { value: 14, label: "dagars genomsnittlig leveranstid" },
  { value: 2, label: "kortaste prototyp (i dagar)" },
];

const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => Math.round(v).toString());
  const [shown, setShown] = useState("0");

  useEffect(() => {
    const unsub = display.on("change", (v) => setShown(v));
    if (inView) {
      const c = animate(count, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
      return () => {
        c.stop();
        unsub();
      };
    }
    return unsub;
  }, [inView, to, count, display]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
};

const SiffrorSection = () => {
  return (
    <section className="border-t border-border py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="label-caps">Siffrorna bakom</p>
          <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]">
            10 år i säkerhetsbranschen. 7 egna SaaS live.
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 md:gap-16 lg:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <p className="font-serif italic text-6xl md:text-7xl text-primary leading-none">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SiffrorSection;

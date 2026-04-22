import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

const stats = [
  {
    n: "01",
    label: "Portfolio",
    value: 7,
    suffix: "",
    body: "egna SaaS-produkter lanserade och live just nu.",
    align: "left" as const,
    size: "huge" as const,
  },
  {
    n: "02",
    label: "Leveranser",
    value: 10,
    suffix: "+",
    body: "kundprojekt levererade på fast pris och utlovad tid.",
    align: "right" as const,
    size: "large" as const,
  },
  {
    n: "03",
    label: "Försening",
    value: 0,
    suffix: "",
    body: "projekt försenade. En enda regel: levererat eller inget arvode.",
    align: "left" as const,
    size: "large" as const,
  },
  {
    n: "04",
    label: "Tempo",
    value: 14,
    suffix: " dagar",
    body: "genomsnittlig leveranstid från första samtal till live.",
    align: "right" as const,
    size: "huge" as const,
  },
];

const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18, mass: 1.2 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  const [shown, setShown] = useState("0");

  useEffect(() => {
    const unsub = display.on("change", (v) => setShown(v));
    if (inView) mv.set(to);
    return unsub;
  }, [inView, to, mv, display]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
};

const SiffrorSection = () => {
  return (
    <section className="relative border-t border-border overflow-hidden py-24 md:py-36">
      {/* Subtle radial backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 100% 50%, hsl(var(--accent)/0.4) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className="max-w-3xl"
        >
          <p className="label-caps">I siffror</p>
          <h2 className="mt-3 font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] tracking-[-0.025em]">
            Tio år i branschen.
            <br />
            <span className="italic text-primary">Sju egna SaaS live.</span>
          </h2>
        </motion.div>

        {/* Editorial split – staggered heights */}
        <div className="mt-20 space-y-20 md:space-y-32">
          {stats.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.9,
                delay: 0.1,
                ease: [0.32, 0.72, 0, 1],
              }}
              className={`grid items-end gap-8 md:grid-cols-12 ${
                s.align === "right" ? "md:text-right" : ""
              }`}
            >
              {/* Number block */}
              <div
                className={`md:col-span-7 ${
                  s.align === "right" ? "md:order-2 md:col-start-6" : ""
                }`}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {s.n} — {s.label}
                </p>
                <p
                  className={`mt-4 font-serif italic text-primary leading-[0.85] tracking-[-0.04em] ${
                    s.size === "huge"
                      ? "text-[clamp(7rem,18vw,16rem)]"
                      : "text-[clamp(5rem,14vw,12rem)]"
                  }`}
                >
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
              </div>

              {/* Body text */}
              <div
                className={`md:col-span-5 md:pb-6 ${
                  s.align === "right" ? "md:order-1 md:text-left" : ""
                }`}
              >
                <p className="text-base leading-relaxed text-foreground/80 md:text-lg">
                  {s.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SiffrorSection;

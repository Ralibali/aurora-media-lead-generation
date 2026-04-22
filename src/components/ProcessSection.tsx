import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    label: "Steg ett · Dag ett",
    title: "Samtal",
    body: "Vi pratar trettio minuter om din idé. Jag ställer frågor — om kunder, marginaler, befintliga system, vad som verkligen ska byggas. Du får ett tydligt fast pris och en leveransdag innan vi lägger på.",
    detail: "Inga säljare. Du pratar med personen som faktiskt skriver koden.",
  },
  {
    n: "02",
    label: "Steg två · Vecka ett",
    title: "Prototyp",
    body: "Jag bygger en interaktiv prototyp du kan klicka dig runt i från dag tre. Inte Figma — en riktig app live på en URL. Du ger feedback, vi justerar tills den känns rätt.",
    detail: "Fem feedbackrundor ingår. Prototyp-koden återanvänds i produktionen.",
  },
  {
    n: "03",
    label: "Steg tre · Vecka två–tre",
    title: "Produktion",
    body: "Jag skriver koden i React, TypeScript och Supabase. Du får uppdateringar två gånger i veckan och kan följa arbetet live på din egen URL — alla deploys är synliga i Git.",
    detail: "Stripe, Fortnox och e-postutskick kopplas innan lansering.",
  },
  {
    n: "04",
    label: "Steg fyra · Vecka fyra",
    title: "Överlämning",
    body: "Jag driftsätter appen och överför all källkod till dig. Vi går igenom hur allt fungerar tillsammans. Du äger hela resultatet — inklusive två till fyra veckors support efter lansering.",
    detail: "Du äger källkoden. Vilken React-utvecklare som helst kan ta över.",
  },
];

const ProcessSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of viewport (topmost visible)
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        const idx = sceneRefs.current.findIndex((el) => el === topMost.target);
        if (idx >= 0) setActiveIdx(idx);
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    sceneRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-t border-border py-24 md:py-36">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className="max-w-2xl"
        >
          <p className="label-caps">Min process</p>
          <h2 className="mt-3 font-serif text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] tracking-[-0.025em]">
            Från samtal till
            <br />
            <span className="italic text-primary">färdig produkt.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Fyra steg. Fyra veckor. Inga överraskningar längs vägen.
          </p>
        </motion.div>

        <div
          ref={containerRef}
          className="mt-20 grid gap-12 md:grid-cols-12 md:gap-16"
        >
          {/* LEFT — sticky number indicator */}
          <div className="hidden md:col-span-4 md:block">
            <div className="sticky top-32">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Steg
              </p>
              <div className="relative mt-4 h-[180px]">
                {steps.map((s, i) => (
                  <motion.p
                    key={s.n}
                    initial={false}
                    animate={{
                      opacity: activeIdx === i ? 1 : 0,
                      y: activeIdx === i ? 0 : activeIdx > i ? -20 : 20,
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    className="absolute inset-0 font-serif italic text-primary leading-none"
                    style={{ fontSize: "clamp(7rem, 14vw, 12rem)" }}
                    aria-hidden={activeIdx !== i}
                  >
                    {s.n}
                  </motion.p>
                ))}
              </div>

              <div className="mt-12 space-y-2">
                {steps.map((s, i) => (
                  <button
                    key={s.n}
                    onClick={() =>
                      sceneRefs.current[i]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      })
                    }
                    className={`flex w-full items-center gap-3 text-left transition-colors ${
                      activeIdx === i
                        ? "text-foreground"
                        : "text-muted-foreground/60 hover:text-foreground/80"
                    }`}
                  >
                    <span
                      className={`h-px transition-all duration-500 ${
                        activeIdx === i
                          ? "w-10 bg-primary"
                          : "w-4 bg-border"
                      }`}
                    />
                    <span className="font-mono text-[11px] uppercase tracking-wider">
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — scenes */}
          <div className="md:col-span-8">
            {steps.map((s, i) => (
              <div
                key={s.n}
                ref={(el) => {
                  sceneRefs.current[i] = el;
                }}
                className="flex min-h-[60vh] flex-col justify-center py-8 first:pt-0 md:min-h-[70vh] md:py-12"
              >
                <motion.div
                  initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  viewport={{ once: false, margin: "-30%" }}
                  transition={{
                    duration: 0.8,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                >
                  {/* Mobile-only big number */}
                  <p className="font-serif italic text-primary text-[5rem] leading-none md:hidden">
                    {s.n}
                  </p>

                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-primary md:mt-0">
                    {s.label}
                  </p>
                  <h3 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                    {s.title}
                  </h3>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/80 md:text-lg">
                    {s.body}
                  </p>
                  <div className="mt-8 max-w-xl border-l-2 border-primary/40 pl-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      Detalj
                    </p>
                    <p className="mt-1 text-sm text-foreground/85">
                      {s.detail}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

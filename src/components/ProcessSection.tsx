import { motion } from "framer-motion";

const steps = [
  {
    label: "Steg 1 · Dag 1",
    title: "Samtal",
    body: "Vi pratar 30 minuter om din idé. Jag ställer frågor. Du får en känsla för om jag är rätt person för jobbet och ett tydligt fast pris.",
  },
  {
    label: "Steg 2 · Vecka 1",
    title: "Prototyp",
    body: "Jag bygger en interaktiv prototyp du kan klicka dig runt i. Inte Figma – en riktig app. Du ger feedback, vi justerar tills den känns rätt.",
  },
  {
    label: "Steg 3 · Vecka 2–3",
    title: "Produktion",
    body: "Jag skriver koden i React och Supabase. Du får uppdateringar två gånger i veckan och kan följa arbetet live på din egen URL.",
  },
  {
    label: "Steg 4 · Vecka 4",
    title: "Överlämning",
    body: "Jag driftsätter appen och överför all källkod till dig. Visar hur allt fungerar. Du äger 100% av resultatet, inklusive 2–4 veckors support.",
  },
];

const ProcessSection = () => {
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
          <p className="label-caps">Min process</p>
          <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]">
            Från samtal till färdig app på fyra veckor.
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative md:border-l md:border-border md:pl-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-primary">
                {s.label}
              </p>
              <h3 className="mt-3 font-serif text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;

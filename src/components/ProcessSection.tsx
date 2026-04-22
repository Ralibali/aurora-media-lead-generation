import { motion } from "framer-motion";

const steps = [
  {
    label: "Steg 1 · Dag 1",
    title: "Första samtalet",
    body: "20–30 minuter via video. Du beskriver problemet. Jag säger direkt om det är byggbart och exakt vad det kostar.",
  },
  {
    label: "Steg 2 · Dag 3",
    title: "Klickbar prototyp",
    body: "Inte Figma. En verklig app med din data som du kan testa. Din feedback formar resten av bygget.",
  },
  {
    label: "Steg 3 · Dag 7–14",
    title: "Produktion",
    body: "Jag bygger ut funktionalitet, integrationer, betalningar, SEO. Uppdateringar två gånger i veckan.",
  },
  {
    label: "Steg 4 · Leveransdagen",
    title: "Du tar över",
    body: "Källkod, dokumentation, 2–4 veckors support ingår. Sedan är produkten helt din.",
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
          <p className="label-caps">Process</p>
          <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]">
            Fyra steg. Inga överraskningar.
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

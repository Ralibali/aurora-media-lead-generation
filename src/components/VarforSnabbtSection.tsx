import { motion } from "framer-motion";

const blocks = [
  {
    h: "AI-assisterad kod.",
    p: "Jag använder AI-verktyg som Lovable, Bolt och Claude för att skriva kod snabbare. Det minskar tiden för repetitiva delar – jag fokuserar på arkitektur, logik och de bitar som kräver mänskligt omdöme.",
  },
  {
    h: "Färdiga komponenter.",
    p: "Jag har byggt ett eget bibliotek med återanvändbara kodblock från mina 7 egna SaaS-projekt. Betalningar, login, dashboards, SEO. Varför uppfinna hjulet varje gång?",
  },
  {
    h: "En person, en process.",
    p: "Du pratar direkt med mig, personen som bygger. Inga projektledare, inga mellanhänder, inga möten som slösar tid. 10 år i säkerhetsbranschen lärde mig att rutiner levererar resultat.",
  },
];

const VarforSnabbtSection = () => {
  return (
    <section className="border-t border-border bg-secondary/30 py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em]"
        >
          Hur jag kan bygga <em className="italic text-primary">så snabbt</em> utan att fuska.
        </motion.h2>

        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
          {blocks.map((b, i) => (
            <motion.div
              key={b.h}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <p className="font-mono text-xs text-primary">0{i + 1}</p>
              <h3 className="mt-4 font-serif text-2xl md:text-3xl leading-tight">{b.h}</h3>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">{b.p}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VarforSnabbtSection;

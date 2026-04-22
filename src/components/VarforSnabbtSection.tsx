import { motion } from "framer-motion";

const blocks = [
  {
    h: "AI är hela byggmetodiken.",
    p: "Jag skriver inte kod rad för rad. Jag orkestrerar Lovable, Bolt, Emergent och Claude som genererar kod, sen finjusterar jag det som behöver mänskligt öga. En traditionell utvecklare bygger en feature per dag. Jag bygger fem till tio.",
  },
  {
    h: "Jag har redan löst problemet.",
    p: "Betalningar, användarauthentisering, dashboards, SEO, integrationer med Fortnox och Stripe. Jag har byggt exakt samma saker i mina sju egna produkter. Det som tar en ny byrå 3 veckor att researcha tar mig 3 dagar.",
  },
  {
    h: "10 år i säkerhetsbranschen.",
    p: "Innan Aurora Media jobbade jag 10 år i säkerhetsbranschen. Det lärde mig tre saker: rutiner levererar resultat, deadlines är löften, och ingenting får glappa när det gäller data.",
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
          Därför levererar jag på <em className="italic text-primary">veckor</em>.
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

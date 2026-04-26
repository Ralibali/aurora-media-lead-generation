import { motion } from "framer-motion";

const products = [
  { name: "Aurora Transport", url: "https://auroratransport.se" },
  { name: "Updro", url: "https://updro.se" },
  { name: "AgilityManager", url: "https://agilitymanager.se" },
  { name: "Hönsgården", url: "https://honsgarden.se" },
  { name: "Odlingsdagboken", url: "https://odlingsdagboken.com" },
  { name: "GoGlamping", url: "https://goglampingsweden.se" },
  { name: "Viriditas", url: "https://viriditasmassage.se" },
];

const TrustBarSection = () => {
  return (
    <section className="border-y border-border bg-secondary/30 py-10">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="label-caps text-center"
        >
          Appar jag byggt
        </motion.p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {products.map((p, i) => (
            <span key={p.url} className="flex items-center">
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="font-serif text-base text-foreground/85 underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {p.name}
              </a>
              {i < products.length - 1 && (
                <span className="ml-8 hidden h-px w-6 bg-border sm:inline-block" />
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBarSection;

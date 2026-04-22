import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

const FinalCTASection = () => {
  const { open } = useContactModal();
  return (
    <section className="border-t border-border bg-secondary/40 py-32 md:py-40">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl font-serif italic text-[clamp(2.5rem,7vw,6rem)] leading-[1.02] tracking-[-0.02em]"
        >
          Har du en idé
          <br />
          du vill förverkliga?
          <br />
          Då pratar vi.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-10 max-w-xl text-lg text-muted-foreground"
        >
          Boka ett 30-minuters samtal med mig. Inget förpliktande, inget säljsnack.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <Button size="lg" onClick={() => open()} className="px-10">
            Boka samtal
          </Button>
          <a
            href="mailto:info@auroramedia.se"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Eller direkt: info@auroramedia.se
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;

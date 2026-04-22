import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useContactModal } from "@/components/ContactModal";
import { useMagnetic } from "@/hooks/useMagnetic";
import Reveal from "@/components/Reveal";

const FinalCTASection = () => {
  const { open } = useContactModal();
  const magnet = useMagnetic({ strength: 0.4, radius: 120 });

  return (
    <section className="border-t border-border bg-secondary/40 py-32 md:py-40">
      <div className="container mx-auto px-6 text-center">
        <Reveal as="div" duration={0.9}>
          <h2 className="mx-auto max-w-4xl font-serif italic text-[clamp(2.5rem,7vw,6rem)] leading-[1.02] tracking-[-0.02em]">
            Har du en idé
            <br />
            du vill förverkliga?
            <br />
            Då pratar vi.
          </h2>
        </Reveal>

        <Reveal delay={0.15} y={16} duration={0.6}>
          <p className="mx-auto mt-10 max-w-xl text-lg text-muted-foreground">
            Boka ett 30-minuters samtal med mig. Inget förpliktande, inget säljsnack.
          </p>
        </Reveal>

        <Reveal delay={0.25} y={16} duration={0.6}>
          <div className="mt-10 flex flex-col items-center gap-5">
            <motion.button
              ref={magnet.ref as React.RefObject<HTMLButtonElement>}
              style={{ x: magnet.x, y: magnet.y, scale: magnet.scale }}
              onClick={() => open()}
              className="group inline-flex items-center gap-2 rounded-full bg-foreground py-2 pl-7 pr-2 text-base text-background transition-[background-color,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_18px_40px_-18px_hsl(var(--primary)/0.55)]"
            >
              <span className="font-medium">Boka samtal</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105">
                <ArrowUpRight weight="bold" size={18} />
              </span>
            </motion.button>
            <a
              href="mailto:info@auroramedia.se"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Eller direkt: info@auroramedia.se
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCTASection;

import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";

const AuroraFinalCTA = () => {
  const { open } = useContactModal();
  return (
    <section id="kontakt" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="relative overflow-hidden rounded-[28px] p-8 md:p-16"
          style={{
            background:
              "linear-gradient(160deg, hsl(152 60% 14%) 0%, hsl(158 40% 9%) 60%, hsl(160 24% 6%) 100%)",
            border: "1px solid hsl(152 80% 50% / 0.25)",
            boxShadow:
              "0 40px 100px -40px hsl(152 80% 30% / 0.7), inset 0 1px 0 hsl(var(--au-cream) / 0.06)",
          }}
        >
          {/* Corner glows */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(152 80% 45% / 0.45) 0%, transparent 60%)",
              filter: "blur(20px)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-32 -bottom-24 h-[480px] w-[480px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(160 70% 38% / 0.4) 0%, transparent 65%)",
              filter: "blur(20px)",
            }}
          />

          <div className="relative">
            <p className="au-eyebrow">NÄSTA STEG</p>
            <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.25rem,5.4vw,4rem)] leading-[1] tracking-[-0.035em]">
              Din idé förtjänar mer än att ligga i{" "}
              <span style={{ color: "hsl(152 80% 60%)" }}>anteckningar.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[hsl(var(--au-cream)/0.78)] md:text-lg">
              Berätta vad du vill bygga. Vi återkommer inom 24 timmar med
              förslag, tidsplan och ungefärlig budget — helt utan kostnad och
              bindning.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button onClick={() => open()} className="au-btn-coral">
                Boka kostnadsfri rådgivning
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
              <a href="mailto:info@auroramedia.se" className="au-btn-ghost">
                <Mail size={16} strokeWidth={2.2} />
                info@auroramedia.se
              </a>
            </div>

            <div
              className="mt-12 grid gap-6 border-t pt-8 sm:grid-cols-3"
              style={{ borderColor: "hsl(var(--au-cream) / 0.1)" }}
            >
              {[
                { label: "MEJL",     value: "info@auroramedia.se" },
                { label: "ORG.NR",   value: "559272-0220" },
                { label: "SVARSTID", value: "Inom 24 timmar" },
              ].map((c) => (
                <div key={c.label}>
                  <p className="font-mono-au text-[10px] uppercase tracking-[0.22em] text-[hsl(152 80% 60%)]">
                    {c.label}
                  </p>
                  <p className="mt-1.5 text-[15px] text-[hsl(var(--au-cream)/0.92)]">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AuroraFinalCTA;

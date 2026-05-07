import { motion } from "framer-motion";
import { ArrowRight, Mail, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { trackCtaClick } from "@/lib/ctaTracking";

interface Props {
  variant?: "wide" | "compact";
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  leadLabel?: string;
}

const AuroraLeadCTA = ({
  variant = "wide",
  eyebrow = "Få svar inom 24 timmar",
  title = "Skicka din förfrågan – vi mejlar tillbaka.",
  description = "Berätta kort vad ni vill bygga eller automatisera. Vi läser, analyserar och återkommer personligen via e-post med ärligt svar och nästa steg – helt utan kostnad.",
  ctaLabel = "Skicka förfrågan",
  leadLabel = "Lead via CTA-ruta",
}: Props) => {
  const { open } = useContactModal();

  if (variant === "compact") {
    return (
      <section className="relative py-16 md:py-20">
        <div className="mx-auto w-full max-w-5xl px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="relative overflow-hidden rounded-[24px] p-7 md:p-10"
            style={{
              background:
                "linear-gradient(135deg, hsl(152 60% 12%) 0%, hsl(158 40% 8%) 100%)",
              border: "1px solid hsl(152 80% 50% / 0.22)",
              boxShadow: "0 30px 80px -40px hsl(152 80% 30% / 0.55)",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, hsl(152 80% 45% / 0.35) 0%, transparent 65%)",
                filter: "blur(20px)",
              }}
            />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="font-mono-au text-[10px] uppercase tracking-[0.22em] text-[hsl(152_80%_60%)]">
                  {eyebrow}
                </p>
                <h3 className="mt-2 font-display text-[clamp(1.4rem,3vw,1.9rem)] leading-tight tracking-[-0.02em]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--au-cream)/0.78)]">
                  {description}
                </p>
              </div>
              <button
                onClick={() => {
                  trackCtaClick("lead_cta_compact", { location: "compact", lead_label: leadLabel });
                  open(leadLabel);
                }}
                className="au-btn-coral whitespace-nowrap self-start md:self-auto"
              >
                {ctaLabel}
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="relative overflow-hidden rounded-[28px] p-8 md:p-14"
          style={{
            background:
              "linear-gradient(160deg, hsl(152 55% 13%) 0%, hsl(158 38% 8%) 60%, hsl(160 24% 6%) 100%)",
            border: "1px solid hsl(152 80% 50% / 0.25)",
            boxShadow:
              "0 40px 100px -40px hsl(152 80% 30% / 0.65), inset 0 1px 0 hsl(var(--au-cream) / 0.06)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(152 80% 45% / 0.4) 0%, transparent 60%)",
              filter: "blur(20px)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-32 -bottom-24 h-[420px] w-[420px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(160 70% 38% / 0.35) 0%, transparent 65%)",
              filter: "blur(20px)",
            }}
          />

          <div className="relative grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <p className="font-mono-au text-[10px] uppercase tracking-[0.22em] text-[hsl(152_80%_60%)] inline-flex items-center gap-2">
                <Sparkles size={12} /> {eyebrow}
              </p>
              <h2 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.05] tracking-[-0.03em]">
                {title}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[hsl(var(--au-cream)/0.8)] md:text-lg">
                {description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => open()}
                  className="au-btn-coral"
                >
                  {ctaLabel}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
                <a href="mailto:info@auroramedia.se" className="au-btn-ghost">
                  <Mail size={16} strokeWidth={2.2} />
                  info@auroramedia.se
                </a>
              </div>
            </div>

            <ul className="grid gap-3 text-sm">
              {[
                { icon: Clock,       label: "Personligt svar via e-post inom 24 timmar (vardagar)" },
                { icon: ShieldCheck, label: "GDPR-säkrat – inget vidare till tredje part, inget säljmöte krävs" },
                { icon: Mail,        label: "Du får konkreta nästa steg – inte ett standardsvar" },
              ].map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-start gap-3 rounded-2xl border p-4"
                  style={{
                    borderColor: "hsl(var(--au-cream) / 0.1)",
                    background: "hsl(var(--au-cream) / 0.025)",
                  }}
                >
                  <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "hsl(152 80% 45% / 0.14)" }}
                  >
                    <Icon size={15} className="text-[hsl(152_80%_62%)]" />
                  </span>
                  <span className="text-[hsl(var(--au-cream)/0.88)] leading-snug">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AuroraLeadCTA;

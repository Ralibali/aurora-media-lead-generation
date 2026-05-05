import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Bot, Rocket, Target, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";

const TIMELINE = [
  { day: "Dag 1", title: "Kostnadsfri rådgivning", desc: "Vi kartlägger affärsmål, system och flaskhalsar." },
  { day: "Dag 2–7", title: "Prototyp & arkitektur", desc: "Du ser en klickbar version av lösningen." },
  { day: "Vecka 2–4", title: "Lansering", desc: "Vi bygger, integrerar och driftsätter." },
];

const TRUST = [
  { icon: Rocket, text: "SaaS, appar och digitala produkter" },
  { icon: Bot, text: "AI, automation och effektivisering" },
  { icon: Target, text: "Byggt för affärsnytta och tillväxt" },
];

const PhoneMockup = () => (
  <div className="relative mx-auto w-[280px] sm:w-[320px]">
    <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.22),transparent_70%)] blur-2xl" aria-hidden />
    <div className="relative rounded-[3rem] border border-border bg-[hsl(var(--bezel-shell))] p-3 shadow-[0_40px_80px_-30px_hsl(var(--primary)/0.45)]">
      <div className="overflow-hidden rounded-[2.4rem] bg-card">
        <div className="flex items-center justify-between border-b border-border/60 bg-secondary/60 px-5 py-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            aurora.app
          </span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-primary/70">
              Dashboard
            </p>
            <p className="mt-1 font-display text-lg font-bold text-foreground">
              Era flöden i realtid
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-secondary/70 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Leads</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">128</p>
              <p className="text-[10px] font-semibold text-primary">+24% v.</p>
            </div>
            <div className="rounded-xl bg-primary p-3 text-primary-foreground">
              <p className="text-[10px] uppercase tracking-wider opacity-80">Sparad tid</p>
              <p className="mt-1 font-display text-2xl font-bold">42 h</p>
              <p className="text-[10px] font-semibold opacity-90">denna vecka</p>
            </div>
          </div>

          <ul className="space-y-2">
            {["Sync Fortnox → CRM", "AI-svar inkommande mail", "Automatisk fakturering"].map((t) => (
              <li key={t} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground">
                <Check size={12} className="text-primary" strokeWidth={3} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const AuroraHero = () => {
  const { open } = useContactModal();

  return (
    <section id="top" className="relative overflow-hidden bg-background pt-[120px]">
      {/* Aurora gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 10%, hsl(var(--primary)/0.18), transparent 60%), radial-gradient(50% 40% at 10% 80%, hsl(var(--forest-glow-soft)/0.20), transparent 60%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-12 lg:pb-32">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            <Sparkles size={12} /> Aurora Media · Linköping
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.6rem)] font-bold leading-[1.02] tracking-tight text-foreground">
            Idén finns.
            <br />
            <span className="italic font-medium text-primary" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 600 }}>
              Vi bygger
            </span>{" "}
            systemet.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Aurora Media bygger SaaS, appar, AI-lösningar och skräddarsydda system för företag som vill växa snabbare,
            effektivisera arbetet och ersätta manuella rutiner med smarta digitala flöden.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => open()}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-[0_18px_40px_-15px_hsl(var(--primary)/0.7)] transition hover:brightness-110"
            >
              Boka kostnadsfri rådgivning
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              to="/ai-automation-foretag"
              className="inline-flex items-center justify-center rounded-full border border-foreground/25 bg-transparent px-7 py-4 text-base font-semibold text-foreground/90 transition hover:border-primary/60 hover:text-foreground"
            >
              AI & effektivisering
            </Link>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {TRUST.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon size={14} strokeWidth={2.4} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* RIGHT — phone + timeline + handwritten */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="relative"
        >
          <PhoneMockup />

          {/* Handwritten note */}
          <div
            className="absolute -left-6 -top-4 hidden rotate-[-4deg] sm:block"
            style={{ fontFamily: "'Caveat', cursive" }}
            aria-hidden
          >
            <div className="relative rounded-2xl border border-primary/30 bg-card/95 px-5 py-3 shadow-[0_18px_40px_-18px_hsl(var(--primary)/0.55)] backdrop-blur">
              <p className="text-2xl leading-tight text-foreground">"Från idé till lansering</p>
              <p className="text-2xl leading-tight text-foreground">på under fyra veckor."</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-primary/80" style={{ fontFamily: "ui-monospace, monospace" }}>
                — Aurora-metoden
              </p>
            </div>
          </div>

          {/* Timeline */}
          <ol className="mt-10 space-y-3">
            {TIMELINE.map((t, i) => (
              <li
                key={t.day}
                className="relative flex gap-4 rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  {i < TIMELINE.length - 1 && (
                    <span className="mt-1 h-full w-px bg-gradient-to-b from-primary/40 to-transparent" />
                  )}
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                    {t.day}
                  </p>
                  <p className="mt-0.5 font-display text-base font-bold text-foreground">{t.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  );
};

export default AuroraHero;

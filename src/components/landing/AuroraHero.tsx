import { motion } from "framer-motion";
import { ArrowRight, Tag, Rocket, Code2, Target, Check } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";

const TRUST = [
  { icon: Tag, text: "Fast pris från 14 900 kr" },
  { icon: Rocket, text: "Leverans på 2–4 veckor" },
  { icon: Code2, text: "Du äger alltid koden" },
  { icon: Target, text: "Byggt för din verksamhet, inte tvärtom" },
];

const TIMELINE = [
  { label: "Idé", status: "Klar", tone: "ok" },
  { label: "Design", status: "Klar", tone: "ok" },
  { label: "Utveckling", status: "Pågår", tone: "wip" },
  { label: "Test", status: "Kommer snart", tone: "soon" },
  { label: "Lansering", status: "Kommer snart", tone: "soon" },
];

const dotColor = (tone: string) =>
  tone === "ok"
    ? "hsl(152 80% 50%)"
    : tone === "wip"
    ? "hsl(38 95% 60%)"
    : "hsl(150 8% 48%)";

const PhoneMockup = () => (
  <div
    className="relative mx-auto"
    style={{ width: 320, maxWidth: "100%", filter: "drop-shadow(0 40px 60px hsl(152 80% 12% / 0.55))" }}
  >
    {/* Phone shell */}
    <div
      className="relative rounded-[44px] p-2.5"
      style={{
        background: "linear-gradient(160deg, hsl(160 18% 14%), hsl(160 24% 6%))",
        border: "1px solid hsl(var(--au-cream) / 0.08)",
        boxShadow: "inset 0 1px 0 hsl(var(--au-cream) / 0.06), 0 0 0 1px hsl(0 0% 0% / 0.4)",
      }}
    >
      <div
        className="overflow-hidden rounded-[36px] p-4"
        style={{
          background:
            "linear-gradient(180deg, hsl(160 22% 7%) 0%, hsl(158 18% 9%) 100%)",
        }}
      >
        {/* App header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span
              className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-display"
              style={{
                background: "linear-gradient(135deg, hsl(152 80% 50%), hsl(160 70% 28%))",
                color: "hsl(160 24% 6%)",
              }}
            >
              A
            </span>
            <span className="text-[13px] font-semibold text-[hsl(var(--au-cream))]">
              Projektöversikt
            </span>
          </div>
          <span className="grid h-6 w-6 place-items-center rounded-md bg-[hsl(var(--au-cream)/0.06)]">
            <span className="block h-[2px] w-3 bg-[hsl(var(--au-cream)/0.6)]" />
          </span>
        </div>

        {/* MVP-status card */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(180deg, hsl(158 16% 11%), hsl(156 14% 9%))",
            border: "1px solid hsl(var(--au-cream) / 0.06)",
          }}
        >
          <div>
            <p className="font-mono-au text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--au-muted))]">
              MVP-status
            </p>
            <p
              className="mt-1 font-display text-[34px] leading-none"
              style={{ color: "hsl(152 80% 60%)" }}
            >
              72%
            </p>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--au-cream)/0.06)]">
            <div
              className="h-full"
              style={{
                width: "72%",
                background:
                  "linear-gradient(90deg, hsl(152 80% 38%), hsl(152 80% 60%))",
                boxShadow: "0 0 16px hsl(152 80% 50% / 0.6)",
              }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div
          className="mt-3 rounded-2xl p-3"
          style={{
            background: "linear-gradient(180deg, hsl(158 16% 11%), hsl(156 14% 9%))",
            border: "1px solid hsl(var(--au-cream) / 0.06)",
          }}
        >
          <p className="px-1 pb-2 font-mono-au text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--au-muted))]">
            Tidslinje
          </p>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[hsl(var(--au-cream)/0.08)]" />
            {TIMELINE.map((t) => (
              <div key={t.label} className="relative flex items-center justify-between py-1.5 pl-6">
                <span
                  className="absolute left-0 top-1/2 h-[15px] w-[15px] -translate-y-1/2 rounded-full"
                  style={{
                    background: "hsl(160 24% 7%)",
                    border: `2px solid ${dotColor(t.tone)}`,
                    boxShadow: t.tone === "ok" || t.tone === "wip"
                      ? `0 0 8px ${dotColor(t.tone)}`
                      : undefined,
                  }}
                />
                <span className="text-[12px] text-[hsl(var(--au-cream))]">{t.label}</span>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: dotColor(t.tone) }}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Two cards */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div
            className="rounded-xl p-3"
            style={{
              background: "hsl(158 16% 11%)",
              border: "1px solid hsl(var(--au-cream) / 0.06)",
            }}
          >
            <p className="font-mono-au text-[9px] uppercase tracking-[0.16em] text-[hsl(var(--au-muted))]">
              Budget
            </p>
            <p className="mt-1 text-[10px] text-[hsl(var(--au-cream)/0.6)]">från</p>
            <p className="font-display text-[15px]" style={{ color: "hsl(152 80% 60%)" }}>
              14 900 kr
            </p>
          </div>
          <div
            className="rounded-xl p-3"
            style={{
              background: "hsl(158 16% 11%)",
              border: "1px solid hsl(var(--au-cream) / 0.06)",
            }}
          >
            <p className="font-mono-au text-[9px] uppercase tracking-[0.16em] text-[hsl(var(--au-muted))]">
              Status
            </p>
            <p className="mt-1 font-display text-[15px]" style={{ color: "hsl(38 95% 60%)" }}>
              Pågår
            </p>
            <p className="text-[10px] text-[hsl(var(--au-cream)/0.55)]">
              Leverans om 12 dagar
            </p>
          </div>
        </div>

        {/* Coming card */}
        <div
          className="mt-3 rounded-xl p-3"
          style={{
            background: "linear-gradient(135deg, hsl(152 50% 12% / 0.7), hsl(158 16% 11%))",
            border: "1px solid hsl(152 80% 38% / 0.4)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono-au text-[9px] uppercase tracking-[0.16em] text-[hsl(152 80% 60%)]">
                Kommande leverans
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-[hsl(var(--au-cream))]">
                v1.0 MVP
              </p>
            </div>
            <span
              className="grid h-7 w-7 place-items-center rounded-full"
              style={{
                background: "hsl(152 80% 18% / 0.6)",
                border: "1px solid hsl(152 80% 50% / 0.4)",
              }}
            >
              <Check size={13} color="hsl(152 80% 65%)" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HandwrittenNote = () => (
  <div className="hidden lg:block absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full pr-6 text-right">
    <p className="font-hand text-[34px] leading-tight text-[hsl(var(--au-cream)/0.85)]">
      Din idé.
      <br />
      Vår teknik.
      <br />
      <span className="au-handline" style={{ color: "hsl(152 80% 65%)" }}>
        Din framgång.
      </span>
    </p>
    {/* Hand-drawn arrow pointing right toward the phone */}
    <svg
      width="120"
      height="60"
      viewBox="0 0 120 60"
      fill="none"
      className="ml-auto mt-3"
      style={{ color: "hsl(var(--au-cream) / 0.6)" }}
    >
      <path
        d="M5 30 C 35 5, 75 12, 110 32"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M110 32 L 100 26 M110 32 L 102 38"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const AuroraHero = () => {
  const { open } = useContactModal();

  return (
    <section id="top" className="aurora-bg relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-12 lg:gap-10">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className="lg:col-span-7"
        >
          <p className="au-eyebrow">AURORA MEDIA · AI-DRIVEN MJUKVARA</p>

          <h1 className="mt-6 font-display text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.9] tracking-[-0.04em]">
            <span className="block">IDÉN FINNS.</span>
            <span className="block">
              PRODUKTEN{" "}
              <span className="au-highlight">SAKNAS.</span>
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-[hsl(var(--au-cream)/0.7)] md:text-lg">
            Vi bygger skräddarsydda system, appar och plattformar som gör din
            verksamhet snabbare, smartare och mer lönsam — med fast pris, snabb
            leverans och kod du äger från dag ett.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={() => open()} className="au-btn-coral">
              Boka kostnadsfri rådgivning
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            <a href="#projekt" onClick={(e) => { e.preventDefault(); document.querySelector("#projekt")?.scrollIntoView({ behavior: "smooth" }); }} className="au-btn-ghost">
              Se tidigare projekt
            </a>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TRUST.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-[hsl(var(--au-cream)/0.78)]">
                <span className="grid h-7 w-7 place-items-center rounded-md"
                  style={{
                    background: "hsl(152 80% 18% / 0.45)",
                    border: "1px solid hsl(152 80% 50% / 0.3)",
                    color: "hsl(152 80% 65%)",
                  }}
                >
                  <Icon size={14} strokeWidth={2.2} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right: phone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="relative lg:col-span-5"
        >
          <HandwrittenNote />
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  );
};

export default AuroraHero;

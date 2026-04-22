import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowRight, Check } from "@phosphor-icons/react";
import { useContactModal } from "@/components/ContactModal";
import { useMagnetic } from "@/hooks/useMagnetic";

type Mode = "terminal" | "code" | "browser";

const terminalLines = [
  { text: "> npx create-aurora-app", tone: "prompt" as const },
  { text: "  ✓ scaffolding workspace", tone: "ok" as const },
  { text: "  ✓ configuring database", tone: "ok" as const },
  { text: "  ✓ deploying to production", tone: "ok" as const },
  { text: "> ready in 22 days", tone: "prompt" as const },
];

const codeSnippet = `export const launch = async (idea: Idea) => {
  const app = await aurora.build(idea);
  await app.deploy({ region: 'eu-north' });
  return app.url; // → live in 4 weeks
};`;

const browserSites = [
  { url: "auroratransport.se", label: "Dispatching SaaS · live" },
  { url: "honsgarden.se", label: "Hönsdagbok · 12k användare" },
  { url: "agilitymanager.se", label: "Träningsappen · live" },
];

const HeroSection = () => {
  const { open } = useContactModal();
  const [mode, setMode] = useState<Mode>("terminal");
  const [terminalIdx, setTerminalIdx] = useState(0);
  const [typedCode, setTypedCode] = useState("");
  const [browserIdx, setBrowserIdx] = useState(0);
  const primaryMagnet = useMagnetic({ strength: 0.35, radius: 100 });
  const secondaryMagnet = useMagnetic({ strength: 0.25, radius: 80 });

  // Cycle modes
  useEffect(() => {
    const cycle = setInterval(() => {
      setMode((m) =>
        m === "terminal" ? "code" : m === "code" ? "browser" : "terminal"
      );
    }, 6000);
    return () => clearInterval(cycle);
  }, []);

  // Terminal animation
  useEffect(() => {
    if (mode !== "terminal") return;
    setTerminalIdx(0);
    const t = setInterval(() => {
      setTerminalIdx((i) => {
        if (i >= terminalLines.length) {
          clearInterval(t);
          return i;
        }
        return i + 1;
      });
    }, 700);
    return () => clearInterval(t);
  }, [mode]);

  // Code typewriter
  useEffect(() => {
    if (mode !== "code") return;
    setTypedCode("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTypedCode(codeSnippet.slice(0, i));
      if (i >= codeSnippet.length) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [mode]);

  // Browser cycle
  useEffect(() => {
    if (mode !== "browser") return;
    setBrowserIdx(0);
    const t = setInterval(() => {
      setBrowserIdx((i) => (i + 1) % browserSites.length);
    }, 1800);
    return () => clearInterval(t);
  }, [mode]);

  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Subtle radial backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--accent)/0.5) 0%, transparent 60%)",
        }}
      />

      <div className="container mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
            className="lg:col-span-7"
          >
            <p className="label-caps">Aurora Media · Linköping</p>

            <h1 className="mt-6 font-serif text-[clamp(2.75rem,8vw,6.75rem)] leading-[0.96] tracking-[-0.025em]">
              <span className="block">Från idé till</span>
              <span className="block italic text-primary">
                lanserad produkt.
              </span>
              <span className="mt-2 block text-foreground/55">
                På fyra veckor.
              </span>
            </h1>

            <p className="mt-9 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Fast pris från 14 900 kr. Du äger alltid källkoden. Sju egna
              SaaS-produkter live — jag bygger din näst.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.button
                ref={primaryMagnet.ref as React.RefObject<HTMLButtonElement>}
                style={{ x: primaryMagnet.x, y: primaryMagnet.y, scale: primaryMagnet.scale }}
                onClick={() => open()}
                className="group btn-pill self-start"
              >
                <span className="text-sm font-medium">Starta projekt</span>
                <span className="btn-pill-icon">
                  <ArrowUpRight weight="bold" size={16} />
                </span>
              </motion.button>

              <motion.button
                ref={secondaryMagnet.ref as React.RefObject<HTMLButtonElement>}
                style={{ x: secondaryMagnet.x, y: secondaryMagnet.y, scale: secondaryMagnet.scale }}
                onClick={() =>
                  document
                    .getElementById("portfolj")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="group btn-pill-ghost self-start"
              >
                <span className="text-sm font-medium">Se mitt arbete</span>
                <span className="btn-pill-ghost-icon">
                  <ArrowRight weight="bold" size={16} />
                </span>
              </motion.button>
            </div>

            <p className="mt-8 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-[hsl(154_44%_45%)]" />
              Bokar projekt med start{" "}
              {new Date(Date.now() + 7 * 86400000).toLocaleDateString("sv-SE", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </motion.div>

          {/* Right: Multi-mode preview */}
          <motion.div
            initial={{ opacity: 0, x: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="relative lg:col-span-5"
          >
            {/* Mode tabs */}
            <div className="mb-3 flex items-center gap-1 px-1">
              {(["terminal", "code", "browser"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    mode === m
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Bezel container */}
            <div className="bezel-shell">
              <div className="bezel-core overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                  <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                    {mode === "browser"
                      ? browserSites[browserIdx].url
                      : "aurora-media — " + mode}
                  </span>
                </div>

                {/* Crossfade content */}
                <div className="relative min-h-[280px]">
                  <AnimatePresence mode="wait">
                    {mode === "terminal" && (
                      <motion.pre
                        key="terminal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="px-5 py-5 font-mono text-[12.5px] leading-7"
                      >
                        {terminalLines.slice(0, terminalIdx).map((l, i) => (
                          <div
                            key={i}
                            className={
                              l.tone === "ok"
                                ? "text-[hsl(154_44%_38%)]"
                                : "text-foreground"
                            }
                          >
                            {l.text}
                            {i === terminalIdx - 1 &&
                              terminalIdx < terminalLines.length && (
                                <span className="terminal-cursor" />
                              )}
                          </div>
                        ))}
                      </motion.pre>
                    )}

                    {mode === "code" && (
                      <motion.pre
                        key="code"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="px-5 py-5 font-mono text-[12.5px] leading-7 text-foreground/85"
                      >
                        <code>{typedCode}</code>
                        {typedCode.length < codeSnippet.length && (
                          <span className="terminal-cursor" />
                        )}
                      </motion.pre>
                    )}

                    {mode === "browser" && (
                      <motion.div
                        key="browser"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center justify-center gap-4 px-5 py-10"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={browserIdx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.45 }}
                            className="text-center"
                          >
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(154_44%_45%)]/15 text-[hsl(154_44%_35%)]">
                              <Check weight="bold" size={20} />
                            </div>
                            <p className="mt-4 font-serif text-2xl">
                              {browserSites[browserIdx].url}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {browserSites[browserIdx].label}
                            </p>
                          </motion.div>
                        </AnimatePresence>
                        <div className="flex gap-1.5">
                          {browserSites.map((_, i) => (
                            <span
                              key={i}
                              className={`h-1 rounded-full transition-all ${
                                i === browserIdx
                                  ? "w-6 bg-foreground"
                                  : "w-1 bg-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Floating decoration: top-right "Levererad" badge */}
            <motion.div
              initial={{ opacity: 0, rotate: -3, y: -10 }}
              animate={{ opacity: 1, rotate: -3, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.7,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="pointer-events-none absolute -right-3 -top-6 hidden md:block"
            >
              <div className="bezel-shell shadow-lg">
                <div className="bezel-core flex items-center gap-2 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(154_44%_45%)]/15 text-[hsl(154_44%_35%)]">
                    <Check weight="bold" size={12} />
                  </span>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Levererad
                    </p>
                    <p className="font-serif text-sm leading-tight">
                      Dag 14
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating decoration: bottom-left price badge */}
            <motion.div
              initial={{ opacity: 0, rotate: 2, y: 10 }}
              animate={{ opacity: 1, rotate: 2, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.9,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="pointer-events-none absolute -bottom-5 -left-4 hidden md:block"
            >
              <div className="bezel-shell shadow-lg">
                <div className="bezel-core px-4 py-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    Från
                  </p>
                  <p className="font-serif text-lg leading-none">
                    14 900 kr
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

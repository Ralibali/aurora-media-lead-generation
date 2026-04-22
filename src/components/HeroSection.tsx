import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

const deployments = [
  { site: "auroratransport.se", days: 14 },
  { site: "updro.se", days: 21 },
  { site: "agilitymanager.se", days: 18 },
  { site: "honsgarden.se", days: 10 },
  { site: "goglampingsweden.se", days: 9 },
];

const HeroSection = () => {
  const { open } = useContactModal();
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setShown([]);
    setReady(false);
    const lines = [
      `> building ${deployments[idx].site}`,
      `  ✓ day ${deployments[idx].days}`,
    ];
    let i = 0;
    const t = setInterval(() => {
      if (i < lines.length) {
        const line = lines[i];
        if (line) setShown((p) => [...p, line]);
        i++;
      } else {
        clearInterval(t);
        setReady(true);
        setTimeout(() => setIdx((v) => (v + 1) % deployments.length), 1800);
      }
    }, 700);
    return () => clearInterval(t);
  }, [idx]);

  const scrollToPortfolio = () => {
    document.getElementById("portfolj")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <p className="label-caps">Aurora Media AB · Linköping</p>

            <h1 className="mt-6 font-serif leading-[1.02] tracking-[-0.025em] text-[clamp(3rem,8vw,7rem)]">
              Jag bygger din app.
              <br />
              <em className="italic text-primary">Från idé till lansering på 4 veckor.</em>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Fast pris från 14 900 kr. Du äger alltid källkoden.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={scrollToPortfolio}>
                Visa mina paket
              </Button>
              <Button size="lg" variant="outline" onClick={() => open()}>
                Boka ett möte
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              10 år i säkerhetsbranschen, nu med 7 egna SaaS-projekt live.
            </p>
          </motion.div>

          {/* Right: Terminal (desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:col-span-5 lg:block"
          >
            <div className="rounded-xl border border-border bg-[#0d100e] text-[#cfd8d2] shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="ml-3 font-mono text-[11px] text-white/40">aurora-media — bash</span>
              </div>
              <pre className="px-5 py-5 font-mono text-[13px] leading-7 min-h-[220px]">
                {shown.filter(Boolean).map((l, i) => (
                  <div
                    key={i}
                    className={l.startsWith(">") ? "text-[#ededea]" : "text-[#7fd3a8]"}
                  >
                    {l}
                    {i === shown.length - 1 && !ready && <span className="terminal-cursor" />}
                  </div>
                ))}
                {ready && (
                  <div className="mt-2 text-white/40">{">"} ready to build yours.</div>
                )}
              </pre>
            </div>
          </motion.div>
        </div>

        {/* Mobile terminal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 rounded-xl border border-border bg-[#0d100e] text-[#cfd8d2] shadow-lg lg:hidden"
        >
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="ml-3 font-mono text-[10px] text-white/40">aurora-media — bash</span>
          </div>
          <pre className="px-4 py-4 font-mono text-[12px] leading-6 min-h-[140px]">
            {shown.filter(Boolean).map((l, i) => (
              <div key={i} className={l.startsWith(">") ? "text-[#ededea]" : "text-[#7fd3a8]"}>
                {l}
                {i === shown.length - 1 && !ready && <span className="terminal-cursor" />}
              </div>
            ))}
          </pre>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";

const deployments = [
  "aurora-transport.se",
  "updro.se",
  "agilitymanager.se",
  "honsgarden.se",
];

const lines = (site: string) => [
  "$ lovable build",
  "→ Analyzing requirements…",
  "→ Generating components…",
  "→ Deploying to production…",
  `→ ${site} is live · day 14`,
];

const HeroSection = () => {
  const { open } = useContactModal();
  const [siteIdx, setSiteIdx] = useState(0);
  const [shown, setShown] = useState<string[]>([]);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const current = lines(deployments[siteIdx]);
    let lineIdx = 0;
    setShown([]);
    setTyping(true);
    const interval = setInterval(() => {
      if (lineIdx < current.length) {
        const line = current[lineIdx];
        setShown((prev) => [...prev, line]);
        lineIdx++;
      } else {
        clearInterval(interval);
        setTyping(false);
        setTimeout(() => {
          setSiteIdx((i) => (i + 1) % deployments.length);
        }, 2200);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [siteIdx]);

  const scrollToPortfolio = () => {
    document.getElementById("portfolj")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="label-caps !tracking-[0.14em] !text-[11px]">
              SaaS-byggare · Linköping · Levererar på veckor
            </span>
          </div>

          <h1 className="mt-8 font-serif text-5xl leading-[1.05] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Jag bygger SaaS med AI.
            <br />
            <em className="italic text-primary">Veckor, inte månader.</em>
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Prototyper från 14 900 kr. Fullt betal-SaaS från 69 000 kr.
            Fast pris. Inga dev-timmar. Inga löften jag inte kan hålla.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={scrollToPortfolio}>
              Se vad jag byggt
            </Button>
            <Button size="lg" variant="outline" onClick={() => open()}>
              Starta ett projekt
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            7 egna SaaS live · 10+ levererade kundprojekt · Baserad i Linköping
          </p>

          {/* Terminal mockup */}
          <div className="mt-14 max-w-2xl rounded-lg border border-border bg-[#0f1411] text-[#cfd8d2] shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-[#7a857f]">~/aurora-media — bash</span>
            </div>
            <pre className="px-5 py-4 font-mono text-[13px] leading-6 min-h-[180px]">
              {shown.filter(Boolean).map((l, i) => (
                <div key={i} className={l.startsWith("$") ? "text-[#ededea]" : "text-[#7fd3a8]"}>
                  {l}
                  {i === shown.length - 1 && typing ? <span className="terminal-cursor" /> : null}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

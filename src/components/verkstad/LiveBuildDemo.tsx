import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";

type Branch = {
  key: string;
  label: string;
  match: string[];
  name: string;
  pkg: { name: string; price: string; time: string };
  modules: string[];
};

const BRANCHES: Branch[] = [
  {
    key: "transport",
    label: "Transport & logistik",
    match: ["åkeri", "transport", "lastbil", "logistik", "frakt", "dispatch", "chaufför", "bud"],
    name: "FleetFlow",
    pkg: { name: "Aurora Scale", price: "från 69 000 kr", time: "6–10 veckor" },
    modules: ["Körorder & dispatch", "Chaufförsvy i mobilen", "Fortnox-fakturering", "Spårning & ETA", "Adminpanel"],
  },
  {
    key: "ehandel",
    label: "E-handel",
    match: ["e-handel", "webshop", "butik", "shop", "sälja", "produkter", "kläder", "webbshop"],
    name: "ButikOS",
    pkg: { name: "Aurora MVP", price: "från 34 900 kr", time: "3–5 veckor" },
    modules: ["Produktkatalog", "Kassa med Stripe/Klarna", "Order- & lagerflöde", "Kundkonto", "AI-produktbeskrivningar"],
  },
  {
    key: "bokning",
    label: "Bokning & tjänster",
    match: ["boka", "bokning", "städ", "glamping", "tält", "frisör", "massage", "hotell", "camping", "biljett"],
    name: "BokaFlow",
    pkg: { name: "Aurora MVP", price: "från 34 900 kr", time: "3–5 veckor" },
    modules: ["Bokningskalender", "Onlinebetalning", "Automatiska gästmail & SMS", "Schema & tilldelning", "Adminpanel"],
  },
  {
    key: "bygg",
    label: "Bygg & hantverk",
    match: ["bygg", "hantverk", "snickar", "vvs", "el", "målare", "renovering", "entreprenad"],
    name: "OffertOS",
    pkg: { name: "Aurora MVP", price: "från 34 900 kr", time: "3–5 veckor" },
    modules: ["Offertgenerator", "Projektschema", "ROT/RUT-underlag", "Fotodokumentation", "Fakturering"],
  },
  {
    key: "restaurang",
    label: "Restaurang & café",
    match: ["restaurang", "café", "kaffe", "mat", "pizzeria", "foodtruck", "bar"],
    name: "BordOS",
    pkg: { name: "Aurora MVP", price: "från 34 900 kr", time: "3–5 veckor" },
    modules: ["Meny & beställning", "Bordsbokning", "Betalning", "Dagens-schema", "Försäljningsrapporter"],
  },
  {
    key: "ekonomi",
    label: "Ekonomi & administration",
    match: ["ekonomi", "redovisning", "bokföring", "faktura", "löner", "administration", "kvitton"],
    name: "KvittoFlow",
    pkg: { name: "Aurora Scale", price: "från 69 000 kr", time: "6–10 veckor" },
    modules: ["Kundportal", "Dokumentinsamling", "Fortnox-integration", "Påminnelseflöden", "Rapporter & export"],
  },
];

const DEFAULT_BRANCH: Branch = {
  key: "saas",
  label: "SaaS / digital produkt",
  match: [],
  name: "FlowOS",
  pkg: { name: "Aurora MVP", price: "från 34 900 kr", time: "3–5 veckor" },
  modules: ["Inloggning & roller", "Databas (Supabase)", "Betalning (Stripe)", "AI-automation", "Adminpanel"],
};

const EXAMPLES = [
  "Åkeri med 12 bilar som vill slippa Excel",
  "Städbolag som vill ta bokningar online",
  "Webshop för handgjorda snickerier",
];

const detectBranch = (idea: string): Branch => {
  const text = idea.toLowerCase();
  let best: Branch = DEFAULT_BRANCH;
  let bestScore = 0;
  for (const b of BRANCHES) {
    const score = b.match.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      best = b;
      bestScore = score;
    }
  }
  return best;
};

type Phase = "idle" | "typing" | "modules" | "wireframe" | "done";

const LiveBuildDemo = () => {
  const { open } = useContactModal();
  const [idea, setIdea] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [branch, setBranch] = useState<Branch>(DEFAULT_BRANCH);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [visibleModules, setVisibleModules] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const buildLines = (b: Branch) => [
    `> analyserar: "${idea.trim().slice(0, 64)}"`,
    `> bransch identifierad: ${b.label.toLowerCase()}`,
    "> väljer moduler från aurora-stacken …",
    "> skissar informationsarkitektur …",
    "> kalkylerar scope och pris …",
  ];

  const start = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!idea.trim() || phase === "typing" || phase === "modules" || phase === "wireframe") return;
    clearTimers();
    const b = detectBranch(idea);
    setBranch(b);
    setTypedLines([]);
    setVisibleModules(0);
    trackEvent("home_demo_submit", { branch: b.key });

    if (reduced) {
      setTypedLines(buildLines(b));
      setVisibleModules(b.modules.length);
      setPhase("done");
      return;
    }

    setPhase("typing");
    const lines = buildLines(b);
    lines.forEach((_, i) => {
      later(() => setTypedLines((prev) => [...prev, lines[i]]), 500 * (i + 1));
    });
    const afterTyping = 500 * lines.length + 300;
    later(() => setPhase("modules"), afterTyping);
    b.modules.forEach((_, i) => {
      later(() => setVisibleModules(i + 1), afterTyping + 250 * (i + 1));
    });
    later(() => setPhase("wireframe"), afterTyping + 250 * b.modules.length + 500);
    later(() => setPhase("done"), afterTyping + 250 * b.modules.length + 1800);
  };

  const reset = () => {
    clearTimers();
    setPhase("idle");
    setTypedLines([]);
    setVisibleModules(0);
  };

  const building = phase === "typing" || phase === "modules" || phase === "wireframe";

  return (
    <div className="vk-demo">
      <div className="vk-demo-grid">
        {/* Vänster: input + build-logg */}
        <div>
          <form onSubmit={start} className="vk-demo-form">
            <label htmlFor="demo-idea" className="vk-mono" style={{ display: "block", marginBottom: 10 }}>
              Din idé eller ditt företag
            </label>
            <textarea
              id="demo-idea"
              className="vk-demo-input"
              rows={3}
              placeholder="t.ex. Åkeri med 12 bilar som drunknar i körorder och Excel …"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              maxLength={200}
              disabled={building}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button type="submit" className="vk-btn vk-btn-primary vk-magnetic" disabled={building || !idea.trim()}>
                {building ? "Bygger …" : <>Bygg min idé <Sparkles size={15} /></>}
              </button>
              {phase !== "idle" && !building && (
                <button type="button" className="vk-btn vk-btn-ghost" onClick={reset}>
                  <RotateCcw size={14} /> Ny idé
                </button>
              )}
            </div>
          </form>

          {phase === "idle" && (
            <div className="vk-presets" style={{ marginTop: 18 }}>
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" className="vk-preset" onClick={() => setIdea(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          )}

          {phase !== "idle" && (
            <div className="vk-demo-log" aria-live="polite">
              {typedLines.map((line, i) => (
                <div key={i} className="vk-demo-line" style={{ animationDelay: "0ms" }}>
                  {line}
                </div>
              ))}
              {building && <span className="vk-demo-caret">▌</span>}

              {visibleModules > 0 && (
                <div className="vk-demo-modules">
                  {branch.modules.slice(0, visibleModules).map((m) => (
                    <span key={m} className="vk-demo-chip">✓ {m}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Höger: wireframe / resultat */}
        <div className="vk-demo-stage">
          {phase === "idle" && (
            <div className="vk-demo-empty">
              <span className="vk-mono">DIN PRODUKT</span>
              <p>Skriv din idé till vänster – på 20 sekunder skissar vi produkten, modulerna och priset. Direkt i webbläsaren.</p>
            </div>
          )}

          {phase !== "idle" && (
            <>
              <div className={`vk-demo-frame ${phase === "wireframe" || phase === "done" ? "live" : ""}`}>
                <div className="vk-demo-framebar">
                  <i /><i /><i />
                  <span>{branch.name.toLowerCase()}.se</span>
                </div>
                <div className="vk-demo-body">
                  <div className="vk-wf vk-wf-hero" style={{ animationDelay: "0.05s" }} />
                  <div className="vk-wf-row">
                    <div className="vk-wf vk-wf-side" style={{ animationDelay: "0.25s" }} />
                    <div style={{ flex: 1, display: "grid", gap: 8 }}>
                      <div className="vk-wf vk-wf-line" style={{ animationDelay: "0.4s" }} />
                      <div className="vk-wf vk-wf-line w70" style={{ animationDelay: "0.55s" }} />
                      <div className="vk-wf vk-wf-line w50" style={{ animationDelay: "0.7s" }} />
                    </div>
                  </div>
                  <div className="vk-wf-row">
                    <div className="vk-wf vk-wf-card" style={{ animationDelay: "0.85s" }} />
                    <div className="vk-wf vk-wf-card" style={{ animationDelay: "1s" }} />
                    <div className="vk-wf vk-wf-card" style={{ animationDelay: "1.15s" }} />
                  </div>
                </div>
              </div>

              {phase === "done" && (
                <div className="vk-demo-estimate">
                  <div className="vk-mono" style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <span>{branch.name}</span>
                    <span style={{ color: "var(--gran)" }}>{branch.label}</span>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 22, color: "var(--granbark)" }}>{branch.pkg.price}</strong>
                    <span className="vk-mono">{branch.pkg.name} · {branch.pkg.time}</span>
                  </div>
                  <button
                    type="button"
                    className="vk-btn vk-btn-primary vk-magnetic"
                    style={{ marginTop: 16, width: "100%", justifyContent: "center" }}
                    onClick={() => {
                      trackEvent("home_demo_cta", { branch: branch.key });
                      open({
                        paket: branch.pkg.name.replace("Aurora ", ""),
                        internalNote: `Live-demo: "${idea.trim().slice(0, 120)}" → ${branch.name} (${branch.label}). Moduler: ${branch.modules.join(", ")}.`,
                      });
                    }}
                  >
                    Bygg den här på riktigt <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <p className="vk-mono" style={{ marginTop: 18, opacity: 0.7 }}>
        Simulerad skiss på 20 sekunder – på riktigt tar prototypen 3–5 dagar.
      </p>
    </div>
  );
};

export default LiveBuildDemo;

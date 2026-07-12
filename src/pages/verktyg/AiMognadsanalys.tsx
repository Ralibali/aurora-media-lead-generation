import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { ToolShell, toolByslug, CopyButton, Metric, Bar } from "./VerktygShell";

type Q = { id: string; text: string; topic: string };

const QUESTIONS: Q[] = [
  { id: "q1", topic: "Strategi", text: "Har ni identifierat konkreta processer där AI skulle spara tid?" },
  { id: "q2", topic: "Styrning", text: "Har ni en policy för hur medarbetare får använda AI-verktyg?" },
  { id: "q3", topic: "Data", text: "Har ni koll på var era data ligger och vem som har åtkomst?" },
  { id: "q4", topic: "Kultur", text: "Använder någon i teamet AI-verktyg regelbundet i arbetet?" },
  { id: "q5", topic: "Erfarenhet", text: "Har ni testat att bygga eller köpa in någon AI-lösning?" },
  { id: "q6", topic: "Ledning", text: "Har ledningen en tydlig ambition eller riktning för AI?" },
  { id: "q7", topic: "Resurser", text: "Har ni tid och budget avsatt för AI/automation i år?" },
  { id: "q8", topic: "Ägarskap", text: "Har ni någon som äger AI-frågorna internt?" },
  { id: "q9", topic: "Teknik", text: "Är era system integrerade så data kan flöda mellan dem?" },
  { id: "q10", topic: "Mätning", text: "Mäter ni utfall (tid, kvalitet, pengar) när ni testar nytt?" },
];

const CHOICES = [
  { label: "Nej", val: 0 },
  { label: "Delvis", val: 1 },
  { label: "Ja", val: 2 },
];

const LEVELS = [
  { min: 0, level: 1, name: "Nyfiken", desc: "Ni är i tidig fas. Fokusera på att prova små, riskfria AI-verktyg." },
  { min: 6, level: 2, name: "Utforskande", desc: "Ni har testat lite. Nästa steg är att välja 1–2 användningsområden och sätta ägarskap." },
  { min: 10, level: 3, name: "Strukturerad", desc: "Ni har grunden. Bygg en tydlig färdplan och första interna AI-verktyg." },
  { min: 14, level: 4, name: "Skalande", desc: "Ni har flera fungerande lösningar. Standardisera, integrera och mät." },
  { min: 18, level: 5, name: "AI-driven", desc: "AI är en del av verksamheten. Fokus på styrning, säkerhet och nya affärsmodeller." },
];

const PLAN_30D: Record<number, { vecka: string; punkt: string }[]> = {
  1: [
    { vecka: "Vecka 1", punkt: "Kör 30-min demo av ChatGPT/Claude med teamet." },
    { vecka: "Vecka 2", punkt: "Lista tre mest tidskrävande manuella rutiner." },
    { vecka: "Vecka 3", punkt: "Sätt enkel AI-policy (vad ok / inte ok)." },
    { vecka: "Vecka 4", punkt: "Välj ett användningsområde att testa." },
  ],
  2: [
    { vecka: "Vecka 1", punkt: "Utse AI-ansvarig (behöver inte vara tekniker)." },
    { vecka: "Vecka 2", punkt: "Välj område och definiera mål för pilot." },
    { vecka: "Vecka 3", punkt: "Kartlägg system som innehåller mest relevant data." },
    { vecka: "Vecka 4", punkt: "Kör pilot i skarp miljö med 1–2 användare." },
  ],
  3: [
    { vecka: "Vecka 1", punkt: "Definiera KPI för tidsbesparing per process." },
    { vecka: "Vecka 2", punkt: "Bygg första interna AI-assistenten på egen data." },
    { vecka: "Vecka 3", punkt: "Integrera med ett affärssystem (Fortnox, HubSpot)." },
    { vecka: "Vecka 4", punkt: "Följ upp mätvärden och besluta om skalning." },
  ],
  4: [
    { vecka: "Vecka 1", punkt: "Standardisera säkerhet, loggning och behörigheter." },
    { vecka: "Vecka 2", punkt: "Rulla ut pilot till ytterligare team." },
    { vecka: "Vecka 3", punkt: "Bygg gemensam datamodell och åtkomstlager." },
    { vecka: "Vecka 4", punkt: "Kvartalsuppföljning av värde per lösning." },
  ],
  5: [
    { vecka: "Vecka 1", punkt: "Utvärdera AI som del av produkt/affärsmodell." },
    { vecka: "Vecka 2", punkt: "Bygg intern AI-plattform med gemensam data." },
    { vecka: "Vecka 3", punkt: "Sätt AI-KPI:er på lednings- och styrelsenivå." },
    { vecka: "Vecka 4", punkt: "Etablera AI-governance och ansvarsfullhets-review." },
  ],
};

const AiMognadsanalys = () => {
  const meta = toolByslug("ai-mognadsanalys");
  const { open } = useContactModal();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const total = QUESTIONS.length;
  const q = QUESTIONS[step];
  const score = useMemo(() => Object.values(answers).reduce((a, b) => a + b, 0), [answers]);
  const level = useMemo(() => [...LEVELS].reverse().find((l) => score >= l.min) ?? LEVELS[0], [score]);
  const strengths = QUESTIONS.filter((q) => answers[q.id] === 2).map((q) => `${q.topic}: ${q.text}`);
  const risks = QUESTIONS.filter((q) => answers[q.id] === 0).map((q) => `${q.topic}: ${q.text}`);

  const summary = useMemo(() => [
    `AI-mognadsanalys – Aurora Media`,
    `Poäng: ${score} / 20 · Nivå ${level.level} – ${level.name}`,
    ``,
    `Beskrivning: ${level.desc}`,
    ``,
    `Styrkor:`,
    ...(strengths.length ? strengths.map((s) => `• ${s}`) : ["• (inga starka områden ännu)"]),
    ``,
    `Risker / luckor:`,
    ...(risks.length ? risks.map((s) => `• ${s}`) : ["• (inga tydliga risker)"]),
    ``,
    `30-dagars handlingsplan:`,
    ...PLAN_30D[level.level].map((p) => `• ${p.vecka}: ${p.punkt}`),
  ].join("\n"), [score, level, strengths, risks]);

  const pick = (val: number) => {
    const next = { ...answers, [q.id]: val };
    setAnswers(next);
    trackEvent("verktyg_mognad_answer", { step: step + 1 });
    if (step < total - 1) {
      setTimeout(() => setStep(step + 1), 180);
    } else {
      setDone(true);
      trackEvent("verktyg_mognad_complete", { score: Object.values(next).reduce((a, b) => a + b, 0) });
    }
  };

  const reset = () => { setAnswers({}); setStep(0); setDone(false); };

  if (!done) {
    return (
      <ToolShell meta={meta} ctaHref="/kontakt" ctaLabel="Boka AI-genomgång">
        <div className="vk-panel-card" style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="vk-wizard-progress" aria-hidden>
            {QUESTIONS.map((_, i) => (
              <span key={i} className={i < step ? "done" : i === step ? "current" : ""} />
            ))}
          </div>
          <div className="vk-mono">{q.topic} · Fråga {step + 1} av {total}</div>
          <h2 style={{ marginTop: 12, fontSize: 26, lineHeight: 1.2 }}>{q.text}</h2>
          <div className="vk-choice-grid" style={{ marginTop: 28 }}>
            {CHOICES.map((c) => (
              <button
                key={c.val}
                type="button"
                className="vk-choice"
                aria-pressed={answers[q.id] === c.val}
                onClick={() => pick(c.val)}
              >
                <span className="vk-choice-title">{c.label}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <button
              type="button"
              className="vk-btn vk-btn-ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0.4 : 1 }}
            >
              <ArrowLeft size={14} /> Föregående
            </button>
            {answers[q.id] !== undefined && step < total - 1 && (
              <button type="button" className="vk-btn vk-btn-primary" onClick={() => setStep(step + 1)}>
                Nästa <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </ToolShell>
    );
  }

  return (
    <ToolShell meta={meta} ctaHref="/kontakt" ctaLabel="Boka AI-genomgång">
      <div className="vk-panel-card muted" aria-live="polite">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
          <span className="vk-mono">Er AI-mognad</span>
          <div style={{ display: "flex", gap: 8 }}>
            <CopyButton text={summary} event="verktyg_mognad_copy" />
            <button type="button" className="vk-copybtn" onClick={reset}>
              <RefreshCw size={13} /> Börja om
            </button>
          </div>
        </div>

        <div className="vk-metrics" style={{ marginTop: 24 }}>
          <Metric label={`Nivå ${level.level}`} value={level.name} hero />
          <Metric label="Poäng" value={`${score} / 20`} />
        </div>

        <div style={{ marginTop: 16 }}>
          <Bar value={score} max={20} />
        </div>

        <p style={{ marginTop: 24, fontSize: 17, color: "var(--granbark)", maxWidth: "62ch" }}>{level.desc}</p>

        <div className="vk-tool-grid" style={{ marginTop: 32 }}>
          <div>
            <h3>Styrkor</h3>
            <ul className="vk-summary-list" style={{ marginTop: 12 }}>
              {(strengths.length ? strengths : ["Inga starka områden ännu."]).map((s) => (
                <li key={s}><span className="k">{s}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Risker & luckor</h3>
            <ul className="vk-summary-list" style={{ marginTop: 12 }}>
              {(risks.length ? risks : ["Inga tydliga risker."]).map((s) => (
                <li key={s}><span className="k">{s}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h3>30-dagars handlingsplan</h3>
          <ul className="vk-summary-list" style={{ marginTop: 12 }}>
            {PLAN_30D[level.level].map((p) => (
              <li key={p.vecka}>
                <span className="k">{p.vecka}</span>
                <span className="v" style={{ textAlign: "right", maxWidth: "60%" }}>{p.punkt}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="vk-btn vk-btn-primary"
          style={{ marginTop: 28 }}
          onClick={() => { trackEvent("verktyg_mognad_cta", { level: level.level }); open("AI-automation", { internalNote: summary }); }}
        >
          Boka AI-genomgång →
        </button>
      </div>
    </ToolShell>
  );
};

export default AiMognadsanalys;

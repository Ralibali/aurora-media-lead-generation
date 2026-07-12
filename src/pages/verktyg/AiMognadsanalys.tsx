import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { VerktygShell, toolByslug } from "./VerktygShell";

type Q = { id: string; text: string };

const QUESTIONS: Q[] = [
  { id: "q1", text: "Har ni identifierat konkreta processer där AI skulle spara tid?" },
  { id: "q2", text: "Har ni en policy för hur medarbetare får använda AI-verktyg?" },
  { id: "q3", text: "Har ni koll på var era data ligger och vem som får åtkomst?" },
  { id: "q4", text: "Använder någon i teamet AI-verktyg regelbundet i arbetet?" },
  { id: "q5", text: "Har ni testat att bygga eller köpa in någon AI-lösning?" },
  { id: "q6", text: "Har ledningen en tydlig ambition eller riktning för AI?" },
  { id: "q7", text: "Har ni tid och budget avsatt för AI/automation i år?" },
  { id: "q8", text: "Har ni någon som äger AI-frågorna internt?" },
  { id: "q9", text: "Är era system integrerade så data kan flöda mellan dem?" },
  { id: "q10", text: "Mäter ni utfall (tid, kvalitet, pengar) när ni testar nytt?" },
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

const NEXT_STEPS: Record<number, string[]> = {
  1: [
    "Kör en 30-minuters intern demo av ChatGPT/Claude.",
    "Skriv ner de 3 mest tidskrävande manuella rutinerna.",
    "Sätt en enkel AI-policy (vad ok / inte ok).",
  ],
  2: [
    "Välj ett användningsområde och kör pilot i 4 veckor.",
    "Utse en AI-ansvarig (behöver inte vara tekniker).",
    "Kartlägg vilka system som innehåller mest data.",
  ],
  3: [
    "Bygg första interna AI-assistenten på egen data.",
    "Integrera med ett affärssystem (Fortnox, HubSpot, etc.).",
    "Sätt tydliga mål för tidsbesparing per process.",
  ],
  4: [
    "Standardisera säkerhet, loggning och behörigheter.",
    "Skala pilot till fler team.",
    "Följ upp värde per lösning kvartalsvis.",
  ],
  5: [
    "Utvärdera AI som del av produkter/affärsmodell.",
    "Bygg intern AI-plattform med gemensam data.",
    "Sätt AI-KPI:er på lednings- och styrelsenivå.",
  ],
};

const AiMognadsanalys = () => {
  const meta = toolByslug("ai-mognadsanalys");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => Object.values(answers).reduce((a, b) => a + b, 0), [answers]);
  const level = useMemo(() => [...LEVELS].reverse().find((l) => score >= l.min) ?? LEVELS[0], [score]);
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  const strengths = useMemo(
    () => QUESTIONS.filter((q) => answers[q.id] === 2).map((q) => q.text),
    [answers],
  );
  const risks = useMemo(
    () => QUESTIONS.filter((q) => answers[q.id] === 0).map((q) => q.text),
    [answers],
  );

  const summary = useMemo(() => {
    if (!submitted) return "";
    const lines = [
      `AI-mognadsanalys – Aurora Media`,
      `Poäng: ${score} / 20`,
      `Nivå ${level.level} – ${level.name}`,
      ``,
      `Beskrivning: ${level.desc}`,
      ``,
      `Styrkor:`,
      ...(strengths.length ? strengths.map((s) => `• ${s}`) : ["• (inga starka områden ännu)"]),
      ``,
      `Risker / luckor:`,
      ...(risks.length ? risks.map((s) => `• ${s}`) : ["• (inga tydliga risker)"]),
      ``,
      `Rekommenderade nästa steg:`,
      ...NEXT_STEPS[level.level].map((s) => `1. ${s}`),
    ];
    return lines.join("\n");
  }, [submitted, score, level, strengths, risks]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      trackEvent("verktyg_mognad_copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <VerktygShell meta={meta} ctaHref="/kontakt" ctaLabel="Boka AI-genomgång">
      <form
        className="space-y-4 rounded-3xl border border-border bg-secondary/40 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          trackEvent("verktyg_mognad_submit", { score });
        }}
      >
        {QUESTIONS.map((q, i) => (
          <fieldset key={q.id} className="border-b border-border pb-4 last:border-0">
            <legend className="mb-3 text-sm font-semibold text-foreground">
              {i + 1}. {q.text}
            </legend>
            <div className="flex flex-wrap gap-2">
              {CHOICES.map((c) => {
                const active = answers[q.id] === c.val;
                return (
                  <label
                    key={c.val}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      className="sr-only"
                      checked={active}
                      onChange={() => setAnswers({ ...answers, [q.id]: c.val })}
                    />
                    {c.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <button
          type="submit"
          disabled={!allAnswered}
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allAnswered ? "Visa resultat" : `Svara på alla frågor (${Object.keys(answers).length}/${QUESTIONS.length})`}
        </button>
      </form>

      {submitted && (
        <div className="mt-8 rounded-3xl border border-primary/30 bg-primary/5 p-6" aria-live="polite">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Er AI-mognad</p>
          <p className="mt-2 text-3xl font-display font-bold text-foreground">
            Nivå {level.level} · {level.name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Poäng {score} av 20</p>
          <p className="mt-4 text-sm text-foreground/90 leading-relaxed">{level.desc}</p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Styrkor</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {(strengths.length ? strengths : ["Inga starka områden ännu."]).map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Risker / luckor</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {(risks.length ? risks : ["Inga tydliga risker."]).map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground">Rekommenderade nästa steg</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              {NEXT_STEPS[level.level].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>

          <button
            type="button"
            onClick={copy}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Kopierat" : "Kopiera resultatet"}
          </button>
        </div>
      )}
    </VerktygShell>
  );
};

export default AiMognadsanalys;

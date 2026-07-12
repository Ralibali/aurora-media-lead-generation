import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { VerktygShell, toolByslug } from "./VerktygShell";

const FORMATS = ["Punktlista", "Kort text", "Utförlig text", "Tabell", "E-post", "Sociala inlägg"];
const TONES = ["Saklig", "Professionell", "Personlig", "Peppig", "Formell", "Vardaglig"];

const EXAMPLE = {
  goal: "Skriv ett kundmejl som svarar på en missnöjd kund utan att låta defensiv.",
  role: "Erfaren kundtjänstchef på ett svenskt SaaS-bolag",
  audience: "Kund som klagat på en försenad leverans",
  tone: "Professionell",
  format: "E-post",
  context: "Ordern försenades 3 dagar pga leverantörsproblem. Vi erbjuder 10 % rabatt.",
};

const PromptGenerator = () => {
  const meta = toolByslug("prompt-generator");
  const [goal, setGoal] = useState("");
  const [role, setRole] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState(TONES[1]);
  const [format, setFormat] = useState(FORMATS[1]);
  const [context, setContext] = useState("");
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => {
    if (!goal.trim()) return "";
    const lines = [
      `# Uppdrag`,
      goal.trim(),
      ``,
      role.trim() ? `# Din roll\nAgera som ${role.trim()}.` : "",
      audience.trim() ? `# Målgrupp\n${audience.trim()}` : "",
      `# Ton\n${tone}`,
      `# Format på svaret\n${format}`,
      context.trim() ? `# Bakgrund / kontext\n${context.trim()}` : "",
      `# Instruktioner`,
      `- Svara på svenska.`,
      `- Var konkret och undvik onödiga floskler.`,
      `- Om något är oklart – ställ en tydlig följdfråga i slutet istället för att gissa.`,
    ].filter(Boolean);
    return lines.join("\n\n");
  }, [goal, role, audience, tone, format, context]);

  const copy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      trackEvent("verktyg_prompt_copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const loadExample = () => {
    setGoal(EXAMPLE.goal);
    setRole(EXAMPLE.role);
    setAudience(EXAMPLE.audience);
    setTone(EXAMPLE.tone);
    setFormat(EXAMPLE.format);
    setContext(EXAMPLE.context);
    trackEvent("verktyg_prompt_example");
  };

  return (
    <VerktygShell meta={meta}>
      <div className="grid gap-8 md:grid-cols-2">
        <form className="space-y-5 rounded-3xl border border-border bg-secondary/40 p-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={loadExample}
              className="text-xs font-semibold uppercase tracking-widest text-primary hover:underline"
            >
              Ladda exempel
            </button>
          </div>
          <Text label="Mål – vad ska AI:n göra?" value={goal} onChange={setGoal} required rows={3} placeholder="Ex: Skriv ett kundmejl som..." />
          <Text label="Roll – vem ska AI:n agera som?" value={role} onChange={setRole} placeholder="Ex: Erfaren kundtjänstchef på ett SaaS-bolag" />
          <Text label="Målgrupp" value={audience} onChange={setAudience} placeholder="Ex: Missnöjd kund som väntat på leverans" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Ton" value={tone} onChange={setTone} options={TONES} />
            <Select label="Format" value={format} onChange={setFormat} options={FORMATS} />
          </div>
          <Text label="Bakgrund / kontext" value={context} onChange={setContext} rows={4} placeholder="Kort om situationen, siffror, tidigare försök..." />
        </form>

        <div className="rounded-3xl border border-border bg-background p-6" aria-live="polite">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Din prompt</h2>
            <button
              type="button"
              onClick={copy}
              disabled={!prompt}
              className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Kopierat" : "Kopiera"}
            </button>
          </div>
          <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl bg-secondary/40 p-4 text-xs leading-relaxed text-foreground/90 font-mono">
            {prompt || "Fyll i minst målet till vänster – prompten byggs här."}
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            Klistra in i ChatGPT, Claude eller Gemini. Ingen data skickas från denna sida.
          </p>
        </div>
      </div>
    </VerktygShell>
  );
};

function Text({
  label, value, onChange, rows = 2, placeholder, required = false,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; required?: boolean }) {
  const id = label.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}{required && <span className="text-primary"> *</span>}
      </span>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-xl border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export default PromptGenerator;

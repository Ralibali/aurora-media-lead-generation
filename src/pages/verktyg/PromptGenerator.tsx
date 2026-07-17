import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { ToolShell, toolByslug, CopyButton, Bar } from "./VerktygShell";

const FORMATS = ["Punktlista", "Kort text", "Utförlig text", "Tabell", "E-post", "Sociala inlägg"];
const TONES = ["Saklig", "Professionell", "Personlig", "Peppig", "Formell", "Vardaglig"];
const DETAIL = ["Kort", "Mellan", "Detaljerad"];
const LANG = ["Svenska", "Engelska", "Norska", "Danska"];

type Template = {
  key: string;
  name: string;
  goal: string;
  role: string;
  audience: string;
  tone: string;
  format: string;
  context: string;
  constraints: string;
  output: string;
};

const TEMPLATES: Template[] = [
  {
    key: "email",
    name: "Kundmejl",
    goal: "Skriv ett kundmejl som svarar på en missnöjd kund utan att låta defensiv.",
    role: "Erfaren kundtjänstchef på ett svenskt SaaS-bolag",
    audience: "Kund som klagat på en försenad leverans",
    tone: "Professionell",
    format: "E-post",
    context: "Ordern försenades 3 dagar pga leverantörsproblem. Vi erbjuder 10 % rabatt.",
    constraints: "Max 180 ord. Undvik försäljningsspråk. Erkänn misstaget tidigt.",
    output: "Ämnesrad + hälsning + kropp + avslutning + signatur.",
  },
  {
    key: "offer",
    name: "Offert",
    goal: "Skriv en kort, tydlig offert-text för en tjänst.",
    role: "Rådgivande säljare på ett svenskt konsultbolag",
    audience: "Beslutsfattare på ett litet företag",
    tone: "Saklig",
    format: "Utförlig text",
    context: "Tjänsten är [beskriv], leverans på 4 veckor, fast pris 60 000 kr.",
    constraints: "Inga superlativ. Var konkret om vad som ingår och inte.",
    output: "Bakgrund · Omfattning · Leverans · Pris · Nästa steg.",
  },
  {
    key: "analysis",
    name: "Analys",
    goal: "Analysera följande data och identifiera 3 tydliga mönster.",
    role: "Analytiker med bakgrund inom SMB-företag",
    audience: "Ledningsgrupp utan djup teknikvana",
    tone: "Saklig",
    format: "Punktlista",
    context: "[Klistra in data här]",
    constraints: "Peka på både styrkor och risker. Var källkritisk.",
    output: "3 mönster + rekommenderade åtgärder per mönster.",
  },
  {
    key: "social",
    name: "Sociala medier",
    goal: "Skriv 3 varianter av ett LinkedIn-inlägg.",
    role: "B2B-marknadsförare med förståelse för svensk kultur",
    audience: "Beslutsfattare på små och medelstora företag",
    tone: "Personlig",
    format: "Sociala inlägg",
    context: "Ämne: [beskriv]. Använd konkret exempel från [bransch].",
    constraints: "Max 800 tecken per inlägg. Inga hashtags i första meningen.",
    output: "3 varianter: kort krok, längre berättelse, provocerande fråga.",
  },
  {
    key: "support",
    name: "Kundservice-svar",
    goal: "Skriv ett kort supportsvar som löser kundens fråga.",
    role: "Supportagent på ett mjukvarubolag",
    audience: "Kund med teknisk fråga",
    tone: "Vardaglig",
    format: "Kort text",
    context: "Kundens fråga: [klistra in]. Känd lösning: [beskriv].",
    constraints: "Max 120 ord. Ge stegvis instruktion. Länka inte till interna sidor.",
    output: "Hälsning + stegvis lösning + avslutning.",
  },
  {
    key: "meeting",
    name: "Mötessammanfattning",
    goal: "Sammanfatta ett möte i tydliga punkter och åtgärder.",
    role: "Erfaren projektledare",
    audience: "Alla mötesdeltagare",
    tone: "Saklig",
    format: "Punktlista",
    context: "Anteckningar från mötet: [klistra in].",
    constraints: "Skilj på beslut, åtaganden och öppna frågor.",
    output: "Beslut · Åtaganden (vem/vad/när) · Öppna frågor · Nästa möte.",
  },
  {
    key: "seo",
    name: "SEO-artikel",
    goal: "Skriv ett SEO-optimerat artikelutkast som rankar på vald sökterm.",
    role: "Senior SEO-skribent med förståelse för svensk sökintention",
    audience: "Potentiella kunder som söker efter [sökterm] på Google",
    tone: "Professionell",
    format: "Utförlig text",
    context: "Sökterm: [sökterm]. Företaget: [beskriv]. Målet är att läsaren ska [boka/köpa/kontakta].",
    constraints: "H1 innehåller söktermen. 800–1200 ord. Naturligt språk – inget nyckelordsstopp. Inkludera 3–5 H2-rubriker.",
    output: "Metatitel (max 60 tecken) · metabeskrivning (max 155 tecken) · H1 · brödtext med H2-struktur · avslutande CTA.",
  },
  {
    key: "product",
    name: "Produktbeskrivning",
    goal: "Skriv en säljande men trovärdig produktbeskrivning.",
    role: "Copywriter specialiserad på svensk e-handel",
    audience: "Kund som står i begrepp att köpa [produkt]",
    tone: "Peppig",
    format: "Kort text",
    context: "Produkt: [namn]. Nyttor: [lista]. Pris: [pris]. Differentiering: [vad som gör den unik].",
    constraints: "Max 150 ord. Fokus på nytta före funktion. Ingen överdrift utan konkreta bevis.",
    output: "Rubrik · ingress (2 meningar) · 3 nyttopunkter · kort CTA.",
  },
  {
    key: "job",
    name: "Jobbannons",
    goal: "Skriv en jobbannons som attraherar rätt kandidater.",
    role: "Rekryteringsspecialist med känsla för arbetsgivarvarumärke",
    audience: "Kandidater inom [roll/yrkesområde]",
    tone: "Personlig",
    format: "Utförlig text",
    context: "Roll: [titel]. Företaget: [beskriv kort]. Krav: [måsten]. Meriterande: [bonus].",
    constraints: "Konkret om vardagen, inte bara kravlista. Inkluderande språk. Max 400 ord.",
    output: "Rubrik · om företaget · om rollen · vi söker dig som · vi erbjuder · så ansöker du.",
  },
];

const PromptGenerator = () => {
  const meta = toolByslug("prompt-generator");
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [goal, setGoal] = useState(TEMPLATES[0].goal);
  const [role, setRole] = useState(TEMPLATES[0].role);
  const [audience, setAudience] = useState(TEMPLATES[0].audience);
  const [tone, setTone] = useState(TEMPLATES[0].tone);
  const [format, setFormat] = useState(TEMPLATES[0].format);
  const [detail, setDetail] = useState(DETAIL[1]);
  const [lang, setLang] = useState(LANG[0]);
  const [context, setContext] = useState(TEMPLATES[0].context);
  const [example, setExample] = useState("");
  const [constraints, setConstraints] = useState(TEMPLATES[0].constraints);
  const [output, setOutput] = useState(TEMPLATES[0].output);

  const applyTemplate = (t: Template) => {
    setTemplate(t);
    setGoal(t.goal); setRole(t.role); setAudience(t.audience);
    setTone(t.tone); setFormat(t.format);
    setContext(t.context); setConstraints(t.constraints); setOutput(t.output);
    trackEvent("verktyg_prompt_template", { template: t.key });
  };

  const clearAll = () => {
    setGoal(""); setRole(""); setAudience(""); setContext("");
    setExample(""); setConstraints(""); setOutput("");
    trackEvent("verktyg_prompt_clear");
  };

  const prompt = useMemo(() => {
    if (!goal.trim()) return "";
    const lines: string[] = [];
    lines.push(`# Uppdrag\n${goal.trim()}`);
    if (role.trim()) lines.push(`# Din roll\nAgera som ${role.trim()}.`);
    if (audience.trim()) lines.push(`# Målgrupp\n${audience.trim()}`);
    lines.push(`# Ton och stil\nTon: ${tone}. Detaljnivå: ${detail}. Språk: ${lang}.`);
    lines.push(`# Format\n${format}`);
    if (context.trim()) lines.push(`# Bakgrund / kontext\n${context.trim()}`);
    if (example.trim()) lines.push(`# Exempel / referensdata\n${example.trim()}`);
    if (constraints.trim()) lines.push(`# Begränsningar\n${constraints.trim()}`);
    if (output.trim()) lines.push(`# Önskad outputstruktur\n${output.trim()}`);
    lines.push(
      `# Instruktioner\n- Svara på ${lang.toLowerCase()}.\n- Var konkret och undvik onödiga floskler.\n- Om något är oklart – ställ en tydlig följdfråga i slutet istället för att gissa.`,
    );
    return lines.join("\n\n");
  }, [goal, role, audience, tone, format, detail, lang, context, example, constraints, output]);

  // quality checklist
  const checklist = [
    { label: "Tydligt mål", ok: goal.trim().length > 12 },
    { label: "Roll definierad", ok: role.trim().length > 4 },
    { label: "Målgrupp beskriven", ok: audience.trim().length > 4 },
    { label: "Kontext angiven", ok: context.trim().length > 8 },
    { label: "Begränsningar satta", ok: constraints.trim().length > 4 },
    { label: "Exempel / data bifogat", ok: example.trim().length > 4 },
    { label: "Outputstruktur beskriven", ok: output.trim().length > 4 },
  ];
  const qualityScore = checklist.filter((c) => c.ok).length;

  return (
    <ToolShell meta={meta} ctaHref="/tjanster/content" ctaLabel="Läs mer om innehåll & AI">
      <div className="vk-tool-grid">
        <div className="vk-panel-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="vk-mono">Mall</span>
            <button type="button" className="vk-copybtn" onClick={clearAll}>
              <RefreshCw size={13} /> Rensa allt
            </button>
          </div>
          <div className="vk-choice-grid" style={{ marginBottom: 24 }}>
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                className="vk-choice"
                aria-pressed={template.key === t.key}
                onClick={() => applyTemplate(t)}
              >
                <span className="vk-choice-title">{t.name}</span>
              </button>
            ))}
          </div>

          <TextArea label="Mål – vad ska AI:n göra?" value={goal} onChange={setGoal} rows={3} required />
          <TextArea label="Roll – vem ska AI:n agera som?" value={role} onChange={setRole} rows={2} />
          <TextArea label="Målgrupp" value={audience} onChange={setAudience} rows={2} />

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <SelectField label="Ton" value={tone} onChange={setTone} options={TONES} />
            <SelectField label="Format" value={format} onChange={setFormat} options={FORMATS} />
            <SelectField label="Detaljnivå" value={detail} onChange={setDetail} options={DETAIL} />
            <SelectField label="Språk" value={lang} onChange={setLang} options={LANG} />
          </div>

          <TextArea label="Bakgrund / kontext" value={context} onChange={setContext} rows={3} />
          <TextArea label="Exempel eller referensdata" value={example} onChange={setExample} rows={3} hint="valfritt" />
          <TextArea label="Begränsningar" value={constraints} onChange={setConstraints} rows={2} hint="t.ex. max 200 ord, undvik jargong" />
          <TextArea label="Önskad outputstruktur" value={output} onChange={setOutput} rows={2} hint="beskriv rubriker/sektioner" />
        </div>

        <div className="vk-panel-card muted" aria-live="polite">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <span className="vk-mono">Prompt-kvalitet</span>
            <span className="vk-mono">{qualityScore} / {checklist.length}</span>
          </div>
          <Bar value={qualityScore} max={checklist.length} warn={qualityScore < 3} />
          <ul className="vk-summary-list" style={{ marginTop: 16 }}>
            {checklist.map((c) => (
              <li key={c.label}>
                <span className="k">{c.label}</span>
                <span className="v" style={{ color: c.ok ? "var(--gran)" : "var(--granbark-mut)" }}>
                  {c.ok ? "✓" : "–"}
                </span>
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "28px 0 12px", flexWrap: "wrap", gap: 8 }}>
            <span className="vk-mono">
              Din prompt{prompt ? ` · ${prompt.length} tecken · ${prompt.split(/\s+/).filter(Boolean).length} ord` : ""}
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <CopyButton text={prompt} label="Kopiera prompt" event="verktyg_prompt_copy" />
              {prompt && (
                <button
                  type="button"
                  className="vk-copybtn"
                  onClick={() => {
                    const blob = new Blob([prompt], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "prompt.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                    trackEvent("verktyg_prompt_download");
                  }}
                >
                  Ladda ner .txt
                </button>
              )}
            </div>
          </div>
          <pre className="vk-prompt-out">
            {prompt || "Fyll i minst målet till vänster – prompten byggs här."}
          </pre>
          <p className="vk-mono" style={{ marginTop: 12 }}>
            Klistra in i ChatGPT, Claude, Gemini eller Copilot. Ingen data lämnar denna sida.
          </p>
        </div>
      </div>
    </ToolShell>
  );
};

function TextArea({
  label, value, onChange, rows = 2, required, hint,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number; required?: boolean; hint?: string }) {
  const id = label.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  return (
    <div className="vk-field">
      <label htmlFor={id} className="vk-field-label">
        <span>{label}{required && <span style={{ color: "var(--varsel)" }}> *</span>}</span>
        {hint && <span className="vk-field-hint">{hint}</span>}
      </label>
      <textarea
        id={id}
        className="vk-textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="vk-field">
      <label htmlFor={id} className="vk-field-label"><span>{label}</span></label>
      <select id={id} className="vk-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default PromptGenerator;

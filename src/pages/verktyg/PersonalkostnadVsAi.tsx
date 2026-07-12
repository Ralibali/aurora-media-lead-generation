import { useMemo, useState } from "react";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { VerktygShell, toolByslug } from "./VerktygShell";

const fmt = (n: number) => new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(n));

const PersonalkostnadVsAi = () => {
  const meta = toolByslug("personalkostnad-vs-ai");
  const { open } = useContactModal();

  const [salary, setSalary] = useState(38000);
  const [socialPct, setSocialPct] = useState(31.42);
  const [people, setPeople] = useState(3);
  const [automatablePct, setAutomatablePct] = useState(25);
  const [aiCost, setAiCost] = useState(4500);
  const [aiSetup, setAiSetup] = useState(60000);
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    const monthly = salary * (1 + socialPct / 100);
    const yearlyPerson = monthly * 12;
    const yearlyTotal = yearlyPerson * people;
    const freedValue = yearlyTotal * (automatablePct / 100);
    const aiYearly = aiCost * 12 + aiSetup;
    const netYear = freedValue - aiYearly;
    return { yearlyTotal, freedValue, aiYearly, netYear };
  }, [salary, socialPct, people, automatablePct, aiCost, aiSetup]);

  return (
    <VerktygShell meta={meta} ctaHref="/ai-automation-foretag" ctaLabel="Läs mer om AI-automation">
      <div className="grid gap-8 md:grid-cols-2">
        <form
          className="space-y-5 rounded-3xl border border-border bg-secondary/40 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setCalculated(true);
            trackEvent("verktyg_personal_calculate");
          }}
        >
          <Num label="Månadslön / person (kr)" value={salary} onChange={setSalary} step={500} />
          <Num label="Sociala avgifter (%)" value={socialPct} onChange={setSocialPct} step={0.1} />
          <Num label="Antal personer i rollen" value={people} onChange={setPeople} min={1} />
          <Num label="Andel arbetstid som kan automatiseras (%)" value={automatablePct} onChange={setAutomatablePct} max={100} />
          <Num label="Månadskostnad för AI/automation (drift, kr)" value={aiCost} onChange={setAiCost} step={100} />
          <Num label="Uppstartskostnad AI (kr)" value={aiSetup} onChange={setAiSetup} step={1000} />
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            Jämför
          </button>
        </form>

        <div className="rounded-3xl border border-border bg-background p-6" aria-live="polite">
          <h2 className="text-lg font-semibold text-foreground">Resultat</h2>
          {!calculated ? (
            <p className="mt-3 text-sm text-muted-foreground">Fyll i formuläret och tryck Jämför.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              <Row label="Total personalkostnad / år" v={`${fmt(result.yearlyTotal)} kr`} />
              <Row label="Frigjord tid uttryckt i kr / år" v={`${fmt(result.freedValue)} kr`} highlight />
              <Row label="AI/automation kostnad år 1" v={`${fmt(result.aiYearly)} kr`} />
              <Row
                label="Netto år 1 (frigjort värde − AI)"
                v={`${fmt(result.netYear)} kr`}
                highlight
              />
            </ul>
          )}

          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Kalkylen visar frigjort värde – inte en rekommendation att minska personal. Poängen är
            att flytta tid från repetitivt arbete till mer värdeskapande uppgifter.
          </p>

          <button
            type="button"
            onClick={() => {
              trackEvent("verktyg_personal_cta");
              open("AI-automation", { internalNote: "Personalkostnad vs AI" });
            }}
            className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            Boka genomgång
          </button>
        </div>
      </div>
    </VerktygShell>
  );
};

function Num({
  label, value, onChange, min = 0, max, step = 1,
}: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function Row({ label, v, highlight }: { label: string; v: string; highlight?: boolean }) {
  return (
    <li className="flex items-baseline justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-display font-bold ${highlight ? "text-primary text-xl" : "text-foreground"}`}>{v}</span>
    </li>
  );
}

export default PersonalkostnadVsAi;

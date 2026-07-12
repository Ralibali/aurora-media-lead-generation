import { useMemo, useState } from "react";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { VerktygShell, toolByslug } from "./VerktygShell";

const fmt = (n: number) =>
  new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(n));

const RoiKalkylator = () => {
  const meta = toolByslug("ai-roi-kalkylator");
  const { open } = useContactModal();
  const [employees, setEmployees] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(6);
  const [hourlyCost, setHourlyCost] = useState(450);
  const [automationPct, setAutomationPct] = useState(50);
  const [projectCost, setProjectCost] = useState(60000);
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    const weeks = 46;
    const yearlyHours = employees * hoursPerWeek * weeks;
    const savedHours = yearlyHours * (automationPct / 100);
    const yearlySaving = savedHours * hourlyCost;
    const monthlySaving = yearlySaving / 12;
    const paybackMonths = yearlySaving > 0 ? (projectCost / yearlySaving) * 12 : Infinity;
    const threeYearNet = yearlySaving * 3 - projectCost;
    return { savedHours, yearlySaving, monthlySaving, paybackMonths, threeYearNet };
  }, [employees, hoursPerWeek, hourlyCost, automationPct, projectCost]);

  const onCalc = () => {
    setCalculated(true);
    trackEvent("verktyg_roi_calculate", { employees, automationPct });
  };

  return (
    <VerktygShell meta={meta} ctaHref="/kontakt" ctaLabel="Kontakta oss">
      <div className="grid gap-8 md:grid-cols-2">
        <form
          className="space-y-5 rounded-3xl border border-border bg-secondary/40 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            onCalc();
          }}
        >
          <Field label="Antal anställda som berörs" value={employees} min={1} max={5000} onChange={setEmployees} />
          <Field label="Timmar per vecka på repetitivt arbete (per person)" value={hoursPerWeek} min={0} max={40} onChange={setHoursPerWeek} />
          <Field label="Snitt-timkostnad (kr, inkl. sociala avgifter)" value={hourlyCost} min={0} max={5000} step={10} onChange={setHourlyCost} />
          <Field label="Automatiseringsgrad (%)" value={automationPct} min={0} max={100} onChange={setAutomationPct} />
          <Field label="Uppskattad projektkostnad (kr)" value={projectCost} min={0} max={5_000_000} step={1000} onChange={setProjectCost} />
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            Räkna ut ROI
          </button>
        </form>

        <div className="rounded-3xl border border-border bg-background p-6" aria-live="polite">
          <h2 className="text-lg font-semibold text-foreground">Resultat</h2>
          {!calculated ? (
            <p className="mt-3 text-sm text-muted-foreground">Fyll i formuläret och klicka på Räkna ut ROI.</p>
          ) : (
            <ul className="mt-4 space-y-4 text-sm">
              <Stat label="Sparade timmar per år" value={`${fmt(result.savedHours)} h`} />
              <Stat label="Månadsbesparing" value={`${fmt(result.monthlySaving)} kr`} />
              <Stat label="Årsbesparing" value={`${fmt(result.yearlySaving)} kr`} highlight />
              <Stat
                label="Återbetalningstid"
                value={isFinite(result.paybackMonths) ? `${result.paybackMonths.toFixed(1)} mån` : "–"}
              />
              <Stat label="3-års nettovärde" value={`${fmt(result.threeYearNet)} kr`} highlight />
            </ul>
          )}
          <button
            type="button"
            onClick={() => {
              trackEvent("verktyg_roi_cta_click");
              open("AI-automation", { internalNote: "ROI-kalkylator" });
            }}
            className="mt-6 w-full rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
          >
            Boka gratis genomgång
          </button>
        </div>
      </div>

      <SeoBlurb>
        AI ROI-kalkylatorn hjälper dig snabbt förstå vad automation kan vara värt för ert bolag.
        Vi utgår från 46 arbetsveckor per år och en konservativ modell där sparade timmar värderas
        till er interna timkostnad.
      </SeoBlurb>
    </VerktygShell>
  );
};

function Field({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
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

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <li className="flex items-baseline justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-display font-bold ${highlight ? "text-primary text-xl" : "text-foreground text-base"}`}
      >
        {value}
      </span>
    </li>
  );
}

function SeoBlurb({ children }: { children: React.ReactNode }) {
  return <p className="mt-10 max-w-3xl text-sm text-muted-foreground leading-relaxed">{children}</p>;
}

export default RoiKalkylator;

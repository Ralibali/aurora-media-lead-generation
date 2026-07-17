import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import {
  ToolShell,
  toolByslug,
  Metric,
  Bar,
  ScenarioSwitcher,
  CopyButton,
  SliderField,
  PresetChips,
  PdfButton,
  AreaChartPanel,
  fmtKr,
  SCENARIO_FACTOR,
  type Scenario,
  type ChartPoint,
} from "./VerktygShell";

const fmt = fmtKr;

const PRESETS = [
  { label: "Litet kontor", values: { e: 5, h: 6, c: 450, a: 50, p: 60000 } },
  { label: "E-handel", values: { e: 8, h: 10, c: 420, a: 60, p: 89000 } },
  { label: "Tillverkning", values: { e: 20, h: 8, c: 480, a: 40, p: 120000 } },
  { label: "Redovisning", values: { e: 12, h: 12, c: 520, a: 65, p: 89000 } },
];

const RoiKalkylator = () => {
  const meta = toolByslug("ai-roi-kalkylator");
  const { open } = useContactModal();
  const [params, setParams] = useSearchParams();

  const q = (k: string, d: number) => {
    const v = Number(params.get(k));
    return Number.isFinite(v) && v > 0 ? v : d;
  };

  const [employees, setEmployees] = useState(q("e", 5));
  const [hoursPerWeek, setHoursPerWeek] = useState(q("h", 6));
  const [hourlyCost, setHourlyCost] = useState(q("c", 450));
  const [automationPct, setAutomationPct] = useState(q("a", 50));
  const [projectCost, setProjectCost] = useState(q("p", 60000));
  const [scenario, setScenario] = useState<Scenario>(
    (params.get("s") as Scenario) || "realistisk"
  );

  // sync URL for share (debounced enough via React batching)
  useEffect(() => {
    const next = new URLSearchParams();
    next.set("e", String(employees));
    next.set("h", String(hoursPerWeek));
    next.set("c", String(hourlyCost));
    next.set("a", String(automationPct));
    next.set("p", String(projectCost));
    next.set("s", scenario);
    setParams(next, { replace: true });
  }, [employees, hoursPerWeek, hourlyCost, automationPct, projectCost, scenario, setParams]);

  const result = useMemo(() => {
    const factor = SCENARIO_FACTOR[scenario];
    const effectiveAuto = Math.min(100, automationPct * factor);
    const weeks = 46;
    const yearlyHours = employees * hoursPerWeek * weeks;
    const savedHours = yearlyHours * (effectiveAuto / 100);
    const yearlySaving = savedHours * hourlyCost;
    const monthlySaving = yearlySaving / 12;
    const paybackMonths = yearlySaving > 0 ? (projectCost / yearlySaving) * 12 : Infinity;
    const threeYearNet = yearlySaving * 3 - projectCost;
    return { effectiveAuto, savedHours, yearlyHours, yearlySaving, monthlySaving, paybackMonths, threeYearNet };
  }, [employees, hoursPerWeek, hourlyCost, automationPct, projectCost, scenario]);

  // Kumulativt kassaflöde, månad 0–36
  const cashflow: ChartPoint[] = useMemo(() => {
    const points: ChartPoint[] = [];
    for (let m = 0; m <= 36; m += 3) {
      points.push({
        name: m === 0 ? "Start" : `Mån ${m}`,
        netto: Math.round(result.monthlySaving * m - projectCost),
        sparat: Math.round(result.monthlySaving * m),
      });
    }
    return points;
  }, [result.monthlySaving, projectCost]);

  const breakEvenLabel = isFinite(result.paybackMonths)
    ? `Break-even ≈ månad ${Math.max(1, Math.round(result.paybackMonths))}`
    : undefined;

  useEffect(() => {
    trackEvent("verktyg_roi_live", { scenario, employees, automationPct });
  }, [scenario, employees, automationPct]);

  const summary = [
    `AI ROI-kalkylator – Aurora Media`,
    `Scenario: ${scenario} (auto. ${result.effectiveAuto.toFixed(0)} %)`,
    `Anställda: ${employees} · Timmar/vecka: ${hoursPerWeek} · Timkostnad: ${fmt(hourlyCost)} kr`,
    `Projektkostnad: ${fmt(projectCost)} kr`,
    ``,
    `Sparade timmar/år: ${fmt(result.savedHours)} h`,
    `Månadsbesparing: ${fmt(result.monthlySaving)} kr`,
    `Årsbesparing: ${fmt(result.yearlySaving)} kr`,
    `Payback: ${isFinite(result.paybackMonths) ? result.paybackMonths.toFixed(1) + " mån" : "–"}`,
    `3-års nettovärde: ${fmt(result.threeYearNet)} kr`,
  ].join("\n");

  return (
    <ToolShell meta={meta} ctaHref="/ai-automation-foretag" ctaLabel="Läs mer om AI-automation">
      <div className="vk-tool-grid">
        <div className="vk-panel-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <span className="vk-mono">Antaganden</span>
            <ScenarioSwitcher value={scenario} onChange={setScenario} event="verktyg_roi_scenario" />
          </div>

          <PresetChips
            presets={PRESETS}
            event="verktyg_roi_preset"
            onPick={(v) => {
              setEmployees(Number(v.e));
              setHoursPerWeek(Number(v.h));
              setHourlyCost(Number(v.c));
              setAutomationPct(Number(v.a));
              setProjectCost(Number(v.p));
            }}
          />

          <SliderField label="Anställda som berörs" value={employees} onChange={setEmployees} min={1} max={100} />
          <SliderField label="Timmar / vecka på repetitivt arbete" value={hoursPerWeek} onChange={setHoursPerWeek} min={0} max={40} suffix="h" hint="per person" />
          <SliderField label="Snitt-timkostnad" value={hourlyCost} onChange={setHourlyCost} min={200} max={1500} step={10} suffix="kr" hint="inkl. sociala avgifter" />
          <SliderField label="Automatiseringsgrad" value={automationPct} onChange={setAutomationPct} min={0} max={100} suffix="%" hint="justeras av scenariot" />
          <SliderField label="Uppskattad projektkostnad" value={projectCost} onChange={setProjectCost} min={10000} max={500000} step={5000} suffix="kr" />
        </div>

        <div className="vk-panel-card muted" aria-live="polite">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <span className="vk-mono">Resultat (live)</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <CopyButton text={summary} event="verktyg_roi_copy" />
              <PdfButton
                title="AI ROI-kalkyl"
                subtitle={`Scenario: ${scenario} · ${employees} anställda · ${hoursPerWeek} h/vecka repetitivt arbete`}
                lines={summary.split("\n").slice(4)}
                filename="aurora-roi-kalkyl.pdf"
                event="verktyg_roi_pdf"
              />
            </div>
          </div>

          <div className="vk-metrics">
            <Metric label="Årsbesparing" value={`${fmt(result.yearlySaving)} kr`} hero span2 />
            <Metric label="Månadsbesparing" value={`${fmt(result.monthlySaving)} kr`} />
            <Metric label="Sparade timmar / år" value={`${fmt(result.savedHours)} h`} />
            <Metric
              label="Payback"
              value={isFinite(result.paybackMonths) ? `${result.paybackMonths.toFixed(1)} mån` : "–"}
            />
            <Metric label="3-års nettovärde" value={`${fmt(result.threeYearNet)} kr`} />
          </div>

          <AreaChartPanel
            title="Kumulativt värde, 36 månader"
            data={cashflow}
            breakEvenLabel={breakEvenLabel}
            series={[
              { key: "sparat", label: "Sparat värde", color: "#0F5132" },
              { key: "netto", label: "Netto efter investering", color: "#E8500A" },
            ]}
          />

          <div style={{ marginTop: 24 }}>
            <div className="vk-mono" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>Andel automatiserad tid</span>
              <span>{result.effectiveAuto.toFixed(0)} %</span>
            </div>
            <Bar value={result.effectiveAuto} max={100} />
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="vk-mono" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>Payback vs mål (24 mån)</span>
              <span>
                {isFinite(result.paybackMonths) ? `${result.paybackMonths.toFixed(1)} mån` : "–"}
              </span>
            </div>
            <Bar value={Math.min(24, result.paybackMonths || 24)} max={24} warn={(result.paybackMonths || 0) > 18} />
          </div>

          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              type="button"
              className="vk-btn vk-btn-primary"
              onClick={() => {
                trackEvent("verktyg_roi_cta_click", { scenario });
                open("AI-automation", { internalNote: summary });
              }}
            >
              Boka genomgång →
            </button>
            <CopyButton
              text={typeof window !== "undefined" ? window.location.href : ""}
              label="Dela länk"
              event="verktyg_roi_share"
            />
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default RoiKalkylator;

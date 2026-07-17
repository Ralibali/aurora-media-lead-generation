import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import {
  ToolShell, toolByslug, Metric, Bar, ScenarioSwitcher, CopyButton,
  SliderField, PresetChips, PdfButton, BarComparePanel, fmtKr,
  SCENARIO_FACTOR, type Scenario, type ChartPoint,
} from "./VerktygShell";

const fmt = fmtKr;

const PRESETS = [
  { label: "Administratör", values: { l: 36000, p: 2, a: 35, d: 3500, u: 49000 } },
  { label: "Kundtjänst", values: { l: 34000, p: 4, a: 45, d: 6000, u: 69000 } },
  { label: "Ekonomi", values: { l: 46000, p: 3, a: 30, d: 5500, u: 89000 } },
  { label: "Säljstöd", values: { l: 42000, p: 2, a: 40, d: 4500, u: 59000 } },
];

const PersonalkostnadVsAi = () => {
  const meta = toolByslug("personalkostnad-vs-ai");
  const { open } = useContactModal();
  const [params, setParams] = useSearchParams();
  const q = (k: string, d: number) => { const v = Number(params.get(k)); return Number.isFinite(v) && v > 0 ? v : d; };

  const [salary, setSalary] = useState(q("l", 38000));
  const [socialPct, setSocialPct] = useState(q("so", 31.42));
  const [people, setPeople] = useState(q("p", 3));
  const [automatablePct, setAutomatablePct] = useState(q("a", 25));
  const [aiCost, setAiCost] = useState(q("d", 4500));
  const [aiSetup, setAiSetup] = useState(q("u", 60000));
  const [scenario, setScenario] = useState<Scenario>((params.get("s") as Scenario) || "realistisk");

  useEffect(() => {
    const next = new URLSearchParams({
      l: String(salary), so: String(socialPct), p: String(people), a: String(automatablePct),
      d: String(aiCost), u: String(aiSetup), s: scenario,
    });
    setParams(next, { replace: true });
  }, [salary, socialPct, people, automatablePct, aiCost, aiSetup, scenario, setParams]);

  const r = useMemo(() => {
    const factor = SCENARIO_FACTOR[scenario];
    const effAuto = Math.min(100, automatablePct * factor);
    const monthly = salary * (1 + socialPct / 100);
    const yearlyPerson = monthly * 12;
    const yearlyTotal = yearlyPerson * people;
    const freedValue = yearlyTotal * (effAuto / 100);
    const aiYear1 = aiCost * 12 + aiSetup;
    const aiYear2 = aiCost * 12;
    const netYear1 = freedValue - aiYear1;
    const netYear2 = freedValue - aiYear2;
    const netYear3 = freedValue - aiYear2;
    return { effAuto, monthly, yearlyTotal, freedValue, aiYear1, aiYear2, netYear1, netYear2, netYear3 };
  }, [salary, socialPct, people, automatablePct, aiCost, aiSetup, scenario]);

  const compare: ChartPoint[] = useMemo(() => [
    { name: "År 1", frigjort: Math.round(r.freedValue), ai: Math.round(r.aiYear1) },
    { name: "År 2", frigjort: Math.round(r.freedValue), ai: Math.round(r.aiYear2) },
    { name: "År 3", frigjort: Math.round(r.freedValue), ai: Math.round(r.aiYear2) },
  ], [r]);

  const summary = [
    `Personalkostnad vs AI – Aurora Media`,
    `Scenario: ${scenario} (frigjord andel ${r.effAuto.toFixed(0)} %)`,
    `Månadslön ${fmt(salary)} kr · Soc.avg ${socialPct}% · ${people} pers`,
    `AI-drift ${fmt(aiCost)} kr/mån · Uppstart ${fmt(aiSetup)} kr`,
    ``,
    `Total personalkostnad/år: ${fmt(r.yearlyTotal)} kr`,
    `Frigjord kapacitet i kr/år: ${fmt(r.freedValue)} kr`,
    `AI-kostnad år 1: ${fmt(r.aiYear1)} kr`,
    `AI-kostnad år 2: ${fmt(r.aiYear2)} kr`,
    `Netto år 1: ${fmt(r.netYear1)} kr`,
    `Netto år 2: ${fmt(r.netYear2)} kr`,
  ].join("\n");

  return (
    <ToolShell meta={meta} ctaHref="/ai-automation-foretag" ctaLabel="Läs mer om AI-automation">
      <div className="vk-tool-grid">
        <div className="vk-panel-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <span className="vk-mono">Antaganden</span>
            <ScenarioSwitcher value={scenario} onChange={setScenario} event="verktyg_personal_scenario" />
          </div>

          <PresetChips
            presets={PRESETS}
            event="verktyg_personal_preset"
            onPick={(v) => {
              setSalary(Number(v.l));
              setPeople(Number(v.p));
              setAutomatablePct(Number(v.a));
              setAiCost(Number(v.d));
              setAiSetup(Number(v.u));
            }}
          />

          <SliderField label="Månadslön / person" value={salary} onChange={setSalary} min={25000} max={80000} step={500} suffix="kr" />
          <SliderField label="Sociala avgifter" value={socialPct} onChange={setSocialPct} min={0} max={45} step={0.01} suffix="%" format={(n) => `${n.toLocaleString("sv-SE")} %`} />
          <SliderField label="Antal personer i rollen" value={people} onChange={setPeople} min={1} max={50} />
          <SliderField label="Andel som kan automatiseras" value={automatablePct} onChange={setAutomatablePct} min={0} max={80} suffix="%" hint="justeras av scenariot" />
          <SliderField label="Månadskostnad AI-drift" value={aiCost} onChange={setAiCost} min={500} max={30000} step={100} suffix="kr" />
          <SliderField label="Uppstartskostnad AI" value={aiSetup} onChange={setAiSetup} min={0} max={300000} step={1000} suffix="kr" />
        </div>

        <div className="vk-panel-card muted" aria-live="polite">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <span className="vk-mono">Resultat (live)</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <CopyButton text={summary} event="verktyg_personal_copy" />
              <PdfButton
                title="Personalkostnad vs AI"
                subtitle={`${people} personer · ${fmt(salary)} kr/mån · ${r.effAuto.toFixed(0)} % automatiserbart`}
                lines={summary.split("\n").slice(4)}
                filename="aurora-personal-vs-ai.pdf"
                event="verktyg_personal_pdf"
              />
            </div>
          </div>

          <div className="vk-metrics">
            <Metric label="Frigjord kapacitet / år" value={`${fmt(r.freedValue)} kr`} hero span2 />
            <Metric label="Total personalkostnad / år" value={`${fmt(r.yearlyTotal)} kr`} />
            <Metric label="AI-kostnad år 1" value={`${fmt(r.aiYear1)} kr`} />
            <Metric label="Netto år 1" value={`${fmt(r.netYear1)} kr`} />
            <Metric label="Netto år 2" value={`${fmt(r.netYear2)} kr`} />
          </div>

          <BarComparePanel
            title="Frigjort värde vs AI-kostnad per år"
            data={compare}
            series={[
              { key: "frigjort", label: "Frigjort värde", color: "#0F5132" },
              { key: "ai", label: "AI-kostnad", color: "#E8500A" },
            ]}
          />

          <div style={{ marginTop: 24 }}>
            <div className="vk-mono" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>Frigjord andel av total kapacitet</span>
              <span>{r.effAuto.toFixed(0)} %</span>
            </div>
            <Bar value={r.effAuto} max={100} />
          </div>

          <p className="vk-mono" style={{ marginTop: 20, maxWidth: "58ch" }}>
            Kalkylen visar frigjord kapacitet – inte en rekommendation att minska personal.
            Syftet är att flytta tid från repetitivt arbete till mer värdeskapande uppgifter.
          </p>

          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              type="button"
              className="vk-btn vk-btn-primary"
              onClick={() => { trackEvent("verktyg_personal_cta", { scenario }); open("AI-automation", { internalNote: summary }); }}
            >
              Boka genomgång →
            </button>
            <CopyButton text={typeof window !== "undefined" ? window.location.href : ""} label="Dela länk" event="verktyg_personal_share" />
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default PersonalkostnadVsAi;

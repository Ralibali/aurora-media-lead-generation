import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import {
  ToolShell, toolByslug, NumberField, Metric, Bar, ScenarioSwitcher, CopyButton,
  SCENARIO_FACTOR, type Scenario,
} from "./VerktygShell";

const fmt = (n: number) => new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(n));

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
    return { effAuto, monthly, yearlyTotal, freedValue, aiYear1, aiYear2, netYear1, netYear2 };
  }, [salary, socialPct, people, automatablePct, aiCost, aiSetup, scenario]);

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
          <NumberField label="Månadslön / person" suffix="kr" value={salary} onChange={setSalary} step={500} />
          <NumberField label="Sociala avgifter" suffix="%" value={socialPct} onChange={setSocialPct} step={0.1} />
          <NumberField label="Antal personer i rollen" value={people} onChange={setPeople} min={1} />
          <NumberField label="Andel som kan automatiseras" suffix="%" value={automatablePct} onChange={setAutomatablePct} max={100} hint="justeras av scenariot" />
          <NumberField label="Månadskostnad AI-drift" suffix="kr" value={aiCost} onChange={setAiCost} step={100} />
          <NumberField label="Uppstartskostnad AI" suffix="kr" value={aiSetup} onChange={setAiSetup} step={1000} />
        </div>

        <div className="vk-panel-card muted" aria-live="polite">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <span className="vk-mono">Resultat (live)</span>
            <CopyButton text={summary} event="verktyg_personal_copy" />
          </div>

          <div className="vk-metrics">
            <Metric label="Frigjord kapacitet / år" value={`${fmt(r.freedValue)} kr`} hero span2 />
            <Metric label="Total personalkostnad / år" value={`${fmt(r.yearlyTotal)} kr`} />
            <Metric label="AI-kostnad år 1" value={`${fmt(r.aiYear1)} kr`} />
            <Metric label="Netto år 1" value={`${fmt(r.netYear1)} kr`} />
            <Metric label="Netto år 2" value={`${fmt(r.netYear2)} kr`} />
          </div>

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

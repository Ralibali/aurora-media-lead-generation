import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import {
  ToolShell, toolByslug, NumberField, Metric, Bar, ScenarioSwitcher, CopyButton,
  SCENARIO_FACTOR, type Scenario,
} from "./VerktygShell";

const fmt = (n: number) => new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(n));

const SeoKalkylator = () => {
  const meta = toolByslug("seo-kalkylator");
  const { open } = useContactModal();
  const [params, setParams] = useSearchParams();
  const q = (k: string, d: number) => { const v = Number(params.get(k)); return Number.isFinite(v) && v > 0 ? v : d; };

  const [visits, setVisits] = useState(q("v", 2000));
  const [convPct, setConvPct] = useState(q("c", 1.5));
  const [aov, setAov] = useState(q("a", 1200));
  const [marginPct, setMarginPct] = useState(q("m", 45));
  const [increasePct, setIncreasePct] = useState(q("i", 40));
  const [scenario, setScenario] = useState<Scenario>((params.get("s") as Scenario) || "realistisk");

  useEffect(() => {
    const next = new URLSearchParams({
      v: String(visits), c: String(convPct), a: String(aov), m: String(marginPct), i: String(increasePct), s: scenario,
    });
    setParams(next, { replace: true });
  }, [visits, convPct, aov, marginPct, increasePct, scenario, setParams]);

  const result = useMemo(() => {
    const factor = SCENARIO_FACTOR[scenario];
    const effInc = increasePct * factor;
    const currentOrders = visits * (convPct / 100);
    const currentRev = currentOrders * aov;
    const extraVisits = visits * (effInc / 100);
    const extraOrders = extraVisits * (convPct / 100);
    const extraRevMonth = extraOrders * aov;
    const extraProfitMonth = extraRevMonth * (marginPct / 100);
    return {
      effInc, currentOrders, currentRev,
      extraVisits, extraOrders, extraRevMonth,
      extraRevYear: extraRevMonth * 12,
      extraProfitMonth, extraProfitYear: extraProfitMonth * 12,
      newVisits: visits + extraVisits,
    };
  }, [visits, convPct, aov, marginPct, increasePct, scenario]);

  const summary = [
    `SEO-kalkylator – Aurora Media`,
    `Scenario: ${scenario} (trafikökning ${result.effInc.toFixed(0)} %)`,
    `Idag: ${fmt(visits)} besök/mån · ${convPct}% konv · ${fmt(aov)} kr AOV · ${marginPct}% marginal`,
    ``,
    `Extra besök/mån: ${fmt(result.extraVisits)}`,
    `Extra order/mån: ${fmt(result.extraOrders)}`,
    `Extra omsättning/mån: ${fmt(result.extraRevMonth)} kr`,
    `Extra omsättning/år: ${fmt(result.extraRevYear)} kr`,
    `Extra bruttovinst/mån: ${fmt(result.extraProfitMonth)} kr`,
    `Extra bruttovinst/år: ${fmt(result.extraProfitYear)} kr`,
  ].join("\n");

  return (
    <ToolShell meta={meta} ctaHref="/tjanster/seo" ctaLabel="Läs mer om SEO-tjänsten">
      <div className="vk-tool-grid">
        <div className="vk-panel-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <span className="vk-mono">Antaganden</span>
            <ScenarioSwitcher value={scenario} onChange={setScenario} event="verktyg_seo_scenario" />
          </div>
          <NumberField label="Månadsbesök idag" value={visits} onChange={setVisits} min={0} step={50} />
          <NumberField label="Konverteringsgrad" suffix="%" value={convPct} onChange={setConvPct} min={0} max={100} step={0.1} hint="från GA" />
          <NumberField label="Snittordervärde / lead-värde" suffix="kr" value={aov} onChange={setAov} min={0} step={50} />
          <NumberField label="Bruttomarginal" suffix="%" value={marginPct} onChange={setMarginPct} min={0} max={100} />
          <NumberField label="Möjlig trafikökning" suffix="%" value={increasePct} onChange={setIncreasePct} min={0} max={500} step={5} hint="justeras av scenariot" />
          <p className="vk-mono" style={{ marginTop: 4 }}>Antagande: samma konvertering & AOV vid högre trafik.</p>
        </div>

        <div className="vk-panel-card muted" aria-live="polite">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
            <span className="vk-mono">Resultat (live)</span>
            <CopyButton text={summary} event="verktyg_seo_copy" />
          </div>

          <div className="vk-metrics">
            <Metric label="Extra bruttovinst / år" value={`${fmt(result.extraProfitYear)} kr`} hero span2 />
            <Metric label="Extra omsättning / mån" value={`${fmt(result.extraRevMonth)} kr`} />
            <Metric label="Extra omsättning / år" value={`${fmt(result.extraRevYear)} kr`} />
            <Metric label="Extra besök / mån" value={fmt(result.extraVisits)} />
            <Metric label="Extra order / mån" value={fmt(result.extraOrders)} />
          </div>

          <div style={{ marginTop: 28 }}>
            <div className="vk-mono" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>Trafik nu vs möjlig</span>
              <span>{fmt(visits)} → {fmt(result.newVisits)}</span>
            </div>
            <Bar value={visits} max={result.newVisits || 1} />
            <div className="vk-mono" style={{ marginTop: 16, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>Omsättning nu vs möjlig / år</span>
              <span>{fmt(result.currentRev * 12)} → {fmt(result.currentRev * 12 + result.extraRevYear)} kr</span>
            </div>
            <Bar value={result.currentRev * 12} max={(result.currentRev * 12 + result.extraRevYear) || 1} />
          </div>

          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              type="button"
              className="vk-btn vk-btn-primary"
              onClick={() => { trackEvent("verktyg_seo_cta_kontakt", { scenario }); open("SEO", { internalNote: summary }); }}
            >
              Diskutera SEO-arbete →
            </button>
            <CopyButton text={typeof window !== "undefined" ? window.location.href : ""} label="Dela länk" event="verktyg_seo_share" />
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default SeoKalkylator;

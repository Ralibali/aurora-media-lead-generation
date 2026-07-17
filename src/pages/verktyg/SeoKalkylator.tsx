import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import {
  ToolShell, toolByslug, Metric, Bar, ScenarioSwitcher, CopyButton,
  SliderField, PresetChips, PdfButton, AreaChartPanel, fmtKr,
  SCENARIO_FACTOR, type Scenario, type ChartPoint,
} from "./VerktygShell";

const fmt = fmtKr;

const PRESETS = [
  { label: "Lokal tjänst", values: { v: 800, c: 2.5, a: 3500, m: 60, i: 60 } },
  { label: "E-handel", values: { v: 8000, c: 1.8, a: 950, m: 35, i: 40 } },
  { label: "B2B-konsult", values: { v: 1500, c: 1.2, a: 15000, m: 70, i: 50 } },
  { label: "SaaS", values: { v: 5000, c: 0.9, a: 2400, m: 85, i: 80 } },
];

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

  // 12 månaders uppramp: trafik växer gradvis mot målet (SEO tar tid)
  const ramp: ChartPoint[] = useMemo(() => {
    const points: ChartPoint[] = [];
    for (let m = 1; m <= 12; m++) {
      const rampFactor = 1 - Math.exp(-m / 4); // långsam start, planar ut
      const monthVisits = visits + result.extraVisits * rampFactor;
      const monthRev = monthVisits * (convPct / 100) * aov;
      points.push({
        name: `M${m}`,
        trafik: Math.round(monthVisits),
        omsattning: Math.round(monthRev),
      });
    }
    return points;
  }, [visits, result.extraVisits, convPct, aov]);

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

          <PresetChips
            presets={PRESETS}
            event="verktyg_seo_preset"
            onPick={(v) => {
              setVisits(Number(v.v));
              setConvPct(Number(v.c));
              setAov(Number(v.a));
              setMarginPct(Number(v.m));
              setIncreasePct(Number(v.i));
            }}
          />

          <SliderField label="Månadsbesök idag" value={visits} onChange={setVisits} min={100} max={50000} step={100} />
          <SliderField label="Konverteringsgrad" value={convPct} onChange={setConvPct} min={0.1} max={10} step={0.1} suffix="%" hint="från GA" format={(n) => `${n.toLocaleString("sv-SE")} %`} />
          <SliderField label="Snittordervärde / lead-värde" value={aov} onChange={setAov} min={100} max={25000} step={100} suffix="kr" />
          <SliderField label="Bruttomarginal" value={marginPct} onChange={setMarginPct} min={5} max={95} suffix="%" />
          <SliderField label="Möjlig trafikökning" value={increasePct} onChange={setIncreasePct} min={5} max={300} step={5} suffix="%" hint="justeras av scenariot" />
          <p className="vk-mono" style={{ marginTop: 4 }}>Antagande: samma konvertering & AOV vid högre trafik.</p>
        </div>

        <div className="vk-panel-card muted" aria-live="polite">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <span className="vk-mono">Resultat (live)</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <CopyButton text={summary} event="verktyg_seo_copy" />
              <PdfButton
                title="SEO-potential"
                subtitle={`${fmt(visits)} besök/mån idag · mål +${result.effInc.toFixed(0)} % trafik`}
                lines={summary.split("\n").slice(3)}
                filename="aurora-seo-kalkyl.pdf"
                event="verktyg_seo_pdf"
              />
            </div>
          </div>

          <div className="vk-metrics">
            <Metric label="Extra bruttovinst / år" value={`${fmt(result.extraProfitYear)} kr`} hero span2 />
            <Metric label="Extra omsättning / mån" value={`${fmt(result.extraRevMonth)} kr`} />
            <Metric label="Extra omsättning / år" value={`${fmt(result.extraRevYear)} kr`} />
            <Metric label="Extra besök / mån" value={fmt(result.extraVisits)} />
            <Metric label="Extra order / mån" value={fmt(result.extraOrders)} />
          </div>

          <AreaChartPanel
            title="Trafikuppramp, 12 månader"
            data={ramp}
            kr={false}
            series={[{ key: "trafik", label: "Besök / månad", color: "#0F5132" }]}
          />

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

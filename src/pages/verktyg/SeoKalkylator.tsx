import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { VerktygShell, toolByslug } from "./VerktygShell";

const fmt = (n: number) => new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(n));

const SeoKalkylator = () => {
  const meta = toolByslug("seo-kalkylator");
  const { open } = useContactModal();
  const [visits, setVisits] = useState(2000);
  const [convPct, setConvPct] = useState(1.5);
  const [aov, setAov] = useState(1200);
  const [marginPct, setMarginPct] = useState(45);
  const [increasePct, setIncreasePct] = useState(40);
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    const extraVisits = visits * (increasePct / 100);
    const extraOrders = extraVisits * (convPct / 100);
    const extraRevMonth = extraOrders * aov;
    const extraProfitMonth = extraRevMonth * (marginPct / 100);
    return {
      extraVisits,
      extraOrders,
      extraRevMonth,
      extraRevYear: extraRevMonth * 12,
      extraProfitMonth,
      extraProfitYear: extraProfitMonth * 12,
    };
  }, [visits, convPct, aov, marginPct, increasePct]);

  return (
    <VerktygShell meta={meta} ctaHref="/tjanster/seo" ctaLabel="Läs mer om vår SEO-tjänst">
      <div className="grid gap-8 md:grid-cols-2">
        <form
          className="space-y-5 rounded-3xl border border-border bg-secondary/40 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setCalculated(true);
            trackEvent("verktyg_seo_calculate");
          }}
        >
          <Num label="Månadsbesök idag" value={visits} onChange={setVisits} min={0} step={50} />
          <Num label="Konverteringsgrad (%)" value={convPct} onChange={setConvPct} min={0} max={100} step={0.1} />
          <Num label="Snittordervärde / lead-värde (kr)" value={aov} onChange={setAov} min={0} step={50} />
          <Num label="Bruttomarginal (%)" value={marginPct} onChange={setMarginPct} min={0} max={100} step={1} />
          <Num label="Möjlig trafikökning (%)" value={increasePct} onChange={setIncreasePct} min={0} max={500} step={5} />
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            Räkna ut potential
          </button>
        </form>

        <div className="rounded-3xl border border-border bg-background p-6" aria-live="polite">
          <h2 className="text-lg font-semibold text-foreground">Resultat</h2>
          {!calculated ? (
            <p className="mt-3 text-sm text-muted-foreground">Fyll i formuläret för att se potentialen.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              <Row label="Extra besök / mån" v={`${fmt(result.extraVisits)}`} />
              <Row label="Extra order / mån" v={`${fmt(result.extraOrders)}`} />
              <Row label="Extra omsättning / mån" v={`${fmt(result.extraRevMonth)} kr`} />
              <Row label="Extra omsättning / år" v={`${fmt(result.extraRevYear)} kr`} highlight />
              <Row label="Extra bruttovinst / mån" v={`${fmt(result.extraProfitMonth)} kr`} />
              <Row label="Extra bruttovinst / år" v={`${fmt(result.extraProfitYear)} kr`} highlight />
            </ul>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                trackEvent("verktyg_seo_cta_kontakt");
                open("SEO", { internalNote: "SEO-kalkylator" });
              }}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
            >
              Diskutera SEO-arbete
            </button>
            <Link
              to="/tjanster/seo"
              onClick={() => trackEvent("verktyg_seo_service_link")}
              className="rounded-full border border-primary px-6 py-3 text-center text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              Läs mer om SEO-tjänsten
            </Link>
          </div>
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

export default SeoKalkylator;

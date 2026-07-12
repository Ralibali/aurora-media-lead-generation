import { useMemo, useState } from "react";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { VerktygShell, toolByslug } from "./VerktygShell";

type Option = { value: string; label: string; add: number };

const TYPE: Option[] = [
  { value: "landing", label: "Landningssida / mikrosajt", add: 14900 },
  { value: "webapp", label: "Webbapp / intern portal", add: 34900 },
  { value: "saas", label: "SaaS-produkt", add: 69000 },
  { value: "mobil", label: "Mobilapp (iOS/Android)", add: 89000 },
];

const PLATFORM: Option[] = [
  { value: "web", label: "Endast webb", add: 0 },
  { value: "web-mobile", label: "Webb + responsiv mobil", add: 5000 },
  { value: "native", label: "Native iOS + Android", add: 25000 },
];

const YESNO = (add: number) => [
  { value: "nej", label: "Nej", add: 0 },
  { value: "ja", label: "Ja", add },
];

const DESIGN: Option[] = [
  { value: "standard", label: "Standard – rent och funktionellt", add: 0 },
  { value: "custom", label: "Custom – egen visuell identitet", add: 15000 },
  { value: "premium", label: "Premium – anpassade illustrationer/animation", add: 35000 },
];

const TIDSRAM: Option[] = [
  { value: "flexibel", label: "Flexibel (6–10 v)", add: 0 },
  { value: "normal", label: "Standard (4–6 v)", add: 5000 },
  { value: "brådskande", label: "Brådskande (< 4 v)", add: 20000 },
];

const AppPrisraknare = () => {
  const meta = toolByslug("app-prisraknare");
  const { open } = useContactModal();

  const [type, setType] = useState(TYPE[1].value);
  const [platform, setPlatform] = useState(PLATFORM[0].value);
  const [login, setLogin] = useState("ja");
  const [payment, setPayment] = useState("nej");
  const [admin, setAdmin] = useState("ja");
  const [integrations, setIntegrations] = useState("nej");
  const [ai, setAi] = useState("nej");
  const [design, setDesign] = useState(DESIGN[0].value);
  const [tidsram, setTidsram] = useState(TIDSRAM[1].value);

  const price = useMemo(() => {
    const val = (opts: Option[], v: string) => opts.find((o) => o.value === v)?.add ?? 0;
    const base =
      val(TYPE, type) +
      val(PLATFORM, platform) +
      val(YESNO(8000), login) +
      val(YESNO(12000), payment) +
      val(YESNO(9000), admin) +
      val(YESNO(15000), integrations) +
      val(YESNO(18000), ai) +
      val(DESIGN, design) +
      val(TIDSRAM, tidsram);
    return { low: Math.round(base * 0.9), high: Math.round(base * 1.15) };
  }, [type, platform, login, payment, admin, integrations, ai, design, tidsram]);

  const paket =
    price.high < 25000
      ? "Prototyp"
      : price.high < 60000
        ? "MVP"
        : price.high < 120000
          ? "Skalbar SaaS"
          : "Custom";

  const fmt = (n: number) => new Intl.NumberFormat("sv-SE").format(n);

  return (
    <VerktygShell meta={meta} ctaHref="/priser" ctaLabel="Se alla paket och priser">
      <div className="grid gap-8 md:grid-cols-2">
        <form
          className="space-y-5 rounded-3xl border border-border bg-secondary/40 p-6"
          onChange={() => trackEvent("verktyg_prisraknare_change")}
        >
          <Select label="Produkttyp" value={type} onChange={setType} options={TYPE} />
          <Select label="Plattform" value={platform} onChange={setPlatform} options={PLATFORM} />
          <Select label="Inloggning" value={login} onChange={setLogin} options={YESNO(8000)} />
          <Select label="Betalning / prenumeration" value={payment} onChange={setPayment} options={YESNO(12000)} />
          <Select label="Admin-panel" value={admin} onChange={setAdmin} options={YESNO(9000)} />
          <Select label="Integrationer (Fortnox, Stripe, etc.)" value={integrations} onChange={setIntegrations} options={YESNO(15000)} />
          <Select label="AI-funktioner" value={ai} onChange={setAi} options={YESNO(18000)} />
          <Select label="Designnivå" value={design} onChange={setDesign} options={DESIGN} />
          <Select label="Tidsram" value={tidsram} onChange={setTidsram} options={TIDSRAM} />
        </form>

        <div className="rounded-3xl border border-border bg-background p-6" aria-live="polite">
          <h2 className="text-lg font-semibold text-foreground">Uppskattat prisintervall</h2>
          <p className="mt-4 text-3xl font-display font-bold text-primary">
            {fmt(price.low)}–{fmt(price.high)} kr
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Fast pris, exkl. moms.</p>

          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Rekommenderat paket</p>
            <p className="mt-1 text-xl font-display font-bold text-foreground">{paket}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              trackEvent("verktyg_prisraknare_cta", { paket });
              open(paket, { internalNote: `App-prisräknare uppskattning: ${fmt(price.low)}–${fmt(price.high)} kr` });
            }}
            className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            Diskutera {paket}
          </button>
        </div>
      </div>
    </VerktygShell>
  );
};

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
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
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default AppPrisraknare;

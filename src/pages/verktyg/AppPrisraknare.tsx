import { useMemo, useState } from "react";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { ToolShell, toolByslug, CopyButton, Metric, PdfButton, DriverBars } from "./VerktygShell";

type Option = { value: string; label: string; desc?: string; add: number };

const TYPE: Option[] = [
  { value: "landing", label: "Landningssida", desc: "Mikrosajt", add: 4900 },
  { value: "webapp", label: "Webbapp", desc: "Intern portal", add: 11900 },
  { value: "saas", label: "SaaS", desc: "Kundprodukt", add: 24900 },
  { value: "mobil", label: "Mobilapp", desc: "iOS + Android", add: 89000 },
];

const PLATFORM: Option[] = [
  { value: "web", label: "Endast webb", desc: "Responsiv", add: 0 },
  { value: "web-mobile", label: "Webb + PWA", desc: "Installerbar", add: 5000 },
  { value: "native", label: "Native", desc: "iOS + Android", add: 25000 },
];

const DESIGN: Option[] = [
  { value: "standard", label: "Standard", desc: "Rent & funktionellt", add: 0 },
  { value: "custom", label: "Custom", desc: "Egen identitet", add: 15000 },
  { value: "premium", label: "Premium", desc: "Illustrationer/motion", add: 35000 },
];

const TIDSRAM: Option[] = [
  { value: "flexibel", label: "Flexibel", desc: "6–10 v", add: 0 },
  { value: "normal", label: "Standard", desc: "4–6 v", add: 5000 },
  { value: "brådskande", label: "Brådskande", desc: "< 4 v", add: 20000 },
];

const TOGGLES = [
  { key: "login", label: "Inloggning & roller", add: 8000 },
  { key: "payment", label: "Betalning / prenumeration", add: 12000 },
  { key: "admin", label: "Admin-panel", add: 9000 },
  { key: "integrations", label: "Integrationer (Fortnox, Stripe)", add: 15000 },
  { key: "ai", label: "AI-funktioner", add: 18000 },
  { key: "offline", label: "Offline-läge", add: 12000 },
] as const;

type ToggleKey = (typeof TOGGLES)[number]["key"];

const fmt = (n: number) => new Intl.NumberFormat("sv-SE").format(Math.round(n));

const AppPrisraknare = () => {
  const meta = toolByslug("app-prisraknare");
  const { open } = useContactModal();

  const [type, setType] = useState(TYPE[1].value);
  const [platform, setPlatform] = useState(PLATFORM[0].value);
  const [design, setDesign] = useState(DESIGN[0].value);
  const [tidsram, setTidsram] = useState(TIDSRAM[1].value);
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    login: true, payment: false, admin: true, integrations: false, ai: false, offline: false,
  });

  const chosen = <T extends Option>(opts: T[], v: string) => opts.find((o) => o.value === v)!;

  const drivers = useMemo(() => {
    const list: { label: string; add: number }[] = [
      { label: `Produkttyp: ${chosen(TYPE, type).label}`, add: chosen(TYPE, type).add },
      { label: `Plattform: ${chosen(PLATFORM, platform).label}`, add: chosen(PLATFORM, platform).add },
      { label: `Design: ${chosen(DESIGN, design).label}`, add: chosen(DESIGN, design).add },
      { label: `Tidsram: ${chosen(TIDSRAM, tidsram).label}`, add: chosen(TIDSRAM, tidsram).add },
    ];
    TOGGLES.forEach((t) => {
      if (toggles[t.key]) list.push({ label: t.label, add: t.add });
    });
    return list;
  }, [type, platform, design, tidsram, toggles]);

  const base = drivers.reduce((s, d) => s + d.add, 0);
  const price = { low: Math.round(base * 0.9), high: Math.round(base * 1.15) };
  const paket =
    price.high < 25000 ? "Prototyp" : price.high < 60000 ? "MVP" : price.high < 120000 ? "SaaS" : "Custom";
  const delivery =
    tidsram === "brådskande" ? "< 4 veckor" : tidsram === "flexibel" ? "6–10 veckor" : "4–6 veckor";

  const includes: Record<string, string[]> = {
    Prototyp: ["Klickbar version", "Basdesign", "Deploy till preview"],
    MVP: ["Lanseringsklar", "Inloggning + admin", "Deploy till er domän", "30 d buggfri-garanti"],
    SaaS: ["Full produkt", "Integrationer", "Roller & rättigheter", "30 d buggfri-garanti"],
    Custom: ["Skräddarsytt scope", "Egen arkitektur", "Löpande dialog under bygget"],
  };

  const summary = [
    `App-prisräknare – Aurora Media`,
    `Rekommenderat paket: ${paket}`,
    `Prisintervall: ${fmt(price.low)}–${fmt(price.high)} kr`,
    `Estimerad leveranstid: ${delivery}`,
    ``,
    `Val:`,
    ...drivers.map((d) => `· ${d.label} (${fmt(d.add)} kr)`),
  ].join("\n");

  return (
    <ToolShell meta={meta} ctaHref="/priser" ctaLabel="Se alla paket och priser">
      <div className="vk-tool-grid">
        <div className="vk-panel-card">
          <span className="vk-mono">Konfigurera</span>

          <div style={{ marginTop: 20 }}>
            <div className="vk-field-label"><span>Produkttyp</span></div>
            <ChoiceGrid options={TYPE} value={type} onChange={setType} track="verktyg_prisraknare_type" />
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="vk-field-label"><span>Plattform</span></div>
            <ChoiceGrid options={PLATFORM} value={platform} onChange={setPlatform} track="verktyg_prisraknare_platform" />
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="vk-field-label"><span>Designnivå</span></div>
            <ChoiceGrid options={DESIGN} value={design} onChange={setDesign} track="verktyg_prisraknare_design" />
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="vk-field-label"><span>Tidsram</span></div>
            <ChoiceGrid options={TIDSRAM} value={tidsram} onChange={setTidsram} track="verktyg_prisraknare_time" />
          </div>
          <div style={{ marginTop: 24 }}>
            <div className="vk-field-label"><span>Funktioner</span></div>
            <div className="vk-choice-grid">
              {TOGGLES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className="vk-choice"
                  aria-pressed={toggles[t.key]}
                  onClick={() => {
                    setToggles((prev) => ({ ...prev, [t.key]: !prev[t.key] }));
                    trackEvent("verktyg_prisraknare_toggle", { toggle: t.key });
                  }}
                >
                  <span className="vk-choice-title">{t.label}</span>
                  <span className="vk-choice-desc">+{fmt(t.add)} kr</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="vk-panel-card muted" aria-live="polite">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <span className="vk-mono">Uppskattning (live)</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <CopyButton text={summary} event="verktyg_prisraknare_copy" />
              <PdfButton
                title={`Prisuppskattning – ${paket}`}
                subtitle={`Intervall ${fmt(price.low)}–${fmt(price.high)} kr · leverans ${delivery}`}
                lines={summary.split("\n").slice(1)}
                filename="aurora-prisuppskattning.pdf"
                event="verktyg_prisraknare_pdf"
              />
            </div>
          </div>

          <div className="vk-metrics">
            <Metric label="Prisintervall" value={`${fmt(price.low)}–${fmt(price.high)} kr`} hero span2 />
            <Metric label="Rekommenderat paket" value={paket} />
            <Metric label="Leveranstid" value={delivery} />
          </div>

          <div style={{ marginTop: 24 }}>
            <span className="vk-mono">Ingår typiskt i {paket}</span>
            <ul className="vk-summary-list" style={{ marginTop: 12 }}>
              {includes[paket].map((i) => (
                <li key={i}><span className="k">{i}</span><span className="v">✓</span></li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: 24 }}>
            <span className="vk-mono">Kostnadsdrivare</span>
            <DriverBars items={drivers.map((d) => ({ label: d.label, value: d.add }))} />
          </div>

          <button
            type="button"
            className="vk-btn vk-btn-primary"
            style={{ marginTop: 28, width: "100%", justifyContent: "center" }}
            onClick={() => {
              trackEvent("verktyg_prisraknare_cta", { paket });
              open(paket, { internalNote: summary });
            }}
          >
            Diskutera {paket} →
          </button>
        </div>
      </div>
    </ToolShell>
  );
};

function ChoiceGrid({
  options, value, onChange, track,
}: { options: Option[]; value: string; onChange: (v: string) => void; track: string }) {
  return (
    <div className="vk-choice-grid">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="vk-choice"
          aria-pressed={value === o.value}
          onClick={() => { onChange(o.value); trackEvent(track, { value: o.value }); }}
        >
          <span className="vk-choice-title">{o.label}</span>
          {o.desc && <span className="vk-choice-desc">{o.desc}</span>}
        </button>
      ))}
    </div>
  );
}

export default AppPrisraknare;

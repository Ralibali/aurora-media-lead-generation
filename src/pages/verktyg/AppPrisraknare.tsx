import { useState } from "react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { PACKAGES } from "@/data/offers";
import { ToolShell, toolByslug, CopyButton, Metric, PdfButton } from "./VerktygShell";

const FEATURES = ["Inloggning och roller", "Betalning eller prenumeration", "Admin och rapportering", "Koppling till befintliga system", "AI-stöd i arbetsflödet", "Användning utan uppkoppling"];
const PLATFORMS = ["Webb", "Webb som kan installeras (PWA)", "iOS och Android", "Jag vill ha hjälp att välja"];
const GOALS = ["En prototyp att testa", "En första version för användare", "En plattform med fler arbetsflöden", "Automatisera ett befintligt flöde"];

export default function AppPrisraknare() {
  const { open } = useContactModal();
  const [stage, setStage] = useState(1);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [features, setFeatures] = useState([FEATURES[0], FEATURES[2]]);
  const [goal, setGoal] = useState("");
  const offer = PACKAGES[stage];
  const nativeApp = platform === "iOS och Android";
  const summary = [
    "Projektunderlag från app-prisräknaren",
    `Mål: ${GOALS[stage]}`,
    `Plattform: ${platform}`,
    `Arbetsflöde: ${goal.trim() || "Beskrivs vid genomgång"}`,
    `Önskade funktioner: ${features.join(", ") || "Avgränsas tillsammans"}`,
    nativeApp ? "Mobilapp: separat offert efter genomgång." : `Prisreferens: ${offer.name}, ${offer.price}.`,
    nativeApp ? "Tidsplan: efter genomgång." : `Planeringsintervall för paketet: ${offer.time}.`,
    "Startpriset gäller paketets avgränsning. Funktionsvalen är önskemål och har inte prissatts. Exakt omfattning, pris och tid fastställs i offert. Drift och externa tjänster specificeras separat.",
  ].join("\n");

  return <ToolShell meta={toolByslug("app-prisraknare")} ctaHref="/priser" ctaLabel="Se paketen och vad som ingår">
    <div className="vk-tool-grid">
      <div className="vk-panel-card">
        <p className="vk-mono">Vad vill ni bygga?</p>
        <fieldset style={{ marginTop: 20, border: 0, padding: 0 }}>
          <legend className="vk-field-label">Första målet</legend>
          <div className="vk-choice-grid">{GOALS.map((label, index) => <button key={label} type="button" className="vk-choice" aria-pressed={stage === index} onClick={() => { setStage(index); trackEvent("verktyg_prisraknare_stage", { stage: index }); }}>
            <span className="vk-choice-title">{label}</span><span className="vk-choice-desc">{PACKAGES[index].name}</span>
          </button>)}</div>
        </fieldset>
        <fieldset style={{ marginTop: 24, border: 0, padding: 0 }}>
          <legend className="vk-field-label">Var ska lösningen användas?</legend>
          <div className="vk-choice-grid">{PLATFORMS.map(label => <button key={label} type="button" className="vk-choice" aria-pressed={platform === label} onClick={() => setPlatform(label)}><span className="vk-choice-title">{label}</span></button>)}</div>
        </fieldset>
        <fieldset style={{ marginTop: 24, border: 0, padding: 0 }}>
          <legend className="vk-field-label">Funktioner att diskutera</legend>
          <div className="vk-choice-grid">{FEATURES.map(label => <button key={label} type="button" className="vk-choice" aria-pressed={features.includes(label)} onClick={() => setFeatures(items => items.includes(label) ? items.filter(item => item !== label) : [...items, label])}><span className="vk-choice-title">{label}</span></button>)}</div>
        </fieldset>
        <label htmlFor="project-workflow" className="vk-field-label" style={{ marginTop: 24 }}>Vilket arbetsflöde ska bli bättre?</label>
        <textarea id="project-workflow" className="vk-input" style={{ width: "100%", minHeight: 130, padding: 14, border: "1px solid var(--linje)", borderRadius: 10, fontSize: 16, marginTop: 8 }} rows={4} maxLength={1000} value={goal} onChange={event => setGoal(event.target.value)} placeholder="Till exempel: kunden ska kunna skicka en beställning och följa status utan att ringa oss." />
      </div>
      <div className="vk-panel-card muted">
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}><p className="vk-mono">Ert underlag</p><div style={{ display: "flex", gap: 8 }}>
          <CopyButton text={summary} event="verktyg_prisraknare_copy" />
          <PdfButton title="Projektunderlag – Aurora Media" subtitle="Paketreferens och funktionsönskemål · inte en offert" lines={summary.split("\n").slice(1)} filename="aurora-projektunderlag.pdf" event="verktyg_prisraknare_pdf" />
        </div></div>
        <div className="vk-metrics" aria-live="polite">
          <Metric label={nativeApp ? "Mobilapp" : `Startpris för ${offer.name}`} value={nativeApp ? "Offert efter genomgång" : offer.price} hero span2 />
          <Metric label="Planeringsintervall" value={nativeApp ? "Efter genomgång" : offer.time} span2 />
        </div>
        <p style={{ marginTop: 20, fontSize: 14, lineHeight: 1.75 }}>Startpriset gäller en avgränsad leverans. Era funktionsval är önskemål och har ännu inte prissatts. Vi går igenom användare, integrationer och krav innan ni får en fast offert.</p>
        {!nativeApp && <div style={{ marginTop: 24 }}><p className="vk-mono">Paketets utgångspunkt</p><p style={{ marginTop: 12, lineHeight: 1.7 }}>{offer.desc}</p><ul style={{ marginTop: 12, paddingLeft: 20, lineHeight: 1.9 }}>{offer.features.map(feature => <li key={feature}>{feature}</li>)}</ul></div>}
        {nativeApp && <p style={{ marginTop: 20, lineHeight: 1.7 }}>En app för iOS och Android behöver en separat genomgång av funktioner, publicering och underhåll. <Link to="/tjanster/mobilapp" className="underline">Läs om mobilappar.</Link></p>}
        <button type="button" className="vk-btn vk-btn-primary" style={{ marginTop: 28, width: "100%", justifyContent: "center" }} onClick={() => { trackEvent("verktyg_prisraknare_cta", { paket: nativeApp ? "Mobilapp" : offer.modalValue }); open(nativeApp ? "Mobilapp" : offer.modalValue, { internalNote: summary, message: goal.trim() }); }}>Få offert på den här lösningen →</button>
        <p style={{ marginTop: 12, fontSize: 13, color: "var(--granbark-mut)", lineHeight: 1.6 }}>Era val följer med till formuläret. Drift, externa tjänster och fortsatt utveckling specificeras separat.</p>
      </div>
    </div>
  </ToolShell>;
}

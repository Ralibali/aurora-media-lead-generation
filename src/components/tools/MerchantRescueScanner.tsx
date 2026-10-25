import { useState } from "react";
import { scanMerchantSource } from "@/lib/merchantRescue";
import { trackEvent } from "@/lib/analytics";

type Report = ReturnType<typeof scanMerchantSource>;
const STATUS: Record<Report["status"], string> = {
  "migrering-krävs": "Content API-användning hittad – migrering krävs",
  kontrollera: "Möjliga beroenden hittade – kontrollera",
  "inga-kända-mönster": "Inga kända Content API-mönster i den inklistrade texten",
};

export default function MerchantRescueScanner() {
  const [text, setText] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(list: FileList | null) {
    if (!list) return;
    const files = await Promise.all([...list].slice(0, 50).filter((f) => f.size < 500_000).map(async (f) => ({ path: f.name, content: await f.text() })));
    run(files);
  }
  function run(files: { path: string; content: string }[]) {
    setError(null);
    if (!files.some((f) => f.content.trim())) return setError("Klistra in kod eller välj filer att granska.");
    try { const r = scanMerchantSource(files); setReport(r); trackEvent("merchant_rescue_scan", { status: r.status, findings: r.findings.length }); }
    catch (e) { setError(e instanceof Error ? e.message : "Granskningen misslyckades."); }
  }

  return (
    <div className="vk-panel" style={{ display: "grid", gap: 14 }}>
      <label className="vk-field">
        <span className="vk-field-label">Klistra in kod eller konfiguration</span>
        <textarea className="vk-textarea" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="from googleapiclient.discovery import build&#10;service = build('content', 'v2.1', credentials=creds)" spellCheck={false} />
        <span className="vk-field-hint">Ta bort inloggningsuppgifter innan ni klistrar in. Granskningen körs helt i er webbläsare – ingenting skickas till oss. Kända hemligheter maskeras automatiskt.</span>
      </label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" className="vk-btn vk-btn-primary" style={{ minHeight: 44 }} onClick={() => run([{ path: "inklistrat", content: text }])}>Granska text</button>
        <label className="vk-btn" style={{ minHeight: 44, cursor: "pointer" }}>
          Välj filer
          <input type="file" multiple hidden accept=".py,.js,.ts,.java,.cs,.php,.rb,.go,.json,.yml,.yaml,.xml,.txt" onChange={(e) => onFiles(e.target.files)} />
        </label>
      </div>
      {error && <p role="alert" style={{ color: "#B4531A", margin: 0 }}>{error}</p>}
      {report && (
        <div aria-live="polite" style={{ display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{STATUS[report.status]}</p>
          {report.redactions > 0 && <p style={{ margin: 0, color: "#B4531A", fontSize: 14 }}>{report.redactions} möjlig(a) hemlighet(er) maskerades i utdraget. Rotera dem om de har legat i kod.</p>}
          {report.checklist.map(({ rule, count, locations }) => (
            <div key={rule.id} style={{ borderLeft: `3px solid ${rule.severity === "måste-åtgärdas" ? "#B4531A" : "var(--granbark-mut)"}`, padding: "8px 12px" }}>
              <p style={{ margin: 0, fontWeight: 600 }}><span className="vk-mono" style={{ marginRight: 8 }}>{rule.severity} · {count}×</span>{rule.title}</p>
              <p style={{ margin: "4px 0 0", fontSize: 14 }}><strong>Merchant API:</strong> {rule.merchantApi}</p>
              <p style={{ margin: "4px 0 0", fontSize: 14 }}>{rule.action}</p>
              <p className="vk-mono" style={{ margin: "4px 0 0", fontSize: 12, color: "var(--granbark-mut)" }}>{locations.join(" · ")}</p>
            </div>
          ))}
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>{report.nextSteps.map((s) => <li key={s}>{s}</li>)}</ol>
          <p className="vk-field-hint" style={{ margin: 0 }}>{report.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getFunctionUrl } from "@/lib/functionUrl";
import { trackEvent } from "@/lib/analytics";
import type { Finding } from "../../../supabase/functions/mailguard-check/analyze";

type Result = { domain: string; checkedAt: string; findings: Finding[]; disclaimer: string };
const LABEL: Record<Finding["level"], string> = { kritisk: "Åtgärda", varning: "Varning", ok: "Hittad", okänd: "Ej avgjort", info: "Info" };
const COLOR: Record<Finding["level"], string> = { kritisk: "#B4531A", varning: "#9A6B00", ok: "var(--gran)", okänd: "var(--granbark-mut)", info: "var(--granbark-mut)" };

export default function MailGuardChecker() {
  const [domain, setDomain] = useState("");
  const [selectors, setSelectors] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!domain.trim()) return setError("Ange domänen ni vill kontrollera.");
    if (!confirmed) return setError("Bekräfta att ni ansvarar för domänen eller har ägarens uppdrag.");
    setLoading(true);
    try {
      const res = await fetch(getFunctionUrl("mailguard-check"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain, selectors }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Kontrollen kunde inte genomföras.");
      setResult(body);
      trackEvent("mailguard_check", { kritisk: body.summary?.kritisk ?? 0 });
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Kontrollen kunde inte genomföras.");
    } finally { setLoading(false); }
  }

  return (
    <div className="vk-panel" style={{ display: "grid", gap: 16 }}>
      <form onSubmit={run} noValidate style={{ display: "grid", gap: 12 }}>
        <label className="vk-field">
          <span className="vk-field-label">Domän</span>
          <input className="vk-input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="foretag.se" maxLength={253} autoComplete="off" aria-invalid={!!error && !domain.trim()} />
        </label>
        <label className="vk-field">
          <span className="vk-field-label">DKIM-selektorer (valfritt, max 5)</span>
          <input className="vk-input" value={selectors} onChange={(e) => setSelectors(e.target.value)} placeholder="google, selector1" maxLength={200} autoComplete="off" />
          <span className="vk-field-hint">Utan selektor redovisas DKIM som ej avgjort – vi gissar inte.</span>
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14 }}>
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} style={{ marginTop: 3 }} />
          Jag ansvarar för domänen eller kontrollerar den på ägarens uppdrag.
        </label>
        <button className="vk-btn vk-btn-primary" disabled={loading} style={{ minHeight: 44, justifySelf: "start" }}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Kontrollerar…</> : "Kontrollera DNS"}
        </button>
        {error && <p role="alert" style={{ color: "#B4531A", margin: 0 }}>{error}</p>}
        <p className="vk-field-hint" style={{ margin: 0 }}>Vi läser endast publika DNS-poster (MX, SPF, DMARC, angivna DKIM-selektorer). Inget sparas och inga e-postmeddelanden skickas.</p>
      </form>
      {result && (
        <div aria-live="polite" style={{ display: "grid", gap: 10 }}>
          <p className="vk-mono" style={{ margin: 0 }}>{result.domain} · {new Date(result.checkedAt).toLocaleString("sv-SE")}</p>
          {result.findings.map((f, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${COLOR[f.level]}`, padding: "8px 12px", background: "var(--papper, transparent)" }}>
              <p style={{ margin: 0, fontWeight: 600 }}><span className="vk-mono" style={{ color: COLOR[f.level], marginRight: 8 }}>{f.area} · {LABEL[f.level]}</span>{f.title}</p>
              <p style={{ margin: "4px 0 0", fontSize: 14 }}>{f.detail}</p>
              {f.action && <p style={{ margin: "4px 0 0", fontSize: 14 }}><strong>Åtgärd:</strong> {f.action}</p>}
            </div>
          ))}
          <p className="vk-field-hint" style={{ margin: 0 }}>{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}

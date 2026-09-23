import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import AdminShell, { AdminStatus } from "./AdminShell";

type QueueIssue = {
  number: number; title: string; html_url: string; body: string | null;
  labels: Array<{ name?: string } | string>; updated_at: string; pull_request?: unknown;
};

const API = "https://api.github.com/repos/Ralibali/aurora-media-lead-generation/issues?state=open&labels=accessibility-guard&per_page=100";
const priority = { critical: 0, serious: 1, moderate: 2, minor: 3, unknown: 4 } as const;
const tone = { critical: "#B42318", serious: "#B54708", moderate: "#8A6116", minor: "#175CD3", unknown: "#667085" } as const;
type Impact = keyof typeof priority;

function labels(issue: QueueIssue) {
  return issue.labels.map((label) => typeof label === "string" ? label : label.name || "");
}
function impact(issue: QueueIssue): Impact {
  const names = labels(issue);
  if (names.includes("a11y:critical")) return "critical";
  if (names.includes("a11y:serious")) return "serious";
  if (names.includes("a11y:moderate")) return "moderate";
  if (names.includes("a11y:minor")) return "minor";
  return "unknown";
}
function bodyField(body: string | null, label: string) {
  if (!body) return "—";
  const line = body.split("\n").find((value) => value.startsWith("**" + label + ":**"));
  return line ? line.replace("**" + label + ":**", "").trim() : "—";
}

export default function AccessibilityQueue() {
  const [issues, setIssues] = useState<QueueIssue[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("Kunde inte läsa Accessibility Guard-kön (HTTP " + response.status + ").");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Ogiltigt svar från åtgärdskön.");
      setIssues(data.filter((item: QueueIssue) => !item.pull_request));
    } catch (nextError) { setError(nextError); }
  }, []);

  useEffect(() => { void load(); }, [load, tick]);

  const sorted = useMemo(() => [...(issues || [])].sort((a, b) => priority[impact(a)] - priority[impact(b)] || b.updated_at.localeCompare(a.updated_at)), [issues]);
  const count = (level: Impact) => sorted.filter((issue) => impact(issue) === level).length;

  return (
    <AdminShell title="Accessibility Care" kicker="Aurora Care · åtgärdskö">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <p style={{ margin: 0, maxWidth: 760, color: "var(--granbark-mut)", fontSize: 14 }}>
          Aktiva fynd från Accessibility Guard, sorterade efter påverkan. När nästa scan inte längre hittar ett fynd stängs ärendet automatiskt.
        </p>
        <button className="vk-btn" onClick={() => setTick((value) => value + 1)}><RefreshCw size={14} /> Uppdatera</button>
      </div>

      <AdminStatus loading={!issues && !error} error={error} onRetry={() => setTick((value) => value + 1)} />

      {issues && !error && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 18 }}>
          {([["Kritiska", "critical"], ["Allvarliga", "serious"], ["Måttliga", "moderate"], ["Mindre", "minor"]] as const).map(([label, level]) => (
            <div key={level} style={{ background: "#fff", border: "1px solid var(--linje)", borderRadius: 10, padding: 16 }}>
              <span style={{ fontSize: 12, color: "var(--granbark-mut)" }}>{label}</span>
              <strong style={{ display: "block", marginTop: 4, fontSize: 28, color: tone[level] }}>{count(level)}</strong>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
          {sorted.length === 0 ? (
            <div style={{ border: "1px solid var(--linje)", borderRadius: 10, padding: 22, background: "#fff", display: "flex", gap: 10, alignItems: "center" }}>
              <ShieldCheck size={18} /> Inga aktiva automatiska tillgänglighetsfynd.
            </div>
          ) : sorted.map((issue) => {
            const level = impact(issue);
            return <article key={issue.number} style={{ border: "1px solid var(--linje)", borderLeft: "4px solid " + tone[level], borderRadius: 10, padding: 16, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <AlertTriangle size={15} style={{ color: tone[level] }} />
                    <span className="vk-mono" style={{ color: tone[level], fontSize: 10, textTransform: "uppercase" }}>{level}</span>
                    <span className="vk-mono" style={{ color: "var(--granbark-mut)", fontSize: 10 }}>#{issue.number}</span>
                  </div>
                  <h2 style={{ fontSize: 16, margin: "7px 0 0" }}>{issue.title.replace(/^\[A11Y\]\[[^\]]+\]\s*/, "")}</h2>
                  <p style={{ margin: "7px 0 0", fontSize: 12, color: "var(--granbark-mut)" }}>
                    {bodyField(issue.body, "Kund/sajt")} · {bodyField(issue.body, "Sida")} · {bodyField(issue.body, "Berörda noder")} noder
                  </p>
                </div>
                <a className="vk-btn" href={issue.html_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                  Öppna åtgärd <ExternalLink size={13} />
                </a>
              </div>
            </article>;
          })}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: "var(--granbark-mut)" }}>Automatiska fynd är en teknisk prioriteringskö. Manuell kontroll krävs fortfarande före och efter åtgärd.</p>
      </>}
    </AdminShell>
  );
}

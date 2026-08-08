import { useCallback, useEffect, useState } from "react";
import { Mail as MailIcon, Save } from "lucide-react";
import { toast } from "sonner";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Template = { subject: string; body_html: string; body_text: string; updated_at?: string };

const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--linje)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "inherit",
  background: "#fff",
  color: "inherit",
};

function TemplateEditor() {
  const [tpl, setTpl] = useState<Template>({ subject: "", body_html: "", body_text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminFetch("admin-email-template", { method: "POST", body: JSON.stringify({ action: "get", key: "ai_map_pdf" }) })
      .then((d: { template?: Template }) => {
        if (cancelled) return;
        if (d?.template) setTpl({ ...d.template });
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Kunde inte hämta mallen.");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const save = async () => {
    if (!tpl.subject.trim()) { setError("Ämnesrad krävs."); return; }
    if (!tpl.body_html.trim()) { setError("Brödtext krävs."); return; }
    setError(null);
    setSaving(true);
    try {
      await adminFetch("admin-email-template", {
        method: "POST",
        body: JSON.stringify({ action: "save", key: "ai_map_pdf", ...tpl }),
      });
      toast.success("Mallen är sparad – används vid nästa PDF-utskick.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kunde inte spara mallen.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 22, ...card }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <MailIcon size={16} color="var(--gran)" />
        <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>
          Mall: AI-karta PDF-utskick
        </p>
      </div>
      <p style={{ fontSize: 12, color: "var(--granbark-mut)", margin: "8px 0 0" }}>
        Variabler: <code>{"{{first_name}}"}</code>, <code>{"{{company}}"}</code>, <code>{"{{result_url}}"}</code>.
        Hälsningsfras, knapp, signatur och avregistrering läggs till automatiskt.
      </p>

      {loading ? (
        <p style={{ marginTop: 14, color: "var(--granbark-mut)" }}>Hämtar mall…</p>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="vk-mono" style={{ fontSize: 11, color: "var(--granbark-mut)" }}>ÄMNESRAD</span>
            <input
              style={input}
              value={tpl.subject}
              onChange={(e) => setTpl((t) => ({ ...t, subject: e.target.value }))}
              placeholder="Er AI-karta – {{company}}"
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="vk-mono" style={{ fontSize: 11, color: "var(--granbark-mut)" }}>BRÖDTEXT (HTML)</span>
            <textarea
              style={{ ...input, minHeight: 180, lineHeight: 1.5 }}
              value={tpl.body_html}
              onChange={(e) => setTpl((t) => ({ ...t, body_html: e.target.value }))}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="vk-mono" style={{ fontSize: 11, color: "var(--granbark-mut)" }}>
              BRÖDTEXT (REN TEXT – valfri, autogenereras annars)
            </span>
            <textarea
              style={{ ...input, minHeight: 110, lineHeight: 1.5 }}
              value={tpl.body_text}
              onChange={(e) => setTpl((t) => ({ ...t, body_text: e.target.value }))}
            />
          </label>
          {error && (
            <p style={{ color: "var(--varsel-hover, #E8500A)", fontSize: 13, margin: 0 }}>{error}</p>
          )}
          <div>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--gran)", color: "#fff", border: 0, borderRadius: 8,
                padding: "10px 18px", fontWeight: 600, cursor: saving ? "wait" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Save size={15} /> {saving ? "Sparar…" : "Spara mall"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type Data = {
  email: {
    total_leads: number;
    active_sequences: number;
    steps_sent_total: number;
    unsubscribed: number;
    rows: {
      lead_id: string; email: string; created_at: string;
      steps_sent: number; last_step: string | null; next_step: string | null;
      unsubscribed_at: string | null;
    }[];
  };
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--linje)",
  borderRadius: 12,
  padding: 20,
};

const Stat = ({ label, val }: { label: string; val: string | number }) => (
  <div style={card}>
    <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>{label}</p>
    <p style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, margin: "6px 0 0" }}>{val}</p>
  </div>
);

export default function AdminEmail() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [tick, setTick] = useState(0);
  const retry = useCallback(() => { setErr(null); setData(null); setTick((t) => t + 1); }, []);

  useEffect(() => {
    let cancelled = false;
    adminFetch("admin-overview", { method: "POST" })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setErr(e); });
    return () => { cancelled = true; };
  }, [tick]);

  const isEmpty = !!data && (!data.email || data.email.total_leads === 0);

  return (
    <AdminShell title="E-postsekvenser" kicker="Admin · drip">
      <AdminStatus loading={!data && !err} error={err} empty={isEmpty} onRetry={retry} />
      {data && (
        <>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <Stat label="Aktiva sekvenser" val={data.email.active_sequences} />
            <Stat label="Skickade steg totalt" val={data.email.steps_sent_total} />
            <Stat label="Avregistrerade" val={data.email.unsubscribed} />
            <Stat label="Leads i drip" val={data.email.total_leads} />
          </div>

          <div style={{ marginTop: 22, ...card }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <MailIcon size={16} color="var(--gran)" />
              <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>Sekvenser (senaste 60)</p>
            </div>
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--granbark-mut)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    <th style={{ padding: "8px 6px" }}>STARTAD</th>
                    <th style={{ padding: "8px 6px" }}>MEJL</th>
                    <th style={{ padding: "8px 6px", textAlign: "right" }}>SKICKADE</th>
                    <th style={{ padding: "8px 6px" }}>SENASTE</th>
                    <th style={{ padding: "8px 6px" }}>NÄSTA</th>
                    <th style={{ padding: "8px 6px" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.email.rows.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: "var(--granbark-mut)" }}>Inga sekvenser ännu.</td></tr>
                  )}
                  {data.email.rows.map((r) => (
                    <tr key={r.lead_id} style={{ borderTop: "1px solid var(--linje)" }}>
                      <td style={{ padding: "8px 6px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--granbark-mut)" }}>
                        {new Date(r.created_at).toLocaleDateString("sv-SE")}
                      </td>
                      <td style={{ padding: "8px 6px" }}>{r.email}</td>
                      <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.steps_sent}/4</td>
                      <td style={{ padding: "8px 6px", fontFamily: "var(--font-mono)" }}>{r.last_step ?? "—"}</td>
                      <td style={{ padding: "8px 6px", fontFamily: "var(--font-mono)" }}>{r.next_step ?? "—"}</td>
                      <td style={{ padding: "8px 6px" }}>
                        {r.unsubscribed_at ? (
                          <span style={{ padding: "2px 8px", borderRadius: 4, background: "rgba(232,80,10,.10)", color: "var(--varsel-hover)", fontSize: 11, fontFamily: "var(--font-mono)" }}>AVREG.</span>
                        ) : r.next_step ? (
                          <span style={{ padding: "2px 8px", borderRadius: 4, background: "var(--gran-soft)", color: "var(--gran)", fontSize: 11, fontFamily: "var(--font-mono)" }}>AKTIV</span>
                        ) : (
                          <span style={{ padding: "2px 8px", borderRadius: 4, background: "#EBE9E3", color: "#4A5058", fontSize: 11, fontFamily: "var(--font-mono)" }}>KLAR</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <TemplateEditor />
    </AdminShell>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Mail as MailIcon } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

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
    </AdminShell>
  );
}

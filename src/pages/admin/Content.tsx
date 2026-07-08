import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Data = {
  analytics: {
    top_cta: { label: string; count: number }[];
    top_pages: { label: string; count: number }[];
    top_faq_queries: { label: string; count: number }[];
    faq_cta: { label: string; count: number }[];
    ai_karta_top: { label: string; count: number }[];
  };
  text_library: {
    id: string; text_type: string; topic: string | null; target_keyword: string | null;
    word_count: number | null; status: string | null; used_on_page: string | null; created_at: string;
  }[];
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--linje)",
  borderRadius: 12,
  padding: 20,
};

const Bars = ({ items }: { items: { label: string; count: number }[] }) => {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {items.length === 0 && <p style={{ fontSize: 13, color: "var(--granbark-mut)" }}>Ingen data ännu.</p>}
      {items.map((r) => (
        <div key={r.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>{r.label || "—"}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.count}</span>
          </div>
          <div style={{ height: 6, background: "var(--linje)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(r.count / max) * 100}%`, background: "linear-gradient(90deg, var(--gran) 0%, #6BA88F 100%)" }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminContent() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("admin-overview", { method: "POST" }).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <AdminShell title="Innehåll & analytics" kicker="Admin · content">
      {!data && !err && <div style={{ display: "flex", gap: 10, color: "var(--granbark-mut)" }}><Loader2 size={16} className="animate-spin" /> Laddar…</div>}
      {err && <p style={{ color: "var(--varsel-hover)" }}>{err}</p>}
      {data && (
        <>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div style={card}>
              <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>FAQ-sökningar (30d)</p>
              <div style={{ marginTop: 14 }}><Bars items={data.analytics.top_faq_queries} /></div>
            </div>
            <div style={card}>
              <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>FAQ · CTA-klick</p>
              <div style={{ marginTop: 14 }}><Bars items={data.analytics.faq_cta} /></div>
            </div>
            <div style={card}>
              <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>AI-karta events</p>
              <div style={{ marginTop: 14 }}><Bars items={data.analytics.ai_karta_top} /></div>
            </div>
            <div style={card}>
              <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>Topp CTA-knappar</p>
              <div style={{ marginTop: 14 }}><Bars items={data.analytics.top_cta} /></div>
            </div>
          </div>

          <div style={{ marginTop: 22, ...card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>Textbibliotek</p>
              <Link to="/admin/text-generator" style={{ fontSize: 12, color: "var(--gran)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                Öppna textgenerator <ArrowUpRight size={12} />
              </Link>
            </div>
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--granbark-mut)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    <th style={{ padding: "8px 6px" }}>DATUM</th>
                    <th style={{ padding: "8px 6px" }}>TYP</th>
                    <th style={{ padding: "8px 6px" }}>ÄMNE</th>
                    <th style={{ padding: "8px 6px" }}>KEYWORD</th>
                    <th style={{ padding: "8px 6px" }}>ORD</th>
                    <th style={{ padding: "8px 6px" }}>STATUS</th>
                    <th style={{ padding: "8px 6px" }}>ANVÄND PÅ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.text_library.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: "var(--granbark-mut)" }}>Inga texter ännu.</td></tr>
                  )}
                  {data.text_library.map((t) => (
                    <tr key={t.id} style={{ borderTop: "1px solid var(--linje)" }}>
                      <td style={{ padding: "8px 6px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--granbark-mut)" }}>
                        {new Date(t.created_at).toLocaleDateString("sv-SE")}
                      </td>
                      <td style={{ padding: "8px 6px" }}>{t.text_type}</td>
                      <td style={{ padding: "8px 6px" }}>{t.topic ?? "—"}</td>
                      <td style={{ padding: "8px 6px" }}>{t.target_keyword ?? "—"}</td>
                      <td style={{ padding: "8px 6px", fontFamily: "var(--font-mono)" }}>{t.word_count ?? "—"}</td>
                      <td style={{ padding: "8px 6px" }}>{t.status ?? "—"}</td>
                      <td style={{ padding: "8px 6px", color: "var(--granbark-mut)" }}>{t.used_on_page ?? "—"}</td>
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

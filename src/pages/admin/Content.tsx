import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, ClipboardCopy, Link2, MessageSquareText, Plus, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
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

type ApprovalItem = {
  id: string;
  client_name: string;
  client_email: string | null;
  title: string;
  channel: string;
  body: string;
  media_url: string | null;
  status: "draft" | "awaiting_approval" | "changes_requested" | "approved" | "cancelled";
  expires_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};
type ApprovalComment = { id: string; approval_id: string; author_name: string; comment: string; created_at: string };
type ApprovalData = { items: ApprovalItem[]; comments: ApprovalComment[] };

const card: React.CSSProperties = { background: "#fff", border: "1px solid var(--linje)", borderRadius: 12, padding: 20 };
const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid var(--linje)", borderRadius: 8, padding: "9px 10px", fontSize: 13, background: "#fff" };

const Bars = ({ items }: { items: { label: string; count: number }[] }) => {
  const max = Math.max(1, ...items.map((i) => i.count));
  return <div style={{ display: "grid", gap: 8 }}>
    {items.length === 0 && <p style={{ fontSize: 13, color: "var(--granbark-mut)" }}>Ingen data ännu.</p>}
    {items.map((r) => <div key={r.label}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>{r.label || "—"}</span><span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.count}</span></div>
      <div style={{ height: 6, background: "var(--linje)", borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(r.count / max) * 100}%`, background: "linear-gradient(90deg, var(--gran) 0%, #6BA88F 100%)" }} /></div>
    </div>)}
  </div>;
};

const STATUS: Record<ApprovalItem["status"], { label: string; color: string }> = {
  draft: { label: "Utkast", color: "#6b6b6b" },
  awaiting_approval: { label: "Väntar", color: "#8A6518" },
  changes_requested: { label: "Ändringar", color: "#B4531A" },
  approved: { label: "Godkänd", color: "#217A4B" },
  cancelled: { label: "Avslutad", color: "#6b6b6b" },
};

export default function AdminContent() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [approvalData, setApprovalData] = useState<ApprovalData>({ items: [], comments: [] });
  const [approvalErr, setApprovalErr] = useState<string | null>(null);
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [latestLink, setLatestLink] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [form, setForm] = useState({ client_name: "", client_email: "", title: "", channel: "Instagram / Facebook", body: "", media_url: "" });
  const retry = useCallback(() => { setErr(null); setData(null); setTick((t) => t + 1); }, []);

  const loadApprovals = useCallback(async () => {
    try {
      const result = await adminFetch("admin-content-approval", { method: "POST", body: JSON.stringify({ action: "list" }) });
      setApprovalData(result as ApprovalData);
      setApprovalErr(null);
    } catch (e) {
      setApprovalErr(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminFetch("admin-overview", { method: "POST" }).then((d) => { if (!cancelled) setData(d); }).catch((e) => { if (!cancelled) setErr(e); });
    return () => { cancelled = true; };
  }, [tick]);
  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  const approvalAction = async (payload: Record<string, unknown>) => {
    setApprovalBusy(true); setApprovalErr(null);
    try {
      const result = await adminFetch("admin-content-approval", { method: "POST", body: JSON.stringify(payload) });
      if (result.approval_url) setLatestLink(String(result.approval_url));
      await loadApprovals();
      return true;
    } catch (e) {
      setApprovalErr(e instanceof Error ? e.message : String(e));
      return false;
    } finally { setApprovalBusy(false); }
  };

  const stats = useMemo(() => ({
    waiting: approvalData.items.filter((i) => i.status === "awaiting_approval").length,
    changes: approvalData.items.filter((i) => i.status === "changes_requested").length,
    approved: approvalData.items.filter((i) => i.status === "approved").length,
  }), [approvalData]);
  const isEmpty = !!data && !data.analytics && (!data.text_library || data.text_library.length === 0);

  return <AdminShell title="Innehåll & analytics" kicker="Admin · content">
    <AdminStatus loading={!data && !err} error={err} empty={isEmpty} onRetry={retry} />

    <section style={{ ...card, marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>KUNDGODKÄNNANDE</p>
          <h2 style={{ margin: "6px 0 0", fontSize: 20 }}>Innehåll → kommentar → godkänd</h2>
          <p style={{ margin: "5px 0 0", color: "var(--granbark-mut)", fontSize: 13, maxWidth: 650 }}>Skicka en avgränsad länk till kunden. Kunden behöver inget konto och får bara se det innehåll som länken gäller.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[{ label: "Väntar", value: stats.waiting }, { label: "Ändringar", value: stats.changes }, { label: "Godkända", value: stats.approved }].map((s) => <div key={s.label} style={{ minWidth: 90, padding: "8px 10px", border: "1px solid var(--linje)", borderRadius: 9 }}><span style={{ display: "block", fontSize: 10, color: "var(--granbark-mut)" }}>{s.label.toUpperCase()}</span><strong style={{ fontFamily: "var(--font-mono)", fontSize: 18 }}>{s.value}</strong></div>)}
        </div>
      </div>

      {approvalErr && <p role="alert" style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#B4531A0d", color: "#B4531A", fontSize: 13 }}>{approvalErr}</p>}
      {latestLink && <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#217A4B0d", border: "1px solid #217A4B33" }}><strong style={{ fontSize: 12 }}>Godkännandelänk skapad</strong><div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}><code style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11 }}>{latestLink}</code><button className="vk-btn" onClick={() => navigator.clipboard.writeText(latestLink)}><ClipboardCopy size={13} /> Kopiera</button></div></div>}

      <form onSubmit={async (e) => { e.preventDefault(); const ok = await approvalAction({ action: "create", ...form }); if (ok) setForm({ client_name: "", client_email: "", title: "", channel: "Instagram / Facebook", body: "", media_url: "" }); }} style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input required placeholder="Kundnamn" value={form.client_name} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} style={inputStyle} />
          <input type="email" placeholder="Kundens e-post (valfritt)" value={form.client_email} onChange={(e) => setForm((f) => ({ ...f, client_email: e.target.value }))} style={inputStyle} />
          <input required placeholder="Rubrik / kampanj" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} />
          <input placeholder="Kanal" value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} style={inputStyle} />
        </div>
        <textarea required placeholder="Texten kunden ska godkänna" rows={5} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
        <input placeholder="Media-/förhandsvisningslänk (valfritt)" value={form.media_url} onChange={(e) => setForm((f) => ({ ...f, media_url: e.target.value }))} style={inputStyle} />
        <div><button className="vk-btn vk-btn-primary" disabled={approvalBusy} type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Skapa godkännande</button></div>
      </form>

      <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
        {approvalData.items.slice(0, 20).map((item) => {
          const meta = STATUS[item.status];
          const comments = approvalData.comments.filter((comment) => comment.approval_id === item.id);
          return <div key={item.id} style={{ border: "1px solid var(--linje)", borderRadius: 10, padding: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div><strong style={{ fontSize: 13 }}>{item.title}</strong><div style={{ fontSize: 11, color: "var(--granbark-mut)", marginTop: 2 }}>{item.client_name} · {item.channel} · {new Date(item.created_at).toLocaleDateString("sv-SE")}</div></div>
              <span style={{ color: meta.color, background: `${meta.color}12`, border: `1px solid ${meta.color}33`, borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 700 }}>{meta.label}</span>
            </div>
            <p style={{ margin: "9px 0 0", fontSize: 12, whiteSpace: "pre-wrap", color: "#34383b" }}>{item.body.length > 260 ? `${item.body.slice(0, 260)}…` : item.body}</p>
            {comments.length > 0 && <div style={{ marginTop: 9, padding: "8px 10px", borderRadius: 8, background: "#faf9f6", fontSize: 12 }}><MessageSquareText size={13} style={{ verticalAlign: "text-bottom", marginRight: 5 }} />{comments.map((comment) => <div key={comment.id} style={{ marginTop: 4 }}><strong>{comment.author_name}:</strong> {comment.comment}</div>)}</div>}
            {item.status !== "cancelled" && <div style={{ marginTop: 10, display: "flex", gap: 7, flexWrap: "wrap" }}>
              <button className="vk-btn" disabled={approvalBusy} onClick={() => approvalAction({ action: "link", id: item.id })} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Link2 size={13} /> Ny länk</button>
              {item.status === "approved" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#217A4B", fontSize: 12 }}><CheckCircle2 size={13} /> Godkänd {item.approved_at ? new Date(item.approved_at).toLocaleDateString("sv-SE") : ""}</span>}
              {item.status !== "approved" && <button className="vk-btn vk-btn-ghost" disabled={approvalBusy} onClick={() => approvalAction({ action: "cancel", id: item.id })} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><XCircle size={13} /> Avsluta</button>}
            </div>}
          </div>;
        })}
        {approvalData.items.length === 0 && !approvalErr && <p style={{ color: "var(--granbark-mut)", fontSize: 13 }}>Inga kundgodkännanden ännu.</p>}
      </div>
    </section>

    {data && <>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div style={card}><p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>FAQ-sökningar (30d)</p><div style={{ marginTop: 14 }}><Bars items={data.analytics.top_faq_queries} /></div></div>
        <div style={card}><p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>FAQ · CTA-klick</p><div style={{ marginTop: 14 }}><Bars items={data.analytics.faq_cta} /></div></div>
        <div style={card}><p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>AI-karta events</p><div style={{ marginTop: 14 }}><Bars items={data.analytics.ai_karta_top} /></div></div>
        <div style={card}><p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>Topp CTA-knappar</p><div style={{ marginTop: 14 }}><Bars items={data.analytics.top_cta} /></div></div>
      </div>
      <div style={{ marginTop: 22, ...card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>Textbibliotek</p><Link to="/admin/text-generator" style={{ fontSize: 12, color: "var(--gran)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>Öppna textgenerator <ArrowUpRight size={12} /></Link></div>
        <div style={{ marginTop: 12, overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ textAlign: "left", color: "var(--granbark-mut)", fontFamily: "var(--font-mono)", fontSize: 11 }}><th style={{ padding: "8px 6px" }}>DATUM</th><th style={{ padding: "8px 6px" }}>TYP</th><th style={{ padding: "8px 6px" }}>ÄMNE</th><th style={{ padding: "8px 6px" }}>KEYWORD</th><th style={{ padding: "8px 6px" }}>ORD</th><th style={{ padding: "8px 6px" }}>STATUS</th><th style={{ padding: "8px 6px" }}>ANVÄND PÅ</th></tr></thead><tbody>
          {data.text_library.length === 0 && <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", color: "var(--granbark-mut)" }}>Inga texter ännu.</td></tr>}
          {data.text_library.map((t) => <tr key={t.id} style={{ borderTop: "1px solid var(--linje)" }}><td style={{ padding: "8px 6px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--granbark-mut)" }}>{new Date(t.created_at).toLocaleDateString("sv-SE")}</td><td style={{ padding: "8px 6px" }}>{t.text_type}</td><td style={{ padding: "8px 6px" }}>{t.topic ?? "—"}</td><td style={{ padding: "8px 6px" }}>{t.target_keyword ?? "—"}</td><td style={{ padding: "8px 6px", fontFamily: "var(--font-mono)" }}>{t.word_count ?? "—"}</td><td style={{ padding: "8px 6px" }}>{t.status ?? "—"}</td><td style={{ padding: "8px 6px", color: "var(--granbark-mut)" }}>{t.used_on_page ?? "—"}</td></tr>)}
        </tbody></table></div>
      </div>
    </>}
  </AdminShell>;
}

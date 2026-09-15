import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, Check, ExternalLink, Plus, RefreshCw, Store, X } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Snapshot = {
  id: string; period_start: string; period_end: string; sales: number; orders: number;
  traffic: number | null; conversion_rate: number | null; average_order_value: number | null;
  low_stock_count: number; slow_movers_count: number; order_issues_count: number;
};
type ChangeItem = { target: string; field: string; before: unknown; after: unknown };
type Change = {
  id: string; kind: string; summary: string; rationale: string | null; items: ChangeItem[];
  status: "staged" | "approved" | "applied" | "discarded" | "failed";
  source: "operator" | "ai" | "import"; guardrail_notes: string[]; created_at: string;
};
type CommerceStore = {
  id: string; name: string; platform: string; shop_domain: string | null; currency: string;
  snapshots: Snapshot[]; changes: Change[];
};
type CommerceData = { stores: CommerceStore[]; analysis?: { staged: number; rejected: string[] } };

const card: React.CSSProperties = { background: "#fff", border: "1px solid var(--linje)", borderRadius: 12, padding: 18 };
const input: React.CSSProperties = { width: "100%", border: "1px solid var(--linje)", borderRadius: 8, padding: "9px 10px", fontSize: 13, background: "#fff" };
const changeLabels: Record<string, string> = { listing_update: "Produkttext", price_update: "Pris", inventory_action: "Lager", promotion: "Kampanjpris", campaign: "Kampanj" };

export default function CommerceOps() {
  const [data, setData] = useState<CommerceData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [storeForm, setStoreForm] = useState({ name: "", platform: "manual", shop_domain: "", currency: "SEK" });
  const [snapshot, setSnapshot] = useState({ period_start: "", period_end: "", sales: "", orders: "", traffic: "", conversion_rate_pct: "", sales_change_pct: "", low_stock_count: "0", slow_movers_count: "0", order_issues_count: "0", note: "" });
  const [proposal, setProposal] = useState({ kind: "listing_update", summary: "", rationale: "", target: "", field: "content", before: "", after: "" });

  const load = useCallback(async () => {
    try {
      const result = await adminFetch("admin-commerce-ops", { method: "POST", body: JSON.stringify({ action: "list" }) }) as CommerceData;
      setData(result); setError(null); setSelectedId((current) => current || result.stores[0]?.id || "");
    } catch (nextError) { setError(nextError); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => data?.stores.find((store) => store.id === selectedId) ?? null, [data, selectedId]);
  const latest = selected?.snapshots[0] ?? null;

  const mutate = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const result = await adminFetch("admin-commerce-ops", { method: "POST", body: JSON.stringify(payload) }) as CommerceData;
      setData(result); setError(null); return true;
    } catch (nextError) { setError(nextError); return false; }
    finally { setBusy(false); }
  };

  return <AdminShell title="Commerce Ops" kicker="Admin · AI-butikschef">
    <AdminStatus loading={!data && !error} error={error} onRetry={load} />

    <section style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>AURORA COMMERCE OPS</p>
          <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Siffror → förslag → godkännande</h2>
          <p style={{ margin: "6px 0 0", maxWidth: 720, color: "var(--granbark-mut)", fontSize: 13 }}>
            Butiksdata hålls skild per kund. AI får föreslå åtgärder, men kan inte publicera, ändra pris eller flytta pengar. En människa godkänner varje ändring.
          </p>
        </div>
        <a href="https://github.com/anthropics/commerce-agents" target="_blank" rel="noreferrer" className="vk-btn" style={{ textDecoration: "none", height: 38 }}>Referensmotor <ExternalLink size={13} /></a>
      </div>
      <form onSubmit={async (event) => { event.preventDefault(); const ok = await mutate({ action: "create_store", ...storeForm }); if (ok) setStoreForm({ name: "", platform: "manual", shop_domain: "", currency: "SEK" }); }} style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
        <input required aria-label="Butiksnamn" placeholder="Butik / kund" style={input} value={storeForm.name} onChange={(event) => setStoreForm((form) => ({ ...form, name: event.target.value }))} />
        <select aria-label="Plattform" style={input} value={storeForm.platform} onChange={(event) => setStoreForm((form) => ({ ...form, platform: event.target.value }))}><option value="manual">Manuell import</option><option value="shopify">Shopify</option><option value="woocommerce">WooCommerce</option><option value="other">Annan</option></select>
        <input aria-label="Butiksdomän" placeholder="butik.se (valfritt)" style={input} value={storeForm.shop_domain} onChange={(event) => setStoreForm((form) => ({ ...form, shop_domain: event.target.value }))} />
        <input required aria-label="Valuta" maxLength={3} placeholder="SEK" style={input} value={storeForm.currency} onChange={(event) => setStoreForm((form) => ({ ...form, currency: event.target.value.toUpperCase() }))} />
        <button className="vk-btn vk-btn-primary" disabled={busy}><Plus size={14} /> Lägg till butik</button>
      </form>
    </section>

    {data && <div style={{ marginTop: 18, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))" }}>
      <section style={card}>
        <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>BUTIKER</p>
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {data.stores.map((store) => <button key={store.id} className={selectedId === store.id ? "vk-btn vk-btn-primary" : "vk-btn"} onClick={() => setSelectedId(store.id)}><Store size={13} /> {store.name}</button>)}
        </div>
        {selected && <>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><div><strong>{selected.name}</strong><p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--granbark-mut)" }}>{selected.platform} · {selected.currency}</p></div><button className="vk-btn" disabled={busy || !latest} onClick={() => mutate({ action: "analyze", store_id: selected.id })}><Bot size={14} /> Skapa AI-förslag</button></div>
          {!latest ? <p style={{ marginTop: 14, fontSize: 13, color: "var(--granbark-mut)" }}>Importera första verifierade perioden. Därefter kan AI:n analysera den.</p> : <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[{ label: "Omsättning", value: `${Number(latest.sales).toLocaleString("sv-SE")} ${selected.currency}` }, { label: "Order", value: latest.orders }, { label: "Konvertering", value: latest.conversion_rate == null ? "Okänd" : `${(Number(latest.conversion_rate) * 100).toFixed(1)}%` }, { label: "Lågt lager", value: latest.low_stock_count }, { label: "Tröga varor", value: latest.slow_movers_count }, { label: "Orderproblem", value: latest.order_issues_count }].map((metric) => <div key={metric.label} style={{ border: "1px solid var(--linje)", borderRadius: 9, padding: 10 }}><span style={{ display: "block", fontSize: 10, color: "var(--granbark-mut)" }}>{metric.label.toUpperCase()}</span><strong style={{ fontFamily: "var(--font-mono)", fontSize: 16 }}>{metric.value}</strong></div>)}
          </div>}
        </>}
      </section>

      {selected && <section style={card}>
        <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>IMPORTERA PERIOD</p>
        <form onSubmit={async (event) => { event.preventDefault(); const ok = await mutate({ action: "import_snapshot", store_id: selected.id, ...snapshot, conversion_rate: snapshot.conversion_rate_pct === "" ? "" : Number(snapshot.conversion_rate_pct) / 100 }); if (ok) setSnapshot((current) => ({ ...current, sales: "", orders: "", traffic: "", note: "" })); }} style={{ marginTop: 11, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          <input required type="date" aria-label="Period från" style={input} value={snapshot.period_start} onChange={(event) => setSnapshot((form) => ({ ...form, period_start: event.target.value }))} />
          <input required type="date" aria-label="Period till" style={input} value={snapshot.period_end} onChange={(event) => setSnapshot((form) => ({ ...form, period_end: event.target.value }))} />
          {[{ key: "sales", label: "Omsättning", required: true }, { key: "orders", label: "Order", required: true }, { key: "traffic", label: "Besökare" }, { key: "conversion_rate_pct", label: "Konvertering %" }, { key: "sales_change_pct", label: "Omsättningsförändring %" }, { key: "low_stock_count", label: "Lågt lager" }, { key: "slow_movers_count", label: "Tröga varor" }, { key: "order_issues_count", label: "Orderproblem" }].map((field) => <input key={field.key} required={field.required} type="number" step="any" min={field.key.includes("change") ? undefined : 0} aria-label={field.label} placeholder={field.label} style={input} value={snapshot[field.key as keyof typeof snapshot]} onChange={(event) => setSnapshot((form) => ({ ...form, [field.key]: event.target.value }))} />)}
          <textarea aria-label="Databegränsning eller notering" placeholder="Vad saknas eller begränsar siffrorna?" style={{ ...input, gridColumn: "1 / -1", resize: "vertical" }} value={snapshot.note} onChange={(event) => setSnapshot((form) => ({ ...form, note: event.target.value }))} />
          <div style={{ gridColumn: "1 / -1" }}><button className="vk-btn vk-btn-primary" disabled={busy}><RefreshCw size={14} /> Spara period</button></div>
        </form>
      </section>}
    </div>}

    {selected && <section style={{ ...card, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><div><p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>ÄNDRINGSLEDGER</p><h2 style={{ margin: "5px 0 0", fontSize: 19 }}>Inget sker utan godkännande</h2></div>{data?.analysis && <p style={{ fontSize: 12, color: "var(--granbark-mut)" }}>AI: {data.analysis.staged} förslag sparade, {data.analysis.rejected.length} stoppade av regler.</p>}</div>

      <form onSubmit={async (event) => { event.preventDefault(); const ok = await mutate({ action: "stage_change", store_id: selected.id, kind: proposal.kind, summary: proposal.summary, rationale: proposal.rationale, items: [{ target: proposal.target, field: proposal.field, before: proposal.before, after: proposal.after }] }); if (ok) setProposal((current) => ({ ...current, summary: "", rationale: "", target: "", before: "", after: "" })); }} style={{ marginTop: 14, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        <select aria-label="Ändringstyp" style={input} value={proposal.kind} onChange={(event) => setProposal((form) => ({ ...form, kind: event.target.value }))}>{Object.entries(changeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <input required aria-label="Sammanfattning" placeholder="Sammanfattning" style={input} value={proposal.summary} onChange={(event) => setProposal((form) => ({ ...form, summary: event.target.value }))} />
        <input required aria-label="Mål" placeholder="Produkt / målgrupp" style={input} value={proposal.target} onChange={(event) => setProposal((form) => ({ ...form, target: event.target.value }))} />
        <input required aria-label="Fält" placeholder="Fält, t.ex. content" style={input} value={proposal.field} onChange={(event) => setProposal((form) => ({ ...form, field: event.target.value }))} />
        <input aria-label="Före" placeholder="Före" style={input} value={proposal.before} onChange={(event) => setProposal((form) => ({ ...form, before: event.target.value }))} />
        <input aria-label="Efter" placeholder="Efter" style={input} value={proposal.after} onChange={(event) => setProposal((form) => ({ ...form, after: event.target.value }))} />
        <input aria-label="Motivering" placeholder="Motivering / evidens" style={input} value={proposal.rationale} onChange={(event) => setProposal((form) => ({ ...form, rationale: event.target.value }))} />
        <button className="vk-btn" disabled={busy}><Plus size={14} /> Lägg som förslag</button>
      </form>

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {selected.changes.map((change) => <article key={change.id} style={{ border: "1px solid var(--linje)", borderRadius: 10, padding: 13, opacity: ["discarded", "applied"].includes(change.status) ? 0.65 : 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><div><strong>{change.summary}</strong><span style={{ display: "block", marginTop: 3, fontSize: 11, color: "var(--granbark-mut)" }}>{changeLabels[change.kind] || change.kind} · {change.source === "ai" ? "AI-förslag" : "Manuellt"}</span></div><span className="vk-mono" style={{ fontSize: 11 }}>{change.status.toUpperCase()}</span></div>
          {change.rationale && <p style={{ margin: "8px 0", fontSize: 12, color: "var(--granbark-mut)" }}>{change.rationale}</p>}
          <ul style={{ margin: "8px 0", paddingLeft: 18, fontSize: 12 }}>{change.items.map((item, index) => <li key={`${item.target}-${item.field}-${index}`}>{item.target} · {item.field}: {String(item.before ?? "—")} → {String(item.after ?? "—")}</li>)}</ul>
          {change.guardrail_notes.length > 0 && <p style={{ fontSize: 11, color: "#8A6518" }}>{change.guardrail_notes.join(" ")}</p>}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {change.status === "staged" && <><button className="vk-btn" disabled={busy} onClick={() => mutate({ action: "approve_change", store_id: selected.id, change_id: change.id })}><Check size={13} /> Godkänn</button><button className="vk-btn" disabled={busy} onClick={() => mutate({ action: "discard_change", store_id: selected.id, change_id: change.id })}><X size={13} /> Kasta</button></>}
            {change.status === "approved" && <button className="vk-btn vk-btn-primary" disabled={busy} onClick={() => { if (window.confirm("Bekräfta bara om ändringen redan är genomförd i butikssystemet.")) void mutate({ action: "mark_applied", store_id: selected.id, change_id: change.id, confirmation: "APPLIED_EXTERNALLY" }); }}><Check size={13} /> Markera genomförd externt</button>}
          </div>
        </article>)}
        {selected.changes.length === 0 && <p style={{ fontSize: 13, color: "var(--granbark-mut)" }}>Inga förslag ännu.</p>}
      </div>
    </section>}
  </AdminShell>;
}

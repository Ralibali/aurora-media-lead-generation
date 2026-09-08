import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { adminFetch } from "@/lib/adminClient";
import { followupQueue, needsFollowup, pipelineSummary, type PipelineLead } from "@/lib/leadPipeline";
import { AdminStatus } from "./AdminShell";
export default function FollowupQueue() {
  const [leads, setLeads] = useState<PipelineLead[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setError(null);
    adminFetch("list-leads", { method: "POST", body: JSON.stringify({ action: "list" }) }).then(data => {
      if (!Array.isArray(data.leads)) throw new Error("Leadlistan kunde inte läsas.");
      if (!cancelled) setLeads(data.leads);
    }).catch(e => { if (!cancelled) setError(e); });
    return () => { cancelled = true; };
  }, [refresh]);
  const summary = pipelineSummary(leads || []);
  const queue = followupQueue(leads || []).slice(0, 6);
  return <section style={{ marginBottom: 30 }} aria-label="Nästa steg i försäljningen">
    <div style={{ display: "flex", gap: 20, justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><div><p className="vk-mono">Börja här</p><h2 style={{ fontSize: 25, marginTop: 8 }}>Förfrågningar att ta vidare</h2></div><button className="vk-btn vk-btn-ghost" onClick={() => setRefresh(n => n + 1)} aria-label="Uppdatera uppföljning"><RefreshCw size={16} /></button></div>
    <AdminStatus loading={!leads && !error} error={error} onRetry={() => setRefresh(n => n + 1)} />
    {leads && !error && <><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))", gap: 12 }}>{[
      ["Obesvarade", summary.unhandled, "new"], ["Följ upp idag", summary.followups, "followup"], ["Offerter ute", summary.offers, "offers"], ["Kunder", summary.customers, "customers"],
    ].map(([label, count, view]) => <Link key={label} to={`/admin/leads?view=${view}`} style={{ textDecoration: "none", color: "inherit", background: "#fff", border: "1px solid var(--linje)", padding: 18, borderRadius: 10 }}><span style={{ display: "block", fontSize: 12, color: "var(--granbark-mut)" }}>{label}</span><strong style={{ display: "block", fontSize: 30 }}>{count}</strong></Link>)}</div>
    <div style={{ background: "#fff", border: "1px solid var(--linje)", borderRadius: 10, padding: 22, marginTop: 16 }}>
      {queue.length ? queue.map(lead => <Link key={`${lead.source}:${lead.id}`} to={`/admin/leads?lead=${lead.id}`} style={{ display: "flex", justifyContent: "space-between", gap: 16, textDecoration: "none", color: "inherit", borderBottom: "1px solid var(--linje)", paddingBlock: 13 }}><div><strong style={{ fontSize: 14 }}>{lead.company || lead.name}</strong><p style={{ fontSize: 12, color: "var(--granbark-mut)" }}>{lead.name} · {needsFollowup(lead) ? `Uppföljning ${lead.followup_at?.slice(0, 10)}` : "Ny förfrågan"}</p></div><ArrowUpRight size={18} /></Link>) : <p style={{ fontSize: 14 }}>Inga nya eller förfallna uppföljningar just nu. <Link to="/admin/leads">Öppna alla leads</Link>.</p>}
    </div><p style={{ marginTop: 10, fontSize: 12, color: "var(--granbark-mut)" }}>Möten och kunder räknas efter sparad status. En bokningsförfrågan är inte ett bekräftat möte.</p></>}
  </section>;
}

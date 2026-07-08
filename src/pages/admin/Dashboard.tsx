import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Overview = {
  overview: {
    leads_total: number; leads_karta: number; leads_kontakt: number; leads_genomlysning: number;
    leads_7d: number; leads_30d: number;
    cta_clicks_30d: number; faq_searches_30d: number; faq_zero_results_30d: number; ai_karta_clicks_30d: number;
  };
  recent_leads: { id: string; name: string; company: string | null; email: string; source: string; created_at: string }[];
  analytics: {
    top_cta: { label: string; count: number }[];
    top_pages: { label: string; count: number }[];
    top_faq_queries: { label: string; count: number }[];
    faq_cta: { label: string; count: number }[];
    ai_karta_top: { label: string; count: number }[];
  };
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--linje)",
  borderRadius: 12,
  padding: 20,
};

const Stat = ({ label, val, sub }: { label: string; val: string | number; sub?: string }) => (
  <div style={card}>
    <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>{label}</p>
    <p style={{ fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 700, margin: "6px 0 0", letterSpacing: "-0.01em" }}>
      {val}
    </p>
    {sub && <p style={{ fontSize: 12, color: "var(--granbark-mut)", margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

const List = ({ title, items }: { title: string; items: { label: string; count: number }[] }) => (
  <div style={card}>
    <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>{title}</p>
    <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--granbark-mut)", margin: 0 }}>Ingen data ännu.</p>
      ) : items.slice(0, 8).map((r) => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, fontSize: 13 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label || "—"}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.count}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("admin-overview", { method: "POST" }).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <AdminShell title="Översikt" kicker="Admin · dashboard">
      {!data && !err && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--granbark-mut)" }}>
          <Loader2 size={16} className="animate-spin" /> Laddar…
        </div>
      )}
      {err && <p style={{ color: "var(--varsel-hover)" }}>{err}</p>}
      {data && (
        <>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <Stat label="Leads totalt" val={data.overview.leads_total} sub={`${data.overview.leads_7d} senaste 7 d`} />
            <Stat label="AI-karta" val={data.overview.leads_karta} />
            <Stat label="Kontakt" val={data.overview.leads_kontakt} />
            <Stat label="Genomlysning" val={data.overview.leads_genomlysning} />
            <Stat label="CTA-klick (30d)" val={data.overview.cta_clicks_30d} />
            <Stat label="FAQ-sökningar (30d)" val={data.overview.faq_searches_30d} sub={`${data.overview.faq_zero_results_30d} utan träff`} />
            <Stat label="AI-karta klick (30d)" val={data.overview.ai_karta_clicks_30d} />
          </div>

          <div style={{ marginTop: 22, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <List title="Topp CTA-knappar" items={data.analytics.top_cta} />
            <List title="Topp sidor (klick)" items={data.analytics.top_pages} />
            <List title="Topp FAQ-sökningar" items={data.analytics.top_faq_queries} />
            <List title="AI-karta events" items={data.analytics.ai_karta_top} />
          </div>

          <div style={{ marginTop: 22, ...card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>Senaste leads</p>
              <Link to="/admin/leads" style={{ fontSize: 12, color: "var(--gran)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                Se alla <ArrowUpRight size={12} />
              </Link>
            </div>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              {data.recent_leads.map((l) => (
                <div key={l.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 12, fontSize: 13, alignItems: "baseline" }}>
                  <span className="vk-mono" style={{ color: "var(--granbark-mut)", fontSize: 11 }}>
                    {new Date(l.created_at).toLocaleDateString("sv-SE")}
                  </span>
                  <span>
                    <strong>{l.name}</strong>{l.company ? ` · ${l.company}` : ""} <span style={{ color: "var(--granbark-mut)" }}>· {l.email}</span>
                  </span>
                  <span className="vk-mono" style={{ fontSize: 10, color: "var(--granbark-mut)", textTransform: "uppercase" }}>{l.source}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 22, ...card, background: "#14171A", color: "#fff", borderColor: "#14171A" }}>
            <p className="vk-mono" style={{ opacity: 0.55, margin: 0 }}>Extern analys</p>
            <p style={{ marginTop: 6, fontSize: 15 }}>
              Plausible visar besökare, källor och toppsidor i realtid.
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href="https://plausible.io/auroramedia.se"
                target="_blank"
                rel="noreferrer"
                className="vk-btn vk-btn-primary"
                style={{ textDecoration: "none" }}
              >
                Öppna Plausible <ExternalLink size={14} />
              </a>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="vk-btn vk-btn-ghost"
                style={{ textDecoration: "none", background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,.2)" }}
              >
                Search Console <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}

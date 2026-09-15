import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Plus, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type GscRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };
type Data = {
  site: string;
  range: { start: string; end: string };
  totals: GscRow | null;
  queries: GscRow[];
  pages: GscRow[];
};

type RankSnapshot = {
  checked_on: string;
  position: number | null;
  clicks: number;
  impressions: number;
  source: string;
};
type RankKeyword = {
  id: string;
  keyword: string;
  active: boolean;
  latest: RankSnapshot | null;
  previous: RankSnapshot | null;
  movement: number | null;
};
type RankProject = {
  id: string;
  name: string;
  site_url: string;
  domain: string;
  location_name: string | null;
  active: boolean;
  keywords: RankKeyword[];
};
type RankData = { projects: RankProject[]; sync?: { start: string; end: string; results: { project: string; synced: number; error?: string }[] } };

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--linje)",
  borderRadius: 12,
  padding: 20,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--linje)",
  borderRadius: 8,
  padding: "9px 10px",
  fontSize: 13,
  background: "#fff",
};

const Table = ({ title, rows, valueLabel = "sökord" }: { title: string; rows: GscRow[]; valueLabel?: string }) => (
  <div style={card}>
    <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>{title}</p>
    <div style={{ marginTop: 12, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--granbark-mut)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <th style={{ padding: "8px 6px" }}>{valueLabel.toUpperCase()}</th>
            <th style={{ padding: "8px 6px", textAlign: "right" }}>KLICK</th>
            <th style={{ padding: "8px 6px", textAlign: "right" }}>VISN.</th>
            <th style={{ padding: "8px 6px", textAlign: "right" }}>CTR</th>
            <th style={{ padding: "8px 6px", textAlign: "right" }}>POS.</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: "var(--granbark-mut)" }}>Ingen data.</td></tr>}
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--linje)" }}>
              <td style={{ padding: "8px 6px", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.keys?.[0] ?? "—"}</td>
              <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.clicks}</td>
              <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "var(--font-mono)" }}>{r.impressions}</td>
              <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "var(--font-mono)" }}>{(r.ctr * 100).toFixed(1)}%</td>
              <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "var(--font-mono)" }}>{r.position.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const movementLabel = (movement: number | null) => {
  if (movement == null || Math.abs(movement) < 0.05) return <span style={{ color: "var(--granbark-mut)" }}>—</span>;
  if (movement > 0) return <span style={{ color: "#217A4B", display: "inline-flex", alignItems: "center", gap: 3 }}><TrendingUp size={13} /> +{movement.toFixed(1)}</span>;
  return <span style={{ color: "#B4531A", display: "inline-flex", alignItems: "center", gap: 3 }}><TrendingDown size={13} /> {movement.toFixed(1)}</span>;
};

export default function AdminSeo() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [rankErr, setRankErr] = useState<string | null>(null);
  const [rankBusy, setRankBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const [projectForm, setProjectForm] = useState({ name: "", site_url: "https://", location_name: "" });
  const [keywordForm, setKeywordForm] = useState({ project_id: "", keyword: "" });
  const retry = useCallback(() => { setErr(null); setData(null); setTick((t) => t + 1); }, []);

  const loadRank = useCallback(async () => {
    try {
      const result = await adminFetch("admin-rank-tracking", { method: "POST", body: JSON.stringify({ action: "list" }) });
      setRankData(result as RankData);
      setRankErr(null);
    } catch (e) {
      setRankErr(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminFetch("admin-seo", { method: "POST" })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setErr(e); });
    return () => { cancelled = true; };
  }, [tick]);

  useEffect(() => { loadRank(); }, [loadRank]);

  const rankAction = async (payload: Record<string, unknown>) => {
    setRankBusy(true);
    setRankErr(null);
    try {
      const result = await adminFetch("admin-rank-tracking", { method: "POST", body: JSON.stringify(payload) });
      setRankData(result as RankData);
      return true;
    } catch (e) {
      setRankErr(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setRankBusy(false);
    }
  };

  const isEmpty = !!data && !data.totals && (!data.queries || data.queries.length === 0);

  return (
    <AdminShell title="SEO · Search Console" kicker="Admin · sökprestanda">
      <AdminStatus loading={!data && !err} error={err} empty={isEmpty} onRetry={retry} loadingLabel="Hämtar från Google…" />
      {err ? (
        <div style={{ ...card, marginTop: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: "var(--granbark-mut)" }}>
            Kontrollera att domänen <code>auroramedia.se</code> är verifierad i Search Console och att Google-connectorn är kopplad.
          </p>
          <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="vk-btn vk-btn-ghost" style={{ marginTop: 10, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Öppna Search Console <ExternalLink size={14} />
          </a>
        </div>
      ) : null}
      {data && (
        <>
          <p className="vk-mono" style={{ color: "var(--granbark-mut)" }}>
            {data.site} · {data.range.start} → {data.range.end}
          </p>
          {data.totals && (
            <div style={{ marginTop: 14, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              {[
                { label: "Klick", val: data.totals.clicks },
                { label: "Visningar", val: data.totals.impressions },
                { label: "CTR", val: `${(data.totals.ctr * 100).toFixed(1)}%` },
                { label: "Snittposition", val: data.totals.position.toFixed(1) },
              ].map((s) => (
                <div key={s.label} style={card}>
                  <p className="vk-mono" style={{ color: "var(--granbark-mut)", margin: 0 }}>{s.label}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, margin: "6px 0 0" }}>{s.val}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 22, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
            <Table title="Toppsökningar (28d)" rows={data.queries} valueLabel="sökord" />
            <Table title="Toppsidor (28d)" rows={data.pages} valueLabel="sida" />
          </div>
        </>
      )}

      <section style={{ marginTop: 28, ...card }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>AURORA RANK · KLIENTLAGER</p>
            <h2 style={{ margin: "6px 0 0", fontSize: 20 }}>Bevakade sökord</h2>
            <p style={{ margin: "5px 0 0", color: "var(--granbark-mut)", fontSize: 13, maxWidth: 680 }}>
              Sparar verifierade Search Console-positioner över tid för Aurora Media och klienter. Positionen är GSC:s genomsnitt – inte en låtsad city/local-pack-ranking.
            </p>
          </div>
          <button className="vk-btn vk-btn-primary" disabled={rankBusy} onClick={() => rankAction({ action: "sync" })} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={14} className={rankBusy ? "animate-spin" : ""} /> Synka GSC
          </button>
        </div>

        {rankErr && <p role="alert" style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#B4531A0d", color: "#B4531A", fontSize: 13 }}>{rankErr}</p>}

        <div style={{ marginTop: 18, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await rankAction({ action: "create_project", ...projectForm });
              if (ok) setProjectForm({ name: "", site_url: "https://", location_name: "" });
            }}
            style={{ border: "1px solid var(--linje)", borderRadius: 10, padding: 14 }}
          >
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>NY KLIENT / SAJT</p>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              <input required placeholder="Namn, t.ex. Kund AB" value={projectForm.name} onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
              <input required placeholder="https://kund.se/" value={projectForm.site_url} onChange={(e) => setProjectForm((f) => ({ ...f, site_url: e.target.value }))} style={inputStyle} />
              <input placeholder="Marknad (valfritt), t.ex. Linköping" value={projectForm.location_name} onChange={(e) => setProjectForm((f) => ({ ...f, location_name: e.target.value }))} style={inputStyle} />
              <button className="vk-btn" disabled={rankBusy} type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 5, justifyContent: "center" }}><Plus size={14} /> Lägg till sajt</button>
            </div>
          </form>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await rankAction({ action: "add_keyword", ...keywordForm });
              if (ok) setKeywordForm((f) => ({ ...f, keyword: "" }));
            }}
            style={{ border: "1px solid var(--linje)", borderRadius: 10, padding: 14 }}
          >
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>BEVAKA SÖKORD</p>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              <select required value={keywordForm.project_id} onChange={(e) => setKeywordForm((f) => ({ ...f, project_id: e.target.value }))} style={inputStyle}>
                <option value="">Välj sajt…</option>
                {(rankData?.projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input required placeholder="Sökord" value={keywordForm.keyword} onChange={(e) => setKeywordForm((f) => ({ ...f, keyword: e.target.value }))} style={inputStyle} />
              <button className="vk-btn" disabled={rankBusy || !keywordForm.project_id} type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 5, justifyContent: "center" }}><Plus size={14} /> Lägg till sökord</button>
            </div>
          </form>
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {(rankData?.projects ?? []).map((project) => (
            <div key={project.id} style={{ border: "1px solid var(--linje)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", background: "#faf9f6", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div><strong>{project.name}</strong><span style={{ color: "var(--granbark-mut)", fontSize: 12 }}> · {project.domain}{project.location_name ? ` · ${project.location_name}` : ""}</span></div>
                <a href={project.site_url} target="_blank" rel="noreferrer" style={{ color: "var(--gran)", fontSize: 12 }}>Öppna sajt ↗</a>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ textAlign: "left", color: "var(--granbark-mut)", fontFamily: "var(--font-mono)", fontSize: 11 }}><th style={{ padding: "8px 12px" }}>SÖKORD</th><th style={{ padding: "8px 6px", textAlign: "right" }}>POS.</th><th style={{ padding: "8px 6px", textAlign: "right" }}>RÖRELSE</th><th style={{ padding: "8px 12px", textAlign: "right" }}>DATA</th></tr></thead>
                  <tbody>
                    {project.keywords.length === 0 && <tr><td colSpan={4} style={{ padding: 14, color: "var(--granbark-mut)" }}>Inga bevakade sökord ännu.</td></tr>}
                    {project.keywords.map((keyword) => (
                      <tr key={keyword.id} style={{ borderTop: "1px solid var(--linje)", opacity: keyword.active ? 1 : 0.5 }}>
                        <td style={{ padding: "9px 12px" }}>{keyword.keyword}</td>
                        <td style={{ padding: "9px 6px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{keyword.latest?.position == null ? "—" : Number(keyword.latest.position).toFixed(1)}</td>
                        <td style={{ padding: "9px 6px", textAlign: "right", fontFamily: "var(--font-mono)" }}>{movementLabel(keyword.movement)}</td>
                        <td style={{ padding: "9px 12px", textAlign: "right", color: "var(--granbark-mut)", fontSize: 11 }}>{keyword.latest ? `${keyword.latest.checked_on} · GSC` : "Ej synkad"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {rankData && rankData.projects.length === 0 && <p style={{ color: "var(--granbark-mut)", fontSize: 13 }}>Skapa första sajten ovan.</p>}
        </div>
      </section>
    </AdminShell>
  );
}

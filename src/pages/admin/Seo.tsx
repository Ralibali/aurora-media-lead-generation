import { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type GscRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };
type Data = {
  site: string;
  range: { start: string; end: string };
  totals: GscRow | null;
  queries: GscRow[];
  pages: GscRow[];
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--linje)",
  borderRadius: 12,
  padding: 20,
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

export default function AdminSeo() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("admin-seo", { method: "POST" }).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <AdminShell title="SEO · Search Console" kicker="Admin · sökprestanda">
      {!data && !err && <div style={{ display: "flex", gap: 10, color: "var(--granbark-mut)" }}><Loader2 size={16} className="animate-spin" /> Hämtar från Google…</div>}
      {err && (
        <div style={{ ...card, borderColor: "var(--varsel-hover)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertCircle size={18} color="var(--varsel-hover)" />
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Kunde inte hämta Search Console-data.</p>
              <p style={{ fontSize: 13, color: "var(--granbark-mut)", marginTop: 6 }}>{err}</p>
              <p style={{ fontSize: 13, marginTop: 10 }}>
                Kontrollera att domänen <code>auroramedia.se</code> är verifierad i Search Console och att Google-connectorn är kopplad.
              </p>
              <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="vk-btn vk-btn-ghost" style={{ marginTop: 10, textDecoration: "none" }}>
                Öppna Search Console <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
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
    </AdminShell>
  );
}

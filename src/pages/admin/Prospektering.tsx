import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Search, RefreshCw, AlertTriangle } from "lucide-react";
import AdminShell, { ADMIN_STORAGE_KEY } from "@/pages/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

type NeedType = "webb" | "ehandel" | "ai" | "valfritt";

type Campaign = {
  id: string;
  name: string;
  query: string;
  location: string;
  need_type: NeedType;
  industry: string | null;
  result_limit: number;
  status: "draft" | "running" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
};

type Signal = { code: string; label: string };

type Lead = {
  id: string;
  campaign_id: string;
  company_name: string;
  domain: string;
  website_url: string;
  source_url: string;
  city: string | null;
  industry: string | null;
  description: string | null;
  fit_score: number;
  observed_signals: Signal[];
  contact_page_url: string | null;
  status:
    | "new"
    | "reviewed"
    | "contacted"
    | "replied"
    | "qualified"
    | "converted"
    | "rejected"
    | "do_not_contact";
  outreach_note: string | null;
  contacted_at: string | null;
  created_at: string;
};

const STATUSES: Lead["status"][] = [
  "new",
  "reviewed",
  "contacted",
  "replied",
  "qualified",
  "converted",
  "rejected",
  "do_not_contact",
];

const STATUS_LABEL: Record<Lead["status"], string> = {
  new: "Ny",
  reviewed: "Granskad",
  contacted: "Kontaktad",
  replied: "Svarat",
  qualified: "Kvalificerad",
  converted: "Kund",
  rejected: "Avvisad",
  do_not_contact: "Kontakta inte",
};

const NEED_TERMS: Record<NeedType, string> = {
  webb: '("hemsida" OR "webbplats" OR "webbdesign")',
  ehandel: '("e-handel" OR "webshop" OR "onlinebutik")',
  ai: '("automation" OR "AI" OR "manuellt arbete")',
  valfritt: "",
};

function previewQuery(freeText: string, needType: NeedType, industry: string, location: string) {
  const parts = [freeText.trim(), NEED_TERMS[needType], industry.trim() ? `"${industry.trim()}"` : "", location.trim()];
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export default function Prospektering() {
  const [name, setName] = useState("");
  const [freeText, setFreeText] = useState("");
  const [needType, setNeedType] = useState<NeedType>("webb");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("Linköping");
  const [limit, setLimit] = useState<number>(10);
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<Lead["status"] | "">("");
  const [minScore, setMinScore] = useState<number>(0);

  const queryPreview = useMemo(
    () => previewQuery(freeText, needType, industry, location),
    [freeText, needType, industry, location],
  );

  const callFn = async <T,>(payload: Record<string, unknown>): Promise<T> => {
    const pwd = sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? "";
    if (!pwd) throw new Error("Inte inloggad — logga in på nytt.");
    const { data, error } = await supabase.functions.invoke("firecrawl-prospect-search", {
      body: payload,
      headers: { "x-admin-token": pwd },
    });
    if (error) {
      let detail = error.message;
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.text === "function") {
        try {
          const body = await ctx.text();
          if (body) detail = body;
        } catch {
          /* ignore */
        }
      }
      throw new Error(detail);
    }
    return data as T;
  };

  const loadCampaigns = async () => {
    try {
      const r = await callFn<{ campaigns?: Campaign[] }>({ action: "list_campaigns" });
      const list = r?.campaigns ?? [];
      setCampaigns(list);
      if (!selected && list.length) setSelected(list[0].id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const loadLeads = async (campaignId: string) => {
    setLeadsLoading(true);
    try {
      const r = await callFn<{ leads?: Lead[] }>({ action: "list_leads", campaignId });
      setLeads(r?.leads ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    void loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (selected) void loadLeads(selected);
  }, [selected]);

  const runSearch = async () => {
    setErr(null);
    if (!name.trim() || !freeText.trim()) {
      setErr("Kampanjnamn och sökfråga krävs.");
      return;
    }
    setRunning(true);
    try {
      const r = await callFn<{ campaignId?: string }>({
        action: "search",
        campaignName: name.trim(),
        query: freeText.trim(),
        location: location.trim() || "Sweden",
        needType,
        industry: industry.trim() || null,
        limit,
      });
      await loadCampaigns();
      if (r?.campaignId) setSelected(r.campaignId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const updateStatus = async (leadId: string, status: Lead["status"]) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    try {
      await callFn({ action: "update_lead", leadId, status });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      if (selected) await loadLeads(selected);
    }
  };

  const filtered = leads
    .filter((l) => (statusFilter ? l.status === statusFilter : true))
    .filter((l) => l.fit_score >= minScore);

  return (
    <AdminShell title="Prospektering" kicker="Admin · research">
      <div style={{ display: "grid", gap: 24 }}>
        <section
          style={{
            background: "#fff",
            border: "1px solid var(--linje)",
            borderRadius: 14,
            padding: 20,
            display: "grid",
            gap: 14,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Ny sökkampanj</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b6b6b" }}>
              Firecrawl-krediter används vid varje sökning. Inga e-postadresser eller personnamn extraheras.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <Field label="Kampanjnamn">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="T.ex. Bagerier Linköping v1" style={inputStyle} />
            </Field>
            <Field label="Behov">
              <select value={needType} onChange={(e) => setNeedType(e.target.value as NeedType)} style={inputStyle}>
                <option value="webb">Webb / hemsida</option>
                <option value="ehandel">E-handel</option>
                <option value="ai">AI / automation</option>
                <option value="valfritt">Valfritt</option>
              </select>
            </Field>
            <Field label="Bransch (frivilligt)">
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="T.ex. restaurang" style={inputStyle} />
            </Field>
            <Field label="Ort / region">
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Linköping" style={inputStyle} />
            </Field>
            <Field label="Antal">
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={inputStyle}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </Field>
          </div>

          <Field label="Fritext / signalord">
            <textarea
              rows={2}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="T.ex. småföretag med gammal hemsida"
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>

          <div style={{ fontSize: 12, color: "#6b6b6b" }}>
            <span style={{ fontFamily: "var(--font-mono)" }}>PREVIEW:</span>{" "}
            <code style={{ background: "#f5f5f2", padding: "2px 6px", borderRadius: 4 }}>{queryPreview || "—"}</code>
          </div>

          {err && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#B4531A",
                fontSize: 13,
                background: "#fff3ea",
                padding: "8px 12px",
                borderRadius: 8,
              }}
            >
              <AlertTriangle size={16} /> {err}
            </div>
          )}

          <div>
            <button className="vk-btn vk-btn-primary" disabled={running} onClick={runSearch}>
              {running ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}{" "}
              {running ? "Söker…" : "Hitta företag"}
            </button>
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid var(--linje)",
            borderRadius: 14,
            padding: 20,
            display: "grid",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Kampanjer</h2>
            <button className="vk-btn vk-btn-secondary" onClick={() => void loadCampaigns()}>
              <RefreshCw size={14} /> Uppdatera
            </button>
          </div>

          {campaigns.length === 0 && <p style={{ fontSize: 13, color: "#6b6b6b" }}>Inga kampanjer ännu.</p>}
          {campaigns.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Namn</th>
                    <th style={thStyle}>Behov</th>
                    <th style={thStyle}>Ort</th>
                    <th style={thStyle}>Antal</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Skapad</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c.id)}
                      style={{
                        cursor: "pointer",
                        background: selected === c.id ? "#f5f5f2" : "transparent",
                      }}
                    >
                      <td style={tdStyle}>{c.name}</td>
                      <td style={tdStyle}>{c.need_type}</td>
                      <td style={tdStyle}>{c.location}</td>
                      <td style={tdStyle}>{c.result_limit}</td>
                      <td style={tdStyle}>{c.status}{c.error_message ? ` — ${c.error_message.slice(0, 80)}` : ""}</td>
                      <td style={tdStyle}>{new Date(c.created_at).toLocaleString("sv-SE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selected && (
          <section
            style={{
              background: "#fff",
              border: "1px solid var(--linje)",
              borderRadius: 14,
              padding: 20,
              display: "grid",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Hittade företag</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Lead["status"] | "")} style={inputStyle}>
                  <option value="">Alla statusar</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <select value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} style={inputStyle}>
                  <option value={0}>Alla scores</option>
                  <option value={40}>≥ 40</option>
                  <option value={60}>≥ 60</option>
                  <option value={75}>≥ 75</option>
                </select>
              </div>
            </div>

            {leadsLoading && <p style={{ fontSize: 13, color: "#6b6b6b" }}>Laddar…</p>}
            {!leadsLoading && filtered.length === 0 && <p style={{ fontSize: 13, color: "#6b6b6b" }}>Inga träffar.</p>}

            {filtered.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Företag</th>
                      <th style={thStyle}>Webbplats</th>
                      <th style={thStyle}>Ort</th>
                      <th style={thStyle}>Bransch</th>
                      <th style={thStyle}>Fit</th>
                      <th style={thStyle}>Observerade signaler</th>
                      <th style={thStyle}>Kontaktsida</th>
                      <th style={thStyle}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((l) => (
                      <tr key={l.id}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600 }}>{l.company_name}</div>
                          {l.description && (
                            <div style={{ fontSize: 12, color: "#6b6b6b", marginTop: 2 }}>{l.description}</div>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <a href={l.website_url} target="_blank" rel="noreferrer noopener" style={linkStyle}>
                            {l.domain} <ExternalLink size={12} />
                          </a>
                        </td>
                        <td style={tdStyle}>{l.city ?? "—"}</td>
                        <td style={tdStyle}>{l.industry ?? "—"}</td>
                        <td style={tdStyle}><ScoreBadge score={l.fit_score} /></td>
                        <td style={{ ...tdStyle, maxWidth: 260 }}>
                          {l.observed_signals?.length ? (
                            <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: 12 }}>
                              {l.observed_signals.map((s) => (
                                <li key={s.code}>{s.label}</li>
                              ))}
                            </ul>
                          ) : "—"}
                        </td>
                        <td style={tdStyle}>
                          {l.contact_page_url ? (
                            <a href={l.contact_page_url} target="_blank" rel="noreferrer noopener" style={linkStyle}>
                              Öppna <ExternalLink size={12} />
                            </a>
                          ) : "—"}
                        </td>
                        <td style={tdStyle}>
                          <select
                            value={l.status}
                            onChange={(e) => void updateStatus(l.id, e.target.value as Lead["status"])}
                            style={inputStyle}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p style={{ fontSize: 12, color: "#6b6b6b", margin: 0 }}>
              Ingen automatisk kontakt sker och inga e-postadresser samlas in automatiskt. Kontrollera alltid företagets
              behov innan du hör av dig.
            </p>
          </section>
        )}
      </div>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 4, fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", color: "#4a4a4a" }}>
      <span>{label.toUpperCase()}</span>
      {children}
    </label>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "#1f6f3b" : score >= 50 ? "#B4531A" : "#6b6b6b";
  return (
    <span
      style={{
        display: "inline-block",
        minWidth: 34,
        textAlign: "center",
        padding: "2px 8px",
        borderRadius: 999,
        background: `${color}15`,
        color,
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
        fontSize: 12,
      }}
    >
      {score}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid var(--linje)",
  borderRadius: 6,
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  background: "#fff",
};
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid var(--linje)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.08em",
  color: "#4a4a4a",
  textTransform: "uppercase",
};
const tdStyle: React.CSSProperties = { padding: "10px", borderBottom: "1px solid #f0f0ec", verticalAlign: "top" };
const linkStyle: React.CSSProperties = { color: "#14171A", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 };

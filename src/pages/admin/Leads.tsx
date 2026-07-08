import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Lock,
  RefreshCw,
  Search,
  X,
  Download,
  Trash2,
  Mail,
  Phone,
  Copy,
  Send,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { setSEOMeta } from "@/lib/seoHelpers";
import { toast } from "sonner";
import "@/styles/verkstad.css";

const STORAGE_KEY = "faq_analytics_pwd";
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const FUNCTION_URL = `https://${PROJECT_ID}.functions.supabase.co/list-leads`;
const RESEND_URL = `https://${PROJECT_ID}.functions.supabase.co/resend-ai-map-email`;

type Source = "karta" | "kontakt" | "genomlysning";
type Status = "ny" | "kontaktad" | "mote_bokat" | "offert_skickad" | "kund" | "forlorad";

type Lead = {
  id: string;
  source: Source;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  industry: string | null;
  employee_count: string | null;
  pain_areas: string[] | null;
  message: string | null;
  status: Status;
  notes: string | null;
  followup_at: string | null;
  total_score?: number;
  total_potential?: string;
  process_count?: number;
  drip?: {
    unsubscribed_at: string | null;
    unsubscribed_reason: string | null;
    last_step: string | null;
    next_step: string | null;
    steps_sent: number;
  } | null;
  paket?: string;
  platform?: string | null;
  lead_label?: string | null;
  internal_note?: string | null;
};

type Stats = {
  total: number;
  new_this_week: number;
  unhandled: number;
  meetings_booked: number;
  karta_to_booking_pct: number;
};

type Process = {
  id: string;
  process_name: string;
  weekly_time: string;
  score: number;
  potential: string;
  recommended_solution: string;
};

const STATUS_LABEL: Record<Status, string> = {
  ny: "Ny",
  kontaktad: "Kontaktad",
  mote_bokat: "Möte bokat",
  offert_skickad: "Offert skickad",
  kund: "Kund",
  forlorad: "Förlorad",
};

const SOURCE_LABEL: Record<Source, string> = {
  karta: "KARTA",
  kontakt: "KONTAKT",
  genomlysning: "GENOMLYSNING",
};

const SOURCE_STYLE: Record<Source, { bg: string; color: string }> = {
  karta: { bg: "var(--gran-soft)", color: "var(--gran)" },
  kontakt: { bg: "#EBE9E3", color: "#4A5058" },
  genomlysning: { bg: "rgba(232,80,10,.10)", color: "var(--varsel-hover)" },
};

const svDate = (iso: string) =>
  new Date(iso).toLocaleDateString("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit" });

const todayIso = () => new Date().toISOString().slice(0, 10);

const csvEscape = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const Leads = () => {
  const [password, setPassword] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | Source>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [sort, setSort] = useState<"created_at" | "score" | "followup_at">("created_at");

  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ processes: Process[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setSEOMeta({
      title: "Leads · Aurora Media",
      description: "Intern översikt av kontaktförfrågningar.",
      noindex: true,
    });
  }, []);

  const call = async (options: RequestInit & { path?: string } = {}) => {
    const res = await fetch(options.path ?? FUNCTION_URL, {
      ...options,
      headers: {
        Authorization: `Bearer ${password}`,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
    if (res.status === 401) {
      sessionStorage.removeItem(STORAGE_KEY);
      setAuthed(false);
      setError("Fel lösenord.");
      throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const fetchLeads = async (pwd?: string) => {
    const usePwd = pwd ?? password;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${usePwd}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      if (res.status === 401) {
        sessionStorage.removeItem(STORAGE_KEY);
        setAuthed(false);
        setLeads([]);
        setError("Fel lösenord.");
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setLeads(json.leads ?? []);
      setStats(json.stats ?? null);
      setAuthed(true);
      sessionStorage.setItem(STORAGE_KEY, usePwd);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (password) fetchLeads(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (lead: Lead) => {
    setOpenId(lead.id);
    setDetail(null);
    if (lead.source !== "karta") return;
    setDetailLoading(true);
    try {
      const json = await call({
        method: "POST",
        body: JSON.stringify({ action: "detail", source: "karta", id: lead.id }),
      });
      setDetail({ processes: json.processes ?? [] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunde inte hämta detaljer");
    } finally {
      setDetailLoading(false);
    }
  };

  const patchLead = async (
    lead: Lead,
    patch: { status?: Status; notes?: string | null; followup_at?: string | null }
  ) => {
    // optimistisk uppdatering
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, ...patch } : l)));
    try {
      await call({
        method: "POST",
        body: JSON.stringify({ action: "update", id: lead.id, source: lead.source, ...patch }),
      });
    } catch (e) {
      toast.error("Kunde inte spara");
      fetchLeads();
      throw e;
    }
  };

  const deleteLead = async (lead: Lead) => {
    if (!confirm("Raderar permanent inkl. processer och mejlsekvens. Fortsätta?")) return;
    try {
      await call({
        method: "POST",
        body: JSON.stringify({ action: "delete", id: lead.id, source: lead.source }),
      });
      toast.success("Raderat");
      setOpenId(null);
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunde inte radera");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = leads.filter((l) => {
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (q) {
        const hay = `${l.name ?? ""} ${l.company ?? ""} ${l.email ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "score") return (b.total_score ?? -1) - (a.total_score ?? -1);
      if (sort === "followup_at") {
        const av = a.followup_at ? new Date(a.followup_at).getTime() : Infinity;
        const bv = b.followup_at ? new Date(b.followup_at).getTime() : Infinity;
        return av - bv;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [leads, query, sourceFilter, statusFilter, sort]);

  const openLead = leads.find((l) => l.id === openId) ?? null;

  const exportCsv = () => {
    const header = [
      "datum",
      "namn",
      "företag",
      "mejl",
      "telefon",
      "källa",
      "status",
      "potential",
      "anteckningar",
    ];
    const rows = filtered.map((l) =>
      [
        svDate(l.created_at),
        l.name,
        l.company ?? "",
        l.email,
        l.phone ?? "",
        SOURCE_LABEL[l.source],
        STATUS_LABEL[l.status] ?? l.status,
        l.total_potential ?? "",
        l.notes ?? "",
      ]
        .map(csvEscape)
        .join(";")
    );
    const blob = new Blob(["\uFEFF" + [header.join(";"), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${todayIso()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div
        className="verkstad"
        style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchLeads(password);
          }}
          style={{
            width: "100%",
            maxWidth: 380,
            background: "#fff",
            border: "1px solid var(--linje)",
            borderRadius: 14,
            padding: 28,
            display: "grid",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Lock size={18} color="var(--gran)" />
            <h1 style={{ fontSize: 22, margin: 0 }}>Leads · inloggning</h1>
          </div>
          <input
            type="password"
            placeholder="Lösenord"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid var(--linje)",
              borderRadius: 8,
              fontFamily: "var(--font-sans)",
              fontSize: 15,
            }}
          />
          {error && <p style={{ color: "var(--varsel-hover)", fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" className="vk-btn vk-btn-primary" disabled={loading || !password}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Logga in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="verkstad" style={{ minHeight: "100vh" }}>
      <main>
        <div className="vk-wrap" style={{ paddingBlock: 40 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p className="vk-mono">Admin · leadhantering</p>
              <h1 style={{ marginTop: 8, fontSize: "clamp(36px, 5vw, 52px)" }}>Leads</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="vk-btn vk-btn-ghost" onClick={exportCsv}>
                <Download size={14} /> Exportera CSV
              </button>
              <button className="vk-btn vk-btn-ghost" onClick={() => fetchLeads()} disabled={loading}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Uppdatera
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div
              style={{
                marginTop: 28,
                display: "grid",
                gap: 14,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              {[
                { label: "Nya denna vecka", val: stats.new_this_week },
                { label: "Obehandlade", val: stats.unhandled },
                { label: "Möten bokade", val: stats.meetings_booked },
                { label: "Karta → bokning", val: `${stats.karta_to_booking_pct}%` },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--linje)",
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}
                >
                  <p className="vk-mono" style={{ color: "var(--granbark-mut)" }}>{s.label}</p>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 32,
                      fontWeight: 700,
                      color: "var(--granbark)",
                      margin: "6px 0 0",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.val}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div
            style={{
              marginTop: 28,
              display: "grid",
              gap: 12,
              gridTemplateColumns: "1fr",
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff",
                  border: "1px solid var(--linje)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  flex: "1 1 260px",
                }}
              >
                <Search size={15} color="var(--granbark-mut)" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Sök namn, företag eller mejl"
                  style={{
                    border: 0,
                    outline: 0,
                    background: "transparent",
                    width: "100%",
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    color: "var(--granbark)",
                  }}
                />
                {query && (
                  <button onClick={() => setQuery("")} aria-label="Rensa" style={{ border: 0, background: "transparent", cursor: "pointer" }}>
                    <X size={14} color="var(--granbark-mut)" />
                  </button>
                )}
              </div>

              <Select
                value={sourceFilter}
                onChange={(v) => setSourceFilter(v as typeof sourceFilter)}
                options={[
                  { value: "all", label: "Alla källor" },
                  { value: "karta", label: "AI-karta" },
                  { value: "kontakt", label: "Kontakt" },
                  { value: "genomlysning", label: "Genomlysning" },
                ]}
              />
              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as typeof statusFilter)}
                options={[
                  { value: "all", label: "Alla statusar" },
                  ...(Object.keys(STATUS_LABEL) as Status[]).map((s) => ({ value: s, label: STATUS_LABEL[s] })),
                ]}
              />
              <Select
                value={sort}
                onChange={(v) => setSort(v as typeof sort)}
                options={[
                  { value: "created_at", label: "Sortera: Datum" },
                  { value: "score", label: "Sortera: Score" },
                  { value: "followup_at", label: "Sortera: Följ upp" },
                ]}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: "var(--varsel-hover)", marginTop: 20, fontSize: 14 }}>{error}</p>
          )}

          {/* List */}
          <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  background: "#fff",
                  border: "1px dashed var(--linje)",
                  borderRadius: 12,
                  color: "var(--granbark-mut)",
                }}
              >
                Inga leads matchar filtret.
              </div>
            ) : (
              filtered.map((l) => <LeadRow key={l.id} lead={l} onOpen={() => openDetail(l)} onStatus={(s) => patchLead(l, { status: s })} />)
            )}
          </div>
        </div>
      </main>

      {openLead && (
        <DetailDrawer
          lead={openLead}
          processes={detail?.processes ?? []}
          loading={detailLoading}
          onClose={() => setOpenId(null)}
          onPatch={(patch) => patchLead(openLead, patch)}
          onDelete={() => deleteLead(openLead)}
          onResendMap={async () => {
            if (openLead.source !== "karta") return;
            const top3 = (detail?.processes ?? [])
              .slice()
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map((p) => ({
                process_name: p.process_name,
                potential: p.potential,
                recommended_solution: p.recommended_solution,
              }));
            try {
              const res = await fetch(RESEND_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: openLead.email,
                  contact_name: openLead.name,
                  company_name: openLead.company ?? "",
                  total_potential: openLead.total_potential ?? "",
                  top3,
                }),
              });
              if (!res.ok) throw new Error(await res.text());
              toast.success("Kartmejlet skickat");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Kunde inte skicka");
            }
          }}
        />
      )}
    </div>
  );
};

/* ─────────────── UI-hjälpare ─────────────── */

const Select = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div
    style={{
      position: "relative",
      background: "#fff",
      border: "1px solid var(--linje)",
      borderRadius: 10,
    }}
  >
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        appearance: "none",
        WebkitAppearance: "none",
        border: 0,
        background: "transparent",
        padding: "10px 34px 10px 14px",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: "var(--granbark)",
        cursor: "pointer",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown
      size={14}
      color="var(--granbark-mut)"
      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
    />
  </div>
);

const SourceBadge = ({ source }: { source: Source }) => {
  const s = SOURCE_STYLE[source];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".08em",
      }}
    >
      {SOURCE_LABEL[source]}
    </span>
  );
};

const ScoreBar = ({ score, potential }: { score?: number; potential?: string }) => {
  if (typeof score !== "number") return null;
  const max = 30;
  const pct = Math.min(100, Math.round((score / max) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
      <div
        style={{
          height: 6,
          width: 80,
          background: "#EBE9E3",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--gran)" }} />
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--granbark-mut)" }}>
        {potential ?? score}
      </span>
    </div>
  );
};

const LeadRow = ({
  lead,
  onOpen,
  onStatus,
}: {
  lead: Lead;
  onOpen: () => void;
  onStatus: (s: Status) => void;
}) => {
  const overdue =
    lead.followup_at && new Date(lead.followup_at).getTime() <= Date.now();
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--linje)",
        borderRadius: 12,
        padding: "14px 16px",
        display: "grid",
        gap: 12,
        gridTemplateColumns: "minmax(0, 1fr)",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "minmax(0, 1fr)",
          }}
        >
          <button
            onClick={onOpen}
            style={{
              background: "transparent",
              border: 0,
              padding: 0,
              textAlign: "left",
              cursor: "pointer",
              display: "grid",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {overdue && (
                <span
                  aria-label="Uppföljning förfallen"
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--varsel)", display: "inline-block",
                  }}
                />
              )}
              <span style={{ fontWeight: 600, fontSize: 15 }}>{lead.name}</span>
              {lead.company && (
                <span style={{ color: "var(--granbark-mut)", fontSize: 14 }}>· {lead.company}</span>
              )}
              <SourceBadge source={lead.source} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", color: "var(--granbark-mut)", fontSize: 13 }}>
              <span className="vk-mono" style={{ fontSize: 11 }}>{svDate(lead.created_at)}</span>
              <span>{lead.email}</span>
              {lead.industry && <span>· {lead.industry}</span>}
              {lead.drip?.last_step && (
                <span className="vk-mono" style={{ fontSize: 10, color: "var(--gran)" }}>
                  Drip: {lead.drip.last_step} skickat{lead.drip.next_step ? ` · nästa ${lead.drip.next_step}` : ""}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        {lead.source === "karta" && (
          <ScoreBar score={lead.total_score} potential={lead.total_potential} />
        )}
        <StatusSelect value={lead.status} onChange={onStatus} />
        {lead.followup_at && (
          <span
            className="vk-mono"
            style={{
              fontSize: 11,
              color: overdue ? "var(--varsel-hover)" : "var(--granbark-mut)",
            }}
          >
            Följ upp: {svDate(lead.followup_at)}
          </span>
        )}
        <button
          className="vk-btn vk-btn-ghost"
          style={{ padding: "8px 14px", fontSize: 13, marginLeft: "auto" }}
          onClick={onOpen}
        >
          Öppna
        </button>
      </div>
    </div>
  );
};

const StatusSelect = ({ value, onChange }: { value: Status; onChange: (s: Status) => void }) => (
  <Select
    value={value}
    onChange={(v) => onChange(v as Status)}
    options={(Object.keys(STATUS_LABEL) as Status[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
  />
);

/* ─────────────── Detaljpanel ─────────────── */

const DetailDrawer = ({
  lead,
  processes,
  loading,
  onClose,
  onPatch,
  onDelete,
  onResendMap,
}: {
  lead: Lead;
  processes: Process[];
  loading: boolean;
  onClose: () => void;
  onPatch: (patch: { status?: Status; notes?: string | null; followup_at?: string | null }) => Promise<void>;
  onDelete: () => void;
  onResendMap: () => void;
}) => {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [followup, setFollowup] = useState(lead.followup_at ?? "");
  const notesTimer = useRef<number | null>(null);

  useEffect(() => {
    setNotes(lead.notes ?? "");
    setFollowup(lead.followup_at ?? "");
  }, [lead.id]);

  const scheduleNotesSave = (val: string) => {
    setNotes(val);
    if (notesTimer.current) window.clearTimeout(notesTimer.current);
    notesTimer.current = window.setTimeout(() => {
      onPatch({ notes: val || null }).then(() => toast.success("Anteckning sparad", { duration: 1200 }));
    }, 800);
  };

  const setFollowupAndSave = (val: string) => {
    setFollowup(val);
    onPatch({ followup_at: val || null });
  };

  const copyShareLink = () => {
    // Ingen share_token finns i schemat; kopiera lead-id istället som referens.
    navigator.clipboard.writeText(lead.id);
    toast.success("Lead-ID kopierat");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        display: "flex", justifyContent: "flex-end",
      }}
    >
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(20,23,26,.5)" }}
      />
      <aside
        style={{
          position: "relative",
          width: "min(560px, 100%)",
          height: "100%",
          background: "var(--bjork)",
          borderLeft: "1px solid var(--linje)",
          overflowY: "auto",
          padding: "28px 28px 60px",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <SourceBadge source={lead.source} />
          <button
            onClick={onClose}
            aria-label="Stäng"
            style={{ background: "transparent", border: 0, cursor: "pointer", padding: 4 }}
          >
            <X size={20} color="var(--granbark)" />
          </button>
        </div>

        <h2 style={{ marginTop: 16, fontSize: 28 }}>{lead.name}</h2>
        {lead.company && (
          <p style={{ margin: "4px 0 0", color: "var(--granbark-mut)" }}>{lead.company}</p>
        )}
        <p className="vk-mono" style={{ marginTop: 8 }}>
          Registrerat {svDate(lead.created_at)}
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
          <a href={`mailto:${lead.email}`} className="vk-btn vk-btn-ghost" style={{ padding: "10px 14px", fontSize: 13 }}>
            <Mail size={14} /> {lead.email}
          </a>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="vk-btn vk-btn-ghost" style={{ padding: "10px 14px", fontSize: 13 }}>
              <Phone size={14} /> {lead.phone}
            </a>
          )}
          {lead.source === "karta" && (
            <>
              <button onClick={copyShareLink} className="vk-btn vk-btn-ghost" style={{ padding: "10px 14px", fontSize: 13 }}>
                <Copy size={14} /> Kopiera kartlänk
              </button>
              <button onClick={onResendMap} className="vk-btn vk-btn-ghost" style={{ padding: "10px 14px", fontSize: 13 }}>
                <Send size={14} /> Skicka om kartmejlet
              </button>
            </>
          )}
        </div>

        {/* Status + followup */}
        <div style={{ marginTop: 24, display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
          <Field label="Status">
            <StatusSelect value={lead.status} onChange={(s) => onPatch({ status: s })} />
          </Field>
          <Field label="Följ upp">
            <input
              type="date"
              value={followup}
              onChange={(e) => setFollowupAndSave(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#fff",
                border: "1px solid var(--linje)",
                borderRadius: 10,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--granbark)",
              }}
            />
          </Field>
        </div>

        {/* Fields */}
        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          {lead.industry && <Meta label="Bransch" value={lead.industry} />}
          {lead.employee_count && <Meta label="Anställda" value={lead.employee_count} />}
          {lead.pain_areas && lead.pain_areas.length > 0 && (
            <Meta label="Smärtor" value={lead.pain_areas.join(", ")} />
          )}
          {typeof lead.total_score === "number" && (
            <Meta label="AI-potential" value={`${lead.total_potential} · score ${lead.total_score}`} />
          )}
          {lead.paket && <Meta label="Paket" value={lead.paket} />}
          {lead.platform && <Meta label="Plattform" value={lead.platform} />}
          {lead.lead_label && <Meta label="Lead-etikett" value={lead.lead_label} />}
          {lead.internal_note && <Meta label="Internt (formulär)" value={lead.internal_note} />}
          {lead.message && <Meta label="Meddelande" value={lead.message} multiline />}
          {lead.drip && (
            <Meta
              label="Drip-status"
              value={
                lead.drip.unsubscribed_at
                  ? `Avregistrerad (${lead.drip.unsubscribed_reason ?? "—"})`
                  : `${lead.drip.steps_sent} steg skickade${lead.drip.next_step ? ` · nästa ${lead.drip.next_step}` : ""}`
              }
            />
          )}
        </div>

        {/* Processer */}
        {lead.source === "karta" && (
          <section style={{ marginTop: 28 }}>
            <p className="vk-mono">Processer</p>
            {loading ? (
              <div style={{ padding: 16, color: "var(--granbark-mut)" }}>
                <Loader2 size={16} className="animate-spin" />
              </div>
            ) : processes.length === 0 ? (
              <p style={{ color: "var(--granbark-mut)", fontSize: 14, marginTop: 8 }}>
                Inga processer registrerade.
              </p>
            ) : (
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {processes.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "#fff",
                      border: "1px solid var(--linje)",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{p.process_name}</span>
                      <span className="vk-mono" style={{ fontSize: 11, color: "var(--granbark-mut)" }}>
                        {p.weekly_time}
                      </span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <ScoreBar score={p.score} potential={p.potential} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Anteckningar */}
        <section style={{ marginTop: 28 }}>
          <p className="vk-mono">Anteckningar</p>
          <textarea
            value={notes}
            onChange={(e) => scheduleNotesSave(e.target.value)}
            placeholder="Sparas automatiskt…"
            rows={6}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "12px 14px",
              background: "#fff",
              border: "1px solid var(--linje)",
              borderRadius: 10,
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--granbark)",
              resize: "vertical",
            }}
          />
        </section>

        <div style={{ marginTop: 32, borderTop: "1px solid var(--linje)", paddingTop: 20 }}>
          <button
            onClick={onDelete}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid var(--varsel)",
              color: "var(--varsel-hover)",
              borderRadius: 999, cursor: "pointer",
              fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
            }}
          >
            <Trash2 size={14} /> Radera lead
          </button>
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--granbark-mut)", display: "flex", gap: 6, alignItems: "center" }}>
            <AlertCircle size={12} />
            Raderar permanent inkl. processer och mejlsekvens.
          </p>
        </div>
      </aside>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="vk-mono" style={{ marginBottom: 6 }}>{label}</p>
    {children}
  </div>
);

const Meta = ({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid var(--linje)",
      borderRadius: 10,
      padding: "10px 14px",
    }}
  >
    <p className="vk-mono" style={{ color: "var(--granbark-mut)", marginBottom: 4 }}>{label}</p>
    <p style={{ margin: 0, fontSize: 14, whiteSpace: multiline ? "pre-wrap" : "normal" }}>{value}</p>
  </div>
);

export default Leads;

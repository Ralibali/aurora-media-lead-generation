import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Loader2,
  Radar,
  RefreshCw,
  Search,
  ShieldOff,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import AdminShell, { ADMIN_STORAGE_KEY } from "@/pages/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type NeedType = "webb" | "ehandel" | "ai" | "valfritt";

type CampaignStatus = "draft" | "running" | "completed" | "failed";

type Campaign = {
  id: string;
  name: string;
  query: string;
  location: string;
  need_type: NeedType;
  industry: string | null;
  result_limit: number;
  status: CampaignStatus;
  error_message: string | null;
  created_at: string;
};

type Signal = { signal: string; evidence: string; points: number };

type LeadStatus =
  | "new"
  | "reviewed"
  | "contacted"
  | "replied"
  | "qualified"
  | "converted"
  | "rejected"
  | "do_not_contact";

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
  status: LeadStatus;
  outreach_note: string | null;
  contacted_at: string | null;
  created_at: string;
};

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "reviewed",
  "contacted",
  "replied",
  "qualified",
  "converted",
  "rejected",
  "do_not_contact",
];

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Ny",
  reviewed: "Granskad",
  contacted: "Kontaktad",
  replied: "Svarat",
  qualified: "Kvalificerad",
  converted: "Kund",
  rejected: "Avvisad",
  do_not_contact: "Kontakta inte",
};

const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Utkast",
  running: "Söker",
  completed: "Klar",
  failed: "Misslyckad",
};

const NEED_LABEL: Record<NeedType, string> = {
  webb: "Webb / hemsida",
  ehandel: "E-handel",
  ai: "AI / automation",
  valfritt: "Valfritt",
};

const NEED_TERMS: Record<NeedType, string> = {
  webb: '("hemsida" OR "webbplats" OR "webbdesign")',
  ehandel: '("e-handel" OR "webshop" OR "onlinebutik")',
  ai: '("automation" OR "AI" OR "manuellt arbete")',
  valfritt: "",
};

const INDUSTRY_QUICK: { label: string; value: string }[] = [
  { label: "Restaurang", value: "restaurang" },
  { label: "Bygg", value: "byggföretag" },
  { label: "E-handel", value: "e-handel" },
  { label: "Hotell", value: "hotell" },
  { label: "Redovisning", value: "redovisningsbyrå" },
  { label: "Vård", value: "vårdmottagning" },
  { label: "Annat", value: "" },
];

type QuickFilter = "all" | "new" | "qualified" | "do_not_contact";
type SortKey = "score_desc" | "score_asc" | "name" | "newest";

function previewQuery(freeText: string, needType: NeedType, industry: string, location: string) {
  const parts = [freeText.trim(), NEED_TERMS[needType], industry.trim() ? `"${industry.trim()}"` : "", location.trim()];
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

function suggestName(industry: string, needType: NeedType, location: string) {
  const ind = industry.trim();
  const loc = location.trim();
  const need = NEED_LABEL[needType].split(" ")[0];
  const bits = [ind ? ind[0].toUpperCase() + ind.slice(1) : null, loc || null, need].filter(Boolean);
  if (bits.length === 0) return "";
  return `${bits.join(" · ")}`;
}

const svDateTime = (iso: string) =>
  new Date(iso).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });

export default function Prospektering() {
  const [freeText, setFreeText] = useState("");
  const [needType, setNeedType] = useState<NeedType>("webb");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("Linköping");
  const [limit, setLimit] = useState<number>(10);

  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);

  const [running, setRunning] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const [campaignQuery, setCampaignQuery] = useState("");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<CampaignStatus | "all">("all");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  const [leadQuery, setLeadQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [sortKey, setSortKey] = useState<SortKey>("score_desc");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [savingLead, setSavingLead] = useState<Record<string, "saving" | "saved" | "error" | undefined>>({});

  // Auto-suggest campaign name (without overwriting manual edits)
  useEffect(() => {
    if (nameTouched) return;
    setName(suggestName(industry, needType, location));
  }, [industry, needType, location, nameTouched]);

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

  const loadCampaigns = async (opts: { keepSelection?: boolean } = {}) => {
    setCampaignsLoading(true);
    setCampaignsError(null);
    try {
      const r = await callFn<{ campaigns?: Campaign[] }>({ action: "list_campaigns" });
      const list = r?.campaigns ?? [];
      setCampaigns(list);
      if (!opts.keepSelection && !selected && list.length) setSelected(list[0].id);
    } catch (e) {
      setCampaignsError(e instanceof Error ? e.message : String(e));
    } finally {
      setCampaignsLoading(false);
    }
  };

  const loadLeads = async (campaignId: string) => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const r = await callFn<{ leads?: Lead[] }>({ action: "list_leads", campaignId });
      setLeads(r?.leads ?? []);
    } catch (e) {
      setLeadsError(e instanceof Error ? e.message : String(e));
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
    else setLeads([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const requiredMissing = !name.trim() || !freeText.trim();

  const runSearch = async () => {
    setErr(null);
    if (requiredMissing) {
      setErr("Kampanjnamn och sökfråga krävs.");
      return;
    }
    setRunning(true);
    try {
      const r = await callFn<{ campaignId?: string; leadsFound?: number }>({
        action: "search",
        campaignName: name.trim(),
        query: freeText.trim(),
        location: location.trim() || "Sweden",
        needType,
        industry: industry.trim() || null,
        limit,
      });
      await loadCampaigns({ keepSelection: true });
      if (r?.campaignId) setSelected(r.campaignId);
      const count = typeof r?.leadsFound === "number" ? r.leadsFound : null;
      toast.success(count != null ? `Hittade ${count} företag` : "Sökningen är klar", {
        description: name.trim(),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      toast.error("Sökningen misslyckades", { description: msg.slice(0, 200) });
    } finally {
      setRunning(false);
    }
  };

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    setSavingLead((s) => ({ ...s, [leadId]: "saving" }));
    try {
      await callFn({ action: "update_lead", leadId, status });
      setSavingLead((s) => ({ ...s, [leadId]: "saved" }));
      setTimeout(() => setSavingLead((s) => ({ ...s, [leadId]: undefined })), 1500);
    } catch (e) {
      setSavingLead((s) => ({ ...s, [leadId]: "error" }));
      toast.error("Kunde inte spara status", { description: e instanceof Error ? e.message : String(e) });
      if (selected) await loadLeads(selected);
    }
  };

  // Kampanjfilter
  const filteredCampaigns = useMemo(() => {
    const q = campaignQuery.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (campaignStatusFilter !== "all" && c.status !== campaignStatusFilter) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [campaigns, campaignQuery, campaignStatusFilter]);

  // Leadfilter
  const filteredLeads = useMemo(() => {
    const q = leadQuery.trim().toLowerCase();
    let list = leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (l.fit_score < minScore) return false;
      if (quickFilter === "new" && l.status !== "new") return false;
      if (quickFilter === "qualified" && l.status !== "qualified") return false;
      if (quickFilter === "do_not_contact" && l.status !== "do_not_contact") return false;
      if (q) {
        const hay = `${l.company_name} ${l.domain} ${l.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "score_desc":
          return b.fit_score - a.fit_score;
        case "score_asc":
          return a.fit_score - b.fit_score;
        case "name":
          return a.company_name.localeCompare(b.company_name, "sv");
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return list;
  }, [leads, leadQuery, statusFilter, minScore, sortKey, quickFilter]);

  const stats = useMemo(() => {
    const total = leads.length;
    const news = leads.filter((l) => l.status === "new").length;
    const qualified = leads.filter((l) => l.status === "qualified").length;
    const avg = total ? Math.round(leads.reduce((sum, l) => sum + l.fit_score, 0) / total) : 0;
    return { total, news, qualified, avg };
  }, [leads]);

  const selectedCampaign = campaigns.find((c) => c.id === selected) ?? null;



  return (
    <AdminShell title="Prospektering" kicker="Admin · research">
      <div className="grid gap-6">
        {/* Intro */}
        <div className="rounded-xl border border-[var(--linje)] bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[var(--gran-soft)] p-2 text-[var(--gran)]">
              <Radar size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="m-0 text-lg font-semibold">Företagsresearch med Firecrawl</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Sök efter potentiella kunder och gör din egen bedömning innan du hör av dig.
                Ingen kontakt sker automatiskt och inga e-postadresser eller personnamn samlas in.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Företag" value={stats.total} subtitle={selectedCampaign?.name ?? "Ingen kampanj vald"} />
          <SummaryCard label="Nya" value={stats.news} />
          <SummaryCard label="Kvalificerade" value={stats.qualified} />
          <SummaryCard label="Snitt-score" value={selectedCampaign ? stats.avg : 0} suffix={selectedCampaign ? "/100" : ""} />
        </div>

        {/* Sökformulär */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles size={16} className="text-[var(--gran)]" /> Ny sökkampanj
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Steg 1 */}
            <section className="grid gap-3">
              <StepHeader step={1} title="Vad söker du?" />
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="pf-need">Behov</Label>
                  <Select value={needType} onValueChange={(v) => setNeedType(v as NeedType)}>
                    <SelectTrigger id="pf-need"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(NEED_LABEL) as NeedType[]).map((n) => (
                        <SelectItem key={n} value={n}>{NEED_LABEL[n]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="pf-industry">Bransch (frivilligt)</Label>
                  <Input
                    id="pf-industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="T.ex. restaurang"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_QUICK.map((chip) => {
                  const active = industry.trim().toLowerCase() === chip.value.toLowerCase() && chip.value !== "";
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setIndustry(chip.value)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        active
                          ? "border-[var(--gran)] bg-[var(--gran-soft)] text-[var(--gran)]"
                          : "border-[var(--linje)] bg-white text-neutral-600 hover:border-neutral-400",
                      )}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pf-freetext">Fritext / signalord</Label>
                <Textarea
                  id="pf-freetext"
                  rows={2}
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="T.ex. småföretag med gammal hemsida"
                  aria-required="true"
                />
              </div>
            </section>

            {/* Steg 2 */}
            <section className="grid gap-3">
              <StepHeader step={2} title="Var och hur många?" />
              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="pf-location">Ort / region</Label>
                  <Input
                    id="pf-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Linköping"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="pf-limit">Antal företag</Label>
                  <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                    <SelectTrigger id="pf-limit"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="pf-name">Kampanjnamn</Label>
                  <Input
                    id="pf-name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameTouched(true); }}
                    placeholder="T.ex. Bagerier Linköping v1"
                    aria-required="true"
                  />
                </div>
              </div>
            </section>

            <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
              <CollapsibleTrigger className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800">
                {previewOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Visa sökfråge-preview
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <code className="block rounded-md bg-neutral-100 px-3 py-2 font-mono text-xs text-neutral-700 break-all">
                  {queryPreview || "—"}
                </code>
              </CollapsibleContent>
            </Collapsible>

            <Alert className="border-[var(--linje)] bg-neutral-50 text-neutral-700">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Firecrawl-krediter används vid varje sökning. Inga personnamn eller e-postadresser samlas in.
                Ingen kontakt sker automatiskt.
              </AlertDescription>
            </Alert>

            {err && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{err}</AlertDescription>
              </Alert>
            )}

            <div className="pt-1">
              <Button
                onClick={runSearch}
                disabled={running || requiredMissing}
                className="w-full md:w-auto"
                size="lg"
              >
                {running ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Search size={16} className="mr-2" />}
                {running ? "Söker…" : "Hitta företag"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kampanjhistorik */}
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3">
            <CardTitle className="text-base">Kampanjer</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  aria-label="Sök kampanj"
                  value={campaignQuery}
                  onChange={(e) => setCampaignQuery(e.target.value)}
                  placeholder="Sök kampanj…"
                  className="h-9 w-44 pl-8"
                />
              </div>
              <Select
                value={campaignStatusFilter}
                onValueChange={(v) => setCampaignStatusFilter(v as CampaignStatus | "all")}
              >
                <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla statusar</SelectItem>
                  {(Object.keys(CAMPAIGN_STATUS_LABEL) as CampaignStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{CAMPAIGN_STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => void loadCampaigns({ keepSelection: true })}>
                <RefreshCw size={14} className="mr-1.5" /> Uppdatera
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {campaignsLoading && (
              <div className="grid gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            )}
            {!campaignsLoading && campaignsError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{campaignsError}</AlertDescription>
              </Alert>
            )}
            {!campaignsLoading && !campaignsError && filteredCampaigns.length === 0 && (
              <p className="rounded-md border border-dashed border-[var(--linje)] p-6 text-center text-sm text-neutral-500">
                {campaigns.length === 0
                  ? "Inga kampanjer ännu. Skapa din första sökning ovan."
                  : "Inga kampanjer matchar filtreringen."}
              </p>
            )}
            {!campaignsLoading && !campaignsError && filteredCampaigns.length > 0 && (
              <div className="grid gap-2">
                {filteredCampaigns.map((c) => {
                  const active = selected === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelected(c.id)}
                      aria-pressed={active}
                      className={cn(
                        "grid gap-2 rounded-lg border p-3 text-left transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gran)] focus-visible:ring-offset-2",
                        active
                          ? "border-[var(--gran)] bg-[var(--gran-soft)]"
                          : "border-[var(--linje)] bg-white hover:border-neutral-400",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-semibold">{c.name}</span>
                          <CampaignStatusBadge status={c.status} />
                        </div>
                        <span className="font-mono text-[11px] text-neutral-500">{svDateTime(c.created_at)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
                        <span>{c.location || "—"}</span>
                        <span>· {NEED_LABEL[c.need_type]}</span>
                        {c.industry && <span>· {c.industry}</span>}
                        <span>· max {c.result_limit}</span>
                      </div>
                      {c.error_message && (
                        <p className="line-clamp-2 text-xs text-red-700">{c.error_message}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads */}
        {selected && (
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3">
              <div className="min-w-0">
                <CardTitle className="text-base">
                  {selectedCampaign?.name ?? "Hittade företag"}
                </CardTitle>
                <p className="mt-1 text-xs text-neutral-500">
                  Visar {filteredLeads.length} av {leads.length} företag
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selected && void loadLeads(selected)}
                disabled={leadsLoading}
              >
                <RefreshCw size={14} className={cn("mr-1.5", leadsLoading && "animate-spin")} /> Uppdatera
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4">
              {/* Snabbfilter */}
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Snabbfilter">
                {([
                  { k: "all", label: "Alla", count: leads.length },
                  { k: "new", label: "Nya", count: leads.filter((l) => l.status === "new").length },
                  { k: "qualified", label: "Kvalificerade", count: leads.filter((l) => l.status === "qualified").length },
                  { k: "do_not_contact", label: "Kontakta inte", count: leads.filter((l) => l.status === "do_not_contact").length },
                ] as { k: QuickFilter; label: string; count: number }[]).map((q) => {
                  const active = quickFilter === q.k;
                  return (
                    <button
                      key={q.k}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setQuickFilter(q.k)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                        active
                          ? "border-[var(--gran)] bg-[var(--gran-soft)] text-[var(--gran)]"
                          : "border-[var(--linje)] bg-white text-neutral-600 hover:border-neutral-400",
                      )}
                    >
                      {q.label}
                      <span className={cn("rounded-full px-1.5 py-0.5 font-mono text-[10px]", active ? "bg-white/60" : "bg-neutral-100")}>
                        {q.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Kontroller */}
              <div className="grid gap-2 md:grid-cols-[1fr,auto,auto,auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    aria-label="Sök företag"
                    value={leadQuery}
                    onChange={(e) => setLeadQuery(e.target.value)}
                    placeholder="Sök företag, domän eller beskrivning…"
                    className="h-9 pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
                  <SelectTrigger className="h-9 w-full md:w-40" aria-label="Status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla statusar</SelectItem>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(minScore)} onValueChange={(v) => setMinScore(Number(v))}>
                  <SelectTrigger className="h-9 w-full md:w-36" aria-label="Minsta score"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Alla scores</SelectItem>
                    <SelectItem value="40">≥ 40</SelectItem>
                    <SelectItem value="60">≥ 60</SelectItem>
                    <SelectItem value="75">≥ 75</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <SelectTrigger className="h-9 w-full md:w-44" aria-label="Sortering"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score_desc">Högst score</SelectItem>
                    <SelectItem value="score_asc">Lägst score</SelectItem>
                    <SelectItem value="name">Företagsnamn</SelectItem>
                    <SelectItem value="newest">Nyast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* States */}
              {leadsLoading && (
                <div className="grid gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              )}
              {!leadsLoading && leadsError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{leadsError}</AlertDescription>
                </Alert>
              )}
              {!leadsLoading && !leadsError && filteredLeads.length === 0 && (
                <p className="rounded-md border border-dashed border-[var(--linje)] p-6 text-center text-sm text-neutral-500">
                  Inga träffar med aktuella filter.
                </p>
              )}

              {!leadsLoading && !leadsError && filteredLeads.length > 0 && (
                <>
                  {/* Desktop tabell */}
                  <div className="hidden lg:block overflow-hidden rounded-lg border border-[var(--linje)]">
                    <div className="max-h-[70vh] overflow-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-neutral-50">
                          <tr className="text-left">
                            <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-neutral-600">Företag</th>
                            <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-neutral-600">Ort / Bransch</th>
                            <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-neutral-600">Fit</th>
                            <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-neutral-600">Länkar</th>
                            <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-neutral-600 min-w-[180px]">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeads.map((l) => {
                            const isDnc = l.status === "do_not_contact";
                            const isOpen = !!expanded[l.id];
                            return (
                                <tr
                                  key={l.id}
                                  className={cn(
                                    "border-t border-[var(--linje)] align-top",
                                    isDnc && "bg-neutral-50",
                                  )}
                                >

                                  <td className="px-3 py-3">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className={cn("font-semibold", isDnc && "text-neutral-500 line-through decoration-neutral-400")}>
                                          {l.company_name}
                                        </span>
                                        {isDnc && (
                                          <Badge variant="outline" className="gap-1 border-neutral-300 text-neutral-500">
                                            <ShieldOff size={11} /> Kontakta inte
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-xs text-neutral-500">{l.domain}</span>
                                      {l.description && (
                                        <p className="max-w-md text-xs text-neutral-600">{l.description}</p>
                                      )}
                                      {l.observed_signals?.length > 0 && (
                                        <Collapsible open={isOpen} onOpenChange={(o) => setExpanded((s) => ({ ...s, [l.id]: o }))}>
                                          <CollapsibleTrigger className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--gran)] hover:underline">
                                            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            {l.observed_signals.length} observerade signaler
                                          </CollapsibleTrigger>
                                          <CollapsibleContent className="mt-1">
                                            <ul className="grid gap-1 pl-1 text-xs text-neutral-700">
                                              {l.observed_signals.map((s, i) => (
                                                <li key={`${s.signal}-${i}`} className="flex items-start gap-2">
                                                  <span className="mt-0.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--gran)]" />
                                                  <span className="flex-1">{s.evidence}</span>
                                                  <span className="font-mono text-[10px] text-neutral-500">+{s.points}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 text-xs text-neutral-600">
                                    <div>{l.city ?? "—"}</div>
                                    <div className="text-neutral-500">{l.industry ?? "—"}</div>
                                  </td>
                                  <td className="px-3 py-3"><ScoreBadge score={l.fit_score} /></td>
                                  <td className="px-3 py-3">
                                    <div className="flex flex-col gap-1 text-xs">
                                      <a href={l.website_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-neutral-800 underline">
                                        Webbplats <ExternalLink size={11} />
                                      </a>
                                      {l.contact_page_url && (
                                        <a href={l.contact_page_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-neutral-800 underline">
                                          Kontaktsida <ExternalLink size={11} />
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <StatusControl
                                      value={l.status}
                                      saving={savingLead[l.id]}
                                      onChange={(v) => void updateStatus(l.id, v)}
                                    />
                                  </td>
                                </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobil / tablet kortvy */}
                  <div className="grid gap-3 lg:hidden">
                    {filteredLeads.map((l) => {
                      const isDnc = l.status === "do_not_contact";
                      const isOpen = !!expanded[l.id];
                      return (
                        <div
                          key={l.id}
                          className={cn(
                            "rounded-lg border p-3",
                            isDnc ? "border-neutral-300 bg-neutral-50" : "border-[var(--linje)] bg-white",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={cn("truncate font-semibold", isDnc && "text-neutral-500")}>{l.company_name}</span>
                                {isDnc && (
                                  <Badge variant="outline" className="gap-1 border-neutral-300 text-neutral-500">
                                    <ShieldOff size={11} /> Kontakta inte
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-0.5 text-xs text-neutral-500">{l.domain}</div>
                            </div>
                            <ScoreBadge score={l.fit_score} />
                          </div>
                          {l.description && (
                            <p className="mt-2 text-xs text-neutral-600">{l.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-600">
                            <span>{l.city ?? "—"}</span>
                            <span>· {l.industry ?? "—"}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs">
                            <a href={l.website_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-neutral-800 underline">
                              Webbplats <ExternalLink size={11} />
                            </a>
                            {l.contact_page_url && (
                              <a href={l.contact_page_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-neutral-800 underline">
                                Kontaktsida <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                          {l.observed_signals?.length > 0 && (
                            <Collapsible open={isOpen} onOpenChange={(o) => setExpanded((s) => ({ ...s, [l.id]: o }))} className="mt-2">
                              <CollapsibleTrigger className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--gran)] hover:underline">
                                {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                {l.observed_signals.length} observerade signaler
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-1">
                                <ul className="grid gap-1 text-xs text-neutral-700">
                                  {l.observed_signals.map((s, i) => (
                                    <li key={`${s.signal}-${i}`} className="flex items-start gap-2">
                                      <span className="mt-0.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--gran)]" />
                                      <span className="flex-1">{s.evidence}</span>
                                      <span className="font-mono text-[10px] text-neutral-500">+{s.points}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                          <div className="mt-3">
                            <StatusControl
                              value={l.status}
                              saving={savingLead[l.id]}
                              onChange={(v) => void updateStatus(l.id, v)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <p className="text-xs text-neutral-500">
                Ingen automatisk kontakt sker och inga e-postadresser samlas in automatiskt.
                Kontrollera alltid företagets behov innan du hör av dig.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}

function SummaryCard({
  label,
  value,
  suffix,
  subtitle,
}: {
  label: string;
  value: number;
  suffix?: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--linje)] bg-white p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-neutral-900">
        {value}
        {suffix && <span className="ml-0.5 text-sm font-normal text-neutral-500">{suffix}</span>}
      </p>
      {subtitle && <p className="mt-1 truncate text-xs text-neutral-500">{subtitle}</p>}
    </div>
  );
}

function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gran-soft)] font-mono text-[11px] font-semibold text-[var(--gran)]">
        {step}
      </span>
      <h3 className="m-0 text-sm font-semibold text-neutral-800">{title}</h3>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "bg-emerald-100 text-emerald-800"
      : score >= 50
        ? "bg-amber-100 text-amber-800"
        : "bg-neutral-100 text-neutral-600";
  return (
    <span className={cn("inline-flex min-w-[36px] items-center justify-center rounded-full px-2 py-0.5 font-mono text-xs font-semibold", tone)}>
      {score}
    </span>
  );
}

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const tone: Record<CampaignStatus, string> = {
    draft: "bg-neutral-100 text-neutral-600",
    running: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", tone[status])}>
      {status === "running" && <Loader2 size={10} className="animate-spin" />}
      {CAMPAIGN_STATUS_LABEL[status]}
    </span>
  );
}

function StatusControl({
  value,
  saving,
  onChange,
}: {
  value: LeadStatus;
  saving?: "saving" | "saved" | "error";
  onChange: (v: LeadStatus) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => onChange(v as LeadStatus)}>
        <SelectTrigger className="h-9 min-w-[160px]" aria-label="Uppdatera status"><SelectValue /></SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="w-16 text-[11px] text-neutral-500" aria-live="polite">
        {saving === "saving" && <span className="inline-flex items-center gap-1"><Loader2 size={11} className="animate-spin" />Sparar</span>}
        {saving === "saved" && <span className="text-emerald-600">Sparat</span>}
        {saving === "error" && <span className="text-red-600">Fel</span>}
      </span>
    </div>
  );
}

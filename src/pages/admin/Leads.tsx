import { useEffect, useState } from "react";
import { Loader2, Lock, RefreshCw, Mail, Building2, Tag, Trash2, Archive, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { setSEOMeta } from "@/lib/seoHelpers";
import { toast } from "sonner";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  paket: string;
  platform: string | null;
  lead_label: string | null;
  internal_note: string | null;
  message: string;
  ip: string | null;
  user_agent: string | null;
  status: "new" | "read" | "archived";
  created_at: string;
};

const STORAGE_KEY = "faq_analytics_pwd";
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const FUNCTION_URL = `https://${PROJECT_ID}.functions.supabase.co/list-leads`;

const statusVariant: Record<Lead["status"], "default" | "secondary" | "outline"> = {
  new: "default",
  read: "secondary",
  archived: "outline",
};

const statusLabel: Record<Lead["status"], string> = {
  new: "Ny",
  read: "Läst",
  archived: "Arkiverad",
};

const Leads = () => {
  const [password, setPassword] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Lead["status"]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setSEOMeta({
      title: "Leads · Aurora Media",
      description: "Intern översikt av kontaktförfrågningar.",
      noindex: true,
    });
  }, []);

  const fetchLeads = async (pwd: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(FUNCTION_URL, { headers: { Authorization: `Bearer ${pwd}` } });
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
      setAuthed(true);
      sessionStorage.setItem(STORAGE_KEY, pwd);
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

  const updateLead = async (id: string, body: { status?: string; action?: string }) => {
    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Uppdaterat");
      fetchLeads(password);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Något gick fel");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={(e) => { e.preventDefault(); fetchLeads(password); }}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card/60 p-6"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-2xl">Leads · inloggning</h1>
          </div>
          <Input
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Logga in"}
          </Button>
        </form>
      </div>
    );
  }

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);
  const counts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    read: leads.filter((l) => l.status === "read").length,
    archived: leads.filter((l) => l.status === "archived").length,
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-4xl">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {counts.all} totalt · {counts.new} nya
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchLeads(password)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Uppdatera
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "new", "read", "archived"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Alla" : statusLabel[f]} ({counts[f]})
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card/40 p-8 text-center text-muted-foreground">
          Inga leads att visa.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const isOpen = expanded === lead.id;
            return (
              <div
                key={lead.id}
                className="rounded-xl border border-border bg-card/60 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setExpanded(isOpen ? null : lead.id);
                    if (!isOpen && lead.status === "new") updateLead(lead.id, { status: "read" });
                  }}
                  className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{lead.name}</span>
                      <Badge variant={statusVariant[lead.status]}>{statusLabel[lead.status]}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleString("sv-SE")}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>
                      {lead.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.company}</span>}
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{lead.paket}</span>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-border px-4 py-4 space-y-3 bg-background/40">
                    {lead.lead_label && (
                      <div>
                        <p className="label-caps text-primary text-xs">Lead-etikett</p>
                        <p className="text-sm">{lead.lead_label}</p>
                      </div>
                    )}
                    {lead.platform && (
                      <div>
                        <p className="label-caps text-xs">Plattform</p>
                        <p className="text-sm">{lead.platform}</p>
                      </div>
                    )}
                    {lead.internal_note && (
                      <div>
                        <p className="label-caps text-xs">Intern notering</p>
                        <p className="text-sm whitespace-pre-wrap">{lead.internal_note}</p>
                      </div>
                    )}
                    <div>
                      <p className="label-caps text-xs">Meddelande</p>
                      <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
                    </div>
                    {(lead.ip || lead.user_agent) && (
                      <p className="text-xs text-muted-foreground">
                        {lead.ip && <>IP: {lead.ip} · </>}
                        {lead.user_agent && <>UA: {lead.user_agent.slice(0, 80)}</>}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`mailto:${lead.email}?subject=Re: ${encodeURIComponent(lead.lead_label ?? lead.paket)}`}>
                          <Mail className="h-3.5 w-3.5 mr-1.5" />Svara
                        </a>
                      </Button>
                      {lead.status !== "read" && (
                        <Button size="sm" variant="outline" onClick={() => updateLead(lead.id, { status: "read" })}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Markera läst
                        </Button>
                      )}
                      {lead.status !== "archived" && (
                        <Button size="sm" variant="outline" onClick={() => updateLead(lead.id, { status: "archived" })}>
                          <Archive className="h-3.5 w-3.5 mr-1.5" />Arkivera
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Radera detta lead permanent?")) updateLead(lead.id, { action: "delete" });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />Radera
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leads;

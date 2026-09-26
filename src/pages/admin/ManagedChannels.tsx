import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check, ExternalLink, MessageCircle, Plus, RefreshCw, Send, ShieldCheck,
  X, Users, CreditCard, Rocket, ArrowRight, CalendarClock,
} from "lucide-react";
import {
  onboardingProgress, PIPELINE_LABELS, PLAN_DEFAULTS,
  type InboxOnboarding, type InboxPipelineStage, type InboxPlan, type InboxSubscription,
} from "@/lib/managedChannels";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Workspace = {
  id: string;
  name: string;
  customer_name: string | null;
  base_url: string;
  credential_env_name: string;
  status: "pending" | "connected" | "error" | "disabled";
  external_account_name: string | null;
  scopes: string[];
  last_verified_at: string | null;
  last_error: string | null;
  plan: InboxPlan;
  monthly_price_sek: number;
  included_seats: number;
  subscription_status: InboxSubscription;
  trial_ends_at: string | null;
  onboarding_status: InboxOnboarding;
  commercial_notes: string | null;
};

type OutboxItem = {
  id: string;
  workspace_id: string;
  recipient_e164: string;
  message_body: string;
  status: "staged" | "approved" | "sending" | "sent" | "failed" | "cancelled";
  created_at: string;
  sent_at: string | null;
  last_error: string | null;
};

type PipelineItem = {
  id: string;
  workspace_id: string;
  provider_conversation_id: string;
  contact_name: string | null;
  phone: string | null;
  company: string | null;
  last_message: string | null;
  stage: InboxPipelineStage;
  owner_name: string | null;
  followup_at: string | null;
  updated_at: string;
};

type ChannelData = { workspaces: Workspace[]; outbox: OutboxItem[]; pipeline: PipelineItem[] };
type ProviderContact = { id: string; name: string | null; phone: string; company?: string | null };
type ProviderConversation = {
  id: string;
  status: string;
  contact?: ProviderContact;
  last_message_text?: string | null;
  updated_at?: string;
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--linje)",
  borderRadius: 12,
  padding: 18,
};
const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--linje)",
  borderRadius: 8,
  padding: "9px 10px",
  fontSize: 13,
  background: "#fff",
};
const statusColor: Record<Workspace["status"], string> = {
  pending: "#8A6518",
  connected: "#217A4B",
  error: "#B4531A",
  disabled: "#6b6b6b",
};
const subscriptionColor: Record<InboxSubscription, string> = {
  trialing: "#8A6518",
  active: "#217A4B",
  past_due: "#B4531A",
  paused: "#6b6b6b",
  canceled: "#8b2f2f",
};

const toLocalInput = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

export default function ManagedChannels() {
  const [data, setData] = useState<ChannelData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [providerBusy, setProviderBusy] = useState(false);
  const [contacts, setContacts] = useState<ProviderContact[]>([]);
  const [conversations, setConversations] = useState<ProviderConversation[]>([]);
  const [workspaceForm, setWorkspaceForm] = useState({
    name: "",
    customer_name: "",
    base_url: "https://",
    credential_env_name: "WACRM_API_KEY",
    plan: "starter" as InboxPlan,
  });
  const [messageForm, setMessageForm] = useState({ recipient_e164: "+46", message_body: "" });
  const [commercialForm, setCommercialForm] = useState({
    customer_name: "",
    plan: "starter" as InboxPlan,
    monthly_price_sek: 695,
    included_seats: 1,
    subscription_status: "trialing" as InboxSubscription,
    onboarding_status: "draft" as InboxOnboarding,
    trial_ends_at: "",
    commercial_notes: "",
  });

  const load = useCallback(async () => {
    try {
      const result = await adminFetch("admin-managed-channels", {
        method: "POST",
        body: JSON.stringify({ action: "list" }),
      }) as ChannelData;
      setData({ ...result, pipeline: result.pipeline ?? [] });
      setError(null);
      setSelectedId((current) => current || result.workspaces[0]?.id || "");
    } catch (nextError) {
      setError(nextError);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(
    () => data?.workspaces.find((workspace) => workspace.id === selectedId) ?? null,
    [data, selectedId],
  );
  const selectedOutbox = useMemo(
    () => data?.outbox.filter((item) => item.workspace_id === selectedId) ?? [],
    [data, selectedId],
  );
  const selectedPipeline = useMemo(
    () => data?.pipeline.filter((item) => item.workspace_id === selectedId) ?? [],
    [data, selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    setCommercialForm({
      customer_name: selected.customer_name ?? selected.name,
      plan: selected.plan ?? "starter",
      monthly_price_sek: selected.monthly_price_sek ?? PLAN_DEFAULTS.starter.price,
      included_seats: selected.included_seats ?? PLAN_DEFAULTS.starter.seats,
      subscription_status: selected.subscription_status ?? "trialing",
      onboarding_status: selected.onboarding_status ?? "draft",
      trial_ends_at: toLocalInput(selected.trial_ends_at),
      commercial_notes: selected.commercial_notes ?? "",
    });
  }, [selected]);

  const mutate = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const result = await adminFetch("admin-managed-channels", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as ChannelData;
      setData({ ...result, pipeline: result.pipeline ?? [] });
      setError(null);
      return true;
    } catch (nextError) {
      setError(nextError);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const loadProvider = async (action: "contacts" | "conversations") => {
    if (!selectedId) return;
    setProviderBusy(true);
    try {
      const payload = await adminFetch("admin-managed-channels", {
        method: "POST",
        body: JSON.stringify({ action, workspace_id: selectedId }),
      }) as { data?: unknown[] };
      if (action === "contacts") setContacts((payload.data ?? []) as ProviderContact[]);
      else setConversations((payload.data ?? []) as ProviderConversation[]);
      setError(null);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setProviderBusy(false);
    }
  };

  const addConversationToPipeline = async (conversation: ProviderConversation) => {
    if (!selected) return;
    const ok = await mutate({
      action: "upsert_pipeline",
      workspace_id: selected.id,
      provider_conversation_id: conversation.id,
      contact_name: conversation.contact?.name ?? null,
      phone: conversation.contact?.phone ?? null,
      company: conversation.contact?.company ?? null,
      last_message: conversation.last_message_text ?? null,
    });
    if (ok) setConversations((current) => current.filter((item) => item.id !== conversation.id));
  };

  const saveCommercial = async () => {
    if (!selected) return;
    await mutate({
      action: "update_commercial",
      workspace_id: selected.id,
      ...commercialForm,
      trial_ends_at: commercialForm.trial_ends_at || null,
    });
  };

  const applyPlanDefaults = (plan: InboxPlan) => {
    const preset = PLAN_DEFAULTS[plan];
    setCommercialForm((current) => ({
      ...current,
      plan,
      monthly_price_sek: preset.price,
      included_seats: preset.seats,
    }));
  };

  return (
    <AdminShell title="Aurora Inbox" kicker="Admin · WhatsApp CRM">
      <AdminStatus loading={!data && !error} error={error} onRetry={load} />

      <section style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>AURORA INBOX · WACRM ENGINE</p>
            <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Svensk managed WhatsApp-CRM</h2>
            <p style={{ margin: "6px 0 0", maxWidth: 760, color: "var(--granbark-mut)", fontSize: 13 }}>
              Aurora äger onboarding, paketering, pipeline och operatörsflöde. WACRM sköter kanalens kontakter,
              konversationer och meddelanden. Leverantörshemligheter stannar server-side.
            </p>
          </div>
          <a
            href="https://github.com/ArnasDon/wacrm"
            target="_blank"
            rel="noreferrer"
            className="vk-btn"
            style={{ textDecoration: "none", height: 38 }}
          >
            Open-source-motor <ExternalLink size={13} />
          </a>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const ok = await mutate({ action: "create_workspace", ...workspaceForm });
            if (ok) setWorkspaceForm({
              name: "",
              customer_name: "",
              base_url: "https://",
              credential_env_name: "WACRM_API_KEY",
              plan: "starter",
            });
          }}
          style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 9 }}
        >
          <input required aria-label="Workspace" placeholder="Workspace, t.ex. Kund AB" style={input}
            value={workspaceForm.name} onChange={(event) => setWorkspaceForm((form) => ({ ...form, name: event.target.value }))} />
          <input aria-label="Kundnamn" placeholder="Fakturerande kund" style={input}
            value={workspaceForm.customer_name} onChange={(event) => setWorkspaceForm((form) => ({ ...form, customer_name: event.target.value }))} />
          <select aria-label="Paket" style={input} value={workspaceForm.plan}
            onChange={(event) => setWorkspaceForm((form) => ({ ...form, plan: event.target.value as InboxPlan }))}>
            {(Object.keys(PLAN_DEFAULTS) as InboxPlan[]).map((plan) => (
              <option key={plan} value={plan}>{PLAN_DEFAULTS[plan].label} · {PLAN_DEFAULTS[plan].price} kr/mån</option>
            ))}
          </select>
          <input required aria-label="WACRM-adress" placeholder="https://crm.kund.se" style={input}
            value={workspaceForm.base_url} onChange={(event) => setWorkspaceForm((form) => ({ ...form, base_url: event.target.value }))} />
          <input required aria-label="Namn på serverhemlighet" placeholder="WACRM_API_KEY" style={input}
            value={workspaceForm.credential_env_name}
            onChange={(event) => setWorkspaceForm((form) => ({
              ...form,
              credential_env_name: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""),
            }))} />
          <button className="vk-btn vk-btn-primary" disabled={busy}><Plus size={14} /> Starta 14 dagars trial</button>
        </form>
      </section>

      {data && (
        <div style={{ marginTop: 18, display: "grid", gap: 16, gridTemplateColumns: "minmax(240px, 0.7fr) minmax(0, 2fr)" }}>
          <section style={card}>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>KUNDER / WORKSPACES</p>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              {data.workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => { setSelectedId(workspace.id); setContacts([]); setConversations([]); }}
                  style={{
                    textAlign: "left", padding: 12, borderRadius: 9,
                    border: `1px solid ${selectedId === workspace.id ? "var(--gran)" : "var(--linje)"}`,
                    background: selectedId === workspace.id ? "#0f51320a" : "#fff", cursor: "pointer",
                  }}
                >
                  <strong style={{ fontSize: 13 }}>{workspace.customer_name || workspace.name}</strong>
                  <span style={{ display: "block", marginTop: 4, fontSize: 11, color: statusColor[workspace.status] }}>
                    {workspace.status.toUpperCase()} · {(workspace.plan ?? "starter").toUpperCase()}
                  </span>
                  <span style={{ display: "block", marginTop: 3, fontSize: 10, color: subscriptionColor[workspace.subscription_status ?? "trialing"] }}>
                    {(workspace.subscription_status ?? "trialing").toUpperCase()} · {workspace.monthly_price_sek ?? 695} kr/mån
                  </span>
                </button>
              ))}
              {data.workspaces.length === 0 && <p style={{ fontSize: 13, color: "var(--granbark-mut)" }}>Starta första kundens workspace ovan.</p>}
            </div>
          </section>

          <div style={{ display: "grid", gap: 16 }}>
            {selected && (
              <section style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>ONBOARDING & BILLING-LAYER</p>
                    <h3 style={{ margin: "5px 0 0" }}>{selected.customer_name || selected.name}</h3>
                    <p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--granbark-mut)" }}>
                      {selected.external_account_name || selected.base_url} · secret: {selected.credential_env_name}
                    </p>
                  </div>
                  <button className="vk-btn" disabled={busy} onClick={() => void mutate({ action: "verify", workspace_id: selected.id })}>
                    <ShieldCheck size={14} /> Verifiera WACRM
                  </button>
                </div>

                <div style={{ marginTop: 16, height: 7, borderRadius: 999, background: "#ECEDE9", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${onboardingProgress(commercialForm.onboarding_status)}%`,
                      height: "100%",
                      background: "#2D6A4F",
                      transition: "width .2s ease",
                    }}
                  />
                </div>

                <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 9 }}>
                  <label style={{ fontSize: 11 }}>Kundnamn
                    <input style={{ ...input, marginTop: 4 }} value={commercialForm.customer_name}
                      onChange={(event) => setCommercialForm((form) => ({ ...form, customer_name: event.target.value }))} />
                  </label>
                  <label style={{ fontSize: 11 }}>Paket
                    <select style={{ ...input, marginTop: 4 }} value={commercialForm.plan}
                      onChange={(event) => applyPlanDefaults(event.target.value as InboxPlan)}>
                      {(Object.keys(PLAN_DEFAULTS) as InboxPlan[]).map((plan) => (
                        <option key={plan} value={plan}>{PLAN_DEFAULTS[plan].label}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ fontSize: 11 }}>Pris kr/mån
                    <input type="number" min={0} max={100000} style={{ ...input, marginTop: 4 }}
                      value={commercialForm.monthly_price_sek}
                      onChange={(event) => setCommercialForm((form) => ({ ...form, monthly_price_sek: Number(event.target.value) }))} />
                  </label>
                  <label style={{ fontSize: 11 }}>Inkl. användare
                    <input type="number" min={1} max={100} style={{ ...input, marginTop: 4 }}
                      value={commercialForm.included_seats}
                      onChange={(event) => setCommercialForm((form) => ({ ...form, included_seats: Number(event.target.value) }))} />
                  </label>
                  <label style={{ fontSize: 11 }}>Abonnemang
                    <select style={{ ...input, marginTop: 4 }} value={commercialForm.subscription_status}
                      onChange={(event) => setCommercialForm((form) => ({ ...form, subscription_status: event.target.value as InboxSubscription }))}>
                      <option value="trialing">Trial</option><option value="active">Aktiv</option>
                      <option value="past_due">Förfallen</option><option value="paused">Pausad</option><option value="canceled">Avslutad</option>
                    </select>
                  </label>
                  <label style={{ fontSize: 11 }}>Onboarding
                    <select style={{ ...input, marginTop: 4 }} value={commercialForm.onboarding_status}
                      onChange={(event) => setCommercialForm((form) => ({ ...form, onboarding_status: event.target.value as InboxOnboarding }))}>
                      <option value="draft">Ny kund</option><option value="configuring">Konfigureras</option>
                      <option value="ready">Redo för go-live</option><option value="live">Live</option><option value="paused">Pausad</option>
                    </select>
                  </label>
                  <label style={{ fontSize: 11 }}>Trial slutar
                    <input type="datetime-local" style={{ ...input, marginTop: 4 }} value={commercialForm.trial_ends_at}
                      onChange={(event) => setCommercialForm((form) => ({ ...form, trial_ends_at: event.target.value }))} />
                  </label>
                </div>
                <textarea
                  aria-label="Kommersiella anteckningar"
                  rows={2}
                  placeholder="Onboarding, avtal, särskilda integrationsbehov…"
                  style={{ ...input, resize: "vertical", marginTop: 9 }}
                  value={commercialForm.commercial_notes}
                  onChange={(event) => setCommercialForm((form) => ({ ...form, commercial_notes: event.target.value }))}
                />
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="vk-btn vk-btn-primary" disabled={busy} onClick={() => void saveCommercial()}>
                    <CreditCard size={14} /> Spara kommersiellt
                  </button>
                  {selected.last_error && <span role="alert" style={{ color: "#B4531A", fontSize: 12 }}>{selected.last_error}</span>}
                </div>
              </section>
            )}

            {selected && (
              <section style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>INBOX → PIPELINE</p>
                    <h3 style={{ margin: "5px 0 0" }}>Fånga WhatsApp-leads utan dubbelregistrering</h3>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="vk-btn" disabled={providerBusy || selected.status !== "connected"}
                      onClick={() => void loadProvider("conversations")}>
                      <MessageCircle size={14} /> Hämta konversationer
                    </button>
                    <button className="vk-btn" disabled={providerBusy || selected.status !== "connected"}
                      onClick={() => void loadProvider("contacts")}>
                      <RefreshCw size={14} className={providerBusy ? "animate-spin" : ""} /> Kontakter
                    </button>
                  </div>
                </div>

                {conversations.length > 0 && (
                  <div style={{ marginTop: 14, display: "grid", gap: 7 }}>
                    {conversations.map((conversation) => (
                      <div key={conversation.id} style={{ border: "1px solid var(--linje)", borderRadius: 8, padding: 10, fontSize: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <div>
                            <strong>{conversation.contact?.name || conversation.contact?.phone || "Okänd kontakt"}</strong>
                            <p style={{ margin: "5px 0 0", color: "var(--granbark-mut)" }}>
                              {conversation.last_message_text || "Ingen textförhandsvisning"}
                            </p>
                          </div>
                          <button className="vk-btn" disabled={busy} onClick={() => void addConversationToPipeline(conversation)}>
                            Till pipeline <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {contacts.length > 0 && (
                  <div style={{ marginTop: 14, display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {contacts.map((contact) => (
                      <button key={contact.id}
                        onClick={() => setMessageForm((form) => ({ ...form, recipient_e164: contact.phone }))}
                        style={{ border: "1px solid var(--linje)", borderRadius: 8, padding: 10, background: "#fff", textAlign: "left", cursor: "pointer", fontSize: 12 }}>
                        <strong>{contact.name || contact.phone}</strong>
                        <span style={{ display: "block", color: "var(--granbark-mut)" }}>{contact.phone}{contact.company ? ` · ${contact.company}` : ""}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                  {selectedPipeline.map((item) => (
                    <PipelineRow key={item.id} item={item} busy={busy} onUpdate={(patch) =>
                      mutate({ action: "update_pipeline", workspace_id: selected.id, pipeline_id: item.id, ...patch })
                    } />
                  ))}
                  {selectedPipeline.length === 0 && (
                    <p style={{ margin: 0, color: "var(--granbark-mut)", fontSize: 13 }}>
                      Ingen pipeline ännu. Hämta konversationer och lägg relevanta dialoger här.
                    </p>
                  )}
                </div>
              </section>
            )}

            {selected && (
              <section style={card}>
                <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>UTKORG · TVÅ STEG FÖRE SKICK</p>
                <form onSubmit={async (event) => {
                  event.preventDefault();
                  const ok = await mutate({ action: "stage_message", workspace_id: selected.id, ...messageForm });
                  if (ok) setMessageForm({ recipient_e164: "+46", message_body: "" });
                }} style={{ marginTop: 11, display: "grid", gap: 8 }}>
                  <input required aria-label="Mottagarens telefonnummer" style={input} value={messageForm.recipient_e164}
                    onChange={(event) => setMessageForm((form) => ({ ...form, recipient_e164: event.target.value }))}
                    placeholder="+46701234567" />
                  <textarea required aria-label="WhatsApp-meddelande" style={{ ...input, resize: "vertical" }} rows={4}
                    value={messageForm.message_body}
                    onChange={(event) => setMessageForm((form) => ({ ...form, message_body: event.target.value }))}
                    placeholder="Skriv meddelandet. Det skickas inte förrän du först godkänt det." />
                  <div><button className="vk-btn vk-btn-primary" disabled={busy}><Plus size={14} /> Lägg som utkast</button></div>
                </form>

                <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                  {selectedOutbox.map((item) => (
                    <div key={item.id} style={{ border: "1px solid var(--linje)", borderRadius: 9, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <strong style={{ fontSize: 12 }}>{item.recipient_e164}</strong>
                        <span className="vk-mono" style={{ fontSize: 10 }}>{item.status.toUpperCase()}</span>
                      </div>
                      <p style={{ whiteSpace: "pre-wrap", fontSize: 12, margin: "8px 0" }}>{item.message_body}</p>
                      {item.last_error && <p style={{ fontSize: 11, color: "#B4531A" }}>{item.last_error}</p>}
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                        {item.status === "staged" && (
                          <button className="vk-btn" disabled={busy}
                            onClick={() => void mutate({ action: "approve_message", workspace_id: selected.id, outbox_id: item.id })}>
                            <Check size={13} /> Godkänn
                          </button>
                        )}
                        {item.status === "approved" && (
                          <button className="vk-btn vk-btn-primary" disabled={busy}
                            onClick={() => void mutate({ action: "send_message", workspace_id: selected.id, outbox_id: item.id })}>
                            <Send size={13} /> Skicka nu
                          </button>
                        )}
                        {["staged", "approved", "failed"].includes(item.status) && (
                          <button className="vk-btn" disabled={busy}
                            onClick={() => void mutate({ action: "cancel_message", workspace_id: selected.id, outbox_id: item.id })}>
                            <X size={13} /> Avbryt
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section style={{ ...card, background: "#F5F7F3" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Rocket size={18} style={{ color: "#2D6A4F", marginTop: 2 }} />
                <div>
                  <strong style={{ fontSize: 13 }}>Kommersiell avgränsning v1</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 12, lineHeight: 1.6, color: "var(--granbark-mut)" }}>
                    Pris och abonnemangsstatus är operativ metadata i v1. Automatisk Stripe-fakturering ska kopplas
                    först när piloten bevisat betalningsvilja. Det minskar bygg- och supportkostnad innan produkt/marknad-fit.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function PipelineRow({
  item,
  busy,
  onUpdate,
}: {
  item: PipelineItem;
  busy: boolean;
  onUpdate: (patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const [owner, setOwner] = useState(item.owner_name ?? "");
  const [followup, setFollowup] = useState(toLocalInput(item.followup_at));

  return (
    <div style={{ border: "1px solid var(--linje)", borderRadius: 9, padding: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1.2fr) repeat(3, minmax(130px, .7fr))", gap: 8, alignItems: "end" }}>
        <div>
          <strong style={{ fontSize: 13 }}>{item.contact_name || item.phone || "Okänd kontakt"}</strong>
          {item.company && <span style={{ display: "block", fontSize: 11, color: "var(--granbark-mut)" }}>{item.company}</span>}
          {item.last_message && <p style={{ margin: "5px 0 0", fontSize: 11, color: "var(--granbark-mut)" }}>{item.last_message}</p>}
        </div>
        <label style={{ fontSize: 10 }}>Steg
          <select style={{ ...input, marginTop: 4 }} value={item.stage} disabled={busy}
            onChange={(event) => void onUpdate({ stage: event.target.value, owner_name: owner, followup_at: followup || null })}>
            {(Object.keys(PIPELINE_LABELS) as InboxPipelineStage[]).map((stage) => (
              <option key={stage} value={stage}>{PIPELINE_LABELS[stage]}</option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 10 }}><Users size={11} style={{ display: "inline", marginRight: 4 }} />Ägare
          <input style={{ ...input, marginTop: 4 }} value={owner} placeholder="Christoffer"
            onChange={(event) => setOwner(event.target.value)}
            onBlur={() => void onUpdate({ stage: item.stage, owner_name: owner, followup_at: followup || null })} />
        </label>
        <label style={{ fontSize: 10 }}><CalendarClock size={11} style={{ display: "inline", marginRight: 4 }} />Följ upp
          <input type="datetime-local" style={{ ...input, marginTop: 4 }} value={followup}
            onChange={(event) => setFollowup(event.target.value)}
            onBlur={() => void onUpdate({ stage: item.stage, owner_name: owner, followup_at: followup || null })} />
        </label>
      </div>
    </div>
  );
}

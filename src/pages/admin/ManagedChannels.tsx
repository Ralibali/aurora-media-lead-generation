import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, MessageCircle, Plus, RefreshCw, Send, ShieldCheck, X } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Workspace = {
  id: string; name: string; base_url: string; credential_env_name: string;
  status: "pending" | "connected" | "error" | "disabled"; external_account_name: string | null;
  scopes: string[]; last_verified_at: string | null; last_error: string | null;
};
type OutboxItem = {
  id: string; workspace_id: string; recipient_e164: string; message_body: string;
  status: "staged" | "approved" | "sending" | "sent" | "failed" | "cancelled";
  created_at: string; sent_at: string | null; last_error: string | null;
};
type ChannelData = { workspaces: Workspace[]; outbox: OutboxItem[] };
type ProviderContact = { id: string; name: string | null; phone: string; company?: string | null };
type ProviderConversation = { id: string; status: string; contact?: ProviderContact; last_message_text?: string | null; updated_at?: string };

const card: React.CSSProperties = { background: "#fff", border: "1px solid var(--linje)", borderRadius: 12, padding: 18 };
const input: React.CSSProperties = { width: "100%", border: "1px solid var(--linje)", borderRadius: 8, padding: "9px 10px", fontSize: 13, background: "#fff" };
const statusColor: Record<Workspace["status"], string> = { pending: "#8A6518", connected: "#217A4B", error: "#B4531A", disabled: "#6b6b6b" };

export default function ManagedChannels() {
  const [data, setData] = useState<ChannelData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [providerBusy, setProviderBusy] = useState(false);
  const [contacts, setContacts] = useState<ProviderContact[]>([]);
  const [conversations, setConversations] = useState<ProviderConversation[]>([]);
  const [workspaceForm, setWorkspaceForm] = useState({ name: "", base_url: "https://", credential_env_name: "WACRM_API_KEY" });
  const [messageForm, setMessageForm] = useState({ recipient_e164: "+46", message_body: "" });

  const load = useCallback(async () => {
    try {
      const result = await adminFetch("admin-managed-channels", { method: "POST", body: JSON.stringify({ action: "list" }) }) as ChannelData;
      setData(result); setError(null);
      setSelectedId((current) => current || result.workspaces[0]?.id || "");
    } catch (nextError) { setError(nextError); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => data?.workspaces.find((workspace) => workspace.id === selectedId) ?? null, [data, selectedId]);
  const selectedOutbox = useMemo(() => data?.outbox.filter((item) => item.workspace_id === selectedId) ?? [], [data, selectedId]);

  const mutate = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const result = await adminFetch("admin-managed-channels", { method: "POST", body: JSON.stringify(payload) }) as ChannelData;
      setData(result); setError(null); return true;
    } catch (nextError) { setError(nextError); return false; }
    finally { setBusy(false); }
  };

  const loadProvider = async (action: "contacts" | "conversations") => {
    if (!selectedId) return;
    setProviderBusy(true);
    try {
      const payload = await adminFetch("admin-managed-channels", { method: "POST", body: JSON.stringify({ action, workspace_id: selectedId }) }) as { data?: unknown[] };
      if (action === "contacts") setContacts((payload.data ?? []) as ProviderContact[]);
      else setConversations((payload.data ?? []) as ProviderConversation[]);
      setError(null);
    } catch (nextError) { setError(nextError); }
    finally { setProviderBusy(false); }
  };

  return <AdminShell title="WhatsApp" kicker="Admin · managed channels">
    <AdminStatus loading={!data && !error} error={error} onRetry={load} />

    <section style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>AURORA WHATSAPP · WACRM</p>
          <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Managed inbox med godkänd utkorg</h2>
          <p style={{ margin: "6px 0 0", maxWidth: 720, color: "var(--granbark-mut)", fontSize: 13 }}>
            WACRM sköter WhatsApp, kontakter och konversationer. API-nyckeln ligger som serverhemlighet; inget känsligt sparas i webbläsaren eller databasen.
          </p>
        </div>
        <a href="https://github.com/ArnasDon/wacrm" target="_blank" rel="noreferrer" className="vk-btn" style={{ textDecoration: "none", height: 38 }}>Källmotor <ExternalLink size={13} /></a>
      </div>

      <form onSubmit={async (event) => { event.preventDefault(); const ok = await mutate({ action: "create_workspace", ...workspaceForm }); if (ok) setWorkspaceForm({ name: "", base_url: "https://", credential_env_name: "WACRM_API_KEY" }); }} style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 9 }}>
        <input required aria-label="Kund eller workspace" placeholder="Kund / workspace" style={input} value={workspaceForm.name} onChange={(event) => setWorkspaceForm((form) => ({ ...form, name: event.target.value }))} />
        <input required aria-label="WACRM-adress" placeholder="https://crm.kund.se" style={input} value={workspaceForm.base_url} onChange={(event) => setWorkspaceForm((form) => ({ ...form, base_url: event.target.value }))} />
        <input required aria-label="Namn på serverhemlighet" placeholder="WACRM_API_KEY" style={input} value={workspaceForm.credential_env_name} onChange={(event) => setWorkspaceForm((form) => ({ ...form, credential_env_name: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") }))} />
        <button className="vk-btn vk-btn-primary" disabled={busy}><Plus size={14} /> Lägg till</button>
      </form>
    </section>

    {data && <div style={{ marginTop: 18, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}>
      <section style={card}>
        <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>WORKSPACES</p>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {data.workspaces.map((workspace) => <button key={workspace.id} onClick={() => { setSelectedId(workspace.id); setContacts([]); setConversations([]); }} style={{ textAlign: "left", padding: 12, borderRadius: 9, border: `1px solid ${selectedId === workspace.id ? "var(--gran)" : "var(--linje)"}`, background: selectedId === workspace.id ? "#0f51320a" : "#fff", cursor: "pointer" }}>
            <strong style={{ fontSize: 13 }}>{workspace.name}</strong>
            <span style={{ display: "block", marginTop: 4, fontSize: 11, color: statusColor[workspace.status] }}>{workspace.status.toUpperCase()}</span>
          </button>)}
          {data.workspaces.length === 0 && <p style={{ fontSize: 13, color: "var(--granbark-mut)" }}>Lägg till första WACRM-instansen ovan.</p>}
        </div>
      </section>

      <div style={{ display: "grid", gap: 16 }}>
        {selected && <section style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div><h3 style={{ margin: 0 }}>{selected.name}</h3><p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--granbark-mut)" }}>{selected.external_account_name || selected.base_url} · secret: {selected.credential_env_name}</p></div>
            <button className="vk-btn" disabled={busy} onClick={() => mutate({ action: "verify", workspace_id: selected.id })}><ShieldCheck size={14} /> Verifiera API</button>
          </div>
          {selected.last_error && <p role="alert" style={{ marginTop: 10, color: "#B4531A", fontSize: 12 }}>{selected.last_error}</p>}
          {selected.scopes.length > 0 && <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--granbark-mut)" }}>Scopes: {selected.scopes.join(", ")}</p>}
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="vk-btn" disabled={providerBusy || selected.status !== "connected"} onClick={() => loadProvider("conversations")}><MessageCircle size={14} /> Hämta konversationer</button>
            <button className="vk-btn" disabled={providerBusy || selected.status !== "connected"} onClick={() => loadProvider("contacts")}><RefreshCw size={14} className={providerBusy ? "animate-spin" : ""} /> Hämta kontakter</button>
          </div>
          {(conversations.length > 0 || contacts.length > 0) && <div style={{ marginTop: 14, display: "grid", gap: 7, maxHeight: 300, overflow: "auto" }}>
            {conversations.map((conversation) => <div key={conversation.id} style={{ border: "1px solid var(--linje)", borderRadius: 8, padding: 10, fontSize: 12 }}><strong>{conversation.contact?.name || conversation.contact?.phone || "Okänd kontakt"}</strong><span style={{ float: "right", color: "var(--granbark-mut)" }}>{conversation.status}</span><p style={{ margin: "5px 0 0", color: "var(--granbark-mut)" }}>{conversation.last_message_text || "Ingen textförhandsvisning"}</p></div>)}
            {contacts.map((contact) => <button key={contact.id} onClick={() => setMessageForm((form) => ({ ...form, recipient_e164: contact.phone }))} style={{ border: "1px solid var(--linje)", borderRadius: 8, padding: 10, background: "#fff", textAlign: "left", cursor: "pointer", fontSize: 12 }}><strong>{contact.name || contact.phone}</strong><span style={{ display: "block", color: "var(--granbark-mut)" }}>{contact.phone}{contact.company ? ` · ${contact.company}` : ""}</span></button>)}
          </div>}
        </section>}

        {selected && <section style={card}>
          <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>UTKORG · TVÅ STEG FÖRE SKICK</p>
          <form onSubmit={async (event) => { event.preventDefault(); const ok = await mutate({ action: "stage_message", workspace_id: selected.id, ...messageForm }); if (ok) setMessageForm({ recipient_e164: "+46", message_body: "" }); }} style={{ marginTop: 11, display: "grid", gap: 8 }}>
            <input required aria-label="Mottagarens telefonnummer" style={input} value={messageForm.recipient_e164} onChange={(event) => setMessageForm((form) => ({ ...form, recipient_e164: event.target.value }))} placeholder="+46701234567" />
            <textarea required aria-label="WhatsApp-meddelande" style={{ ...input, resize: "vertical" }} rows={4} value={messageForm.message_body} onChange={(event) => setMessageForm((form) => ({ ...form, message_body: event.target.value }))} placeholder="Skriv meddelandet. Det skickas inte förrän du först godkänt det." />
            <div><button className="vk-btn vk-btn-primary" disabled={busy}><Plus size={14} /> Lägg som utkast</button></div>
          </form>
          <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
            {selectedOutbox.map((item) => <div key={item.id} style={{ border: "1px solid var(--linje)", borderRadius: 9, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong style={{ fontSize: 12 }}>{item.recipient_e164}</strong><span className="vk-mono" style={{ fontSize: 10 }}>{item.status.toUpperCase()}</span></div>
              <p style={{ whiteSpace: "pre-wrap", fontSize: 12, margin: "8px 0" }}>{item.message_body}</p>
              {item.last_error && <p style={{ fontSize: 11, color: "#B4531A" }}>{item.last_error}</p>}
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {item.status === "staged" && <button className="vk-btn" disabled={busy} onClick={() => mutate({ action: "approve_message", workspace_id: selected.id, outbox_id: item.id })}><Check size={13} /> Godkänn</button>}
                {item.status === "approved" && <button className="vk-btn vk-btn-primary" disabled={busy} onClick={() => mutate({ action: "send_message", workspace_id: selected.id, outbox_id: item.id })}><Send size={13} /> Skicka nu</button>}
                {["staged", "approved", "failed"].includes(item.status) && <button className="vk-btn" disabled={busy} onClick={() => mutate({ action: "cancel_message", workspace_id: selected.id, outbox_id: item.id })}><X size={13} /> Avbryt</button>}
              </div>
            </div>)}
          </div>
        </section>}
      </div>
    </div>}
  </AdminShell>;
}

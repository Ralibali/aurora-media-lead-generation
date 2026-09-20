import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Link2, Play, Plus, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Connection = {
  id: string;
  name: string;
  service: string;
  connection_alias: string;
  allowed_actions: string[];
  status: "pending" | "connected" | "error" | "disabled";
  last_verified_at: string | null;
  last_error: string | null;
  active: boolean;
};

type Run = {
  id: string;
  connection_id: string;
  action_id: string;
  input: Record<string, unknown>;
  status: "staged" | "approved" | "running" | "succeeded" | "failed" | "cancelled";
  output_summary: Record<string, unknown> | null;
  last_error: string | null;
  created_at: string;
  integration_connections?: { name?: string; service?: string; connection_alias?: string } | null;
};

type HubData = { configured: boolean; connections: Connection[]; runs: Run[] };
type DiscoveredAction = { id: string; name: string; description: string };

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

export default function IntegrationsHub() {
  const [data, setData] = useState<HubData | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [actions, setActions] = useState<DiscoveredAction[]>([]);
  const [createForm, setCreateForm] = useState({
    name: "",
    service: "",
    connection_alias: "default",
    allowed_actions: "",
  });
  const [allowlist, setAllowlist] = useState("");
  const [runForm, setRunForm] = useState({ action_id: "", input: "{}" });

  const load = useCallback(async () => {
    try {
      const next = await adminFetch("admin-integrations-hub", {
        method: "POST",
        body: JSON.stringify({ action: "list" }),
      }) as HubData;
      setData(next);
      setError(null);
      setSelectedId((current) => current || next.connections[0]?.id || "");
    } catch (nextError) {
      setError(nextError);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(
    () => data?.connections.find((connection) => connection.id === selectedId) ?? null,
    [data, selectedId],
  );

  useEffect(() => {
    setAllowlist((selected?.allowed_actions ?? []).join("\n"));
    setRunForm((current) => ({ ...current, action_id: selected?.allowed_actions?.[0] ?? "" }));
    setActions([]);
  }, [selected?.id, selected?.allowed_actions]);

  const mutate = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const next = await adminFetch("admin-integrations-hub", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as HubData;
      setData(next);
      setError(null);
      return true;
    } catch (nextError) {
      setError(nextError);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const discover = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const result = await adminFetch("admin-integrations-hub", {
        method: "POST",
        body: JSON.stringify({ action: "discover_actions", connection_id: selected.id }),
      }) as { actions: DiscoveredAction[] };
      setActions(result.actions ?? []);
      setError(null);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setBusy(false);
    }
  };

  const stageRun = async () => {
    if (!selected || !runForm.action_id) return;
    let parsed: Record<string, unknown>;
    try {
      const value = JSON.parse(runForm.input || "{}");
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
      parsed = value;
    } catch {
      setError(new Error("Input måste vara ett JSON-objekt."));
      return;
    }
    await mutate({
      action: "stage_run",
      connection_id: selected.id,
      action_id: runForm.action_id,
      input: parsed,
    });
  };

  return (
    <AdminShell title="Integrations Hub" kicker="Admin · OpenConnector">
      <AdminStatus loading={!data && !error} error={error} onRetry={load} />

      <section style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>OPENCONNECTOR LAYER</p>
            <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>En integrationsmotor – alltid med godkännande</h2>
            <p style={{ maxWidth: 760, margin: "7px 0 0", fontSize: 13, color: "var(--granbark-mut)" }}>
              Credentials stannar i OpenConnector. Aurora lagrar bara connection alias, en uttrycklig action-allowlist
              och ett granskningsbart körningsledger. Alla skrivande actions stageas först.
            </p>
          </div>
          <span className="vk-mono" style={{ alignSelf: "start", fontSize: 11, color: data?.configured ? "#2D6A4F" : "#9A6A19" }}>
            {data?.configured ? "RUNTIME KONFIGURERAD" : "VÄNTAR PÅ OPENCONNECTOR_BASE_URL + TOKEN"}
          </span>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const allowed = createForm.allowed_actions
              .split(/[\n,]/)
              .map((value) => value.trim())
              .filter(Boolean);
            const ok = await mutate({ action: "create_connection", ...createForm, allowed_actions: allowed });
            if (ok) {
              setCreateForm({ name: "", service: "", connection_alias: "default", allowed_actions: "" });
            }
          }}
          style={{ marginTop: 18, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}
        >
          <input required style={input} placeholder="Namn, t.ex. Gmail Aurora" value={createForm.name} onChange={(e) => setCreateForm((form) => ({ ...form, name: e.target.value }))} />
          <input required style={input} placeholder="Service, t.ex. gmail" value={createForm.service} onChange={(e) => setCreateForm((form) => ({ ...form, service: e.target.value.toLowerCase() }))} />
          <input required style={input} placeholder="Connection alias" value={createForm.connection_alias} onChange={(e) => setCreateForm((form) => ({ ...form, connection_alias: e.target.value }))} />
          <textarea style={{ ...input, resize: "vertical" }} rows={2} placeholder="Allowlist: gmail.send_email, gmail.list_messages" value={createForm.allowed_actions} onChange={(e) => setCreateForm((form) => ({ ...form, allowed_actions: e.target.value }))} />
          <button className="vk-btn vk-btn-primary" disabled={busy}><Plus size={14} /> Lägg till</button>
        </form>
      </section>

      {data && (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,390px),1fr))", marginTop: 16 }}>
          <section style={card}>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>CONNECTIONS</p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 12 }}>
              {data.connections.map((connection) => (
                <button
                  key={connection.id}
                  className={selectedId === connection.id ? "vk-btn vk-btn-primary" : "vk-btn"}
                  onClick={() => setSelectedId(connection.id)}
                >
                  <Link2 size={13} /> {connection.name}
                </button>
              ))}
            </div>

            {selected && (
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <div style={{ border: "1px solid var(--linje)", borderRadius: 10, padding: 12 }}>
                  <strong>{selected.service}</strong>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--granbark-mut)" }}>
                    alias: {selected.connection_alias} · status: {selected.status}
                  </p>
                  {selected.last_error && <p style={{ margin: "5px 0 0", color: "#B4531A", fontSize: 11 }}>{selected.last_error}</p>}
                </div>

                <textarea
                  style={{ ...input, minHeight: 120, resize: "vertical" }}
                  value={allowlist}
                  onChange={(event) => setAllowlist(event.target.value)}
                  aria-label="Tillåtna actions"
                  placeholder="En exakt action per rad"
                />
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  <button
                    className="vk-btn"
                    disabled={busy}
                    onClick={() => mutate({
                      action: "update_connection",
                      connection_id: selected.id,
                      allowed_actions: allowlist.split(/\n/).map((value) => value.trim()).filter(Boolean),
                    })}
                  >
                    <ShieldCheck size={13} /> Spara allowlist
                  </button>
                  <button className="vk-btn" disabled={busy} onClick={() => mutate({ action: "test_connection", connection_id: selected.id })}>
                    <RefreshCw size={13} /> Testa runtime
                  </button>
                  <button className="vk-btn" disabled={busy || !data.configured} onClick={discover}>
                    <Search size={13} /> Upptäck actions
                  </button>
                </div>

                {actions.length > 0 && (
                  <div style={{ maxHeight: 280, overflow: "auto", display: "grid", gap: 6 }}>
                    {actions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setRunForm((form) => ({ ...form, action_id: item.id }))}
                        style={{ textAlign: "left", border: "1px solid var(--linje)", borderRadius: 8, padding: 9, background: "#fff" }}
                      >
                        <strong style={{ fontSize: 12 }}>{item.id}</strong>
                        {item.description && <span style={{ display: "block", fontSize: 11, color: "var(--granbark-mut)", marginTop: 3 }}>{item.description}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <section style={card}>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>STAGE ACTION</p>
            {!selected ? (
              <p style={{ fontSize: 13, color: "var(--granbark-mut)" }}>Välj en connection först.</p>
            ) : (
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                <select style={input} value={runForm.action_id} onChange={(event) => setRunForm((form) => ({ ...form, action_id: event.target.value }))}>
                  <option value="">Välj allowlistad action</option>
                  {selected.allowed_actions.map((actionId) => <option key={actionId} value={actionId}>{actionId}</option>)}
                </select>
                <textarea
                  style={{ ...input, minHeight: 150, fontFamily: "var(--font-mono)", resize: "vertical" }}
                  value={runForm.input}
                  onChange={(event) => setRunForm((form) => ({ ...form, input: event.target.value }))}
                  aria-label="Action input JSON"
                />
                <button className="vk-btn vk-btn-primary" disabled={busy || !runForm.action_id} onClick={stageRun}>
                  <Plus size={14} /> Lägg i granskningskö
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      <section style={{ ...card, marginTop: 16 }}>
        <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>ACTION LEDGER</p>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {(data?.runs ?? []).map((run) => (
            <article key={run.id} style={{ border: "1px solid var(--linje)", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <strong>{run.action_id}</strong>
                  <span style={{ display: "block", marginTop: 3, fontSize: 11, color: "var(--granbark-mut)" }}>
                    {run.integration_connections?.name ?? run.connection_id} · {new Date(run.created_at).toLocaleString("sv-SE")}
                  </span>
                </div>
                <span className="vk-mono" style={{ fontSize: 10 }}>{run.status.toUpperCase()}</span>
              </div>
              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 11, background: "#F7F7F4", borderRadius: 7, padding: 8, marginTop: 8 }}>
                {JSON.stringify(run.input, null, 2)}
              </pre>
              {run.last_error && <p style={{ color: "#B4531A", fontSize: 11 }}>{run.last_error}</p>}
              {run.output_summary && (
                <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, color: "var(--granbark-mut)" }}>
                  {JSON.stringify(run.output_summary, null, 2)}
                </pre>
              )}
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {run.status === "staged" && (
                  <>
                    <button className="vk-btn" disabled={busy} onClick={() => mutate({ action: "approve_run", connection_id: run.connection_id, run_id: run.id })}>
                      <Check size={13} /> Godkänn
                    </button>
                    <button className="vk-btn" disabled={busy} onClick={() => mutate({ action: "cancel_run", connection_id: run.connection_id, run_id: run.id })}>
                      <X size={13} /> Avbryt
                    </button>
                  </>
                )}
                {run.status === "approved" && (
                  <button className="vk-btn vk-btn-primary" disabled={busy || !data?.configured} onClick={() => mutate({ action: "execute_run", connection_id: run.connection_id, run_id: run.id })}>
                    <Play size={13} /> Kör godkänd action
                  </button>
                )}
              </div>
            </article>
          ))}
          {data?.runs.length === 0 && <p style={{ fontSize: 13, color: "var(--granbark-mut)" }}>Inga actions har stageats ännu.</p>}
        </div>
      </section>
    </AdminShell>
  );
}

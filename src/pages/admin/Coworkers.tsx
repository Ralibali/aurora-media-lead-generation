import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, Check, ClipboardCheck, Loader2, PlayCircle, Plus, X } from "lucide-react";
import AdminShell, { adminFetch, AdminStatus } from "./AdminShell";

type Profile = {
  id: string;
  key: string;
  name: string;
  description: string;
  system_role: string;
  allowed_action_prefixes: string[];
  approval_mode: "always" | "read_only_auto";
};

type Task = {
  id: string;
  profile_id: string;
  title: string;
  goal: string;
  status: "queued" | "prepared" | "approved" | "executing" | "done" | "failed" | "cancelled";
  plan: {
    summary?: string;
    steps?: string[];
    unknowns?: string[];
    successCriteria?: string[];
    stagedRunIds?: string[];
    rejectedActions?: string[];
  };
  result_summary: Record<string, unknown> | null;
  created_at: string;
  coworker_profiles?: { key?: string; name?: string } | null;
};

type Run = {
  id: string;
  action_id: string;
  status: string;
  created_at: string;
  integration_connections?: { name?: string } | null;
};

type Data = { profiles: Profile[]; tasks: Task[]; runs: Run[] };

const card: React.CSSProperties = { background: "#fff", border: "1px solid var(--linje)", borderRadius: 12, padding: 18 };
const input: React.CSSProperties = { width: "100%", border: "1px solid var(--linje)", borderRadius: 8, padding: "9px 10px", fontSize: 13, background: "#fff" };

export default function Coworkers() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busyId, setBusyId] = useState("");
  const [form, setForm] = useState({ profile_id: "", title: "", goal: "" });

  const load = useCallback(async () => {
    try {
      const next = await adminFetch("admin-coworkers", { method: "POST", body: JSON.stringify({ action: "list" }) }) as Data;
      setData(next);
      setError(null);
      setForm((current) => ({ ...current, profile_id: current.profile_id || next.profiles[0]?.id || "" }));
    } catch (nextError) {
      setError(nextError);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selectedProfile = useMemo(
    () => data?.profiles.find((profile) => profile.id === form.profile_id) ?? null,
    [data, form.profile_id],
  );

  const mutate = async (payload: Record<string, unknown>, busyKey: string) => {
    setBusyId(busyKey);
    try {
      const next = await adminFetch("admin-coworkers", { method: "POST", body: JSON.stringify(payload) }) as Data;
      setData(next);
      setError(null);
      return true;
    } catch (nextError) {
      setError(nextError);
      return false;
    } finally {
      setBusyId("");
    }
  };

  return (
    <AdminShell title="AI Coworkers" kicker="Admin · Aurora Coworkers">
      <AdminStatus loading={!data && !error} error={error} onRetry={load} />

      <section style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <div>
            <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>MANAGED COWORKERS</p>
            <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>AI förbereder jobbet – människan släpper igenom actions</h2>
            <p style={{ margin: "7px 0 0", maxWidth: 780, fontSize: 13, color: "var(--granbark-mut)" }}>
              Varje coworker har en snäv roll och action-scope. Den får skapa en plan och stagea allowlistade integration-actions,
              men kan inte skicka, publicera eller ändra externa system utan separat godkännande i Integrations Hub.
            </p>
          </div>
          <Bot size={28} />
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const ok = await mutate({ action: "create_task", ...form }, "create");
            if (ok) setForm((current) => ({ ...current, title: "", goal: "" }));
          }}
          style={{ marginTop: 18, display: "grid", gap: 8 }}
        >
          <select style={input} value={form.profile_id} onChange={(e) => setForm((current) => ({ ...current, profile_id: e.target.value }))}>
            {(data?.profiles ?? []).map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select>
          {selectedProfile && (
            <div style={{ border: "1px solid var(--linje)", borderRadius: 9, padding: 11, fontSize: 12 }}>
              <strong>{selectedProfile.description}</strong>
              <p style={{ margin: "5px 0 0", color: "var(--granbark-mut)" }}>{selectedProfile.system_role}</p>
              <p style={{ margin: "5px 0 0", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                Scope: {selectedProfile.allowed_action_prefixes.join(", ") || "inga externa actions"}
              </p>
            </div>
          )}
          <input required style={input} placeholder="Uppgift, t.ex. Kvalificera veckans nya leads" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
          <textarea required rows={5} style={{ ...input, resize: "vertical" }} placeholder="Mål, tillgänglig kontext och vad ett bra resultat innebär" value={form.goal} onChange={(e) => setForm((current) => ({ ...current, goal: e.target.value }))} />
          <div>
            <button className="vk-btn vk-btn-primary" disabled={!form.profile_id || !form.title || !form.goal || busyId === "create"}>
              {busyId === "create" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Skapa uppgift
            </button>
          </div>
        </form>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <p className="vk-mono" style={{ margin: 0, color: "var(--granbark-mut)" }}>TASK QUEUE</p>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {(data?.tasks ?? []).map((task) => {
            const plan = task.plan ?? {};
            return (
              <article key={task.id} style={{ border: "1px solid var(--linje)", borderRadius: 11, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong>{task.title}</strong>
                    <span style={{ display: "block", marginTop: 3, fontSize: 11, color: "var(--granbark-mut)" }}>
                      {task.coworker_profiles?.name ?? task.profile_id} · {new Date(task.created_at).toLocaleString("sv-SE")}
                    </span>
                  </div>
                  <span className="vk-mono" style={{ fontSize: 10 }}>{task.status.toUpperCase()}</span>
                </div>

                <p style={{ margin: "10px 0", whiteSpace: "pre-wrap", fontSize: 13 }}>{task.goal}</p>

                {plan.summary && (
                  <div style={{ background: "#F7F7F4", borderRadius: 9, padding: 11, fontSize: 12 }}>
                    <strong>{plan.summary}</strong>
                    {(plan.steps ?? []).length > 0 && (
                      <ol style={{ paddingLeft: 20, margin: "8px 0 0" }}>
                        {(plan.steps ?? []).map((step, index) => <li key={index}>{step}</li>)}
                      </ol>
                    )}
                    {(plan.unknowns ?? []).length > 0 && <p style={{ margin: "8px 0 0", color: "#8A6518" }}>Okänt: {(plan.unknowns ?? []).join(" · ")}</p>}
                    {(plan.successCriteria ?? []).length > 0 && <p style={{ margin: "8px 0 0", color: "#2D6A4F" }}>Klart när: {(plan.successCriteria ?? []).join(" · ")}</p>}
                    {(plan.stagedRunIds ?? []).length > 0 && <p style={{ margin: "8px 0 0" }}>{(plan.stagedRunIds ?? []).length} integration-action(s) ligger stageade för separat godkännande.</p>}
                    {(plan.rejectedActions ?? []).length > 0 && <p style={{ margin: "8px 0 0", color: "#B4531A" }}>Stoppade action-förslag: {(plan.rejectedActions ?? []).join(", ")}</p>}
                  </div>
                )}

                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
                  {task.status === "queued" && (
                    <button className="vk-btn" disabled={Boolean(busyId)} onClick={() => mutate({ action: "prepare_task", task_id: task.id }, task.id)}>
                      {busyId === task.id ? <Loader2 size={13} className="animate-spin" /> : <PlayCircle size={13} />} Förbered med AI
                    </button>
                  )}
                  {task.status === "prepared" && (
                    <>
                      <button className="vk-btn" disabled={Boolean(busyId)} onClick={() => mutate({ action: "approve_task", task_id: task.id }, task.id)}>
                        <Check size={13} /> Godkänn plan
                      </button>
                      <button className="vk-btn vk-btn-primary" disabled={Boolean(busyId)} onClick={() => mutate({ action: "complete_task", task_id: task.id, result_summary: { note: "Slutförd manuellt efter granskning." } }, task.id)}>
                        <ClipboardCheck size={13} /> Markera klar
                      </button>
                    </>
                  )}
                  {task.status === "approved" && (
                    <button className="vk-btn vk-btn-primary" disabled={Boolean(busyId)} onClick={() => mutate({ action: "complete_task", task_id: task.id, result_summary: { note: "Godkänd plan slutförd. Externa actions hanteras separat i Integrations Hub." } }, task.id)}>
                      <ClipboardCheck size={13} /> Markera klar
                    </button>
                  )}
                  {["queued", "prepared", "approved"].includes(task.status) && (
                    <button className="vk-btn" disabled={Boolean(busyId)} onClick={() => mutate({ action: "cancel_task", task_id: task.id }, task.id)}>
                      <X size={13} /> Avbryt
                    </button>
                  )}
                </div>
              </article>
            );
          })}
          {data?.tasks.length === 0 && <p style={{ fontSize: 13, color: "var(--granbark-mut)" }}>Inga coworker-uppgifter ännu.</p>}
        </div>
      </section>
    </AdminShell>
  );
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { LockKeyhole, Loader2, ArrowLeft } from "lucide-react";
import { ADMIN_SESSION_ENDED, ADMIN_STORAGE_KEY, AdminError, endAdminSession, getAdminPassword, verifyAdminPassword } from "@/lib/adminClient";
const AdminSession = createContext({ logout: endAdminSession });
export const useAdminSession = () => useContext(AdminSession);
export default function AdminAccess({ children }: { children: ReactNode }) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(!!getAdminPassword());
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const ended = () => { setAuthed(false); setPassword(""); setError("Sessionen har avslutats. Logga in för att fortsätta."); };
    window.addEventListener(ADMIN_SESSION_ENDED, ended);
    const stored = getAdminPassword();
    if (stored) void verifyAdminPassword(stored, AbortSignal.any([controller.signal, AbortSignal.timeout(20000)])).then(() => {
      if (!controller.signal.aborted) setAuthed(true);
    }).catch(e => {
      if (controller.signal.aborted) return;
      if (e instanceof AdminError && e.kind === "auth") endAdminSession();
      setError(e.message);
    }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => { controller.abort(); window.removeEventListener(ADMIN_SESSION_ENDED, ended); };
  }, []);
  async function login(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !password.trim()) return;
    setBusy(true); setError("");
    try {
      await verifyAdminPassword(password.trim());
      sessionStorage.setItem(ADMIN_STORAGE_KEY, password.trim());
      setPassword(""); setAuthed(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Kunde inte logga in."); }
    finally { setBusy(false); }
  }
  if (authed) return <AdminSession.Provider value={{ logout: endAdminSession }}>{children}</AdminSession.Provider>;
  return <div className="verkstad" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}><div style={{ width: "100%", maxWidth: 430 }}>
    <Link to="/" className="am-text-link" style={{ display: "inline-flex", gap: 8, marginBottom: 25, fontSize: 14, color: "var(--gran)" }}><ArrowLeft size={17} /> Till webbplatsen</Link>
    <form onSubmit={login} style={{ background: "#fff", border: "1px solid var(--linje)", borderRadius: 14, padding: 32, display: "grid", gap: 18 }}>
      <LockKeyhole size={26} color="#0f5132" /><p className="vk-mono">Aurora Media · Admin</p><h1 style={{ fontSize: 30 }}>Välkommen tillbaka.</h1><p style={{ fontSize: 14, color: "var(--granbark-mut)" }}>Leads, uppföljning och innehåll på samma plats.</p>
      <label htmlFor="admin-password" style={{ fontSize: 14, fontWeight: 600 }}>Lösenord</label>
      <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} style={{ width: "100%", border: "1px solid var(--linje)", borderRadius: 8, padding: 13, fontSize: 16 }} />
      {error && <p role="alert" style={{ color: "#a33418", fontSize: 14 }}>{error}</p>}
      <button className="vk-btn vk-btn-primary" type="submit" disabled={busy || !password.trim()} style={{ justifyContent: "center" }}>{busy ? <><Loader2 className="animate-spin" size={17} /><span>Kontrollerar inloggning…</span></> : <span>Logga in</span>}</button>
    </form>
  </div></div>;
}

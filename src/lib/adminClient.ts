import { getFunctionUrl } from "./functionUrl";
export const ADMIN_STORAGE_KEY = "faq_analytics_pwd";
export const ADMIN_SESSION_ENDED = "aurora:admin-session-ended";
export type AdminErrorKind = "auth" | "network" | "server" | "notfound" | "parse" | "empty";
export class AdminError extends Error {
  constructor(public kind: AdminErrorKind, message: string, public options: { status?: number; path?: string; detail?: string } = {}) { super(message); }
  get status() { return this.options.status; }
  get path() { return this.options.path; }
  get detail() { return this.options.detail; }
}
export function getAdminPassword() { try { return sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? ""; } catch { return ""; } }
export function endAdminSession() {
  try { sessionStorage.removeItem(ADMIN_STORAGE_KEY); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(ADMIN_SESSION_ENDED));
}
export async function verifyAdminPassword(password: string, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(getFunctionUrl("list-leads"), { method: "POST", headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" }, body: JSON.stringify({ action: "list" }), signal: signal ?? AbortSignal.timeout(20000) });
  } catch { throw new AdminError("network", "Kunde inte nå servern. Försök igen."); }
  if (response.status === 401 || response.status === 403) throw new AdminError("auth", "Lösenordet fungerar inte. Kontrollera och försök igen.");
  if (!response.ok) throw new AdminError("server", `Inloggningen kunde inte kontrolleras (HTTP ${response.status}). Försök igen.`, { status: response.status });
  const data = await response.json().catch(() => null);
  if (!Array.isArray(data?.leads)) throw new AdminError("parse", "Servern gav ett oväntat svar. Försök igen.");
}
export async function adminFetch(path: string, init: RequestInit = {}) {
  const password = getAdminPassword();
  if (!password) throw new AdminError("auth", "Logga in för att fortsätta.", { path });
  let response: Response;
  try {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${password}`);
    headers.set("Content-Type", "application/json");
    response = await fetch(getFunctionUrl(path), { ...init, headers, signal: init.signal ?? AbortSignal.timeout(20000) });
  } catch { throw new AdminError("network", "Servern svarade inte. Försök igen.", { path }); }
  if (response.status === 401 || response.status === 403) { endAdminSession(); throw new AdminError("auth", "Sessionen har avslutats. Logga in igen.", { path }); }
  if (response.status === 404) throw new AdminError("notfound", "Den här funktionen är inte tillgänglig ännu.", { path, status: 404 });
  if (!response.ok) throw new AdminError("server", `Kunde inte hämta eller spara data (HTTP ${response.status}).`, { path, status: response.status });
  const data = await response.json().catch(() => { throw new AdminError("parse", "Servern gav ett ogiltigt svar.", { path }); });
  if (data?.error) throw new AdminError("server", String(data.error), { path });
  return data;
}

import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Search,
  Mail,
  Lock,
  Loader2,
  LogOut,
  AlertTriangle,
  WifiOff,
  ShieldAlert,
  Inbox,
} from "lucide-react";
import { setSEOMeta } from "@/lib/seoHelpers";
import "@/styles/verkstad.css";

export const ADMIN_STORAGE_KEY = "faq_analytics_pwd";
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const VERIFY_URL = `https://${PROJECT_ID}.functions.supabase.co/list-leads`;

export type AdminErrorKind = "auth" | "network" | "server" | "notfound" | "parse" | "empty";

export class AdminError extends Error {
  kind: AdminErrorKind;
  status?: number;
  path?: string;
  detail?: string;
  constructor(kind: AdminErrorKind, message: string, opts: { status?: number; path?: string; detail?: string } = {}) {
    super(message);
    this.kind = kind;
    this.status = opts.status;
    this.path = opts.path;
    this.detail = opts.detail;
  }
}

export const adminFetch = async (path: string, init: RequestInit = {}) => {
  const pwd = sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? "";
  if (!pwd) throw new AdminError("auth", "Inte inloggad.", { path });
  const url = `https://${PROJECT_ID}.functions.supabase.co/${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${pwd}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch (e) {
    throw new AdminError("network", "Nätverksfel — kunde inte nå servern.", {
      path,
      detail: e instanceof Error ? e.message : String(e),
    });
  }
  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    throw new AdminError("auth", "Fel lösenord — logga in på nytt.", { status: res.status, path });
  }
  if (res.status === 404) {
    throw new AdminError("notfound", `Endpoint saknas: ${path}`, { status: 404, path });
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AdminError("server", `Serverfel (${res.status}) från ${path}`, { status: res.status, path, detail });
  }
  try {
    return await res.json();
  } catch (e) {
    throw new AdminError("parse", "Kunde inte tolka svaret från servern.", {
      path,
      detail: e instanceof Error ? e.message : String(e),
    });
  }
};

const KIND_META: Record<AdminErrorKind, { label: string; Icon: typeof AlertTriangle; color: string }> = {
  auth: { label: "Autentiseringsfel", Icon: ShieldAlert, color: "#B4531A" },
  network: { label: "Nätverksfel", Icon: WifiOff, color: "#B4531A" },
  server: { label: "Serverfel", Icon: AlertTriangle, color: "#B4531A" },
  notfound: { label: "Saknad endpoint", Icon: AlertTriangle, color: "#B4531A" },
  parse: { label: "Ogiltigt svar", Icon: AlertTriangle, color: "#B4531A" },
  empty: { label: "Tom data", Icon: Inbox, color: "#6b6b6b" },
};

export function AdminStatus({
  error,
  loading,
  empty,
  onRetry,
  loadingLabel = "Laddar…",
}: {
  error?: unknown;
  loading?: boolean;
  empty?: boolean;
  onRetry?: () => void;
  loadingLabel?: string;
}) {
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--granbark-mut)" }}>
        <Loader2 size={16} className="animate-spin" /> {loadingLabel}
      </div>
    );
  }
  if (error) {
    const e = error instanceof AdminError ? error : new AdminError("server", error instanceof Error ? error.message : String(error));
    const meta = KIND_META[e.kind];
    return (
      <div
        role="alert"
        style={{
          border: `1px solid ${meta.color}33`,
          background: `${meta.color}0d`,
          borderRadius: 12,
          padding: 16,
          display: "grid",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: meta.color, fontWeight: 600 }}>
          <meta.Icon size={16} /> {meta.label}
          {e.status ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, opacity: 0.7 }}>HTTP {e.status}</span> : null}
        </div>
        <p style={{ margin: 0, fontSize: 14 }}>{e.message}</p>
        {e.path && (
          <p style={{ margin: 0, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--granbark-mut)" }}>
            endpoint: /{e.path}
          </p>
        )}
        {e.detail && (
          <details style={{ fontSize: 12, color: "var(--granbark-mut)" }}>
            <summary style={{ cursor: "pointer" }}>Teknisk detalj</summary>
            <pre style={{ whiteSpace: "pre-wrap", margin: "6px 0 0", fontFamily: "var(--font-mono)" }}>{e.detail}</pre>
          </details>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {onRetry && (
            <button className="vk-btn" onClick={onRetry} style={{ fontSize: 13 }}>Försök igen</button>
          )}
          {e.kind === "auth" && (
            <button
              className="vk-btn vk-btn-primary"
              onClick={() => { sessionStorage.removeItem(ADMIN_STORAGE_KEY); window.location.reload(); }}
              style={{ fontSize: 13 }}
            >
              Logga in igen
            </button>
          )}
        </div>
      </div>
    );
  }
  if (empty) {
    const meta = KIND_META.empty;
    return (
      <div style={{
        border: "1px dashed var(--linje)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: meta.color,
      }}>
        <meta.Icon size={16} /> Ingen data att visa än.
      </div>
    );
  }
  return null;
}

const NAV = [
  { to: "/admin", label: "Översikt", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/content", label: "Innehåll", icon: FileText },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/email", label: "E-post", icon: Mail },
];

type Props = { children: ReactNode; title: string; kicker?: string };

export default function AdminShell({ children, title, kicker = "Admin" }: Props) {
  const [pwd, setPwd] = useState(() => sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setSEOMeta({ title: `${title} · Admin · Aurora Media`, description: "Internt.", noindex: true });
  }, [title]);

  useEffect(() => {
    if (!pwd) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(VERIFY_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${pwd}`, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list" }),
        });
        if (res.ok) {
          setAuthed(true);
          sessionStorage.setItem(ADMIN_STORAGE_KEY, pwd);
        } else if (res.status === 401) {
          sessionStorage.removeItem(ADMIN_STORAGE_KEY);
          setError("Fel lösenord.");
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let res: Response;
    try {
      res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${pwd}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
    } catch (err) {
      setLoading(false);
      setError(
        `Nätverksfel — kunde inte nå servern. (${err instanceof Error ? err.message : "okänt fel"})`
      );
      return;
    }
    setLoading(false);
    if (res.status === 401 || res.status === 403) {
      setError("Fel lösenord. Kontrollera och försök igen.");
      return;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      setError(`Serverfel (HTTP ${res.status}) från list-leads.${body ? ` ${body.slice(0, 200)}` : ""}`);
      return;
    }
    sessionStorage.setItem(ADMIN_STORAGE_KEY, pwd);
    window.location.reload();
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setPwd("");
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="verkstad" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <form
          onSubmit={login}
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
            <h1 style={{ fontSize: 22, margin: 0 }}>Admin · inloggning</h1>
          </div>
          <input
            type="password"
            placeholder="Lösenord"
            autoFocus
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
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
          <button type="submit" className="vk-btn vk-btn-primary" disabled={loading || !pwd}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Logga in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="verkstad" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "220px 1fr" }}>
      <aside
        style={{
          background: "#14171A",
          color: "#fff",
          padding: "28px 16px",
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ padding: "0 8px 20px" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", opacity: 0.55, margin: 0 }}>
            AURORA MEDIA
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", opacity: 0.55, margin: "4px 0 0" }}>
            ADMIN
          </p>
        </div>
        {NAV.map((item) => {
          const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
                color: active ? "#fff" : "rgba(255,255,255,.65)",
                background: active ? "rgba(255,255,255,.08)" : "transparent",
                textDecoration: "none",
                fontWeight: active ? 600 : 400,
              }}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
        <div style={{ flex: 1 }} />
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 13,
            color: "rgba(255,255,255,.5)",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <LogOut size={14} /> Logga ut
        </button>
      </aside>
      <main style={{ minWidth: 0 }}>
        <div className="vk-wrap" style={{ paddingBlock: 40 }}>
          <p className="vk-mono" style={{ color: "var(--granbark-mut)" }}>{kicker}</p>
          <h1 style={{ marginTop: 8, fontSize: "clamp(32px, 4vw, 44px)" }}>{title}</h1>
          <div style={{ marginTop: 28 }}>{children}</div>
        </div>
      </main>
    </div>
  );
}

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
} from "lucide-react";
import { setSEOMeta } from "@/lib/seoHelpers";
import "@/styles/verkstad.css";

export const ADMIN_STORAGE_KEY = "faq_analytics_pwd";
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const VERIFY_URL = `https://${PROJECT_ID}.functions.supabase.co/list-leads`;

export const adminFetch = async (path: string, init: RequestInit = {}) => {
  const pwd = sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? "";
  if (!pwd) throw new Error("Inte inloggad.");
  const url = `https://${PROJECT_ID}.functions.supabase.co/${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${pwd}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 401) {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    window.location.reload();
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

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
    try {
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${pwd}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      if (res.status === 401) {
        setError("Fel lösenord.");
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      sessionStorage.setItem(ADMIN_STORAGE_KEY, pwd);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
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

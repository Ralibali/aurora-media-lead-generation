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
  Menu,
  X,
  Sparkles,
  BarChart3,
  PackageCheck,
  Radar,
} from "lucide-react";
import { setSEOMeta } from "@/lib/seoHelpers";
import { getFunctionUrl } from "@/lib/functionUrl";
import "@/styles/verkstad.css";


import { AdminError, type AdminErrorKind } from "@/lib/adminClient";
import { useAdminSession } from "./AdminAccess";
export { adminFetch, AdminError, ADMIN_STORAGE_KEY } from "@/lib/adminClient";

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
              onClick={() => { window.location.reload(); }}
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
  { to: "/admin/text-generator", label: "Textgenerator", icon: Sparkles },
  { to: "/admin/content", label: "Innehåll", icon: FileText },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/email", label: "E-post", icon: Mail },
  { to: "/admin/faq-rapport", label: "FAQ-rapport", icon: BarChart3 },
  { to: "/admin/prospektering", label: "Prospektering", icon: Radar },
  { to: "/admin/ai-kontoret", label: "AI-KONTORET", icon: PackageCheck },
  { to: "/admin/ai-kontoret/forhandsgranskning", label: "Förhandsgranska PDF", icon: FileText },
];

// Snabbmeny — visas överst i mobil-drawern för åtkomst med få klick.
const QUICK = [
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/text-generator", label: "Text", icon: Sparkles },
  { to: "/admin/content", label: "Innehåll", icon: FileText },
  { to: "/admin/seo", label: "SEO", icon: Search },
];


type Props = { children: ReactNode; title: string; kicker?: string };

export default function AdminShell({ children, title, kicker = "Admin" }: Props) {
  const { pathname } = useLocation();
  const { logout } = useAdminSession();
  useEffect(() => {
    setSEOMeta({ title: `${title} · Admin · Aurora Media`, description: "Internt.", noindex: true });
  }, [title]);
  return <AdminLayout pathname={pathname} onLogout={logout} title={title} kicker={kicker}>{children}</AdminLayout>;
}

function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile((e as MediaQueryList).matches);
    handler(mq);
    mq.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
  }, [breakpoint]);
  return isMobile;
}

function AdminLayout({
  children,
  pathname,
  onLogout,
  title,
  kicker,
}: {
  children: ReactNode;
  pathname: string;
  onLogout: () => void;
  title: string;
  kicker: string;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);
  // Lock scroll while drawer is open
  useEffect(() => {
    if (!isMobile) return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, isMobile]);

  const NavItems = ({ compact = false }: { compact?: boolean }) => (
    <>
      {NAV.map((item) => {
        const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: compact ? "12px 14px" : "10px 12px",
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
    </>
  );

  const Brand = () => (
    <div style={{ padding: "0 8px 20px" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", color: "#fff", opacity: 0.75, margin: 0 }}>
        AURORA MEDIA
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", color: "#fff", opacity: 0.75, margin: "4px 0 0" }}>
        ADMIN
      </p>
    </div>
  );

  const LogoutBtn = () => (
    <button
      onClick={onLogout}
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
  );

  if (isMobile) {
    return (
      <div className="verkstad" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: "#14171A",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", color: "#fff", opacity: 0.75, margin: 0 }}>
              AURORA · ADMIN
            </p>
            <p style={{ color: "#fff", margin: "2px 0 0", fontSize: 15, fontWeight: 600 }}>{title}</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            aria-label="Öppna meny"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40, borderRadius: 8, border: 0,
              background: "rgba(255,255,255,.08)", color: "#fff", cursor: "pointer",
            }}
          >
            <Menu size={20} />
          </button>
        </header>

        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 40 }}
          />
        )}
        <aside
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: "min(320px, 88vw)",
            background: "#14171A",
            color: "#fff",
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            transform: open ? "translateX(0)" : "translateX(-100%)",
            transition: "transform .25s ease",
            zIndex: 50,
            boxShadow: open ? "0 10px 40px rgba(0,0,0,.4)" : "none",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Brand />
            <button
              onClick={() => setOpen(false)}
              aria-label="Stäng meny"
              style={{
                width: 36, height: 36, borderRadius: 8, border: 0,
                background: "rgba(255,255,255,.08)", color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Snabbmeny */}
          <div>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em",
              opacity: 0.5, margin: "0 0 8px", padding: "0 4px",
            }}>
              SNABBÅTKOMST
            </p>
            <div
              role="navigation"
              aria-label="Snabbmeny"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 8,
              }}
            >
              {QUICK.map((q) => {
                const active = pathname === q.to || (q.to !== "/admin" && pathname.startsWith(q.to));
                return (
                  <NavLink
                    key={q.to}
                    to={q.to}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      minHeight: 72,
                      padding: "12px 14px",
                      borderRadius: 12,
                      textDecoration: "none",
                      color: "#fff",
                      background: active
                        ? "linear-gradient(135deg, rgba(120,200,170,.22), rgba(120,200,170,.08))"
                        : "rgba(255,255,255,.06)",
                      border: `1px solid ${active ? "rgba(120,200,170,.45)" : "rgba(255,255,255,.08)"}`,
                    }}
                  >
                    <q.icon size={20} />
                    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".01em" }}>{q.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Full nav */}
          <div style={{ display: "grid", gap: 4 }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em",
              opacity: 0.5, margin: "0 0 4px", padding: "0 4px",
            }}>
              ALLA SEKTIONER
            </p>
            <NavItems compact />
          </div>

          <div style={{ flex: 1 }} />
          <LogoutBtn />
        </aside>



        <main style={{ minWidth: 0, flex: 1 }}>
          <div className="vk-wrap" style={{ paddingBlock: 24, paddingInline: 16 }}>
            <p className="vk-mono" style={{ color: "var(--granbark-mut)", fontSize: 12 }}>{kicker}</p>
            <h1 style={{ marginTop: 6, fontSize: "clamp(24px, 6vw, 32px)", lineHeight: 1.15 }}>{title}</h1>
            <div style={{ marginTop: 20 }}>{children}</div>
          </div>
        </main>
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
        <Brand />
        <NavItems />
        <div style={{ flex: 1 }} />
        <LogoutBtn />
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


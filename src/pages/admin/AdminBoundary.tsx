import { Component, ReactNode, Suspense } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import "@/styles/verkstad.css";

type State = { error: Error | null };

/**
 * Visible loading indicator used as Suspense fallback for lazy-loaded admin
 * routes. Keeps the shell readable so a slow chunk never looks like a blank
 * page.
 */
export function AdminRouteFallback({ label = "Laddar adminsida…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="verkstad"
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        color: "var(--granbark-mut, #6b6b6b)",
        background: "var(--marmor, #f7f5f0)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono, ui-monospace)", fontSize: 13 }}>
        <Loader2 size={16} className="animate-spin" aria-hidden />
        <span>{label}</span>
      </div>
    </div>
  );
}

/**
 * Error boundary specifically for admin routes. Catches render errors, failed
 * lazy chunks and module-init throws (e.g. Supabase client construction) so a
 * single broken admin page never leaves the user staring at a white screen.
 */
class AdminErrorBoundaryInner extends Component<{ children: ReactNode; onReset: () => void }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Log to console for observability; never rethrow.
    console.error("[AdminBoundary]", error, info);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const err = this.state.error;
    const message = err?.message || String(err);
    const isChunk = /Loading chunk|dynamically imported module|Failed to fetch/i.test(message);
    const isConfig = /supabaseUrl|supabaseKey|Invalid URL|VITE_SUPABASE/i.test(message);

    const title = isChunk
      ? "Kunde inte ladda adminmodulen"
      : isConfig
      ? "Konfigurationsfel"
      : "Något gick fel i admin";

    const help = isChunk
      ? "En ny version kan ha publicerats. Ladda om sidan för att hämta den senaste."
      : isConfig
      ? "Backend-anslutningen saknas eller är felkonfigurerad. Ladda om sidan när den är återställd."
      : "Ett oväntat fel inträffade i den här adminvyn. Övriga adminvyer är opåverkade.";

    return (
      <div
        role="alert"
        className="verkstad"
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "var(--marmor, #f7f5f0)",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            background: "#fff",
            border: "1px solid var(--linje, #e6e2da)",
            borderRadius: 14,
            padding: 24,
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#B4531A", fontWeight: 600 }}>
            <AlertTriangle size={18} aria-hidden />
            <span>{title}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#333" }}>{help}</p>
          <details style={{ fontSize: 12, color: "var(--granbark-mut, #6b6b6b)" }}>
            <summary style={{ cursor: "pointer" }}>Teknisk detalj</summary>
            <pre style={{ whiteSpace: "pre-wrap", margin: "6px 0 0", fontFamily: "var(--font-mono, ui-monospace)" }}>
              {message}
            </pre>
          </details>
          <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
            <button
              className="vk-btn vk-btn-primary"
              onClick={() => window.location.reload()}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCw size={14} aria-hidden /> Ladda om sidan
            </button>
            <button className="vk-btn" onClick={this.reset}>
              Försök igen
            </button>
            <a className="vk-btn" href="/admin" style={{ textDecoration: "none" }}>
              Till översikten
            </a>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Route-element wrapper: renders the ErrorBoundary + Suspense around the
 * nested admin routes' <Outlet />. Mount this once as a parent route so every
 * admin child inherits the guard without wrapping each element manually.
 */
export default function AdminBoundary() {
  const navigate = useNavigate();
  return (
    <AdminErrorBoundaryInner onReset={() => navigate(0)}>
      <Suspense fallback={<AdminRouteFallback />}>
        <Outlet />
      </Suspense>
    </AdminErrorBoundaryInner>
  );
}

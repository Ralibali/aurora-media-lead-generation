import { Link, useNavigate } from "@/modules/shared/router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/modules/local-boost/integrations/supabase/client";

const NAV = [
  { to: "/dashboard", label: "Översikt" },
  { to: "/platser", label: "Platser" },
  { to: "/onboarding", label: "Onboarding" },
  { to: "/recensioner", label: "Recensioner" },
  { to: "/rankning", label: "Rankning" },
  { to: "/citeringar", label: "Citeringar" },
  { to: "/konkurrenter", label: "Konkurrenter" },
  { to: "/ai-synlighet", label: "AI-synlighet" },
  { to: "/atgarder", label: "Åtgärder" },
  { to: "/rapporter", label: "Rapporter" },
  { to: "/portal", label: "Kundportal" },
  { to: "/installningar", label: "Integrationer" },
  { to: "/logg", label: "Revisionslogg" },
] as const;

export function AppShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-sidebar-border bg-sidebar lg:min-h-screen lg:w-60 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="text-sm font-bold text-primary">
            Aurora Local
          </Link>
          <button
            onClick={signOut}
            className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Logga ut
          </button>
        </div>
        <nav className="flex flex-wrap gap-1 px-2 pb-3 lg:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-4 py-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions}
        </header>
        {children}
      </main>
    </div>
  );
}

export function Panel({
  title,
  children,
  right,
}: {
  title?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm mb-6 p-5">
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h2>
          {right}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Stat({
  label: statLabel,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{statLabel}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Loading() {
  return <p className="text-sm text-muted-foreground">Hämtar data …</p>;
}

export function ErrorNote({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Något gick fel.";
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
      {message}
    </div>
  );
}

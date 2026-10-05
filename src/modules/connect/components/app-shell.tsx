import { Link, useNavigate } from "@/modules/shared/router";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/modules/connect/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { to: "/oversikt", label: "Översikt" },
  { to: "/kunder", label: "Kunder" },
  { to: "/onboarding", label: "Ny kund" },
  { to: "/samtal", label: "Samtal" },
  { to: "/leads", label: "Leads" },
  { to: "/kvalitet", label: "Kvalitet" },
  { to: "/kostnader", label: "Kostnader" },
  { to: "/rosttester", label: "Rösttester" },
  { to: "/logg", label: "Logg" },
] as const;

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      className={className}
      style={{ backgroundColor: "hsl(var(--demo))", color: "hsl(var(--demo-foreground))" }}
    >
      DEMO
    </Badge>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-sidebar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link to="/oversikt" className="font-display text-base font-semibold">
            Aurora · AI-receptionist
          </Link>
          <nav className="flex flex-wrap gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                activeProps={{ className: "rounded-md px-3 py-1.5 text-sm bg-sidebar-accent text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/portal">
              <Button variant="ghost" size="sm">
                Kundportal
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={signOut}>
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

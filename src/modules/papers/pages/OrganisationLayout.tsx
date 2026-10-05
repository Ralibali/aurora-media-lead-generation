import { createFileRoute, Link, Outlet, useNavigate } from "@/modules/shared/router";
import { FileText, History, Inbox, LayoutDashboard, ListChecks, LogOut, Settings, Upload } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/modules/papers/client";
import { ROLE_LABEL } from "@/modules/papers/lib/aurora";
import { useOrg } from "@/modules/papers/lib/use-org";

export const Route = createFileRoute("/_authenticated/o/$orgId")({
  head: () => ({
    meta: [
      { title: "Inkorg – Aurora Receipt" },
      { name: "description", content: "Organisationens dokumentinkorg i Aurora Receipt." },
      { property: "og:title", content: "Inkorg – Aurora Receipt" },
      { property: "og:description", content: "Dokumentinkorg i Aurora Receipt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrgLayout,
});

const nav = [
  { to: "/o/$orgId", label: "Översikt", icon: LayoutDashboard, exact: true },
  { to: "/o/$orgId/inbox", label: "Inkorg", icon: Inbox },
  { to: "/o/$orgId/exports", label: "Export", icon: Upload },
  { to: "/o/$orgId/rules", label: "Leverantörsregler", icon: ListChecks },
  { to: "/o/$orgId/audit", label: "Audit log", icon: History },
  { to: "/o/$orgId/settings", label: "Team & inställningar", icon: Settings },
] as const;

function OrgLayout() {
  const { orgId, org, role, isLoading } = useOrg();
  const navigate = useNavigate();

  if (isLoading) return <div className="p-10"><Skeleton className="h-40" /></div>;
  if (!org || !role)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="font-medium">Organisationen finns inte eller så saknar du åtkomst.</p>
        <Button asChild variant="secondary"><Link to="/app">Till dina organisationer</Link></Button>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-background md:flex">
        <Link to="/app" className="flex items-center gap-2 px-5 py-5">
          <span className="bg-aurora inline-flex size-7 items-center justify-center rounded-md">
            <FileText className="size-4 text-primary-foreground" />
          </span>
          <span className="font-semibold tracking-tight">Aurora Receipt</span>
        </Link>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={`/portal/papers${n.to.replace("$orgId", encodeURIComponent(orgId))}`}
              end={"exact" in n}
              className={({ isActive }) => `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary hover:text-foreground ${isActive ? "bg-secondary font-medium text-foreground" : "text-muted-foreground"}`}
            >
              <n.icon className="size-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}>
            <LogOut className="mr-2 size-4" /> Logga ut
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 bg-background px-5 py-3">
          <div className="flex items-center gap-2">
            <Link to="/app" className="font-medium hover:underline">{org.name}</Link>
            {org.is_demo && <Badge className="bg-accent text-accent-foreground">DEMO – exempeldata</Badge>}
          </div>
          <Badge variant="outline">{ROLE_LABEL[role]}</Badge>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border/60 bg-background px-3 py-2 md:hidden">
          {nav.map((n) => (
            <NavLink key={n.to} to={`/portal/papers${n.to.replace("$orgId", encodeURIComponent(orgId))}`} end={"exact" in n} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


export default OrgLayout;

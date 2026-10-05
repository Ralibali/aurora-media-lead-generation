import { createFileRoute, Link } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, DemoBadge } from "@/modules/connect/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listOrganizations } from "@/modules/connect/lib/aurora.functions";

export const Route = createFileRoute("/_authenticated/kunder/")({
  head: () => ({
    meta: [
      { title: "Kunder – Aurora Voice" },
      { name: "description", content: "Alla anslutna verksamheter, deras bransch, status och demoläge." },
      { property: "og:title", content: "Kunder – Aurora Voice" },
      { property: "og:description", content: "Kundlista i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const orgs = useQuery({ queryKey: ["orgs"], queryFn: () => listOrganizations() });

  return (
    <AppShell
      title="Kunder"
      description="Varje kund är helt separerad. Kunden ser bara sina egna uppgifter i kundportalen."
      actions={
        <Link to="/onboarding">
          <Button>Ny kund</Button>
        </Link>
      }
    >
      <Card>
        <CardContent className="space-y-2 pt-6">
          {orgs.isLoading ? <p className="text-sm text-muted-foreground">Hämtar kunder…</p> : null}
          {orgs.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga kunder ännu.</p>
          ) : null}
          {orgs.data?.map((org) => (
            <Link
              key={org.id}
              to="/kunder/$orgId"
              params={{ orgId: org.id }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-secondary"
            >
              <div>
                <p className="font-medium">{org.name}</p>
                <p className="text-sm text-muted-foreground">
                  {org.city ?? "Ort saknas"} · {org.contact_email ?? "E-post saknas"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{org.vertical}</Badge>
                <Badge variant="secondary">{org.status}</Badge>
                {org.demo_mode ? <DemoBadge /> : null}
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

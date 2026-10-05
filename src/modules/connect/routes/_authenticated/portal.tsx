import { createFileRoute, Link } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell, DemoBadge } from "@/modules/connect/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMe, getOrganization, getUsage, listCalls, listLeads, listOrganizations } from "@/modules/connect/lib/aurora.functions";
import { formatSek, roundSek } from "@/modules/connect/lib/pricing";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Kundportal – Aurora Voice" },
      { name: "description", content: "Kundens egen vy över samtal, leads, kunskapsbas och kostnad." },
      { property: "og:title", content: "Kundportal – Aurora Voice" },
      { property: "og:description", content: "Kundvy i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const orgs = useQuery({ queryKey: ["organizations"], queryFn: () => listOrganizations() });
  const [selected, setSelected] = useState<string | null>(null);

  const available = (orgs.data ?? []).map((o) => ({ id: o.id, name: o.name }));
  const orgId = selected ?? available[0]?.id ?? null;

  const detail = useQuery({
    queryKey: ["org", orgId],
    queryFn: () => getOrganization({ data: { orgId: orgId as string } }),
    enabled: Boolean(orgId),
  });
  const calls = useQuery({
    queryKey: ["calls", orgId],
    queryFn: () => listCalls({ data: { orgId: orgId as string } }),
    enabled: Boolean(orgId),
  });
  const leads = useQuery({
    queryKey: ["leads", orgId],
    queryFn: () => listLeads({ data: { orgId: orgId as string } }),
    enabled: Boolean(orgId),
  });
  const usage = useQuery({
    queryKey: ["usage", orgId],
    queryFn: () => getUsage({ data: { orgId: orgId as string } }),
    enabled: Boolean(orgId),
  });

  const realCalls = (calls.data ?? []).filter((c) => !c.is_demo);
  const demoCalls = (calls.data ?? []).filter((c) => c.is_demo);
  const qualified = (leads.data ?? []).filter((l) => !l.is_demo && l.status !== "new").length;
  const spend = roundSek(
    (usage.data?.usage ?? []).filter((u) => !u.is_demo).reduce((sum, u) => sum + Number(u.cost_sek), 0),
  );

  return (
    <AppShell
      title="Kundportal"
      description={
        me.data?.isStaff
          ? "Så här ser kundens egen vy ut. Välj kund för att förhandsgranska."
          : "Din vy över samtal, leads och kostnad."
      }
      actions={
        available.length > 1 ? (
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={orgId ?? ""}
            onChange={(e) => setSelected(e.target.value)}
          >
            {available.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        ) : null
      }
    >
      {!orgId ? <p className="text-sm text-muted-foreground">Ingen kund kopplad till ditt konto ännu.</p> : null}

      {orgId ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Riktiga samtal" value={String(realCalls.length)} />
            <StatCard label="Kvalificerade leads" value={String(qualified)} />
            <StatCard label="Kostnad denna period" value={formatSek(spend)} />
            <StatCard label="DEMO-samtal" value={String(demoCalls.length)} hint="Räknas aldrig som affär" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Senaste samtal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(calls.data ?? []).slice(0, 10).map((call) => (
                  <Link
                    key={call.id}
                    to="/samtal/$callId"
                    params={{ callId: call.id }}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
                  >
                    <span>
                      {new Date(call.started_at).toLocaleString("sv-SE")} · {call.outcome}
                    </span>
                    {call.is_demo ? <DemoBadge /> : <Badge variant="secondary">Riktigt</Badge>}
                  </Link>
                ))}
                {(calls.data ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Inga samtal ännu.</p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kunskapsbas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(detail.data?.knowledge ?? []).slice(0, 12).map((item) => (
                  <div key={item.id} className="rounded-lg border border-border px-4 py-2 text-sm">
                    <p className="font-medium">{item.question}</p>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
                {(detail.data?.knowledge ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Inga frågor och svar ännu.</p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

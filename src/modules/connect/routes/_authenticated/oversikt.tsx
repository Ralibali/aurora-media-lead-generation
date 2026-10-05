import { createFileRoute, Link } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { useEffect } from "react";
import { AppShell, DemoBadge } from "@/modules/connect/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { claimFirstAdmin, getMe, getOverview, getProviderHealth } from "@/modules/connect/lib/aurora.functions";
import { formatSek, mrrSek, roundSek } from "@/modules/connect/lib/pricing";
import { summarizeReadiness } from "@/modules/connect/lib/voice-readiness";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/oversikt")({
  head: () => ({
    meta: [
      { title: "Översikt – Aurora Voice" },
      { name: "description", content: "Kommersiell översikt: kunder, agenter, samtal, leads, kostnad och MRR." },
      { property: "og:title", content: "Översikt – Aurora Voice" },
      { property: "og:description", content: "Kommersiell översikt för Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OverviewPage,
});

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function OverviewPage() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const overview = useQuery({ queryKey: ["overview"], queryFn: () => getOverview() });
  const health = useQuery({ queryKey: ["provider-health"], queryFn: () => getProviderHealth() });
  const claim = useServerFn(claimFirstAdmin);

  useEffect(() => {
    if (me.data && !me.data.isStaff && me.data.memberships.length === 0) {
      claim({})
        .then((res) => {
          if (res.granted) {
            toast.success(res.reason);
            me.refetch();
          }
        })
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.data]);

  const loadError = me.error ?? overview.error ?? health.error;
  if (loadError) {
    return (
      <AppShell title="Kommersiell översikt">
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <p>{loadError instanceof Error ? loadError.message : "Översikten kunde inte hämtas."}</p>
          <Button className="mt-3" variant="outline" onClick={() => {
            void me.refetch();
            void overview.refetch();
            void health.refetch();
          }}>Försök igen</Button>
        </div>
      </AppShell>
    );
  }

  const data = overview.data;
  const calls = data?.calls ?? [];
  const realCalls = calls.filter((c) => !c.is_demo);
  const demoCalls = calls.filter((c) => c.is_demo);
  const leads = data?.leads ?? [];
  const qualified = leads.filter((l) => ["qualified", "booked", "won"].includes(l.status));
  const providerCost = roundSek(
    (data?.usage ?? []).filter((u) => !u.is_demo).reduce((sum, u) => sum + Number(u.cost_sek), 0),
  );
  const mrr = mrrSek(
    (data?.subscriptions ?? []).map((s) => ({
      monthlyFeeSek: Number(s.mrr_sek),
      active: s.status === "active",
    })),
  );
  const readiness = summarizeReadiness(
    (data?.voiceTests ?? []).map((t) => ({
      scenario_key: t.scenario_key,
      status: t.status,
      is_real_call: t.is_real_call,
    })),
  );

  return (
    <AppShell
      title="Kommersiell översikt"
      description="Siffrorna nedan kommer direkt ur databasen. Demonstrationsdata räknas separat och är märkt DEMO."
      actions={
        <Link to="/onboarding">
          <Button>Ny kund</Button>
        </Link>
      }
    >
      {overview.isLoading ? <p className="text-sm text-muted-foreground">Hämtar data…</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Kunder" value={String(data?.organizations.length ?? 0)} />
        <Stat
          label="Agenter live"
          value={String((data?.agents ?? []).filter((a) => a.status === "live").length)}
          hint={`${data?.agents.length ?? 0} totalt`}
        />
        <Stat
          label="Riktiga samtal"
          value={String(realCalls.length)}
          hint={`${demoCalls.length} DEMO-samtal exkluderade`}
        />
        <Stat label="Kvalificerade leads" value={String(qualified.length)} hint={`${leads.length} totalt`} />
        <Stat label="MRR" value={formatSek(mrr)} hint="Aktiva abonnemang, exkl. uppstart" />
        <Stat label="Leverantörskostnad" value={formatSek(providerCost)} hint="Endast riktig användning" />
        <Stat
          label="Röstberedskap"
          value={`${readiness.passed}/${readiness.total}`}
          hint={readiness.swedishVoiceProven ? "Bevisad med riktiga samtal" : "Ej bevisad ännu"}
        />
        <Stat
          label="Röstmotor"
          value={health.data?.health.reachable ? "Ansluten" : "Demo"}
          hint={health.data?.health.message ?? ""}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Kunder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data?.organizations ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Inga kunder ännu. Starta med onboarding-guiden.
            </p>
          ) : null}
          {(data?.organizations ?? []).map((org) => (
            <Link
              key={org.id}
              to="/kunder/$orgId"
              params={{ orgId: org.id }}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-secondary"
            >
              <span className="font-medium">{org.name}</span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{org.vertical}</Badge>
                <Badge variant="secondary">{org.status}</Badge>
                {org.demo_mode ? <DemoBadge /> : null}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

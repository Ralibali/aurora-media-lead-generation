import { createFileRoute, Link } from "@/modules/shared/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel, Stat } from "@/modules/local-boost/components/AppShell";
import { DemoBadge } from "@/modules/local-boost/components/DemoBadge";
import { claimFirstAdmin, getOverview } from "@/modules/local-boost/lib/aurora.functions";
import { calculateMrr, calculatePipelineOnboarding, formatSek } from "@/modules/local-boost/lib/pricing";
import { healthLabel } from "@/modules/local-boost/lib/health";
import { label } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Översikt — Aurora Local" },
      { name: "description", content: "Kommersiell översikt: intäkt per månad, platser, hälsa och åtgärdsläge." },
      { property: "og:title", content: "Översikt — Aurora Local" },
      { property: "og:description", content: "Kommersiell översikt för Aurora Media AB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const fetchOverview = useServerFn(getOverview);
  const claim = useServerFn(claimFirstAdmin);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["overview"],
    queryFn: () => fetchOverview(),
  });

  const claimMutation = useMutation({
    mutationFn: () => claim(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["overview"] }),
  });

  if (isLoading) return <AppShell title="Översikt"><Loading /></AppShell>;
  if (error) return <AppShell title="Översikt"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  const { locations, plans, organizations, actions, pendingApprovals, access } = data;
  const mrr = calculateMrr(locations as never, plans as never);
  const onboardingValue = calculatePipelineOnboarding(locations as never, plans as never);
  const activeCount = locations.filter((l) => l.status === "active").length;
  const openActions = actions.filter((a) => a.status !== "done").length;
  const avgHealth = locations.length
    ? Math.round(locations.reduce((s: number, l) => s + l.health_score, 0) / locations.length)
    : 0;
  const hasDemo = locations.some((l) => l.is_demo);

  return (
    <AppShell
      title="Kommersiell översikt"
      description="Återkommande intäkt, driftläge och vad som väntar på åtgärd just nu."
    >
      {!access.isStaff && access.orgIds.length === 0 ? (
        <Panel title="Kom igång">
          <p className="text-sm text-muted-foreground">
            Ditt konto saknar ännu behörighet. Är du ägaren av Aurora Media AB kan du ta
            administratörsrollen om ingen redan har den.
          </p>
          <button
            onClick={() => claimMutation.mutate()}
            className="mt-3 rounded-md px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground"
          >
            Bli Aurora-admin
          </button>
          {claimMutation.data ? (
            <p className="mt-3 text-sm">{claimMutation.data.message}</p>
          ) : null}
          {claimMutation.error ? <ErrorNote error={claimMutation.error} /> : null}
        </Panel>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="MRR" value={formatSek(mrr)} hint={`${activeCount} aktiva platser`} />
        <Stat
          label="Onboarding i pipeline"
          value={formatSek(onboardingValue)}
          hint="Engångsavgifter ej fakturerade"
        />
        <Stat label="Kunder" value={String(organizations.length)} hint={`${locations.length} platser totalt`} />
        <Stat label="Snitthälsa" value={`${avgHealth} / 100`} hint={healthLabel(avgHealth)} />
      </div>

      {hasDemo ? (
        <p className="mb-6 text-xs text-muted-foreground">
          <DemoBadge /> Siffrorna ovan innehåller demokunder. Ta bort demodata innan du visar det för
          en riktig kund.
        </p>
      ) : null}

      <Panel title={`Väntar på godkännande (${pendingApprovals.length})`}>
        {pendingApprovals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inget väntar på godkännande.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {pendingApprovals.slice(0, 5).map((item) => (
              <li key={item.id} className="rounded-md border border-border p-3">
                {item.draft_text.slice(0, 140)}…
              </li>
            ))}
          </ul>
        )}
        <Link to="/recensioner" className="mt-3 inline-block text-sm text-primary">
          Gå till recensionskön →
        </Link>
      </Panel>

      <Panel title={`Öppna åtgärder (${openActions})`}>
        <ul className="space-y-2 text-sm">
          {actions
            .filter((a) => a.status !== "done")
            .slice(0, 6)
            .map((action) => (
              <li key={action.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <span>
                  {action.title} {action.is_demo ? <DemoBadge className="ml-1" /> : null}
                </span>
                <span className="text-xs text-muted-foreground">{label(action.status)}</span>
              </li>
            ))}
        </ul>
      </Panel>

      <Panel title="Platser">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Plats</th>
                <th>Ort</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Hälsa</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id} className="border-t border-border">
                  <td className="py-2">
                    <Link to="/platser/$id" params={{ id: location.id }} className="text-primary">
                      {location.name}
                    </Link>{" "}
                    {location.is_demo ? <DemoBadge /> : null}
                  </td>
                  <td>{location.city ?? "—"}</td>
                  <td>{location.plan_code ?? "—"}</td>
                  <td>{label(location.status)}</td>
                  <td>{location.health_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}

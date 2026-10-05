import { createFileRoute } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel, Stat } from "@/modules/local-boost/components/AppShell";
import { DemoBadge } from "@/modules/local-boost/components/DemoBadge";
import { getOverview, getReports } from "@/modules/local-boost/lib/aurora.functions";
import { healthLabel } from "@/modules/local-boost/lib/health";
import { formatDate, label } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Kundportal — Aurora Local" },
      { name: "description", content: "Kundens vy: hälsa, åtgärder som väntar och månadsrapporter." },
      { property: "og:title", content: "Kundportal — Aurora Local" },
      { property: "og:description", content: "Enkel översikt för kunden." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const fetchOverview = useServerFn(getOverview);
  const fetchReports = useServerFn(getReports);
  const overview = useQuery({ queryKey: ["overview"], queryFn: () => fetchOverview() });
  const reports = useQuery({ queryKey: ["reports"], queryFn: () => fetchReports() });

  if (overview.isLoading) return <AppShell title="Kundportal"><Loading /></AppShell>;
  if (overview.error) return <AppShell title="Kundportal"><ErrorNote error={overview.error} /></AppShell>;
  if (!overview.data) return null;

  const locations = overview.data.locations;
  const waiting = (overview.data.actions).filter(
    (a) => a.owner === "client" && a.status !== "done",
  );
  const avgHealth = locations.length
    ? Math.round(locations.reduce((s, l) => s + l.health_score, 0) / locations.length)
    : 0;

  return (
    <AppShell
      title="Kundportal"
      description="Så här ser kunden sitt konto: läget, vad vi behöver från dem och rapporterna."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Platser" value={String(locations.length)} />
        <Stat label="Snitthälsa" value={`${avgHealth} / 100`} hint={healthLabel(avgHealth)} />
        <Stat label="Väntar på dig" value={String(waiting.length)} hint="Åtgärder hos kunden" />
      </div>

      <Panel title="Vi behöver din hjälp med">
        {waiting.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inget väntar på dig just nu.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {waiting.map((action) => (
              <li key={action.id} className="rounded-md border border-border p-3">
                {action.title} {action.is_demo ? <DemoBadge /> : null}
                <span className="block text-xs text-muted-foreground">
                  Senast {formatDate(action.due_date)} · {label(action.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Dina rapporter">
        {reports.isLoading ? <Loading /> : null}
        {reports.data && reports.data.reports.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {(reports.data.reports).map((report) => (
              <li key={report.id} className="rounded-md border border-border p-3">
                {formatDate(report.period_month)} {report.is_demo ? <DemoBadge /> : null}
                <span className="block text-muted-foreground">{report.summary}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Inga rapporter ännu.</p>
        )}
      </Panel>
    </AppShell>
  );
}

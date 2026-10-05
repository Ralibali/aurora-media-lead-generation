import { createFileRoute } from "@/modules/shared/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { useState } from "react";
import { AppShell, ErrorNote, Loading, Panel } from "@/modules/local-boost/components/AppShell";
import { DemoBadge } from "@/modules/local-boost/components/DemoBadge";
import { generateMonthlyReport, getReports } from "@/modules/local-boost/lib/aurora.functions";
import { formatDate } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/rapporter")({
  head: () => ({
    meta: [
      { title: "Rapporter — Aurora Local" },
      { name: "description", content: "Månadsrapporter per plats och kund." },
      { property: "og:title", content: "Rapporter — Aurora Local" },
      { property: "og:description", content: "Månadsrapportering till kund." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const fetchReports = useServerFn(getReports);
  const generate = useServerFn(generateMonthlyReport);
  const queryClient = useQueryClient();
  const [locationId, setLocationId] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["reports"],
    queryFn: () => fetchReports(),
  });

  const mutation = useMutation({
    mutationFn: (id: string) => generate({ data: { locationId: id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
  });

  if (isLoading) return <AppShell title="Rapporter"><Loading /></AppShell>;
  if (error) return <AppShell title="Rapporter"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  const locationById = new Map(data.locations.map((l) => [l.id, l]));

  return (
    <AppShell title="Rapporter" description="Månadsrapport per plats. Rapporter med simulerad data märks DEMO.">
      <Panel title="Skapa rapport">
        <div className="flex flex-wrap gap-2">
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Välj plats …</option>
            {data.locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <button
            disabled={!locationId || mutation.isPending}
            onClick={() => mutation.mutate(locationId)}
            className="rounded-md px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
          >
            Skapa månadsrapport
          </button>
        </div>
        {mutation.error ? <ErrorNote error={mutation.error} /> : null}
      </Panel>

      <Panel title="Rapporter">
        {data.reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga rapporter ännu.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(data.reports).map((report) => (
              <li key={report.id} className="rounded-md border border-border p-3">
                <p className="font-medium">
                  {(locationById.get(report.location_id))?.name ?? "Hela kunden"} ·{" "}
                  {formatDate(report.period_month)} {report.is_demo ? <DemoBadge /> : null}
                </p>
                <p className="text-muted-foreground">{report.summary}</p>
                <pre className="mt-2 overflow-x-auto rounded bg-muted/50 p-2 text-xs">
                  {JSON.stringify(report.metrics, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}

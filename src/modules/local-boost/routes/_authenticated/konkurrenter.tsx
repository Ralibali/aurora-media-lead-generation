import { createFileRoute } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel } from "@/modules/local-boost/components/AppShell";
import { DemoBadge, NotConfigured } from "@/modules/local-boost/components/DemoBadge";
import { getLocalDataOverview } from "@/modules/local-boost/lib/aurora.functions";

export const Route = createFileRoute("/_authenticated/konkurrenter")({
  head: () => ({
    meta: [
      { title: "Konkurrenter — Aurora Local" },
      { name: "description", content: "Bevakning av lokala konkurrenter per plats." },
      { property: "og:title", content: "Konkurrenter — Aurora Local" },
      { property: "og:description", content: "Betyg och antal omdömen hos konkurrenter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CompetitorsPage,
});

function CompetitorsPage() {
  const fetchData = useServerFn(getLocalDataOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["local-data"],
    queryFn: () => fetchData(),
  });

  if (isLoading) return <AppShell title="Konkurrenter"><Loading /></AppShell>;
  if (error) return <AppShell title="Konkurrenter"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  const locationById = new Map(data.locations.map((l) => [l.id, l]));

  return (
    <AppShell
      title="Konkurrensbevakning"
      description="Jämför betyg och omdömesvolym mot de närmaste konkurrenterna."
    >
      {data.providers.localData.mode === "not_configured" ? (
        <Panel>
          <NotConfigured message={`${data.providers.localData.name}: ej konfigurerad. Konkurrentdata uppdateras inte automatiskt.`} />
        </Panel>
      ) : null}

      <Panel title="Bevakade konkurrenter">
        {data.competitors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga konkurrenter registrerade.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(data.competitors).map((competitor) => (
              <li
                key={competitor.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
              >
                <span>
                  {competitor.name} {competitor.is_demo ? <DemoBadge /> : null}
                  <span className="block text-xs text-muted-foreground">
                    {(locationById.get(competitor.location_id))?.name ?? "—"}
                    {competitor.notes ? ` · ${competitor.notes}` : ""}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {competitor.gbp_rating ?? "—"} / 5 · {competitor.review_count ?? 0} omdömen
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}

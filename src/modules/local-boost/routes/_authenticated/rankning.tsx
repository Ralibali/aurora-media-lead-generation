import { createFileRoute } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel } from "@/modules/local-boost/components/AppShell";
import { DemoBadge, NotConfigured } from "@/modules/local-boost/components/DemoBadge";
import { getLocalDataOverview } from "@/modules/local-boost/lib/aurora.functions";
import { formatDate } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/rankning")({
  head: () => ({
    meta: [
      { title: "Rankning — Aurora Local" },
      { name: "description", content: "Lokal synlighet per sökord och plats." },
      { property: "og:title", content: "Rankning — Aurora Local" },
      { property: "og:description", content: "Sökordsplaceringar per plats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RankingsPage,
});

function RankingsPage() {
  const fetchData = useServerFn(getLocalDataOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["local-data"],
    queryFn: () => fetchData(),
  });

  if (isLoading) return <AppShell title="Rankning"><Loading /></AppShell>;
  if (error) return <AppShell title="Rankning"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  const locationById = new Map(data.locations.map((l) => [l.id, l]));
  const latestByKeyword = new Map<string, (typeof data.ranks)[number]>();
  for (const snapshot of data.ranks) {
    if (!latestByKeyword.has(snapshot.keyword_id)) latestByKeyword.set(snapshot.keyword_id, snapshot);
  }

  return (
    <AppShell
      title="Rankning och lokal synlighet"
      description="Placeringar hämtas via en dataleverantör. Utan koppling visas ingen siffra."
    >
      <Panel title="Leverantör">
        {data.providers.localData.mode === "not_configured" ? (
          <NotConfigured
            message={`${data.providers.localData.name}: ej konfigurerad. Lagrade mätpunkter nedan kan komma från demoläge.`}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Aktiv leverantör: {data.providers.localData.name} ({data.providers.localData.mode})
          </p>
        )}
      </Panel>

      <Panel title="Sökord">
        {data.keywords.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga sökord upplagda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Sökord</th>
                  <th>Plats</th>
                  <th>Position</th>
                  <th>Lokal topplista</th>
                  <th>Mätt</th>
                </tr>
              </thead>
              <tbody>
                {(data.keywords).map((keyword) => {
                  const latest = latestByKeyword.get(keyword.id);
                  const location = locationById.get(keyword.location_id);
                  return (
                    <tr key={keyword.id} className="border-t border-border">
                      <td className="py-2">
                        {keyword.phrase} {keyword.is_demo ? <DemoBadge /> : null}
                      </td>
                      <td>{location?.name ?? "—"}</td>
                      <td>{latest?.position ?? "—"}</td>
                      <td>{latest?.local_pack_position ?? "—"}</td>
                      <td>{formatDate(latest?.captured_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}

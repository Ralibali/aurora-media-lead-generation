import { createFileRoute } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel, Stat } from "@/modules/local-boost/components/AppShell";
import { DemoBadge, NotConfigured } from "@/modules/local-boost/components/DemoBadge";
import { getLocalDataOverview } from "@/modules/local-boost/lib/aurora.functions";
import { formatDate, label } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/citeringar")({
  head: () => ({
    meta: [
      { title: "Citeringar — Aurora Local" },
      { name: "description", content: "Kontroll av namn, adress och telefon i kataloger." },
      { property: "og:title", content: "Citeringar — Aurora Local" },
      { property: "og:description", content: "NAP-konsekvens per plats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CitationsPage,
});

function CitationsPage() {
  const fetchData = useServerFn(getLocalDataOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["local-data"],
    queryFn: () => fetchData(),
  });

  if (isLoading) return <AppShell title="Citeringar"><Loading /></AppShell>;
  if (error) return <AppShell title="Citeringar"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  const locationById = new Map(data.locations.map((l) => [l.id, l]));
  const citations = data.citations;
  const mismatches = citations.filter((c) => c.status === "mismatch").length;
  const missing = citations.filter((c) => c.status === "missing").length;

  return (
    <AppShell
      title="Citeringar och NAP-konsekvens"
      description="Företagsuppgifter ska vara identiska överallt. Avvikelser blir åtgärder."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Kontrollerade poster" value={String(citations.length)} />
        <Stat label="Avvikelser" value={String(mismatches)} hint="Namn, adress eller telefon skiljer sig" />
        <Stat label="Saknade" value={String(missing)} hint="Företaget finns inte i katalogen" />
      </div>

      {data.providers.localData.mode === "not_configured" ? (
        <Panel>
          <NotConfigured message={`${data.providers.localData.name}: ej konfigurerad. Nya kontroller körs inte automatiskt.`} />
        </Panel>
      ) : null}

      <Panel title="Poster">
        {citations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga kontroller registrerade.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Katalog</th>
                  <th>Plats</th>
                  <th>Status</th>
                  <th>Hittat namn</th>
                  <th>Kontrollerad</th>
                </tr>
              </thead>
              <tbody>
                {citations.map((citation) => (
                  <tr key={citation.id} className="border-t border-border">
                    <td className="py-2">
                      {citation.directory} {citation.is_demo ? <DemoBadge /> : null}
                    </td>
                    <td>{(locationById.get(citation.location_id))?.name ?? "—"}</td>
                    <td>{label(citation.status)}</td>
                    <td>{citation.found_name ?? "—"}</td>
                    <td>{formatDate(citation.checked_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}

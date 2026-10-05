import { createFileRoute } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel } from "@/modules/local-boost/components/AppShell";
import { DemoBadge, NotConfigured } from "@/modules/local-boost/components/DemoBadge";
import { getLocalDataOverview } from "@/modules/local-boost/lib/aurora.functions";
import { formatDate } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/ai-synlighet")({
  head: () => ({
    meta: [
      { title: "AI-synlighet — Aurora Local" },
      { name: "description", content: "Syns företaget när kunder frågar en AI-assistent?" },
      { property: "og:title", content: "AI-synlighet — Aurora Local" },
      { property: "og:description", content: "Modul förberedd för Aurora Sight." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AiVisibilityPage,
});

function AiVisibilityPage() {
  const fetchData = useServerFn(getLocalDataOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["local-data"],
    queryFn: () => fetchData(),
  });

  if (isLoading) return <AppShell title="AI-synlighet"><Loading /></AppShell>;
  if (error) return <AppShell title="AI-synlighet"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  const locationById = new Map(data.locations.map((l) => [l.id, l]));

  return (
    <AppShell
      title="AI-synlighet"
      description="Mäter om företaget nämns när kunder ställer frågor till AI-assistenter."
    >
      <Panel title="Aurora Sight">
        {data.providers.auroraSight.mode === "not_configured" ? (
          <NotConfigured message="Aurora Sight är inte kopplat. Inga mätningar körs och inga siffror hämtas. Modulen är förberedd via ett leverantörsgränssnitt och aktiveras när tjänsten finns." />
        ) : (
          <p className="text-sm text-muted-foreground">
            Aktiv leverantör: {data.providers.auroraSight.name} ({data.providers.auroraSight.mode})
          </p>
        )}
      </Panel>

      <Panel title="Sparade mätpunkter">
        {data.aiVisibility.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga mätpunkter sparade.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(data.aiVisibility).map((point) => (
              <li key={point.id} className="rounded-md border border-border p-3">
                <p>
                  {point.prompt} {point.is_demo ? <DemoBadge /> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(locationById.get(point.location_id))?.name ?? "—"} · {point.engine} ·{" "}
                  {point.mentioned ? `nämns (plats ${point.rank_in_answer ?? "?"})` : "nämns inte"} ·{" "}
                  {formatDate(point.captured_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}

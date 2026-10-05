import { createFileRoute, Link } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel } from "@/modules/local-boost/components/AppShell";
import { DemoBadge } from "@/modules/local-boost/components/DemoBadge";
import { getOverview } from "@/modules/local-boost/lib/aurora.functions";
import { healthLabel } from "@/modules/local-boost/lib/health";
import { label } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/platser/")({
  head: () => ({
    meta: [
      { title: "Platser — Aurora Local" },
      { name: "description", content: "Alla platser med plan, status och hälsopoäng." },
      { property: "og:title", content: "Platser — Aurora Local" },
      { property: "og:description", content: "Platsöversikt för lokal synlighet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const fetchOverview = useServerFn(getOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["overview"],
    queryFn: () => fetchOverview(),
  });

  return (
    <AppShell
      title="Platser"
      description="Varje plats är en egen prenumeration med egen checklista och hälsopoäng."
      actions={
        <Link to="/onboarding" className="rounded-md px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground">
          Ny plats
        </Link>
      }
    >
      {isLoading ? <Loading /> : null}
      {error ? <ErrorNote error={error} /> : null}
      {data ? (
        <Panel>
          <div className="grid gap-3 md:grid-cols-2">
            {data.locations.map((location) => (
              <Link
                key={location.id}
                to="/platser/$id"
                params={{ id: location.id }}
                className="rounded-lg border border-border p-4 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{location.name}</span>
                  {location.is_demo ? <DemoBadge /> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {location.city ?? "Ingen ort"} · {label(location.status)} ·{" "}
                  {location.plan_code ?? "ingen plan"}
                </p>
                <p className="mt-2 text-sm">
                  Hälsa {location.health_score} / 100 — {healthLabel(location.health_score)}
                </p>
              </Link>
            ))}
          </div>
          {data.locations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga platser ännu.</p>
          ) : null}
        </Panel>
      ) : null}
    </AppShell>
  );
}

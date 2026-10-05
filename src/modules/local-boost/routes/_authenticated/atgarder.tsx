import { createFileRoute } from "@/modules/shared/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel } from "@/modules/local-boost/components/AppShell";
import { DemoBadge } from "@/modules/local-boost/components/DemoBadge";
import { getOverview, updateActionStatus } from "@/modules/local-boost/lib/aurora.functions";
import { formatDate, label } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/atgarder")({
  head: () => ({
    meta: [
      { title: "Åtgärder — Aurora Local" },
      { name: "description", content: "Åtgärdskö med ansvarig, förfallodatum och status." },
      { property: "og:title", content: "Åtgärder — Aurora Local" },
      { property: "og:description", content: "Vad som ska göras härnäst per plats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ActionsPage,
});

const STATUSES = ["open", "in_progress", "waiting_client", "done"] as const;

function ActionsPage() {
  const fetchOverview = useServerFn(getOverview);
  const update = useServerFn(updateActionStatus);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["overview"],
    queryFn: () => fetchOverview(),
  });

  const mutation = useMutation({
    mutationFn: (input: { id: string; status: (typeof STATUSES)[number] }) => update({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["overview"] }),
  });

  if (isLoading) return <AppShell title="Åtgärder"><Loading /></AppShell>;
  if (error) return <AppShell title="Åtgärder"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  const locationById = new Map(data.locations.map((l) => [l.id, l]));

  return (
    <AppShell title="Åtgärdskö" description="Prioriterad lista över vad som skapar resultat härnäst.">
      <Panel>
        {data.actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga åtgärder.</p>
        ) : (
          <ul className="space-y-2">
            {(data.actions).map((action) => (
              <li
                key={action.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {action.title} {action.is_demo ? <DemoBadge /> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(locationById.get(action.location_id))?.name ?? "Hela kunden"} · ansvarig{" "}
                    {action.owner === "client" ? "kund" : "Aurora"} · förfaller{" "}
                    {formatDate(action.due_date)}
                  </p>
                  {action.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                  ) : null}
                </div>
                <select
                  value={action.status}
                  onChange={(e) =>
                    mutation.mutate({
                      id: action.id,
                      status: e.target.value as (typeof STATUSES)[number],
                    })
                  }
                  className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {label(status)}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}
        {mutation.error ? <ErrorNote error={mutation.error} /> : null}
      </Panel>
    </AppShell>
  );
}

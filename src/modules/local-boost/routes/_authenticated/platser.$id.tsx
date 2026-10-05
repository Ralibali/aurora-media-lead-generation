import { createFileRoute } from "@/modules/shared/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel, Stat } from "@/modules/local-boost/components/AppShell";
import { DemoBadge } from "@/modules/local-boost/components/DemoBadge";
import { getLocationDetail, updateChecklistItem } from "@/modules/local-boost/lib/aurora.functions";
import { healthLabel } from "@/modules/local-boost/lib/health";
import { formatDate, label } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/platser/$id")({
  head: () => ({
    meta: [
      { title: "Plats — Aurora Local" },
      { name: "description", content: "Hälsopoäng, checklista och historik för en enskild plats." },
      { property: "og:title", content: "Plats — Aurora Local" },
      { property: "og:description", content: "Detaljvy för en plats i Aurora Local." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LocationDetail,
});

const STATUS_OPTIONS = ["todo", "in_progress", "done", "blocked", "not_applicable"] as const;

function LocationDetail() {
  const { id } = Route.useParams();
  const fetchDetail = useServerFn(getLocationDetail);
  const update = useServerFn(updateChecklistItem);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["location", id],
    queryFn: () => fetchDetail({ data: { id } }),
  });

  const mutation = useMutation({
    mutationFn: (input: { id: string; status: (typeof STATUS_OPTIONS)[number] }) =>
      update({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["location", id] }),
  });

  if (isLoading) return <AppShell title="Plats"><Loading /></AppShell>;
  if (error) return <AppShell title="Plats"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  const { location, health, templates, checklist, reviews, citations, competitors, actions } = data;
  const byKey = new Map(checklist.map((item) => [item.template_key, item]));

  return (
    <AppShell
      title={location.name}
      description={`${location.street ?? ""} ${location.postal_code ?? ""} ${location.city ?? ""}`.trim()}
    >
      {location.is_demo ? (
        <p className="mb-4 text-xs text-muted-foreground">
          <DemoBadge /> Den här platsen är demodata.
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Hälsa" value={`${health} / 100`} hint={healthLabel(health)} />
        <Stat label="Status" value={label(location.status)} hint={location.plan_code ?? "ingen plan"} />
        <Stat label="Recensioner" value={String(reviews.length)} hint="i systemet" />
      </div>

      <Panel title="Checklista">
        <ul className="space-y-2">
          {templates.map((template) => {
            const item = byKey.get(template.key);
            return (
              <li
                key={template.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{template.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {template.category}
                    {template.help_text ? ` · ${template.help_text}` : ""}
                  </p>
                </div>
                {item ? (
                  <select
                    value={item.status}
                    onChange={(e) =>
                      mutation.mutate({
                        id: item.id,
                        status: e.target.value as (typeof STATUS_OPTIONS)[number],
                      })
                    }
                    className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {label(status)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-muted-foreground">Ej skapad</span>
                )}
              </li>
            );
          })}
        </ul>
        {mutation.error ? <ErrorNote error={mutation.error} /> : null}
      </Panel>

      <Panel title="Företagsuppgifter i kataloger">
        {citations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga kontroller registrerade.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {citations.map((citation) => (
              <li key={citation.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <span>
                  {citation.directory} {citation.is_demo ? <DemoBadge /> : null}
                </span>
                <span className="text-muted-foreground">{label(citation.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Senaste recensioner">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga recensioner registrerade.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {reviews.slice(0, 8).map((review) => (
              <li key={review.id} className="rounded-md border border-border p-3">
                <p className="font-medium">
                  {review.rating}/5 — {review.author_name ?? "Anonym"}{" "}
                  {review.is_demo ? <DemoBadge /> : null}
                </p>
                <p className="text-muted-foreground">{review.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(review.review_date)}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Konkurrenter">
        {competitors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen konkurrensbevakning registrerad.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {competitors.map((competitor) => (
              <li key={competitor.id} className="rounded-md border border-border p-3">
                {competitor.name} {competitor.is_demo ? <DemoBadge /> : null} —{" "}
                {competitor.gbp_rating ?? "—"} ({competitor.review_count ?? 0} omdömen)
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Åtgärder">
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga åtgärder.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {actions.map((action) => (
              <li key={action.id} className="rounded-md border border-border p-3">
                {action.title} — {label(action.status)} · förfaller {formatDate(action.due_date)}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}

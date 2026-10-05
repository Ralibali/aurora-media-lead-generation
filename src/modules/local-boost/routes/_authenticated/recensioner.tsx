import { createFileRoute } from "@/modules/shared/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel } from "@/modules/local-boost/components/AppShell";
import { DemoBadge } from "@/modules/local-boost/components/DemoBadge";
import {
  decideReviewResponse,
  getReviewQueue,
  publishReviewResponse,
} from "@/modules/local-boost/lib/aurora.functions";
import { approvalLabel, type ApprovalStatus } from "@/modules/local-boost/lib/approval";
import { formatDate } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/recensioner")({
  head: () => ({
    meta: [
      { title: "Recensioner — Aurora Local" },
      { name: "description", content: "Kö för recensioner och svarsförslag med godkännande före publicering." },
      { property: "og:title", content: "Recensioner — Aurora Local" },
      { property: "og:description", content: "Godkänn svar innan de publiceras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const fetchQueue = useServerFn(getReviewQueue);
  const decide = useServerFn(decideReviewResponse);
  const publish = useServerFn(publishReviewResponse);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["review-queue"],
    queryFn: () => fetchQueue(),
  });

  const decideMutation = useMutation({
    mutationFn: (input: { id: string; decision: "approve" | "reject" }) => decide({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["review-queue"] }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => publish({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["review-queue"] }),
  });

  if (isLoading) return <AppShell title="Recensioner"><Loading /></AppShell>;
  if (error) return <AppShell title="Recensioner"><ErrorNote error={error} /></AppShell>;
  if (!data) return null;

  const reviewById = new Map(data.reviews.map((r) => [r.id, r]));
  const locationById = new Map(data.locations.map((l) => [l.id, l]));

  return (
    <AppShell
      title="Recensioner"
      description="Inget svar lämnar systemet utan godkännande. Publicering kräver dessutom en kopplad företagsprofil."
    >
      <Panel title={`Svarsförslag (${data.responses.length})`}>
        {data.responses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inga svarsförslag ännu.</p>
        ) : (
          <ul className="space-y-3">
            {data.responses.map((response) => {
              const review = reviewById.get(response.review_id);
              const location = locationById.get(response.location_id);
              return (
                <li key={response.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">
                      {location?.name ?? "Okänd plats"}{" "}
                      {response.is_demo ? <DemoBadge /> : null}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {approvalLabel(response.status as ApprovalStatus)}
                    </span>
                  </div>
                  {review ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.rating}/5 — {review.author_name}: {review.body} (
                      {formatDate(review.review_date)})
                    </p>
                  ) : null}
                  <p className="mt-3 rounded-md bg-muted/50 p-3 text-sm">{response.draft_text}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={response.status === "published"}
                      onClick={() => decideMutation.mutate({ id: response.id, decision: "approve" })}
                      className="rounded-md px-3 py-1.5 text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
                    >
                      Godkänn
                    </button>
                    <button
                      disabled={response.status === "published"}
                      onClick={() => decideMutation.mutate({ id: response.id, decision: "reject" })}
                      className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Avvisa
                    </button>
                    <button
                      disabled={response.status !== "approved"}
                      onClick={() => publishMutation.mutate(response.id)}
                      className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                      title="Kräver godkännande och en kopplad företagsprofil"
                    >
                      Publicera
                    </button>
                  </div>
                  {response.publish_error ? (
                    <p className="mt-2 text-xs text-warning">{response.publish_error}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {decideMutation.error ? <ErrorNote error={decideMutation.error} /> : null}
        {publishMutation.data && !publishMutation.data.published ? (
          <p className="mt-3 text-sm text-warning">{publishMutation.data.message}</p>
        ) : null}
        {publishMutation.error ? <ErrorNote error={publishMutation.error} /> : null}
      </Panel>
    </AppShell>
  );
}

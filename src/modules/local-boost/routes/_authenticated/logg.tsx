import { createFileRoute } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, ErrorNote, Loading, Panel } from "@/modules/local-boost/components/AppShell";
import { getAuditLog } from "@/modules/local-boost/lib/aurora.functions";
import { formatDateTime } from "@/modules/local-boost/lib/format";

export const Route = createFileRoute("/_authenticated/logg")({
  head: () => ({
    meta: [
      { title: "Revisionslogg — Aurora Local" },
      { name: "description", content: "Spårbarhet över godkännanden, publiceringsförsök och ändringar." },
      { property: "og:title", content: "Revisionslogg — Aurora Local" },
      { property: "og:description", content: "Alla känsliga händelser loggas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const fetchLog = useServerFn(getAuditLog);
  const { data, isLoading, error } = useQuery({ queryKey: ["audit"], queryFn: () => fetchLog() });

  return (
    <AppShell title="Revisionslogg" description="De 200 senaste händelserna.">
      {isLoading ? <Loading /> : null}
      {error ? <ErrorNote error={error} /> : null}
      {data ? (
        <Panel>
          {data.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga händelser loggade ännu.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(data.entries).map((entry) => (
                <li key={entry.id} className="rounded-md border border-border p-3">
                  <p className="font-medium">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(entry.created_at)} · {entry.entity ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}
    </AppShell>
  );
}

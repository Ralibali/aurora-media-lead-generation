import { createFileRoute } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/modules/connect/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAudit } from "@/modules/connect/lib/aurora.functions";

export const Route = createFileRoute("/_authenticated/logg")({
  head: () => ({
    meta: [
      { title: "Logg – Aurora Voice" },
      { name: "description", content: "Spårbar logg över ändringar, publiceringar och godkännanden." },
      { property: "og:title", content: "Logg – Aurora Voice" },
      { property: "og:description", content: "Händelselogg i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const audit = useQuery({ queryKey: ["audit"], queryFn: () => listAudit() });

  return (
    <AppShell title="Logg" description="Alla känsliga åtgärder loggas med tidpunkt, aktör och kund.">
      <Card>
        <CardHeader>
          <CardTitle>Senaste händelser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(audit.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga händelser ännu.</p>
          ) : null}
          {(audit.data ?? []).map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-2 text-sm">
              <span className="font-medium">{entry.action}</span>
              <span className="text-muted-foreground">
                {entry.organizations?.name ?? "–"} · {entry.entity ?? "–"} ·{" "}
                {new Date(entry.created_at).toLocaleString("sv-SE")}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

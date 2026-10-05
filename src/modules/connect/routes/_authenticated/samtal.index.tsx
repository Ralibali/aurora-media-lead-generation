import { createFileRoute, Link } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, DemoBadge } from "@/modules/connect/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listCalls } from "@/modules/connect/lib/aurora.functions";

export const Route = createFileRoute("/_authenticated/samtal/")({
  head: () => ({
    meta: [
      { title: "Samtal – Aurora Voice" },
      { name: "description", content: "Samtalshistorik med utfall, längd, kostnad och transkript." },
      { property: "og:title", content: "Samtal – Aurora Voice" },
      { property: "og:description", content: "Samtalshistorik i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallsPage,
});

function formatDateTime(value: string | null) {
  if (!value) return "–";
  return new Intl.DateTimeFormat("sv-SE", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );
}

function CallsPage() {
  const calls = useQuery({ queryKey: ["calls"], queryFn: () => listCalls({ data: {} }) });

  return (
    <AppShell
      title="Samtal"
      description="Endast samtal som faktiskt registrerats visas. DEMO-samtal är skapade i plattformen och är alltid märkta."
    >
      <Card>
        <CardContent className="space-y-2 pt-6">
          {calls.isLoading ? <p className="text-sm text-muted-foreground">Hämtar samtal…</p> : null}
          {calls.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Inga samtal registrerade ännu.</p>
          ) : null}
          {calls.data?.map((call) => (
            <Link
              key={call.id}
              to="/samtal/$callId"
              params={{ callId: call.id }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-secondary"
            >
              <div>
                <p className="font-medium">
                  {call.organizations?.name ?? "Okänd kund"} · {call.from_number ?? "okänt nummer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(call.started_at)} · {call.duration_seconds} sek ·{" "}
                  {call.avg_latency_ms ? `${call.avg_latency_ms} ms svarstid` : "svarstid saknas"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{call.outcome}</Badge>
                {call.is_demo ? <DemoBadge /> : <Badge variant="secondary">Riktigt samtal</Badge>}
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

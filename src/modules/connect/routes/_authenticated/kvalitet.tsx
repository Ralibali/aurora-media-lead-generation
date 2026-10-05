import { createFileRoute, Link } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, DemoBadge } from "@/modules/connect/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listCalls } from "@/modules/connect/lib/aurora.functions";

export const Route = createFileRoute("/_authenticated/kvalitet")({
  head: () => ({
    meta: [
      { title: "Kvalitet – Aurora Voice" },
      { name: "description", content: "Samtal som väntar på kvalitetsgranskning och poängkort." },
      { property: "og:title", content: "Kvalitet – Aurora Voice" },
      { property: "og:description", content: "Kvalitetsgranskning i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QualityPage,
});

function QualityPage() {
  const calls = useQuery({ queryKey: ["calls"], queryFn: () => listCalls({ data: {} }) });
  const rows = calls.data ?? [];

  return (
    <AppShell
      title="Kvalitet"
      description="Granska samtal mot fem kriterier: hälsning, uppfattning, korrekthet, kvalificering och nästa steg."
    >
      <Card>
        <CardHeader>
          <CardTitle>Samtal att granska</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 ? <p className="text-sm text-muted-foreground">Inga samtal ännu.</p> : null}
          {rows.map((call) => (
            <Link
              key={call.id}
              to="/samtal/$callId"
              params={{ callId: call.id }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-secondary"
            >
              <span>
                {call.organizations?.name ?? "Okänd kund"} · {call.outcome}
              </span>
              <span className="flex items-center gap-2">
                <Badge variant="outline">{call.duration_seconds} sek</Badge>
                {call.is_demo ? <DemoBadge /> : <Badge variant="secondary">Riktigt samtal</Badge>}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}

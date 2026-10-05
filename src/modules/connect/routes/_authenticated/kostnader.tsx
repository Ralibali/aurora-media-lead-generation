import { createFileRoute } from "@/modules/shared/router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, DemoBadge } from "@/modules/connect/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUsage } from "@/modules/connect/lib/aurora.functions";
import { budgetLevel, formatSek, roundSek } from "@/modules/connect/lib/pricing";

export const Route = createFileRoute("/_authenticated/kostnader")({
  head: () => ({
    meta: [
      { title: "Kostnader – Aurora Voice" },
      { name: "description", content: "Användning, leverantörskostnad och budgettak per kund." },
      { property: "og:title", content: "Kostnader – Aurora Voice" },
      { property: "og:description", content: "Kostnadsuppföljning i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CostPage,
});

function CostPage() {
  const usage = useQuery({ queryKey: ["usage"], queryFn: () => getUsage({ data: {} }) });
  const events = usage.data?.usage ?? [];
  const guardrails = usage.data?.guardrails ?? [];

  const spentByOrg = new Map<string, number>();
  for (const event of events) {
    if (event.is_demo) continue;
    spentByOrg.set(event.org_id, roundSek((spentByOrg.get(event.org_id) ?? 0) + Number(event.cost_sek)));
  }
  const demoSpend = roundSek(
    events.filter((e) => e.is_demo).reduce((sum, e) => sum + Number(e.cost_sek), 0),
  );

  return (
    <AppShell
      title="Användning och kostnad"
      description="Endast riktig användning räknas mot budget. DEMO-poster visas separat."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budgettak per kund</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {guardrails.length === 0 ? <p className="text-sm text-muted-foreground">Inga kunder ännu.</p> : null}
            {guardrails.map((guard) => {
              const spent = spentByOrg.get(guard.org_id) ?? 0;
              const level = budgetLevel(spent, Number(guard.monthly_budget_sek), guard.alert_threshold_pct);
              return (
                <div key={guard.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-3">
                  <div>
                    <p className="font-medium">{guard.organizations?.name ?? "Kund"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSek(spent)} av {formatSek(Number(guard.monthly_budget_sek))} · varning vid{" "}
                      {guard.alert_threshold_pct}%
                    </p>
                  </div>
                  <Badge
                    variant={level === "ok" ? "secondary" : "outline"}
                    style={
                      level === "over"
                        ? { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" }
                        : level === "warning"
                          ? { backgroundColor: "hsl(var(--warning))", color: "hsl(var(--warning-foreground))" }
                          : undefined
                    }
                  >
                    {level === "ok" ? "Inom budget" : level === "warning" ? "Nära taket" : "Över taket"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senaste användning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">DEMO-kostnad totalt: {formatSek(demoSpend)}</p>
            {events.slice(0, 25).map((event) => (
              <div key={event.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-2 text-sm">
                <span>
                  {event.organizations?.name ?? "Kund"} · {event.kind} · {Number(event.units)} {event.unit}
                </span>
                <span className="flex items-center gap-2">
                  {formatSek(Number(event.cost_sek))}
                  {event.is_demo ? <DemoBadge /> : null}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

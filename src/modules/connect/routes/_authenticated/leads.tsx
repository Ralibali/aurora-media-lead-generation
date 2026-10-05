import { createFileRoute, Link } from "@/modules/shared/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { AppShell, DemoBadge } from "@/modules/connect/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listLeads, updateLeadStatus } from "@/modules/connect/lib/aurora.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads – Aurora Voice" },
      { name: "description", content: "Pipeline för kvalificerade leads från inkommande samtal." },
      { property: "og:title", content: "Leads – Aurora Voice" },
      { property: "og:description", content: "Leadpipeline i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadsPage,
});

const stages = [
  { key: "new", label: "Nya" },
  { key: "qualified", label: "Kvalificerade" },
  { key: "contacted", label: "Kontaktade" },
  { key: "booked", label: "Bokade" },
  { key: "won", label: "Vunna" },
  { key: "lost", label: "Förlorade" },
] as const;

function LeadsPage() {
  const queryClient = useQueryClient();
  const leads = useQuery({ queryKey: ["leads"], queryFn: () => listLeads({ data: {} }) });
  const setStatus = useServerFn(updateLeadStatus);

  async function move(leadId: string, orgId: string, status: (typeof stages)[number]["key"]) {
    try {
      await setStatus({ data: { leadId, orgId, status } });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kunde inte uppdatera.");
    }
  }

  return (
    <AppShell title="Leads" description="Leads skapas ur riktiga samtal. DEMO-leads är märkta och räknas aldrig som affär.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage) => {
          const items = (leads.data ?? []).filter((l) => l.status === stage.key);
          return (
            <Card key={stage.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {stage.label} ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.length === 0 ? <p className="text-sm text-muted-foreground">Tomt.</p> : null}
                {items.map((lead) => (
                  <div key={lead.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{lead.name ?? "Namn saknas"}</span>
                      {lead.is_demo ? <DemoBadge /> : null}
                    </div>
                    <p className="text-muted-foreground">
                      {lead.organizations?.name ?? ""} · {lead.phone ?? "–"} · {lead.intent ?? "–"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {stages
                        .filter((s) => s.key !== stage.key)
                        .map((s) => (
                          <Button
                            key={s.key}
                            size="sm"
                            variant="secondary"
                            onClick={() => move(lead.id, lead.org_id, s.key)}
                          >
                            {s.label}
                          </Button>
                        ))}
                    </div>
                    {lead.call_id ? (
                      <Link
                        to="/samtal/$callId"
                        params={{ callId: lead.call_id }}
                        className="mt-2 inline-block text-xs text-primary hover:underline"
                      >
                        Visa samtalet
                      </Link>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

import { createFileRoute, Link } from "@/modules/shared/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { useEffect, useState } from "react";
import { AppShell, DemoBadge } from "@/modules/connect/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  deleteKnowledgeItem,
  deployAgentToProvider,
  generateDemoActivity,
  getOrganization,
  saveGuardrails,
  saveIntegration,
  saveKnowledgeItem,
  saveOpeningHours,
  setDemoMode,
  updateAgent,
} from "@/modules/connect/lib/aurora.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/kunder/$orgId")({
  head: () => ({
    meta: [
      { title: "Kund – Aurora Voice" },
      { name: "description", content: "Agentkonfiguration, kunskapsbas, öppettider, flöde, integrationer och kostnadstak." },
      { property: "og:title", content: "Kund – Aurora Voice" },
      { property: "og:description", content: "Kundkonfiguration i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomerDetail,
});

const weekdays = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

function CustomerDetail() {
  const { orgId } = Route.useParams();
  const queryClient = useQueryClient();
  const detail = useQuery({ queryKey: ["org", orgId], queryFn: () => getOrganization({ data: { orgId } }) });

  const saveAgent = useServerFn(updateAgent);
  const saveKnowledge = useServerFn(saveKnowledgeItem);
  const removeKnowledge = useServerFn(deleteKnowledgeItem);
  const saveHours = useServerFn(saveOpeningHours);
  const saveGuard = useServerFn(saveGuardrails);
  const saveIntegrationFn = useServerFn(saveIntegration);
  const toggleDemo = useServerFn(setDemoMode);
  const deploy = useServerFn(deployAgentToProvider);
  const seedDemo = useServerFn(generateDemoActivity);

  const org = detail.data?.organization;
  const agent = detail.data?.agents[0];

  const [agentForm, setAgentForm] = useState({
    name: "",
    persona: "",
    greeting: "",
    disclosure_text: "",
    consent_required: true,
    fallback_number: "",
  });
  const [hours, setHours] = useState<{ weekday: number; opens: string; closes: string; closed: boolean }[]>([]);
  const [newKnowledge, setNewKnowledge] = useState({ question: "", answer: "" });
  const [guard, setGuard] = useState({ budget: 2000, threshold: 80, hardStop: false });

  useEffect(() => {
    if (agent) {
      setAgentForm({
        name: agent.name,
        persona: agent.persona ?? "",
        greeting: agent.greeting ?? "",
        disclosure_text: agent.disclosure_text,
        consent_required: agent.consent_required,
        fallback_number: agent.fallback_number ?? "",
      });
    }
    if (detail.data?.openingHours.length) {
      setHours(
        detail.data.openingHours.map((h) => ({
          weekday: h.weekday,
          opens: h.opens?.slice(0, 5) ?? "08:00",
          closes: h.closes?.slice(0, 5) ?? "17:00",
          closed: h.closed,
        })),
      );
    }
    if (detail.data?.guardrails) {
      setGuard({
        budget: Number(detail.data.guardrails.monthly_budget_sek),
        threshold: detail.data.guardrails.alert_threshold_pct,
        hardStop: detail.data.guardrails.hard_stop,
      });
    }
  }, [detail.data, agent]);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["org", orgId] });
  }

  async function run(action: () => Promise<unknown>, message: string) {
    try {
      await action();
      toast.success(message);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Något gick fel.");
    }
  }

  return (
    <AppShell
      title={org?.name ?? "Kund"}
      description={org ? `${org.vertical} · ${org.city ?? "ort saknas"}` : "Hämtar kunduppgifter."}
      actions={
        <>
          {org?.demo_mode ? <DemoBadge className="self-center" /> : null}
          <Link to="/kunder">
            <Button variant="secondary">Till kundlistan</Button>
          </Link>
        </>
      }
    >
      {detail.isLoading ? <p className="text-sm text-muted-foreground">Hämtar kund…</p> : null}

      {org ? (
        <Tabs defaultValue="agent">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="agent">Agent</TabsTrigger>
            <TabsTrigger value="knowledge">Kunskapsbas</TabsTrigger>
            <TabsTrigger value="hours">Öppettider</TabsTrigger>
            <TabsTrigger value="flow">Flöde och överkoppling</TabsTrigger>
            <TabsTrigger value="integrations">Integrationer</TabsTrigger>
            <TabsTrigger value="cost">Kostnadstak</TabsTrigger>
            <TabsTrigger value="demo">Demoläge</TabsTrigger>
          </TabsList>

          <TabsContent value="agent" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Agentkonfiguration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Namn</Label>
                    <Input value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nummer för överkoppling</Label>
                    <Input
                      value={agentForm.fallback_number}
                      onChange={(e) => setAgentForm({ ...agentForm, fallback_number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hälsning</Label>
                  <Textarea value={agentForm.greeting} onChange={(e) => setAgentForm({ ...agentForm, greeting: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Personlighet och regler</Label>
                  <Textarea value={agentForm.persona} onChange={(e) => setAgentForm({ ...agentForm, persona: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Information om AI och inspelning</Label>
                  <Textarea
                    value={agentForm.disclosure_text}
                    onChange={(e) => setAgentForm({ ...agentForm, disclosure_text: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={agentForm.consent_required}
                    onCheckedChange={(v) => setAgentForm({ ...agentForm, consent_required: v })}
                  />
                  <span className="text-sm">Kräv medgivande innan samtalet spelas in</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      agent &&
                      run(
                        () =>
                          saveAgent({
                            data: {
                              agentId: agent.id,
                              patch: {
                                name: agentForm.name,
                                persona: agentForm.persona || null,
                                greeting: agentForm.greeting || null,
                                disclosure_text: agentForm.disclosure_text,
                                consent_required: agentForm.consent_required,
                                fallback_number: agentForm.fallback_number || null,
                              },
                            },
                          }),
                        "Agenten sparades.",
                      )
                    }
                  >
                    Spara
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      agent &&
                      run(async () => {
                        const result = await deploy({ data: { agentId: agent.id, confirm: true } });
                        toast.message(result.message);
                      }, "Publiceringen kördes.")
                    }
                  >
                    Publicera till röstmotor
                  </Button>
                  {agent ? <Badge variant="outline" className="self-center">Status: {agent.status}</Badge> : null}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Kunskapsbas och FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
                  <Input
                    placeholder="Fråga"
                    value={newKnowledge.question}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, question: e.target.value })}
                  />
                  <Input
                    placeholder="Svar"
                    value={newKnowledge.answer}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, answer: e.target.value })}
                  />
                  <Button
                    onClick={() =>
                      run(async () => {
                        await saveKnowledge({
                          data: {
                            orgId,
                            agentId: agent?.id ?? null,
                            question: newKnowledge.question,
                            answer: newKnowledge.answer,
                            isActive: true,
                          },
                        });
                        setNewKnowledge({ question: "", answer: "" });
                      }, "Frågan lades till.")
                    }
                  >
                    Lägg till
                  </Button>
                </div>
                <div className="space-y-2">
                  {(detail.data?.knowledge ?? []).map((item) => (
                    <div key={item.id} className="rounded-lg border border-border px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.question}</p>
                          <p className="text-sm text-muted-foreground">{item.answer}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => run(() => removeKnowledge({ data: { id: item.id, orgId } }), "Frågan togs bort.")}
                        >
                          Ta bort
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Öppettider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hours.map((h, index) => (
                  <div key={h.weekday} className="flex flex-wrap items-center gap-3">
                    <span className="w-24 text-sm">{weekdays[h.weekday]}</span>
                    <Input
                      className="w-28"
                      type="time"
                      value={h.opens}
                      disabled={h.closed}
                      onChange={(e) => {
                        const next = [...hours];
                        next[index] = { ...h, opens: e.target.value };
                        setHours(next);
                      }}
                    />
                    <Input
                      className="w-28"
                      type="time"
                      value={h.closes}
                      disabled={h.closed}
                      onChange={(e) => {
                        const next = [...hours];
                        next[index] = { ...h, closes: e.target.value };
                        setHours(next);
                      }}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={h.closed}
                        onCheckedChange={(v) => {
                          const next = [...hours];
                          next[index] = { ...h, closed: v };
                          setHours(next);
                        }}
                      />
                      Stängt
                    </label>
                  </div>
                ))}
                <Button
                  onClick={() =>
                    run(
                      () =>
                        saveHours({
                          data: {
                            orgId,
                            hours: hours.map((h) => ({
                              weekday: h.weekday,
                              opens: h.opens,
                              closes: h.closes,
                              closed: h.closed,
                            })),
                          },
                        }),
                      "Öppettiderna sparades.",
                    )
                  }
                >
                  Spara öppettider
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flow" className="pt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Kvalificeringsfrågor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(detail.data?.questions ?? []).map((q) => (
                    <div key={q.id} className="rounded-lg border border-border px-4 py-3 text-sm">
                      <p className="font-medium">{q.question}</p>
                      <p className="text-muted-foreground">
                        Fält: {q.field_key} · {q.required ? "obligatorisk" : "valfri"}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Överkoppling och åtgärder</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(detail.data?.handoff ?? []).map((rule) => (
                    <div key={rule.id} className="rounded-lg border border-border px-4 py-3 text-sm">
                      <p className="font-medium">{rule.description}</p>
                      <p className="text-muted-foreground">
                        Villkor: {rule.condition_key} · Åtgärd: {rule.action}
                        {rule.target ? ` · ${rule.target}` : ""}
                      </p>
                      {rule.requires_approval ? (
                        <Badge variant="outline" className="mt-2">
                          Kräver godkännande
                        </Badge>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrationer och hälsa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(detail.data?.integrations ?? []).map((integration) => (
                  <IntegrationRow
                    key={integration.id}
                    integration={integration}
                    onSave={(provider, status, requiresApproval) =>
                      run(
                        () =>
                          saveIntegrationFn({
                            data: { id: integration.id, orgId, provider, status, requiresApproval },
                          }),
                        "Integrationen uppdaterades.",
                      )
                    }
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cost" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Kostnadstak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Månadsbudget (kr)</Label>
                    <Input type="number" value={guard.budget} onChange={(e) => setGuard({ ...guard, budget: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Varning vid (%)</Label>
                    <Input type="number" value={guard.threshold} onChange={(e) => setGuard({ ...guard, threshold: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-end gap-3">
                    <Switch checked={guard.hardStop} onCheckedChange={(v) => setGuard({ ...guard, hardStop: v })} />
                    <span className="pb-2 text-sm">Stoppa vid budgettak</span>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    run(
                      () =>
                        saveGuard({
                          data: {
                            orgId,
                            monthlyBudgetSek: guard.budget,
                            alertThresholdPct: guard.threshold,
                            hardStop: guard.hardStop,
                          },
                        }),
                      "Kostnadstaket sparades.",
                    )
                  }
                >
                  Spara
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Demoläge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  I demoläge kan Aurora skapa exempelsamtal för att visa flödet. Allt sådant innehåll
                  märks DEMO och räknas aldrig som riktiga samtal, leads eller intäkter.
                </p>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={org.demo_mode}
                    onCheckedChange={(v) => run(() => toggleDemo({ data: { orgId, demoMode: v } }), "Demoläget uppdaterades.")}
                  />
                  <span>Demoläge aktivt</span>
                </div>
                <Button
                  variant="secondary"
                  disabled={!org.demo_mode}
                  onClick={() => run(() => seedDemo({ data: { orgId } }), "DEMO-samtal skapades.")}
                >
                  Skapa DEMO-samtal
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </AppShell>
  );
}

type IntegrationStatus = "not_configured" | "configured" | "healthy" | "degraded" | "failing";

function IntegrationRow({
  integration,
  onSave,
}: {
  integration: { id: string; kind: string; provider: string; status: string; requires_approval: boolean };
  onSave: (provider: string, status: IntegrationStatus, requiresApproval: boolean) => void;
}) {
  const [provider, setProvider] = useState(integration.provider);
  const [status, setStatus] = useState<IntegrationStatus>(integration.status as IntegrationStatus);
  const [requiresApproval, setRequiresApproval] = useState(integration.requires_approval);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3">
      <span className="w-28 text-sm font-medium">{integration.kind}</span>
      <Input className="w-48" value={provider} onChange={(e) => setProvider(e.target.value)} />
      <select
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value as IntegrationStatus)}
      >
        <option value="not_configured">ej konfigurerad</option>
        <option value="configured">konfigurerad</option>
        <option value="healthy">fungerar</option>
        <option value="degraded">instabil</option>
        <option value="failing">fel</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
        Kräver godkännande
      </label>
      <Button size="sm" onClick={() => onSave(provider, status, requiresApproval)}>
        Spara
      </Button>
    </div>
  );
}

import { createFileRoute } from "@/modules/shared/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { useState } from "react";
import { AppShell } from "@/modules/connect/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getProviderHealth, listVoiceTests, recordVoiceTest } from "@/modules/connect/lib/aurora.functions";
import { VOICE_SCENARIOS, scenarioByKey, summarizeReadiness } from "@/modules/connect/lib/voice-readiness";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/rosttester")({
  head: () => ({
    meta: [
      { title: "Rösttester – Aurora Voice" },
      {
        name: "description",
        content: "Testprotokoll för svensk röstkvalitet: latens, taluppfattning, avbrott, överkoppling och fallback.",
      },
      { property: "og:title", content: "Rösttester – Aurora Voice" },
      { property: "og:description", content: "Testprotokoll för svensk röstkvalitet." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VoiceTestsPage,
});

type Status = "planned" | "running" | "passed" | "failed" | "blocked";

function VoiceTestsPage() {
  const queryClient = useQueryClient();
  const runs = useQuery({ queryKey: ["voice-tests"], queryFn: () => listVoiceTests({ data: {} }) });
  const health = useQuery({ queryKey: ["provider-health"], queryFn: () => getProviderHealth() });
  const record = useServerFn(recordVoiceTest);

  const summary = summarizeReadiness(
    (runs.data ?? []).map((r) => ({
      scenario_key: r.scenario_key,
      status: r.status as string,
      is_real_call: r.is_real_call,
    })),
  );

  return (
    <AppShell
      title="Rösttester"
      description="Ett scenario kan bara bli godkänt eller underkänt när det bygger på ett riktigt samtal. Inget påstående om svensk röstkvalitet får göras innan alla scenarier är godkända."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Godkända scenarier: {summary.passed} av {summary.total}
            </p>
            <p>Riktiga samtal som ligger till grund: {summary.realCallsLogged}</p>
            <Badge variant={summary.swedishVoiceProven ? "secondary" : "outline"}>
              {summary.swedishVoiceProven
                ? "Svensk röstkvalitet bevisad i test"
                : "Svensk röstkvalitet ej bevisad"}
            </Badge>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Röstmotor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Leverantör: {health.data?.health.providerId ?? "–"}</p>
            <p>Läge: {health.data?.health.reachable ? "svarar" : "svarar inte"}</p>
            <p className="text-muted-foreground">{health.data?.health.message}</p>
            <p className="text-muted-foreground">
              Kontrakt mot Dograh är inte verifierat. Utgående kalluppringning är avstängd i adaptern.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        {VOICE_SCENARIOS.map((scenario) => {
          const scenarioRuns = (runs.data ?? []).filter((r) => r.scenario_key === scenario.key);
          return (
            <Card key={scenario.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{scenario.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{scenario.goal}</p>
                <p className="text-muted-foreground">Metod: {scenario.method}</p>
                <p className="text-muted-foreground">Godkänt när: {scenario.passCriterion}</p>
                {scenarioRuns.length === 0 ? (
                  <p className="text-muted-foreground">Inget planerat test för någon kund ännu.</p>
                ) : null}
                {scenarioRuns.map((run) => (
                  <TestRunRow
                    key={run.id}
                    label={run.organizations?.name ?? "Kund"}
                    status={run.status as Status}
                    isRealCall={run.is_real_call}
                    onSave={async (status, isRealCall, notes) => {
                      try {
                        await record({
                          data: {
                            runId: run.id,
                            orgId: run.org_id as string,
                            status,
                            isRealCall,
                            metrics: {},
                            notes,
                          },
                        });
                        toast.success("Testresultatet sparades.");
                        queryClient.invalidateQueries({ queryKey: ["voice-tests"] });
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Kunde inte spara.");
                      }
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Scenarier definieras i koden och kan slås upp per nyckel ({scenarioByKey("latency") ? "t.ex. latency" : ""}).
      </p>
    </AppShell>
  );
}

function TestRunRow({
  label,
  status,
  isRealCall,
  onSave,
}: {
  label: string;
  status: Status;
  isRealCall: boolean;
  onSave: (status: Status, isRealCall: boolean, notes: string) => void;
}) {
  const [nextStatus, setNextStatus] = useState<Status>(status);
  const [real, setReal] = useState(isRealCall);
  const [notes, setNotes] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3">
      <span className="w-40 font-medium">{label}</span>
      <select
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={nextStatus}
        onChange={(e) => setNextStatus(e.target.value as Status)}
      >
        <option value="planned">planerat</option>
        <option value="running">pågår</option>
        <option value="passed">godkänt</option>
        <option value="failed">underkänt</option>
        <option value="blocked">blockerat</option>
      </select>
      <label className="flex items-center gap-2">
        <Switch checked={real} onCheckedChange={setReal} />
        Riktigt samtal
      </label>
      <Input className="w-64" placeholder="Anteckning" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button size="sm" onClick={() => onSave(nextStatus, real, notes)}>
        Spara
      </Button>
    </div>
  );
}

import { createFileRoute, Link } from "@/modules/shared/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/modules/shared/server-client";
import { useState } from "react";
import { AppShell, DemoBadge } from "@/modules/connect/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getCall, QA_CRITERIA, saveScorecard } from "@/modules/connect/lib/aurora.functions";
import { formatSek } from "@/modules/connect/lib/pricing";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/samtal/$callId")({
  head: () => ({
    meta: [
      { title: "Samtalsdetalj – Aurora Voice" },
      { name: "description", content: "Transkript, utfall och kvalitetsgranskning för ett enskilt samtal." },
      { property: "og:title", content: "Samtalsdetalj – Aurora Voice" },
      { property: "og:description", content: "Transkript och QA i Aurora Voice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallDetail,
});

function CallDetail() {
  const { callId } = Route.useParams();
  const queryClient = useQueryClient();
  const detail = useQuery({ queryKey: ["call", callId], queryFn: () => getCall({ data: { callId } }) });
  const score = useServerFn(saveScorecard);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const call = detail.data?.call;

  async function submitScorecard() {
    if (!call) return;
    try {
      const filled = Object.fromEntries(QA_CRITERIA.map((c) => [c.key, scores[c.key] ?? 0]));
      await score({ data: { callId, orgId: call.org_id, scores: filled, notes } });
      toast.success("Kvalitetsbedömningen sparades.");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["call", callId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kunde inte spara bedömningen.");
    }
  }

  return (
    <AppShell
      title="Samtal"
      description={call?.organizations?.name ?? ""}
      actions={
        <Link to="/samtal">
          <Button variant="secondary">Till samtalslistan</Button>
        </Link>
      }
    >
      {detail.isLoading ? <p className="text-sm text-muted-foreground">Hämtar samtal…</p> : null}

      {call ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transkript</CardTitle>
              {call.is_demo ? <DemoBadge /> : <Badge variant="secondary">Riktigt samtal</Badge>}
            </CardHeader>
            <CardContent className="space-y-3">
              {(detail.data?.messages ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Inget transkript finns för samtalet.</p>
              ) : null}
              {(detail.data?.messages ?? []).map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg border border-border px-4 py-3 ${
                    message.speaker === "agent" ? "bg-secondary" : ""
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {message.speaker === "agent" ? "Agent" : message.speaker === "caller" ? "Uppringare" : "System"}
                  </p>
                  <p className="mt-1 text-sm">{message.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fakta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Utfall: {call.outcome}</p>
                <p>Längd: {call.duration_seconds} sek</p>
                <p>Svarstid: {call.avg_latency_ms ? `${call.avg_latency_ms} ms` : "saknas"}</p>
                <p>Kostnad: {formatSek(Number(call.cost_sek))}</p>
                <p>Röstmotor: {call.provider}</p>
                {call.summary ? <p className="text-muted-foreground">{call.summary}</p> : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kvalitetsgranskning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {QA_CRITERIA.map((criterion) => (
                  <div key={criterion.key} className="space-y-1">
                    <Label className="text-sm">{criterion.label}</Label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          size="sm"
                          variant={(scores[criterion.key] ?? 0) === value ? "default" : "secondary"}
                          onClick={() => setScores({ ...scores, [criterion.key]: value })}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
                <Textarea
                  placeholder="Kommentar"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button onClick={submitScorecard} className="w-full">
                  Spara bedömning
                </Button>
                {(detail.data?.scorecards ?? []).map((card) => (
                  <p key={card.id} className="text-sm text-muted-foreground">
                    Tidigare bedömning: {card.total_score}/{card.max_score}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

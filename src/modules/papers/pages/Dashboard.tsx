import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@/modules/shared/router";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/modules/papers/client";
import { STATUS_LABEL, formatSek, type DocStatus } from "@/modules/papers/lib/aurora";
import { useOrg } from "@/modules/papers/lib/use-org";

export const Route = createFileRoute("/_authenticated/o/$orgId/")({
  component: Dashboard,
});

function Dashboard() {
  const { orgId } = useOrg();
  const q = useQuery({
    queryKey: ["docs", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, status, gross_amount, duplicate_of")
        .eq("org_id", orgId);
      if (error) throw error;
      return data;
    },
  });

  const docs = q.data ?? [];
  const count = (s: DocStatus) => docs.filter((d) => d.status === s).length;
  const dupes = docs.filter((d) => d.duplicate_of && d.status !== "exported").length;
  const approvedSum = docs.filter((d) => d.status === "approved").reduce((a, d) => a + Number(d.gross_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Översikt</h1>
          <p className="text-sm text-muted-foreground">Siffrorna räknas direkt från organisationens dokument.</p>
        </div>
        <Button asChild><Link to="/o/$orgId/inbox" params={{ orgId }}>Ladda upp underlag</Link></Button>
      </div>
      {q.isLoading ? (
        <Skeleton className="h-28" />
      ) : q.isError ? (
        <p className="text-sm text-destructive">Kunde inte läsa dokument.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["new", "needs_review", "approved", "exported"] as DocStatus[]).map((s) => (
            <Card key={s} className="shadow-soft">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{STATUS_LABEL[s]}</p>
                <p className="mt-1 text-3xl font-semibold">{count(s)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!q.isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-soft">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Godkänt, ej exporterat (brutto)</p>
              <p className="mt-1 text-2xl font-semibold">{formatSek(approvedSum)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className={dupes ? "size-5 text-destructive" : "size-5 text-muted-foreground"} />
              <div>
                <p className="text-sm text-muted-foreground">Möjliga dubbletter</p>
                <p className="mt-1 text-2xl font-semibold">{dupes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {!q.isLoading && docs.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          Inga dokument än. Ladda upp ditt första kvitto eller faktura i inkorgen.
        </p>
      )}
    </div>
  );
}


export default Dashboard;

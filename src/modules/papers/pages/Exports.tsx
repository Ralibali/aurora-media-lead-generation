import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@/modules/shared/router";
import { useServerFn } from "@/modules/papers/lib/server-functions";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/modules/papers/client";
import { canManage, downloadText, errorMessage, formatDateTime } from "@/modules/papers/lib/aurora";
import { exportApproved, recoverExport } from "@/modules/papers/lib/documents.functions";
import { useOrg } from "@/modules/papers/lib/use-org";

export const Route = createFileRoute("/_authenticated/o/$orgId/exports")({
  component: ExportsPage,
});

function ExportsPage() {
  const { orgId, role, org } = useOrg();
  const qc = useQueryClient();
  const run = useServerFn(exportApproved);

  const approved = useQuery({
    queryKey: ["approved-count", orgId],
    queryFn: async () => {
      const { count, error } = await supabase.from("documents").select("id", { count: "exact", head: true }).eq("org_id", orgId).eq("status", "approved");
      if (error) throw error;
      return count ?? 0;
    },
  });
  const list = useQuery({
    queryKey: ["exports", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("exports").select("id, created_at, document_count").eq("org_id", orgId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const fileName = (id: string, at: string) => `aurora-export-${(org?.is_demo ? "DEMO-" : "")}${at.slice(0, 10)}-${id.slice(0, 8)}.csv`;

  const exp = useMutation({
    mutationFn: () => run({ data: { orgId } }),
    onSuccess: (r) => {
      downloadText(fileName(r.exportId, new Date().toISOString()), r.csv);
      toast.success(`${r.count} dokument exporterade`);
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => { qc.invalidateQueries({ queryKey: ["exports", orgId] }); qc.invalidateQueries({ queryKey: ["approved-count", orgId] }); },
  });

  async function redownload(id: string, at: string) {
    const { data, error } = await supabase.from("exports").select("csv").eq("id", id).single();
    if (error) { toast.error("Exporten kunde inte läsas"); return; }
    try {
      const csv = data?.csv ?? (await recoverExport({ data: { exportId: id } })).csv;
      downloadText(fileName(id, at), csv);
    } catch (e) { toast.error(errorMessage(e)); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Export</h1>
        <p className="text-sm text-muted-foreground">
          Exporten samlar alla godkända dokument i en CSV-fil (semikolonseparerad, UTF-8) och låser dem som exporterade.
          Direktintegration med Bokio, Fortnox och Spiris finns inte än.
        </p>
      </div>
      <Card className="shadow-soft">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm">
            {approved.isLoading ? "…" : <><strong>{approved.data}</strong> godkända dokument väntar på export.</>}
          </p>
          {canManage(role) ? (
            <Button disabled={!approved.data || exp.isPending} onClick={() => exp.mutate()}>
              Skapa CSV-export
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">Endast owner/admin kan exportera.</span>
          )}
        </CardContent>
      </Card>
      {list.isLoading ? <Skeleton className="h-24" /> : (list.data ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">Inga exporter än.</p>
      ) : (
        <div className="space-y-2">
          {list.data!.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm">
              <span>{formatDateTime(e.created_at)} · {e.document_count} dokument</span>
              <Button variant="ghost" size="sm" onClick={() => redownload(e.id, e.created_at)}>
                <Download className="mr-1 size-4" /> CSV
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default ExportsPage;

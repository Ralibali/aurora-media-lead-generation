import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@/modules/shared/router";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/modules/papers/client";
import { formatDateTime } from "@/modules/papers/lib/aurora";
import { useOrg } from "@/modules/papers/lib/use-org";

export const Route = createFileRoute("/_authenticated/o/$orgId/audit")({
  component: AuditPage,
});

function AuditPage() {
  const { orgId } = useOrg();
  const q = useQuery({
    queryKey: ["audit", orgId],
    queryFn: async () => {
      const [{ data, error }, { data: members }] = await Promise.all([
        supabase.from("audit_log").select("*").eq("org_id", orgId).order("created_at", { ascending: false }).limit(200),
        supabase.from("memberships").select("user_id, email").eq("org_id", orgId),
      ]);
      if (error) throw error;
      const names = new Map((members ?? []).map((m) => [m.user_id, m.email]));
      return (data ?? []).map((r) => ({ ...r, actor: r.actor_id ? (names.get(r.actor_id) ?? "Tidigare medlem") : "System" }));
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-sm text-muted-foreground">Skrivs automatiskt av databasen vid varje ändring och kan inte redigeras. Senaste 200 händelser.</p>
      </div>
      {q.isLoading ? <Skeleton className="h-40" /> : (
        <Card className="shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tid</TableHead>
                <TableHead>Vem</TableHead>
                <TableHead>Händelse</TableHead>
                <TableHead>Detaljer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(q.data ?? []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">{formatDateTime(r.created_at)}</TableCell>
                  <TableCell>{r.actor}</TableCell>
                  <TableCell className="font-mono text-xs">{r.action}</TableCell>
                  <TableCell className="max-w-md truncate font-mono text-xs text-muted-foreground" title={JSON.stringify(r.details)}>
                    {JSON.stringify(r.details)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}


export default AuditPage;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@/modules/shared/router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/modules/papers/client";
import { canManage, errorMessage } from "@/modules/papers/lib/aurora";
import { useOrg } from "@/modules/papers/lib/use-org";

export const Route = createFileRoute("/_authenticated/o/$orgId/rules")({
  component: RulesPage,
});

function RulesPage() {
  const { orgId, role } = useOrg();
  const qc = useQueryClient();
  const [match, setMatch] = useState("");
  const [vendor, setVendor] = useState("");
  const manage = canManage(role);

  const q = useQuery({
    queryKey: ["rules", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_rules").select("*").eq("org_id", orgId).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vendor_rules").insert({ org_id: orgId, match_text: match.trim(), vendor_name: vendor.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setMatch("");
      setVendor("");
      qc.invalidateQueries({ queryKey: ["rules", orgId] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendor_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rules", orgId] }),
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leverantörsregler</h1>
        <p className="text-sm text-muted-foreground">
          När ett nytt filnamn innehåller texten fylls leverantören i automatiskt. Du granskar fortfarande allt.
        </p>
      </div>
      {manage ? (
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Ny regel</CardTitle></CardHeader>
          <CardContent>
            <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); add.mutate(); }}>
              <div className="space-y-1">
                <Label htmlFor="m">Filnamnet innehåller</Label>
                <Input id="m" required minLength={2} maxLength={100} value={match} onChange={(e) => setMatch(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="v">Leverantör</Label>
                <Input id="v" required maxLength={200} value={vendor} onChange={(e) => setVendor(e.target.value)} />
              </div>
              <Button disabled={add.isPending}>Lägg till</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Endast owner och admin kan ändra regler.</p>
      )}
      {q.isLoading ? <Skeleton className="h-24" /> : (q.data ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">Inga regler än.</p>
      ) : (
        <div className="space-y-2">
          {q.data!.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm">
              <span>"{r.match_text}" → <strong>{r.vendor_name}</strong></span>
              {manage && <Button variant="ghost" size="sm" onClick={() => del.mutate(r.id)}>Ta bort</Button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default RulesPage;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@/modules/shared/router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/modules/papers/client";
import { ROLE_LABEL, canManage, errorMessage, type OrgRole } from "@/modules/papers/lib/aurora";
import { useOrg } from "@/modules/papers/lib/use-org";

export const Route = createFileRoute("/_authenticated/o/$orgId/settings")({
  component: SettingsPage,
});

const PLANS = [
  { name: "Enskilt företag", price: "249 kr", scope: "1 företag" },
  { name: "Flera bolag", price: "899 kr", scope: "Upp till 5 företag" },
  { name: "Byrå", price: "1 990 kr", scope: "Upp till 15 företag" },
];

function SettingsPage() {
  const { orgId, org, role, userId } = useOrg();
  const qc = useQueryClient();
  const manage = canManage(role);
  const isOwner = role === "owner";
  const [name, setName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("reviewer");

  useEffect(() => {
    if (org) {
      setName(org.name);
      setOrgNumber(org.org_number ?? "");
    }
  }, [org]);

  const team = useQuery({
    queryKey: ["team", orgId],
    queryFn: async () => {
      const [m, i, b] = await Promise.all([
        supabase.from("memberships").select("*").eq("org_id", orgId).order("created_at"),
        manage ? supabase.from("invitations").select("*").eq("org_id", orgId).is("accepted_at", null) : Promise.resolve({ data: [] as never[] }),
        supabase.from("billing_state").select("*").eq("org_id", orgId).maybeSingle(),
      ]);
      return { members: m.data ?? [], invites: i.data ?? [], billing: b.data };
    },
  });
  const inv = () => qc.invalidateQueries({ queryKey: ["team", orgId] });

  const saveOrg = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("organisations").update({ name: name.trim(), org_number: orgNumber.trim() || null }).eq("id", orgId);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Sparat"); qc.invalidateQueries({ queryKey: ["org", orgId] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const invite = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("invitations").insert({ org_id: orgId, email: email.trim().toLowerCase(), role: inviteRole, invited_by: userId! });
      if (error) throw error;
    },
    onSuccess: () => { setEmail(""); toast.success("Inbjudan sparad", { description: "Inget mejl skickas. Be personen skapa konto med samma e-post." }); inv(); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const act = useMutation({
    mutationFn: async (fn: () => PromiseLike<{ error: unknown }>) => {
      const { error } = await fn();
      if (error) throw error;
    },
    onSuccess: inv,
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Team & inställningar</h1>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Organisation</CardTitle></CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); saveOrg.mutate(); }}>
            <div className="space-y-1"><Label htmlFor="n">Namn</Label><Input id="n" disabled={!manage} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1"><Label htmlFor="o">Organisationsnummer</Label><Input id="o" disabled={!manage} value={orgNumber} onChange={(e) => setOrgNumber(e.target.value)} /></div>
            {manage && <Button disabled={saveOrg.isPending}>Spara</Button>}
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Team</CardTitle>
          <p className="text-xs text-muted-foreground">Owner hanterar roller. Admin hanterar regler, export och inbjudningar. Reviewer granskar och godkänner.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {team.data?.members.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-2.5 text-sm">
              <span>{m.email ?? m.user_id}{m.user_id === userId && " (du)"}</span>
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <Select value={m.role} onValueChange={(v) => act.mutate(() => supabase.from("memberships").update({ role: v as OrgRole }).eq("id", m.id))}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{(["owner", "admin", "reviewer"] as OrgRole[]).map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}</SelectContent>
                  </Select>
                ) : <Badge variant="outline">{ROLE_LABEL[m.role]}</Badge>}
                {isOwner && m.user_id !== userId && (
                  <Button variant="ghost" size="sm" onClick={() => act.mutate(() => supabase.from("memberships").delete().eq("id", m.id))}>Ta bort</Button>
                )}
              </div>
            </div>
          ))}
          {team.data?.invites.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground">
              <span>{i.email} · inbjuden som {ROLE_LABEL[i.role]}</span>
              <Button variant="ghost" size="sm" onClick={() => act.mutate(() => supabase.from("invitations").delete().eq("id", i.id))}>Återkalla</Button>
            </div>
          ))}
          {manage && !org?.is_demo && (
            <form className="flex flex-wrap items-end gap-3 pt-2" onSubmit={(e) => { e.preventDefault(); invite.mutate(); }}>
              <div className="space-y-1"><Label htmlFor="e">Bjud in via e-post</Label><Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="reviewer">Reviewer</SelectItem></SelectContent>
              </Select>
              <Button disabled={invite.isPending}>Bjud in</Button>
            </form>
          )}
          <p className="text-xs text-muted-foreground">Inga e-postutskick görs. Inbjudan aktiveras när personen loggar in med en bekräftad adress som matchar.</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Abonnemang</CardTitle>
            <Badge variant="outline">Ej aktiverat</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Betalning är inte öppen. Inga kortuppgifter tas emot och inget debiteras.</p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className="rounded-lg border border-border p-4 text-sm">
              <p className="font-medium">{p.name}</p>
              <p className="mt-1 text-xl font-semibold">{p.price}<span className="text-xs font-normal text-muted-foreground"> /mån exkl. moms</span></p>
              <p className="text-xs text-muted-foreground">{p.scope}</p>
              <Button className="mt-3 w-full" size="sm" variant="secondary" disabled>Betalning ej aktiverad</Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground sm:col-span-3">Status i databasen: {team.data?.billing?.status ?? "–"}</p>
        </CardContent>
      </Card>
    </div>
  );
}


export default SettingsPage;

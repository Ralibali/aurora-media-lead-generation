import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@/modules/shared/router";
import { Building2, FileText, FlaskConical, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/modules/papers/client";
import { ROLE_LABEL, errorMessage } from "@/modules/papers/lib/aurora";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Mina organisationer – Aurora Receipt" },
      { name: "description", content: "Välj eller skapa organisation i Aurora Receipt." },
      { property: "og:title", content: "Mina organisationer – Aurora Receipt" },
      { property: "og:description", content: "Organisationer i Aurora Receipt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrgPicker,
});

function OrgPicker() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [orgNumber, setOrgNumber] = useState("");

  useEffect(() => {
    supabase.rpc("accept_invitations").then(({ data }) => {
      if (data && data > 0) {
        toast.success(`Du har lagts till i ${data} organisation(er)`);
        qc.invalidateQueries({ queryKey: ["my-orgs"] });
      }
    });
  }, [qc]);

  const orgs = useQuery({
    queryKey: ["my-orgs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memberships")
        .select("role, organisations(id, name, is_demo, org_number)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("create_organisation", orgNumber ? { _name: name, _org_number: orgNumber } : { _name: name });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (id) => navigate({ to: "/o/$orgId", params: { orgId: id } }),
    onError: (e) => toast.error("Kunde inte skapa organisation", { description: errorMessage(e) }),
  });

  const demo = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("create_demo_organisation");
      if (error) throw error;
      return data as string;
    },
    onSuccess: (id) => navigate({ to: "/o/$orgId", params: { orgId: id } }),
    onError: (e) => toast.error("Kunde inte skapa demo", { description: errorMessage(e) }),
  });

  const list = orgs.data ?? [];
  const hasDemo = list.some((m) => m.organisations?.is_demo);

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-aurora inline-flex size-7 items-center justify-center rounded-md">
              <FileText className="size-4 text-primary-foreground" />
            </span>
            <span className="font-semibold tracking-tight">Aurora Receipt</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}>
              <LogOut className="mr-1 size-4" /> Logga ut
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-8 px-5 py-10">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight">Dina organisationer</h1>
          <p className="mt-1 text-sm text-muted-foreground">Varje organisation har en egen inkorg. Data delas aldrig mellan dem.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {orgs.isLoading && <Skeleton className="h-20" />}
            {orgs.isError && <p className="text-sm text-destructive">Kunde inte läsa organisationer: {errorMessage(orgs.error)}</p>}
            {!orgs.isLoading && list.length === 0 && (
              <p className="text-sm text-muted-foreground">Du är inte med i någon organisation än. Skapa en nedan.</p>
            )}
            {list.map((m) =>
              m.organisations ? (
                <Link key={m.organisations.id} to="/o/$orgId" params={{ orgId: m.organisations.id }}>
                  <Card className="shadow-soft transition-colors hover:border-accent">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="size-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{m.organisations.name}</p>
                          <p className="text-xs text-muted-foreground">{ROLE_LABEL[m.role]}</p>
                        </div>
                      </div>
                      {m.organisations.is_demo && <Badge variant="secondary">DEMO</Badge>}
                    </CardContent>
                  </Card>
                </Link>
              ) : null,
            )}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Skapa organisation</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim()) create.mutate();
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="org-name">Företagsnamn</Label>
                  <Input id="org-name" required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="org-nr">Organisationsnummer (valfritt)</Label>
                  <Input id="org-nr" maxLength={20} value={orgNumber} onChange={(e) => setOrgNumber(e.target.value)} />
                </div>
                <Button disabled={create.isPending}>Skapa och bli owner</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="size-4" /> Prova med demodata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Skapar en separat organisation märkt DEMO med påhittade exempeldokument (inga riktiga filer eller
                kunder). Den blandas aldrig med dina riktiga organisationer.
              </p>
              <Button variant="secondary" disabled={demo.isPending || hasDemo} onClick={() => demo.mutate()}>
                {hasDemo ? "Demo finns redan" : "Skapa demo-organisation"}
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}


export default OrgPicker;

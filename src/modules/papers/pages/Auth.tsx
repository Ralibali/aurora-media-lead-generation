import { createFileRoute, Link, useNavigate } from "@/modules/shared/router";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/modules/papers/client";
import { errorMessage } from "@/modules/papers/lib/aurora";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Logga in – Aurora Receipt" },
      { name: "description", content: "Logga in eller skapa konto i Aurora Receipt, dokumentinkorgen för kvitton och leverantörsfakturor." },
      { property: "og:title", content: "Logga in – Aurora Receipt" },
      { property: "og:description", content: "Logga in i Aurora Receipt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app" });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error("Inloggningen misslyckades", { description: error.message }); return; }
    navigate({ to: "/app" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Lösenordet måste vara minst 8 tecken"); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/portal/papers` },
      });
      if (error) throw error;
      if (data.session) navigate({ to: "/app" });
      else toast.success("Konto skapat", { description: "Bekräfta din e-postadress via länken i mejlet och logga sedan in." });
    } catch (err) {
      toast.error("Kunde inte skapa konto", { description: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const fields = (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-post</Label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Lösenord</Label>
        <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="bg-aurora inline-flex size-7 items-center justify-center rounded-md">
            <FileText className="size-4 text-primary-foreground" />
          </span>
          <span className="font-semibold tracking-tight">Aurora Receipt</span>
        </Link>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Dokumentinkorgen</CardTitle>
            <p className="text-sm text-muted-foreground">Logga in med ditt Papers-konto. Inloggningen är separat från Aurora Media-administrationen.</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="in">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="in">Logga in</TabsTrigger>
                <TabsTrigger value="up">Skapa konto</TabsTrigger>
              </TabsList>
              <TabsContent value="in">
                <form onSubmit={signIn} className="space-y-4">
                  {fields}
                  <Button className="w-full" disabled={busy}>Logga in</Button>
                </form>
              </TabsContent>
              <TabsContent value="up">
                <form onSubmit={signUp} className="space-y-4">
                  {fields}
                  <Button className="w-full" disabled={busy}>Skapa konto</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default AuthPage;

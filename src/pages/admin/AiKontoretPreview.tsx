import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import AdminShell, { ADMIN_STORAGE_KEY } from "@/pages/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FN_LAUNCH_STATUS } from "@/config/aiKontoret";

type AssetPreview = {
  product: "guide" | "vault";
  label: string;
  version: string;
  storage_path: string;
  uploaded_at: string | null;
  file_bytes: number | null;
  exists: boolean;
  url: string | null;
};

const TITLES: Record<AssetPreview["product"], string> = {
  guide: "AI-KONTORET – Guide",
  vault: "AI-KONTORET – Prompt Vault",
};

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "Okänd storlek";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} kB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Inget versionsdatum";
  return new Date(iso).toLocaleString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAiKontoretPreview() {
  const [assets, setAssets] = useState<AssetPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<AssetPreview["product"] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(FN_LAUNCH_STATUS, {
        body: { action: "preview_assets" },
        headers: { "x-admin-token": sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? "" },
      });
      if (error) throw error;
      const list = ((data?.assets ?? []) as AssetPreview[]).sort((a) =>
        a.product === "guide" ? -1 : 1,
      );
      setAssets(list);
      setActive((prev) => prev ?? list.find((a) => a.exists)?.product ?? null);
    } catch {
      toast.error("Kunde inte hämta förhandsgranskningen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const current = assets.find((a) => a.product === active) ?? null;

  return (
    <AdminShell title="Förhandsgranska PDF:er" kicker="AI-KONTORET">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/ai-kontoret">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-2">Tillbaka till AI-KONTORET</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Uppdatera länkar</span>
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            Länkarna är signerade och gäller i 10 minuter. Filerna ligger kvar i den privata
            lagringen – ingen publik url skapas.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2">
          {assets.map((a) => (
            <Card
              key={a.product}
              className={a.product === active ? "border-primary" : undefined}
            >
              <CardHeader className="space-y-1">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  {TITLES[a.product]}
                  <Badge variant={a.exists ? "default" : "secondary"}>
                    {a.exists ? `v${a.version}` : "Saknas"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <dl className="space-y-1 text-muted-foreground">
                  <div className="flex justify-between gap-3">
                    <dt>Versionsdatum</dt>
                    <dd className="text-right text-foreground">{formatDate(a.uploaded_at)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Filstorlek</dt>
                    <dd className="text-right text-foreground">{formatBytes(a.file_bytes)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Sökväg</dt>
                    <dd className="break-all text-right font-mono text-xs">{a.storage_path}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={a.product === active ? "default" : "outline"}
                    disabled={!a.exists || !a.url}
                    onClick={() => setActive(a.product)}
                  >
                    Visa här
                  </Button>
                  {a.url ? (
                    <>
                      <Button asChild size="sm" variant="outline">
                        <a href={a.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="ml-2">Ny flik</span>
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <a href={a.url} download>
                          <Download className="h-4 w-4" />
                          <span className="ml-2">Ladda ner</span>
                        </a>
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Inga produktfiler hittades. Ladda upp PDF:erna under Admin → AI-KONTORET.
            </p>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Förhandsgranskning{current ? ` – ${TITLES[current.product]}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {current?.url ? (
              <iframe
                key={current.url}
                src={current.url}
                title={TITLES[current.product]}
                className="h-[70vh] w-full rounded-md border bg-muted"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {loading ? "Hämtar…" : "Välj en uppladdad PDF ovan för att förhandsgranska den."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ClipboardCopy, FileUp, Loader2, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import AdminShell, { ADMIN_STORAGE_KEY } from "@/pages/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ASSET_BUCKET,
  ASSET_PATHS,
  FN_LAUNCH_STATUS,
  FN_UPLOAD_ASSET,
  FN_DELIVER,
  LEGAL_ACK_TEXT,
  LEGAL_OWNER_CONFIRMED,
  PRICES,
  PRODUCT_STATUS,
  PRODUCT_VERSION,
  VAT_CLASSIFICATION_CONFIRMED,
  VAT_CLASSES,
} from "@/config/aiKontoret";

type Checks = {
  stripe?: boolean;
  webhook_secret?: boolean;
  service_role?: boolean;
  email?: boolean;
  asset_guide?: boolean;
  asset_vault?: boolean;
  legal_confirmed?: boolean;
  vat_classified?: boolean;
};

const CHECK_LABELS: { key: keyof Checks; label: string; hint: string }[] = [
  { key: "stripe", label: "Stripe-nyckel", hint: "STRIPE_SECRET_KEY måste finnas som secret." },
  { key: "webhook_secret", label: "Webhook-secret", hint: "STRIPE_WEBHOOK_SECRET för ai-kontoret-deliver." },
  { key: "service_role", label: "Serverbehörighet", hint: "Backendens servicenyckel finns." },
  { key: "email", label: "E-postleverans", hint: "RESEND_API_KEY för leveransmejl." },
  { key: "asset_guide", label: "Guide-PDF uppladdad", hint: ASSET_PATHS.guide },
  { key: "asset_vault", label: "Prompt Vault-PDF uppladdad", hint: ASSET_PATHS.vault },
  { key: "legal_confirmed", label: "Juridiskt godkännande", hint: "Kräver adminbekräftelse OCH LEGAL_OWNER_CONFIRMED i koden." },
  { key: "vat_classified", label: "Momsklasser bekräftade", hint: "VAT_CLASSIFICATION_CONFIRMED i koden. Bundle är två tillhandahållanden (174,50 + 174,50), inte hel-SKU 6 %." },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r !== "string") return reject(new Error("Kunde inte läsa filen."));
      const idx = r.indexOf(",");
      resolve(idx >= 0 ? r.slice(idx + 1) : r);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Filfel"));
    reader.readAsDataURL(file);
  });
}

export default function AdminAiKontoret() {
  const [checks, setChecks] = useState<Checks>({});
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [reissueKey, setReissueKey] = useState("");
  const guideRef = useRef<HTMLInputElement>(null);
  const vaultRef = useRef<HTMLInputElement>(null);

  const token = () => sessionStorage.getItem(ADMIN_STORAGE_KEY) ?? "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(FN_LAUNCH_STATUS, {
        body: {},
        headers: { "x-admin-token": token() },
      });
      if (error) throw error;
      setChecks((data?.checks ?? {}) as Checks);
      setReady(Boolean(data?.ready));
    } catch {
      toast.error("Kunde inte läsa lanseringsstatus.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (product: "guide" | "vault", file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Filen måste vara en PDF.");
      return;
    }
    setBusy(product);
    try {
      const pdf_base64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke(FN_UPLOAD_ASSET, {
        body: { product, pdf_base64 },
        headers: { "x-admin-token": token() },
      });
      if (error || data?.error) throw new Error(data?.error ?? "upload_failed");
      toast.success(`${product === "guide" ? "Guiden" : "Prompt Vault"} uppladdad till privat lagring.`);
      await load();
    } catch (err) {
      toast.error(`Uppladdningen misslyckades: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const setLegal = async (value: boolean) => {
    setBusy("legal");
    try {
      const { data, error } = await supabase.functions.invoke(FN_LAUNCH_STATUS, {
        body: { action: "set_legal", legal_confirmed: value },
        headers: { "x-admin-token": token() },
      });
      if (error) throw error;
      setChecks((data?.checks ?? {}) as Checks);
      setReady(Boolean(data?.ready));
      toast.success(value ? "Juridiken bekräftad." : "Bekräftelsen borttagen.");
    } catch {
      toast.error("Kunde inte uppdatera godkännandet.");
    } finally {
      setBusy(null);
    }
  };

  const copySecretName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      toast.success(`Kopierade "${name}". Be mig lägga till den som secret, eller gör det i backendinställningarna.`);
    } catch {
      toast.info(`Hemlighetens namn: ${name}`);
    }
  };

  type Step = {
    key: string;
    ok: boolean;
    title: string;
    detail: string;
    action?: { label: string; run: () => void; disabled?: boolean; variant?: "default" | "outline" };
  };

  const checklistSteps: Step[] = [
    {
      key: "stripe",
      ok: Boolean(checks.stripe),
      title: "Stripe-nyckel (STRIPE_SECRET_KEY)",
      detail: "Betalning kan inte tas emot utan hemlig Stripe-nyckel i backenden.",
      action: { label: "Kopiera hemlighetens namn", run: () => void copySecretName("STRIPE_SECRET_KEY"), variant: "outline" },
    },
    {
      key: "webhook",
      ok: Boolean(checks.webhook_secret),
      title: "Webhook-secret (STRIPE_WEBHOOK_SECRET)",
      detail: "Kopiera webhook-endpointen till ai-kontoret-deliver i Stripe och lägg in signaturhemligheten.",
      action: { label: "Kopiera hemlighetens namn", run: () => void copySecretName("STRIPE_WEBHOOK_SECRET"), variant: "outline" },
    },
    {
      key: "service_role",
      ok: Boolean(checks.service_role),
      title: "Serverbehörighet",
      detail: "Backendens servicenyckel måste finnas för att leverans och lagring ska fungera.",
    },
    {
      key: "email",
      ok: Boolean(checks.email),
      title: "E-postleverans (RESEND_API_KEY)",
      detail: "Leveransmejlen med nedladdningslänkar kräver en Resend-nyckel.",
      action: { label: "Kopiera hemlighetens namn", run: () => void copySecretName("RESEND_API_KEY"), variant: "outline" },
    },
    {
      key: "guide",
      ok: Boolean(checks.asset_guide),
      title: "Guide-PDF uppladdad",
      detail: `Filen måste ligga på ${ASSET_PATHS.guide} i privat lagring.`,
      action: { label: "Ladda upp guide-PDF", run: () => guideRef.current?.click(), disabled: busy === "guide" },
    },
    {
      key: "vault",
      ok: Boolean(checks.asset_vault),
      title: "Prompt Vault-PDF uppladdad",
      detail: `Filen måste ligga på ${ASSET_PATHS.vault} i privat lagring.`,
      action: { label: "Ladda upp Vault-PDF", run: () => vaultRef.current?.click(), disabled: busy === "vault" },
    },
    {
      key: "legal",
      ok: Boolean(checks.legal_confirmed),
      title: "Juridiskt godkännande",
      detail: LEGAL_OWNER_CONFIRMED
        ? "Läs villkorstexten längre ner och bekräfta att du står bakom den."
        : "Kodflaggan LEGAL_OWNER_CONFIRMED är fortfarande false. Adminbekräftelse ensamt öppnar inte kassan. Det är inte ett juridiskt godkännande.",
      action: { label: "Bekräfta juridiken", run: () => void setLegal(true), disabled: busy === "legal" || !LEGAL_OWNER_CONFIRMED },
    },
    {
      key: "vat",
      ok: Boolean(checks.vat_classified),
      title: "Momsklasser bekräftade",
      detail: `Guide: ${VAT_CLASSES.guide}. Vault: ${VAT_CLASSES.vault}. Bundle: ${VAT_CLASSES.bundle} (174,50 + 174,50). Bekräftelseflagga: ${VAT_CLASSIFICATION_CONFIRMED ? "true" : "false"}.`,
    },
    {
      key: "status",
      ok: PRODUCT_STATUS === "live",
      title: "PRODUCT_STATUS = \"live\"",
      detail: "Sista spärren sitter i koden (src/config/aiKontoret.ts). Be mig slå om till live först när allt ovan är grönt och du testat ett köp.",
    },
  ];

  const missing = checklistSteps.filter((s) => !s.ok);

  const reissue = async () => {
    const value = reissueKey.trim();
    if (!value) return;
    setBusy("reissue");
    try {
      const body = value.startsWith("cs_") ? { session_id: value } : { email: value };
      const { data, error } = await supabase.functions.invoke(FN_DELIVER, {
        body,
        headers: { "x-admin-token": token() },
      });
      if (error || data?.error) throw new Error(data?.error ?? "reissue_failed");
      toast.success("Nya nedladdningslänkar skickade.");
    } catch (err) {
      toast.error(`Kunde inte skicka om leveransen: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell title="AI-KONTORET" kicker="Produkt & lansering">
      <div className="space-y-6">
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Läge i koden: <b>{PRODUCT_STATUS}</b>. Köpknapparna på /grok-bot öppnas endast när
            PRODUCT_STATUS är <code>live</code> <i>och</i> alla kontroller nedan är gröna. Priser:{" "}
            {PRICES.guide}/{PRICES.vault}/{PRICES.bundle} kr.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="text-base">
              Ägar-checklista inför live{" "}
              <Badge variant={missing.length === 0 ? "default" : "secondary"}>
                {missing.length === 0 ? "Allt klart" : `${missing.length} kvar`}
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Uppdatera</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && checklistSteps.every((s) => !s.ok) ? (
              <p className="text-sm text-muted-foreground">Läser status…</p>
            ) : (
              checklistSteps.map((s) => (
                <div
                  key={s.key}
                  className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {s.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="break-words text-xs text-muted-foreground">{s.detail}</p>
                    </div>
                  </div>
                  {!s.ok && s.action && (
                    <Button
                      size="sm"
                      variant={s.action.variant ?? "default"}
                      className="shrink-0"
                      disabled={s.action.disabled}
                      onClick={s.action.run}
                    >
                      {s.action.disabled ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : s.key === "guide" || s.key === "vault" ? (
                        <FileUp className="h-4 w-4" />
                      ) : s.key === "legal" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <ClipboardCopy className="h-4 w-4" />
                      )}
                      <span className="ml-2">{s.action.label}</span>
                    </Button>
                  )}
                </div>
              ))
            )}
            {missing.length === 0 && !loading && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Alla kontroller är gröna. Gör ett testköp i Stripe-läge och verifiera att mejlet
                  med nedladdningslänkar kommer fram innan du ber mig sätta PRODUCT_STATUS till live.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="text-base">
              Lanseringsspärr{" "}
              <Badge variant={ready ? "default" : "secondary"}>{ready ? "Klar för live" : "Inte klar"}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Uppdatera</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {CHECK_LABELS.map((c) => {
              const ok = Boolean(checks[c.key]);
              return (
                <div key={c.key} className="flex items-start gap-3 rounded-md border p-3">
                  {ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="break-all text-xs text-muted-foreground">{c.hint}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ladda upp produktfilerna (privat lagring)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Filerna hamnar i den privata lagringsplatsen <code>{ASSET_BUCKET}</code> på exakt dessa
              sökvägar. Inget publikt läge, inga gissningsbara url:er – kunden får korta signerade
              länkar efter verifierad betalning.
            </p>
            <ul className="space-y-1 break-all font-mono text-xs">
              <li>{ASSET_PATHS.guide}</li>
              <li>{ASSET_PATHS.vault}</li>
            </ul>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>AI-KONTORET_Guide_v{PRODUCT_VERSION}.pdf</Label>
                <input
                  ref={guideRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload("guide", f);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={busy === "guide"}
                  onClick={() => guideRef.current?.click()}
                >
                  {busy === "guide" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                  <span className="ml-2">Välj guide-PDF</span>
                </Button>
              </div>
              <div className="space-y-2">
                <Label>AI-KONTORET_Prompt_Vault_v{PRODUCT_VERSION}.pdf</Label>
                <input
                  ref={vaultRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void upload("vault", f);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={busy === "vault"}
                  onClick={() => vaultRef.current?.click()}
                >
                  {busy === "vault" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                  <span className="ml-2">Välj Vault-PDF</span>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Efter uppladdning: klicka “Uppdatera” ovan. Raderna “Guide-PDF uppladdad” och “Prompt
              Vault-PDF uppladdad” blir gröna först när filerna faktiskt finns på sökvägarna.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/ai-kontoret/forhandsgranskning">
                Förhandsgranska PDF:erna (version & filstorlek)
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Juridiskt godkännande (owner gate)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Detta är texten kunden aktivt måste kryssa i före betalning. <b>Utkast</b> – inte
              juridiskt godkänd. Adminbekräftelsen räcker inte: LEGAL_OWNER_CONFIRMED i koden är{" "}
              <b>{LEGAL_OWNER_CONFIRMED ? "true" : "false"}</b>. Säg till när du godkänt den slutliga
              formuleringen. Ingen agent får påstå att texten är godkänd.
            </p>
            <blockquote className="rounded-md border-l-4 border-primary/60 bg-muted/40 p-3 text-sm">
              {LEGAL_ACK_TEXT}
            </blockquote>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={busy === "legal" || Boolean(checks.legal_confirmed)}
                onClick={() => void setLegal(true)}
              >
                Jag bekräftar texten
              </Button>
              <Button
                variant="outline"
                disabled={busy === "legal" || !checks.legal_confirmed}
                onClick={() => void setLegal(false)}
              >
                Ta bort bekräftelsen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skicka om leveranslänkar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Signerade länkar går ut efter en tid. Skriv kundens e-post eller Stripe-sessionens id
              (cs_…) för att skicka nya länkar – lagringen förblir privat.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={reissueKey}
                onChange={(e) => setReissueKey(e.target.value)}
                placeholder="kund@example.se eller cs_…"
              />
              <Button onClick={() => void reissue()} disabled={busy === "reissue" || !reissueKey.trim()}>
                {busy === "reissue" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span className={busy === "reissue" ? "ml-2" : ""}>Skicka nya länkar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

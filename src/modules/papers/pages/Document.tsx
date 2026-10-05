import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@/modules/shared/router";
import { useServerFn } from "@/modules/papers/lib/server-functions";
import { AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/modules/papers/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/modules/papers/client";
import { canManage, errorMessage, formatDateTime } from "@/modules/papers/lib/aurora";
import { processDocument } from "@/modules/papers/lib/documents.functions";
import { useOrg } from "@/modules/papers/lib/use-org";

export const Route = createFileRoute("/_authenticated/o/$orgId/documents/$docId")({
  component: DocumentPage,
});

const FIELDS = [
  ["vendor", "Leverantör", "text"],
  ["invoice_number", "Fakturanummer", "text"],
  ["invoice_date", "Fakturadatum", "date"],
  ["due_date", "Förfallodatum", "date"],
  ["net_amount", "Netto (SEK)", "number"],
  ["vat_amount", "Moms (SEK)", "number"],
  ["gross_amount", "Brutto (SEK)", "number"],
  ["ocr_reference", "OCR-referens", "text"],
] as const;
type FieldKey = (typeof FIELDS)[number][0];
type Form = Record<FieldKey, string> & { notes: string };

function DocumentPage() {
  const { docId } = Route.useParams();
  const { orgId, role } = useOrg();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const process = useServerFn(processDocument);
  const [form, setForm] = useState<Form | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["doc", docId],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").eq("id", docId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const doc = q.data;

  const dup = useQuery({
    queryKey: ["doc-dup", doc?.duplicate_of],
    enabled: !!doc?.duplicate_of,
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("id, file_name, status").eq("id", doc!.duplicate_of!).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!doc) return;
    const f = {} as Form;
    for (const [k] of FIELDS) f[k] = doc[k] == null ? "" : String(doc[k]);
    f.notes = doc.notes ?? "";
    setForm(f);
  }, [doc]);

  useEffect(() => {
    if (!doc?.storage_path) return;
    supabase.storage.from("originals").createSignedUrl(doc.storage_path, 300).then(({ data }) => setPreviewUrl(data?.signedUrl ?? null));
  }, [doc?.storage_path]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["doc", docId] });
    qc.invalidateQueries({ queryKey: ["docs-list", orgId] });
    qc.invalidateQueries({ queryKey: ["docs", orgId] });
  };

  function payload() {
    const p: Record<string, string | number | null> = { notes: form!.notes || null };
    for (const [k, , t] of FIELDS) {
      const v = form![k].trim();
      p[k] = v === "" ? null : t === "number" ? Number(v.replace(",", ".")) : v;
    }
    return p;
  }

  const save = useMutation({
    mutationFn: async (status?: "approved" | "needs_review") => {
      const update = status === "needs_review" ? { status } : { ...payload(), ...(status ? { status } : {}) };
      const { error } = await supabase.from("documents").update(update).eq("id", docId);
      if (error) throw error;
      return status;
    },
    onSuccess: (s) => {
      toast.success(s === "approved" ? "Godkänd" : s === "needs_review" ? "Återöppnad för granskning" : "Sparat");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("documents").delete().eq("id", docId);
      if (error) throw error;
      if (doc?.storage_path) await supabase.storage.from("originals").remove([doc.storage_path]);
    },
    onSuccess: () => {
      toast.success("Dokumentet togs bort");
      refresh();
      navigate({ to: "/o/$orgId/inbox", params: { orgId } });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (q.isLoading) return <Skeleton className="h-96" />;
  if (!doc || !form) return <p className="text-sm text-muted-foreground">Dokumentet hittades inte.</p>;

  const locked = doc.status === "approved" || doc.status === "exported";
  const isImage = doc.mime_type?.startsWith("image/");

  return (
    <div className="space-y-5">
      <Link to="/o/$orgId/inbox" params={{ orgId }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Inkorg
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="truncate text-xl font-semibold tracking-tight">{doc.file_name}</h1>
        <StatusBadge status={doc.status} />
      </div>
      {doc.duplicate_of && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 text-destructive" />
          <span>
            Möjlig dubblett (samma fil eller samma leverantör + fakturanummer) av{" "}
            {dup.data ? (
              <Link to="/o/$orgId/documents/$docId" params={{ orgId, docId: dup.data.id }} className="underline">{dup.data.file_name}</Link>
            ) : "ett annat dokument"}
            . Kontrollera innan du godkänner.
          </span>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Original</CardTitle></CardHeader>
          <CardContent>
            {!doc.storage_path ? (
              <p className="text-sm text-muted-foreground">DEMO-dokument utan originalfil.</p>
            ) : !previewUrl ? (
              <Skeleton className="h-96" />
            ) : (
              <div className="space-y-2">
                {isImage ? (
                  <img src={previewUrl} alt={doc.file_name} className="max-h-[600px] w-full rounded border object-contain" />
                ) : (
                  <iframe title="Original" src={previewUrl} className="h-[600px] w-full rounded border" />
                )}
                <a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline">
                  Öppna i ny flik (länken gäller i 5 minuter) <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Fält</CardTitle>
            <p className="text-xs text-muted-foreground">{doc.extraction_note ?? "Fyll i fälten manuellt."}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {FIELDS.map(([k, label, type]) => (
                <div key={k} className="space-y-1">
                  <Label htmlFor={k}>{label}</Label>
                  <Input
                    id={k}
                    type={type === "number" ? "text" : type}
                    inputMode={type === "number" ? "decimal" : undefined}
                    disabled={locked}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Anteckning</Label>
              <Textarea id="notes" disabled={doc.status === "exported"} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {doc.status === "new" && (
                <Button onClick={() => process({ data: { documentId: doc.id } }).then(refresh).catch((e) => toast.error(errorMessage(e)))}>
                  Bearbeta igen
                </Button>
              )}
              {doc.status === "needs_review" && (
                <>
                  <Button variant="secondary" disabled={save.isPending} onClick={() => save.mutate(undefined)}>Spara</Button>
                  <Button disabled={save.isPending} onClick={() => save.mutate("approved")}>Spara och godkänn</Button>
                </>
              )}
              {doc.status === "approved" && (
                <Button variant="secondary" disabled={save.isPending} onClick={() => save.mutate("needs_review")}>Återöppna</Button>
              )}
              {canManage(role) && doc.status !== "exported" && (
                <Button variant="ghost" className="text-destructive" disabled={remove.isPending} onClick={() => confirm("Ta bort dokumentet och originalfilen?") && remove.mutate()}>
                  Ta bort
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Uppladdad {formatDateTime(doc.created_at)}
              {doc.approved_at && ` · Godkänd ${formatDateTime(doc.approved_at)}`}
              {doc.exported_at && ` · Exporterad ${formatDateTime(doc.exported_at)}`}
              {doc.file_hash && ` · SHA-256 ${doc.file_hash.slice(0, 12)}…`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default DocumentPage;

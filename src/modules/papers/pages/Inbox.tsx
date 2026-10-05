import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@/modules/shared/router";
import { useServerFn } from "@/modules/papers/lib/server-functions";
import { AlertTriangle, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/modules/papers/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/modules/papers/client";
import { ACCEPTED_TYPES, MAX_BYTES, STATUS_LABEL, errorMessage, formatSek, type DocStatus } from "@/modules/papers/lib/aurora";
import { processDocument } from "@/modules/papers/lib/documents.functions";
import { useOrg } from "@/modules/papers/lib/use-org";

export const Route = createFileRoute("/_authenticated/o/$orgId/inbox")({
  component: InboxPage,
});

const EXT: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" };

function InboxPage() {
  const { orgId, org, userId } = useOrg();
  const qc = useQueryClient();
  const process = useServerFn(processDocument);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<DocStatus | "all">("needs_review");
  const [uploading, setUploading] = useState(0);

  const q = useQuery({
    queryKey: ["docs-list", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, status, file_name, vendor, invoice_number, invoice_date, gross_amount, duplicate_of, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function uploadFiles(files: FileList | null) {
    if (!files || !userId) return;
    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: endast PDF, JPG och PNG stöds`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: filen är större än 20 MB`);
        continue;
      }
      setUploading((n) => n + 1);
      try {
        const path = `${orgId}/${crypto.randomUUID()}.${EXT[file.type]}`;
        const { error: upErr } = await supabase.storage.from("originals").upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { data: doc, error } = await supabase
          .from("documents")
          .insert({ org_id: orgId, storage_path: path, file_name: file.name.slice(0, 250), mime_type: file.type, size_bytes: file.size, uploaded_by: userId })
          .select("id")
          .single();
        if (error) throw error;
        const res = await process({ data: { documentId: doc.id } });
        if (res.duplicateOf) toast.warning(`${file.name}: möjlig dubblett av ett befintligt dokument`);
        else toast.success(`${file.name} uppladdad – redo för granskning`);
      } catch (e) {
        toast.error(`${file.name}: ${errorMessage(e)}`);
      } finally {
        setUploading((n) => n - 1);
        qc.invalidateQueries({ queryKey: ["docs-list", orgId] });
        qc.invalidateQueries({ queryKey: ["docs", orgId] });
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  const docs = (q.data ?? []).filter((d) => filter === "all" || d.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inkorg</h1>
        <p className="text-sm text-muted-foreground">
          Ingen automatisk tolkning är aktiverad – nya filer hamnar i "Att granska" där du fyller i fälten.
        </p>
      </div>

      {org?.is_demo ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Detta är en DEMO-organisation med påhittade dokument. Ladda upp riktiga underlag i en egen organisation.
        </p>
      ) : (
        <Card
          className="shadow-soft border-dashed"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            uploadFiles(e.dataTransfer.files);
          }}
        >
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <UploadCloud className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Dra hit PDF, JPG eller PNG (max 20 MB) eller</p>
            <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={(e) => uploadFiles(e.target.files)} />
            <Button onClick={() => inputRef.current?.click()} disabled={uploading > 0}>
              {uploading > 0 ? `Laddar upp (${uploading})…` : "Välj filer"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as DocStatus | "all")}>
        <TabsList>
          <TabsTrigger value="needs_review">{STATUS_LABEL.needs_review}</TabsTrigger>
          <TabsTrigger value="new">{STATUS_LABEL.new}</TabsTrigger>
          <TabsTrigger value="approved">{STATUS_LABEL.approved}</TabsTrigger>
          <TabsTrigger value="exported">{STATUS_LABEL.exported}</TabsTrigger>
          <TabsTrigger value="all">Alla</TabsTrigger>
        </TabsList>
      </Tabs>

      {q.isLoading ? (
        <Skeleton className="h-40" />
      ) : q.isError ? (
        <p className="text-sm text-destructive">Kunde inte läsa dokument: {errorMessage(q.error)}</p>
      ) : docs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">Inga dokument i den här vyn.</p>
      ) : (
        <Card className="shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fil</TableHead>
                <TableHead>Leverantör</TableHead>
                <TableHead>Fakturanr</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Brutto</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="max-w-56 truncate">
                    <Link to="/o/$orgId/documents/$docId" params={{ orgId, docId: d.id }} className="font-medium hover:underline">
                      {d.file_name}
                    </Link>
                    {d.duplicate_of && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="size-3" /> Dubblett?
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{d.vendor ?? "–"}</TableCell>
                  <TableCell>{d.invoice_number ?? "–"}</TableCell>
                  <TableCell>{d.invoice_date ?? "–"}</TableCell>
                  <TableCell className="text-right">{formatSek(d.gross_amount)}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}


export default InboxPage;

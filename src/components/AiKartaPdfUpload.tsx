import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, FileUp, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { trackAiKartaClick } from "@/lib/aiKartaTracking";

const RESULT_KEY = "aurora_ai_map_result";
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

type Status = "idle" | "reading" | "uploading" | "error";

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

const AiKartaPdfUpload = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setMissing([]);
      setFileName(file.name);

      if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setStatus("error");
        setError("Filen måste vara en PDF.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setStatus("error");
        setError("PDF:en är för stor (max 8 MB).");
        return;
      }

      try {
        setStatus("reading");
        void trackAiKartaClick("pdf_direct");
        const b64 = await fileToBase64(file);

        setStatus("uploading");
        const { data, error: invokeErr } = await supabase.functions.invoke("import-ai-map-pdf", {
          body: { pdf_base64: b64 },
        });

        if (invokeErr) {
          // FunctionsHttpError carries response.json() in context
          let serverMsg: string | null = null;
          let serverMissing: string[] | null = null;
          try {
            const ctx = (invokeErr as { context?: { response?: Response } }).context;
            const resp = ctx?.response;
            if (resp) {
              const json = await resp.clone().json().catch(() => null);
              serverMsg = json?.error ?? null;
              serverMissing = Array.isArray(json?.missing) ? json.missing : null;
            }
          } catch { /* ignore */ }
          throw Object.assign(new Error(serverMsg || invokeErr.message || "Kunde inte läsa PDF:en."), {
            missing: serverMissing,
          });
        }

        if (!data?.ok) {
          const msg = data?.error || "Kunde inte tolka PDF:en.";
          throw Object.assign(new Error(msg), { missing: data?.missing });
        }

        try {
          sessionStorage.setItem(RESULT_KEY, JSON.stringify(data));
        } catch { /* ignore */ }

        toast.success("Analysen är klar!");
        navigate("/ai-karta/resultat");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Något gick fel.";
        const missingList = (err as { missing?: string[] })?.missing ?? [];
        setStatus("error");
        setError(msg);
        if (Array.isArray(missingList)) setMissing(missingList);
        toast.error(msg);
      }
    },
    [navigate],
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
    e.target.value = "";
  };

  const busy = status === "reading" || status === "uploading";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">
          <FileUp className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Ladda upp ifylld PDF</h3>
          <p className="text-sm text-muted-foreground">
            Vi läser av era svar och räknar fram topp-3 direkt.
          </p>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver
            ? "border-primary bg-primary/10"
            : "border-white/15 bg-black/30 hover:border-primary/50 hover:bg-primary/5"
        } ${busy ? "pointer-events-none opacity-70" : ""}`}
        aria-busy={busy}
      >
        {busy ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              {status === "reading" ? "Läser PDF…" : "Analyserar era svar…"}
            </p>
            {fileName && (
              <p className="text-xs text-muted-foreground">{fileName}</p>
            )}
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-foreground">
              Dra och släpp er ifyllda <span className="font-semibold">aurora-ai-karta.pdf</span> här
            </p>
            <p className="text-xs text-muted-foreground">eller klicka för att välja fil (max 8 MB)</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={onPick}
        />
      </div>

      {status === "error" && error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold">{error}</p>
            {missing.length > 0 && (
              <>
                <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">Fält som saknas</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                  {missing.slice(0, 12).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Tips: Spara PDF:en med Adobe Acrobat eller Förhandsvisning så att fältvärdena följer med.
              Du kan också{" "}
              <button
                type="button"
                onClick={() => navigate("/ai-karta/start")}
                className="underline underline-offset-2 hover:text-foreground"
              >
                fylla i digitalt här istället
              </button>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiKartaPdfUpload;

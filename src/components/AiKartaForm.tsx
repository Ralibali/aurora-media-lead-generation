import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Download, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

const Schema = z.object({
  name: z.string().min(2, "Ange ditt namn").max(80),
  email: z.string().email("Ogiltig e-postadress").max(160),
  company: z.string().max(120).optional().or(z.literal("")),
  website: z.string().max(0).optional().or(z.literal("")),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Du måste godkänna behandlingen av dina uppgifter." }),
  }),
});

type Status = "idle" | "submitting" | "success" | "error";

const AiKartaForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const renderedAtRef = useRef<number>(0);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    renderedAtRef.current = Date.now();
    try {
      const raw = localStorage.getItem("aurora_lead");
      if (raw) {
        const saved = JSON.parse(raw) as { name?: string; email?: string; company?: string };
        if (saved.name) setName(saved.name);
        if (saved.email) setEmail(saved.email);
        if (saved.company) setCompany(saved.company);
        if (saved.name || saved.email) setPrefilled(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const parsed = Schema.safeParse({ name, email, company, website, consent });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fe[key]) fe[key] = issue.message;
      }
      setFieldErrors(fe);
      return;
    }

    if (parsed.data.website) {
      console.warn("[AiKartaForm] honeypot triggered");
      setStatus("success");
      return;
    }

    setStatus("submitting");

    try {
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean;
        downloadUrl?: string;
        leadId?: string;
        error?: string;
      }>("send-ai-karta", {
        body: {
          name: parsed.data.name,
          email: parsed.data.email,
          company: parsed.data.company,
          _renderedAt: renderedAtRef.current,
        },
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Något gick fel.");

      if (data.downloadUrl) setDownloadUrl(data.downloadUrl);
      try {
        localStorage.setItem(
          "aurora_lead",
          JSON.stringify({ name: parsed.data.name, email: parsed.data.email, company: parsed.data.company ?? "" })
        );
      } catch {
        /* ignore */
      }
      setStatus("success");
      toast.success("Tack! AI-kartan är på väg till din mejl.", { duration: 5000 });
    } catch (err) {
      console.error("[AiKartaForm] submit failed", err);
      setStatus("error");
      const msg =
        err instanceof Error
          ? err.message
          : "Något gick fel. Mejla info@auroramedia.se så skickar jag PDF:en manuellt.";
      setErrorMsg(msg);
      toast.error("Något gick fel. Försök igen om en stund.");
    }
  };

  if (status === "success") {
    const pdfUrl =
      downloadUrl ||
      "https://cyymcdqkpvcvwjoqxbco.supabase.co/storage/v1/object/public/lead-magnets/aurora-ai-karta.pdf";
    const firstName = name ? name.split(" ")[0] : "";
    return (
      <div className="rounded-[1.7rem] border border-primary/30 bg-gradient-to-br from-primary/[0.10] via-primary/[0.05] to-transparent p-6 shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.5)]">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/20 text-primary ring-4 ring-primary/10">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <p className="label-caps text-primary">Tack{firstName ? ` ${firstName}` : ""}!</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
              AI-kartan är på väg till {email || "din mejl"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Den dyker upp i inkorgen om någon minut (kolla skräpposten om den dröjer). Du kan också ladda ner PDF:en direkt här:
            </p>
          </div>
        </div>

        <a href={pdfUrl} download="aurora-ai-karta.pdf" target="_blank" rel="noopener noreferrer" className="mt-6 block">
          <Button size="lg" className="w-full rounded-full">
            Ladda ner PDF nu <Download className="ml-2 h-4 w-4" />
          </Button>
        </a>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Funkar inte länken? Kopiera:{" "}
          <a href={pdfUrl} className="underline underline-offset-2">aurora-ai-karta.pdf</a>
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-background/40 p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Nästa steg:</span> vill ni att vi går igenom era svar och visar exakt vad som bör byggas först?{" "}
            <a href="/kontakt" className="text-primary underline underline-offset-2">
              Boka en kostnadsfri AI-genomlysning
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-6">
      <p className="label-caps">Hämta mallen</p>
      <h3 className="mt-3 font-display text-3xl font-bold">Skicka AI-kartan till min mejl</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Vill ni ha hjälp att gå igenom svaren efteråt? Boka en AI-genomlysning så prioriterar vi era case efter effekt, komplexitet och affärsnytta.
      </p>

      {prefilled && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-xs text-foreground/80">
          <span>Välkommen tillbaka! Vi har fyllt i dina uppgifter från förra gången.</span>
          <button
            type="button"
            onClick={() => {
              setName("");
              setEmail("");
              setCompany("");
              setPrefilled(false);
              try { localStorage.removeItem("aurora_lead"); } catch { /* ignore */ }
            }}
            className="shrink-0 text-primary underline underline-offset-2"
          >
            Rensa
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="aikarta-name" className="text-xs uppercase tracking-wider text-muted-foreground">
            Namn
          </Label>
          <Input
            id="aikarta-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "submitting"}
            className="mt-1 rounded-full"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "aikarta-name-error" : undefined}
            required
          />
          {fieldErrors.name && (
            <p id="aikarta-name-error" className="mt-1 text-xs text-destructive">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="aikarta-email" className="text-xs uppercase tracking-wider text-muted-foreground">
            E-post
          </Label>
          <Input
            id="aikarta-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "submitting"}
            className="mt-1 rounded-full"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "aikarta-email-error" : undefined}
            required
          />
          {fieldErrors.email && (
            <p id="aikarta-email-error" className="mt-1 text-xs text-destructive">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="aikarta-company" className="text-xs uppercase tracking-wider text-muted-foreground">
            Företag (valfritt)
          </Label>
          <Input
            id="aikarta-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={status === "submitting"}
            className="mt-1 rounded-full"
          />
        </div>

        {/* Honeypot — dolt från riktiga användare */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <Label htmlFor="aikarta-website">Webbplats</Label>
          <Input
            id="aikarta-website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="aikarta-consent"
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              aria-invalid={!!fieldErrors.consent}
              aria-describedby={fieldErrors.consent ? "aikarta-consent-error" : "aikarta-consent-help"}
              className="mt-0.5"
            />
            <Label htmlFor="aikarta-consent" className="text-xs leading-relaxed text-foreground/80">
              Jag godkänner att Aurora Media AB lagrar mitt namn och min e-postadress för att skicka AI-kartan och eventuell uppföljning. Jag kan när som helst avregistrera mig genom att mejla{" "}
              <a href="mailto:info@auroramedia.se" className="text-primary underline underline-offset-2">
                info@auroramedia.se
              </a>
              .
            </Label>
          </div>
          {fieldErrors.consent && (
            <p id="aikarta-consent-error" className="mt-2 text-xs text-destructive">
              {fieldErrors.consent}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full rounded-full">
          {status === "submitting" ? (
            <>
              Skickar... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Hämta AI-kartan <MailCheck className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {status === "error" && errorMsg && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/[0.08] p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      <p id="aikarta-consent-help" className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Personuppgiftsansvarig är Aurora Media AB (org.nr 559272-0220). Vi delar aldrig dina uppgifter med tredje part. Läs mer i vår{" "}
        <a href="/integritetspolicy" className="underline underline-offset-2">
          integritetspolicy
        </a>
        .
      </p>
    </div>
  );
};

export default AiKartaForm;

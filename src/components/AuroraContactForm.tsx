import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Send, CheckCircle2, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSupabase } from "@/lib/getSupabase";
import { trackEvent } from "@/lib/analytics";

const NAME_REGEX = /^[\p{L}][\p{L}\s'-]{1,}$/u;

const schema = z.object({
  name: z.string().trim().min(2, "Skriv ditt namn").max(80).regex(NAME_REGEX, "Endast bokstäver, mellanslag och bindestreck"),
  email: z.string().trim().toLowerCase().email("Ogiltig e-postadress").max(160),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  paket: z.string().min(1, "Välj ett alternativ"),
  message: z.string().trim().min(20, "Beskriv ditt ärende med minst 20 tecken").max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "Du måste godkänna integritetspolicyn" }) }),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

const PAKET_OPTIONS = [
  "AI-kartan / AI-genomlysning",
  "Hemsida",
  "SaaS / MVP",
  "SEO",
  "Google Ads / Meta Ads",
  "Annat",
];

interface Props {
  defaultPaket?: string;
  heading?: string;
  intro?: string;
}

const AuroraContactForm = ({
  defaultPaket = "AI-kartan / AI-genomlysning",
  heading = "Hör av dig direkt",
  intro = "Mejla oss eller fyll i formuläret – vi svarar inom 24 timmar (vardagar).",
}: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paket, setPaket] = useState(defaultPaket);
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const form = e.currentTarget;
    const data = new FormData(form);
    const parsed = schema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company") ?? "",
      paket,
      message: data.get("message"),
      consent,
      website: data.get("website") ?? "",
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as string;
        if (!fieldErrors[k]) fieldErrors[k] = i.message;
      });
      setErrors(fieldErrors);
      toast.error("Kontrollera fälten i formuläret");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: { ...parsed.data, _renderedAt: Date.now() },
      });
      if (error) throw error;
      setDone(true);
      trackEvent("kontakt_submit", { source: "AuroraContactForm" });
      trackEvent("lead_conversion", { source: "AuroraContactForm", form: "kontakt" });
      toast.success("Tack! Vi hör av oss inom 24 timmar.");
      form.reset();
      setConsent(false);
    } catch (err: any) {
      console.error("[contact] submit failed", err);
      toast.error("Kunde inte skicka just nu. Försök igen eller mejla info@auroramedia.se");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-[1.5rem] border border-primary/30 bg-gradient-to-br from-primary/[0.10] via-primary/[0.04] to-transparent p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold">Tack – meddelandet är på väg!</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi har skickat ditt meddelande till info@auroramedia.se och återkommer inom 24 timmar (vardagar).
        </p>
        <Button variant="ghost" className="mt-6 rounded-full" onClick={() => setDone(false)}>
          Skicka ett till
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
      {/* Vänster: pitch + direktkontakt */}
      <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Personligt svar
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h3>
          <p className="mt-3 text-sm text-muted-foreground">{intro}</p>
        </div>

        <div className="mt-8 space-y-4 text-sm">
          <a
            href="mailto:info@auroramedia.se"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-primary/30 hover:bg-primary/[0.05]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12">
              <Mail className="h-4 w-4 text-primary" />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-wider text-muted-foreground">E-post</span>
              <span className="font-medium">info@auroramedia.se</span>
            </span>
          </a>

          <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-1">
            <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> Svar inom 24 timmar (vardagar)</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> GDPR-säkrad – inget vidare till tredje part</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Inget säljmöte krävs</span>
          </div>
        </div>
      </div>

      {/* Höger: formulär */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-8 backdrop-blur"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Namn *</Label>
            <Input id="contact-name" name="name" autoComplete="name" required className="mt-2" />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-post *</Label>
            <Input id="contact-email" name="email" type="email" autoComplete="email" required className="mt-2" />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="contact-company" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Företag</Label>
            <Input id="contact-company" name="company" autoComplete="organization" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="contact-paket" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vad gäller det? *</Label>
            <Select value={paket} onValueChange={setPaket}>
              <SelectTrigger id="contact-paket" className="mt-2">
                <SelectValue placeholder="Välj ett område" />
              </SelectTrigger>
              <SelectContent>
                {PAKET_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paket && <p className="mt-1 text-xs text-destructive">{errors.paket}</p>}
          </div>
        </div>

        <div className="mt-5">
          <Label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meddelande *</Label>
          <Textarea
            id="contact-message"
            name="message"
            rows={5}
            placeholder="Berätta kort om er verksamhet och vad ni vill ha hjälp med."
            required
            className="mt-2"
          />
          {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
        </div>

        {/* Honeypot — dolt för människor */}
        <div className="hidden" aria-hidden="true">
          <Label htmlFor="contact-website">Website</Label>
          <Input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="mt-5 flex items-start gap-3">
          <Checkbox
            id="contact-consent"
            checked={consent}
            onCheckedChange={(v) => setConsent(v === true)}
            className="mt-0.5"
          />
          <Label htmlFor="contact-consent" className="text-xs text-muted-foreground leading-relaxed">
            Jag godkänner att mina uppgifter behandlas enligt{" "}
            <a href="/integritetspolicy" className="underline text-foreground hover:text-primary">integritetspolicyn</a>.
          </Label>
        </div>
        {errors.consent && <p className="mt-1 text-xs text-destructive">{errors.consent}</p>}

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-6 w-full rounded-full shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.6)] sm:w-auto"
        >
          {submitting ? "Skickar..." : (<>Skicka meddelande <Send className="ml-2 h-4 w-4" /></>)}
        </Button>
      </form>
    </div>
  );
};

export default AuroraContactForm;

import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Mail, Clock, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

type OpenOptions = { paket?: string; internalNote?: string };
type ContactModalCtx = {
  open: (paketOrOptions?: string | OpenOptions, options?: OpenOptions) => void;
  isOpen: boolean;
};

const Ctx = createContext<ContactModalCtx | null>(null);

export const useContactModal = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useContactModal must be used inside ContactModalProvider");
  return c;
};

const MVP_OPTIONS = [
  { value: "AI Sprint", label: "AI Sprint – 49 000 kr · 3 veckor" },
  { value: "AI MVP", label: "AI MVP – 89 000 kr · 4 veckor" },
  { value: "AI Product+", label: "AI Product+ – 149 000 kr · 5 veckor" },
  { value: "Osäker", label: "Osäker – hjälp mig välja rätt upplägg" },
] as const;

const BUDGET_OPTIONS = [
  { value: "49k", label: "Minst 49 000 kr" },
  { value: "89k", label: "Runt 89 000 kr" },
  { value: "149k+", label: "149 000 kr eller mer" },
  { value: "not-ready", label: "Inte redo för 49 000 kr än" },
] as const;

const TIMELINE_OPTIONS = [
  { value: "now", label: "Vill starta inom 30 dagar" },
  { value: "quarter", label: "Vill starta detta kvartal" },
  { value: "later", label: "Planerar längre fram" },
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Skriv ditt namn").max(80),
  email: z.string().trim().toLowerCase().email("Ogiltig e-postadress").max(160),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  paket: z.string().min(1, "Välj upplägg"),
  budget: z.string().min(1, "Välj budgetnivå"),
  timeline: z.string().min(1, "Välj tidsplan"),
  audience: z.string().trim().min(8, "Beskriv målgruppen kort").max(500),
  problem: z.string().trim().min(12, "Beskriv problemet som AI-lösningen ska lösa").max(800),
  message: z.string().trim().min(30, "Beskriv idén med minst 30 tecken").max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "Du måste godkänna integritetspolicyn" }) }),
  website: z.string().max(0, "").optional().or(z.literal("")),
});

export const ContactModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultPaket, setDefaultPaket] = useState<string>("AI MVP");
  const [internalNote, setInternalNote] = useState<string>("");

  const open: ContactModalCtx["open"] = (paketOrOptions, options) => {
    let paket = "AI MVP";
    let note = "";
    if (typeof paketOrOptions === "string") {
      paket = paketOrOptions;
      note = options?.internalNote ?? "";
    } else if (paketOrOptions) {
      paket = paketOrOptions.paket ?? "AI MVP";
      note = paketOrOptions.internalNote ?? "";
    }
    setDefaultPaket(paket);
    setInternalNote(note);
    setIsOpen(true);
  };

  return (
    <Ctx.Provider value={{ open, isOpen }}>
      {children}
      <ContactDialog isOpen={isOpen} onOpenChange={setIsOpen} defaultPaket={defaultPaket} internalNote={internalNote} />
    </Ctx.Provider>
  );
};

const ContactDialog = ({
  isOpen,
  onOpenChange,
  defaultPaket,
  internalNote,
}: {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  defaultPaket: string;
  internalNote: string;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paketValue, setPaketValue] = useState("AI MVP");
  const [budgetValue, setBudgetValue] = useState("");
  const [timelineValue, setTimelineValue] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const known = MVP_OPTIONS.some((o) => o.value === defaultPaket);
    setPaketValue(known ? defaultPaket : "AI MVP");
    setBudgetValue("");
    setTimelineValue("");
    setConsentChecked(false);
    setFieldErrors({});
    setDone(false);
  }, [isOpen, defaultPaket]);

  const selectedPackage = MVP_OPTIONS.find((o) => o.value === paketValue);
  const selectedBudget = BUDGET_OPTIONS.find((o) => o.value === budgetValue);
  const selectedTimeline = TIMELINE_OPTIONS.find((o) => o.value === timelineValue);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const parsed = schema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company") ?? "",
      phone: data.get("phone") ?? "",
      paket: paketValue,
      budget: budgetValue,
      timeline: timelineValue,
      audience: data.get("audience"),
      problem: data.get("problem"),
      message: data.get("message"),
      consent: consentChecked,
      website: data.get("website") ?? "",
    });

    if (!parsed.success) {
      const newErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string" && !newErrors[path]) newErrors[path] = issue.message;
      });
      setFieldErrors(newErrors);
      toast.error(parsed.error.issues[0].message);
      return;
    }

    if (parsed.data.website) return;

    if (parsed.data.budget === "not-ready") {
      setFieldErrors({ budget: "AI-projekt startar från 49 000 kr. Återkom när budgeten finns, så sparar vi bådas tid." });
      toast.error("AI-projekt startar från 49 000 kr.");
      return;
    }

    setSubmitting(true);
    try {
      const leadLabel = `AI-byråförfrågan: ${selectedPackage?.label ?? paketValue} · Budget: ${selectedBudget?.label ?? budgetValue} · Tidsplan: ${selectedTimeline?.label ?? timelineValue}`;
      const message = [
        parsed.data.message,
        "",
        "--- Kvalificering ---",
        `Målgrupp: ${parsed.data.audience}`,
        `Problem: ${parsed.data.problem}`,
        `Budget: ${selectedBudget?.label ?? budgetValue}`,
        `Tidsplan: ${selectedTimeline?.label ?? timelineValue}`,
        "Verktygslåda vid behov: Cursor, Lovable, Codex, Claude, ChatGPT, Supabase, Stripe, API:er och egna integrationer.",
        internalNote ? `Intern notering: ${internalNote}` : "",
      ].filter(Boolean).join("\n");

      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: parsed.data.name,
          email: parsed.data.email,
          company: parsed.data.company,
          phone: parsed.data.phone,
          paket: parsed.data.paket,
          leadLabel,
          internalNote,
          message,
          consent: parsed.data.consent,
        },
      });
      if (error) throw error;
      setSubmittedEmail(parsed.data.email);
      setDone(true);
      form.reset();
      toast.success("Tack! Din AI-förfrågan är skickad. Jag svarar personligen inom 24 timmar.");
    } catch (err) {
      console.error("[MvpContactModal] submit error", err);
      toast.error("Något gick fel. Mejla istället info@auroramedia.se");
    } finally {
      setSubmitting(false);
    }
  };

  const ErrorText = ({ name }: { name: string }) => fieldErrors[name] ? <p className="text-xs text-destructive" role="alert">{fieldErrors[name]}</p> : null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(() => setDone(false), 300); }}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-normal">Boka AI-samtal</DialogTitle>
          <DialogDescription>För AI-lösningar, SaaS-MVP:er och digitala produkter från 49 000 kr. Vi använder rätt verktyg för uppdraget: Cursor, Lovable, Codex, Claude, Supabase, Stripe och annat som gör jobbet snabbare.</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-6 py-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/35">
              <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-serif text-3xl">Tack — AI-förfrågan är skickad.</p>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">Jag återkommer personligen till {submittedEmail || "din mejl"} med nästa steg, scope-frågor och rekommenderat upplägg.</p>
            </div>
            <div className="rounded-xl border border-border bg-card/60 px-5 py-4 text-left">
              <p className="label-caps">Vad händer nu?</p>
              <ul className="mt-3 space-y-3 text-sm">
                <li className="flex items-start gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Du får ett personligt svar inom 24 timmar.</li>
                <li className="flex items-start gap-3"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Vi bokar ett kort 20-minuters samtal om scope, risk och tekniskt upplägg.</li>
                <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Brådskande? Mejla info@auroramedia.se.</li>
              </ul>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full" size="lg">Stäng</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, overflow: "hidden" }}>
              <Label htmlFor="website">Webbplats</Label>
              <Input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="name">Namn *</Label><Input id="name" name="name" required placeholder="Förnamn Efternamn" /><ErrorText name="name" /></div>
              <div className="space-y-1.5"><Label htmlFor="email">E-post *</Label><Input id="email" name="email" type="email" required placeholder="namn@foretag.se" /><ErrorText name="email" /></div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="company">Företag</Label><Input id="company" name="company" placeholder="Valfritt" /></div>
              <div className="space-y-1.5"><Label htmlFor="phone">Telefon</Label><Input id="phone" name="phone" type="tel" placeholder="Valfritt" /></div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Upplägg *</Label>
                <Select value={paketValue} onValueChange={setPaketValue}><SelectTrigger><SelectValue placeholder="Välj upplägg" /></SelectTrigger><SelectContent>{MVP_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                <ErrorText name="paket" />
              </div>
              <div className="space-y-1.5">
                <Label>Budget *</Label>
                <Select value={budgetValue} onValueChange={setBudgetValue}><SelectTrigger><SelectValue placeholder="Välj budget" /></SelectTrigger><SelectContent>{BUDGET_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                <ErrorText name="budget" />
              </div>
              <div className="space-y-1.5">
                <Label>Tidsplan *</Label>
                <Select value={timelineValue} onValueChange={setTimelineValue}><SelectTrigger><SelectValue placeholder="Välj tidsplan" /></SelectTrigger><SelectContent>{TIMELINE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                <ErrorText name="timeline" />
              </div>
            </div>

            <div className="space-y-1.5"><Label htmlFor="audience">Vem är målgruppen? *</Label><Input id="audience" name="audience" placeholder="Ex: svenska åkerier med 5–30 fordon" /><ErrorText name="audience" /></div>
            <div className="space-y-1.5"><Label htmlFor="problem">Vilket problem ska AI-lösningen lösa? *</Label><Textarea id="problem" name="problem" rows={3} placeholder="Beskriv problemet, dagens manuella lösning och varför någon skulle betala." /><ErrorText name="problem" /></div>
            <div className="space-y-1.5"><Label htmlFor="message">Beskriv idén kort *</Label><Textarea id="message" name="message" rows={6} placeholder="Vad ska första versionen kunna göra? Handlar det om AI, automation, SaaS, app, intern portal eller något annat?" /><ErrorText name="message" /></div>

            {internalNote && <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm"><div className="flex items-start gap-2.5"><Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /><p className="text-foreground/85">{internalNote}</p></div></div>}

            <label className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
              <input type="checkbox" name="consent" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} className="mt-1" />
              <span>Jag godkänner att Aurora Media behandlar mina uppgifter för att svara på min AI-förfrågan.</span>
            </label>
            <ErrorText name="consent" />

            <Button type="submit" disabled={submitting} className="w-full" size="lg">{submitting ? "Skickar..." : "Skicka AI-förfrågan"}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

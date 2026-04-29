import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Tag, Mail, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

type OpenOptions = { paket?: string; internalNote?: string };
type ContactModalCtx = {
  open: (paketOrOptions?: string | OpenOptions, options?: OpenOptions) => void;
};
const Ctx = createContext<ContactModalCtx | null>(null);

export const useContactModal = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useContactModal must be used inside ContactModalProvider");
  return c;
};

const PLATFORM_OPTIONS = [
  { value: "iOS", label: "iOS" },
  { value: "Android", label: "Android" },
  { value: "Båda", label: "Båda (iOS + Android)" },
  { value: "Osäker", label: "Osäker / vill ha råd" },
] as const;

// Blockerade engångs-/skräpdomäner (vanliga "wegwerf"-tjänster)
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.info", "10minutemail.com",
  "tempmail.com", "temp-mail.org", "throwawaymail.com", "trashmail.com",
  "yopmail.com", "getnada.com", "fakeinbox.com", "sharklasers.com",
  "maildrop.cc", "dispostable.com", "mintemail.com", "spam4.me",
  "tempr.email", "mailnesia.com", "emailondeck.com", "moakt.com",
]);

// Tillåt bokstäver (inkl. åäö och internationella), mellanslag, bindestreck och apostrof
const NAME_REGEX = /^[\p{L}][\p{L}\s'-]{1,}$/u;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Skriv ditt fullständiga namn (minst 2 tecken)")
    .max(80, "Namnet är för långt")
    .regex(NAME_REGEX, "Namnet får bara innehålla bokstäver, mellanslag och bindestreck")
    .refine((v) => v.includes(" "), "Ange både för- och efternamn"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "Ogiltig e-post")
    .max(160, "E-posten är för lång")
    .email("Ogiltig e-postadress")
    .refine((v) => {
      const domain = v.split("@")[1];
      return domain && !DISPOSABLE_EMAIL_DOMAINS.has(domain);
    }, "Använd en riktig e-postadress, inte en engångsadress")
    .refine((v) => !/\+.*\+/.test(v), "Ogiltig e-postadress"),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  paket: z.string().min(1, "Välj vilket paket du är intresserad av"),
  platform: z.string().trim().max(40).optional().or(z.literal("")),
  leadLabel: z.string().trim().max(200).optional().or(z.literal("")),
  internalNote: z.string().trim().max(500).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Beskriv projektet med minst 20 tecken")
    .max(2000, "Meddelandet är för långt")
    .refine((v) => v.split(/\s+/).filter(Boolean).length >= 5, "Skriv minst några meningar om projektet")
    .refine((v) => /\s/.test(v), "Meddelandet ser inte ut som riktig text")
    .refine((v) => {
      // Räkna URL:er — fler än 2 = troligen spam
      const urls = v.match(/https?:\/\/|www\./gi) ?? [];
      return urls.length <= 2;
    }, "Meddelandet innehåller för många länkar")
    .refine((v) => {
      // Blockera meddelanden som mest består av samma tecken upprepat
      const longestRepeat = v.match(/(.)\1{9,}/);
      return !longestRepeat;
    }, "Meddelandet ser inte ut att vara riktigt skrivet"),
  consent: z.literal(true, { errorMap: () => ({ message: "Du måste godkänna integritetspolicyn" }) }),
  // Honeypot — ska alltid vara tomt; bots fyller i det
  website: z.string().max(0, "").optional().or(z.literal("")),
});

const PAKET_OPTIONS = [
  { value: "Prototyp", label: "Prototyp – 14 900 kr" },
  { value: "MVP", label: "MVP – 34 900 kr" },
  { value: "SaaS", label: "Skalbar SaaS – 69 000 kr" },
  { value: "Skraddarsytt", label: "Skräddarsytt – från 89 000 kr" },
  { value: "Hemsida", label: "Hemsida – från 4 900 kr" },
  { value: "E-handel", label: "E-handel – från 19 900 kr" },
  { value: "Mobilapp – PWA", label: "Mobilapp – PWA (6 900 kr)" },
  { value: "Mobilapp – Capacitor", label: "Mobilapp – Capacitor (24 900 kr)" },
  { value: "Mobilapp – Native", label: "Mobilapp – Native (från 89 000 kr)" },
  { value: "Mobilapp (iOS/Android)", label: "Mobilapp – inte säker än" },
  { value: "Kombination – SaaS + app", label: "Kombination – SaaS + app (från 59 800 kr)" },
  { value: "SEO – Audit", label: "SEO – Audit (2 490 kr)" },
  { value: "SEO – Audit + fix", label: "SEO – Audit + fix (6 900 kr)" },
  { value: "SEO – Lokal", label: "SEO – Lokal SEO (från 4 900 kr)" },
  { value: "SEO", label: "SEO – inte säker än" },
  { value: "Google Ads", label: "Google Ads – från 3 900 kr" },
  { value: "Meta Ads", label: "Meta Ads – från 3 900 kr" },
  { value: "Content", label: "Content – från 995 kr/artikel" },
  { value: "Grafisk profil", label: "Grafisk profil – från 5 900 kr" },
  { value: "Fotografering", label: "Fotografering – 4 900 kr/halvdag" },
  { value: "Annat", label: "Annat" },
  { value: "Vet inte", label: "Vet inte än" },
];

export const ContactModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultPaket, setDefaultPaket] = useState<string>("");
  const [internalNote, setInternalNote] = useState<string>("");

  const open: ContactModalCtx["open"] = (paketOrOptions, options) => {
    let paket = "";
    let note = "";
    if (typeof paketOrOptions === "string") {
      paket = paketOrOptions;
      note = options?.internalNote ?? "";
    } else if (paketOrOptions) {
      paket = paketOrOptions.paket ?? "";
      note = paketOrOptions.internalNote ?? "";
    }
    setDefaultPaket(paket);
    setInternalNote(note);
    setIsOpen(true);
  };

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <ContactDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        defaultPaket={defaultPaket}
        internalNote={internalNote}
      />
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
  const [paketValue, setPaketValue] = useState<string>(defaultPaket || "");
  const [messageValue, setMessageValue] = useState<string>("");
  const [messageTouched, setMessageTouched] = useState(false);
  const [submittedLabel, setSubmittedLabel] = useState<string>("");
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [platformValue, setPlatformValue] = useState<string>("");

  const setFieldError = (field: string, error: string | null) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const validateField = (field: "name" | "email" | "message", value: string) => {
    const fieldSchema = schema.shape[field];
    const result = fieldSchema.safeParse(value);
    setFieldError(field, result.success ? null : result.error.issues[0].message);
  };

  const isMobileApp = paketValue.startsWith("Mobilapp") || paketValue === "Kombination – SaaS + app";

  const buildPrefill = (paket: string): string => {
    const opt = PAKET_OPTIONS.find((o) => o.value === paket);
    if (!opt) return "";
    // SEO-paketen får en mer specifik förifyllning så leadet är tydligt
    if (paket.startsWith("SEO – ")) {
      const tier = paket.replace("SEO – ", "");
      return `Hej! Jag är intresserad av SEO-paketet "${tier}" (${opt.label}).\n\nKort om sajten:\n• URL: \n• Bransch / vad ni säljer: \n• Viktigaste sökord (om kända): \n\nMål med SEO-arbetet: `;
    }
    if (paket.startsWith("Mobilapp") || paket === "Kombination – SaaS + app") {
      return `Hej! Jag är intresserad av "${opt.label}".\n\nKort om projektet:\n• Befintlig webb-SaaS (URL eller beskrivning): \n• Tidsplan: `;
    }
    return `Hej! Jag är intresserad av "${opt.label}".\n\nKort om projektet:\n`;
  };

  useEffect(() => {
    if (isOpen) {
      const paket = defaultPaket || "";
      setPaketValue(paket);
      setMessageValue(buildPrefill(paket));
      setMessageTouched(false);
      setPlatformValue("");
      setFieldErrors({});
    }
  }, [isOpen, defaultPaket]);

  // Uppdatera meddelandet när paketet ändras – men bara om användaren inte börjat redigera
  useEffect(() => {
    if (!messageTouched) {
      setMessageValue(buildPrefill(paketValue));
    }
    // Nollställ plattform när paketet inte längre handlar om app
    if (!paketValue.startsWith("Mobilapp") && paketValue !== "Kombination – SaaS + app") {
      setPlatformValue("");
    }
  }, [paketValue, messageTouched]);

  const selectedOption = PAKET_OPTIONS.find((o) => o.value === paketValue);
  const platformOption = PLATFORM_OPTIONS.find((p) => p.value === platformValue);
  const leadLabel = selectedOption
    ? `Intresserad av: ${selectedOption.label}${platformOption ? ` · Plattform: ${platformOption.label}` : ""}`
    : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const parsed = schema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company") ?? "",
      paket: paketValue || (data.get("paket") as string) || defaultPaket,
      platform: platformValue,
      leadLabel,
      internalNote,
      message: data.get("message"),
      consent: data.get("consent") === "on" ? true : false,
      website: data.get("website") ?? "",
    });
    if (!parsed.success) {
      // Sätt alla fältfel + visa första som toast
      const newErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string" && !newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });
      setFieldErrors(newErrors);
      toast.error(parsed.error.issues[0].message);
      return;
    }
    // Honeypot — om dolt fält är ifyllt: tysta avvisning
    if (parsed.data.website) {
      console.warn("[ContactModal] honeypot triggered");
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: parsed.data,
      });
      if (error) throw error;
      setSubmittedLabel(leadLabel || (selectedOption ? selectedOption.label : paketValue));
      setSubmittedEmail(parsed.data.email);
      setDone(true);
      toast.success(
        `Tack! Din förfrågan om "${selectedOption?.label ?? paketValue}" är mottagen. Jag svarar inom 24 timmar.`,
        { duration: 6000 }
      );
      form.reset();
      setMessageValue("");
      setMessageTouched(false);
      setPlatformValue("");
    } catch (err) {
      console.error("[ContactModal] submit error", err);
      toast.error("Något gick fel. Mejla istället info@auroramedia.se");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setTimeout(() => setDone(false), 300);
      }}
    >
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-normal">Starta ett projekt</DialogTitle>
          <DialogDescription>Svarar inom 24 timmar vardagar.</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <p className="font-serif text-3xl">Tack!</p>
              <p className="text-muted-foreground">
                Din förfrågan är mottagen. Jag återkommer inom 24 timmar vardagar.
              </p>
            </div>

            {submittedLabel && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
                <p className="label-caps text-primary">Din förfrågan</p>
                <div className="mt-2 flex items-start gap-2.5">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="font-serif text-lg leading-snug">{submittedLabel}</p>
                </div>
                {submittedEmail && (
                  <div className="mt-3 flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>
                      Bekräftelse skickad till <span className="text-foreground">{submittedEmail}</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-border bg-card/60 px-5 py-4">
              <p className="label-caps">Vad händer nu?</p>
              <ul className="mt-3 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-foreground/85">
                    Inom <strong>24 timmar</strong> får du ett personligt svar från mig (Christoffer) på{" "}
                    <span className="text-foreground">{submittedEmail || "din mejl"}</span>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-foreground/85">
                    Vi bokar ett kort 20-min samtal för att stämma av scope och tidsplan.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-foreground/85">
                    Brådskande?{" "}
                    <a
                      href="mailto:info@auroramedia.se"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      info@auroramedia.se
                    </a>
                  </span>
                </li>
              </ul>
            </div>

            <Button onClick={() => onOpenChange(false)} className="w-full" size="lg">
              Stäng
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Honeypot — dolt fält. Riktiga användare ser inte detta. */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, overflow: "hidden" }}>
              <Label htmlFor="website">Webbplats (lämna tom)</Label>
              <Input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Namn *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Förnamn Efternamn"
                  aria-invalid={!!fieldErrors.name}
                  className={fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : undefined}
                  onBlur={(e) => validateField("name", e.target.value)}
                  onChange={() => fieldErrors.name && setFieldError("name", null)}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-destructive" role="alert">{fieldErrors.name}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-post *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={160}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="namn@foretag.se"
                  aria-invalid={!!fieldErrors.email}
                  className={fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : undefined}
                  onBlur={(e) => validateField("email", e.target.value)}
                  onChange={() => fieldErrors.email && setFieldError("email", null)}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive" role="alert">{fieldErrors.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Företag</Label>
              <Input id="company" name="company" maxLength={120} autoComplete="organization" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paket">Vilket paket är du intresserad av? *</Label>
              <Select value={paketValue} onValueChange={setPaketValue} name="paket">
                <SelectTrigger id="paket">
                  <SelectValue placeholder="Välj paket" />
                </SelectTrigger>
                <SelectContent>
                  {PAKET_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {leadLabel && (
                <div
                  className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                  aria-live="polite"
                >
                  <Tag className="h-3.5 w-3.5" />
                  <span>{leadLabel}</span>
                </div>
              )}
            </div>
            {isMobileApp && (
              <div className="space-y-1.5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <Label htmlFor="platform">Vilken plattform? *</Label>
                <p className="text-xs text-muted-foreground">
                  Hjälper mig att skissa rätt teknikval och tidsplan direkt.
                </p>
                <Select value={platformValue} onValueChange={setPlatformValue} name="platform">
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Välj plattform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {internalNote && (
              <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="label-caps text-muted-foreground">Skickas med din förfrågan</p>
                    <p className="text-foreground/85">{internalNote}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="message">Beskriv projektet kort *</Label>
              <Textarea
                id="message"
                name="message"
                required
                minLength={20}
                maxLength={2000}
                rows={7}
                value={messageValue}
                onChange={(e) => {
                  setMessageValue(e.target.value);
                  setMessageTouched(true);
                }}
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="consent" name="consent" required className="mt-1" />
              <Label htmlFor="consent" className="text-sm text-muted-foreground font-normal leading-snug">
                Jag godkänner att Aurora Media AB hanterar mina uppgifter enligt integritetspolicyn.
              </Label>
            </div>
            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              {submitting ? "Skickar…" : "Skicka"}
            </Button>
            <p className="text-center text-sm text-muted-foreground pt-2">
              Hellre mejla direkt?{" "}
              <a href="mailto:info@auroramedia.se" className="underline hover:text-foreground">
                info@auroramedia.se
              </a>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

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

type ContactModalCtx = { open: (paket?: string) => void };
const Ctx = createContext<ContactModalCtx | null>(null);

export const useContactModal = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useContactModal must be used inside ContactModalProvider");
  return c;
};

const schema = z.object({
  name: z.string().trim().min(2, "Skriv ditt namn").max(80),
  email: z.string().trim().email("Ogiltig e-post").max(160),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  paket: z.string().min(1, "Välj ett alternativ"),
  leadLabel: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(20, "Minst 20 tecken").max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "Du måste godkänna integritetspolicyn" }) }),
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

  const open = (paket?: string) => {
    setDefaultPaket(paket ?? "");
    setIsOpen(true);
  };

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <ContactDialog isOpen={isOpen} onOpenChange={setIsOpen} defaultPaket={defaultPaket} />
    </Ctx.Provider>
  );
};

const ContactDialog = ({
  isOpen,
  onOpenChange,
  defaultPaket,
}: {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  defaultPaket: string;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [paketValue, setPaketValue] = useState<string>(defaultPaket || "");
  const [messageValue, setMessageValue] = useState<string>("");
  const [messageTouched, setMessageTouched] = useState(false);

  const buildPrefill = (paket: string): string => {
    const opt = PAKET_OPTIONS.find((o) => o.value === paket);
    if (!opt) return "";
    // SEO-paketen får en mer specifik förifyllning så leadet är tydligt
    if (paket.startsWith("SEO – ")) {
      const tier = paket.replace("SEO – ", "");
      return `Hej! Jag är intresserad av SEO-paketet "${tier}" (${opt.label}).\n\nKort om sajten:\n• URL: \n• Bransch / vad ni säljer: \n• Viktigaste sökord (om kända): \n\nMål med SEO-arbetet: `;
    }
    if (paket.startsWith("Mobilapp")) {
      return `Hej! Jag är intresserad av "${opt.label}".\n\nKort om projektet:\n• Befintlig webb-SaaS (URL eller beskrivning): \n• Plattformar (iOS / Android / båda): \n• Tidsplan: `;
    }
    return `Hej! Jag är intresserad av "${opt.label}".\n\nKort om projektet:\n`;
  };

  useEffect(() => {
    if (isOpen) {
      const paket = defaultPaket || "";
      setPaketValue(paket);
      setMessageValue(buildPrefill(paket));
      setMessageTouched(false);
    }
  }, [isOpen, defaultPaket]);

  // Uppdatera meddelandet när paketet ändras – men bara om användaren inte börjat redigera
  useEffect(() => {
    if (!messageTouched) {
      setMessageValue(buildPrefill(paketValue));
    }
  }, [paketValue, messageTouched]);

  const selectedOption = PAKET_OPTIONS.find((o) => o.value === paketValue);
  const leadLabel = selectedOption ? `Intresserad av: ${selectedOption.label}` : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const parsed = schema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company") ?? "",
      paket: paketValue || (data.get("paket") as string) || defaultPaket,
      leadLabel,
      message: data.get("message"),
      consent: data.get("consent") === "on" ? true : false,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: parsed.data,
      });
      if (error) throw error;
      setDone(true);
      toast.success("Tack! Jag hör av mig inom 24 timmar.");
      form.reset();
      setMessageValue("");
      setMessageTouched(false);
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
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            <p className="font-serif text-2xl">Tack!</p>
            <p className="text-muted-foreground">Jag hör av mig inom 24 timmar.</p>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
              Stäng
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Namn *</Label>
                <Input id="name" name="name" required maxLength={80} autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-post *</Label>
                <Input id="email" name="email" type="email" required maxLength={160} autoComplete="email" />
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

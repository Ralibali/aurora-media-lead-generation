import { useState, createContext, useContext, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

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
  message: z.string().trim().min(20, "Minst 20 tecken").max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "Du måste godkänna" }) }),
});

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const parsed = schema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company") ?? "",
      paket: data.get("paket") ?? defaultPaket,
      message: data.get("message"),
      consent: data.get("consent") === "on" ? true : false,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      // Future: call edge function send-contact-email
      // await supabase.functions.invoke('send-contact-email', { body: parsed.data });
      await new Promise((r) => setTimeout(r, 600));
      setDone(true);
      toast.success("Tack! Jag hör av mig inom 24 timmar.");
      form.reset();
    } catch (err) {
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-normal">Starta ett projekt</DialogTitle>
          <DialogDescription>Svarar inom 24 timmar vardagar.</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-8 text-center space-y-3">
            <p className="font-serif text-2xl">Tack!</p>
            <p className="text-muted-foreground">Jag hör av mig inom 24 timmar.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Namn *</Label>
                <Input id="name" name="name" required maxLength={80} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-post *</Label>
                <Input id="email" name="email" type="email" required maxLength={160} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Företag</Label>
              <Input id="company" name="company" maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paket">Vilket paket är du intresserad av? *</Label>
              <Select name="paket" defaultValue={defaultPaket || undefined}>
                <SelectTrigger id="paket">
                  <SelectValue placeholder="Välj paket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prototyp">Prototyp – 14 900 kr</SelectItem>
                  <SelectItem value="MVP">MVP – 34 900 kr</SelectItem>
                  <SelectItem value="SaaS">Skalbar SaaS – 69 000 kr</SelectItem>
                  <SelectItem value="Skraddarsytt">Skräddarsytt – från 89 000 kr</SelectItem>
                  <SelectItem value="Vet inte">Vet inte än</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Beskriv projektet kort *</Label>
              <Textarea id="message" name="message" required minLength={20} maxLength={2000} rows={5} />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="consent" name="consent" required className="mt-1" />
              <Label htmlFor="consent" className="text-sm text-muted-foreground font-normal leading-snug">
                Jag godkänner att ni hanterar mina uppgifter enligt integritetspolicyn.
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

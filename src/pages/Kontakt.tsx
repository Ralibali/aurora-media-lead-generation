import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, MapPin, Clock, Sparkles } from "lucide-react";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const schema = z.object({
  name: z.string().trim().min(2, "Skriv ditt namn").max(80),
  email: z.string().trim().email("Ogiltig e-post").max(160),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  paket: z.string().min(1, "Välj ett alternativ"),
  message: z.string().trim().min(20, "Minst 20 tecken").max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: "Du måste godkänna" }) }),
});

const Kontakt = () => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setSEOMeta({
      title: "Kontakt – boka AI-genomgång | Aurora Media",
      description:
        "Boka 30 minuter med Aurora Media för SaaS, MVP, AI-automation, intern app eller webbprojekt. Fast pris från 14 900 kr och svar inom 24 timmar.",
      canonical: "/kontakt",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Kontakt", url: "/kontakt" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const parsed = schema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company") ?? "",
      paket: data.get("paket") ?? "",
      message: data.get("message"),
      consent: data.get("consent") === "on" ? true : false,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setDone(true);
      toast.success("Tack! Jag hör av mig inom 24 timmar.");
      form.reset();
    } catch {
      toast.error("Något gick fel. Mejla istället info@auroramedia.se");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <p className="label-caps">Kontakt · AI-genomgång</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl leading-[1.02] tracking-tight">
              Berätta vad du vill bygga.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              SaaS, MVP, intern app, AI-automation eller webb. Du får ett ärligt svar: bygga, skrota eller tänka om — och ett tydligt nästa steg.
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container mx-auto px-6 max-w-5xl grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl">Starta ett projekt</h2>
              <p className="mt-3 text-muted-foreground">Svar inom 24 timmar vardagar. Ingen säljpitch.</p>

              {done ? (
                <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
                  <p className="font-display text-2xl">Tack!</p>
                  <p className="mt-2 text-muted-foreground">Jag hör av mig inom 24 timmar.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
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
                    <Label htmlFor="paket">Vad vill du bygga? *</Label>
                    <Select name="paket">
                      <SelectTrigger id="paket"><SelectValue placeholder="Välj spår" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AI-genomgang">AI-genomgång / osäker än</SelectItem>
                        <SelectItem value="Prototyp">Prototyp – från 14 900 kr</SelectItem>
                        <SelectItem value="MVP">MVP – från 34 900 kr</SelectItem>
                        <SelectItem value="Skalbar SaaS">Skalbar SaaS – från 89 000 kr</SelectItem>
                        <SelectItem value="AI Ops">AI-automation / AI Ops</SelectItem>
                        <SelectItem value="Webb">Hemsida, SEO eller webbplattform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Beskriv projektet kort *</Label>
                    <Textarea id="message" name="message" required minLength={20} maxLength={2000} rows={6} placeholder="Vad ska systemet göra, vem ska använda det och vad vill du uppnå?" />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="consent" name="consent" required className="mt-1" />
                    <Label htmlFor="consent" className="text-sm text-muted-foreground font-normal leading-snug">
                      Jag godkänner att Aurora Media hanterar mina uppgifter enligt integritetspolicyn.
                    </Label>
                  </div>
                  <Button type="submit" disabled={submitting} size="lg" className="w-full rounded-full">
                    {submitting ? "Skickar…" : "Skicka projektidé"}
                  </Button>
                </form>
              )}
            </div>

            <div>
              <h2 className="font-display text-3xl">Direktkontakt</h2>
              <p className="mt-3 text-muted-foreground">
                Vill du hellre mejla direkt? Gör det. Skriv kort vad du vill bygga så tar vi det därifrån.
              </p>

              <div className="mt-8 space-y-5 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="label-caps">E-post</p>
                    <a href="mailto:info@auroramedia.se" className="text-foreground hover:text-primary">
                      info@auroramedia.se
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="label-caps">Plats</p>
                    <p className="text-foreground">Linköping, Sverige · kunder i hela landet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="label-caps">Svarstid</p>
                    <p className="text-foreground">Vanligtvis inom 24 timmar vardagar</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-6 text-sm text-muted-foreground space-y-1.5">
                <p className="font-display text-xl text-foreground">Aurora Media AB</p>
                <p>AI-builder för SaaS, MVP och automationer</p>
                <p>Org.nr 559272-0220</p>
                <p>VAT: SE559272022001</p>
                <p className="flex items-center gap-2 pt-2"><Sparkles size={15} /> Fast pris. Kod du äger. Snabb leverans.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Kontakt;

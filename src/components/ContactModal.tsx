import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabase } from "@/lib/getSupabase";

type OpenOptions = { paket?: string; internalNote?: string };
type ContextType = { open: (value?: string | OpenOptions, options?: OpenOptions) => void };
const Context = createContext<ContextType | null>(null);
const options = ["Behöver rådgivning", "Prototyp – från 14 900 kr", "MVP – från 34 900 kr", "Skalbar lösning – från 89 000 kr", "Internt verksamhetssystem", "AI och automation", "App eller SaaS", "Integrationer", "Hemsida eller e-handel", "SEO och synlighet", "Annat"];
const aliases: Record<string, string> = { Prototyp: options[1], "Aurora Sprint": options[1], MVP: options[2], "Aurora MVP": options[2], SaaS: options[3], "Aurora Scale": options[3], Skraddarsytt: options[4], "Internt system": options[4], "Aurora AI Ops": options[5] };

export const useContactModal = () => {
  const value = useContext(Context);
  if (!value) throw new Error("useContactModal must be used inside ContactModalProvider");
  return value;
};

export const ContactModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initial, setInitial] = useState("");
  const [note, setNote] = useState("");
  const open: ContextType["open"] = (value, extra) => {
    const raw = typeof value === "string" ? value : value?.paket ?? "";
    setInitial(aliases[raw] ?? raw);
    setNote(typeof value === "string" ? extra?.internalNote ?? "" : value?.internalNote ?? "");
    setIsOpen(true);
  };
  return <Context.Provider value={{ open }}>{children}<ContactDialog isOpen={isOpen} setIsOpen={setIsOpen} initial={initial} note={note} /></Context.Provider>;
};

function ContactDialog({ isOpen, setIsOpen, initial, note }: { isOpen: boolean; setIsOpen: (value: boolean) => void; initial: string; note: string }) {
  const [selected, setSelected] = useState(options[0]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [renderedAt, setRenderedAt] = useState(Date.now());

  useEffect(() => {
    if (isOpen) { setSelected(initial || options[0]); setDone(false); setRenderedAt(Date.now()); }
  }, [initial, isOpen]);

  const available = initial && !options.includes(initial) ? [initial, ...options] : options;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const website = String(data.get("website") ?? "");
    if (name.length < 2) return toast.error("Ange ditt namn.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Ange en giltig e-postadress.");
    if (message.length < 20) return toast.error("Beskriv behovet med minst 20 tecken.");
    if (data.get("consent") !== "on") return toast.error("Godkänn integritetspolicyn.");
    setSending(true);
    try {
      const supabase = await getSupabase();
      const { data: response, error } = await supabase.functions.invoke("send-contact-email", { body: { name, email, company, paket: selected, message, website, platform: "", leadLabel: `Intresserad av: ${selected}`, internalNote: note, _renderedAt: renderedAt } });
      if (error) throw error;
      if (response?.error) throw new Error(response.error);
      form.reset(); setDone(true); toast.success("Tack! Förfrågan är mottagen.");
    } catch (error) {
      console.error(error); toast.error("Något gick fel. Mejla info@auroramedia.se.");
    } finally { setSending(false); }
  };

  return <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto border-white/10 bg-[#100f0d] text-[#ede9dc]">
    <DialogHeader><DialogTitle className="font-serif text-3xl font-normal">Berätta om behovet</DialogTitle><DialogDescription className="text-white/55">Första bedömningen är kostnadsfri. Svar normalt inom 24 timmar vardagar.</DialogDescription></DialogHeader>
    {done ? <div className="space-y-5 py-6 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-primary" /><p className="font-serif text-3xl">Tack!</p><p className="text-sm text-white/65">Förfrågan är mottagen. Ni får ett personligt svar.</p><Button onClick={() => setIsOpen(false)} className="w-full">Stäng</Button></div> : <form onSubmit={submit} className="space-y-4" noValidate>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden"><Input name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Namn"><Input name="name" autoComplete="name" /></Field><Field label="E-post"><Input name="email" type="email" autoComplete="email" placeholder="namn@foretag.se" /></Field></div>
      <Field label="Företag" optional><Input name="company" autoComplete="organization" /></Field>
      <Field label="Vad gäller förfrågan?"><select value={selected} onChange={(event) => setSelected(event.target.value)} className="h-11 w-full rounded-md border border-white/15 bg-transparent px-3 text-sm text-[#ede9dc]">{available.map((option) => <option key={option} value={option} className="bg-[#100f0d]">{option}</option>)}</select></Field>
      <Field label="Beskriv problemet eller idén"><Textarea name="message" rows={5} maxLength={2000} placeholder="Vad gör ni manuellt i dag och vad vill ni förbättra?" /></Field>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-sm text-white/70"><Checkbox name="consent" className="mt-0.5" /><span>Jag godkänner behandling av uppgifterna för att besvara förfrågan. Läs <a href="/integritetspolicy" className="text-primary underline">integritetspolicyn</a>.</span></label>
      <Button type="submit" disabled={sending} className="w-full" size="lg">{sending ? "Skickar…" : "Skicka förfrågan"}</Button>
    </form>}
  </DialogContent></Dialog>;
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}{optional ? " (frivilligt)" : " *"}</Label>{children}</div>;
}

import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import NordicLayout from "@/components/nordic/NordicLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackAiKartaClick } from "@/lib/aiKartaTracking";
import {
  AiMapFormState, EMPLOYEE_OPTIONS, FREQ_LABELS, PAIN_AREAS, ProcessInput,
  TIME_LABELS, VALUE_LABELS, YPN_LABELS, emptyForm, emptyProcess,
} from "@/lib/aiMap";
import { getSupabase } from "@/lib/getSupabase";
import { setSEOMeta } from "@/lib/seoHelpers";

const STORAGE_KEY = "ai_map_draft";
const RESULT_KEY = "ai_map_result";
const STEP_LABELS = ["Fokus", "Process", "Leverans"];

const AiKartaStart = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AiMapFormState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? { ...emptyForm(), ...(JSON.parse(saved) as AiMapFormState) } : emptyForm();
    } catch { return emptyForm(); }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    setSEOMeta({
      title: "Starta AI-kartan – kostnadsfri analys på 3–5 minuter | Aurora Media",
      description: "Beskriv era största tidstjuvar och få en första bedömning av vilka processer som passar för AI, automation eller ett internt system.",
      canonical: "/ai-karta/start", noindex: true,
    });
    void trackAiKartaClick("funnel_view");
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  const update = <K extends keyof AiMapFormState>(key: K, value: AiMapFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateProcess = (index: number, patch: Partial<ProcessInput>) =>
    setForm((current) => ({ ...current, processes: current.processes.map((p, i) => i === index ? { ...p, ...patch } : p) }));
  const togglePain = (label: string) => update("pain_areas", form.pain_areas.includes(label) ? form.pain_areas.filter((x) => x !== label) : [...form.pain_areas, label]);

  const validate = (target: number) => {
    const next: Record<string, string> = {};
    if (target === 1 && !form.pain_areas.length) next.pain = "Välj minst ett område.";
    if (target === 2) form.processes.forEach((p, i) => {
      if (!p.process_name.trim()) next[`name${i}`] = "Beskriv arbetsuppgiften.";
      if (!p.frequency) next[`freq${i}`] = "Välj frekvens.";
      if (!p.weekly_time) next[`time${i}`] = "Välj tidsåtgång.";
    });
    if (target === 3) {
      if (!form.company_name.trim()) next.company = "Ange företagsnamn.";
      if (!form.industry.trim()) next.industry = "Ange bransch.";
      if (!form.employee_count) next.employees = "Välj antal anställda.";
      if (form.contact_name.trim().length < 2) next.name = "Ange ditt namn.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Ange en giltig e-postadress.";
      if (!form.consent) next.consent = "Godkänn behandlingen för att skapa AI-kartan.";
    }
    setErrors(next);
    if (Object.keys(next).length) { toast.error("Kontrollera de markerade fälten."); return false; }
    return true;
  };

  const goNext = () => {
    if (!validate(step)) return;
    void trackAiKartaClick(step === 1 ? "funnel_step_1_complete" : "funnel_step_2_complete");
    setStep((x) => Math.min(3, x + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!validate(3) || submitting) return;
    setSubmitting(true);
    void trackAiKartaClick("funnel_submit");
    try {
      const processes = form.processes.map((p) => ({
        ...p,
        rule_based: p.rule_based || "unknown",
        data_available: p.data_available || "unknown",
        business_value: p.business_value || "unknown",
      }));
      const supabase = await getSupabase();
      const { data, error } = await supabase.functions.invoke("submit-ai-map", { body: { ...form, processes, website } });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Analysen kunde inte skapas just nu.");
      sessionStorage.setItem(RESULT_KEY, JSON.stringify({
        ...data,
        meta: { company_name: form.company_name, contact_name: form.contact_name, email: form.email },
      }));
      sessionStorage.removeItem(STORAGE_KEY);
      void trackAiKartaClick("funnel_success");
      navigate("/ai-karta/resultat");
    } catch (error) {
      console.error(error);
      void trackAiKartaClick("funnel_error");
      toast.error(error instanceof Error ? error.message : "Något gick fel. Försök igen.");
    } finally { setSubmitting(false); }
  };

  return (
    <NordicLayout>
      <div id="main" className="funnel-page">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <p className="mono">ai-kartan · steg {step} av 3 · cirka 3–5 minuter</p>
          <h1 className="hero-line" style={{ marginTop: 18, fontSize: "clamp(2rem,5vw,3.9rem)", maxWidth: "18ch" }}>
            {step === 1 && <>Var försvinner <span className="it">mest tid?</span></>}
            {step === 2 && <>Vilken process vill ni <span className="it">börja med?</span></>}
            {step === 3 && <>Vart ska vi leverera <span className="it">analysen?</span></>}
          </h1>
          <p className="lead" style={{ marginTop: 20 }}>
            {step === 1 && "Markera områden med manuellt arbete, dubbelregistrering eller onödigt letande."}
            {step === 2 && "Beskriv minst en återkommande arbetsuppgift. En tydlig process ger bäst analys."}
            {step === 3 && "Kontaktuppgifterna används för att skapa resultatet och skicka en kopia via e-post."}
          </p>

          <div style={{ marginTop: 30, marginBottom: 22 }}>
            <div className="flex justify-between gap-2 mb-2">
              {STEP_LABELS.map((label, i) => <span key={label} className="mono" style={{ color: i + 1 <= step ? "var(--moss)" : "var(--bone-mute)" }}>{i + 1}. {label}</span>)}
            </div>
            <div className="funnel-progress"><span style={{ width: `${Math.round(step / 3 * 100)}%` }} /></div>
          </div>

          <section className="funnel-card">
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
              <Input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            {step === 1 && <div>
              <p className="meta-label mb-4">Välj alla som passar</p>
              <div className="flex flex-wrap gap-2.5">
                {PAIN_AREAS.map((label) => <Pill key={label} active={form.pain_areas.includes(label)} onClick={() => togglePain(label)}>{label}</Pill>)}
              </div>
              {errors.pain && <ErrorText text={errors.pain} />}
              <p className="body mt-5 text-xs">Beskriv processen övergripande och lämna inte känsliga uppgifter.</p>
            </div>}

            {step === 2 && <div className="space-y-5">
              {form.processes.map((p, i) => <article key={i} className="rounded-2xl border border-white/10 p-4 sm:p-5">
                <div className="flex justify-between gap-3"><p className="eyebrow">Process {i + 1}</p>{form.processes.length > 1 && <button type="button" onClick={() => update("processes", form.processes.filter((_, x) => x !== i))} className="flex items-center gap-1 text-xs text-muted-foreground"><Trash2 className="h-4 w-4" /> Ta bort</button>}</div>
                <div className="mt-5 grid gap-5">
                  <FormField label="Arbetsuppgift" error={errors[`name${i}`]}><Input value={p.process_name} onChange={(e) => updateProcess(i, { process_name: e.target.value })} className="h-12 rounded-full text-base" placeholder="Exempel: skapa offerter från kundmejl" /></FormField>
                  <PillRow label="Hur ofta görs den?" error={errors[`freq${i}`]} options={FREQ_LABELS} value={p.frequency} onChange={(v) => updateProcess(i, { frequency: v as ProcessInput["frequency"] })} />
                  <PillRow label="Ungefärlig tid per vecka" error={errors[`time${i}`]} options={TIME_LABELS} value={p.weekly_time} onChange={(v) => updateProcess(i, { weekly_time: v as ProcessInput["weekly_time"] })} />
                  <details className="advanced-fields"><summary>Förfina analysen med frivilliga frågor</summary><div className="grid gap-5">
                    <FormField label="System som används" optional><Input value={p.systems} onChange={(e) => updateProcess(i, { systems: e.target.value })} className="h-12 rounded-full text-base" placeholder="Fortnox, Excel, HubSpot…" /></FormField>
                    <PillRow label="Regel- eller mallstyrt?" options={YPN_LABELS} value={p.rule_based} onChange={(v) => updateProcess(i, { rule_based: v as ProcessInput["rule_based"] })} />
                    <PillRow label="Finns underlaget digitalt?" options={YPN_LABELS} value={p.data_available} onChange={(v) => updateProcess(i, { data_available: v as ProcessInput["data_available"] })} />
                    <PillRow label="Affärsnytta" options={VALUE_LABELS} value={p.business_value} onChange={(v) => updateProcess(i, { business_value: v as ProcessInput["business_value"] })} />
                  </div></details>
                </div>
              </article>)}
              {form.processes.length < 3 && <button type="button" onClick={() => update("processes", [...form.processes, emptyProcess()])} className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-sm text-muted-foreground"><Plus className="h-4 w-4" /> Lägg till process</button>}
            </div>}

            {step === 3 && <div>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Företagsnamn" error={errors.company}><Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} className="h-12 rounded-full text-base" autoComplete="organization" /></FormField>
                <FormField label="Bransch" error={errors.industry}><Input value={form.industry} onChange={(e) => update("industry", e.target.value)} className="h-12 rounded-full text-base" /></FormField>
                <div className="sm:col-span-2"><FormField label="Antal anställda" error={errors.employees}><div className="flex flex-wrap gap-2.5">{EMPLOYEE_OPTIONS.map((x) => <Pill key={x} active={form.employee_count === x} onClick={() => update("employee_count", x)}>{x}</Pill>)}</div></FormField></div>
                <FormField label="Ditt namn" error={errors.name}><Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} className="h-12 rounded-full text-base" autoComplete="name" /></FormField>
                <FormField label="E-post" error={errors.email}><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12 rounded-full text-base" autoComplete="email" placeholder="namn@foretag.se" /></FormField>
              </div>
              <div className={`mt-6 rounded-2xl border p-4 ${errors.consent ? "border-destructive/60" : "border-white/10"}`}>
                <label className="flex cursor-pointer items-start gap-3"><Checkbox checked={form.consent} onCheckedChange={(v) => update("consent", v === true)} className="mt-0.5" /><span className="text-sm leading-relaxed text-foreground/80">Jag godkänner att Aurora Media AB behandlar mina svar för att skapa och leverera AI-kartan och skickar uppföljande råd via e-post. Jag kan avregistrera mig när som helst. Läs vår <Link to="/integritetspolicy" className="text-primary underline">integritetspolicy</Link>.</span></label>
                {errors.consent && <ErrorText text={errors.consent} />}
              </div>
              <p className="body mt-5 text-sm">Resultatet visas direkt. PDF finns på resultatsidan och bokning är frivillig.</p>
            </div>}
          </section>

          <div className="mt-6 flex justify-between gap-3">
            {step > 1 ? <button type="button" onClick={() => { setErrors({}); setStep(step - 1); }} className="btn btn-ghost">← Tillbaka</button> : <Link to="/ai-karta" className="btn btn-ghost">← Om AI-kartan</Link>}
            {step < 3 ? <button type="button" onClick={goNext} className="btn btn-moss">Fortsätt <ArrowRight size={14} /></button> : <button type="button" onClick={submit} disabled={submitting} className="btn btn-moss">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Skapar…</> : <>Visa min AI-karta <ArrowRight size={14} /></>}</button>}
          </div>
          <p className="body mt-7 text-center text-xs">Analysen är en första indikation. Exakt scope, säkerhet och kostnad behöver bedömas mot era verkliga system.</p>
        </div>
      </div>
    </NordicLayout>
  );
};

const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => <button type="button" onClick={onClick} aria-pressed={active} className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2.5 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "border-white/15 text-foreground/80"}`}>{active && <Check className="mr-1 h-3.5 w-3.5" />}{children}</button>;
const ErrorText = ({ text }: { text: string }) => <p className="mt-2 text-sm text-destructive" role="alert">{text}</p>;
const FormField = ({ label, error, optional, children }: { label: string; error?: string; optional?: boolean; children: React.ReactNode }) => <div><Label className={error ? "text-destructive" : "text-muted-foreground"}>{label}{!optional && " *"}</Label><div className="mt-1.5">{children}</div>{error && <ErrorText text={error} />}</div>;
const PillRow = ({ label, error, options, value, onChange }: { label: string; error?: string; options: Record<string, string>; value: string; onChange: (value: string) => void }) => <div><Label className={error ? "text-destructive" : "text-muted-foreground"}>{label}</Label><div className="mt-2 flex flex-wrap gap-2">{Object.entries(options).map(([key, text]) => <Pill key={key} active={value === key} onClick={() => onChange(key)}>{text}</Pill>)}</div>{error && <ErrorText text={error} />}</div>;

export default AiKartaStart;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { setSEOMeta } from "@/lib/seoHelpers";
import {
  AiMapFormState,
  EMPLOYEE_OPTIONS,
  FREQ_LABELS,
  PAIN_AREAS,
  ProcessInput,
  TIME_LABELS,
  VALUE_LABELS,
  YPN_LABELS,
  emptyForm,
  emptyProcess,
} from "@/lib/aiMap";

const STORAGE_KEY = "ai_map_draft";
const RESULT_KEY = "ai_map_result";

const Step1Schema = z.object({
  company_name: z.string().trim().min(1, "Ange företagsnamn").max(120),
  industry: z.string().trim().min(1, "Ange bransch").max(80),
  employee_count: z.string().min(1, "Välj antal anställda"),
  contact_name: z.string().trim().min(1, "Ange ditt namn").max(80),
  email: z.string().trim().email("Ogiltig e-postadress").max(160),
});

const STEPS = ["Kontakt", "Tidstjuvar", "Processer", "Sammanfattning"];

const stepCardClass =
  "rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-xl shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)]";

const choicePillBase =
  "inline-flex min-h-[44px] items-center rounded-full border px-4 py-2.5 text-sm font-medium leading-none transition-all cursor-pointer select-none active:scale-[0.97] touch-manipulation";

function ChoicePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${choicePillBase} ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/0.25)] ring-1 ring-primary/60"
          : "border-white/15 bg-white/[0.04] text-foreground/80 hover:border-primary/60 hover:bg-white/[0.08]"
      }`}
    >
      {active && <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5 -mt-0.5" />}
      {children}
    </button>
  );
}

const AiKartaStart = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AiMapFormState>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return { ...emptyForm(), ...(JSON.parse(raw) as AiMapFormState) };
    } catch {
      /* ignore */
    }
    return emptyForm();
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  useEffect(() => {
    setSEOMeta({
      title: "Starta AI-kartan | Aurora Media",
      description:
        "Svara på några frågor och få en kostnadsfri AI-baserad mini-analys av era bästa möjligheter för automation, AI-assistenter och smartare system.",
      canonical: "https://auroramedia.se/ai-karta/start",
      noindex: true,
    });
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  const update = <K extends keyof AiMapFormState>(key: K, value: AiMapFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateProcess = (idx: number, patch: Partial<ProcessInput>) =>
    setForm((f) => ({
      ...f,
      processes: f.processes.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));

  const addProcess = () =>
    setForm((f) => (f.processes.length >= 5 ? f : { ...f, processes: [...f.processes, emptyProcess()] }));

  const removeProcess = (idx: number) =>
    setForm((f) => (f.processes.length <= 1 ? f : { ...f, processes: f.processes.filter((_, i) => i !== idx) }));

  const togglePain = (label: string) =>
    setForm((f) => ({
      ...f,
      pain_areas: f.pain_areas.includes(label)
        ? f.pain_areas.filter((p) => p !== label)
        : [...f.pain_areas, label],
    }));

  const validateStep = (current: number): boolean => {
    setErrors({});
    if (current === 1) {
      const parsed = Step1Schema.safeParse(form);
      if (!parsed.success) {
        const fe: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const k = issue.path[0]?.toString() ?? "form";
          if (!fe[k]) fe[k] = issue.message;
        }
        setErrors(fe);
        return false;
      }
    }
    if (current === 2 && form.pain_areas.length === 0) {
      setErrors({ pain_areas: "Välj minst ett område." });
      return false;
    }
    if (current === 3) {
      const fe: Record<string, string> = {};
      form.processes.forEach((p, i) => {
        if (!p.process_name.trim()) fe[`p_${i}_name`] = "Ange processnamn";
        if (!p.frequency) fe[`p_${i}_freq`] = "Välj frekvens";
        if (!p.weekly_time) fe[`p_${i}_time`] = "Välj tid";
        if (!p.rule_based) fe[`p_${i}_rule`] = "Välj";
        if (!p.data_available) fe[`p_${i}_data`] = "Välj";
        if (!p.business_value) fe[`p_${i}_value`] = "Välj";
      });
      if (Object.keys(fe).length) {
        setErrors(fe);
        toast.error("Fyll i alla fält för varje process.");
        return false;
      }
    }
    if (current === 4 && !form.consent) {
      setErrors({ consent: "Du måste godkänna behandlingen av dina uppgifter." });
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-ai-map", {
        body: { ...form, website },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Något gick fel.");
      try {
        sessionStorage.setItem(
          RESULT_KEY,
          JSON.stringify({
            ...data,
            meta: {
              company_name: form.company_name,
              contact_name: form.contact_name,
              email: form.email,
            },
          })
        );
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      navigate("/ai-karta/resultat");
    } catch (err) {
      console.error("[AiKartaStart] submit failed", err);
      toast.error(err instanceof Error ? err.message : "Något gick fel. Försök igen.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = useMemo(() => Math.round(((step - 1) / (STEPS.length - 1)) * 100), [step]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="overflow-hidden">
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_30%)]" />
          <div className="container mx-auto max-w-3xl px-6">
            <Reveal>
              <p className="label-caps">AI-kartan · steg {step} av {STEPS.length}</p>
              <h1 className="mt-4 font-display text-[clamp(2.4rem,5.2vw,4rem)] font-bold leading-[0.95] tracking-tight">
                {step === 1 && "Berätta lite om er"}
                {step === 2 && "Var sitter era största tidstjuvar?"}
                {step === 3 && "Lägg till 1–5 processer"}
                {step === 4 && "Kontrollera och skicka in"}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {step === 1 && "Vi behöver bara veta vilka ni är så vi kan skicka resultatet och kontakta er om ni vill gå vidare."}
                {step === 2 && "Markera de områden där ni lägger mest manuell tid i dag."}
                {step === 3 && "Beskriv minst en konkret arbetsuppgift (upp till 5) – vi räknar ut AI-potentialen för varje."}
                {step === 4 && "En snabb sammanfattning innan vi räknar fram er mini-analys."}
              </p>
            </Reveal>

            {/* Progress */}
            <div className="mt-8">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                {STEPS.map((label, i) => {
                  const reached = i + 1 <= step;
                  const isCurrent = i + 1 === step;
                  return (
                    <span
                      key={label}
                      className={`flex-1 truncate text-center ${reached ? "text-primary" : ""} ${isCurrent ? "font-semibold" : ""}`}
                    >
                      <span className="hidden sm:inline">{i + 1}. {label}</span>
                      <span className="sm:hidden">{isCurrent ? label : i + 1}</span>
                    </span>
                  );
                })}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                  style={{ width: `${progress + 25}%` }}
                />
              </div>
            </div>

            <Reveal y={18}>
              <div className={`mt-10 ${stepCardClass}`}>
                {/* Honeypot */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <Label htmlFor="aimap-website">Webbplats</Label>
                  <Input
                    id="aimap-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                {step === 1 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Företagsnamn" error={errors.company_name} required>
                      <Input
                        value={form.company_name}
                        onChange={(e) => update("company_name", e.target.value)}
                        className="rounded-full"
                      />
                    </Field>
                    <Field label="Bransch" error={errors.industry} required>
                      <Input
                        value={form.industry}
                        onChange={(e) => update("industry", e.target.value)}
                        className="rounded-full"
                        placeholder="t.ex. e-handel, bygg, konsult"
                      />
                    </Field>
                    <Field label="Antal anställda" error={errors.employee_count} required full>
                      <div className="flex flex-wrap gap-2">
                        {EMPLOYEE_OPTIONS.map((opt) => (
                          <ChoicePill
                            key={opt}
                            active={form.employee_count === opt}
                            onClick={() => update("employee_count", opt)}
                          >
                            {opt}
                          </ChoicePill>
                        ))}
                      </div>
                    </Field>
                    <Field label="Kontaktperson" error={errors.contact_name} required>
                      <Input
                        value={form.contact_name}
                        onChange={(e) => update("contact_name", e.target.value)}
                        className="rounded-full"
                      />
                    </Field>
                    <Field label="E-post" error={errors.email} required>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className="rounded-full"
                      />
                    </Field>
                  </div>
                )}

                {step === 2 && (
                  <div
                    className={
                      errors.pain_areas
                        ? "rounded-2xl border border-destructive/60 bg-destructive/[0.06] p-4"
                        : ""
                    }
                  >
                    <div className="flex flex-wrap gap-2">
                      {PAIN_AREAS.map((label) => (
                        <ChoicePill
                          key={label}
                          active={form.pain_areas.includes(label)}
                          onClick={() => togglePain(label)}
                        >
                          {label}
                        </ChoicePill>
                      ))}
                    </div>
                    {errors.pain_areas && (
                      <p className="mt-3 text-xs font-medium text-destructive">{errors.pain_areas}</p>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    {form.processes.map((p, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-white/10 bg-background/40 p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="label-caps text-primary">Process {idx + 1}</p>
                          {form.processes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeProcess(idx)}
                              className="text-xs text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="inline h-3.5 w-3.5" /> Ta bort
                            </button>
                          )}
                        </div>
                        <div className="mt-4 grid gap-4">
                          <Field label="Namn på arbetsuppgift" error={errors[`p_${idx}_name`]} required>
                            <Input
                              value={p.process_name}
                              onChange={(e) => updateProcess(idx, { process_name: e.target.value })}
                              className="rounded-full"
                              placeholder="t.ex. Skapa offerter manuellt i Word"
                            />
                          </Field>

                          <PillRow
                            label="Hur ofta?"
                            error={errors[`p_${idx}_freq`]}
                            options={Object.entries(FREQ_LABELS) as [string, string][]}
                            value={p.frequency}
                            onChange={(v) => updateProcess(idx, { frequency: v as ProcessInput["frequency"] })}
                          />
                          <PillRow
                            label="Tid per vecka"
                            error={errors[`p_${idx}_time`]}
                            options={Object.entries(TIME_LABELS) as [string, string][]}
                            value={p.weekly_time}
                            onChange={(v) => updateProcess(idx, { weekly_time: v as ProcessInput["weekly_time"] })}
                          />

                          <Field label="Vilka system används? (valfritt)">
                            <Input
                              value={p.systems}
                              onChange={(e) => updateProcess(idx, { systems: e.target.value })}
                              className="rounded-full"
                              placeholder="t.ex. Fortnox, Excel, HubSpot"
                            />
                          </Field>

                          <PillRow
                            label="Är processen regelstyrd eller mallbaserad?"
                            error={errors[`p_${idx}_rule`]}
                            options={Object.entries(YPN_LABELS) as [string, string][]}
                            value={p.rule_based}
                            onChange={(v) => updateProcess(idx, { rule_based: v as ProcessInput["rule_based"] })}
                          />
                          <PillRow
                            label="Finns data/system AI kan använda?"
                            error={errors[`p_${idx}_data`]}
                            options={Object.entries(YPN_LABELS) as [string, string][]}
                            value={p.data_available}
                            onChange={(v) => updateProcess(idx, { data_available: v as ProcessInput["data_available"] })}
                          />
                          <PillRow
                            label="Affärsnytta att effektivisera detta?"
                            error={errors[`p_${idx}_value`]}
                            options={Object.entries(VALUE_LABELS) as [string, string][]}
                            value={p.business_value}
                            onChange={(v) => updateProcess(idx, { business_value: v as ProcessInput["business_value"] })}
                          />
                        </div>
                      </div>
                    ))}

                    {form.processes.length < 5 && (
                      <button
                        type="button"
                        onClick={addProcess}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                      >
                        <Plus className="h-4 w-4" /> Lägg till en process till
                      </button>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5">
                    <SummaryRow label="Företag" value={`${form.company_name} · ${form.industry} · ${form.employee_count} anställda`} />
                    <SummaryRow label="Kontakt" value={`${form.contact_name} · ${form.email}`} />
                    <SummaryRow label="Tidstjuvar" value={form.pain_areas.join(", ") || "—"} />
                    <div>
                      <p className="label-caps">Processer</p>
                      <ul className="mt-3 space-y-2 text-sm">
                        {form.processes.map((p, i) => (
                          <li key={i} className="rounded-xl border border-white/10 bg-background/30 p-3">
                            <span className="font-semibold text-foreground">{i + 1}. {p.process_name || "—"}</span>
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {p.frequency && FREQ_LABELS[p.frequency]} · {p.weekly_time && TIME_LABELS[p.weekly_time]} ·
                              {" "}affärsnytta {p.business_value && VALUE_LABELS[p.business_value].toLowerCase()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${
                        errors.consent
                          ? "border-destructive/60 bg-destructive/[0.06]"
                          : "border-white/10 bg-background/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="aimap-consent"
                          checked={form.consent}
                          onCheckedChange={(v) => update("consent", v === true)}
                          className={`mt-0.5 ${errors.consent ? "border-destructive" : ""}`}
                        />
                        <Label htmlFor="aimap-consent" className="text-xs leading-relaxed text-foreground/80">
                          Jag godkänner att Aurora Media AB sparar mina svar och kontaktar mig med anledning av min AI-karta.
                        </Label>
                      </div>
                      {errors.consent && (
                        <p className="mt-2 text-xs font-medium text-destructive">{errors.consent}</p>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Kostnadsfritt. Inga förpliktelser. Ni får en första AI-baserad bedömning direkt.
                    </p>
                  </div>
                )}
              </div>
            </Reveal>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={prev} className="w-full rounded-full sm:w-auto" disabled={submitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Tillbaka
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              {step < STEPS.length ? (
                <Button onClick={next} size="lg" className="w-full rounded-full sm:w-auto">
                  Fortsätt <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} size="lg" className="w-full rounded-full sm:w-auto" disabled={submitting}>
                  {submitting ? (
                    <>Beräknar... <Loader2 className="ml-2 h-4 w-4 animate-spin" /></>
                  ) : (
                    <>Få min kostnadsfria mini-analys <Sparkles className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Mini-analysen är automatiskt genererad och ska ses som en första indikation. För exakt scope krävs genomgång av processer, system och data.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

function Field({
  label,
  error,
  children,
  required,
  full,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className={`text-xs uppercase tracking-wider ${error ? "text-destructive" : "text-muted-foreground"}`}>
        {label} {required && <span className={error ? "text-destructive" : "text-primary"}>*</span>}
      </Label>
      <div
        className={`mt-1.5 ${
          error
            ? "rounded-full ring-2 ring-destructive/70 ring-offset-2 ring-offset-background [&_input]:border-destructive"
            : ""
        }`}
      >
        {children}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function PillRow({
  label,
  error,
  options,
  value,
  onChange,
}: {
  label: string;
  error?: string;
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className={
        error
          ? "rounded-2xl border border-destructive/60 bg-destructive/[0.06] p-3 -m-3"
          : ""
      }
    >
      <Label className={`text-xs uppercase tracking-wider ${error ? "text-destructive" : "text-muted-foreground"}`}>
        {label}
      </Label>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {options.map(([key, lbl]) => (
          <ChoicePill key={key} active={value === key} onClick={() => onChange(key)}>
            {lbl}
          </ChoicePill>
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-[12px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default AiKartaStart;

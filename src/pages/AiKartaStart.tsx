import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { setSEOMeta } from "@/lib/seoHelpers";
import { trackEvent } from "@/lib/analytics";
import { getSupabase } from "@/lib/getSupabase";
import AiKartaShell from "@/components/aikarta/AiKartaShell";
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
  WeeklyTime,
  Frequency,
} from "@/lib/aiMap";

/* ─────────────────────────────────────────────────────────────
   AI-kartan – wizard (verkstad-tema)
   Samma submit-ai-map-anrop, samma zod-schema, samma fältnamn.
   ───────────────────────────────────────────────────────────── */

const DRAFT_KEY = "ai-karta-draft";
const RESULT_KEY = "ai_map_result";
const STEPS = ["Bransch", "Processer", "Kontakt"];
const HOURLY_RATE = 600; // schablon
const WEEKS_PER_MONTH = 4.3;

/* Mappning från bransch → föreslagna tidstjuvar och exempelprocesser */
type IndustryKey = "transport" | "bygg" | "besok" | "tillverk" | "handel" | "tjanste" | "annat";

const INDUSTRIES: { key: IndustryKey; label: string }[] = [
  { key: "transport", label: "Transport & logistik" },
  { key: "bygg", label: "Bygg & hantverk" },
  { key: "besok", label: "Besöksnäring" },
  { key: "tillverk", label: "Tillverkning & verkstad" },
  { key: "handel", label: "Handel & e-handel" },
  { key: "tjanste", label: "Tjänsteföretag" },
  { key: "annat", label: "Annat" },
];

const INDUSTRY_PAINS: Record<IndustryKey, string[]> = {
  transport: ["Administration", "Kundservice/support", "Ekonomi och fakturor", "Lager/logistik", "Rapportering/Excel"],
  bygg: ["Administration", "Sälj och offerter", "Projektledning", "Ekonomi och fakturor"],
  besok: ["Kundservice/support", "Administration", "HR/onboarding", "Rapportering/Excel"],
  tillverk: ["Administration", "Rapportering/Excel", "Lager/logistik", "Ekonomi och fakturor"],
  handel: ["Kundservice/support", "Sälj och offerter", "Lager/logistik", "Rapportering/Excel"],
  tjanste: ["Administration", "Sälj och offerter", "Projektledning", "Intern kunskap och rutiner"],
  annat: [],
};

const INDUSTRY_EXAMPLES: Record<IndustryKey, string[]> = {
  transport: [
    "Skapa körorder från mejl/telefon",
    "Fakturaunderlag efter körning",
    "Svara på ETA-frågor från kunder",
  ],
  bygg: [
    "Skapa offerter från ritningar/mail",
    "Sammanställa tidsrapporter till lön",
    "Svara på återkommande kundfrågor",
  ],
  besok: [
    "Svara på bokningsfrågor via mail",
    "Onboarding-mail till nya gäster",
    "Sammanställa recensioner till rapporter",
  ],
  tillverk: [
    "Lagerplock och orderbekräftelser",
    "Produktionsrapporter från Excel",
    "Reklamationer och ärenden",
  ],
  handel: [
    "Svara på återkommande kundfrågor",
    "Uppdatera produkttexter i webbshop",
    "Sammanställa försäljningsrapport",
  ],
  tjanste: [
    "Skapa offerter i Word efter samtal",
    "Uppdatera CRM efter kundmöten",
    "Sammanställa månadsrapporter",
  ],
  annat: [],
};

// Rimliga standardvärden när ett exempel klickas in – besökaren behöver bara bekräfta.
const EXAMPLE_DEFAULTS: Record<string, { frequency: Frequency; weekly_time: WeeklyTime }> = {
  "Skapa körorder från mejl/telefon":        { frequency: "daily",   weekly_time: "3-5" },
  "Fakturaunderlag efter körning":           { frequency: "weekly",  weekly_time: "3-5" },
  "Svara på ETA-frågor från kunder":         { frequency: "daily",   weekly_time: "1-3" },
  "Skapa offerter från ritningar/mail":      { frequency: "weekly",  weekly_time: "3-5" },
  "Sammanställa tidsrapporter till lön":     { frequency: "monthly", weekly_time: "1-3" },
  "Svara på återkommande kundfrågor":        { frequency: "daily",   weekly_time: "1-3" },
  "Svara på bokningsfrågor via mail":        { frequency: "daily",   weekly_time: "3-5" },
  "Onboarding-mail till nya gäster":         { frequency: "weekly",  weekly_time: "1-3" },
  "Sammanställa recensioner till rapporter": { frequency: "monthly", weekly_time: "0-1" },
  "Lagerplock och orderbekräftelser":        { frequency: "daily",   weekly_time: "3-5" },
  "Produktionsrapporter från Excel":         { frequency: "weekly",  weekly_time: "1-3" },
  "Reklamationer och ärenden":               { frequency: "weekly",  weekly_time: "1-3" },
  "Uppdatera produkttexter i webbshop":      { frequency: "weekly",  weekly_time: "1-3" },
  "Sammanställa försäljningsrapport":        { frequency: "weekly",  weekly_time: "1-3" },
  "Skapa offerter i Word efter samtal":      { frequency: "weekly",  weekly_time: "3-5" },
  "Uppdatera CRM efter kundmöten":           { frequency: "weekly",  weekly_time: "1-3" },
  "Sammanställa månadsrapporter":            { frequency: "monthly", weekly_time: "1-3" },
};

/* ── Zod-schema (samma som tidigare för kontaktsteget) ── */
const ContactSchema = z.object({
  company_name: z.string().trim().min(1, "Ange företagsnamn").max(120),
  industry: z.string().trim().min(1, "Ange bransch").max(80),
  employee_count: z.string().min(1, "Välj antal anställda"),
  contact_name: z.string().trim().min(1, "Ange ditt namn").max(80),
  email: z.string().trim().email("Ogiltig e-postadress").max(160),
});

/* ── Timkonvertering ── */
const WEEKLY_HOURS: Record<WeeklyTime, number> = {
  "0-1": 0.5,
  "1-3": 2,
  "3-5": 4,
  "5-10": 7.5,
  "10+": 12,
  unknown: 0,
};

function calcHoursPerWeek(processes: ProcessInput[]): number {
  return processes.reduce((sum, p) => sum + (p.weekly_time ? WEEKLY_HOURS[p.weekly_time as WeeklyTime] || 0 : 0), 0);
}

/* ── Styles ── */
const CSS = `
.aikw-wrap { max-width: 1080px; margin: 0 auto; padding-inline: clamp(20px, 4vw, 48px); }
.aikw-shell { padding-top: clamp(40px, 6vw, 72px); padding-bottom: 120px; }
.aikw-layout { display: grid; grid-template-columns: 1fr; gap: 24px; }
@media (min-width: 960px) { .aikw-layout { grid-template-columns: 1fr 300px; gap: 40px; } }

.aikw-mono {
  font-family: var(--font-mono); font-size: 12px; letter-spacing: .08em;
  text-transform: uppercase; color: #3E444B; font-weight: 500;
}
.aikw-h1 {
  margin-top: 12px; font-family: var(--font-sans); font-weight: 800;
  font-size: clamp(30px, 4.5vw, 46px); line-height: 1.05; letter-spacing: -0.024em;
  color: #14171A;
}
.aikw-sub { margin-top: 12px; color: #4A5058; font-size: 16px; line-height: 1.6; max-width: 60ch; }

.aikw-progress { margin-top: 24px; margin-bottom: 28px; }
.aikw-progress-labels {
  display: flex; justify-content: space-between; gap: 8px; margin-bottom: 8px;
}
.aikw-progress-labels span {
  flex: 1; font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em;
  text-transform: uppercase; color: #A9A69C; text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.aikw-progress-labels span.reached { color: #14171A; }
.aikw-progress-labels span.current { color: #0F5132; font-weight: 700; }
.aikw-progress-bar { height: 4px; background: #EBE9E3; border-radius: 4px; overflow: hidden; }
.aikw-progress-bar > i { display: block; height: 100%; background: #0F5132; transition: width .5s ease; }

.aikw-restore {
  margin-bottom: 20px; padding: 12px 16px;
  background: #E4EEE8; border: 1px solid #B7D6C3; border-radius: 10px;
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  font-size: 13.5px; color: #14171A; flex-wrap: wrap;
}
.aikw-restore button {
  background: transparent; border: none; color: #C64308; cursor: pointer;
  font-family: var(--font-sans); font-size: 13px; font-weight: 600; text-decoration: underline;
}

.aikw-card {
  background: #fff; border: 1px solid #D8D5CC; border-radius: 14px;
  padding: clamp(20px, 3vw, 32px);
}

.aikw-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.aikw-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 16px; min-height: 44px;
  background: #fff; color: #14171A;
  border: 1px solid #D8D5CC; border-radius: 999px;
  font-family: var(--font-sans); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all .15s ease;
}
.aikw-chip:hover { border-color: #14171A; }
.aikw-chip.active { background: #14171A; color: #F6F5F1; border-color: #14171A; }
.aikw-details { margin-top: 18px; border: 1px dashed #E2E0DA; border-radius: 10px; padding: 12px 14px 14px; background: #FCFCFA; }
.aikw-details summary {
  cursor: pointer; font-family: "Spline Sans Mono", ui-monospace, monospace; font-size: 12px;
  letter-spacing: .04em; color: #4A5058; font-weight: 600; list-style: none; user-select: none;
}
.aikw-details summary::before { content: "+ "; color: #0F5132; font-weight: 700; }
.aikw-details[open] summary::before { content: "– "; }
.aikw-details summary:hover { color: #0F5132; }
.aikw-chip.suggested { border-style: dashed; color: #4A5058; }
.aikw-chip.suggested.active { color: #F6F5F1; border-style: solid; }

.aikw-label {
  display: block; font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em;
  text-transform: uppercase; color: #3E444B; margin-bottom: 8px; font-weight: 500;
}
.aikw-input {
  width: 100%; padding: 12px 14px; min-height: 48px;
  background: #fff; border: 1px solid #D8D5CC; border-radius: 8px;
  font-family: var(--font-sans); font-size: 15px; color: #14171A;
  transition: border-color .15s ease;
}
.aikw-input:focus { outline: none; border-color: #0F5132; box-shadow: 0 0 0 3px rgba(15,81,50,.12); }
.aikw-input.err { border-color: #DC2626; }
.aikw-err { margin-top: 6px; font-size: 12.5px; color: #DC2626; font-weight: 500; }

.aikw-proc {
  padding: 20px; border: 1px solid #D8D5CC; border-radius: 12px;
  background: #FBFAF6; margin-bottom: 16px;
}
.aikw-proc-header {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  margin-bottom: 14px;
}
.aikw-proc-header .num {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em;
  text-transform: uppercase; color: #0F5132; font-weight: 700;
}
.aikw-proc-header button {
  background: transparent; border: none; color: #4A5058; cursor: pointer;
  font-size: 12px; text-decoration: underline;
}
.aikw-proc-header button:hover { color: #DC2626; }

.aikw-suggest {
  margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;
}
.aikw-suggest-btn {
  padding: 6px 12px; background: transparent; border: 1px dashed #B0AC9F; border-radius: 999px;
  font-family: var(--font-sans); font-size: 12.5px; color: #4A5058; cursor: pointer;
  transition: all .15s ease;
}
.aikw-suggest-btn:hover { border-color: #0F5132; color: #0F5132; border-style: solid; }

.aikw-add {
  width: 100%; padding: 16px; min-height: 56px;
  background: transparent; border: 1px dashed #B0AC9F; border-radius: 12px;
  color: #4A5058; font-family: var(--font-sans); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all .15s ease;
}
.aikw-add:hover { border-color: #0F5132; color: #0F5132; background: #F6FBF8; }

.aikw-actions {
  margin-top: 28px; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
}
.aikw-btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 24px; min-height: 48px;
  background: #E8500A; color: #fff !important;
  border-radius: 10px; border: none; cursor: pointer;
  font-family: var(--font-sans); font-size: 15px; font-weight: 600;
  transition: background .15s ease;
}
.aikw-btn-primary:hover { background: #C64308; }
.aikw-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.aikw-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 12px 22px; min-height: 48px;
  background: transparent; color: #14171A;
  border: 1px solid #14171A; border-radius: 10px; cursor: pointer;
  font-family: var(--font-sans); font-size: 14px; font-weight: 500;
  transition: all .15s ease;
}
.aikw-btn-ghost:hover { background: #14171A; color: #F6F5F1; }

/* Värdemätare */
.aikw-meter-side {
  position: sticky; top: 96px; align-self: start;
  background: #fff; border: 1px solid #D8D5CC; border-radius: 14px;
  padding: 20px; display: none;
}
@media (min-width: 960px) { .aikw-meter-side { display: block; } }
.aikw-meter-label {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .08em;
  text-transform: uppercase; color: #3E444B; line-height: 1.4;
}
.aikw-meter-h {
  margin-top: 12px; font-family: var(--font-sans);
  font-size: 34px; font-weight: 800; letter-spacing: -0.02em; color: #0F5132; line-height: 1;
}
.aikw-meter-h span { font-size: 15px; font-weight: 500; color: #4A5058; }
.aikw-meter-money {
  margin-top: 14px; font-family: var(--font-mono); font-size: 22px; font-weight: 600;
  color: #14171A;
}
.aikw-meter-money span { display: block; font-family: var(--font-sans); font-size: 13px; font-weight: 400; color: #4A5058; margin-top: 4px; }
.aikw-meter-hint { margin-top: 14px; font-size: 12px; color: #4A5058; line-height: 1.5; }

.aikw-meter-mobile {
  position: sticky; top: 60px; z-index: 30;
  background: #F6FBF8; border: 1px solid #B7D6C3; border-radius: 10px;
  padding: 10px 14px; margin-bottom: 20px;
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  font-family: var(--font-mono); font-size: 12.5px; color: #14171A;
}
@media (min-width: 960px) { .aikw-meter-mobile { display: none; } }
.aikw-meter-mobile b { font-weight: 700; color: #0F5132; }

.aikw-summary-row {
  display: grid; grid-template-columns: 100px 1fr; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid #EBE9E3;
}
.aikw-summary-row .k {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em;
  text-transform: uppercase; color: #3E444B;
}
.aikw-summary-row .v { color: #14171A; font-size: 14px; }

.aikw-consent {
  margin-top: 20px; padding: 16px;
  background: #FBFAF6; border: 1px solid #D8D5CC; border-radius: 10px;
  display: flex; gap: 12px; align-items: flex-start;
  cursor: pointer;
}
.aikw-consent.err { border-color: #DC2626; background: #FEF2F2; }
.aikw-consent input { margin-top: 2px; width: 18px; height: 18px; accent-color: #0F5132; flex-shrink: 0; }
.aikw-consent span { font-size: 14px; color: #14171A; line-height: 1.55; }
`;

const AiKartaStart = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState<IndustryKey | "">("");
  const [showRestore, setShowRestore] = useState(false);
  const [form, setForm] = useState<AiMapFormState>(() => emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState("");
  const stepTracked = useRef<Set<number>>(new Set());

  /* Draft-restore: kolla localStorage vid mount */
  useEffect(() => {
    setSEOMeta({
      title: "Starta AI-kartan | Aurora Media",
      description: "Svara på några frågor och få en kostnadsfri AI-baserad kartläggning av era bästa möjligheter för automation.",
      canonical: "https://auroramedia.se/ai-karta/start",
      noindex: true,
    });
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { form: AiMapFormState; industry: IndustryKey | ""; step: number };
        if (parsed?.form?.company_name || (parsed?.form?.processes?.length ?? 0) > 0 && parsed.form.processes.some((p) => p.process_name)) {
          setShowRestore(true);
        }
      }
    } catch { /* ignore */ }

    // Förvald bransch via länk (?bransch=transport) – från hero-chips eller drip-mejl
    const branschParam = searchParams.get("bransch");
    const match = INDUSTRIES.find((i) => i.key === branschParam);
    if (match) {
      setIndustry((current) => {
        if (current) return current;
        trackEvent("ai_karta_bransch_preselect", { bransch: match.key });
        return match.key;
      });
      setForm((f) => {
        if (f.industry.trim()) return f;
        return {
          ...f,
          industry: match.label,
          pain_areas: Array.from(new Set([...f.pain_areas, ...INDUSTRY_PAINS[match.key]])),
        };
      });
    }

    // Förfyll kontaktuppgifter om vi sett besökaren förut
    try {
      const lead = JSON.parse(localStorage.getItem("aurora_lead") || "null") as
        | { name?: string; email?: string; company?: string }
        | null;
      if (lead) {
        setForm((prev) => ({
          ...prev,
          company_name: prev.company_name || lead.company || "",
          contact_name: prev.contact_name || lead.name || "",
          email: prev.email || lead.email || "",
        }));
      }
    } catch { /* tom */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Autospara */
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, industry, step }));
    } catch { /* ignore */ }
  }, [form, industry, step]);

  /* Track step-visits */
  useEffect(() => {
    if (!stepTracked.current.has(step)) {
      stepTracked.current.add(step);
      const events: Record<number, string> = { 1: "ai_karta_start", 2: "ai_karta_step_2", 3: "ai_karta_step_3" };
      const ev = events[step];
      if (ev) trackEvent(ev);
    }
  }, [step]);

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { form: AiMapFormState; industry: IndustryKey | ""; step: number };
        setForm({ ...emptyForm(), ...parsed.form });
        setIndustry(parsed.industry || "");
        setStep(Math.min(3, Math.max(1, parsed.step || 1)));
      }
    } catch { /* ignore */ }
    setShowRestore(false);
  };
  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setShowRestore(false);
    setForm(emptyForm());
    setIndustry("");
    setStep(1);
  };

  const update = <K extends keyof AiMapFormState>(k: K, v: AiMapFormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const updateProcess = (idx: number, patch: Partial<ProcessInput>) =>
    setForm((f) => ({ ...f, processes: f.processes.map((p, i) => (i === idx ? { ...p, ...patch } : p)) }));
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

  const selectIndustry = (key: IndustryKey, label: string) => {
    setIndustry(key);
    update("industry", label);
    // Förfyll relevanta tidstjuvar som markerbara chips – markera dem direkt
    const suggested = INDUSTRY_PAINS[key];
    setForm((f) => ({
      ...f,
      pain_areas: Array.from(new Set([...f.pain_areas, ...suggested])),
    }));
  };

  const applyExample = (idx: number, example: string) => {
    const d = EXAMPLE_DEFAULTS[example];
    updateProcess(idx, { process_name: example, ...(d ?? {}) });
  };

  const validateStep = (current: number): boolean => {
    setErrors({});
    if (current === 1) {
      if (!industry && !form.industry.trim()) {
        setErrors({ industry: "Välj eller ange en bransch." });
        return false;
      }
      if (form.pain_areas.length === 0) {
        setErrors({ pain_areas: "Välj minst ett område." });
        return false;
      }
    }
    if (current === 2) {
      const fe: Record<string, string> = {};
      form.processes.forEach((p, i) => {
        if (!p.process_name.trim()) fe[`p_${i}_name`] = "Ange processnamn";
        if (!p.frequency) fe[`p_${i}_freq`] = "Välj frekvens";
        if (!p.weekly_time) fe[`p_${i}_time`] = "Välj tid";
      });
      if (Object.keys(fe).length) {
        setErrors(fe);
        toast.error("Fyll i alla obligatoriska fält för varje process.");
        return false;
      }
    }
    if (current === 3) {
      const parsed = ContactSchema.safeParse(form);
      if (!parsed.success) {
        const fe: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const k = issue.path[0]?.toString() ?? "form";
          if (!fe[k]) fe[k] = issue.message;
        }
        setErrors(fe);
        return false;
      }
      if (!form.consent) {
        setErrors({ consent: "Du måste godkänna behandlingen av dina uppgifter." });
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) { setStep(3); return; }
    setSubmitting(true);
    try {
      const normalized = form.processes.map((p) => ({
        ...p,
        rule_based: p.rule_based || "unknown",
        data_available: p.data_available || "unknown",
        business_value: p.business_value || "unknown",
      }));
      const supabase = await getSupabase();
      const { data, error } = await supabase.functions.invoke("submit-ai-map", {
        body: { ...form, processes: normalized, website },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Något gick fel.");
      trackEvent("ai_karta_submit", { company: form.company_name });

      // Kom ihåg kontaktuppgifterna till nästa besök
      try {
        localStorage.setItem("aurora_lead", JSON.stringify({
          name: form.contact_name,
          email: form.email,
          company: form.company_name,
        }));
      } catch { /* ignore */ }

      try {
        sessionStorage.setItem(RESULT_KEY, JSON.stringify({
          ...data,
          meta: {
            company_name: form.company_name,
            contact_name: form.contact_name,
            email: form.email,
            industry: form.industry,
            employee_count: form.employee_count,
          },
        }));
        localStorage.removeItem(DRAFT_KEY);
      } catch { /* ignore */ }
      navigate("/ai-karta/resultat");
    } catch (err) {
      console.error("[AiKartaStart] submit failed", err);
      toast.error(err instanceof Error ? err.message : "Något gick fel. Försök igen.");
    } finally {
      setSubmitting(false);
    }
  };

  /* Live-värdemätare */
  const hoursPerWeek = useMemo(() => calcHoursPerWeek(form.processes), [form.processes]);
  const monthlyCost = useMemo(() => Math.round(hoursPerWeek * WEEKS_PER_MONTH * HOURLY_RATE), [hoursPerWeek]);
  const showMeter = step >= 2 && hoursPerWeek > 0;

  const suggestedPains = industry ? INDUSTRY_PAINS[industry] : [];
  const remainingPains = PAIN_AREAS.filter((p) => !suggestedPains.includes(p));
  const examples = industry ? INDUSTRY_EXAMPLES[industry] : [];

  const progress = (step / STEPS.length) * 100;

  return (
    <AiKartaShell>
      <style>{CSS}</style>
      <section className="aikw-shell">
        <div className="aikw-wrap">
          <div className="aikw-layout">
            <div>
              {showRestore && (
                <div className="aikw-restore" role="status">
                  <span>Fortsätt där du slutade – eller börja om.</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button type="button" onClick={restoreDraft}>Fortsätt</button>
                    <button type="button" onClick={clearDraft} style={{ color: "#4A5058" }}>Börja om</button>
                  </div>
                </div>
              )}

              <span className="aikw-mono">
                Steg {step} av 3 · sparas automatiskt
                {` · ca ${step === 1 ? "60" : step === 2 ? "45" : "15"} sek kvar`}
              </span>
              <h1 className="aikw-h1">
                {step === 1 && "Vilken bransch är ni i?"}
                {step === 2 && "Vad tar tid att göra manuellt?"}
                {step === 3 && "Vart skickar vi kopian?"}
              </h1>
              <p className="aikw-sub">
                {step === 1 && "Välj en bransch så förfyller vi de vanligaste tidstjuvarna. Ni kan markera fler eller ta bort."}
                {step === 2 && "Beskriv 1–5 arbetsuppgifter som återkommer. Vi räknar ut AI-potentialen för varje."}
                {step === 3 && "Er karta är klar att räknas fram direkt. Vi skickar också en kopia på mejlen."}
              </p>

              {/* Progress */}
              <div className="aikw-progress">
                <div className="aikw-progress-labels">
                  {STEPS.map((label, i) => {
                    const reached = i + 1 <= step;
                    const current = i + 1 === step;
                    return (
                      <span key={label} className={`${reached ? "reached" : ""} ${current ? "current" : ""}`}>
                        {String(i + 1).padStart(2, "0")} · {label}
                      </span>
                    );
                  })}
                </div>
                <div className="aikw-progress-bar" aria-hidden>
                  <i style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Mobil-meter */}
              {showMeter && (
                <div className="aikw-meter-mobile" aria-live="polite">
                  <span><b>{hoursPerWeek.toFixed(1)} h/v</b> · ≈ <b>{monthlyCost.toLocaleString("sv-SE")} kr/mån</b></span>
                  <span style={{ color: "#4A5058", fontSize: 11 }}>Schablon {HOURLY_RATE} kr/h</span>
                </div>
              )}

              <div className="aikw-card">
                {/* Honeypot */}
                <div style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }} aria-hidden>
                  <label>Webbplats <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
                </div>

                {/* STEG 1: Bransch + tidstjuvar */}
                {step === 1 && (
                  <>
                    <label className="aikw-label">Bransch</label>
                    <div className="aikw-chips">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind.key}
                          type="button"
                          className={`aikw-chip ${industry === ind.key ? "active" : ""}`}
                          onClick={() => selectIndustry(ind.key, ind.label)}
                        >
                          {ind.label}
                        </button>
                      ))}
                    </div>
                    {industry === "annat" && (
                      <div style={{ marginTop: 16 }}>
                        <label className="aikw-label">Beskriv er bransch</label>
                        <input
                          className={`aikw-input ${errors.industry ? "err" : ""}`}
                          value={form.industry}
                          onChange={(e) => update("industry", e.target.value)}
                          placeholder="t.ex. konsultbolag, redovisning..."
                        />
                        {errors.industry && <p className="aikw-err">{errors.industry}</p>}
                      </div>
                    )}
                    {errors.industry && !industry && <p className="aikw-err">{errors.industry}</p>}

                    {industry && (
                      <div style={{ marginTop: 28 }}>
                        <label className="aikw-label">
                          Var sitter era största tidstjuvar? ({suggestedPains.length > 0 ? "vi föreslår baserat på bransch" : "välj minst ett"})
                        </label>
                        <div className="aikw-chips">
                          {suggestedPains.map((p) => (
                            <button
                              key={p}
                              type="button"
                              className={`aikw-chip suggested ${form.pain_areas.includes(p) ? "active" : ""}`}
                              onClick={() => togglePain(p)}
                            >
                              {p}
                            </button>
                          ))}
                          {remainingPains.map((p) => (
                            <button
                              key={p}
                              type="button"
                              className={`aikw-chip ${form.pain_areas.includes(p) ? "active" : ""}`}
                              onClick={() => togglePain(p)}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        {errors.pain_areas && <p className="aikw-err">{errors.pain_areas}</p>}
                      </div>
                    )}
                  </>
                )}

                {/* STEG 2: Processer */}
                {step === 2 && (
                  <div>
                    {form.processes.map((p, idx) => (
                      <div key={idx} className="aikw-proc">
                        <div className="aikw-proc-header">
                          <span className="num">Process {idx + 1}</span>
                          {form.processes.length > 1 && (
                            <button type="button" onClick={() => removeProcess(idx)}>Ta bort</button>
                          )}
                        </div>

                        <label className="aikw-label">Namn på arbetsuppgift *</label>
                        <input
                          className={`aikw-input ${errors[`p_${idx}_name`] ? "err" : ""}`}
                          value={p.process_name}
                          onChange={(e) => updateProcess(idx, { process_name: e.target.value })}
                          placeholder="t.ex. Skapa offerter manuellt"
                        />
                        {errors[`p_${idx}_name`] && <p className="aikw-err">{errors[`p_${idx}_name`]}</p>}

                        {examples.length > 0 && (
                          <div className="aikw-suggest">
                            {examples.map((ex) => (
                              <button
                                key={ex}
                                type="button"
                                className="aikw-suggest-btn"
                                onClick={() => applyExample(idx, ex)}
                              >
                                + {ex}
                              </button>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: 18 }}>
                          <label className="aikw-label">Hur ofta? *</label>
                          <div className="aikw-chips">
                            {Object.entries(FREQ_LABELS).map(([k, v]) => (
                              <button key={k} type="button"
                                className={`aikw-chip ${p.frequency === k ? "active" : ""}`}
                                onClick={() => updateProcess(idx, { frequency: k as ProcessInput["frequency"] })}
                              >{v}</button>
                            ))}
                          </div>
                          {errors[`p_${idx}_freq`] && <p className="aikw-err">{errors[`p_${idx}_freq`]}</p>}
                        </div>

                        <div style={{ marginTop: 18 }}>
                          <label className="aikw-label">Tid per vecka *</label>
                          <div className="aikw-chips">
                            {Object.entries(TIME_LABELS).map(([k, v]) => (
                              <button key={k} type="button"
                                className={`aikw-chip ${p.weekly_time === k ? "active" : ""}`}
                                onClick={() => updateProcess(idx, { weekly_time: k as ProcessInput["weekly_time"] })}
                              >{v}</button>
                            ))}
                          </div>
                          {errors[`p_${idx}_time`] && <p className="aikw-err">{errors[`p_${idx}_time`]}</p>}
                        </div>

                        <details className="aikw-details">
                          <summary>Öka precisionen (valfritt)</summary>
                          <div style={{ marginTop: 6 }}>
                            <label className="aikw-label">Vilka system används?</label>
                            <input
                              className="aikw-input"
                              value={p.systems}
                              onChange={(e) => updateProcess(idx, { systems: e.target.value })}
                              placeholder="t.ex. Fortnox, Excel, HubSpot"
                            />
                          </div>

                          <div style={{ marginTop: 18 }}>
                            <label className="aikw-label">Regelstyrd/mallbaserad?</label>
                            <div className="aikw-chips">
                              {Object.entries(YPN_LABELS).map(([k, v]) => (
                                <button key={k} type="button"
                                  className={`aikw-chip ${p.rule_based === k ? "active" : ""}`}
                                  onClick={() => updateProcess(idx, { rule_based: k as ProcessInput["rule_based"] })}
                                >{v}</button>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginTop: 18 }}>
                            <label className="aikw-label">Finns data AI kan använda?</label>
                            <div className="aikw-chips">
                              {Object.entries(YPN_LABELS).map(([k, v]) => (
                                <button key={k} type="button"
                                  className={`aikw-chip ${p.data_available === k ? "active" : ""}`}
                                  onClick={() => updateProcess(idx, { data_available: k as ProcessInput["data_available"] })}
                                >{v}</button>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginTop: 18 }}>
                            <label className="aikw-label">Affärsnytta att effektivisera?</label>
                            <div className="aikw-chips">
                              {Object.entries(VALUE_LABELS).map(([k, v]) => (
                                <button key={k} type="button"
                                  className={`aikw-chip ${p.business_value === k ? "active" : ""}`}
                                  onClick={() => updateProcess(idx, { business_value: k as ProcessInput["business_value"] })}
                                >{v}</button>
                              ))}
                            </div>
                          </div>
                        </details>
                      </div>
                    ))}

                    {form.processes.length < 5 && (
                      <button type="button" className="aikw-add" onClick={addProcess}>
                        + Lägg till en process till
                      </button>
                    )}
                  </div>
                )}

                {/* STEG 3: Kontakt */}
                {step === 3 && (
                  <>
                    <div style={{ padding: "12px 16px", background: "#F6FBF8", border: "1px solid #B7D6C3", borderRadius: 10, marginBottom: 20, fontSize: 13.5, color: "#14171A" }}>
                      Resultatet visas <b>direkt på skärmen</b>. Mejlkopian är för att kunna visa kollegor.
                    </div>

                    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                      <div>
                        <label className="aikw-label">Företagsnamn *</label>
                        <input className={`aikw-input ${errors.company_name ? "err" : ""}`}
                          value={form.company_name} onChange={(e) => update("company_name", e.target.value)} />
                        {errors.company_name && <p className="aikw-err">{errors.company_name}</p>}
                      </div>
                      <div>
                        <label className="aikw-label">Bransch *</label>
                        <input className={`aikw-input ${errors.industry ? "err" : ""}`}
                          value={form.industry} onChange={(e) => update("industry", e.target.value)} />
                        {errors.industry && <p className="aikw-err">{errors.industry}</p>}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label className="aikw-label">Antal anställda *</label>
                        <div className="aikw-chips">
                          {EMPLOYEE_OPTIONS.map((opt) => (
                            <button key={opt} type="button"
                              className={`aikw-chip ${form.employee_count === opt ? "active" : ""}`}
                              onClick={() => update("employee_count", opt)}
                            >{opt}</button>
                          ))}
                        </div>
                        {errors.employee_count && <p className="aikw-err">{errors.employee_count}</p>}
                      </div>
                      <div>
                        <label className="aikw-label">Kontaktperson *</label>
                        <input className={`aikw-input ${errors.contact_name ? "err" : ""}`}
                          value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} />
                        {errors.contact_name && <p className="aikw-err">{errors.contact_name}</p>}
                      </div>
                      <div>
                        <label className="aikw-label">E-post *</label>
                        <input type="email" className={`aikw-input ${errors.email ? "err" : ""}`}
                          value={form.email} onChange={(e) => update("email", e.target.value)} />
                        {errors.email && <p className="aikw-err">{errors.email}</p>}
                      </div>
                    </div>

                    <label className={`aikw-consent ${errors.consent ? "err" : ""}`}>
                      <input type="checkbox" checked={form.consent}
                        onChange={(e) => update("consent", e.target.checked)} />
                      <span>
                        Jag godkänner{" "}
                        <Link
                          to="/villkor"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ color: "#0F5132", fontWeight: 700, textDecoration: "underline" }}
                        >
                          villkoren för AI-kartan
                        </Link>
                        {" "}– Aurora Media skickar kartan på mejl och kan höra av sig för uppföljning.
                      </span>
                    </label>
                    {errors.consent && <p className="aikw-err">{errors.consent}</p>}
                  </>
                )}

              </div>

              <div className="aikw-actions">
                {step > 1 ? (
                  <button type="button" onClick={prev} className="aikw-btn-ghost" disabled={submitting}>← Tillbaka</button>
                ) : <span />}
                {step < 3 ? (
                  <button type="button" onClick={next} className="aikw-btn-primary">Fortsätt →</button>
                ) : (
                  <button type="button" onClick={handleSubmit} className="aikw-btn-primary" disabled={submitting}>
                    {submitting ? "Beräknar..." : "Visa min AI-karta direkt →"}
                  </button>
                )}
              </div>

              {step === 3 && (
                <p style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "#4A5058" }}>
                  🔒 Era svar delas aldrig. Kartan är gratis – oavsett om vi jobbar ihop sen eller inte.
                </p>
              )}

              <p style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "#A9A69C" }}>
                Analysen är automatiskt genererad och ska ses som en första indikation. För exakt scope krävs genomgång av processer, system och data.
              </p>
            </div>

            {/* Desktop-värdemätare */}
            <aside className="aikw-meter-side">
              <div className="aikw-meter-label">Så mycket kostar handpålägget idag<br />(schablon 600 kr/h)</div>
              <div className="aikw-meter-h">
                {hoursPerWeek > 0 ? hoursPerWeek.toFixed(1) : "0"}<span> h/vecka</span>
              </div>
              <div className="aikw-meter-money">
                ≈ {monthlyCost.toLocaleString("sv-SE")} kr<span>per månad · {(monthlyCost * 12).toLocaleString("sv-SE")} kr/år</span>
              </div>
              <p className="aikw-meter-hint">
                Räknat på {WEEKS_PER_MONTH} veckor/månad × 600 kr/timme. Uppdateras när ni lägger till processer.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </AiKartaShell>
  );
};

export default AiKartaStart;

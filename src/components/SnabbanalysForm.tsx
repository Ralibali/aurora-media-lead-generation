import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { getSupabase } from "@/lib/getSupabase";

/*
 * SnabbanalysForm – delad komponent för fritext-analysen.
 * Används i hemsidans hero (compact) och på /ai-snabbanalys (full).
 * Skickar texten till edge-funktionen quick-ai-map, lagrar resultatet i
 * samma format som AI-kartans wizard och navigerar till resultatsidan.
 */

const RESULT_KEY = "ai_map_result";

const LOADING_MESSAGES = [
  "Läser er beskrivning …",
  "Identifierar automationscase …",
  "Räknar på timmar och kostnader …",
  "Bygger er AI-plan …",
];

const PLACEHOLDER =
  "T.ex. Vi är ett byggföretag med 12 anställda. Jag skriver offerter i Word på kvällarna, tidrapporterna kommer in via SMS och läggs in i Excel varje fredag, och fakturaunderlaget ligger i en Dropbox-mapp som någon måste matcha manuellt …";

const CSS = `
.snf-card { background: #fff; border: 1px solid var(--linje, #E2E0DA); border-radius: 16px; padding: 24px; box-shadow: 0 18px 44px -22px rgba(20,23,26,.22); }
.snf-card.compact { padding: 20px; border-radius: 14px; }
.snf-head { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono, ui-monospace, monospace); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: #3E444B; margin-bottom: 14px; }
.snf-head::before { content: ""; width: 7px; height: 7px; background: #E8500A; border-radius: 50%; }
.snf-label { display: block; font-family: var(--font-mono, ui-monospace, monospace); font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase; color: #3E444B; margin: 0 0 7px; }
.snf-input, .snf-textarea {
  width: 100%; border: 1px solid #E2E0DA; border-radius: 10px; background: #FDFCF8;
  padding: 11px 13px; font-size: 15px; font-family: var(--font-sans, system-ui, sans-serif); color: #14171A;
  outline: none; transition: border-color .15s ease, box-shadow .15s ease;
}
.snf-input:focus, .snf-textarea:focus { border-color: #14171A; box-shadow: 0 0 0 3px rgba(20,23,26,.08); }
.snf-textarea { resize: vertical; min-height: 108px; line-height: 1.55; }
.snf-card.compact .snf-textarea { min-height: 92px; }
.snf-field { margin-bottom: 14px; }
.snf-error { color: #B3261E; font-size: 13px; margin-top: 6px; }
.snf-hint { color: #4A5058; font-size: 12px; margin-top: 6px; display: flex; justify-content: space-between; gap: 10px; }
.snf-consent { display: flex; gap: 9px; align-items: flex-start; font-size: 13px; color: #3E444B; line-height: 1.5; cursor: pointer; }
.snf-consent input { margin-top: 2px; width: 16px; height: 16px; accent-color: #E8500A; flex-shrink: 0; }
.snf-loading { display: inline-flex; align-items: center; gap: 9px; }
.snf-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: snf-spin .7s linear infinite; }
@keyframes snf-spin { to { transform: rotate(360deg); } }
.snf-foot { text-align: center; margin-top: 10px; font-size: 12px; color: #4A5058; }
`;

interface SnabbanalysFormProps {
  compact?: boolean;
  showCompany?: boolean;
  heading?: string;
  idPrefix?: string;
  onSuccess?: (data: Record<string, unknown>) => void;
}

const SnabbanalysForm = ({
  compact = false,
  showCompany = true,
  heading = "AI-snabbanalys · Gratis · ca 30 sek",
  idPrefix = "snf",
  onSuccess,
}: SnabbanalysFormProps) => {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [fritext, setFritext] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startedAt = useRef<number>(0);

  // Förfyll e-post/företag om vi sett besökaren förut
  useEffect(() => {
    try {
      const lead = JSON.parse(localStorage.getItem("aurora_lead") || "null") as
        | { email?: string; company?: string }
        | null;
      if (lead?.email) setEmail(lead.email);
      if (lead?.company) setCompany(lead.company);
    } catch { /* tom */ }
  }, []);

  useEffect(() => {
    if (!submitting) return;
    const t = setInterval(() => setLoadingIdx((i) => (i + 1) % LOADING_MESSAGES.length), 2600);
    return () => clearInterval(t);
  }, [submitting]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (fritext.trim().length < 30) e.fritext = "Beskriv gärna lite mer – minst några meningar om vad som tar tid.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Ange en giltig e-postadress.";
    if (!consent) e.consent = "Du behöver godkänna villkoren för att få planen.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    startedAt.current = Date.now();
    trackEvent("ai_snabbanalys_submit", { length: fritext.trim().length, compact });
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.functions.invoke("quick-ai-map", {
        body: {
          fritext: fritext.trim(),
          email: email.trim(),
          company_name: company.trim(),
          consent,
          website,
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Något gick fel.");

      try {
        localStorage.setItem("aurora_lead", JSON.stringify({
          name: "",
          email: email.trim(),
          company: company.trim(),
        }));
      } catch { /* ignore */ }

      const result = {
        ...data,
        meta: {
          company_name: (data?.meta?.company_name as string) || company.trim() || "Ert företag",
          contact_name: "",
          email: email.trim(),
          industry: (data?.meta?.industry as string) || "",
          employee_count: (data?.meta?.employee_count as string) || "",
        },
      };
      try {
        sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
      } catch { /* ignore */ }

      trackEvent("ai_snabbanalys_done", { seconds: Math.round((Date.now() - startedAt.current) / 1000), compact });
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate("/ai-karta/resultat");
      }
    } catch (err) {
      console.error("[SnabbanalysForm] submit failed", err);
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "Analysen misslyckades – försök igen om en stund."
      );
      setSubmitting(false);
      trackEvent("ai_snabbanalys_error", { compact });
    }
  };

  const chars = fritext.trim().length;

  return (
    <form className={`snf-card${compact ? " compact" : ""}`} onSubmit={handleSubmit} noValidate>
      <style>{CSS}</style>
      <p className="snf-head">{heading}</p>

      {showCompany && (
        <div className="snf-field">
          <label className="snf-label" htmlFor={`${idPrefix}-company`}>Företag (valfritt)</label>
          <input
            id={`${idPrefix}-company`}
            className="snf-input"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="T.ex. Nordens Åkeri AB"
            maxLength={120}
          />
        </div>
      )}

      <div className="snf-field">
        <label className="snf-label" htmlFor={`${idPrefix}-text`}>Vad tar mest tid i er vardag?</label>
        <textarea
          id={`${idPrefix}-text`}
          className="snf-textarea"
          value={fritext}
          onChange={(e) => setFritext(e.target.value)}
          placeholder={PLACEHOLDER}
          maxLength={2500}
        />
        <div className="snf-hint">
          <span>Ju mer konkret – system, tider, verktyg – desto vassare plan.</span>
          <span style={{ whiteSpace: "nowrap", color: chars >= 30 ? "#0F5132" : undefined }}>{chars} / minst 30</span>
        </div>
        {errors.fritext && <p className="snf-error">{errors.fritext}</p>}
      </div>

      <div className="snf-field">
        <label className="snf-label" htmlFor={`${idPrefix}-email`}>Din e-post – dit planen skickas</label>
        <input
          id={`${idPrefix}-email`}
          className="snf-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="namn@foretag.se"
          maxLength={160}
          autoComplete="email"
        />
        {errors.email && <p className="snf-error">{errors.email}</p>}
      </div>

      {/* Honeypot */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
      />

      <div className="snf-field">
        <label className="snf-consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            Jag godkänner{" "}
            <Link to="/villkor" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", fontWeight: 600 }}>
              villkoren
            </Link>{" "}
            – Aurora Media skickar AI-planen på mejl och kan höra av sig för uppföljning.
          </span>
        </label>
        {errors.consent && <p className="snf-error">{errors.consent}</p>}
      </div>

      {submitError && <p className="snf-error" style={{ marginBottom: 12 }}>{submitError}</p>}

      <button type="submit" className="vk-btn vk-btn-primary" disabled={submitting} style={{ width: "100%", justifyContent: "center", minHeight: 50, fontSize: 15.5 }}>
        {submitting ? (
          <span className="snf-loading">
            <span className="snf-spinner" />
            {LOADING_MESSAGES[loadingIdx]}
          </span>
        ) : (
          <>Analysera & få min AI-plan →</>
        )}
      </button>
      <p className="snf-foot">0 kr · PDF direkt i inkorgen · Samma analysmotor som AI-kartan</p>
    </form>
  );
};

export default SnabbanalysForm;

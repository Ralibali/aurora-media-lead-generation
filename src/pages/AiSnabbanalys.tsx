import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import AiKartaShell from "@/components/aikarta/AiKartaShell";
import { setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";
import { trackEvent } from "@/lib/analytics";
import { getSupabase } from "@/lib/getSupabase";
import "@/styles/verkstad.css";

/*
 * AI-SNABBANALYS – snabbvarianten av AI-kartan.
 * För besökare som inte orkar svara på frågor: de beskriver sin vardag i
 * fritext + anger sin e-post. AI tolkar texten till samma datastruktur som
 * wizarden, och flödet landar på samma resultatsida med samma PDF-produkt.
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

const AiSnabbanalys = () => {
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

  useEffect(() => {
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "AI-kartan", url: "/ai-karta" },
      { name: "Snabbanalys", url: "/ai-snabbanalys" },
    ]);
    trackEvent("ai_snabbanalys_view");
    // Förfyll e-post om vi sett besökaren förut
    try {
      const lead = JSON.parse(localStorage.getItem("aurora_lead") || "null") as
        | { name?: string; email?: string; company?: string }
        | null;
      if (lead?.email) setEmail(lead.email);
      if (lead?.company) setCompany(lead.company);
    } catch { /* tom */ }
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);

  // Roterande laddningstexter medan AI:n arbetar
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
    trackEvent("ai_snabbanalys_submit", { length: fritext.trim().length });
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

      try {
        sessionStorage.setItem(RESULT_KEY, JSON.stringify({
          ...data,
          meta: {
            company_name: data?.meta?.company_name || company.trim() || "Ert företag",
            contact_name: "",
            email: email.trim(),
            industry: data?.meta?.industry || "",
            employee_count: data?.meta?.employee_count || "",
          },
        }));
      } catch { /* ignore */ }

      trackEvent("ai_snabbanalys_done", { seconds: Math.round((Date.now() - startedAt.current) / 1000) });
      navigate("/ai-karta/resultat");
    } catch (err) {
      console.error("[AiSnabbanalys] submit failed", err);
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "Analysen misslyckades – försök igen om en stund."
      );
      setSubmitting(false);
      trackEvent("ai_snabbanalys_error");
    }
  };

  const chars = fritext.trim().length;

  return (
    <>
      <SEO
        title="AI-snabbanalys – beskriv er vardag, få en AI-plan som PDF | Aurora Media"
        description="Skriv några meningar om vad som tar tid i er vardag. Vår AI tolkar texten och skickar en personlig AI-plan som PDF – gratis, på någon minut."
        canonical="/ai-snabbanalys"
      />
      <AiKartaShell>
        <style>{`
          .aisn-wrap { max-width: 1100px; margin: 0 auto; padding: clamp(90px,12vw,140px) 20px 80px; }
          .aisn-grid { display: grid; grid-template-columns: 1.25fr .9fr; gap: 48px; align-items: start; margin-top: 44px; }
          @media (max-width: 920px) { .aisn-grid { grid-template-columns: 1fr; } }
          .aisn-card { background: #fff; border: 1px solid var(--linje); border-radius: 16px; padding: clamp(22px,3.5vw,34px); }
          .aisn-label { display: block; font-family: var(--font-mono); font-size: 11px; letter-spacing: .09em; text-transform: uppercase; color: #3E444B; margin: 0 0 8px; }
          .aisn-input, .aisn-textarea {
            width: 100%; border: 1px solid var(--linje); border-radius: 10px; background: #FDFCF8;
            padding: 13px 14px; font-size: 15.5px; font-family: var(--font-sans); color: #14171A;
            outline: none; transition: border-color .15s ease, box-shadow .15s ease;
          }
          .aisn-input:focus, .aisn-textarea:focus { border-color: #14171A; box-shadow: 0 0 0 3px rgba(20,23,26,.08); }
          .aisn-textarea { resize: vertical; min-height: 150px; line-height: 1.6; }
          .aisn-field { margin-bottom: 20px; }
          .aisn-error { color: #B3261E; font-size: 13px; margin-top: 6px; }
          .aisn-hint { color: #4A5058; font-size: 12.5px; margin-top: 6px; display: flex; justify-content: space-between; gap: 10px; }
          .aisn-consent { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; color: #3E444B; line-height: 1.5; cursor: pointer; }
          .aisn-consent input { margin-top: 3px; width: 16px; height: 16px; accent-color: #E8500A; flex-shrink: 0; }
          .aisn-step { display: flex; gap: 14px; align-items: flex-start; }
          .aisn-step + .aisn-step { margin-top: 18px; }
          .aisn-stepnum { width: 26px; height: 26px; border-radius: 50%; background: #14171A; color: #F6F5F1; display: grid; place-items: center; font-family: var(--font-mono); font-size: 12px; flex-shrink: 0; }
          .aisn-altcard { display: block; margin-top: 28px; border: 1px dashed #14171A; border-radius: 14px; padding: 18px 20px; text-decoration: none; color: #14171A; transition: background .15s ease; }
          .aisn-altcard:hover { background: #fff; }
          .aisn-loading { display: inline-flex; align-items: center; gap: 9px; }
          .aisn-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: aisn-spin .7s linear infinite; }
          @keyframes aisn-spin { to { transform: rotate(360deg); } }
        `}</style>

        <div className="aisn-wrap">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#3E444B", display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 7, height: 7, background: "#E8500A", borderRadius: "50%", display: "inline-block" }} />
            AI-snabbanalys · Gratis · ca 30 sekunder
          </p>
          <h1 style={{ marginTop: 16, marginBottom: 18, maxWidth: 700 }}>
            Beskriv er vardag. Få en AI-plan som PDF.
          </h1>
          <p style={{ maxWidth: 620, color: "var(--granbark-mut)", fontSize: 17, lineHeight: 1.6 }}>
            Inga frågor, ingen wizard. Skriv några meningar om vad som tar mest tid i er vardag –
            vår AI tolkar texten, räknar på vad det kostar er och bygger en personlig AI-plan
            som skickas till din mejl inom någon minut.
          </p>

          <div className="aisn-grid">
            {/* ---------- FORMULÄR ---------- */}
            <form className="aisn-card" onSubmit={handleSubmit} noValidate>
              <div className="aisn-field">
                <label className="aisn-label" htmlFor="aisn-company">Företag (valfritt)</label>
                <input
                  id="aisn-company"
                  className="aisn-input"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="T.ex. Nordens Åkeri AB"
                  maxLength={120}
                />
              </div>

              <div className="aisn-field">
                <label className="aisn-label" htmlFor="aisn-fritext">Vad tar mest tid i er vardag?</label>
                <textarea
                  id="aisn-fritext"
                  className="aisn-textarea"
                  value={fritext}
                  onChange={(e) => setFritext(e.target.value)}
                  placeholder={PLACEHOLDER}
                  maxLength={2500}
                />
                <div className="aisn-hint">
                  <span>Ju mer konkret – system, tider, verktyg – desto vassare plan.</span>
                  <span style={{ whiteSpace: "nowrap", color: chars >= 30 ? "var(--gran)" : undefined }}>{chars} / minst 30</span>
                </div>
                {errors.fritext && <p className="aisn-error">{errors.fritext}</p>}
              </div>

              <div className="aisn-field">
                <label className="aisn-label" htmlFor="aisn-email">Din e-post – dit planen skickas</label>
                <input
                  id="aisn-email"
                  className="aisn-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="namn@foretag.se"
                  maxLength={160}
                  autoComplete="email"
                />
                {errors.email && <p className="aisn-error">{errors.email}</p>}
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

              <div className="aisn-field">
                <label className="aisn-consent">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>
                    Jag godkänner{" "}
                    <Link to="/villkor" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", fontWeight: 600 }}>
                      villkoren
                    </Link>{" "}
                    – Aurora Media skickar AI-planen på mejl och kan höra av sig för uppföljning.
                  </span>
                </label>
                {errors.consent && <p className="aisn-error">{errors.consent}</p>}
              </div>

              {submitError && (
                <p className="aisn-error" style={{ marginBottom: 14 }}>{submitError}</p>
              )}

              <button type="submit" className="vk-btn vk-btn-primary" disabled={submitting} style={{ width: "100%", justifyContent: "center", minHeight: 52, fontSize: 16 }}>
                {submitting ? (
                  <span className="aisn-loading">
                    <span className="aisn-spinner" />
                    {LOADING_MESSAGES[loadingIdx]}
                  </span>
                ) : (
                  <>Analysera & få min AI-plan →</>
                )}
              </button>
              <p style={{ textAlign: "center", marginTop: 12, fontSize: 12.5, color: "var(--granbark-mut)" }}>
                0 kr · PDF direkt i inkorgen · Samma analysmotor som AI-kartan
              </p>
            </form>

            {/* ---------- SIDOPANEL ---------- */}
            <aside>
              <div className="aisn-card" style={{ background: "var(--gran-soft)" }}>
                <p className="aisn-label">Så går det till</p>
                <div className="aisn-step">
                  <span className="aisn-stepnum">1</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Du beskriver – vi lyssnar</p>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 14, lineHeight: 1.55, marginTop: 3 }}>
                      Skriv som du skulle berätta det för en kollega. AI:n hittar automationscasen.
                    </p>
                  </div>
                </div>
                <div className="aisn-step">
                  <span className="aisn-stepnum">2</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Planen landar i inkorgen</p>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 14, lineHeight: 1.55, marginTop: 3 }}>
                      Vad varje process kostar i kronor, vad som bör byggas först, fast pris och återbetalningstid.
                    </p>
                  </div>
                </div>
                <div className="aisn-step">
                  <span className="aisn-stepnum">3</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>Valfritt: 20 min med mig</p>
                    <p style={{ color: "var(--granbark-mut)", fontSize: 14, lineHeight: 1.55, marginTop: 3 }}>
                      Vill du gå djupare pekar jag ut exakt första bygget – kostnadsfritt, utan köpkrav.
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/ai-karta" className="aisn-altcard" onClick={() => trackEvent("ai_snabbanalys_to_wizard")}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#3E444B", marginBottom: 6 }}>
                  Hellre svara på frågor?
                </p>
                <p style={{ fontWeight: 700, fontSize: 16.5 }}>
                  Gör fulla AI-kartan – tre korta steg <span aria-hidden="true">→</span>
                </p>
              </Link>
            </aside>
          </div>
        </div>
      </AiKartaShell>
    </>
  );
};

export default AiSnabbanalys;

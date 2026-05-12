import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TriangleAlert as AlertTriangle, ArrowRight, CalendarCheck, CircleCheck as CheckCircle2, Clock, Database, Download, Loader as Loader2, Mail, RefreshCw, Sparkles, Target, TrendingUp, Workflow, Zap } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { setSEOMeta } from "@/lib/seoHelpers";
import { AiMapResult, FREQ_LABELS, TIME_LABELS } from "@/lib/aiMap";
import { downloadAiMapPdf } from "@/lib/aiMapPdf";
import { trackAiKartaClick } from "@/lib/aiKartaTracking";
import { supabase } from "@/integrations/supabase/client";

const RESULT_KEY = "ai_map_result";
const F = "'Fraunces',Georgia,serif";
const I = "'Inter',system-ui,sans-serif";
const M = "'JetBrains Mono',ui-monospace,monospace";
const C = "#EDE9DC";

const potentialColor: Record<string, string> = {
  "Mycket hög": "from-primary to-primary/60",
  Hög: "from-primary to-primary/60",
  Medel: "from-amber-400 to-amber-500/60",
  Låg: "from-muted-foreground/60 to-muted-foreground/40",
};

// Map varje rekommenderad lösning till en passande ikon
function solutionIcon(solution: string) {
  const s = solution.toLowerCase();
  if (s.includes("kundservice")) return Sparkles;
  if (s.includes("offert") || s.includes("dokument")) return Workflow;
  if (s.includes("dashboard") || s.includes("rapport")) return TrendingUp;
  if (s.includes("kunskap")) return Database;
  if (s.includes("integration") || s.includes("automation")) return Zap;
  return Target;
}

// Snyggare svensk grammatik på huvudrubriken
function buildHeadline(potential: string): { lead: string; tail: string } {
  const map: Record<string, { lead: string; tail: string }> = {
    "Mycket hög": { lead: "mycket hög", tail: "AI-potential" },
    Hög: { lead: "hög", tail: "AI-potential" },
    Medel: { lead: "medelhög", tail: "AI-potential" },
    Låg: { lead: "begränsad", tail: "AI-potential just nu" },
  };
  return map[potential] ?? { lead: potential.toLowerCase(), tail: "AI-potential" };
}

type LoadStatus = "loading" | "ready" | "missing" | "error";

const AiKartaResultat = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<AiMapResult | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [bookingErr, setBookingErr] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState({ name: "", email: "", phone: "", preferred_time: "", message: "", website: "" });
  const [bookFieldErrors, setBookFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setSEOMeta({
      title: "Er AI-karta · Resultat | Aurora Media",
      description: "Mini-analys av era topp-3 AI-områden och rekommenderat nästa steg.",
      canonical: "https://auroramedia.se/ai-karta/resultat",
      noindex: true,
    });
    // Liten konstgjord delay så loading-state hinner kännas medvetet, inte glitch
    const t = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(RESULT_KEY);
        if (!raw) {
          setStatus("missing");
          return;
        }
        const parsed = JSON.parse(raw) as AiMapResult;
        if (!parsed || !parsed.top3 || !Array.isArray(parsed.top3) || parsed.top3.length === 0) {
          setErrorMsg("Resultatet verkar vara tomt eller skadat.");
          setStatus("error");
          return;
        }
        setResult(parsed);
        setStatus("ready");
      } catch (err) {
        console.error("[AiKartaResultat] kunde inte läsa resultatet", err);
        setErrorMsg(err instanceof Error ? err.message : "Okänt fel vid inläsning.");
        setStatus("error");
      }
    }, 250);
    return () => clearTimeout(t);
  }, []);

  if (status === "loading") {
    return <ResultStateScreen kind="loading" />;
  }
  if (status === "missing") {
    return (
      <ResultStateScreen
        kind="missing"
        onPrimary={() => navigate("/ai-karta/start")}
      />
    );
  }
  if (status === "error" || !result) {
    return (
      <ResultStateScreen
        kind="error"
        message={errorMsg ?? undefined}
        onPrimary={() => navigate("/ai-karta/start")}
        onSecondary={() => window.location.reload()}
      />
    );
  }


  const {
    total_potential, top3, totalScore, meta,
    totalSavedPerWeek = 0, totalSavedPerYear = 0, pain_areas = [],
    ai_analysis = null,
  } = result;
  const { lead, tail } = buildHeadline(total_potential);
  const aiCaseFor = (name: string) =>
    ai_analysis?.cases?.find(
      (c) => c.process_name.trim().toLowerCase() === name.trim().toLowerCase()
    ) ?? null;

  const handlePrint = () => {
    if (!result) return;
    void trackAiKartaClick("result_pdf_download");
    try {
      downloadAiMapPdf(result);
      toast.success("PDF skapad", { description: "Filen laddas ner till din enhet." });
    } catch (err) {
      console.error("[AiKartaResultat] PDF-export misslyckades", err);
      toast.error("Kunde inte skapa PDF", { description: "Försök igen eller kontakta info@auroramedia.se." });
    }
  };

  const handleResend = async () => {
    if (!result || sending) return;
    setSending(true);
    void trackAiKartaClick("result_resend_email");
    const t = toast.loading(`Skickar analysen till ${result.meta.email}…`);
    try {
      const { data, error } = await supabase.functions.invoke("resend-ai-map-email", {
        body: {
          email: result.meta.email,
          contact_name: result.meta.contact_name,
          company_name: result.meta.company_name,
          total_potential: result.total_potential,
          top3: result.top3,
          totalSavedPerWeek: result.totalSavedPerWeek,
          totalSavedPerYear: result.totalSavedPerYear,
        },
      });
      if (error || (data && (data as { error?: string }).error)) {
        throw new Error((data as { error?: string })?.error || error?.message || "Okänt fel");
      }
      toast.success(`Mail skickat till ${result.meta.email}`, {
        id: t,
        description: "Kolla inkorgen (och eventuellt skräpposten).",
      });
    } catch (err) {
      console.error("[resend-ai-map-email]", err);
      toast.error("Kunde inte skicka mailet", {
        id: t,
        description: "Försök igen om en stund eller kontakta info@auroramedia.se.",
      });
    } finally {
      setSending(false);
    }
  };

  const openBooking = () => {
    void trackAiKartaClick("booking_open");
    setBookingErr(null);
    setBookingStatus("idle");
    setBookFieldErrors({});
    setBookForm((f) => ({
      ...f,
      name: f.name || meta.contact_name || "",
      email: f.email || meta.email || "",
    }));
    setBookingOpen(true);
  };

  const BookingSchema = z.object({
    name: z.string().trim().min(2, "Ange ditt namn").max(80),
    email: z.string().trim().email("Ogiltig e-postadress").max(160),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    preferred_time: z.string().trim().max(120).optional().or(z.literal("")),
    message: z.string().trim().max(1000).optional().or(z.literal("")),
  });

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingStatus === "submitting") return;
    setBookingErr(null);
    setBookFieldErrors({});
    const parsed = BookingSchema.safeParse(bookForm);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0]?.toString() ?? "form";
        if (!fe[k]) fe[k] = issue.message;
      }
      setBookFieldErrors(fe);
      return;
    }
    setBookingStatus("submitting");
    void trackAiKartaClick("booking_submit");
    try {
      const { data, error } = await supabase.functions.invoke("book-ai-genomlysning", {
        body: {
          contact_name: parsed.data.name,
          email: parsed.data.email,
          company_name: meta.company_name,
          phone: parsed.data.phone,
          preferred_time: parsed.data.preferred_time,
          message: parsed.data.message,
          total_potential,
          totalSavedPerYear,
          topProcesses: top3.map((p) => p.process_name),
          website: bookForm.website,
        },
      });
      if (error || (data && (data as { error?: string }).error)) {
        throw new Error((data as { error?: string })?.error || error?.message || "Okänt fel");
      }
      setBookingStatus("success");
      toast.success("Bokningsförfrågan skickad", { description: "Du får en kalenderinbjudan inom kort." });
    } catch (err) {
      console.error("[book-ai-genomlysning]", err);
      setBookingStatus("idle");
      setBookingErr(err instanceof Error ? err.message : "Något gick fel. Försök igen.");
    }
  };
  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main">
        <section style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
          <div className="wrap">
            <div>
              <p style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 16 }}>Mini-analys för {meta.company_name}</p>
              <h1 style={{ fontFamily: F, fontSize: "clamp(28px,6vw,56px)", lineHeight: 1.05, letterSpacing: "-0.025em", color: C, fontWeight: 400, marginBottom: 12 }}>
                Ni har <em>{lead}</em> {tail}
              </h1>
              <p style={{ fontFamily: I, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 560, marginBottom: 32 }}>
                Baserat på era svar har vi identifierat {top3.length} processer där AI och automation
                kan göra störst skillnad. Här är en första uppskattning – inte en exakt lösningsdesign.
              </p>

              {/* Konkreta värdesiffror, inte abstrakta poäng */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
                <StatCard
                  icon={Clock}
                  label="Uppskattad tidsbesparing"
                  value={totalSavedPerWeek > 0 ? `~${totalSavedPerWeek} h/v` : "–"}
                  sub={totalSavedPerYear > 0 ? `≈ ${totalSavedPerYear} h/år` : undefined}
                  highlight
                />
                <StatCard
                  icon={TrendingUp}
                  label="Total AI-potential"
                  value={total_potential}
                />
                <StatCard
                  icon={Target}
                  label="Mognadspoäng"
                  value={`${totalScore} p`}
                  sub={`av ${top3.length * 16} möjliga`}
                />
              </div>

              {/* Speglar tillbaka kundens egna pain areas */}
              {pain_areas.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  <span style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)" }}>
                    Era utmaningsområden:
                  </span>
                  {pain_areas.map((area) => (
                    <span key={area} style={{ fontFamily: I, fontSize: 12, color: C, border: "0.5px solid rgba(237,233,220,0.20)", borderRadius: 100, padding: "4px 12px" }}>
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {ai_analysis && (
              <div style={{ marginBottom: 40, padding: "24px 28px", border: "0.5px solid rgba(237,233,220,0.15)", borderRadius: 8, background: "rgba(237,233,220,0.02)" }}>
                <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 12 }}>aurora-analys</p>
                <h2 style={{ fontFamily: F, fontSize: "clamp(18px,2.5vw,26px)", color: C, marginBottom: 12, fontWeight: 400 }}>
                  Vad vi ser i era svar
                </h2>
                <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.75, color: "rgba(237,233,220,0.70)", marginBottom: 12 }}>
                  {ai_analysis.executive_summary}
                </p>
                <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", marginBottom: 16 }}>
                  <strong style={{ color: C }}>Mognadsläge: </strong>
                  {ai_analysis.maturity_note}
                </p>
                <div style={{ padding: "14px 18px", border: "0.5px solid rgba(237,233,220,0.15)", borderRadius: 6, background: "rgba(237,233,220,0.03)" }}>
                  <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>vår rekommendation</p>
                  <p style={{ fontFamily: I, fontSize: 13, color: C, lineHeight: 1.65 }}>
                    {ai_analysis.overall_recommendation}
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
              {top3.map((p, i) => {
                const Icon = solutionIcon(p.recommended_solution);
                const saved = p.saved_hours_per_week ?? 0;
                return (
                  <div key={`${p.position}-${i}`} style={{ border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 8, padding: "clamp(20px,3vw,32px)" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                        <div>
                          <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.40)", marginBottom: 8 }}>Topp {i + 1} · {p.potential}</p>
                          <h2 style={{ fontFamily: F, fontSize: "clamp(18px,2.5vw,26px)", color: C, fontWeight: 400, lineHeight: 1.1 }}>
                            {p.process_name}
                          </h2>
                        </div>
                        <span style={{ fontFamily: M, fontSize: 10, color: "rgba(237,233,220,0.40)", border: "0.5px solid rgba(237,233,220,0.15)", borderRadius: 100, padding: "4px 12px", whiteSpace: "nowrap" }}>
                          {p.score} p
                        </span>
                      </div>

                      {saved > 0 && (
                        <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.65)", marginBottom: 16 }}>
                          <strong style={{ color: C }}>~{saved} h/vecka</strong> kan automatiseras (≈ {Math.round(saved * 46)} h/år)
                        </p>
                      )}

                      <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.55)", marginBottom: 20 }}>
                        Görs <strong style={{ color: C }}>{FREQ_LABELS[p.frequency]?.toLowerCase()}</strong>,
                        tar uppskattningsvis <strong style={{ color: C }}>{TIME_LABELS[p.weekly_time]}</strong>.
                        {p.rule_based === "yes" && " Processen är regelstyrd – väl lämpad för automation."}
                        {p.rule_based === "partial" && " Processen är delvis regelstyrd – AI kan ta hand om merparten."}
                        {p.data_available === "yes" && " Datan finns redan i era system."}
                        {p.business_value === "high" && " Hög affärsnytta gör detta till ett tydligt första område."}
                      </p>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
                        <div style={{ border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 6, padding: "16px 18px" }}>
                          <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>aurora media bygger</p>
                          <p style={{ fontFamily: I, fontSize: 13, color: C, fontWeight: 500 }}>{p.recommended_solution}</p>
                        </div>
                        <div style={{ border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 6, padding: "16px 18px" }}>
                          <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>rekommenderat första steg</p>
                          <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.70)", lineHeight: 1.6 }}>{p.next_step}</p>
                        </div>
                      </div>

                      {(() => {
                        const ai = aiCaseFor(p.process_name);
                        if (!ai) return null;
                        return (
                          <div style={{ border: "0.5px solid rgba(237,233,220,0.10)", borderRadius: 6, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                            <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)" }}>djupare analys</p>
                            <div>
                              <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.30)", marginBottom: 6 }}>Varför just detta?</p>
                              <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.65)" }}>{ai.why_it_matters}</p>
                            </div>
                            <div>
                              <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.30)", marginBottom: 6 }}>Vad AI realistiskt kan ta över</p>
                              <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.65)" }}>{ai.deep_analysis}</p>
                            </div>
                            <div style={{ border: "0.5px solid rgba(237,233,220,0.08)", borderRadius: 4, padding: "12px 14px" }}>
                              <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.30)", marginBottom: 6 }}>Så skulle det kännas i vardagen</p>
                              <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.7, fontStyle: "italic", color: "rgba(237,233,220,0.60)" }}>{ai.concrete_example}</p>
                            </div>
                            {ai.quick_wins?.length > 0 && (
                              <div>
                                <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.30)", marginBottom: 8 }}>Snabba vinster ni kan testa själva</p>
                                {ai.quick_wins.map((qw, idx) => (
                                  <div key={idx} style={{ display: "flex", gap: 10, paddingBlock: 4 }}>
                                    <span style={{ fontFamily: M, fontSize: 10, color: "rgba(80,200,120,0.7)" }}>✓</span>
                                    <span style={{ fontFamily: I, fontSize: 13, lineHeight: 1.65, color: "rgba(237,233,220,0.65)" }}>{qw}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div>
                              <p style={{ fontFamily: M, fontSize: 9, letterSpacing: "0.08em", color: "rgba(237,233,220,0.30)", marginBottom: 6 }}>Att vara uppmärksam på</p>
                              <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.7, color: "rgba(237,233,220,0.50)" }}>{ai.risks}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ height: "0.5px", background: "rgba(237,233,220,0.12)", marginBottom: "clamp(32px,5vw,48px)" }} />
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 12 }}>era nästa 30 dagar</p>
              <h2 style={{ fontFamily: F, fontStyle: "italic", fontSize: "clamp(22px,3vw,36px)", color: C, letterSpacing: "-0.015em", marginBottom: 12 }}>
                Vill ni att vi bygger första piloten åt er?
              </h2>
              <p style={{ fontFamily: I, fontSize: 13, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", maxWidth: 520, marginBottom: 20 }}>
                Boka en kostnadsfri AI-genomlysning (45 min). Vi går igenom era svar live, pekar ut bästa första pilot och ger en uppskattning av lösning, tid och kostnad. Inga köpkrav.
              </p>
              {totalSavedPerYear > 0 && (
                <p style={{ fontFamily: I, fontSize: 13, color: "rgba(237,233,220,0.65)", marginBottom: 20 }}>
                  Med era topp-3 case kan ni spara cirka <strong style={{ color: C }}>{totalSavedPerYear} timmar/år</strong> — ungefär <strong style={{ color: C }}>{Math.round((totalSavedPerYear * 600) / 1000)} 000 kr</strong> i frigjord arbetstid.
                </p>
              )}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" onClick={openBooking} className="btn-primary">
                  Boka kostnadsfri genomlysning →
                </button>
                <button type="button" onClick={handlePrint} className="btn-ghost" style={{ fontSize: 13 }}>
                  Ladda ner PDF-analys
                </button>
                <button type="button" onClick={handleResend} disabled={sending} className="btn-ghost" style={{ fontSize: 13 }}>
                  {sending ? "Skickar…" : "Mejla mig analysen"}
                </button>
              </div>
              <p style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.30)", marginTop: 16 }}>
                En kopia skickades redan till <strong style={{ color: "rgba(237,233,220,0.50)" }}>{meta.email}</strong> direkt efter formuläret.
              </p>
            </div>

            <p style={{ fontFamily: I, fontSize: 12, color: "rgba(237,233,220,0.30)", lineHeight: 1.6, textAlign: "center", marginBottom: 32 }}>
              Mini-analysen är automatiskt genererad och ska ses som en första indikation.
              Tidsbesparing är en uppskattning baserad på era svar – exakt scope kräver genomgång av processer, system och data.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />

      <Dialog
        open={bookingOpen}
        onOpenChange={(o) => {
          if (!o && bookingStatus === "submitting") return;
          setBookingOpen(o);
          if (!o) {
            // reset success state next time it opens
            setTimeout(() => {
              if (bookingStatus === "success") {
                setBookingStatus("idle");
              }
            }, 200);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {bookingStatus === "success" ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary ring-4 ring-primary/10">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <DialogHeader className="mt-4">
                <DialogTitle className="text-center text-2xl">Tack – vi hör av oss!</DialogTitle>
                <DialogDescription className="text-center">
                  Vi har tagit emot din förfrågan och skickar en kalenderinbjudan inom kort
                  (oftast samma arbetsdag) till{" "}
                  <strong className="text-foreground">{bookForm.email}</strong>.
                </DialogDescription>
              </DialogHeader>
              <p className="mt-4 text-xs text-muted-foreground">
                Brådskar det? Mejla{" "}
                <a href="mailto:info@auroramedia.se" className="text-primary underline-offset-2 hover:underline">
                  info@auroramedia.se
                </a>
                .
              </p>
              <DialogFooter className="mt-6 sm:justify-center">
                <Button onClick={() => setBookingOpen(false)} className="w-full sm:w-auto">
                  Stäng
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Boka kostnadsfri AI-genomlysning</DialogTitle>
                <DialogDescription>
                  Fyll i uppgifterna så återkommer vi med en kalenderinbjudan (45 min via Teams/Meet).
                  Inga köpkrav.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={submitBooking} className="mt-2 space-y-4" noValidate>
                {/* honeypot */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <Label htmlFor="book-website">Webbplats</Label>
                  <Input
                    id="book-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={bookForm.website}
                    onChange={(e) => setBookForm((f) => ({ ...f, website: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="book-name" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Namn
                  </Label>
                  <Input
                    id="book-name"
                    value={bookForm.name}
                    onChange={(e) => setBookForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1 h-11 rounded-full text-base"
                    disabled={bookingStatus === "submitting"}
                    required
                  />
                  {bookFieldErrors.name && (
                    <p className="mt-1 text-xs text-destructive">{bookFieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="book-email" className="text-xs uppercase tracking-wider text-muted-foreground">
                    E-post
                  </Label>
                  <Input
                    id="book-email"
                    type="email"
                    value={bookForm.email}
                    onChange={(e) => setBookForm((f) => ({ ...f, email: e.target.value }))}
                    className="mt-1 h-11 rounded-full text-base"
                    disabled={bookingStatus === "submitting"}
                    required
                  />
                  {bookFieldErrors.email && (
                    <p className="mt-1 text-xs text-destructive">{bookFieldErrors.email}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="book-phone" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Telefon (valfritt)
                    </Label>
                    <Input
                      id="book-phone"
                      value={bookForm.phone}
                      onChange={(e) => setBookForm((f) => ({ ...f, phone: e.target.value }))}
                      className="mt-1 h-11 rounded-full text-base"
                      disabled={bookingStatus === "submitting"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="book-time" className="text-xs uppercase tracking-wider text-muted-foreground">
                      Önskad tid (valfritt)
                    </Label>
                    <Input
                      id="book-time"
                      placeholder="t.ex. tis/tor em"
                      value={bookForm.preferred_time}
                      onChange={(e) => setBookForm((f) => ({ ...f, preferred_time: e.target.value }))}
                      className="mt-1 h-11 rounded-full text-base"
                      disabled={bookingStatus === "submitting"}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="book-message" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Meddelande (valfritt)
                  </Label>
                  <Textarea
                    id="book-message"
                    rows={3}
                    placeholder="Något särskilt vi bör veta inför mötet?"
                    value={bookForm.message}
                    onChange={(e) => setBookForm((f) => ({ ...f, message: e.target.value }))}
                    className="mt-1 rounded-2xl"
                    disabled={bookingStatus === "submitting"}
                  />
                </div>

                {bookingErr && (
                  <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/[0.08] p-3 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{bookingErr}</p>
                  </div>
                )}

                <DialogFooter className="mt-2 gap-2 sm:gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setBookingOpen(false)}
                    disabled={bookingStatus === "submitting"}
                    className="w-full sm:w-auto"
                  >
                    Avbryt
                  </Button>
                  <Button
                    type="submit"
                    disabled={bookingStatus === "submitting"}
                    className="w-full rounded-full sm:w-auto"
                  >
                    {bookingStatus === "submitting" ? (
                      <>
                        Skickar… <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Skicka bokningsförfrågan <CalendarCheck className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function StatCard({
  label, value, sub,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const F3 = "'Fraunces',Georgia,serif";
  const I3 = "'Inter',system-ui,sans-serif";
  const M3 = "'JetBrains Mono',ui-monospace,monospace";
  const C3 = "#EDE9DC";
  return (
    <div style={{ border: "0.5px solid rgba(237,233,220,0.12)", borderRadius: 6, padding: "16px 18px" }}>
      <p style={{ fontFamily: M3, fontSize: 9, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: F3, fontSize: "clamp(20px,2.5vw,28px)", color: C3, fontWeight: 400 }}>{value}</p>
      {sub && <p style={{ fontFamily: I3, fontSize: 12, color: "rgba(237,233,220,0.40)", marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function ResultStateScreen({
  kind,
  message,
  onPrimary,
  onSecondary,
}: {
  kind: "loading" | "missing" | "error";
  message?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}) {
  const config = {
    loading: {
      Icon: Loader2,
      iconClass: "text-primary animate-spin",
      ring: "border-primary/30 bg-primary/[0.08]",
      label: "Bearbetar er AI-karta",
      title: "Vi sätter ihop er mini-analys…",
      body:
        "Vi kör era svar genom Aurora-modellen, räknar fram tidsbesparing och identifierar topp-3 områden. Det tar oftast bara några sekunder.",
    },
    missing: {
      Icon: Sparkles,
      iconClass: "text-primary",
      ring: "border-primary/30 bg-primary/[0.08]",
      label: "Inget resultat hittades",
      title: "Vi hittar ingen ifylld AI-karta",
      body:
        "Det verkar som att du landade här utan att ha fyllt i formuläret – eller så har sessionen gått ut. Starta om analysen så bygger vi ett nytt resultat på under två minuter.",
    },
    error: {
      Icon: AlertTriangle,
      iconClass: "text-amber-400",
      ring: "border-amber-400/30 bg-amber-400/[0.08]",
      label: "Något gick fel",
      title: "Vi kunde inte ladda ert resultat",
      body:
        message ||
        "Något gick fel när vi försökte hämta er analys. Det kan vara ett tillfälligt problem – försök igen, eller starta om formuläret.",
    },
  }[kind];

  const F2 = "'Fraunces',Georgia,serif";
  const I2 = "'Inter',system-ui,sans-serif";
  const M2 = "'JetBrains Mono',ui-monospace,monospace";
  const C2 = "#EDE9DC";
  return (
    <div style={{ backgroundColor: "#100F0D", minHeight: "100vh" }}>
      <a href="#main" className="skip-link">Hoppa till innehåll</a>
      <SiteHeader />
      <main id="main" style={{ paddingTop: "clamp(120px,14vw,160px)", paddingBottom: "clamp(56px,8vw,88px)" }}>
        <div className="wrap" style={{ maxWidth: 600, textAlign: "center" }}>
          <p style={{ fontFamily: M2, fontSize: 10, letterSpacing: "0.1em", color: "rgba(237,233,220,0.35)", marginBottom: 16 }}>{config.label}</p>
          <h1 style={{ fontFamily: F2, fontSize: "clamp(24px,4vw,40px)", color: C2, fontWeight: 400, marginBottom: 12, letterSpacing: "-0.02em" }}>
            {config.title}
          </h1>
          <p style={{ fontFamily: I2, fontSize: 14, lineHeight: 1.75, color: "rgba(237,233,220,0.55)", marginBottom: 32 }}>
            {config.body}
          </p>
          {kind !== "loading" && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={onPrimary} className="btn-primary">
                {kind === "missing" ? "Starta AI-kartan →" : "Tillbaka till start →"}
              </button>
              {kind === "error" && onSecondary && (
                <button type="button" onClick={onSecondary} className="btn-ghost">Försök igen</button>
              )}
            </div>
          )}
          {kind === "error" && (
            <p style={{ fontFamily: I2, fontSize: 12, color: "rgba(237,233,220,0.35)", marginTop: 24 }}>
              Mejla{" "}
              <a href="mailto:info@auroramedia.se" style={{ color: C2 }}>
                info@auroramedia.se
              </a>{" "}
              om problemet kvarstår.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default AiKartaResultat;

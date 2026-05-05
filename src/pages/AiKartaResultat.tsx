import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, CheckCircle2, Clock, Database, Download, Loader2, Mail,
  RefreshCw, Sparkles, Target, TrendingUp, Workflow, Zap,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { setSEOMeta } from "@/lib/seoHelpers";
import { AiMapResult, FREQ_LABELS, TIME_LABELS } from "@/lib/aiMap";
import { downloadAiMapPdf } from "@/lib/aiMapPdf";
import { trackAiKartaClick } from "@/lib/aiKartaTracking";
import { supabase } from "@/integrations/supabase/client";

const RESULT_KEY = "ai_map_result";

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

  useEffect(() => {
    setSEOMeta({
      title: "Er AI-karta · Resultat | Aurora Media",
      description: "Mini-analys av era topp-3 AI-case och rekommenderat nästa steg.",
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
    void trackAiKartaClick("result_pdf_download");
    toast.message("PDF-version öppnas", {
      description: "Välj 'Spara som PDF' i utskriftsdialogen.",
    });
    setTimeout(() => {
      void trackAiKartaClick("result_print_dialog_opened");
      window.print();
    }, 250);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="overflow-hidden">
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_30%)]" />
          <div className="container mx-auto max-w-4xl px-6">
            <Reveal>
              <p className="label-caps">Mini-analys för {meta.company_name}</p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,5rem)] font-bold leading-[0.95] tracking-tight">
                Ni har <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{lead}</span> {tail}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Baserat på era svar har vi identifierat {top3.length} processer där AI och automation
                kan göra störst skillnad. Här är en första uppskattning – inte en exakt lösningsdesign.
              </p>

              {/* Konkreta värdesiffror, inte abstrakta poäng */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
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
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Era utmaningsområden:
                  </span>
                  {pain_areas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1 text-xs text-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </Reveal>

            {ai_analysis && (
              <Reveal y={18}>
                <div className="mt-10 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.10] via-primary/[0.04] to-transparent p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="label-caps text-primary">Aurora-analys</p>
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                    Vad vi ser i era svar
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
                    {ai_analysis.executive_summary}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">Mognadsläge: </strong>
                    {ai_analysis.maturity_note}
                  </p>
                  <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/[0.08] p-4">
                    <p className="text-[11px] uppercase tracking-wider text-primary">
                      Vår rekommendation
                    </p>
                    <p className="mt-2 text-sm text-foreground sm:text-base">
                      {ai_analysis.overall_recommendation}
                    </p>
                  </div>
                </div>
              </Reveal>
            )}

            <div className="mt-12 space-y-5">
              {top3.map((p, i) => {
                const Icon = solutionIcon(p.recommended_solution);
                const saved = p.saved_hours_per_week ?? 0;
                return (
                  <Reveal key={`${p.position}-${i}`} y={18}>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="label-caps text-primary">Topp {i + 1}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs font-medium text-muted-foreground">{p.potential}</span>
                          </div>
                          <h2 className="mt-2 font-display text-2xl font-bold leading-tight break-words sm:text-3xl">
                            {p.process_name}
                          </h2>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r ${
                            potentialColor[
                              p.potential.includes("Hög") || p.potential.includes("Direkt")
                                ? "Hög"
                                : p.potential.includes("Medel")
                                ? "Medel"
                                : "Låg"
                            ] ?? "from-primary to-primary/60"
                          } px-3 py-1 text-xs font-semibold text-primary-foreground sm:px-4 sm:py-1.5 sm:text-sm`}
                        >
                          <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {p.score} p
                        </span>
                      </div>

                      {/* Konkret tidsvärde per case */}
                      {saved > 0 && (
                        <div className="mt-4 flex w-full items-start gap-2 rounded-2xl border border-primary/30 bg-primary/[0.08] px-3 py-2 sm:inline-flex sm:w-auto sm:items-center sm:rounded-full sm:py-1.5">
                          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary sm:mt-0" />
                          <span className="text-xs leading-relaxed sm:text-sm">
                            <strong className="text-foreground">~{saved} h/vecka</strong>
                            <span className="text-muted-foreground"> kan automatiseras (≈ {Math.round(saved * 46)} h/år)</span>
                          </span>
                        </div>
                      )}

                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        Görs <strong className="text-foreground">{FREQ_LABELS[p.frequency].toLowerCase()}</strong>,
                        tar uppskattningsvis <strong className="text-foreground">{TIME_LABELS[p.weekly_time]}</strong>.
                        {p.rule_based === "yes" && " Processen är regelstyrd – väl lämpad för automation."}
                        {p.rule_based === "partial" && " Processen är delvis regelstyrd – AI kan ta hand om merparten."}
                        {p.data_available === "yes" && " Datan finns redan i era system."}
                        {p.business_value === "high" && " Hög affärsnytta gör detta till ett tydligt första case."}
                      </p>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <p className="text-[11px] uppercase tracking-wider text-primary">Aurora Media bygger</p>
                          </div>
                          <p className="mt-2 font-semibold text-foreground">{p.recommended_solution}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Rekommenderat första steg</p>
                          </div>
                          <p className="mt-2 text-sm text-foreground">{p.next_step}</p>
                        </div>
                      </div>

                      {(() => {
                        const ai = aiCaseFor(p.process_name);
                        if (!ai) return null;
                        return (
                          <div className="mt-6 space-y-4 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              <p className="text-[11px] uppercase tracking-wider text-primary">
                                Djupare analys
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Varför just detta?
                              </p>
                              <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                                {ai.why_it_matters}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Vad AI realistiskt kan ta över
                              </p>
                              <p className="mt-1 text-sm leading-relaxed text-foreground/90">
                                {ai.deep_analysis}
                              </p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/40 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Så skulle det kännas i vardagen
                              </p>
                              <p className="mt-1 text-sm italic leading-relaxed text-foreground/80">
                                {ai.concrete_example}
                              </p>
                            </div>
                            {ai.quick_wins?.length > 0 && (
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Quick wins ni kan testa själva
                                </p>
                                <ul className="mt-2 space-y-1.5">
                                  {ai.quick_wins.map((qw, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
                                    >
                                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                      <span>{qw}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">
                                Att vara uppmärksam på
                              </p>
                              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                {ai.risks}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* CTA */}
            <Reveal y={18}>
              <div className="mt-14 rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary/[0.12] via-primary/[0.05] to-transparent p-8 sm:p-12 shadow-[0_30px_80px_-40px_hsl(var(--primary)/0.5)]">
                <div className="grid gap-6 sm:grid-cols-[1.4fr_1fr] sm:items-center">
                  <div>
                    <p className="label-caps text-primary">Nästa steg</p>
                    <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                      Vill ni veta exakt vad som bör byggas först?
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Boka en kostnadsfri AI-genomlysning (45 min). Vi går igenom era svar,
                      pekar ut bästa första pilot och ger en uppskattning av lösning, tid och kostnad.
                      En kopia av analysen skickades till <strong className="text-foreground">{meta.email}</strong> direkt
                      efter att ni fyllde i formuläret – behöver ni en till kopia kan ni begära den nedan.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button asChild size="lg" className="rounded-full">
                      <Link to="/kontakt">
                        Boka kostnadsfri AI-genomlysning <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="rounded-full"
                      onClick={handleResend}
                      disabled={sending}
                      aria-label={`Skicka analysen till ${meta.email}`}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {sending ? "Skickar…" : `Skicka analysen till ${meta.email}`}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full"
                      onClick={handlePrint}
                    >
                      Ladda ner som PDF <Download className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>

            <p className="mt-10 text-center text-xs text-muted-foreground">
              Mini-analysen är automatiskt genererad och ska ses som en första indikation.
              Tidsbesparing är en uppskattning baserad på era svar – exakt scope kräver genomgång av processer, system och data.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

function StatCard({
  label, value, sub, highlight, icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border p-4 sm:p-5 ${
        highlight
          ? "border-primary/30 bg-primary/[0.08]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start gap-2">
        {Icon && (
          <Icon
            className={`mt-0.5 h-4 w-4 shrink-0 ${
              highlight ? "text-primary" : "text-muted-foreground"
            }`}
          />
        )}
        <p className="text-[11px] uppercase leading-tight tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <p
        className={`mt-2 font-display text-2xl font-bold leading-tight break-words sm:text-3xl ${
          highlight ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
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
        "Vi kör era svar genom Aurora-modellen, räknar fram tidsbesparing och identifierar topp-3 case. Det tar oftast bara några sekunder.",
    },
    missing: {
      Icon: Sparkles,
      iconClass: "text-primary",
      ring: "border-primary/30 bg-primary/[0.08]",
      label: "Inget resultat hittades",
      title: "Vi hittar ingen ifylld AI-karta",
      body:
        "Det verkar som att du landade här utan att ha fyllt i formuläret – eller så har sessionen gått ut. Starta om analysen så bygger vi ett nytt resultat på under 2 minuter.",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="overflow-hidden">
        <section className="relative pt-28 pb-24 md:pt-36 md:pb-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_30%)]" />
          <div className="container mx-auto max-w-2xl px-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)] sm:p-12">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${config.ring}`}>
                <config.Icon className={`h-7 w-7 ${config.iconClass}`} />
              </div>
              <p className="label-caps mt-6 text-primary">{config.label}</p>
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
                {config.title}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {config.body}
              </p>

              {kind === "loading" && (
                <div className="mt-8 space-y-3">
                  <div className="mx-auto h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
                  <div className="mx-auto h-3 w-full animate-pulse rounded-full bg-white/10" />
                  <div className="mx-auto h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
                </div>
              )}

              {kind !== "loading" && (
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button onClick={onPrimary} size="lg" className="w-full sm:w-auto">
                    {kind === "missing" ? "Starta AI-kartan" : "Tillbaka till start"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  {kind === "error" && onSecondary && (
                    <Button onClick={onSecondary} size="lg" variant="outline" className="w-full sm:w-auto">
                      <RefreshCw className="mr-2 h-4 w-4" /> Försök igen
                    </Button>
                  )}
                </div>
              )}

              {kind === "error" && (
                <p className="mt-6 text-xs text-muted-foreground">
                  Problemet kvarstår? Mejla{" "}
                  <a href="mailto:info@auroramedia.se" className="text-primary underline-offset-4 hover:underline">
                    info@auroramedia.se
                  </a>{" "}
                  så hjälper vi er direkt.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AiKartaResultat;

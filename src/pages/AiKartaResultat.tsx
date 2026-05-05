import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, Clock, Database, Download,
  Sparkles, Target, TrendingUp, Workflow, Zap,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { setSEOMeta } from "@/lib/seoHelpers";
import { AiMapResult, FREQ_LABELS, TIME_LABELS } from "@/lib/aiMap";

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

const AiKartaResultat = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<AiMapResult | null>(null);

  useEffect(() => {
    setSEOMeta({
      title: "Er AI-karta · Resultat | Aurora Media",
      description: "Mini-analys av era topp-3 AI-case och rekommenderat nästa steg.",
      canonical: "https://auroramedia.se/ai-karta/resultat",
      noindex: true,
    });
    try {
      const raw = sessionStorage.getItem(RESULT_KEY);
      if (raw) setResult(JSON.parse(raw) as AiMapResult);
      else navigate("/ai-karta/start", { replace: true });
    } catch {
      navigate("/ai-karta/start", { replace: true });
    }
  }, [navigate]);

  if (!result) return null;

  const {
    total_potential, top3, totalScore, meta,
    totalSavedPerWeek = 0, totalSavedPerYear = 0, pain_areas = [],
  } = result;
  const { lead, tail } = buildHeadline(total_potential);

  const handlePrint = () => {
    toast.message("PDF-version öppnas", {
      description: "Välj 'Spara som PDF' i utskriftsdialogen.",
    });
    setTimeout(() => window.print(), 250);
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

            <div className="mt-12 space-y-5">
              {top3.map((p, i) => {
                const Icon = solutionIcon(p.recommended_solution);
                const saved = p.saved_hours_per_week ?? 0;
                return (
                  <Reveal key={`${p.position}-${i}`} y={18}>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)]">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="label-caps text-primary">Topp {i + 1}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs font-medium text-muted-foreground">{p.potential}</span>
                          </div>
                          <h2 className="mt-2 font-display text-3xl font-bold break-words">
                            {p.process_name}
                          </h2>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${
                            potentialColor[
                              p.potential.includes("Hög") || p.potential.includes("Direkt")
                                ? "Hög"
                                : p.potential.includes("Medel")
                                ? "Medel"
                                : "Låg"
                            ] ?? "from-primary to-primary/60"
                          } px-4 py-1.5 text-sm font-semibold text-primary-foreground`}
                        >
                          <TrendingUp className="h-3.5 w-3.5" /> {p.score} p
                        </span>
                      </div>

                      {/* Konkret tidsvärde per case */}
                      {saved > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm">
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
                      En kopia av analysen är skickad till <strong className="text-foreground">{meta.email}</strong>.
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
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-primary/30 bg-primary/[0.08]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />}
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className={`mt-2 font-display text-3xl font-bold ${highlight ? "text-primary" : ""}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default AiKartaResultat;

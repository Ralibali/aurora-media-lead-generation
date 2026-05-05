import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Mail, Sparkles, TrendingUp } from "lucide-react";
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

  const { total_potential, top3, totalScore, avg, meta } = result;
  const headline = `Er AI-karta visar ${total_potential.toLowerCase() === "låg" ? "låg" : total_potential} AI-potential`;

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
                {headline}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Baserat på era svar finns det flera möjligheter att minska manuellt arbete med AI och automation.
                Här är de tre case som verkar mest intressanta att börja med.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <StatCard label="Total potential" value={total_potential} highlight />
                <StatCard label="Snittpoäng" value={avg.toFixed(1)} />
                <StatCard label="Total poäng" value={String(totalScore)} />
              </div>
            </Reveal>

            <div className="mt-12 space-y-5">
              {top3.map((p, i) => (
                <Reveal key={`${p.position}-${i}`} y={18}>
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="label-caps text-primary">Topp {i + 1} · {p.potential}</p>
                        <h2 className="mt-2 font-display text-3xl font-bold">{p.process_name}</h2>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${
                          potentialColor[p.potential] ?? "from-primary to-primary/60"
                        } px-4 py-1.5 text-sm font-semibold text-primary-foreground`}
                      >
                        <TrendingUp className="h-3.5 w-3.5" /> {p.score} p
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      Görs <strong className="text-foreground">{FREQ_LABELS[p.frequency].toLowerCase()}</strong>,
                      tar uppskattningsvis <strong className="text-foreground">{TIME_LABELS[p.weekly_time]}</strong>.
                      {p.rule_based === "yes" && " Processen är regelstyrd – väl lämpad för automation."}
                      {p.rule_based === "partial" && " Processen är delvis regelstyrd – AI kan ta hand om merparten."}
                      {p.data_available === "yes" && " Datan finns redan tillgänglig i era system."}
                      {p.business_value === "high" && " Hög affärsnytta gör detta till ett tydligt första case."}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
                        <p className="text-[11px] uppercase tracking-wider text-primary">Aurora Media bygger</p>
                        <p className="mt-2 font-semibold text-foreground">{p.recommended_solution}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Rekommenderat första steg</p>
                        <p className="mt-2 text-sm text-foreground">{p.next_step}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
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
                      Boka en kostnadsfri AI-genomlysning. Vi går igenom era svar, pekar ut bästa första pilot och ger en uppskattning av lösning, tid och kostnad.
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
                      onClick={() =>
                        toast.success(
                          "Resultatet har sparats. Aurora Media kan följa upp via e-post på " + meta.email + "."
                        )
                      }
                    >
                      Skicka resultatet till min e-post <Mail className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>

            <p className="mt-10 text-center text-xs text-muted-foreground">
              Mini-analysen är automatiskt genererad och ska ses som en första indikation. För exakt scope krävs genomgång av processer, system och data.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-primary/30 bg-primary/[0.08]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${highlight ? "text-primary" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export default AiKartaResultat;

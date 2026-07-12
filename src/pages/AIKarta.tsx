import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { SEO, SITE_URL } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { trackEvent } from "@/lib/analytics";
import { Reveal, VkFooter, VkNav } from "./Index";

const QUESTIONS = [
  {
    key: "bransch",
    label: "Vilken typ av verksamhet driver ni?",
    options: ["Bygg och hantverk", "Transport och logistik", "Besöksnäring", "Handel och e-handel", "Konsult och tjänsteföretag", "Tillverkning", "Vård och omsorg", "Annat"],
  },
  {
    key: "storlek",
    label: "Hur många arbetar i verksamheten?",
    options: ["1–5", "6–20", "21–50", "51–200", "Fler än 200"],
  },
  {
    key: "flaskhals",
    label: "Vad tar mest onödig tid idag?",
    options: ["Offerter och dokument", "Mejl och kundfrågor", "Bokning och påminnelser", "Rapportering och Excel", "Order, lager eller logistik", "Administration mellan flera system", "Vet inte ännu"],
  },
  {
    key: "tid",
    label: "Ungefär hur mycket tid försvinner varje vecka?",
    options: ["Mindre än 5 timmar", "5–10 timmar", "10–25 timmar", "25–50 timmar", "Mer än 50 timmar"],
  },
  {
    key: "system",
    label: "Vilka system arbetar ni mest i?",
    options: ["Fortnox", "Visma", "Microsoft 365", "Google Workspace", "CRM eller affärssystem", "Flera olika system", "Mest mejl och Excel"],
  },
  {
    key: "mal",
    label: "Vad skulle ge störst affärsnytta?",
    options: ["Spara arbetstid", "Få fler leads", "Svara kunder snabbare", "Minska fel och dubbelarbete", "Skapa en ny digital tjänst", "Få bättre kontroll och data"],
  },
  {
    key: "lage",
    label: "Hur långt har ni kommit?",
    options: ["Vi undersöker möjligheterna", "Vi har ett tydligt problem", "Vi har en färdig idé", "Vi har testat verktyg själva", "Vi behöver ersätta ett befintligt system"],
  },
  {
    key: "start",
    label: "När vill ni helst börja?",
    options: ["Så snart som möjligt", "Inom 1–2 månader", "Inom ett kvartal", "Senare i år", "Vi vill först förstå potentialen"],
  },
] as const;

type AnswerKey = (typeof QUESTIONS)[number]["key"];
type Answers = Partial<Record<AnswerKey, string>>;

const GROUP_SIZE = 4;

const AIKarta = () => {
  const { open } = useContactModal();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const groups = Math.ceil(QUESTIONS.length / GROUP_SIZE);
  const visibleQuestions = QUESTIONS.slice(step * GROUP_SIZE, step * GROUP_SIZE + GROUP_SIZE);
  const completed = Object.keys(answers).length;
  const progress = Math.round((completed / QUESTIONS.length) * 100);

  const canContinue = visibleQuestions.every((question) => Boolean(answers[question.key]));

  const summary = useMemo(() => {
    const compactLabels: Record<AnswerKey, string> = {
      bransch: "Bransch",
      storlek: "Storlek",
      flaskhals: "Flaskhals",
      tid: "Tid/vecka",
      system: "System",
      mal: "Mål",
      lage: "Nuläge",
      start: "Start",
    };

    return QUESTIONS.map((question) => `${compactLabels[question.key]}: ${answers[question.key] ?? "-"}`).join(" · ").slice(0, 490);
  }, [answers]);

  const selectAnswer = (key: AnswerKey, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const continueAssessment = (event: FormEvent) => {
    event.preventDefault();
    if (!canContinue) return;

    if (step < groups - 1) {
      if (step === 0) trackEvent("ai_karta_start", { source: "AIKarta" });
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    trackEvent("ai_karta_complete", {
      source: "AIKarta",
      bransch: answers.bransch ?? "",
      flaskhals: answers.flaskhals ?? "",
    });

    open({
      paket: "Vet inte",
      internalNote: `AI-karta genomförd. ${summary}`,
    });
  };

  return (
    <>
      <SEO
        title="AI-kartan – gratis AI-kartläggning för svenska företag"
        description="Svara på 8 frågor och få ett konkret första beslutsunderlag för vilka processer ni bör automatisera med AI. Gratis och utan bindningstid."
        canonical="/ai-karta"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "AI-kartan",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: `${SITE_URL}/ai-karta`,
            description: "Gratis AI-kartläggning för svenska företag som vill identifiera rätt process att automatisera först.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "SEK" },
            provider: { "@id": `${SITE_URL}/#organization` },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Kostar AI-kartan något?",
                acceptedAnswer: { "@type": "Answer", text: "Nej. Kartläggningen är kostnadsfri och innebär ingen bindningstid." },
              },
              {
                "@type": "Question",
                name: "Måste vi boka ett säljmöte?",
                acceptedAnswer: { "@type": "Answer", text: "Nej. Ni väljer själva om ni vill ta nästa steg efter kartläggningen." },
              },
            ],
          },
        ]}
      />

      <div className="verkstad">
        <VkNav />
        <main>
          <section className="vk-section vk-hero" style={{ minHeight: "auto" }}>
            <div className="vk-wrap" style={{ maxWidth: 980 }}>
              <Reveal>
                <p className="vk-mono">Gratis verktyg · 8 frågor · cirka 2 minuter</p>
                <h1 style={{ marginTop: 20, maxWidth: "16ch" }}>
                  Hitta processen där AI ger <span className="accent">störst effekt först.</span>
                </h1>
                <p className="vk-hero-sub" style={{ maxWidth: "62ch" }}>
                  Besvara åtta raka frågor. Jag använder svaren för att ge er en konkret första bedömning av vad som är värt att automatisera, vad som bör vänta och vilket nästa steg som är rimligt.
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="vk-panel" style={{ marginTop: 36 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <span className="vk-mono">Steg {step + 1} av {groups}</span>
                      <p style={{ marginTop: 8, color: "var(--granbark-mut)" }}>{completed} av {QUESTIONS.length} frågor besvarade</p>
                    </div>
                    <strong style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{progress}%</strong>
                  </div>

                  <div aria-hidden="true" style={{ height: 8, borderRadius: 999, background: "rgba(31,78,61,.12)", overflow: "hidden", marginTop: 18 }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: "var(--gran)", transition: "width .25s ease" }} />
                  </div>

                  <form onSubmit={continueAssessment} style={{ marginTop: 30 }}>
                    <div style={{ display: "grid", gap: 28 }}>
                      {visibleQuestions.map((question, index) => (
                        <fieldset key={question.key} style={{ border: 0, padding: 0, margin: 0 }}>
                          <legend style={{ fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
                            {step * GROUP_SIZE + index + 1}. {question.label}
                          </legend>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
                            {question.options.map((option) => {
                              const selected = answers[question.key] === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => selectAnswer(question.key, option)}
                                  aria-pressed={selected}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    minHeight: 54,
                                    padding: "12px 14px",
                                    borderRadius: 8,
                                    border: selected ? "2px solid var(--gran)" : "1px solid rgba(31,78,61,.2)",
                                    background: selected ? "rgba(31,78,61,.08)" : "rgba(255,255,255,.55)",
                                    color: "var(--granbark)",
                                    textAlign: "left",
                                    cursor: "pointer",
                                  }}
                                >
                                  <span>{option}</span>
                                  {selected && <Check size={17} strokeWidth={3} />}
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
                      {step > 0 ? (
                        <button type="button" className="vk-btn vk-btn-ghost" onClick={() => setStep((current) => current - 1)}>
                          <ArrowLeft size={15} /> Tillbaka
                        </button>
                      ) : <span />}
                      <button type="submit" className="vk-btn vk-btn-primary" disabled={!canContinue} style={{ opacity: canContinue ? 1 : 0.45 }}>
                        {step < groups - 1 ? "Fortsätt" : "Få min kostnadsfria bedömning"} <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              </Reveal>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16, marginTop: 24 }}>
                {[
                  [Clock, "Cirka 2 minuter", "Inga workshops eller långa formulär."],
                  [ShieldCheck, "Ingen bindning", "Ni väljer själva om ni vill gå vidare."],
                  [Sparkles, "Byggt för småföretag", "Fokus på verkliga flöden och mätbar nytta."],
                ].map(([Icon, title, text]) => {
                  const IconComponent = Icon as typeof Clock;
                  return (
                    <div key={String(title)} className="vk-receipt" style={{ minHeight: 0 }}>
                      <IconComponent size={20} />
                      <h2 style={{ fontSize: 18, marginTop: 12 }}>{String(title)}</h2>
                      <p style={{ marginTop: 6, color: "var(--granbark-mut)" }}>{String(text)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default AIKarta;

import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Clock3,
  Gauge,
  Sparkles,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setJsonLd, setBreadcrumb } from "@/lib/seoHelpers";

// — Conversion-driven copy. Specifika siffror > vaga löften. —

const proofStats = [
  { value: "5–15 h", label: "sparat per anställd och vecka", sub: "i typiska AI-piloter som vi byggt" },
  { value: "10 min", label: "att fylla i online", sub: "klart innan ditt nästa möte" },
  { value: "0 kr", label: "för analysen", sub: "och inget säljmöte krävs" },
];

const valueStack = [
  { icon: Target, title: "Personlig topp-3-analys", body: "Vilka av era processer som ger störst effekt först – inte en generisk lista." },
  { icon: Clock, title: "Konkret tidsbesparing i timmar", body: "Beräknat per process, per vecka och per år. Lätt att räkna ROI på." },
  { icon: Workflow, title: "Förslag på lösning per område", body: "AI-assistent, automation, dashboard, internt system eller integration – med motivering." },
  { icon: Sparkles, title: "Djupanalys av Aurora-analysen", body: "Snabb vinsts, risker att hantera och en rekommenderad ordning på pilotprojekten." },
  { icon: ShieldCheck, title: "Innehållsrik PDF att dela internt", body: "Snyggt formaterad, byggd för att ta med till ledningsmöte eller workshop med personalen." },
  { icon: Zap, title: "Metodguide: Så automatiserar ni", body: "Aurora Medias 6-stegsmetod för att gå från idé till driftsatt AI-lösning på 2–4 veckor." },
];

const objections = [
  {
    q: "Vi är inte tekniska – förstår vi ens svaren?",
    a: "Ja. Allt är på vanlig svenska, utan AI-jargong. Du svarar på frågor om hur ni jobbar idag – vi översätter till lösningar.",
  },
  {
    q: "Är det här bara ett sätt att fånga in leads för att ringa oss sen?",
    a: "Nej. Ni får hela analysen och PDF:en direkt på skärmen, utan säljmöte. Vill ni boka en genomlysning är det helt frivilligt – och alltid kostnadsfritt.",
  },
  {
    q: "Vi har redan testat ChatGPT, behöver vi det här?",
    a: "ChatGPT är ett verktyg. AI-kartan handlar om VAD i er verksamhet som faktiskt sparar tid och pengar att automatisera – och i vilken ordning. Det är skillnaden mellan att leka med AI och att tjäna på det.",
  },
  {
    q: "Hur vet ni vad som passar just oss?",
    a: "Analysen är byggd på era egna svar om frekvens, tidsåtgång, regelstyrning, datatillgång och affärsvärde – samma kriterier som vi använder med betalande kunder.",
  },
];

const steps = [
  { icon: Sparkles, title: "1. Fyll i AI-kartan online", body: "5–10 minuter. Lista era vanligaste tidskrävande processer.", time: "5–10 min" },
  { icon: Gauge, title: "2. Få mini-analys direkt", body: "Topp-3 områden, tidsbesparing, lösningsförslag och AI-djupanalys – på skärmen, direkt.", time: "Direkt" },
  { icon: Workflow, title: "3. Ladda ner PDF:en", body: "Innehållsrikt underlag att dela med ledning, personal eller styrelse.", time: "1 klick" },
  { icon: Clock3, title: "4. (Valfritt) Boka genomlysning", body: "Vi går igenom era svar och pekar ut bästa första pilot. Helt kostnadsfritt.", time: "45 min" },
];

const examples = [
  "kundfrågor som besvaras om och om igen",
  "CRM-uppdateringar efter möten och säljsamtal",
  "Excel-listor som uppdateras manuellt",
  "rapporter som sammanställs från flera källor",
  "offerter, avtal eller dokument som följer mallar",
  "fakturor, kostnader eller ärenden som kontrolleras enligt regler",
  "intern kunskap som personal behöver leta efter",
  "uppföljningar till leads som lätt glöms bort",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DigitalDocument",
  name: "Aurora AI-karta",
  description:
    "Kostnadsfri AI-analys för svenska företag. Identifiera vilka processer som kan automatiseras med AI – på 10 minuter, utan säljmöte.",
  provider: { "@type": "Organization", name: "Aurora Media AB", url: "https://auroramedia.se" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: objections.map((o) => ({
    "@type": "Question",
    name: o.q,
    acceptedAnswer: { "@type": "Answer", text: o.a },
  })),
};

const AiKarta = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "Kostnadsfri AI-analys för ditt företag (10 min) | Aurora Media",
      description:
        "Ta reda på exakt vilka processer i ditt företag som kan automatiseras med AI. Personlig analys + innehållsrik PDF – på 10 minuter, helt kostnadsfritt.",
      canonical: "/ai-karta",
    });
    setBreadcrumb([
      { name: "Start", url: "/" },
      { name: "AI-kartan", url: "/ai-karta" },
    ]);
    setJsonLd("ai-karta-jsonld", jsonLd);
    setJsonLd("ai-karta-faq-jsonld", faqJsonLd);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="overflow-hidden">
        {/* ============== HERO ============== */}
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.16),transparent_32%)]" />
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1.5 text-[11px] font-semibold text-primary sm:text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Helt kostnadsfri · Inget säljmöte krävs
                </div>

                <h1 className="mt-5 max-w-full font-display text-[clamp(2rem,8vw,6.2rem)] font-bold leading-[0.95] tracking-tight break-words sm:max-w-5xl sm:leading-[0.92]">
                  Vad i ert företag kan{" "}
                  <span className="bg-gradient-to-r from-primary via-primary to-purple-400 bg-clip-text text-transparent">
                    AI sköta åt er
                  </span>
                  ?
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg md:text-2xl">
                  Få en personlig AI-analys av era processer på <strong className="text-foreground">10 minuter</strong>.
                  Vi pekar ut exakt vilka uppgifter som kan automatiseras – och hur mycket tid det sparar.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center sm:flex-wrap">
                  <Button asChild size="lg" className="w-full rounded-full shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.6)] sm:w-auto">
                    <Link to="/ai-karta/start">
                      Starta min AI-analys – gratis <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>Inget säljmöte · Inget spam · 10 min</span>
                  </div>
                </div>

                {/* Proof stats row */}
                <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
                  {proofStats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{s.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal y={18}>
                <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl">
                  <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-primary to-purple-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-lg">
                    Så ser resultatet ut
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/55 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Topp 1 av 3</p>
                        <h2 className="mt-2 font-display text-2xl font-bold text-white">Offerthantering</h2>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-primary/60 px-3 py-1 text-xs font-semibold text-primary-foreground">
                        <TrendingUp className="h-3 w-3" /> Hög potential
                      </span>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.10] px-3 py-1.5 text-xs">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="text-foreground">~6 h/vecka kan automatiseras (≈ 276 h/år)</span>
                    </div>
                    <div className="mt-5 grid gap-2.5">
                      {[
                        { k: "Lösning", v: "AI-assistent + dokumentmall" },
                        { k: "Snabb vinst", v: "Auto-genererat utkast på 30 sek" },
                        { k: "Risk", v: "Kvalitetskontroll av priser" },
                      ].map((row) => (
                        <div key={row.k} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{row.k}</span>
                          <span className="text-right text-foreground/90">{row.v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-2xl border border-primary/25 bg-primary/[0.08] p-3 text-xs leading-relaxed text-foreground/85">
                      <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
                      Du får djupanalys, konkret exempel och Aurora Medias rekommendation för varje område.
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ============== PAIN / PROBLEM ============== */}
        <section className="border-y border-white/10 bg-white/[0.025] py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <Reveal>
                <p className="label-caps">Problemet</p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Ni vet att AI borde fixa det här. Men <em className="font-display italic text-primary">vad</em> ska ni börja med?
                </h2>
                <p className="mt-5 text-muted-foreground md:text-lg">
                  De flesta företag experimenterar med ChatGPT lite då och då – men har ingen aning om vilka processer som faktiskt skulle ge mätbar effekt om de automatiserades. Resultatet: tiden går, konkurrenterna drar ifrån, och AI förblir ett experiment istället för en konkurrensfördel.
                </p>
                <p className="mt-4 text-muted-foreground md:text-lg">
                  AI-kartan ger er svaret – baserat på <strong className="text-foreground">era egna processer</strong>, inte ett generiskt råd.
                </p>
              </Reveal>
              <Reveal y={18}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {examples.map((example) => (
                    <div key={example} className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-foreground/85">
                      <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs italic text-muted-foreground">
                  Känner ni igen er? Allt detta är typiska områden vi automatiserar.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ============== VALUE STACK ============== */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps text-primary">Vad ni får – allt kostnadsfritt</p>
              <h2 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Inte ännu en AI-rapport. <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Ett färdigt beslutsunderlag.</span>
              </h2>
              <p className="mt-4 max-w-3xl text-muted-foreground md:text-lg">
                Det här hade kostat 15 000–40 000 kr hos en typisk AI-konsult. Hos oss får ni det direkt på skärmen – för att vi vet att <strong className="text-foreground">en bra analys är vägen till en bra kund</strong>.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {valueStack.map(({ icon: Icon, title, body }, index) => (
                <Reveal key={title} delay={index * 0.04} y={16}>
                  <div className="group h-full rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur transition hover:border-primary/30 hover:bg-primary/[0.04]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 transition group-hover:bg-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Mid-page CTA */}
            <Reveal y={16}>
              <div className="mt-12 flex flex-col items-center gap-4 rounded-[1.7rem] border border-primary/25 bg-gradient-to-br from-primary/[0.10] via-primary/[0.04] to-transparent p-8 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <p className="font-display text-xl font-bold sm:text-2xl">Redo att se vad AI kan göra för er?</p>
                  <p className="mt-1 text-sm text-muted-foreground">10 minuter. Direktanalys. Ingen kontaktinfo krävs förrän ni vill ha PDF:en.</p>
                </div>
                <Button asChild size="lg" className="rounded-full shrink-0">
                  <Link to="/ai-karta/start">
                    Starta nu <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============== HOW IT WORKS ============== */}
        <section className="border-y border-white/10 bg-secondary/20 py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps">Så fungerar det</p>
              <h2 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Från första klick till färdig AI-plan.
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, body, time }, index) => (
                <Reveal key={title} delay={index * 0.05} y={16}>
                  <div className="relative h-full rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur">
                    <div className="absolute right-5 top-5 rounded-full border border-primary/25 bg-primary/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {time}
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============== OBJECTION HANDLING / FAQ ============== */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-5xl">
            <Reveal>
              <p className="label-caps">Vanliga invändningar</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Innan ni klickar – det här undrar de flesta.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {objections.map((o, i) => (
                <Reveal key={o.q} delay={i * 0.05} y={16}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <p className="font-display text-base font-bold text-foreground">{o.q}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{o.a}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============== FINAL CTA ============== */}
        <section className="pb-28">
          <div className="container mx-auto px-6 max-w-6xl">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary/[0.18] via-primary/[0.06] to-transparent p-8 md:p-14 shadow-[0_40px_100px_-50px_hsl(var(--primary)/0.6)]">
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.10] px-3 py-1.5 text-xs font-semibold text-primary">
                    <Star className="h-3.5 w-3.5" /> Begränsat antal pilotplatser kvartalsvis
                  </div>
                  <h2 className="mt-5 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    10 minuter nu kan spara er verksamhet hundratals timmar nästa år.
                  </h2>
                  <p className="mt-5 max-w-2xl text-muted-foreground md:text-lg">
                    Starta AI-kartan och se exakt vad som bör automatiseras först. Hittar vi inte minst 3 konkreta områden ni kan jobba vidare med – då har ni ändå fått en gratis nulägesanalys.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button asChild size="lg" className="rounded-full shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.6)]">
                      <Link to="/ai-karta/start">
                        Starta min AI-analys nu <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="ghost" onClick={() => open()} className="rounded-full">
                      Hellre boka ett samtal direkt
                    </Button>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Helt kostnadsfritt</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Inget säljmöte krävs</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> GDPR-säkrad</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Aurora Media AB · Linköping</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AiKarta;

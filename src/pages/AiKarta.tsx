import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Database,
  FileSpreadsheet,
  Gauge,
  MailCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setJsonLd, setBreadcrumb } from "@/lib/seoHelpers";

const signals = [
  "uppgiften återkommer ofta",
  "den görs på ungefär samma sätt varje gång",
  "den följer regler, mallar eller checklistor",
  "den kräver information från flera system",
  "den tar tid men skapar inte motsvarande affärsvärde",
  "den skapar flaskhalsar, väntetid eller personberoende",
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

const steps = [
  {
    icon: ClipboardList,
    title: "1. Samla in arbetsuppgifter",
    body: "Lista vad teamet gör ofta: administration, sälj, support, rapportering, dokument, ekonomi och interna frågor.",
  },
  {
    icon: Clock3,
    title: "2. Mät frekvens och tidsåtgång",
    body: "Se vilka moment som görs dagligen eller veckovis och hur mycket tid de faktiskt tar över en månad.",
  },
  {
    icon: Workflow,
    title: "3. Bedöm AI-lämplighet",
    body: "Prioritera uppgifter som är repetitiva, regelstyrda, datadrivna och har tydliga steg eller beslutskriterier.",
  },
  {
    icon: Gauge,
    title: "4. Välj vad som ska byggas först",
    body: "Rangordna efter effekt, komplexitet och affärsnytta. Resultatet blir en konkret AI-roadmap, inte bara idéer.",
  },
];

const outputs = [
  "en lista över företagets bästa AI-case",
  "prioritering efter tid, effekt och genomförbarhet",
  "förslag på automation, AI-assistent, dashboard eller internt system",
  "underlag för ledning, team och första pilotprojekt",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DigitalDocument",
  name: "Aurora AI-karta",
  description:
    "En praktisk mall som hjälper företag att identifiera arbetsuppgifter, system och processer som kan automatiseras, effektiviseras eller byggas om med AI.",
  provider: {
    "@type": "Organization",
    name: "Aurora Media AB",
    url: "https://auroramedia.se",
  },
};

const AiKarta = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "AI-kartan | Hitta företagets bästa AI-case | Aurora Media",
      description:
        "Ladda ner Aurora AI-karta och identifiera vilka arbetsuppgifter, system och processer i företaget som kan automatiseras, effektiviseras eller byggas om med AI.",
      canonical: "/ai-karta",
    });
    setBreadcrumb([
      { name: "Start", url: "/" },
      { name: "AI-kartan", url: "/ai-karta" },
    ]);
    setJsonLd("ai-karta-jsonld", jsonLd);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="overflow-hidden">
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.2),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_30%)]" />
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <Reveal>
                <p className="label-caps">Gratis mall · AI · Automation · Effektivisering</p>
                <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.1rem,7.8vw,7rem)] font-bold leading-[0.9] tracking-tight">
                  Hitta företagets bästa AI-möjligheter på 30 minuter.
                </h1>
                <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-2xl">
                  Aurora AI-karta hjälper er att identifiera vilka arbetsuppgifter, system och processer som kan automatiseras, effektiviseras eller byggas om med AI, automation och skräddarsydda digitala lösningar.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" onClick={open} className="rounded-full">
                    Hämta AI-kartan <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-full">
                    <Link to="/ai-automation-foretag">Se hur vi bygger lösningen</Link>
                  </Button>
                </div>
              </Reveal>

              <Reveal y={18}>
                <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/50 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Aurora AI-karta</p>
                        <h2 className="mt-3 font-display text-3xl font-bold text-white">Mall för AI-lämpliga flöden</h2>
                      </div>
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <div className="mt-8 grid gap-3">
                      {["Arbetsuppgift", "Frekvens", "Tidsåtgång", "System & data", "AI-potential", "Prioritet"].map((item, index) => (
                        <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white/78">
                          <span>{index + 1}. {item}</span>
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 rounded-2xl border border-blue-300/20 bg-blue-500/10 p-4 text-sm leading-relaxed text-blue-50/80">
                      Målet är inte att hitta flest AI-idéer. Målet är att hitta rätt första case att bygga.
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025] py-16">
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps">Varför den behövs</p>
              <h2 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Era bästa AI-case finns redan i verksamheten. Ni har bara inte kartlagt dem än.
              </h2>
              <p className="mt-5 max-w-3xl text-muted-foreground md:text-lg">
                De flesta företag har massor av arbetsuppgifter som kan förbättras med AI och automation: Excel, mejl, CRM, rapporter, kundfrågor, dokument, uppföljningar och interna rutiner. AI-kartan gör det konkret.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {signals.map((signal, index) => (
                <Reveal key={signal} delay={index * 0.04} y={16}>
                  <div className="h-full rounded-[1.35rem] border border-white/10 bg-background/70 p-5">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-sm leading-relaxed text-foreground/82">{signal}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <Reveal>
                <p className="label-caps">Exempel på AI-case</p>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Från vardagsproblem till konkret AI-roadmap.
                </h2>
                <p className="mt-5 text-muted-foreground md:text-lg">
                  AI-kartan hjälper er hitta de arbetsuppgifter som tar tid, upprepas ofta och går att förbättra med automation, AI-assistenter, dashboards, interna system eller appar.
                </p>
              </Reveal>
              <Reveal y={18}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {examples.map((example) => (
                    <div key={example} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-foreground/84">
                      {example}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-secondary/20 py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps">Så fungerar mallen</p>
              <h2 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Enkel nog för teamet. Skarp nog för ledningen.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, body }, index) => (
                <Reveal key={title} delay={index * 0.05} y={16}>
                  <div className="h-full rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <Reveal>
                <p className="label-caps">Vad ni får ut</p>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Inte ännu ett AI-dokument. Ett beslutsunderlag för vad som ska byggas.
                </h2>
                <div className="mt-8 grid gap-3">
                  {outputs.map((output) => (
                    <div key={output} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-foreground/84">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{output}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal y={18}>
                <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-6">
                  <p className="label-caps">Hämta mallen</p>
                  <h3 className="mt-3 font-display text-3xl font-bold">Skicka AI-kartan till min mejl</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Vill ni ha hjälp att gå igenom svaren efteråt? Boka en AI-genomlysning så prioriterar vi era case efter effekt, komplexitet och affärsnytta.
                  </p>
                  <div className="mt-6 space-y-3">
                    <Input placeholder="Namn" className="rounded-full" />
                    <Input placeholder="E-post" type="email" className="rounded-full" />
                    <Input placeholder="Företag" className="rounded-full" />
                    <Button onClick={open} size="lg" className="w-full rounded-full">
                      Hämta AI-kartan <MailCheck className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Formuläret är redo för koppling till ert CRM eller e-postverktyg. Knappen öppnar kontaktflödet tills integrationen är på plats.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container mx-auto px-6 max-w-6xl">
            <Reveal>
              <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_36%),rgba(255,255,255,0.055)] p-8 md:p-12">
                <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="label-caps">Nästa steg</p>
                    <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                      Vill ni att vi analyserar era svar och visar vad som bör byggas först?
                    </h2>
                    <p className="mt-5 max-w-2xl text-muted-foreground md:text-lg">
                      Vi omvandlar era svar till konkreta lösningar: AI-automationer, interna system, dashboards, AI-assistenter, appar eller SaaS-flöden.
                    </p>
                  </div>
                  <Button size="lg" onClick={open} className="rounded-full md:shrink-0">
                    Boka AI-genomlysning <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
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

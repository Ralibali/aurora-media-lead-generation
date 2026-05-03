import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  Database,
  FileSpreadsheet,
  Gauge,
  MailCheck,
  Network,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setJsonLd, setBreadcrumb } from "@/lib/seoHelpers";

const problems = [
  "Excel-filer som blivit affärskritiska men är svåra att lita på",
  "kunddata som ligger utspridd i mejl, anteckningar, chattar och gamla system",
  "leads som missas för att uppföljning sker manuellt",
  "rapporter, offerter och administration som tar onödigt många timmar",
  "system som inte pratar med varandra och skapar dubbelarbete",
  "intern kunskap som finns någonstans – men aldrig där personalen behöver den",
];

const services = [
  {
    icon: ClipboardList,
    title: "AI-genomlysning",
    body: "Vi går igenom arbetsflöden, system, dokument och rutiner. Ni får en konkret lista på vad som kan automatiseras, vad som ger störst effekt och vad som bör byggas först.",
  },
  {
    icon: Workflow,
    title: "Automationer",
    body: "Vi kopplar ihop formulär, mejl, CRM, kalkylblad, affärssystem och AI så att repetitiva moment sker automatiskt istället för manuellt.",
  },
  {
    icon: Database,
    title: "Interna system",
    body: "När Excel, whiteboards och gamla verktyg inte räcker bygger vi kundregister, dashboards, offertsystem, projektportaler och interna appar.",
  },
  {
    icon: Bot,
    title: "AI-assistenter",
    body: "Vi bygger assistenter för support, sälj, dokument, onboarding och intern kunskap – tränade på företagets egna processer och material.",
  },
  {
    icon: MailCheck,
    title: "Säljautomation",
    body: "Vi skapar leadflöden med kvalificering, CRM-koppling, automatiska uppföljningar, påminnelser och dashboards för bättre säljkontroll.",
  },
  {
    icon: Rocket,
    title: "SaaS och digitala produkter",
    body: "Har ni en idé till en SaaS, kundportal, marknadsplats eller MVP bygger vi lösningen från strategi till lansering och vidareutveckling.",
  },
];

const beforeAfter = [
  ["Leads ligger i inkorgen", "Leads hamnar direkt i CRM med ansvarig säljare"],
  ["Excel uppdateras manuellt", "Dashboarden uppdateras automatiskt"],
  ["Kundfrågor skrivs från noll", "AI föreslår svar baserat på er kunskap"],
  ["Offerter tar för lång tid", "Offertflödet blir snabbare och mer standardiserat"],
  ["Rapporter byggs för hand", "Rapporter genereras på minuter"],
  ["Information är utspridd", "Allt samlas i ett modernt arbetsflöde"],
];

const packages = [
  {
    name: "AI Start",
    price: "För företag som vill börja rätt",
    points: ["AI-genomlysning", "3–5 konkreta automationscase", "prioriterad roadmap", "förslag på första implementation"],
  },
  {
    name: "Automation Sprint",
    price: "För företag som vill lösa ett verkligt problem",
    points: ["kartläggning", "bygge av 1–2 workflows", "integrationer", "testning och överlämning"],
  },
  {
    name: "AI Growth System",
    price: "För företag som vill sälja mer med smartare flöden",
    points: ["leadflöde", "CRM-koppling", "AI-kvalificering", "automatiska uppföljningar"],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI automation för företag",
  provider: {
    "@type": "Organization",
    name: "Aurora Media AB",
    url: "https://auroramedia.se",
  },
  areaServed: "Sverige",
  serviceType: "AI automation, digitalisering och skräddarsydda system",
  description:
    "Aurora Media hjälper företag att ersätta Excel, manuella rutiner och omoderna system med AI-lösningar, automationer och skräddarsydda digitala arbetsflöden.",
};

const AiAutomationForetag = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "AI automation för företag | Automatisera Excel, leads och administration",
      description:
        "Aurora Media hjälper företag att ersätta Excel, manuella rutiner och omoderna system med AI-lösningar, automationer, interna system och smarta digitala arbetsflöden.",
      canonical: "/ai-automation-foretag",
    });
    setBreadcrumb([
      { name: "Start", url: "/" },
      { name: "AI automation för företag", url: "/ai-automation-foretag" },
    ]);
    setJsonLd("ai-automation-service", jsonLd);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="overflow-hidden">
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_30%)]" />
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps">AI · Automation · Effektivisering</p>
              <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.1rem,7.8vw,7.6rem)] font-bold leading-[0.9] tracking-tight">
                Från Excel-kaos till smarta AI-flöden.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-2xl">
                Aurora Media hjälper företag att ersätta manuella rutiner, anteckningar, gamla system och tidskrävande administration med AI-lösningar, automationer och skräddarsydda system som sparar tid och skapar fler affärer.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={open} className="rounded-full">
                  Boka AI-genomlysning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full">
                  <Link to="/kontakt">Berätta vad ni vill effektivisera</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {['SaaS', 'AI-automation', 'CRM-flöden', 'dashboards', 'interna system', 'leadgenerering'].map((item) => (
                  <span key={item} className="rounded-full border border-white/12 bg-white/[0.055] px-4 py-2">{item}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025] py-16">
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps">Känner ni igen er?</p>
              <h2 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Det är inte personalen som är problemet. Det är arbetsflödena.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {problems.map((problem, index) => (
                <Reveal key={problem} delay={index * 0.04} y={16}>
                  <div className="h-full rounded-[1.35rem] border border-white/10 bg-background/70 p-5">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-sm leading-relaxed text-foreground/82">{problem}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps">Det vi bygger</p>
              <h2 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Inte AI för att det låter modernt. AI där det faktiskt gör nytta.
              </h2>
              <p className="mt-5 max-w-3xl text-muted-foreground md:text-lg">
                Vi börjar med affärsnyttan: tid som kan sparas, leads som kan följas upp snabbare, data som behöver samlas och processer som måste bli mer pålitliga.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map(({ icon: Icon, title, body }, index) => (
                <Reveal key={title} delay={index * 0.04} y={16}>
                  <div className="h-full rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-bold">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-secondary/20 py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <Reveal>
                <p className="label-caps">Före och efter</p>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Från manuellt kaos till automatiserat flyt.
                </h2>
                <p className="mt-5 text-muted-foreground md:text-lg">
                  Det här är den typ av skillnad vi vill skapa: färre manuella steg, bättre uppföljning och mer kontroll över kund, sälj och leverans.
                </p>
              </Reveal>
              <Reveal y={18}>
                <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-background/70">
                  {beforeAfter.map(([before, after], index) => (
                    <div key={before} className="grid gap-0 border-b border-white/10 last:border-b-0 md:grid-cols-2">
                      <div className="flex items-start gap-3 p-5 text-sm text-muted-foreground">
                        <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{before}</span>
                      </div>
                      <div className="flex items-start gap-3 bg-white/[0.045] p-5 text-sm text-foreground">
                        <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{after}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps">Paketering</p>
              <h2 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                Tydliga paket som gör det lätt att komma igång.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {packages.map((pkg, index) => (
                <Reveal key={pkg.name} delay={index * 0.05} y={16}>
                  <div className="h-full rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-7">
                    <h3 className="font-display text-2xl font-bold">{pkg.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{pkg.price}</p>
                    <ul className="mt-6 space-y-3">
                      {pkg.points.map((point) => (
                        <li key={point} className="flex gap-3 text-sm text-foreground/84">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
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
                      Vill ni veta vad AI och automation faktiskt kan göra för ert företag?
                    </h2>
                    <p className="mt-5 max-w-2xl text-muted-foreground md:text-lg">
                      Vi börjar med hur ni jobbar idag. Sedan visar vi exakt vilka processer som kan effektiviseras, automatiseras eller byggas om till smarta digitala system.
                    </p>
                  </div>
                  <Button size="lg" onClick={open} className="rounded-full md:shrink-0">
                    Boka första genomgången <Sparkles className="ml-2 h-4 w-4" />
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

export default AiAutomationForetag;

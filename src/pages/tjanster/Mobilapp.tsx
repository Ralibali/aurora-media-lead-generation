import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Code2, Smartphone, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { setSEOMeta, setJsonLd, setBreadcrumb } from "@/lib/seoHelpers";

const benefits = [
  "React Native-appar för iOS och Android med en modern, skalbar kodbas",
  "snabb utveckling utan att kompromissa med känsla, prestanda eller kvalitet",
  "appar som kopplas till API:er, Supabase, Stripe, CRM, dashboards och AI-flöden",
  "tydlig produktstrategi, UX och teknikval innan vi bygger",
  "kodstruktur som går att vidareutveckla, äga och skala",
  "lanseringsfokus från dag ett – inte bara en snygg prototyp",
];

const appTypes = [
  "kundappar",
  "bokningsappar",
  "interna appar",
  "fältappar för personal",
  "MVP:er och startup-appar",
  "appar kopplade till SaaS-plattformar",
  "appar med AI-funktioner",
  "appar med betalning, login och notiser",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "React Native apputveckling",
  provider: {
    "@type": "Organization",
    name: "Aurora Media AB",
    url: "https://auroramedia.se",
  },
  areaServed: "Sverige",
  serviceType: "Mobilapputveckling, React Native, appar för iOS och Android",
  description:
    "Aurora Media bygger moderna appar med React Native för företag som vill lansera skalbara mobilappar, interna appar, kundappar och AI-drivna mobila lösningar.",
};

const Mobilapp = () => {
  const { open } = useContactModal();

  useEffect(() => {
    setSEOMeta({
      title: "React Native apputveckling | Appar för iOS och Android | Aurora Media",
      description:
        "Aurora Media är experter på React Native och bygger moderna appar för iOS och Android: kundappar, interna appar, MVP:er, SaaS-appar och AI-drivna mobila lösningar.",
      canonical: "/tjanster/mobilapp",
    });
    setBreadcrumb([
      { name: "Start", url: "/" },
      { name: "Tjänster", url: "/tjanster" },
      { name: "Mobilappar", url: "/tjanster/mobilapp" },
    ]);
    setJsonLd("react-native-app-service", jsonLd);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="overflow-hidden">
        <section className="relative pt-28 pb-16 md:pt-36 md:pb-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_30%)]" />
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps">React Native · iOS · Android</p>
              <h1 className="mt-5 max-w-5xl font-display text-[clamp(3.1rem,7.8vw,7rem)] font-bold leading-[0.9] tracking-tight">
                Appar byggda med React Native av experter.
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-2xl">
                Aurora Media bygger moderna mobilappar för företag som vill lansera snabbt, skala smart och äga sin kod. Vi använder React Native för att skapa appar för både iOS och Android med en stark, effektiv och framtidssäker kodbas.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={open} className="rounded-full">
                  Diskutera appidé <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full">
                  <Link to="/ai-automation-foretag">Kombinera app med AI</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025] py-16">
          <div className="container mx-auto px-6 max-w-7xl">
            <Reveal>
              <p className="label-caps">Varför React Native?</p>
              <h2 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                En kodbas. Två plattformar. Snabbare väg till lansering.
              </h2>
              <p className="mt-5 max-w-3xl text-muted-foreground md:text-lg">
                React Native är rätt val när ni vill bygga en professionell app för både iPhone och Android utan att betala för två helt separata utvecklingsspår. Vi kan bygga snabbare, testa smartare och vidareutveckla effektivare.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <Reveal key={benefit} delay={index * 0.04} y={16}>
                  <div className="h-full rounded-[1.35rem] border border-white/10 bg-background/70 p-5">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <p className="mt-4 text-sm leading-relaxed text-foreground/82">{benefit}</p>
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
                <p className="label-caps">Appar vi bygger</p>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Från appidé till riktig produkt i användarnas händer.
                </h2>
                <p className="mt-5 text-muted-foreground md:text-lg">
                  Vi bygger inte appar som bara ser bra ut i en demo. Vi bygger produkter med login, data, betalningar, pushnotiser, integrationer, AI-funktioner och verklig affärsnytta.
                </p>
              </Reveal>
              <Reveal y={18}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {appTypes.map((type) => (
                    <div key={type} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-foreground/84">
                      {type}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-secondary/20 py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid gap-5 md:grid-cols-3">
              <Reveal>
                <div className="h-full rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-7">
                  <Smartphone className="h-7 w-7 text-primary" />
                  <h3 className="mt-5 font-display text-2xl font-bold">Native känsla</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    React Native ger en appupplevelse som känns snabb, modern och naturlig på både iOS och Android.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <div className="h-full rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-7">
                  <Code2 className="h-7 w-7 text-primary" />
                  <h3 className="mt-5 font-display text-2xl font-bold">Kod ni äger</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Ni får en ren kodbas som kan vidareutvecklas, flyttas och skalas utan onödig inlåsning.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="h-full rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-7">
                  <Zap className="h-7 w-7 text-primary" />
                  <h3 className="mt-5 font-display text-2xl font-bold">Snabbare utveckling</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    En gemensam teknikgrund gör det enklare att bygga, testa, lansera och förbättra appen löpande.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <Reveal>
              <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_36%),rgba(255,255,255,0.055)] p-8 md:p-12">
                <p className="label-caps">Nästa steg</p>
                <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Har ni en appidé, ett internt behov eller en SaaS som behöver en mobilapp?
                </h2>
                <p className="mt-5 max-w-2xl text-muted-foreground md:text-lg">
                  Vi hjälper er att välja rätt scope, bygga rätt första version och lansera en React Native-app som är redo att växa.
                </p>
                <div className="mt-8">
                  <Button size="lg" onClick={open} className="rounded-full">
                    Boka appgenomgång <ArrowRight className="ml-2 h-4 w-4" />
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

export default Mobilapp;

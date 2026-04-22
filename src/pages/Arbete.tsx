import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import { cases } from "@/components/PortfolioSection";
import { ArrowUpRight } from "lucide-react";
import { setSEOMeta, setBreadcrumb, removeJsonLd } from "@/lib/seoHelpers";

const detailedCases = [
  {
    name: "Aurora Transport",
    domain: "auroratransport.se",
    problem: "Svenska transportbolag jagar fortfarande dispatching i Excel och WhatsApp. Manuell dubbelkoll, missade körningar, ingen koppling till bokföringen.",
    solution: "Webbaserad dispatching med live-status, Stripe-betalningar mot uppdragsgivare och en direkt Fortnox-koppling som skapar fakturor automatiskt när en körning är klar.",
    stack: "Lovable + Supabase + Stripe + Fortnox API",
    result: "Lanserad på 3 veckor. Betalande kund i drift sedan dag 1 efter lansering.",
  },
  {
    name: "Updro",
    domain: "updro.se",
    problem: "Företag som ska köpa digitala tjänster vet inte vem de ska prata med. Byrå-marknaden är opaque och offerter går aldrig att jämföra.",
    solution: "Marknadsplats där företag beskriver sitt behov och får jämförbara offerter från relevanta byråer. Stripe Connect för utbetalningar.",
    stack: "Lovable + Supabase + Stripe Connect",
    result: "Lanserad 2026, byråer onboardas löpande.",
  },
  {
    name: "AgilityManager",
    domain: "agilitymanager.se",
    problem: "Agility-förare för loggbok i papperskalender. Ingen statistik, ingen progression, ingen koppling till tävlingsresultat.",
    solution: "Träningsapp med inbyggd kalender, statistik per hund och automatisk hämtning av tävlingsresultat från SBK.",
    stack: "Lovable + Supabase + Firecrawl",
    result: "Live med betalande användare.",
  },
  {
    name: "Hönsgården",
    domain: "honsgarden.se",
    problem: "Svenska hönsägare har ingen samlad app för värphöns, vaccinations-scheman och flockhantering.",
    solution: "Freemium-app med basfunktioner gratis och premium för avancerad statistik och AI-guidning.",
    stack: "Lovable + Supabase + RevenueCat",
    result: "67 procent premium-konvertering bland aktiva användare.",
  },
  {
    name: "Odlingsdagboken",
    domain: "odlingsdagboken.com",
    problem: "Odlare för dagbok i tre olika appar och en pärm. Ingen samlad bild, ingen påminnelse om vad som ska göras nästa vecka.",
    solution: "Svensk odlings-SaaS med AI-coach byggd på Claude som ger råd baserat på zon, gröda och tidigare anteckningar.",
    stack: "Lovable + Supabase + Claude API",
    result: "Premium 99 kr/år. Live.",
  },
  {
    name: "GoGlamping Sweden",
    domain: "goglampingsweden.se",
    problem: "Glamping-anläggning vid Göta kanal hade en bokningsmotor (Sirvoy) men ingen presentationssajt som drev konvertering.",
    solution: "Bokningssajt med rena landningssidor per stuga, integrerad Sirvoy-widget och SEO-optimering för glamping/Östergötland.",
    stack: "React + Vite + Sirvoy",
    result: "Live. Öppnar maj 2026.",
  },
  {
    name: "Viriditas",
    domain: "viriditasmassage.se",
    problem: "Massagemottagning behövde en seriös sajt med direktbokning som inte såg ut som en gratis Wix-mall.",
    solution: "Snabb, ren bokningssajt som speglar varumärket, med tidsbokning och presentation av behandlingar.",
    stack: "React + Vite",
    result: "1 vecka leverans. Live, betalande kund.",
  },
];

const Arbete = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Arbete & cases – 7 SaaS-produkter live | Aurora Media",
      description:
        "Sju egna SaaS-produkter i drift: Aurora Transport, Updro, AgilityManager, Hönsgården m.fl. Bevis på att AI-byggd SaaS levererar – inte bara mockups.",
      canonical: "/arbete",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Arbete & cases", url: "/arbete" },
    ]);
    return () => removeJsonLd("breadcrumb-jsonld");
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <p className="label-caps">Arbete</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">
              Sju produkter. <em className="italic text-primary">Alla live.</em>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              Det här är produkter jag har byggt och driver själv. Inga case-studies från en byrå
              jag jobbade på 2018 – det här är mitt arbete, just nu.
            </p>
          </div>
        </section>

        <section className="pb-24">
          <div className="container mx-auto px-6 max-w-4xl space-y-20">
            {detailedCases.map((c, i) => (
              <article
                key={c.domain}
                className="grid gap-8 border-t border-border pt-12 md:grid-cols-[1fr_2fr]"
              >
                <div>
                  <p className="label-caps">Case 0{i + 1}</p>
                  <h2 className="mt-3 font-serif text-3xl md:text-4xl">{c.name}</h2>
                  <a
                    href={`https://${c.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {c.domain}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
                <div className="space-y-5 text-base text-foreground/85">
                  <div>
                    <p className="label-caps mb-1.5">Problem</p>
                    <p>{c.problem}</p>
                  </div>
                  <div>
                    <p className="label-caps mb-1.5">Lösning</p>
                    <p>{c.solution}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div>
                      <p className="label-caps mb-1.5">Stack</p>
                      <p className="text-sm text-muted-foreground">{c.stack}</p>
                    </div>
                    <div>
                      <p className="label-caps mb-1.5">Resultat</p>
                      <p className="text-sm text-muted-foreground">{c.result}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default Arbete;

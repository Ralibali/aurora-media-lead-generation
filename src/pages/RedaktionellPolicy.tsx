import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTABanner from "@/components/CTABanner";
import RelatedLinks from "@/components/RelatedLinks";
import { setSEOMeta, setBreadcrumb, setJsonLd, SITE_URL } from "@/lib/seoHelpers";

const sections = [
  {
    h: "Vem skriver innehållet?",
    p: "Allt innehåll på auroramedia.se skrivs av Adam Söderberg, grundare av Aurora Media AB. Jag har byggt sju egna SaaS-produkter i drift och levererat åt kunder sedan 2024. Inga ghostwriters, inga generiska SEO-texter köpta utomlands.",
  },
  {
    h: "Hur använder jag AI i texterna?",
    p: "Jag använder Claude och GPT-5 för att utkast-skriva, redigera och faktagranska. Varje publicerad artikel går igenom minst två manuella revisioner där jag stryker AI-fluff, lägger till konkreta exempel från egna projekt och verifierar varje siffra. Ingen artikel publiceras helt AI-genererad.",
  },
  {
    h: "Faktakontroll",
    p: "Priser, leveranstider och statistik kommer från egna projekt eller publika källor (SCB, Tillväxtverket, leverantörers prislistor). När jag refererar verktyg som Lovable, Bolt eller Supabase är priserna kontrollerade mot leverantörens egen sida samma månad som artikeln publiceras.",
  },
  {
    h: "Uppdateringar",
    p: "Tekniklandskapet rör sig snabbt. Varje artikel har ett ”uppdaterad”-datum som speglar senaste verkliga genomgång. Artiklar äldre än 6 månader granskas på nytt eller markeras som arkiverade.",
  },
  {
    h: "Sponsring och affiliate",
    p: "Aurora Media tar inte emot betalning för att skriva positivt om verktyg eller leverantörer. Inga affiliate-länkar. Om jag rekommenderar Lovable är det för att jag använder det dagligen och det levererar – inte för att jag får provision.",
  },
  {
    h: "Rättelser",
    p: "Hittar du ett fel? Mejla info@auroramedia.se. Jag rättar inom 48 timmar och noterar ändringen tydligt i artikeln med datum.",
  },
  {
    h: "Källor och referenser",
    p: "När siffror eller påståenden kommer utifrån länkar jag direkt till källan i texten. Vid avsaknad av extern källa är påståendet baserat på egen erfarenhet från konkreta projekt – det skrivs ut tydligt.",
  },
  {
    h: "Integritet och persondata",
    p: "Inga cookies utöver tekniskt nödvändiga. Ingen tracking-pixel från tredjepart. Kontaktformulär lagrar bara det du själv skickar in och raderas efter avslutat ärende. Personuppgiftsansvarig: Aurora Media AB, org.nr 559272-0220.",
  },
];

const RedaktionellPolicy = () => {
  useEffect(() => {
    setSEOMeta({
      title: "Redaktionell policy – så fungerar innehållet på Aurora Media",
      description:
        "Vem skriver, hur används AI, hur faktagranskas innehållet, källor, rättelser och integritet. Transparent redaktionell policy för auroramedia.se.",
      canonical: "/redaktionell-policy",
    });
    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "Redaktionell policy", url: "/redaktionell-policy" },
    ]);
    setJsonLd("policy-webpage", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Redaktionell policy",
      url: `${SITE_URL}/redaktionell-policy`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      about: "Editorial standards, AI usage, fact-checking, corrections",
      inLanguage: "sv-SE",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="label-caps">Transparens</p>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl leading-[1.05]">
              Redaktionell policy
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Hur jag arbetar med innehåll, AI, fakta och rättelser. Senast uppdaterad{" "}
              {new Date().toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })}.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="container mx-auto px-6 max-w-3xl space-y-12">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="font-serif text-3xl mb-4">{s.h}</h2>
                <p className="text-foreground/85 leading-relaxed text-lg">{s.p}</p>
              </div>
            ))}

            <RelatedLinks
              heading="Läs vidare"
              links={[
                { to: "/metodik", title: "Min metodik – från idé till SaaS", caption: "Process" },
                { to: "/om", title: "Om Aurora Media", caption: "Bakgrund" },
                { to: "/artiklar", title: "Alla artiklar", caption: "Innehåll" },
              ]}
            />
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default RedaktionellPolicy;

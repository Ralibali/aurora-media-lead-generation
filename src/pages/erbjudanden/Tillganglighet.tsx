import OfferPage from "@/components/verkstad/OfferPage";

const Tillganglighet = () => (
  <OfferPage
    slug="tillganglighet"
    paketValue="Tillgänglighetsaudit"
    serviceType="Webbtillgänglighetsgranskning och löpande övervakning"
    eyebrow="Aurora Accessibility"
    title="Hitta hindren innan"
    titleEm="kunden gör det."
    intro="Vi granskar webbplatsen, prioriterar de fel som påverkar riktiga besökare och ger utvecklarvänliga åtgärder med spårbart före- och efterläge."
    seoTitle="Tillgänglighetsaudit & WCAG-granskning | Aurora Media"
    seoDescription="Teknisk tillgänglighetsaudit för webbplatser och e-handel. Prioriterade WCAG-fynd, åtgärdslista och löpande monitoring från Aurora Media."
    outcomes={[
      { title: "Prioriterad felbild", body: "Varje fynd får allvarlighetsgrad, berörd sida och konkret förklaring – inte bara en rå lista från ett testverktyg." },
      { title: "Åtgärder som går att bygga", body: "Vi anger element, selector, kriterium och rekommenderad lösning så att arbetet kan planeras och verifieras." },
      { title: "Före och efter", body: "Nya kontroller visar vad som är löst, vad som återstår och vilka regressionsfel som har tillkommit." },
      { title: "Mänsklig kontroll", body: "Tangentbord, fokus, begriplighet och skärmläsarflöden granskas manuellt där automation inte räcker." },
    ]}
    includes={[
      "Automatisk teknisk förkontroll av prioriterade sidor",
      "Fynd grupperade efter allvarlighetsgrad och WCAG-kriterium",
      "Berörd sida, element/selector och tydlig fix-instruktion",
      "Manuell checklista för tangentbord, fokus, kontrast och skärmläsare",
      "Åtgärdsplan i rekommenderad ordning",
      "Omkontroll och dokumenterat före-/efterläge i auditpaketet",
      "Löpande rescan och avvikelselarm i monitoring",
      "Kundvänlig rapport i Aurora Care",
    ]}
    tiers={[
      { name: "Audit", price: "2 995 kr", desc: "Engångsgranskning av en webbplats med prioriterad åtgärdslista.", features: ["Teknisk scan", "Manuell stickprovskontroll", "Prioriterad åtgärdslista", "En omkontroll"] },
      { name: "Monitor", price: "495 kr", cadence: "/mån", desc: "För sajter som vill fånga nya fel efter innehålls- och kodändringar.", featured: true, features: ["Schemalagd rescan", "Avvikelselarm", "Historik och trend", "Månadsöversikt i Care"] },
      { name: "Monitor Plus", price: "995 kr", cadence: "/mån", desc: "Monitoring plus löpande prioritering och hjälp med mindre åtgärder.", features: ["Allt i Monitor", "Manuell kvartalskontroll", "Prioriterad remediation", "Ingår i anpassad Care+-leverans"] },
    ]}
    pricingNote={<>Priser exklusive moms och gäller en normalstor företagswebb. Större e-handel, flera språk eller många mallar offereras efter omfattning.</>}
    process={[
      { title: "Avgränsa", body: "Vi väljer affärskritiska sidtyper och bestämmer vilka användarflöden som ska kontrolleras." },
      { title: "Granska", body: "Automatiska tester kombineras med manuell kontroll av sådant ett verktyg inte kan avgöra." },
      { title: "Prioritera", body: "Fynd kopplas till påverkan, konkret åtgärd och ansvarig – kritiska hinder först." },
      { title: "Verifiera", body: "Efter åtgärd kör vi om relevanta kontroller och sparar resultatet i Aurora Care." },
    ]}
    honesty={[
      "En automatisk scan hittar inte alla tillgänglighetsproblem. Full bedömning kräver mänsklig kontroll.",
      "Vi lovar inte juridisk efterlevnad eller 100 procent WCAG-compliance från ett verktygsresultat.",
      "Ombyggnad av större komponenter offereras separat; auditpaketet innehåller analys, prioritering och en omkontroll.",
    ]}
    faqs={[
      { q: "Är detta samma sak som en accessibility-overlay?", a: "Nej. Vi lägger inte ett lager ovanpå sajten som påstår sig lösa allt. Vi hittar problem i den faktiska webbplatsen och hjälper er åtgärda orsaken." },
      { q: "Vilka standarder kontrollerar ni?", a: "Arbetet utgår från WCAG 2.2 och relevanta svenska krav. Exakt juridisk tillämpning beror på verksamhet och omfattning och bedöms inte enbart av scannern." },
      { q: "Kan ni även rätta felen?", a: "Ja. Mindre åtgärder kan ingå i ett Care-upplägg. Större utvecklingsarbete får en separat fastprisoffert." },
      { q: "Fungerar det för Shopify och React?", a: "Ja. Vi kan granska WordPress, Shopify och moderna webbappar. Åtgärdssättet anpassas efter er teknik." },
    ]}
    related={[
      { name: "Aurora Care", price: "Från 995 kr/mån", to: "/care" },
      { name: "Cookie & samtycke", price: "Setup från 1 995 kr", to: "/cookie-samtycke" },
      { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
    ]}
  />
);

export default Tillganglighet;

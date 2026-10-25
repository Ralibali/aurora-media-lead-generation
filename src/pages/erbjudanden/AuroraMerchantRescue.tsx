import OfferPage from "@/components/verkstad/OfferPage";
import MerchantRescueScanner from "@/components/tools/MerchantRescueScanner";

const AuroraMerchantRescue = () => (
  <OfferPage
    slug="merchant-rescue"
    paketValue="Aurora Merchant Rescue"
    serviceType="Migrering från Content API for Shopping till Merchant API"
    eyebrow="Aurora Merchant Rescue"
    title="Använder er produktfeed"
    titleEm="fortfarande Content API?"
    intro="Google ersätter Content API for Shopping med Merchant API. Granska er kod eller konfiguration här och se vilka anrop som behöver flyttas – sedan kan Aurora Media genomföra och verifiera migreringen mot ert Merchant Center."
    seoTitle="Aurora Merchant Rescue – migrera till Google Merchant API | Aurora Media"
    seoDescription="Gratis lokal granskning av Content API for Shopping-anrop med checklista för Merchant API. Migrering och live-verifiering enligt offert."
    contactMessage={"Hej! Vi behöver migrera från Content API for Shopping till Merchant API.\n\nPlattform/integration (egen kod, plugin, PIM):\nUngefärligt antal produkter:\nResultat från granskningen:\n"}
    tool={{ title: "Granska kod eller konfiguration", intro: "Granskningen körs i webbläsaren och letar efter kända Content API-mönster. Den bevisar inte att en migration är klar.", node: <MerchantRescueScanner /> }}
    outcomes={[
      { title: "Vet vad som berörs", body: "Checklista per anrop: produkter, status, flöden, konto, frakt, lager och rapporter, med motsvarande Merchant API-del." },
      { title: "Migrera i rätt ordning", body: "Datakälla först, sedan skrivning av produkter, därefter status och rapporter." },
      { title: "Verifiera på riktigt", body: "Klart först när produkter, status och kontoproblem läses via Merchant API med er OAuth-åtkomst." },
      { title: "Ingen tyst feedförlust", body: "Vi jämför produktantal och fel före och efter bytet." },
    ]}
    includes={["Statisk granskning av kod eller exporterad konfiguration", "Migreringsplan per delAPI", "Kodändringar i er integration enligt offert", "Live-verifiering mot Merchant Center med er behörighet", "Överlämning med dokumentation"]}
    tiers={[
      { name: "Granskning", price: "Offert", desc: "Genomgång av integrationen och migreringsplan.", features: ["Checklista per anrop", "Riskbedömning", "Tidsuppskattning"] },
      { name: "Migrering", price: "Offert", featured: true, desc: "Vi genomför och verifierar bytet.", features: ["Kodändringar", "Live-verifiering med OAuth", "Jämförelse före/efter"] },
    ]}
    pricingNote={<>Pris enligt offert efter granskning. Ingen betalning sker på sidan.</>}
    process={[
      { title: "Granska", body: "Kör gratisgranskningen eller skicka repo-rapporten från vår CLI." },
      { title: "Planera", body: "Vi går igenom fynden och bestämmer ordning och testmiljö." },
      { title: "Migrera och verifiera", body: "Ändringar görs och verifieras live mot ert konto innan de markeras som klara." },
    ]}
    honesty={[
      "Granskningen är textbaserad och kan missa dynamiskt byggda anrop eller tredjepartsplugins.",
      "Vi markerar aldrig ett konto som migrerat utan OAuth-åtkomst och live-verifiering.",
      "Merchant API utvecklas fortfarande – vi kontrollerar Googles aktuella dokumentation och tidsplan i varje uppdrag.",
      "Order- och returflöden har inte alltid en direkt motsvarighet och bedöms separat.",
    ]}
    faqs={[
      { q: "Skickas min kod till er?", a: "Nej. Webbgranskningen körs lokalt. Kända hemligheter maskeras i resultatet, men ta ändå bort nycklar innan ni klistrar in." },
      { q: "Vi använder ett plugin – berörs vi?", a: "Ofta. Kontrollera om pluginets leverantör har gått över till Merchant API, eller låt oss granska det." },
    ]}
    related={[{ name: "Aurora Watch", price: "från 299 kr/mån", to: "/aurora-watch" }, { name: "E-handel", price: "", to: "/tjanster/ehandel" }]}
  />
);
export default AuroraMerchantRescue;
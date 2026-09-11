import OfferPage from "@/components/verkstad/OfferPage";

const AuroraSight = () => (
  <OfferPage
    slug="ai-synlighet"
    paketValue="Aurora Sight (AI-synlighet)"
    serviceType="AI-synlighet, GEO-audit och omvärldsbevakning"
    eyebrow="Aurora Sight"
    title="Syns ni när kunden"
    titleEm="frågar en AI?"
    intro="Allt fler börjar sin research i ChatGPT, Perplexity, Copilot och Googles AI-svar. Vi mäter hur ert företag beskrivs där, vilka källor svaren bygger på – och åtgärdar det som gör att ni inte nämns."
    seoTitle="AI-synlighet & GEO-audit – syns ni i ChatGPT och AI-sök? | Aurora Media"
    seoDescription="Aurora Sight mäter hur ert företag nämns i AI-svar från ChatGPT, Perplexity och Googles AI-översikter, hittar källorna bakom svaren och åtgärdar det som saknas. Från 7 900 kr."
    outcomes={[
      { title: "Ni vet var ni står", body: "En nulägesrapport på era viktigaste köpfrågor: nämns ni, nämns konkurrenterna, och stämmer det som sägs?" },
      { title: "Felaktigheter rättas", body: "AI-svar bygger på källor. Vi hittar de källor som beskriver er fel eller föråldrat och ser till att de uppdateras." },
      { title: "Innehåll som AI kan citera", body: "Tydliga faktasidor, struktur och schema-markup gör er lättare att hämta och citera – inte bara lättare att ranka." },
      { title: "Uppföljning över tid", body: "Med bevakning kör vi om frågorna varje månad så ni ser om åtgärderna faktiskt ändrade svaren." },
    ]}
    includes={[
      "20–40 köpnära frågor testade i flera AI-tjänster",
      "Nulägesrapport: omnämnanden, tonläge, felaktigheter och luckor",
      "Källanalys – vilka sidor AI-svaren bygger på",
      "Jämförelse mot tre konkurrenter",
      "Teknisk genomgång: struktur, schema.org, robots och åtkomst för AI-crawlers",
      "Åtgärdslista prioriterad efter affärsnytta",
      "Förslag på faktasidor och innehåll AI kan citera",
      "Genomgångsmöte där vi går igenom rapporten tillsammans",
    ]}
    tiers={[
      {
        name: "Sight Audit",
        price: "7 900 kr",
        cadence: "engång",
        desc: "Nulägesbild av er AI-synlighet med prioriterad åtgärdslista.",
        features: ["Upp till 25 frågor testade", "Källanalys", "Konkurrentjämförelse", "Åtgärdslista", "Genomgångsmöte 45 min"],
      },
      {
        name: "Sight Monitor",
        price: "2 495 kr",
        cadence: "/mån",
        desc: "Löpande bevakning så ni ser om läget förbättras.",
        featured: true,
        features: ["Månadsvis omkörning av frågorna", "Rapport med förändringar", "Larm vid felaktiga påståenden", "1 h åtgärdstid/mån", "Kvartalsavstämning"],
      },
      {
        name: "Sight Program",
        price: "Offert",
        desc: "Audit, åtgärder och innehållsproduktion som ett sammanhållet program.",
        features: ["Audit ingår", "Faktasidor och schema byggs av oss", "Digital PR mot relevanta källor", "Bevakning ingår", "Fast månadspris efter scope"],
      },
    ]}
    pricingNote={
      <>
        Priser exklusive moms. Audit levereras normalt inom två veckor. Har ni redan ett SEO-uppdrag
        hos oss räknas auditen av mot den första månaden i Monitor.
      </>
    }
    process={[
      { title: "Frågelista", body: "Vi tar fram de frågor era kunder faktiskt ställer inför ett köp – inte generiska sökord." },
      { title: "Mätning", body: "Frågorna körs i flera AI-tjänster och svaren dokumenteras med källor och datum." },
      { title: "Analys", body: "Vi kartlägger varför svaren ser ut som de gör: vilka källor som väger tungt och vad som saknas om er." },
      { title: "Åtgärder", body: "Innehåll, struktur och schema justeras. Vid behov jobbar vi mot externa källor som beskriver er fel." },
      { title: "Uppföljning", body: "Samma frågor körs om så att förändringen går att se, inte bara påstås." },
    ]}
    honesty={[
      "Ingen kan garantera att en AI nämner ett visst företag. Svaren varierar mellan tjänster, tillfällen och användare – vi mäter och förbättrar odds, inte utfall.",
      "Vi rapporterar dokumenterade svar med datum och skärmklipp. Det är stickprov, inte fullständig statistik över alla AI-svar i Sverige.",
      "Aurora Sight är i dag ett arbetsmoment vi utför och rapporterar manuellt med stöd av egna verktyg. Det finns ingen självbetjäningsportal, och vi påstår inte att någon AI-tjänst är integrerad med oss.",
    ]}
    faqs={[
      { q: "Vad är GEO?", a: "Generative Engine Optimization – arbetet med att bli synlig och korrekt beskriven i AI-genererade svar, till skillnad från klassiska sökresultat. I praktiken överlappar det mycket med bra SEO, men källor, struktur och faktatydlighet väger tyngre." },
      { q: "Ersätter det SEO?", a: "Nej. Klassisk sökning driver fortfarande merparten av trafiken. Aurora Sight är ett komplement som fångar en snabbt växande del av researchen." },
      { q: "Vilka AI-tjänster testar ni?", a: "Normalt ChatGPT, Perplexity, Googles AI-översikter och Copilot. Vill ni ha fler, säg till vid uppstart." },
      { q: "Hur snabbt syns effekt?", a: "Rättade felaktigheter kan slå igenom på några veckor när källorna hämtas om. Att bli nämnd i nya sammanhang tar oftast två till fyra månader." },
      { q: "Passar det små företag?", a: "Ja, särskilt om ni säljer tjänster där kunder gör research först. För rena lokala verksamheter ger ofta lokal synlighet mer per krona – vi säger till om det är fallet." },
    ]}
    related={[
      { name: "SEO", price: "Från 4 900 kr", to: "/tjanster/seo" },
      { name: "Content", price: "995 kr/artikel", to: "/tjanster/content" },
      { name: "Lokal synlighet", price: "Från 1 495 kr/mån", to: "/lokal-synlighet" },
    ]}
  />
);

export default AuroraSight;

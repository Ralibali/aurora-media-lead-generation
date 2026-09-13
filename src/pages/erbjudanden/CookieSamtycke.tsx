import OfferPage from "@/components/verkstad/OfferPage";

const CookieSamtycke = () => (
  <OfferPage
    slug="cookie-samtycke"
    paketValue="Cookie & samtycke"
    serviceType="Teknisk cookie- och samtyckeshantering"
    eyebrow="Aurora Consent"
    title="En cookie-banner som"
    titleEm="faktiskt styr tekniken."
    intro="Vi inventerar trackers och cookies, stoppar icke-nödvändig teknik före aktivt val och dokumenterar varje ändring – i samma Care-flöde som resten av sajten."
    seoTitle="Cookie-banner, Consent Mode v2 & tracker-scan | Aurora Media"
    seoDescription="Teknisk cookie- och samtyckeshantering med tracker-scan, blockering före samtycke, Consent Mode v2 och löpande kontroll."
    outcomes={[
      { title: "Verklig blockering", body: "Vi kontrollerar inte bara hur bannern ser ut, utan om analys- och marknadsföringstaggar faktiskt väntar på samtycke." },
      { title: "Spårbar inventering", body: "Cookies, scripts, pixlar och leverantörer samlas i en tydlig lista med kategori och tekniskt bevis." },
      { title: "Consent Mode v2", body: "Google-taggar kopplas till rätt samtyckessignaler utan att ett avböjt val behandlas som ett ja." },
      { title: "Kontroll över tid", body: "Nya trackers eller konfigurationsavvikelser fångas vid återkommande scans." },
    ]}
    includes={[
      "Teknisk inventering av cookies, scripts, pixlar och kända trackers",
      "Kategorisering: nödvändiga, analys, marknadsföring och preferenser",
      "Konfiguration av blockering före aktivt samtycke",
      "Google Consent Mode v2 där det är relevant",
      "Tydligt val för acceptera, avvisa och anpassa",
      "Länkad cookie- och integritetsinformation",
      "Versionshistorik över konfigurationsändringar",
      "Regelbunden rescan och avvikelselarm i Aurora Care",
    ]}
    tiers={[
      { name: "Installation", price: "1 995 kr", desc: "Grundinstallation för en mindre webbplats med normal tagguppsättning.", features: ["Tracker-scan", "Banner och kategorier", "Förhandsblockering", "Consent Mode v2-kontroll"] },
      { name: "Consent Monitor", price: "149 kr", cadence: "/mån", desc: "Löpande kontroll för en domän.", featured: true, features: ["Regelbunden rescan", "Larm vid nya trackers", "Versionshistorik", "Care-översikt"] },
      { name: "Consent Advanced", price: "399 kr", cadence: "/mån", desc: "För e-handel och mer komplex mätning.", features: ["Allt i Monitor", "Fler miljöer/taggar", "Kvartalsvis manuell verifiering", "Prioriterad support"] },
    ]}
    pricingNote={<>Priser exklusive moms per domän. Installation med komplex GTM-, annons- eller e-handelsuppsättning börjar på 2 995 kr efter genomgång.</>}
    process={[
      { title: "Inventera", body: "Vi kör en teknisk scan och går igenom befintliga taggar, cookies, scripts och lagringsytor." },
      { title: "Konfigurera", body: "Banner, kategorier, taggstyrning och samtyckessignaler kopplas ihop i rätt ordning." },
      { title: "Verifiera", body: "Vi testar acceptera, avvisa och återkalla i webbläsare – även att icke-nödvändiga taggar verkligen väntar." },
      { title: "Övervaka", body: "Aurora Care sparar versioner, scannar om och markerar nya eller ändrade trackers." },
    ]}
    honesty={[
      "Tjänsten är teknisk samtyckeshantering och dokumentation, inte en garanti om full GDPR-efterlevnad.",
      "För AdSense- och publisherfall där Google kräver en certifierad CMP använder vi en godkänd tredjepartslösning.",
      "Kundens texter, rättsliga grunder och faktiska personuppgiftsbehandling måste fortfarande vara korrekta.",
    ]}
    faqs={[
      { q: "Räcker det inte att ha en cookie-banner?", a: "Nej. Om Google Analytics eller en annonspixel laddas innan besökaren väljer har bannern inte gjort den viktigaste tekniska delen." },
      { q: "Tar ni bort vår befintliga lösning?", a: "Inte automatiskt. Vi granskar vad ni har och behåller den om den kan konfigureras korrekt. Annars rekommenderar vi ett tydligt byte." },
      { q: "Vad händer när någon lägger till en ny tagg?", a: "Med monitoring upptäcks den vid nästa scan och markeras för klassificering och eventuell blockering." },
      { q: "Kan detta ingå i Aurora Care?", a: "Ja. Consent Monitor kan läggas direkt till er Care-plan så att allt hanteras i samma portal och månadsrapport." },
    ]}
    related={[
      { name: "Aurora Care", price: "Från 995 kr/mån", to: "/care" },
      { name: "Tillgänglighetsaudit", price: "2 995 kr", to: "/tillganglighet" },
      { name: "Google Ads", price: "Efter scope", to: "/tjanster/google-ads" },
    ]}
  />
);

export default CookieSamtycke;

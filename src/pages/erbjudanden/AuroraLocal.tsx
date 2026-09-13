import OfferPage from "@/components/verkstad/OfferPage";

const AuroraLocal = () => (
  <OfferPage
    slug="lokal-synlighet"
    paketValue="Aurora Local (lokal synlighet)"
    serviceType="Lokal SEO, Google företagsprofil och recensionshantering"
    eyebrow="Aurora Local"
    title="Bli hittad av kunder"
    titleEm="i närområdet."
    intro="Google-företagsprofil, kartsökningar, recensioner och lokala landningssidor. Målet är enkelt: fler samtal, vägbeskrivningar och bokningar från människor som redan finns i er trakt."
    seoTitle="Lokal SEO & Google företagsprofil – fler kunder lokalt | Aurora Media"
    seoDescription="Aurora Local optimerar er Google-företagsprofil, lokala sökord, kartsynlighet och recensioner. Fast månadspris från 1 495 kr, ingen bindningstid. Aurora Media i Linköping."
    outcomes={[
      { title: "Fler samtal från kartan", body: "En komplett och aktiv företagsprofil visas oftare i kartresultat – där köpviljan är som störst." },
      { title: "Rätt uppgifter överallt", body: "Namn, adress, telefon och öppettider stämmer i Google, Bing, Eniro, Hitta och relevanta kataloger." },
      { title: "Fler och bättre recensioner", body: "Ett enkelt flöde som gör att nöjda kunder faktiskt skriver, och en rutin för att besvara alla omdömen." },
      { title: "Lokala sidor som rankar", body: "Egna sidor för era orter och tjänster – skrivna för människor, inte som ortsbytta dubbletter." },
    ]}
    includes={[
      "Genomgång och optimering av Google företagsprofil",
      "Kategorier, tjänster, attribut och öppettider satta rätt",
      "Bilduppladdning och löpande inlägg i profilen",
      "Kontroll och rättning av företagsuppgifter i kataloger",
      "Lokal sökordsanalys för era orter",
      "Lokal landningssida med rätt struktur och schema (LocalBusiness)",
      "Recensionsflöde: QR, länk och mall för förfrågan",
      "Svarsmallar och hjälp med att besvara omdömen",
      "Månadsrapport: visningar, sökningar, samtal och vägbeskrivningar",
    ]}
    tiers={[
      {
        name: "Local Start",
        price: "4 900 kr",
        cadence: "engång",
        desc: "Engångsuppsättning för er som vill ha grunden rätt en gång.",
        features: ["Optimering av företagsprofil", "Katalogkontroll", "Lokal sökordsanalys", "En lokal landningssida", "Recensionsflöde uppsatt"],
      },
      {
        name: "Local Growth",
        price: "1 495 kr",
        cadence: "/mån",
        desc: "Löpande arbete som håller profilen aktiv och recensionerna igång.",
        featured: true,
        features: ["Allt i Start (uppstart 2 450 kr)", "Två inlägg i profilen/mån", "Recensionsuppföljning", "Löpande justeringar", "Månadsrapport"],
      },
      {
        name: "Local Multi",
        price: "Offert",
        desc: "För flera orter, filialer eller franchise med många profiler.",
        features: ["Profil per enhet", "Ortsspecifika sidor", "Samlad rapportering", "Rutiner för personalen", "Fast månadspris efter antal enheter"],
      },
    ]}
    pricingNote={
      <>
        Priser exklusive moms. Ingen bindningstid på månadsupplägget. Vi skapar bara lokala sidor och
        profiler för verksamhet ni faktiskt bedriver på orten – ortsbytta kopior skadar er på sikt.
      </>
    }
    process={[
      { title: "Nuläge", body: "Vi mäter hur ni syns i kartsökningar i dag, går igenom profilen och jämför med de tre största lokala konkurrenterna." },
      { title: "Grundfix", body: "Profil, kategorier, tjänster, bilder och företagsuppgifter rättas i ett svep." },
      { title: "Innehåll", body: "Lokal landningssida och profilinlägg som svarar på det kunder faktiskt söker på i er trakt." },
      { title: "Recensioner", body: "Vi sätter ett flöde som gör det enkelt att be om omdömen och en rutin för att besvara dem." },
      { title: "Uppföljning", body: "Varje månad ser ni visningar, sökningar, samtal och vägbeskrivningar – och vad vi gör härnäst." },
    ]}
    honesty={[
      "Vi kan inte garantera plats i Googles lokala topp-tre. Avstånd till sökaren väger tungt och går inte att optimera bort.",
      "Vi köper aldrig recensioner och skriver dem inte åt er. Vi gör det enkelt för riktiga kunder att lämna sina.",
      "Google kan tillfälligt stänga av eller kräva ny verifiering av en profil. Vi driver ärendet men beslutet är deras.",
    ]}
    faqs={[
      { q: "Vad kostar det att komma igång?", a: "Local Growth har 2 450 kr i uppstart och sedan 1 495 kr per månad. Vill ni bara ha grunden gjord en gång kostar Local Start 4 900 kr." },
      { q: "Behöver jag en ny hemsida?", a: "Nej. Vi jobbar med den sajt ni har. Är den väldigt långsam eller saknar kontaktvägar säger vi till, för det bromsar resultatet." },
      { q: "Hur snabbt märks skillnad?", a: "Profilförbättringar syns ofta i statistiken inom två till sex veckor. Lokala sidor tar oftast två till fyra månader." },
      { q: "Kan ni ta bort dåliga recensioner?", a: "Bara om de bryter mot Googles riktlinjer, och då anmäler vi dem. Annars är ett sakligt svar den bästa åtgärden – det läses av alla framtida kunder." },
      { q: "Vi har flera orter, funkar det?", a: "Ja, men bara där ni har verklig verksamhet eller personal. Vi tar fram ett upplägg per enhet i Local Multi." },
    ]}
    related={[
      { name: "SEO", price: "Från 4 900 kr", to: "/tjanster/seo" },
      { name: "Google Ads", price: "3 900 kr setup", to: "/tjanster/google-ads" },
      { name: "Aurora Care", price: "Från 995 kr/mån", to: "/care" },
    ]}
  />
);

export default AuroraLocal;

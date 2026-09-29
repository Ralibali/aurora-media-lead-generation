import OfferPage from "@/components/verkstad/OfferPage";

const AuroraStaff = () => (
  <OfferPage
    slug="ai-personal"
    paketValue="Aurora Staff (AI-medarbetare)"
    serviceType="Managed AI-medarbetare, automation och mänskligt godkända arbetsflöden"
    eyebrow="Aurora Staff"
    title="AI-medarbetare som gör jobbet"
    titleEm="mellan mötena."
    intro="Vi sätter upp tydligt avgränsade AI-roller för sälj, SEO, innehåll, support och administration. De förbereder jobbet, följer fasta rutiner och lämnar känsliga actions till en människa för godkännande."
    seoTitle="AI-medarbetare för företag – sälj, SEO & administration | Aurora Media"
    seoDescription="Aurora Staff ger svenska företag managed AI-medarbetare med tydliga roller, rutiner, integrationer och mänskligt godkännande. Från 995 kr/mån."
    outcomes={[
      { title: "Fler uppgifter blir faktiskt gjorda", body: "Återkommande research, sammanställningar, utkast och uppföljningar kan köras enligt schema i stället för att hamna längst ner på att-göra-listan." },
      { title: "AI med ett tydligt jobb", body: "Varje AI-medarbetare får en avgränsad roll, tillåtna verktyg, instruktioner och ett mätbart mål – inte en generell chatt som ska kunna allt." },
      { title: "Människan behåller kontrollen", body: "Skicka, publicera, ändra kunddata eller påverka externa system först efter rätt nivå av godkännande. Vi bygger spårbarhet i flödet från start." },
      { title: "Samma arbetssätt varje vecka", body: "Rutiner kan återanvändas, förbättras och följas upp. Företaget blir mindre beroende av att någon kommer ihåg nästa steg manuellt." },
    ]}
    includes={[
      "Kartläggning av 1–3 repetitiva arbetsflöden med tydlig affärsnytta",
      "En eller flera avgränsade AI-roller med egna instruktioner och mål",
      "Schemalagda rutiner för återkommande uppgifter",
      "Human-in-the-loop för känsliga actions",
      "Kopplingar till befintliga verktyg där integrationen är rimlig och säker",
      "Logg över uppgifter, status, godkännanden och resultat",
      "Mallbibliotek för vanliga roller inom sälj, SEO, innehåll och administration",
      "Månadsvis genomgång av vad som sparat tid och vad som behöver justeras",
    ]}
    tiers={[
      {
        name: "Staff Solo",
        price: "995 kr",
        cadence: "/mån",
        desc: "En avgränsad AI-roll för ett tydligt återkommande arbetsflöde.",
        features: ["1 AI-roll", "Upp till 5 återkommande rutiner", "Mänskligt godkännande", "Månadsrapport", "Uppstart från 2 995 kr"],
      },
      {
        name: "Staff Team",
        price: "2 495 kr",
        cadence: "/mån",
        desc: "Tre AI-roller som delar samma process och kan lämna över arbete mellan sig.",
        featured: true,
        features: ["Upp till 3 AI-roller", "Upp till 20 återkommande rutiner", "Integrationer efter behov", "Gemensam uppgiftskö", "Uppstart från 5 995 kr"],
      },
      {
        name: "Staff Managed",
        price: "Från 4 995 kr",
        cadence: "/mån",
        desc: "För företag som vill att Aurora löpande driver, förbättrar och kvalitetssäkrar AI-arbetsflödena.",
        features: ["Flera roller och processer", "Prioriterad support", "Löpande förbättringar", "Rapportering på affärsutfall", "Pris efter omfattning och integrationer"],
      },
    ]}
    pricingNote={
      <>
        Priser exklusive moms. API-, modell- och tredjepartskostnader ingår bara när det uttryckligen står i offerten.
        Vi börjar med ett avgränsat arbetsflöde och skalar först när det är stabilt.
      </>
    }
    process={[
      { title: "Välj jobbet", body: "Vi identifierar en återkommande uppgift där utfallet går att kontrollera och där sparad tid eller fler affärer går att mäta." },
      { title: "Sätt ramarna", body: "Rollen får instruktioner, datakällor, tillåtna actions, stopplägen och regler för när en människa måste godkänna." },
      { title: "Kör i skuggläge", body: "AI-medarbetaren förbereder jobbet utan att publicera eller ändra externa system. Vi jämför resultatet mot ert nuvarande arbetssätt." },
      { title: "Koppla på actions", body: "När kvaliteten är stabil aktiveras godkända integrationer stegvis. Riskfyllda actions fortsätter kräva mänskligt godkännande." },
      { title: "Mät och förbättra", body: "Vi följer upp sparad tid, genomförda uppgifter och fel. Dåliga rutiner tas bort i stället för att automatiseras vidare." },
    ]}
    honesty={[
      "Vi säljer inte en 'helt autonom anställd'. AI kan göra fel och känsliga actions ska ha rätt nivå av mänsklig kontroll.",
      "En AI-roll är bara värdefull när arbetsuppgiften, datan och målet är tydliga. Vi automatiserar inte ett oklart arbetssätt bara för att det går.",
      "Integrationer och modellkostnader varierar mellan kunder. De specificeras innan något som kostar extra aktiveras.",
    ]}
    faqs={[
      { q: "Vad kan en AI-medarbetare göra?", a: "Exempel är att kvalificera leads, sammanfatta inkommande förfrågningar, förbereda uppföljningar, hitta SEO-åtgärder, skapa innehållsutkast, sammanställa rapporter och bevaka återkommande arbetslistor." },
      { q: "Kan den skicka mejl eller publicera automatiskt?", a: "Ja när det är lämpligt, men vi börjar normalt med att den förbereder actions som en människa godkänner. Automatiskt utförande aktiveras först för stabila och låg-risk flöden." },
      { q: "Måste vi byta system?", a: "Oftast inte. Poängen är att koppla ihop och förstärka det ni redan använder. Om ett system saknar rimlig integration säger vi det innan projektet startar." },
      { q: "Hur snabbt kan vi börja?", a: "Ett första avgränsat flöde kan normalt sättas upp betydligt snabbare än ett helt nytt internt system. Exakt omfattning beror på datakällor och integrationer." },
      { q: "Är detta samma sak som en chatbot?", a: "Nej. En chatbot svarar främst på frågor. Aurora Staff är uppgiftsdrivet: rollen får mål, rutiner, verktyg, en kö av jobb och regler för godkännande." },
    ]}
    related={[
      { name: "Aurora Ops", price: "Managed automation", to: "/aurora-ops" },
      { name: "Aurora Sight", price: "AI-synlighet", to: "/ai-synlighet" },
      { name: "AI-automation", price: "Skräddarsytt", to: "/ai-automation-foretag" },
    ]}
  />
);

export default AuroraStaff;

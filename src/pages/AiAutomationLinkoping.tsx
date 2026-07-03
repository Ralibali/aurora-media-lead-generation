import LocalLandingPage from "@/components/nordic/LocalLandingPage";

const AiAutomationLinkoping = () => (
  <LocalLandingPage
    slug="ai-automation-linkoping"
    metaTitle="AI-automation för företag i Linköping – från 14 900 kr"
    metaDesc="AI-automation i Linköping: mejl, dokument, offerthantering, Fortnox- och Visma-integrationer. Bygg bort manuellt Excel-arbete med lokal partner."
    keywords="AI automation Linköping, processautomation Linköping, RPA Linköping, AI-integration Fortnox"
    crumbLabel="AI-automation i Linköping"
    eyebrow="aurora media · ai-automation · linköping"
    h1="AI-automation"
    h1Italic="i Linköping."
    lead="Vi automatiserar de administrativa flödena som stjäl tid i vardagen – mejl, offerter, dokument, tidrapporter och överföringar mellan system. Ni får en lösning som faktiskt körs varje dag, inte en pilot som samlar damm."
    serviceType={["AI automation", "Process automation", "System integration", "Custom software"]}
    problems={[
      { n: "01", title: "Samma data i tre system", desc: "Order i mejl, registrering i affärssystemet, faktura i Fortnox – och någon skriver in det tre gånger." },
      { n: "02", title: "Offerter som tar timmar", desc: "Kunden ber om pris. Ni öppnar tre Excel-flikar, tittar i tidigare mejl och skriver ihop en offert från grunden – varje gång." },
      { n: "03", title: "Inbox-hantering äter dagen", desc: "Beställningar, förfrågningar och underlag ska sorteras, sammanfattas och skickas vidare. Halva veckan går till mejl." },
      { n: "04", title: "Rapporter från kaos", desc: "Månadsrapporten kräver att någon manuellt drar ut listor, klipper och limmar in i en presentation. Fel siffror smyger sig in." },
    ]}
    services={[
      { title: "Mejl- och dokumentautomation", desc: "AI läser inkommande mejl och bilagor, extraherar data (order, referenser, belopp), skapar utkast och skickar vidare rätt." },
      { title: "Offert- och ÄTA-flöden", desc: "Automatiserad prissättning från era regler + tidigare offerter. Ni granskar och skickar – i stället för att bygga från noll." },
      { title: "Fortnox-, Visma- och Björn Lundén-integrationer", desc: "Fakturering, kund- och artikelregister, tidrapporter och löneunderlag automatiskt – utan mellanhandsverktyg som kostar per rad." },
      { title: "Intern AI-assistent", desc: "En chatbot som svarar på personalens frågor från era rutiner, avtal och dokument. Spårbara källor, ingen data lämnar EU." },
      { title: "Custom RPA & webhooks", desc: "När det inte finns ett API bygger vi robotar eller webhook-flöden som kopplar ihop era befintliga verktyg." },
      { title: "Monitorering och support", desc: "Vi övervakar körningen, larmar vid fel och står för underhåll. Ni får en driftpartner, inte bara en leverans." },
    ]}
    faqs={[
      { q: "Vad kostar AI-automation för ett företag i Linköping?", a: "Enklare flöden (t.ex. mejl → CRM) från 14 900 kr. Medelstora projekt (offerthantering, integrationer) 34 900–89 000 kr. Riktigt komplexa system offereras separat efter kartläggning." },
      { q: "Hur börjar vi?", a: "Med en kostnadsfri AI-kartläggning där vi identifierar 3–5 flöden med tydlig ROI. Sedan väljer ni ett att börja med. Ingen försäljningspress." },
      { q: "Var lagras vår data?", a: "Som standard i EU (Frankfurt/Stockholm). Vi använder europeiska LLM:er (Mistral, Azure OpenAI EU) när det är krav. GDPR-DPA på plats." },
      { q: "Vi använder Fortnox – funkar det?", a: "Ja. Vi integrerar mot Fortnox API dagligen: fakturor, kunder, artiklar, tidrapporter, projekt. Samma sak för Visma eBokföring, Visma.net och Björn Lundén." },
      { q: "Vad händer om AI:n gör fel?", a: "Vi bygger med människan i loopen där risken är hög (t.ex. utgående fakturor). AI föreslår, människa godkänner. Där risken är låg (kategorisering, dubblettdetektion) kör vi automatiskt med loggning." },
    ]}
    relatedLinks={[
      { label: "AI-automation för företag", to: "/ai-automation-foretag", desc: "Nationell översikt av vår tjänst för processautomation och integrationer." },
      { label: "AI-byrå i Linköping", to: "/ai-byra-linkoping", desc: "Om ni vill kombinera automation med interna system och AI-assistenter i samma projekt." },
      { label: "AI-konsult i Linköping", to: "/ai-konsult-linkoping", desc: "Behöver ni rådgivning eller specialistkompetens inhouse – inte färdig lösning?" },
      { label: "Gör AI-kartläggningen", to: "/ai-karta", desc: "3 minuter. Ni får en konkret rapport med prioriterade flöden och grov kostnadsuppskattning." },
    ]}
  />
);

export default AiAutomationLinkoping;

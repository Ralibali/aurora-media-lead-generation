import LocalLandingPage from "@/components/nordic/LocalLandingPage";

const AiKonsultLinkoping = () => (
  <LocalLandingPage
    slug="ai-konsult-linkoping"
    metaTitle="AI-konsult i Linköping – strategi, implementation & utbildning"
    metaDesc="AI-konsult i Linköping. Vi hjälper er välja rätt AI-verktyg, bygga interna assistenter och utbilda teamet. Fast pris, GDPR, EU-datalagring."
    keywords="AI-konsult Linköping, AI-strategi Linköping, ChatGPT företag Linköping, AI-utbildning Östergötland"
    crumbLabel="AI-konsult i Linköping"
    eyebrow="aurora media · ai-konsult · linköping"
    h1="AI-konsult"
    h1Italic="i Linköping."
    lead="Vi hjälper er navigera bland AI-verktygen, välja de som faktiskt passar er verksamhet och komma i drift utan att slösa månader på pilotprojekt. Rådgivning som slutar med kod och rutiner – inte en PowerPoint."
    serviceType={["AI consulting", "AI strategy", "AI implementation", "AI training"]}
    problems={[
      { n: "01", title: "Ledningen frågar ‘vad ska vi göra med AI?’", desc: "Ni behöver ett konkret svar med prioriterade use cases – inte en generisk trendrapport." },
      { n: "02", title: "Verktygsdjungeln", desc: "ChatGPT, Copilot, Gemini, Claude, Perplexity, Mistral, Notion AI, egen chatbot – vad ska vem använda till vad?" },
      { n: "03", title: "GDPR och datasäkerhet stoppar allt", desc: "Ni får inte lägga in kunddata i vilket verktyg som helst. Ingen vet vad som är okej och inte." },
      { n: "04", title: "Teamet använder AI olika mycket", desc: "Några är superusers, resten kör som vanligt. Ingen samsyn på processer, prompts eller kvalitet." },
    ]}
    services={[
      { title: "AI-strategi och use case-workshop", desc: "Halvdagsworkshop med ledning + operativt team. Ni går ut med 5–10 prioriterade use cases, quick wins och en 6-månadersplan." },
      { title: "Verktygsval och policy", desc: "Vi hjälper er välja rätt AI-plattformar för olika roller och tar fram en AI-policy som funkar för GDPR, ISO och kundavtal." },
      { title: "Egen AI-assistent (RAG)", desc: "En chatbot som söker i era rutiner, avtal, produktinformation eller intranät. Svaren är källhänvisade och datan lämnar inte EU." },
      { title: "Prompt engineering och rutiner", desc: "Färdiga promptbibliotek och SOP:er för de flöden där AI faktiskt sparar tid – för sälj, support, HR eller ekonomi." },
      { title: "Utbildning för hela teamet", desc: "Praktisk utbildning på 2–4 timmar där alla får jobba med verkliga case från er vardag. Ingen livsstilscoaching." },
      { title: "AI-CTO on demand", desc: "Löpande rådgivning som bollplank i ledningsgrupp, styrelse eller mot er utvecklingsavdelning." },
    ]}
    faqs={[
      { q: "Vad kostar en AI-konsult i Linköping?", a: "Workshop och strategi: 24 900–49 900 kr som fast pris. Löpande rådgivning: från 12 000 kr/månad. Implementationsprojekt offereras separat." },
      { q: "Jobbar ni bara med tekniska team?", a: "Nej. Merparten av våra uppdrag är mot ledning, ekonomi, sälj och HR. Vi översätter tekniken till affärsvärde – det är hela poängen." },
      { q: "Hur säkerställer ni GDPR?", a: "Vi använder EU-hostade modeller (Azure OpenAI EU, Mistral, AWS Bedrock EU), DPA på plats med alla leverantörer och hjälper er sätta interna riktlinjer för vad som får skickas till LLM." },
      { q: "Har ni koll på svensk kontext?", a: "Ja. Kollektivavtal, Fortnox, Skatteverket, Bolagsverket, svenska språknyanser – vi bygger inte generiska amerikanska demos." },
      { q: "Kan ni komma på plats i Linköping?", a: "Ja. Workshops körs som regel fysiskt hos er eller i vår lokal. Löpande arbete sker digitalt med regelbundna avstämningar." },
    ]}
    relatedLinks={[
      { label: "AI-konsult i Sverige", to: "/ai-konsult-sverige", desc: "Nationell översikt av vår konsulttjänst med bredare use cases och case studies." },
      { label: "AI-byrå i Linköping", to: "/ai-byra-linkoping", desc: "Om ni vill ha en partner som både rådger OCH bygger lösningen." },
      { label: "AI-automation i Linköping", to: "/ai-automation-linkoping", desc: "När rådgivningsfasen är klar – här bygger vi de faktiska flödena." },
      { label: "Gör AI-kartläggningen", to: "/ai-karta", desc: "3 minuter för att få ett första underlag inför en strategiworkshop." },
    ]}
  />
);

export default AiKonsultLinkoping;

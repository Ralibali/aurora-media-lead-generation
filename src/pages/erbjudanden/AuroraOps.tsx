import OfferPage from "@/components/verkstad/OfferPage";

const AuroraOps = () => (
  <OfferPage
    slug="aurora-ops"
    paketValue="Aurora Ops"
    serviceType="Managed automation, analys, drift och kundkommunikation"
    eyebrow="Aurora Ops"
    title="Era digitala flöden ska"
    titleEm="fungera även på måndag."
    intro="Aurora Ops är det löpande lagret ovanpå webb, SaaS och interna system: automationer, begriplig analys, övervakad drift och samlad kundkommunikation. Vi bygger på beprövade open-source-komponenter när det passar, men ni köper en fungerande leverans – inte ännu ett verktyg att administrera."
    seoTitle="Automation, analys och managed drift för företag | Aurora Ops"
    seoDescription="Aurora Ops samlar automationer, analytics, drift och kundkommunikation för svenska småföretag. Fasta paket, tydlig onboarding och löpande övervakning."
    outcomes={[
      {
        title: "Automation Packs",
        body: "Leads, formulär, CRM, mejl, påminnelser och interna uppgifter kopplas ihop i färdiga branschflöden med övervakning och tydligt ägarskap.",
      },
      {
        title: "Pulse",
        body: "Trafik, leads och konverteringar blir en kort rapport med vad som ändrats och vilka åtgärder som är rimliga – i stället för ännu en dashboard ingen öppnar.",
      },
      {
        title: "Managed drift",
        body: "Deployment, domän, SSL, uptime, backup-rutin och återställningsplan hanteras som en tjänst för de webb- och SaaS-lösningar där vi ansvarar för driften.",
      },
      {
        title: "Inbox & notifieringar",
        body: "Webbchatt, e-post, SMS och produktnotiser kan samlas i ett gemensamt arbetsflöde med mänsklig handoff när automation inte räcker.",
      },
    ]}
    includes={[
      "Kartläggning av ett konkret arbetsflöde och tydliga mål före implementation",
      "Branschpaketerade automationer för exempelvis lead, bokning, offert, uppföljning och recension",
      "Gemensam eventmodell för notifieringar och integrationer där det ger nytta",
      "Konverterings- och händelsespårning med leverantörsoberoende analytics-lager",
      "Monitoring, felhantering och dokumenterade manuella fallback-rutiner",
      "Managed deployment och backup-rutin för projekt där Aurora Media äger driftansvaret",
      "Månadsvis genomgång av fel, användning och förbättringsmöjligheter",
      "API- och integrationsarbete offereras först efter att vi verifierat att systemet faktiskt går att koppla",
    ]}
    tiers={[
      {
        name: "Automation Pack",
        price: "7 900 kr",
        cadence: "uppsättning",
        desc: "Ett avgränsat flöde som ersätter ett konkret manuellt moment och går att mäta.",
        features: [
          "Ett huvudflöde med upp till fem steg",
          "Onboarding och datamappning",
          "Felspårning och manuell fallback",
          "Dokumentation av flödet",
          "Drift från 1 490 kr/mån",
        ],
      },
      {
        name: "Ops",
        price: "1 490 kr",
        cadence: "/mån",
        desc: "För företag som vill att någon faktiskt följer upp automation, data och drift efter lansering.",
        featured: true,
        features: [
          "Övervakning av aktiva flöden",
          "Pulse-rapport med trafik, leads och konvertering",
          "Uptime och incidentöversikt för avtalade system",
          "Löpande mindre justeringar",
          "Support samma arbetsdag",
        ],
      },
      {
        name: "Integrerad Ops",
        price: "Från 2 990 kr",
        cadence: "/mån",
        desc: "Flera flöden, fler kanaler eller system där kunddialog och interna processer behöver hänga ihop.",
        features: [
          "Flera automationer och integrationer",
          "Inbox-/notifieringsflöden",
          "Team- och rollanpassning där det behövs",
          "Prioriterad monitoring",
          "Fast scope på större integrationsarbete",
        ],
      },
    ]}
    pricingNote={
      <>
        Priser exklusive moms. Tredjepartskostnader för SMS, e-post, AI, hosting och andra
        leverantörer redovisas separat. Vi använder inte en open-source-komponent som ursäkt
        för att lova en funktion som inte är testad i er miljö.
      </>
    }
    process={[
      {
        title: "Välj ett problem",
        body: "Vi börjar med det manuella moment som kostar mest tid eller tappar flest affärer – inte med en lång verktygslista.",
      },
      {
        title: "Koppla och mät",
        body: "Vi bygger minsta stabila flöde, märker upp viktiga händelser och ser till att det finns en fallback när en integration ligger nere.",
      },
      {
        title: "Kör pilot",
        body: "Flödet körs på riktig trafik i avgränsad omfattning. Fel, tidsbesparing och konvertering följs upp innan vi skalar.",
      },
      {
        title: "Driftsätt",
        body: "När piloten håller flyttas den till löpande drift med monitoring, dokumentation och tydligt ansvar.",
      },
      {
        title: "Bygg vidare",
        body: "Nästa automation läggs till först när den tidigare fungerar och skapar ett mätbart värde.",
      },
    ]}
    honesty={[
      "Aurora Ops är en managed tjänst, inte en färdig självbetjäningsplattform. Delar av leveransen använder open-source och externa API:er under huven.",
      "Managed drift gäller bara system och miljöer som vi har fått åtkomst och ansvar för. Backup räknas inte som färdig förrän återställning har verifierats.",
      "WhatsApp, Instagram och andra tredjepartskanaler kan ändra API-regler. Vi säljer därför inte en kanal som stabil innan den har testats med kundens riktiga konto.",
      "Pulse ersätter inte bokföring eller ekonomisk rapportering. Det är ett operativt beslutsunderlag för webb, leads och digitala flöden.",
      "Större integrationer mot affärs-, boknings- eller journalsystem verifieras innan fast pris lämnas.",
    ]}
    faqs={[
      {
        q: "Måste vi byta alla våra system?",
        a: "Nej. Grundidén är tvärtom att koppla ihop det ni redan använder och bara ersätta sådant som faktiskt bromsar arbetet.",
      },
      {
        q: "Är automationerna AI-baserade?",
        a: "Bara där AI ger ett tydligt värde. Deterministiska steg som betalningar, statusbyten och utskick byggs hellre med vanliga regler än med en språkmodell.",
      },
      {
        q: "Vad är Pulse?",
        a: "Ett tunt analyslager som samlar de händelser vi behöver och gör dem begripliga: trafik, leads, konverteringar, avvikelser och konkreta nästa steg.",
      },
      {
        q: "Kan ni drifta en Lovable- eller React-app?",
        a: "Ja, efter en teknisk genomgång. Vi sätter först ansvar för deployment, miljövariabler, backup, loggar och återställning innan vi kallar lösningen managed drift.",
      },
      {
        q: "Kan Inbox ta WhatsApp och Instagram?",
        a: "Tekniskt ofta ja, men Meta-kopplingen testas per konto och säljs inte som garanterad funktion innan den är verifierad.",
      },
    ]}
    related={[
      { name: "AI-automation", price: "Från 4 900 kr", to: "/ai-automation-foretag" },
      { name: "Aurora Voice", price: "Drift från 1 995 kr/mån", to: "/ai-receptionist" },
      { name: "Aurora Care", price: "Från 995 kr/mån", to: "/care" },
    ]}
  />
);

export default AuroraOps;

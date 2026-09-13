import OfferPage from "@/components/verkstad/OfferPage";

const AuroraVoice = () => (
  <OfferPage
    slug="ai-receptionist"
    paketValue="Aurora Voice (AI-receptionist)"
    serviceType="AI-receptionist för telefon, chatt och e-post"
    eyebrow="Aurora Voice"
    title="En receptionist som"
    titleEm="aldrig missar ett samtal."
    intro="För trafikskolor, hotell, restauranger, kliniker och andra verksamheter där telefonen ringer när ni inte kan svara. Aurora Voice tar samtalet, svarar på vanliga frågor, kvalificerar och lämnar över ett komplett ärende till er."
    seoTitle="AI-receptionist för telefon och chatt – missa inga kunder | Aurora Media"
    seoDescription="Aurora Voice svarar på samtal, chatt och e-post dygnet runt, besvarar vanliga frågor och samlar in bokningsunderlag. Uppsättning från 14 900 kr, drift från 1 995 kr/mån."
    outcomes={[
      { title: "Inga obesvarade samtal", body: "Samtal utanför öppettid, i kö eller under lektion tas emot i stället för att gå förlorade till nästa leverantör." },
      { title: "Vanliga frågor hanteras direkt", body: "Priser, öppettider, villkor, vägbeskrivning, tillgängliga tider – ni tränar den på era egna svar." },
      { title: "Kvalificerade ärenden i inkorgen", body: "Varje samtal blir en sammanfattning med namn, kontaktuppgifter, ärende och nästa steg – till e-post eller ert system." },
      { title: "Mätbar tidsbesparing", body: "Ni ser antal hanterade samtal, vanligaste frågorna och hur mycket telefontid som frigjorts." },
    ]}
    includes={[
      "Uppsättning av röst-, chatt- eller e-postassistent efter behov",
      "Manus och kunskapsbas byggd på era egna svar och priser",
      "Svenska som standard, engelska som tillval",
      "Överlämning till människa vid känsliga eller ovanliga ärenden",
      "Sammanfattning av varje ärende till e-post eller ert system",
      "Transkript och logg för uppföljning",
      "GDPR-genomgång: information till uppringaren, lagringstid och personuppgiftsbiträdesavtal",
      "Justering av manus efter första veckans riktiga samtal",
    ]}
    tiers={[
      {
        name: "Voice Pilot",
        price: "14 900 kr",
        cadence: "uppsättning",
        desc: "En avgränsad pilot på ett användningsfall, så ni ser om det håller i er vardag.",
        features: ["Ett nummer eller en chattkanal", "Kunskapsbas för vanliga frågor", "Ärenden till e-post", "Fyra veckors utvärdering", "Rapport med rekommendation"],
      },
      {
        name: "Voice Drift",
        price: "1 995 kr",
        cadence: "/mån",
        desc: "Löpande drift efter piloten, med justeringar och uppföljning.",
        featured: true,
        features: ["Drift och övervakning", "Löpande manusjusteringar", "Månadsrapport", "Support samma arbetsdag", "Samtalsavgifter tillkommer"],
      },
      {
        name: "Voice Integrerad",
        price: "Offert",
        desc: "Koppling mot bokningssystem, CRM eller journalsystem där det är tekniskt möjligt.",
        features: ["Integrationsanalys ingår", "Utveckling mot ert system", "Behörigheter och loggning", "Testmiljö före drift", "Fast pris efter scope"],
      },
    ]}
    pricingNote={
      <>
        Priser exklusive moms. Samtalstrafik och kostnad för underliggande röst- och AI-tjänster
        faktureras löpande enligt förbrukning och redovisas öppet. Vi börjar alltid med en pilot –
        vi vill inte att ni betalar för en integration innan vi vet att flödet fungerar hos er.
      </>
    }
    process={[
      { title: "Kartläggning", body: "Vi lyssnar igenom vilka samtal ni faktiskt får, vad som är rutin och vad som kräver en människa." },
      { title: "Manus", body: "Vi skriver svaren tillsammans med er, med era priser och villkor. Ni godkänner allt innan något går live." },
      { title: "Pilot", body: "Assistenten tar ett avgränsat flöde, till exempel samtal utanför öppettid. Ni lyssnar på transkripten." },
      { title: "Justering", body: "Efter riktiga samtal finslipar vi manus, överlämningsregler och tonläge." },
      { title: "Drift", body: "När ni är nöjda går vi till löpande drift, med möjlighet att koppla på fler kanaler eller integrationer." },
    ]}
    honesty={[
      "Aurora Voice är i dag ett uppsättningsuppdrag, inte en färdig självbetjäningsprodukt. Varje lösning byggs och testas tillsammans med er.",
      "Vi har inga färdiga, godkända integrationer mot specifika boknings- eller journalsystem. Integration utreds per system och offereras separat när vi vet att den är tekniskt och juridiskt möjlig.",
      "Assistenten hanterar rutinärenden. Känsliga, avvikande eller arga samtal lämnas över till en människa – det är en inställning, inte en förhoppning.",
      "Vi lovar inte en viss automationsgrad i förväg. Piloten visar den faktiska siffran, och sen bestämmer ni om det är värt det.",
    ]}
    faqs={[
      { q: "Hör kunden att det är en AI?", a: "Ja. Assistenten säger att den är en digital assistent hos er. Vi rekommenderar aldrig att dölja det – det slår tillbaka." },
      { q: "Passar det en trafikskola?", a: "Det är ett typiskt fall: många samtal om priser, paket och lediga tider medan personalen sitter i bilen. Assistenten tar frågorna och samlar in bokningsunderlag som ni bekräftar." },
      { q: "Kan den boka direkt i vårt system?", a: "Bara om ert system har ett API som tillåter det, och det utreder vi i integrationsanalysen. Fram till dess lämnar den ett komplett bokningsunderlag som ni godkänner." },
      { q: "Hur hanteras personuppgifter?", a: "Vi går igenom vilka uppgifter som samlas in, hur länge de sparas och var. Ni får ett personuppgiftsbiträdesavtal, och uppringaren informeras i början av samtalet." },
      { q: "Vad kostar samtalen?", a: "Trafik och AI-förbrukning ligger normalt på några kronor per samtal beroende på längd. Vi redovisar faktisk kostnad, utan påslag i procent utöver driftavgiften." },
      { q: "Kan vi stänga av den snabbt?", a: "Ja. Numret kan när som helst kopplas tillbaka till er vanliga växel." },
    ]}
    related={[
      { name: "AI-automation", price: "Från 4 900 kr", to: "/ai-automation-foretag" },
      { name: "Gratis AI-karta", price: "0 kr", to: "/ai-karta" },
      { name: "Lokal synlighet", price: "Från 1 495 kr/mån", to: "/lokal-synlighet" },
    ]}
  />
);

export default AuroraVoice;

import ServicePageTemplate from "./ServicePageTemplate";

const MetaAds = () => (
  <ServicePageTemplate
    slug="meta-ads"
    title="Meta Ads – 3 900 kr setup."
    intro="Facebook och Instagram-annonser med riktig Pixel-installation och tydliga annonsgrupper. Inga månadsavgifter du inte beställt."
    paketName="Ads"
    seoTitle="Meta Ads (Facebook + Instagram) från 3 900 kr | Aurora Media"
    seoDescription="Setup av Facebook + Instagram-annonser med Meta Pixel, custom audiences och conversion tracking. Fast pris från 3 900 kr."
    includes={[
      "Meta Business Manager-uppsättning",
      "Meta Pixel-installation och Conversion API",
      "Custom audiences från din kunddata",
      "Lookalike audiences",
      "1–3 kampanjer med annonsgrupper och creatives",
      "A/B-test av två creatives per kampanj",
      "30 dagars uppföljning ingår",
      "Rapport med rekommendationer",
    ]}
    process={[
      { label: "Steg 1", title: "Strategi", body: "Vem köper, vad är värdet av en konvertering, vilka creatives funkar i din bransch?" },
      { label: "Steg 2", title: "Pixel + tracking", body: "Pixel + CAPI installeras innan vi spenderar en krona på annonser." },
      { label: "Steg 3", title: "Lansering", body: "Soft launch, justering, full launch. 5–7 dagar." },
      { label: "Steg 4", title: "Överlämning", body: "Du får tillgång och dokumentation. Vill du att jag optimerar vidare är det ett val." },
    ]}
    tiers={[
      { name: "Setup", price: "3 900 kr", time: "3–5 dagar", desc: "Engångssetup, du driver vidare själv eller med någon annan.", features: ["Pixel + CAPI", "1–3 kampanjer", "Audiences", "30 dagars uppföljning"] },
      { name: "Setup + 3 mån", price: "9 900 kr", time: "Setup + 3 månaders optimering", desc: "Det vanligaste paketet. Optimering varje vecka, nya creatives, A/B-test.", features: ["Allt i Setup", "Veckovis optimering", "Nya creatives 1 gång/månad", "Månatlig rapport"], featured: true },
      { name: "Löpande", price: "2 490 kr/mån", time: "Månadsvis", desc: "Säg upp när du vill. Ingen bindning.", features: ["Veckovis optimering", "Creative-uppdateringar", "Audience-test", "Månatlig rapport"] },
    ]}
    whyAffordable="Pixel-installation är en engångsgrej och bör göras rätt – inte trasslas till. Jag tar fast pris istället för byråtimmar och kräver ingen bindning."
    faqs={[
      { q: "Hjälper du med creatives (bilder/video)?", a: "Statiska creatives ingår. Behöver du video kan jag koppla in fotograf eller hjälpa till med snabba mobilfilmer själv." },
      { q: "Hur stor annonsbudget krävs?", a: "Minst 3 000–5 000 kr/mån för att få stabil data. Mindre och Meta lär sig aldrig din målgrupp." },
      { q: "Vad är CAPI och varför ska jag bry mig?", a: "Conversion API skickar data direkt server-till-server. Med iOS-restriktioner är Pixel ensam inte längre tillförlitlig. CAPI är skillnaden mellan att veta och gissa." },
      { q: "Får jag tillgång till kontot?", a: "Alltid. Det är ditt Business Manager-konto, jag är bara inbjuden som partner." },
    ]}
    related={[
      { name: "Google Ads", price: "3 900 kr setup", to: "/tjanster/google-ads" },
      { name: "Content", price: "1 490 kr/artikel", to: "/tjanster/content" },
      { name: "Fotografering", price: "4 900 kr/halvdag", to: "/tjanster/fotografering" },
    ]}
  />
);

export default MetaAds;

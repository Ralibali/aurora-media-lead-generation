import ServicePageTemplate from "./ServicePageTemplate";

const Content = () => (
  <ServicePageTemplate
    slug="content"
    title="Content – 995 kr/artikel."
    intro="SEO-optimerade artiklar skrivna med AI och redigerade av en människa. 1 200–1 800 ord, klar inom en dag."
    paketName="Content"
    seoTitle="SEO-content från 995 kr/artikel | Aurora Media Linköping"
    seoDescription="SEO-optimerade artiklar 1 200–1 800 ord, levererade inom en dag. AI-skrivet, mänskligt redigerat. Volymrabatt vid pakets-köp."
    includes={[
      "1 200–1 800 ord per artikel",
      "Sökordsanalys för varje rubrik",
      "Tydlig struktur (H2/H3, listor, FAQ-sektion)",
      "Internlänkning till befintligt innehåll",
      "Optimerad meta-titel och beskrivning",
      "Faktagranskning av relevanta uppgifter",
      "Levererat som markdown eller direkt i WordPress",
      "Två revisionsrundor ingår",
    ]}
    process={[
      { label: "Steg 1", title: "Brief", body: "Du säger ämne och målgrupp. Jag föreslår vinkel och sökord." },
      { label: "Steg 2", title: "Utkast", body: "AI-genererat utkast inom några timmar. Du läser och tipsar om vinkel." },
      { label: "Steg 3", title: "Redigering", body: "Jag finputsar manuellt – ton, fakta, citat, exempel." },
      { label: "Steg 4", title: "Leverans", body: "Markdown, Word eller direkt i ditt CMS – samma dag." },
    ]}
    tiers={[
      { name: "Enskild artikel", price: "995 kr", time: "En dag", desc: "En artikel. Bra för att testa om vi matchar.", features: ["1 artikel 1 200–1 800 ord", "Sökordsanalys", "Meta-titel + beskrivning", "2 revisionsrundor"] },
      { name: "5-pack", price: "3 990 kr", time: "Tre dagar", desc: "Vanligaste valet. 5 artiklar med tematisk röd tråd.", features: ["5 artiklar", "Innehållsplan", "Internlänkning mellan artiklarna", "Bättre styckpris"], featured: true },
      { name: "Månadspaket", price: "Från 3 490 kr/mån", time: "Löpande", desc: "4 artiklar/månad. För dig som bygger SEO-trafik systematiskt.", features: ["4 artiklar/mån", "Kvartalsvis innehållsplan", "Performance-rapport", "Säg upp med 30 dagars varsel"] },
    ]}
    whyAffordable="AI gör tunga lyftet, jag gör skillnaden. En traditionell copywriter behöver 4–6 timmar per artikel. Jag behöver 60 minuter med rätt verktyg – och kan därför ta 995 kr istället för 4 000–8 000 kr."
    faqs={[
      { q: "Är det inte uppenbart AI-skrivet?", a: "Inte med min process. AI gör utkast, jag skriver om allt som låter generiskt – meningsstruktur, exempel, ton. Lägg gärna en blindtest-artikel mot din befintliga byrås text och jämför." },
      { q: "Vilka ämnen klarar du?", a: "Tech, B2B SaaS, juridik (lättare områden), bygg, transport, e-handel. Mer nischat (medicin, finans, lag) löser vi med expertintervju." },
      { q: "Vem äger texten?", a: "Du. Helt och hållet. Jag använder den inte någon annanstans." },
      { q: "Kan jag få bilder också?", a: "Ja, jag kan generera AI-bilder eller koppla in fotograf. Diskuteras per artikel." },
    ]}
    related={[
      { name: "SEO", price: "Från 4 900 kr", to: "/tjanster/seo" },
      { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
      { name: "Grafisk profil", price: "Från 5 900 kr", to: "/tjanster/grafisk-profil" },
    ]}
  />
);

export default Content;

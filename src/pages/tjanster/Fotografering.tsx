import ServicePageTemplate from "./ServicePageTemplate";

const Fotografering = () => (
  <ServicePageTemplate
    slug="fotografering"
    title="Fotografering – 4 900 kr/halvdag."
    intro="Produkt-, miljö- och porträttfoto i Linköping och Östergötland. Levererat redigerat inom 5 dagar."
    paketName="Annat"
    seoTitle="Fotograf Linköping – 4 900 kr/halvdag | Aurora Media"
    seoDescription="Produktfoto, miljöfoto och porträtt i Linköping och Östergötland. Halvdag 4 900 kr, heldag 7 900 kr. Bilderna redigerade och klara inom 5 dagar."
    includes={[
      "Halvdag (4 timmar) eller heldag (8 timmar) på plats",
      "Råbilder + 30 redigerade per halvdag",
      "Webb- och tryckformat (JPG + RAW)",
      "Fri användning för ditt företag",
      "Porträtt, miljö, produktfoto eller mix",
      "Stativ, ljus, snabb objektiv på plats",
      "Lokalt: ingen reseersättning inom Linköping",
      "Levererat via WeTransfer eller Drive",
    ]}
    process={[
      { label: "Steg 1", title: "Brief", body: "20 min samtal: vad ska bilderna användas till, vilken känsla." },
      { label: "Steg 2", title: "Plats & dag", body: "Vi bestämmer plats och tid. Inomhus, utomhus eller mix." },
      { label: "Steg 3", title: "Fotografering", body: "Halvdag eller heldag, du är med och styr eller låter mig jobba." },
      { label: "Steg 4", title: "Leverans", body: "Redigerade bilder inom 5 dagar via WeTransfer." },
    ]}
    tiers={[
      { name: "Halvdag", price: "4 900 kr", time: "4 timmar + 30 bilder", desc: "Räcker för de flesta jobb. Porträtt + miljö, eller produktfoto i studio.", features: ["4 timmars fotografering", "30 redigerade bilder", "Web + tryck-format", "Levereras inom 5 dagar"] },
      { name: "Heldag", price: "7 900 kr", time: "8 timmar + 60 bilder", desc: "Större produktion eller flera personer/platser.", features: ["8 timmars fotografering", "60 redigerade bilder", "Web + tryck-format", "Levereras inom 5 dagar"], featured: true },
      { name: "Extra bilder", price: "150 kr/st", time: "Tillägg", desc: "Vill du ha fler från samma session.", features: ["Per redigerad bild", "Från befintlig session", "Levereras inom 3 dagar"] },
    ]}
    whyAffordable="Jag är inte studio-fotograf på heltid – det är en del av tjänsteportföljen. Det betyder lägre overhead och lägre pris. Resultatet är ändå mer än bra nog för webb, sociala medier och de flesta tryck-jobb."
    faqs={[
      { q: "Var fotograferar du?", a: "Linköping, Norrköping, Mjölby, Motala – ingen reseersättning. Andra städer i Östergötland: 250 kr/h körning." },
      { q: "Behövs studio?", a: "För större produktbatcher hyr vi studio – 1 500 kr extra. Mindre setup gör jag i din lokal." },
      { q: "Får jag rättigheterna?", a: "Ja, fri användning för ditt företag. Säljer jag inte bilderna vidare." },
      { q: "Hur många kan vara med på en halvdag?", a: "Upp till 5 personer för porträtt. Fler – välj heldag." },
    ]}
    related={[
      { name: "Grafisk profil", price: "Från 5 900 kr", to: "/tjanster/grafisk-profil" },
      { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
      { name: "E-handel", price: "Från 19 900 kr", to: "/tjanster/ehandel" },
    ]}
  />
);

export default Fotografering;

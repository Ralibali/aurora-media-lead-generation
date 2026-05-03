import ServicePageTemplate from "./ServicePageTemplate";

const Ehandel = () => (
  <ServicePageTemplate
    slug="ehandel"
    label="E-handel & betalflöden"
    title="E-handel som kan sälja, mäta och växa"
    intro="Shopify, Stripe eller skräddarsydd checkout beroende på vad du faktiskt behöver. Fokus är inte bara en snygg butik — utan produktstruktur, betalflöde, mätning och en grund som går att skala."
    paketName="E-handel"
    seoTitle="E-handel, Shopify och Stripe-lösningar | Aurora Media"
    seoDescription="Aurora Media bygger e-handel, Shopify-flöden och skräddarsydda Stripe-lösningar med SEO, mätning, betalning och integrationer för svenska företag."
    includes={[
      "Plattformsval: Shopify, Stripe eller skräddarsydd lösning",
      "Produkt- och kategoristruktur",
      "Betalflöde med kort, Klarna, Swish eller Stripe där det passar",
      "Frakt-, order- och kundflöden",
      "Mobiloptimerad köpupplevelse",
      "SEO-grund för produkter och kategorier",
      "Mätning: Google Analytics, Meta Pixel och konverteringar",
      "Möjlighet till Fortnox, Brevo, Klaviyo eller andra integrationer",
    ]}
    process={[
      { label: "Steg 1", title: "Affärsflöde", body: "Vi går igenom vad du säljer, hur betalning/frakt ska fungera och vilka system e-handeln måste prata med." },
      { label: "Steg 2", title: "Tekniskt val", body: "Shopify om det är smartast. Egen lösning om regler, checkout eller data kräver mer kontroll." },
      { label: "Steg 3", title: "Bygg & kopplingar", body: "Butik, produktstruktur, betalning, mätning, e-postflöden och integrationer byggs ihop." },
      { label: "Steg 4", title: "Lansering", body: "Soft launch, testköp, tracking, justeringar och överlämning så du kan börja sälja tryggt." },
    ]}
    tiers={[
      {
        name: "Shopify Launch",
        price: "Fast offert",
        time: "Ofta 2–4 veckor",
        desc: "För företag som vill sälja snabbt med en stabil, beprövad plattform.",
        features: ["Shopify-setup", "Tema och anpassning", "Produktstruktur", "Betalning och frakt", "Tracking"],
      },
      {
        name: "Growth Commerce",
        price: "Fast offert",
        time: "Efter scope",
        desc: "För butiker som behöver e-postflöden, annonsering, SEO och integrationer från start.",
        features: ["Allt i Launch", "SEO-grund", "Meta/Google tracking", "E-postflöden", "Integrationer"],
        featured: true,
      },
      {
        name: "Custom Commerce",
        price: "Från 89 000 kr",
        time: "Efter scope",
        desc: "När du behöver egen checkout, databas, kundportal eller mer avancerad logik.",
        features: ["React + Stripe", "Egen admin", "Kundkonton", "API-integrationer", "Kod du äger"],
      },
    ]}
    whyAffordable="Jag väljer inte teknik för att det låter dyrt. Shopify när det är rätt, egen lösning när affären kräver det. AI-assisterad utveckling gör byggdelen snabbare, men värdet ligger i att betalning, struktur, mätning och integrationer sitter rätt från början."
    faqs={[
      { q: "Shopify eller egen lösning?", a: "Shopify är ofta bäst när du vill sälja standardprodukter snabbt. Egen lösning passar när du har specialregler, kundportal, avancerad checkout eller vill äga hela flödet." },
      { q: "Kan ni koppla Klarna, Swish eller Stripe?", a: "Ja. Exakt betalflöde beror på plattform och affärsmodell. Stripe är ofta bäst för SaaS och skräddarsydda flöden, medan Shopify har färdiga alternativ." },
      { q: "Hjälper ni med annonsering?", a: "Ja. Google Ads och Meta Ads kan kopplas på tillsammans med rätt tracking och landningssidor." },
      { q: "Kan e-handeln bli en app senare?", a: "Ja. Om produkten behöver återkommande användning, pushnotiser eller appkänsla kan vi bygga PWA eller app-liknande lösning senare." },
      { q: "Äger jag koden?", a: "Om vi bygger skräddarsytt får du repo och kod. Om vi bygger på Shopify äger du butiken och kontot, men själva Shopify-plattformen är förstås extern." },
    ]}
    related={[
      { name: "Google Ads", price: "Kampanj och tracking", to: "/tjanster/google-ads" },
      { name: "Meta Ads", price: "Facebook och Instagram", to: "/tjanster/meta-ads" },
      { name: "SEO", price: "Produkt- och kategorisynlighet", to: "/tjanster/seo" },
      { name: "Kontakt", price: "Boka AI-genomgång", to: "/kontakt" },
    ]}
  />
);

export default Ehandel;

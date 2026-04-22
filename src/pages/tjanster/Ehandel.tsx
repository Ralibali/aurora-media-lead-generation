import ServicePageTemplate from "./ServicePageTemplate";

const Ehandel = () => (
  <ServicePageTemplate
    slug="ehandel"
    title="E-handel från 19 900 kr."
    intro="Shopify eller egen lösning. Lansering på 2 veckor. Du börjar sälja från dag ett."
    paketName="Ads"
    seoTitle="E-handel från 19 900 kr – Shopify eller eget | Aurora Media"
    seoDescription="Bygg din e-handel på 2 veckor. Shopify-setup eller egen Stripe-lösning. Fast pris från 19 900 kr. Linköping."
    includes={[
      "Shopify, BigCommerce eller egen Stripe-baserad lösning",
      "Produktimport och kategoristruktur",
      "Betalning med Klarna, Swish, kort",
      "Frakt- och leveransflöde (PostNord, Budbee m.fl.)",
      "Mobiloptimerad design",
      "On-page SEO för produkter och kategorier",
      "Mailchimp/Klaviyo-integration",
      "Google Analytics + Meta Pixel",
    ]}
    process={[
      { label: "Steg 1", title: "Plattformsval", body: "Vi avgör om Shopify räcker eller om du behöver något egenkokat." },
      { label: "Steg 2", title: "Setup", body: "Tema, betalningar, frakt, produkter. En vecka." },
      { label: "Steg 3", title: "Integrationer", body: "Bokföring, e-post, ads. Allt kopplas innan lansering." },
      { label: "Steg 4", title: "Lansering", body: "Soft launch, justeringar, full launch. Du börjar sälja." },
    ]}
    tiers={[
      { name: "Shopify start", price: "19 900 kr", time: "2 veckor", desc: "Shopify-tema, upp till 50 produkter, betalningar och frakt.", features: ["Shopify Basic-setup", "Tema och anpassning", "Produktimport", "Klarna + kort"] },
      { name: "Shopify pro", price: "34 900 kr", time: "3 veckor", desc: "Shopify med klistret: e-post, ads, Fortnox.", features: ["Allt i Start", "Klaviyo eller Mailchimp", "Meta Pixel + Google Ads", "Fortnox-koppling"], featured: true },
      { name: "Egen e-handel", price: "Från 49 900 kr", time: "4–6 veckor", desc: "Stripe-baserad, full kontroll, inga månadsavgifter.", features: ["Custom React + Stripe", "Egen admin", "Multi-region", "Full kodbas"] },
    ]}
    whyAffordable="Shopify-temat anpassas snabbt om man kan koden. Den egna lösningen byggs på samma byggblock jag använder för mina SaaS-produkter. Jag har redan löst betalningar, frakt och Fortnox-koppling i mina egna projekt."
    faqs={[
      { q: "Shopify eller eget?", a: "Säljer du under 1 000 ordrar/månad: Shopify. Mer än så, eller komplexa produkter/regler: egen lösning lönar sig snabbt." },
      { q: "Hjälper du med produktbilder?", a: "Ja, jag erbjuder produktfotografering separat – 4 900 kr/halvdag i Linköping." },
      { q: "Klarar lösningen Black Friday?", a: "Shopify ja. Egna lösningar byggs med Vercel/Cloudflare och tål spikar." },
      { q: "Får jag hjälp med ads?", a: "Ja. Google Ads och Meta Ads finns som tilläggstjänster. Vanligast är att vi paketerar setup + 3 månaders optimering." },
      { q: "Behöver jag en mobilapp till min e-handel?", a: "Sällan från start – en bra mobil webb räcker långt. När du har återkommande kunder och vill ha push-notiser, snabbare checkout eller offline-läge blir en app intressant. Jag bygger PWA från 6 900 kr eller Capacitor-app (iOS + Android från samma kodbas) från 24 900 kr – se /tjanster/mobilapp för upplägg." },
    ]}
    related={[
      { name: "Google Ads", price: "3 900 kr setup", to: "/tjanster/google-ads" },
      { name: "Meta Ads", price: "3 900 kr setup", to: "/tjanster/meta-ads" },
      { name: "Mobilapp", price: "Från 6 900 kr", to: "/tjanster/mobilapp" },
      { name: "Fotografering", price: "4 900 kr/halvdag", to: "/tjanster/fotografering" },
    ]}
  />
);

export default Ehandel;

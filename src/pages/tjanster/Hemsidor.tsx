import ServicePageTemplate from "./ServicePageTemplate";
import { motion } from "framer-motion";

const Hemsidor = () => (
  <ServicePageTemplate
    slug="hemsidor"
    label="Tilläggstjänst"
    title="Hemsida från 4 900 kr"
    titleEm="Sveriges billigaste riktiga webbpartner."
    intro="Snabb, modern, fullt kodad. Inga Wix-mallar. Inga 80 000 kr-byråoffert. Leverans på 3–10 dagar."
    paketName="Hemsida"
    seoTitle="Hemsida från 4 900 kr – snabb leverans | Aurora Media Linköping"
    seoDescription="Riktig kodad hemsida från 4 900 kr. Landningssida, företagshemsida eller större sajt. Leverans 3–10 dagar. Linköping, hela Sverige."
    includes={[
      "Helt kodad i React – inga mallar, inga lock-ins",
      "Responsiv för mobil, läsplatta och desktop",
      "On-page SEO och tekniskt grundpaket",
      "Snabb hosting (Vercel/Netlify) ingår första året",
      "Domänkoppling och SSL",
      "Kontaktformulär och Google Maps-integration",
      "Google Analytics eller Plausible",
      "Källkoden lämnas över – du äger allt",
    ]}
    process={[
      { label: "Steg 1 · Dag 1", title: "Korta brief", body: "Mejl eller 20 min video. Du beskriver vad du vill ha. Jag säger pris och leveransdag." },
      { label: "Steg 2 · Dag 2–3", title: "Designutkast", body: "Du får en första version live på en URL. Inte Figma – riktig sajt." },
      { label: "Steg 3 · Dag 4–8", title: "Justeringar", body: "Fem feedbackrundor ingår. Jag bygger om det som behöver byggas om." },
      { label: "Steg 4", title: "Leverans", body: "Domänkoppling, SSL, Analytics. Källkod till dig. Klart." },
    ]}
    tiers={[
      {
        name: "Landningssida",
        price: "4 900 kr",
        time: "3 dagar",
        desc: "En sida. För kampanjer, lansering, eller en enkel företagssajt.",
        features: ["1 sida", "Kontaktformulär", "Mobiloptimerad", "Hosting + SSL"],
      },
      {
        name: "Företagshemsida",
        price: "9 900 kr",
        time: "5 dagar",
        desc: "Klassisk uppsättning: hem, om, tjänster, blogg, kontakt.",
        features: ["5 sidor", "Bloggsystem", "On-page SEO", "Hosting + SSL", "Analytics"],
        featured: true,
      },
      {
        name: "Större sajt",
        price: "Från 14 900 kr",
        time: "7–10 dagar",
        desc: "10+ sidor, kategoristruktur, mer komplex layout.",
        features: ["10+ sidor", "CMS för innehåll", "Avancerad SEO", "Integrationer"],
      },
    ]}
    pricingNote={
      <>
        Alla priser exkl. moms. Hosting ingår år 1, sedan från 290 kr/år. Löpande underhåll
        finns för 1 990 kr/mån.
      </>
    }
    extra={
      <section className="border-t border-border bg-secondary/30 py-20 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="label-caps">Jämförelse</p>
            <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
              Hur jag står mig.
            </h2>
          </motion.div>

          <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-5 font-medium text-muted-foreground"></th>
                  <th className="p-5 font-serif text-base font-normal">Traditionell byrå</th>
                  <th className="p-5 font-serif text-base font-normal">Wix / Squarespace</th>
                  <th className="p-5 font-serif text-base font-normal text-primary">Aurora Media</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-5 label-caps">Pris</td>
                  <td className="p-5 text-foreground/75">25 000 – 80 000 kr</td>
                  <td className="p-5 text-foreground/75">0 kr + din tid</td>
                  <td className="p-5 font-medium text-primary">4 900 – 14 900 kr</td>
                </tr>
                <tr>
                  <td className="p-5 label-caps">Tid</td>
                  <td className="p-5 text-foreground/75">4–8 veckor</td>
                  <td className="p-5 text-foreground/75">20+ timmar av dig</td>
                  <td className="p-5 font-medium text-primary">3–10 dagar</td>
                </tr>
                <tr>
                  <td className="p-5 label-caps">Kontroll</td>
                  <td className="p-5 text-foreground/75">Begränsad</td>
                  <td className="p-5 text-foreground/75">Begränsad</td>
                  <td className="p-5 font-medium text-primary">Full kontroll över koden</td>
                </tr>
                <tr>
                  <td className="p-5 label-caps">SEO</td>
                  <td className="p-5 text-foreground/75">Extra kostnad</td>
                  <td className="p-5 text-foreground/75">Begränsad</td>
                  <td className="p-5 font-medium text-primary">Ingår</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    }
    whyAffordable="Jag använder samma AI-kodningsmetodik som för mina SaaS-projekt. En traditionell byrå har designer, projektledare, utvecklare och korrekturläsare i varje led – jag är alla i en, med AI som förstärkning. Resultatet är riktig kod, inte mallar – men till en bråkdel av kostnaden."
    faqs={[
      { q: "Är det WordPress?", a: "Nej. Det är React med Vite, byggt från grunden. Snabbare, säkrare, lättare att underhålla – och utan plugin-roulette." },
      { q: "Kan jag uppdatera innehåll själv?", a: "Ja. Mindre sajter får ett enkelt CMS (Sanity eller Decap). Större sajter får en headless lösning som passar ditt team." },
      { q: "Vad händer om jag vill byta byrå senare?", a: "Du äger källkoden. Vilken React-utvecklare som helst kan ta över. Inga proprietära format, inga lock-ins." },
      { q: "Behövs domän?", a: "Nej, men jag rekommenderar det. Jag hjälper till med köp och koppling om du inte redan har en. Cirka 100–200 kr/år för en .se." },
    ]}
    related={[
      { name: "SEO", price: "Från 4 900 kr", to: "/tjanster/seo" },
      { name: "Google Ads", price: "3 900 kr setup", to: "/tjanster/google-ads" },
      { name: "Content", price: "995 kr/artikel", to: "/tjanster/content" },
    ]}
  />
);

export default Hemsidor;

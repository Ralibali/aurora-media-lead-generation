import ServicePageTemplate from "./ServicePageTemplate";
import { motion } from "framer-motion";

const Hemsidor = () => (
  <ServicePageTemplate
    slug="hemsidor"
    label="Webb & plattformar"
    title="Hemsidor som känns som en produkt"
    titleEm="inte en mall."
    intro="Modern React-sajt, landningssida eller webbplattform byggd med samma tänk som en SaaS: snabb, sökbar, konverterande och med kod du äger. För företag som vill mer än att bara ha en digital broschyr."
    paketName="Hemsida / webbplattform"
    seoTitle="Hemsidor & webbplattformar – modern React-sajt | Aurora Media"
    seoDescription="Aurora Media bygger moderna hemsidor, landningssidor och webbplattformar med React, SEO, snabb laddning och kod kunden äger. För svenska företag som vill växa digitalt."
    includes={[
      "Modern React/TypeScript-sajt utan mall-låsning",
      "Responsiv design för mobil, surfplatta och desktop",
      "SEO-grund med metadata, sitemap, struktur och prestanda",
      "Snabb hosting och SSL via modern plattform",
      "Kontaktflöde, CTA-struktur och mätning",
      "Möjlighet till blogg/content-hub för organisk trafik",
      "Kan byggas vidare till app, SaaS eller kundportal",
      "Källkod och dokumentation lämnas över",
    ]}
    process={[
      { label: "Steg 1", title: "Scope", body: "Vi bestämmer vad sajten ska göra: sälja, förklara, generera leads, ranka på Google eller fungera som bas för en produkt." },
      { label: "Steg 2", title: "Struktur", body: "Jag sätter sidstruktur, budskap, SEO-grund och CTA-flöden så sajten inte bara blir snygg utan också användbar." },
      { label: "Steg 3", title: "Bygg", body: "Sajten byggs i riktig kod med snabb preview-länk. Du kan se och testa löpande istället för att vänta på statiska skisser." },
      { label: "Steg 4", title: "Lansering", body: "Domän, SSL, metadata, mätning, sitemap och överlämning fixas innan sidan går live." },
    ]}
    tiers={[
      {
        name: "Landningssida",
        price: "Offert efter scope",
        time: "Ofta 1–2 veckor",
        desc: "För kampanj, ny tjänst eller tydlig leadgenerering.",
        features: ["1 fokuserad sida", "CTA och kontaktflöde", "SEO-grund", "Responsiv design"],
      },
      {
        name: "Företagssajt",
        price: "Fast offert",
        time: "Ofta 2–4 veckor",
        desc: "För bolag som behöver en riktig webbplats med flera sidor och tydlig positionering.",
        features: ["Startsida + undersidor", "Tjänstesidor", "Kontaktflöde", "SEO och mätning", "Kod du äger"],
        featured: true,
      },
      {
        name: "Webbplattform",
        price: "Från 34 900 kr",
        time: "Efter scope",
        desc: "När sajten behöver login, databas, kundportal, betalning eller integrationer.",
        features: ["Databas", "Auth/login", "Admin eller dashboard", "Integrationer", "Skalbar grund"],
      },
    ]}
    pricingNote={
      <>
        Priset sätts efter faktisk omfattning. Vill du bara ha en enkel landningssida håller vi det litet. Behöver du en plattform med login, databas eller betalning går projektet in i MVP-upplägget.
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
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-[-0.02em]">
              Webb som kan växa vidare.
            </h2>
          </motion.div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-5 font-medium text-muted-foreground"></th>
                  <th className="p-5 font-display text-base font-normal">Mallbyggare</th>
                  <th className="p-5 font-display text-base font-normal">Traditionell byrå</th>
                  <th className="p-5 font-display text-base font-normal text-primary">Aurora Media</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="p-5 label-caps">Ägande</td><td className="p-5 text-foreground/75">Plattformslåst</td><td className="p-5 text-foreground/75">Varierar</td><td className="p-5 font-medium text-primary">Kod och struktur du äger</td></tr>
                <tr><td className="p-5 label-caps">Skalning</td><td className="p-5 text-foreground/75">Begränsad</td><td className="p-5 text-foreground/75">Möjlig men ofta dyr</td><td className="p-5 font-medium text-primary">Kan växa till app/SaaS</td></tr>
                <tr><td className="p-5 label-caps">SEO</td><td className="p-5 text-foreground/75">Grundläggande</td><td className="p-5 text-foreground/75">Ofta tillägg</td><td className="p-5 font-medium text-primary">Teknisk grund från start</td></tr>
                <tr><td className="p-5 label-caps">Process</td><td className="p-5 text-foreground/75">Gör själv</td><td className="p-5 text-foreground/75">Byråprocess</td><td className="p-5 font-medium text-primary">Direkt med den som bygger</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    }
    whyAffordable="Jag bygger med AI-assisterad utveckling och en modern React-stack. Det gör processen snabbare, men värdet ligger fortfarande i scope, struktur, SEO, designbeslut och att sajten byggs på en grund som kan växa vidare."
    faqs={[
      { q: "Är det WordPress?", a: "Nej, huvudspåret är React/TypeScript med modern hosting. Det passar bäst när du vill ha prestanda, kontroll och möjlighet att bygga vidare till app eller plattform." },
      { q: "Kan jag uppdatera innehåll själv?", a: "Ja. Beroende på behov kan vi lägga till CMS, enkel datakälla eller ett adminflöde." },
      { q: "Äger jag sajten?", a: "Ja. Du får kod, repo och dokumentation. Du ska inte bli låst till Aurora Media." },
      { q: "Kan hemsidan bli en app eller SaaS senare?", a: "Ja. Det är en av poängerna med att bygga i riktig kod istället för mallverktyg." },
      { q: "Vad kostar det?", a: "Det beror på scope. En enkel landningssida är mindre. En webbplattform med login, databas eller betalning hamnar närmare MVP-upplägget." },
    ]}
    related={[
      { name: "AI-konsult Sverige", price: "Från strategi till produkt", to: "/ai-konsult-sverige" },
      { name: "SEO", price: "Teknisk SEO och content", to: "/tjanster/seo" },
      { name: "Priser", price: "Se aktuella paket", to: "/priser" },
      { name: "Kontakt", price: "Boka AI-genomgång", to: "/kontakt" },
    ]}
  />
);

export default Hemsidor;

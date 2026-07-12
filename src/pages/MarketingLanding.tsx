import { ArrowRight, Check, CircleCheckBig, Code2, Gauge, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO, SITE_URL } from "@/components/SEO";
import { useContactModal } from "@/components/ContactModal";
import { Reveal, VkFooter, VkNav } from "./Index";

type PageKey =
  | "ai-konsult-sverige"
  | "digital-marknadsforing-linkoping"
  | "seo-byra-linkoping"
  | "ai-automation-linkoping"
  | "ai-konsult-linkoping"
  | "google-ads-linkoping"
  | "apputveckling-linkoping";

type LandingConfig = {
  eyebrow: string;
  title: string;
  accent: string;
  seoTitle: string;
  description: string;
  intro: string;
  offer: string;
  price: string;
  outcomes: string[];
  deliverables: { title: string; text: string }[];
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  related: { label: string; href: string }[];
};

const PAGES: Record<PageKey, LandingConfig> = {
  "ai-konsult-sverige": {
    eyebrow: "AI-konsult · Sverige · Från idé till produkt",
    title: "AI-konsulten som inte stannar vid",
    accent: "en PowerPoint.",
    seoTitle: "AI-konsult Sverige – från strategi till färdig produkt",
    description: "AI-konsult för svenska företag som vill gå från AI-idé till fungerande system, automation eller SaaS. Fast pris, snabb leverans och kod ni äger.",
    intro: "Ni får hjälp att välja rätt användningsfall, räkna på nyttan och bygga en fungerande första version. Samma person följer arbetet från kartläggning till lansering.",
    offer: "AI-konsultation och implementation",
    price: "Fast pris efter avgränsad kartläggning",
    outcomes: ["Prioriterad AI-roadmap", "Fungerande prototyp eller automation", "Tydlig kostnad före start", "Kod, data och konton i ert namn"],
    deliverables: [
      { title: "AI-kartläggning", text: "Vi hittar processerna där AI ger konkret tidsbesparing eller intäkt – inte bara en snygg demo." },
      { title: "Prototyp", text: "Ni får testa en klickbar eller fungerande version tidigt, innan hela investeringen görs." },
      { title: "Implementation", text: "Integrationer, behörigheter, datalagring och drift byggs för verklig användning." },
    ],
    steps: [
      { title: "20 minuter", text: "Ni beskriver problemet, systemen och vad som tar tid idag." },
      { title: "Fast förslag", text: "Ni får scope, rekommenderad lösning, tidsplan och pris." },
      { title: "Bygg och lansering", text: "Första fungerande versionen levereras på veckor, inte kvartal." },
    ],
    faqs: [
      { q: "Kan ni hjälpa oss välja rätt AI-projekt?", a: "Ja. Målet är att börja med den process där nyttan är tydligast och risken rimligast." },
      { q: "Arbetar ni i hela Sverige?", a: "Ja. Arbetet fungerar på distans och möten kan hållas digitalt. I Östergötland kan vi även ses fysiskt." },
      { q: "Äger vi lösningen?", a: "Ja. Kod, data, domäner och centrala konton ska stå på er från start." },
    ],
    related: [{ label: "Gör gratis AI-karta", href: "/ai-karta" }, { label: "Se priser", href: "/priser" }, { label: "Se case", href: "/arbete" }],
  },
  "digital-marknadsforing-linkoping": {
    eyebrow: "Digital marknadsföring · Linköping",
    title: "Marknadsföring som kopplar ihop",
    accent: "trafik med affär.",
    seoTitle: "Digital marknadsföring i Linköping – SEO, Ads & AI",
    description: "Digital marknadsföring i Linköping med SEO, Google Ads, Meta Ads, content och konverteringsspårning. Lokal kontakt och tydliga leadmål.",
    intro: "Aurora Media hjälper företag i Linköping att synas där kunderna söker, mäta vad som faktiskt leder till affär och förbättra hela vägen från klick till förfrågan.",
    offer: "SEO, annonsering och konvertering",
    price: "Fast månadsupplägg eller avgränsat projekt",
    outcomes: ["Fler relevanta förfrågningar", "Korrekt konverteringsmätning", "Landningssidor som säljer", "Tydlig prioritering varje månad"],
    deliverables: [
      { title: "Sökintention", text: "Vi fokuserar på orden och målgrupperna som ligger nära ett faktiskt köpbeslut." },
      { title: "Konvertering", text: "Budskap, landningssidor och formulär optimeras tillsammans – inte som separata silos." },
      { title: "Mätning", text: "GA4, annonser och leadkällor kopplas ihop så att ni ser vad som fungerar." },
    ],
    steps: [
      { title: "Nulägesbild", text: "Trafik, sökord, annonser, spårning och befintliga leads granskas." },
      { title: "90-dagarsplan", text: "Ni får en prioriterad plan med aktiviteter och mätbara mål." },
      { title: "Genomförande", text: "Vi producerar, testar och förbättrar löpande utifrån affärsdata." },
    ],
    faqs: [
      { q: "Måste vi köpa både SEO och annonsering?", a: "Nej. Upplägget väljs efter nuläge, efterfrågan och budget. Ofta börjar vi med den kanal som kan ge tydligast effekt." },
      { q: "Kan ni arbeta med vår befintliga webbplats?", a: "Ja. Vi kan förbättra befintliga sidor, spårning och kampanjer utan att bygga om allt." },
      { q: "Hur mäter ni resultat?", a: "Vi följer främst kvalificerade leads, bokningar och försäljning – inte enbart visningar eller klick." },
    ],
    related: [{ label: "SEO i Linköping", href: "/seo-byra-linkoping" }, { label: "Google Ads i Linköping", href: "/google-ads-linkoping" }, { label: "Kontakta oss", href: "/kontakt" }],
  },
  "seo-byra-linkoping": {
    eyebrow: "SEO-byrå · Linköping · Östergötland",
    title: "SEO som bygger synlighet",
    accent: "och förfrågningar.",
    seoTitle: "SEO-byrå i Linköping – teknisk SEO, content & lokal synlighet",
    description: "SEO-byrå i Linköping för teknisk SEO, innehåll, lokal synlighet och konverterande landningssidor. Tydligt scope och mätbara mål.",
    intro: "Vi kombinerar teknisk SEO, sökintention, innehåll och konvertering. Målet är inte bara högre positioner – utan fler relevanta kunder från Google.",
    offer: "Teknisk SEO och innehållstillväxt",
    price: "Audit från 2 490 kr · Audit + fix från 6 900 kr",
    outcomes: ["Färre tekniska indexeringsfel", "Landningssidor för köpstarka sökningar", "Starkare lokal synlighet", "Internlänkning som leder både Google och kunden rätt"],
    deliverables: [
      { title: "Teknisk grund", text: "Indexering, canonicals, sitemap, prestanda, metadata och strukturerad data granskas och rättas." },
      { title: "Sökordsarkitektur", text: "Varje viktig tjänst och sökintention får en tydlig sida, roll och internlänkning." },
      { title: "Innehåll som hjälper", text: "Guider och landningssidor skrivs för både beslutsfattaren och sökmotorn." },
    ],
    steps: [
      { title: "Audit", text: "Vi hittar tekniska hinder, innehållsgap och sidor som konkurrerar med varandra." },
      { title: "Prioritering", text: "Åtgärder rangordnas efter möjlig affärseffekt och arbetsinsats." },
      { title: "Fix och tillväxt", text: "Teknik, sidor och innehåll förbättras och följs upp i Search Console." },
    ],
    faqs: [
      { q: "Hur snabbt ger SEO resultat?", a: "Tekniska förbättringar kan märkas snabbt, men stabil organisk tillväxt byggs normalt över flera månader." },
      { q: "Kan ni fixa problemen ni hittar?", a: "Ja. Ni kan köpa en ren audit eller ett upplägg där prioriterade fel och sidor åtgärdas." },
      { q: "Arbetar ni med lokal SEO?", a: "Ja. Vi bygger relevanta lokala landningssidor, stärker företagsinformationen och arbetar med tydliga lokala sökintentioner." },
    ],
    related: [{ label: "SEO-tjänsten", href: "/tjanster/seo" }, { label: "Digital marknadsföring", href: "/digital-marknadsforing-linkoping" }, { label: "Begär SEO-audit", href: "/kontakt" }],
  },
  "ai-automation-linkoping": {
    eyebrow: "AI-automation · Linköping",
    title: "Bygg bort manuellt arbete",
    accent: "mellan era system.",
    seoTitle: "AI-automation för företag i Linköping – från 14 900 kr",
    description: "AI-automation i Linköping för mejl, dokument, offerter, bokning, Fortnox, Visma och interna arbetsflöden. Fast pris och kod ni äger.",
    intro: "Vi bygger automationer som läser, sorterar, sammanställer och flyttar information mellan systemen ni redan använder. Resultatet ska spara tid varje vecka – inte skapa ännu ett verktyg att administrera.",
    offer: "AI-automation och systemintegration",
    price: "Prototyp från 14 900 kr",
    outcomes: ["Mindre dubbelregistrering", "Snabbare offerter och svar", "Färre manuella fel", "Bättre kontroll över återkommande flöden"],
    deliverables: [
      { title: "Dokument och mejl", text: "AI kan läsa inkommande underlag, plocka ut rätt data och skapa nästa åtgärd automatiskt." },
      { title: "Ekonomi och CRM", text: "Fortnox, Visma, formulär och kundsystem kopplas ihop via API:er och säkra arbetsflöden." },
      { title: "Intern assistent", text: "Bygg en avgränsad assistent som svarar från era egna dokument och datakällor." },
    ],
    steps: [
      { title: "Flödeskarta", text: "Vi ritar exakt hur informationen går idag och var tid eller kvalitet försvinner." },
      { title: "Liten första automation", text: "Vi börjar där nyttan är tydlig och lösningen går att verifiera snabbt." },
      { title: "Utbyggnad", text: "När första flödet fungerar kan fler steg och integrationer kopplas på." },
    ],
    faqs: [
      { q: "Kan ni koppla mot Fortnox eller Visma?", a: "Ja, när det finns ett lämpligt API eller annan säker integrationsväg." },
      { q: "Måste vi byta våra nuvarande system?", a: "Oftast inte. Målet är vanligtvis att få befintliga system att arbeta bättre tillsammans." },
      { q: "Hur hanteras känslig information?", a: "Datakällor, behörigheter, lagring och leverantörer väljs utifrån vilken information lösningen ska behandla." },
    ],
    related: [{ label: "Gör AI-kartan", href: "/ai-karta" }, { label: "AI-konsult Linköping", href: "/ai-konsult-linkoping" }, { label: "Se case", href: "/arbete" }],
  },
  "ai-konsult-linkoping": {
    eyebrow: "AI-konsult · Linköping",
    title: "Lokal AI-partner från analys till",
    accent: "fungerande lösning.",
    seoTitle: "AI-konsult i Linköping – strategi, implementation & utbildning",
    description: "AI-konsult i Linköping för strategi, interna assistenter, automation, implementation och utbildning. Praktisk hjälp med tydligt scope.",
    intro: "Ni får en lokal kontakt i Linköping som kan kartlägga behovet, visa en fungerande prototyp och bygga den lösning som ger bäst nytta först.",
    offer: "AI-rådgivning och praktisk implementation",
    price: "Fast pris per avgränsat uppdrag",
    outcomes: ["Rätt verktyg för rätt problem", "GDPR- och datafrågor med i beslutet", "Teamet förstår hur lösningen används", "Mindre beroende av generella AI-licenser"],
    deliverables: [
      { title: "Strategi", text: "En kort, prioriterad plan för var AI passar och var vanliga regler eller integrationer är bättre." },
      { title: "Proof of concept", text: "En lösning testas på ert verkliga flöde och er data i liten skala." },
      { title: "Införande", text: "Behörigheter, utbildning, instruktioner och mätpunkter ingår i överlämningen." },
    ],
    steps: [
      { title: "Första möte", text: "Digitalt eller på plats i Linköping. Vi väljer ett konkret problem." },
      { title: "Test", text: "Ni ser en fungerande version och kan bedöma nyttan tidigt." },
      { title: "Införande", text: "Lösningen sätts i drift och användarna får en tydlig arbetsgång." },
    ],
    faqs: [
      { q: "Kan ni komma ut till vårt företag i Linköping?", a: "Ja. För verksamheter i Linköping och närområdet kan möten och kartläggning göras på plats." },
      { q: "Hjälper ni även till med utbildning?", a: "Ja. Utbildning kan ingå när en lösning eller ett nytt arbetssätt ska införas." },
      { q: "Kan vi börja med ett litet uppdrag?", a: "Ja. Ett avgränsat proof of concept är ofta det bästa sättet att minska risk och få ett tydligt beslutsunderlag." },
    ],
    related: [{ label: "Gratis AI-karta", href: "/ai-karta" }, { label: "AI-automation", href: "/ai-automation-linkoping" }, { label: "Om Aurora Media", href: "/om" }],
  },
  "google-ads-linkoping": {
    eyebrow: "Google Ads-byrå · Linköping",
    title: "Google Ads där varje klick har",
    accent: "ett tydligt jobb.",
    seoTitle: "Google Ads-byrå i Linköping – kampanjer som konverterar",
    description: "Google Ads-byrå i Linköping för sökkampanjer, Shopping, Performance Max och konverteringsspårning. Fokus på kvalificerade leads.",
    intro: "Vi bygger kampanjer runt verklig sökintention, relevanta landningssidor och korrekt mätning. Ni ska kunna se vilka kampanjer som skapar förfrågningar – inte bara trafik.",
    offer: "Google Ads och konverteringsspårning",
    price: "Förvaltning från 3 900 kr/mån",
    outcomes: ["Mindre spill på irrelevanta sökningar", "Tydlig leadspårning", "Bättre koppling mellan annons och landningssida", "Löpande förbättring av kostnad per lead"],
    deliverables: [
      { title: "Kampanjstruktur", text: "Sökord, annonser och budget delas upp efter tjänst, ort och köpintention." },
      { title: "Spårning", text: "Formulär, samtal och andra viktiga handlingar mäts som riktiga konverteringar." },
      { title: "Optimering", text: "Söktermer, bud, annonser och landningssidor förbättras utifrån resultat." },
    ],
    steps: [
      { title: "Kontogranskning", text: "Befintligt konto och spårning granskas, eller byggs från grunden." },
      { title: "Lansering", text: "Kampanjer startas med tydlig budget, negativa sökord och relevanta sidor." },
      { title: "Förbättring", text: "Data används för att flytta budget mot det som skapar bäst leads." },
    ],
    faqs: [
      { q: "Hur stor annonsbudget behöver vi?", a: "Det beror på konkurrens, geografi och affärsvärde. Ni får ett rekommenderat spann innan kampanjen startar." },
      { q: "Kan ni fixa konverteringsspårningen?", a: "Ja. Korrekt mätning är en grundförutsättning och kan ingå i uppstarten." },
      { q: "Äger vi annonskontot?", a: "Ja. Google Ads- och analyskonton ska ligga hos er, med Aurora Media som användare eller partner." },
    ],
    related: [{ label: "Google Ads-tjänsten", href: "/tjanster/google-ads" }, { label: "SEO i Linköping", href: "/seo-byra-linkoping" }, { label: "Begär kontogranskning", href: "/kontakt" }],
  },
  "apputveckling-linkoping": {
    eyebrow: "Apputveckling · Linköping",
    title: "Appar som går från idé till",
    accent: "riktig användning.",
    seoTitle: "Apputveckling i Linköping – iOS, Android & webbappar",
    description: "Apputveckling i Linköping för iOS, Android och webbappar. Från prototyp och MVP till skalbar produkt med tydligt scope och fast pris.",
    intro: "Aurora Media bygger webbappar, PWA:er och mobilappar för företag som behöver ett internt verktyg, en kundportal eller en ny digital produkt.",
    offer: "Apputveckling och digital produktutveckling",
    price: "Prototyp från 14 900 kr · appar prissätts efter scope",
    outcomes: ["En kodbas för snabbare utveckling", "Tidig testbar prototyp", "Inloggning, betalning och admin vid behov", "Kod och konton som ni äger"],
    deliverables: [
      { title: "Produktdesign", text: "Flöden och skärmar prioriteras runt kärnproblemet, så att MVP:n förblir liten och användbar." },
      { title: "Utveckling", text: "React, React Native, Expo och Supabase används där de passar projektets krav." },
      { title: "Lansering", text: "Drift, domän, analys och publicering planeras redan när lösningen byggs." },
    ],
    steps: [
      { title: "Scope", text: "Vi definierar målgrupp, kärnflöde och vad som uttryckligen inte ska ingå i första versionen." },
      { title: "Prototyp", text: "Ni testar upplevelsen innan all funktionalitet och alla integrationer byggs." },
      { title: "MVP", text: "En lanseringsbar version byggs, testas och lämnas över med tydlig dokumentation." },
    ],
    faqs: [
      { q: "Bygger ni för både iPhone och Android?", a: "Ja. När projektet passar kan samma kodbas användas för både iOS och Android via React Native och Expo." },
      { q: "Kan vi börja med en webbapp?", a: "Ja. För många interna system och tidiga produkter är en responsiv webbapp eller PWA det snabbaste första steget." },
      { q: "Kan ni ta över en befintlig app?", a: "Det beror på kodbas, dokumentation och teknik. En teknisk genomgång görs innan ett övertagande föreslås." },
    ],
    related: [{ label: "Mobilapp-tjänsten", href: "/tjanster/mobilapp" }, { label: "Se priser", href: "/priser" }, { label: "Se projekt", href: "/arbete" }],
  },
};

const MarketingLanding = ({ page }: { page: PageKey }) => {
  const config = PAGES[page];
  const { open } = useContactModal();
  const canonical = `/${page}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: config.seoTitle,
    description: config.description,
    url: `${SITE_URL}${canonical}`,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: page.includes("linkoping") ? { "@type": "City", name: "Linköping" } : { "@type": "Country", name: "Sverige" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <SEO title={config.seoTitle} description={config.description} canonical={canonical} jsonLd={[serviceSchema, faqSchema]} />
      <div className="verkstad">
        <VkNav />
        <main>
          <section className="vk-section vk-hero" style={{ minHeight: "auto" }}>
            <div className="vk-wrap vk-hero-grid">
              <div>
                <p className="vk-mono">{config.eyebrow}</p>
                <h1 style={{ marginTop: 20 }}>{config.title} <span className="accent">{config.accent}</span></h1>
                <p className="vk-hero-sub">{config.intro}</p>
                <div className="vk-hero-cta">
                  <button className="vk-btn vk-btn-primary" onClick={() => open({ paket: "Skraddarsytt", internalNote: `Lead från ${config.seoTitle}` })}>
                    Få konkret förslag <ArrowRight size={16} />
                  </button>
                  <Link className="vk-btn vk-btn-ghost" to="/arbete">Se vad jag byggt</Link>
                </div>
                <p className="vk-mono vk-hero-micro">Svar inom 24 h · Tydligt scope · Kod ni äger</p>
              </div>

              <div className="vk-panel">
                <span className="vk-mono">{config.offer}</span>
                <h2 style={{ marginTop: 16, fontSize: "clamp(1.6rem,3vw,2.5rem)" }}>{config.price}</h2>
                <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
                  {config.outcomes.map((outcome) => (
                    <div key={outcome} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <CircleCheckBig size={18} style={{ flex: "0 0 auto", marginTop: 3 }} />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
            <div className="vk-wrap">
              <Reveal>
                <div className="vk-secheader">
                  <span className="vk-mono">Det ni får</span>
                  <h2>Från behov till fungerande nästa steg.</h2>
                </div>
              </Reveal>
              <div className="vk-receipts">
                {config.deliverables.map((item, index) => {
                  const icons = [Gauge, Code2, ShieldCheck];
                  const Icon = icons[index % icons.length];
                  return (
                    <Reveal delay={index * 0.08} key={item.title}>
                      <article className="vk-receipt">
                        <Icon size={22} />
                        <h3 style={{ marginTop: 16 }}>{item.title}</h3>
                        <p className="vk-receipt-desc">{item.text}</p>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="vk-section">
            <div className="vk-wrap">
              <Reveal>
                <div className="vk-secheader">
                  <span className="vk-mono">Arbetssätt</span>
                  <h2>Litet första steg. Tidig verklighetskontroll.</h2>
                </div>
              </Reveal>
              <div className="vk-timeline">
                {config.steps.map((item, index) => (
                  <Reveal delay={index * 0.08} key={item.title}>
                    <div className="vk-tl-step">
                      <span className="vk-tl-dot" />
                      <div className="vk-mono vk-tl-label">0{index + 1} — {item.title}</div>
                      <p style={{ marginTop: 8, fontSize: 17, color: "var(--granbark)" }}>{item.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="vk-section" style={{ background: "var(--bjork-djup)" }}>
            <div className="vk-wrap">
              <div className="vk-secheader">
                <span className="vk-mono">Vanliga frågor</span>
                <h2>Raka svar före första kontakten.</h2>
              </div>
              <div className="vk-faq">
                {config.faqs.map((faq) => (
                  <details className="vk-faq-item" key={faq.q}>
                    <summary className="vk-faq-q" style={{ cursor: "pointer" }}>{faq.q}</summary>
                    <p className="vk-faq-a">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="vk-section">
            <div className="vk-wrap">
              <div className="vk-panel">
                <span className="vk-mono">Fortsätt här</span>
                <h2 style={{ maxWidth: "20ch" }}>Få ett ärligt förslag på vad ni bör göra först.</h2>
                <p style={{ maxWidth: "58ch", fontSize: 18, color: "var(--granbark-mut)" }}>
                  Beskriv problemet kort. Ni får svar med rekommenderat nästa steg, ungefärlig omfattning och om Aurora Media är rätt partner.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
                  <button className="vk-btn vk-btn-primary" onClick={() => open({ paket: "Skraddarsytt", internalNote: `Lead från ${config.seoTitle}` })}>
                    Starta dialogen <ArrowRight size={16} />
                  </button>
                  {config.related.map((item) => <Link key={item.href} to={item.href} className="vk-btn vk-btn-ghost">{item.label}</Link>)}
                </div>
              </div>
            </div>
          </section>
        </main>
        <VkFooter />
      </div>
    </>
  );
};

export default MarketingLanding;
export type { PageKey };

import LocalLandingPage from "@/components/nordic/LocalLandingPage";

const DigitalMarknadsforingLinkoping = () => (
  <LocalLandingPage
    slug="digital-marknadsforing-linkoping"
    metaTitle="Digital marknadsföring i Linköping – byrå för SEO, Ads & AI 2026"
    metaDesc="Digital marknadsföring i Linköping: SEO, Google Ads, Meta Ads, content och AI-driven marknadsföring. Fast pris, lokal kontakt, mätbara resultat."
    keywords="digital marknadsföring Linköping, marknadsföringsbyrå Linköping, SEO Linköping, Google Ads Linköping, AI marknadsföring"
    crumbLabel="Digital marknadsföring i Linköping"
    eyebrow="aurora media · digital marknadsföring · linköping"
    h1="Digital marknadsföring"
    h1Italic="i Linköping."
    lead="Vi hjälper företag i Linköping och Östergötland att bli synliga där rätt kunder faktiskt letar. SEO, Google Ads, Meta Ads, content och AI-driven marknadsföring – ihopsatt som en helhet, inte fyra separata konsulter som pekar på varandra."
    serviceType={["Digital marketing", "SEO", "Google Ads", "Meta Ads", "Content marketing"]}
    problems={[
      { n: "01", title: "Ni syns inte när kunder söker lokalt", desc: "Konkurrenter i Linköping ligger över er på Google för de sökningar som faktiskt genererar affärer." },
      { n: "02", title: "Annonsbudget som försvinner", desc: "Google Ads eller Meta rullar, men ingen kan förklara vilka kampanjer som ger kunder – bara vad de kostar." },
      { n: "03", title: "Content som ingen läser", desc: "Ni producerar inlägg och nyhetsbrev, men det leder inte till leads eftersom det inte matchar sökintentionen." },
      { n: "04", title: "Verktyg och data i silos", desc: "GA4, Search Console, annonsplattformar och CRM pratar inte med varandra – rapporterna blir gissningar." },
    ]}
    services={[
      { title: "SEO – teknisk, on-page och lokal", desc: "Vi optimerar sajten för snabbhet, struktur, schema och lokala sökningar (‘nära mig’ + Linköping-varianter)." },
      { title: "Google Ads-hantering", desc: "Kampanjer byggda mot rätt sökintention. Konverteringsspårning, negativa nyckelord och veckovis optimering." },
      { title: "Meta Ads (Facebook & Instagram)", desc: "Prospecting och retargeting med kreativ som testas systematiskt. Fokus på CPA och ROAS – inte likes." },
      { title: "Content som rankar OCH säljer", desc: "Artiklar och landningssidor byggda från keyword research + AI-assisterad produktion, granskade av människa." },
      { title: "AI-driven marknadsföring", desc: "Automatisera leadscoring, mejlflöden, kundsegmentering och rapporter så att teamet slipper Excel-arbete." },
      { title: "Mätning, GA4 och dashboards", desc: "Tydliga dashboards som visar leads och intäkter per kanal – inte bara trafik och klick." },
    ]}
    faqs={[
      { q: "Vad kostar digital marknadsföring i Linköping?", a: "Vi jobbar med fast månadsarvode från cirka 8 900 kr/månad för en enskild kanal (t.ex. SEO eller Google Ads) och paket från 4 900 kr/månad när flera kanaler samverkar. Annonsbudget tillkommer och betalas direkt till Google/Meta." },
      { q: "Vilka branscher i Östergötland jobbar ni med?", a: "Vi har erfarenhet från bygg, transport, besöksnäring, e-handel och tjänsteföretag. Vi tar inte alla uppdrag – först ett kort samtal där vi säger till om vi är rätt matchning." },
      { q: "Hur skiljer ni er från andra marknadsföringsbyråer i Linköping?", a: "Vi är tekniska. Utvecklare och marknadsförare i samma team gör att vi kan bygga landningssidor, integrationer och automation direkt – inte bara skriva strategier och lämna över till någon annan." },
      { q: "Kan ni ta över befintliga Google Ads-konton?", a: "Ja. Vi gör en gratis granskning där ni får se vad som fungerar, vad som slösar budget och vad vi skulle göra annorlunda innan ni bestämmer er." },
      { q: "Har ni fysiska möten i Linköping?", a: "Ja. Vi drivs från Linköping och träffas gärna hos er, i vår lokal eller över lunch. Löpande arbete sker digitalt via Slack, e-post och veckoavstämningar." },
    ]}
    relatedLinks={[
      { label: "Tjänst – SEO", to: "/tjanster/seo", desc: "Så jobbar vi med SEO tekniskt, redaktionellt och lokalt – från audit till löpande optimering." },
      { label: "Tjänst – Google Ads", to: "/tjanster/google-ads", desc: "Kampanjstruktur, budstrategi och konverteringsspårning för Sök, Performance Max och YouTube." },
      { label: "Tjänst – Meta Ads", to: "/tjanster/meta-ads", desc: "Facebook- och Instagramkampanjer med kreativ testning och tydliga CPA-mål." },
      { label: "AI-byrå i Linköping", to: "/ai-byra-linkoping", desc: "Om ni vill kombinera marknadsföring med AI-automation och interna system i samma team." },
    ]}
  />
);

export default DigitalMarknadsforingLinkoping;

import LocalLandingPage from "@/components/nordic/LocalLandingPage";

const GoogleAdsLinkoping = () => (
  <LocalLandingPage
    slug="google-ads-linkoping"
    metaTitle="Google Ads-byrå i Linköping – kampanjer som konverterar"
    metaDesc="Google Ads-byrå i Linköping. Sök, Performance Max, YouTube och Shopping med tydlig konverteringsspårning. Fast månadsarvode från 6 900 kr."
    keywords="Google Ads Linköping, Google Ads-byrå Linköping, SEM Linköping, Performance Max Linköping"
    crumbLabel="Google Ads-byrå i Linköping"
    eyebrow="aurora media · google ads · linköping"
    h1="Google Ads-byrå"
    h1Italic="i Linköping."
    lead="Kampanjer som mäts i leads och intäkter – inte klick och impressions. Vi bygger, driver och optimerar Google Ads-konton för företag i Linköping med tydlig konverteringsspårning från annons till affär."
    serviceType={["Google Ads", "PPC", "SEM", "Performance Max"]}
    problems={[
      { n: "01", title: "Ni betalar för fel klick", desc: "Kampanjer utan negativa nyckelord och matchningstyper drar in okvalificerad trafik som aldrig konverterar." },
      { n: "02", title: "Konverteringsspårning som ljuger", desc: "GA4 räknar sidbesök som konverteringar. Ni tror ni har ROAS 5 – verkligheten är närmare 1." },
      { n: "03", title: "Performance Max som black box", desc: "Google säger ‘låt algoritmen göra jobbet’. Ni ser inte vad som händer, budgeten glider iväg utan förklaring." },
      { n: "04", title: "Ingen koppling till affärssystem", desc: "Kampanjerna optimerar mot form-fills, men ni vet inte vilka som blev kunder – så budgivningen optimerar mot fel signal." },
    ]}
    services={[
      { title: "Kontoaudit (kostnadsfri)", desc: "Vi går igenom struktur, sökordsintention, negativa nyckelord, bud, kreativ och spårning. Ni får en tydlig plan innan avtal." },
      { title: "Sökkampanjer som konverterar", desc: "Manuellt uppbyggda kampanjer med rätt matchningstyper, ad extensions och landningssideoptimering." },
      { title: "Performance Max – med kontroll", desc: "Vi bygger PMax med asset groups, audience signals och exclusions – och rapporterar det Google gömmer i UI:t." },
      { title: "Shopping och YouTube", desc: "Produktflöde, feed-optimering och video-annonser med tydliga målgrupper – för e-handel eller tjänstebolag som säljer visuellt." },
      { title: "Konverteringsspårning på riktigt", desc: "Server-side tracking med GA4 + Google Ads Enhanced Conversions. Vi kopplar in offline conversions från ert CRM när det behövs." },
      { title: "Månadsrapport och avstämning", desc: "En rapport och en avstämning per månad. Ni ser leads/intäkter per kampanj, inte bara CPC och CTR." },
    ]}
    faqs={[
      { q: "Vad kostar en Google Ads-byrå i Linköping?", a: "Fast månadsarvode från 6 900 kr för mindre konton, 9 900–14 900 kr för medelstora och offert för konton över 100 000 kr/mån i annonsbudget. Annonsbudget till Google tillkommer." },
      { q: "Hur snabbt ser vi resultat?", a: "Trafik samma dag som kampanjerna går live. Meningsfull optimeringsdata efter 2–3 veckor. Stabila resultat efter 6–8 veckor när algoritmen har konverteringsdata att jobba med." },
      { q: "Kan ni ta över vårt befintliga konto?", a: "Ja. Ni behåller ägarskapet av kontot – vi får bara MCC-access. Om ni någon gång slutar med oss tar ni med er allt: konto, historik, kampanjer, konverteringar." },
      { q: "Bygger ni landningssidor också?", a: "Ja. Vi ser landningssidan som en del av kampanjen. Vi bygger dedikerade sidor med snabb laddning, tydligt call-to-action och A/B-tester." },
      { q: "Fungerar Google Ads för B2B i Linköping?", a: "Ja, särskilt för nischade tjänster med tydlig sökintention. B2B-annonsering kräver dock offline conversion tracking från CRM för att bli riktigt vass – det hjälper vi till med." },
    ]}
    relatedLinks={[
      { label: "Tjänst – Google Ads", to: "/tjanster/google-ads", desc: "Djupdykning i vår Google Ads-metodik med kampanjstruktur och budstrategier." },
      { label: "Digital marknadsföring i Linköping", to: "/digital-marknadsforing-linkoping", desc: "Kombinera Ads med SEO, content och Meta för en samlad tratt." },
      { label: "SEO-byrå i Linköping", to: "/seo-byra-linkoping", desc: "När Ads-budgeten skalar upp – SEO gör att ni inte behöver betala per klick för alltid." },
      { label: "Meta Ads", to: "/tjanster/meta-ads", desc: "Kompletterar sökannonser med retargeting och prospecting på Facebook/Instagram." },
    ]}
  />
);

export default GoogleAdsLinkoping;

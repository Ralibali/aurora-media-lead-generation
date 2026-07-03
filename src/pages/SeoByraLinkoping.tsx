import LocalLandingPage from "@/components/nordic/LocalLandingPage";

const SeoByraLinkoping = () => (
  <LocalLandingPage
    slug="seo-byra-linkoping"
    metaTitle="SEO-byrå i Linköping – teknisk SEO, content & lokal synlighet"
    metaDesc="SEO-byrå i Linköping som jobbar med teknisk SEO, content, lokal synlighet och länkbygge. Fast pris, mätbara resultat, ägarskap kvar hos er."
    keywords="SEO Linköping, SEO-byrå Linköping, sökmotoroptimering Linköping, lokal SEO Östergötland"
    crumbLabel="SEO-byrå i Linköping"
    eyebrow="aurora media · sökmotoroptimering · linköping"
    h1="SEO-byrå"
    h1Italic="i Linköping."
    lead="Vi hjälper företag i Linköping att synas där rätt kunder söker. Teknisk SEO, innehåll som rankar, lokal synlighet på Google – och rapporter ni faktiskt förstår."
    serviceType={["SEO", "Technical SEO", "Local SEO", "Content marketing"]}
    problems={[
      { n: "01", title: "Ranking utan konvertering", desc: "Trafiken går uppåt i Search Console – men leads och intäkter står stilla för att sökorden är fel." },
      { n: "02", title: "Sajten är tekniskt trög", desc: "Core Web Vitals är röda, indexeringen är rörig, och nya sidor tar månader att synas på Google." },
      { n: "03", title: "Lokal synlighet saknas", desc: "Konkurrenter dyker upp i map pack:en för ‘nära mig’ men er Google Business Profile är halvfärdig." },
      { n: "04", title: "Content utan strategi", desc: "Ni bloggar när ni hinner. Ingen keyword research, ingen internlänkning och ingen uppföljning." },
    ]}
    services={[
      { title: "Teknisk SEO-audit", desc: "Genomgång av crawl, indexering, hastighet, schema och struktur. Ni får en prioriterad lista – inte en 80-sidor PDF." },
      { title: "On-page SEO", desc: "Optimering av titles, H1, intern länkning, brödsmulor, schema och innehållsstruktur för de sidor som faktiskt driver affär." },
      { title: "Lokal SEO", desc: "Google Business Profile, lokala landningssidor, recensioner, NAP-konsistens och citations för Linköping/Östergötland." },
      { title: "Content och keyword research", desc: "Vi identifierar sökintentioner ni kan äga och producerar innehåll som svarar bättre än konkurrenterna." },
      { title: "Länkbygge (white-hat)", desc: "Digital PR, gästartiklar och lokala samarbeten. Kvalitet före kvantitet – inga PBN:er eller köpta paket." },
      { title: "Rapportering och GA4", desc: "Månadsrapport som kopplar ranking till leads och intäkter. Inga ‘impressions’-kosmetika." },
    ]}
    faqs={[
      { q: "Hur lång tid tar det innan SEO ger resultat?", a: "För etablerade sajter ser vi ofta rörelser inom 6–12 veckor. Nya domäner tar 4–9 månader innan trafiken på riktigt tar fart. Vi säger det innan avtal, inte efter." },
      { q: "Vad kostar en SEO-byrå i Linköping?", a: "Löpande SEO-arbete från 8 900 kr/månad. Engångsprojekt (audit, migration, större omstruktureringar) offereras med fast pris." },
      { q: "Kan ni jobba mot vår befintliga byrå eller utvecklare?", a: "Ja. Vi kan leverera specifikationer, tickets och kodförslag som er nuvarande leverantör implementerar. Vi anpassar oss efter er stack." },
      { q: "Vad gör ni för lokal SEO specifikt?", a: "Vi optimerar Google Business Profile, bygger lokala landningssidor (t.ex. tjänst + Linköping), sätter LocalBusiness/ProfessionalService-schema och jobbar aktivt med recensioner." },
      { q: "Rapporterar ni ranking eller intäkter?", a: "Både och – men huvudmätaren är leads/intäkter från organisk trafik. Ranking är ett medel, inte målet." },
    ]}
    relatedLinks={[
      { label: "Tjänst – SEO", to: "/tjanster/seo", desc: "Djupdykning i vår SEO-metodik: teknik, content, länkbygge och lokal synlighet." },
      { label: "Digital marknadsföring i Linköping", to: "/digital-marknadsforing-linkoping", desc: "Kombinera SEO med Ads, content och AI för en samlad kanalstrategi." },
      { label: "Google Ads i Linköping", to: "/google-ads-linkoping", desc: "När SEO tar tid – Ads kan fylla gapet och testa vilka sökord som verkligen konverterar." },
      { label: "AI-byrå i Linköping", to: "/ai-byra-linkoping", desc: "Vi kombinerar SEO med AI-innehåll och automation för snabbare produktion." },
    ]}
  />
);

export default SeoByraLinkoping;

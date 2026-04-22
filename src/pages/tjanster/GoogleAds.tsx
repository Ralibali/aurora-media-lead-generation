import ServicePageTemplate from "./ServicePageTemplate";

const GoogleAds = () => (
  <ServicePageTemplate
    slug="google-ads"
    title="Google Ads – 3 900 kr setup."
    intro="Sök- och Performance Max-kampanjer som faktiskt konverterar. Inget byråkrati, ingen 6-månadersbindning."
    paketName="Ads"
    seoTitle="Google Ads från 3 900 kr setup | Aurora Media Linköping"
    seoDescription="Google Ads-setup, sökkampanjer, Performance Max, conversion tracking. Fast pris från 3 900 kr. Optimering 2 490 kr/mån."
    includes={[
      "Google Ads-konto och faktureringssetup",
      "Sökordsanalys för din nisch",
      "1–3 sökkampanjer med ad groups, annonser, extensions",
      "Performance Max-kampanj om relevant",
      "Conversion tracking via GA4 + Google Tag Manager",
      "Negativa sökord-lista från start",
      "30 dagars uppföljning ingår",
      "Rapport och rekommendationer",
    ]}
    process={[
      { label: "Steg 1", title: "Strategi", body: "30 min samtal: vad säljer du, till vem, vad är värdet av en konvertering?" },
      { label: "Steg 2", title: "Setup", body: "Konto, kampanjer, annonser, tracking. 3–5 dagar." },
      { label: "Steg 3", title: "Lansering", body: "Soft launch med liten budget. Justeringar dag 3 och 7." },
      { label: "Steg 4", title: "Överlämning", body: "Du får tillgång till kontot. Vill du att jag fortsätter? Det är ett val, inte ett tvång." },
    ]}
    tiers={[
      { name: "Setup", price: "3 900 kr", time: "3–5 dagar", desc: "Engångsuppsättning. Du driver vidare själv eller med ett annat team.", features: ["Kontosetup", "1–3 sökkampanjer", "Conversion tracking", "30 dagars uppföljning"] },
      { name: "Setup + 3 mån", price: "9 900 kr", time: "Setup + 3 månaders optimering", desc: "Det vanligaste valet. Jag optimerar varje vecka i 3 månader.", features: ["Allt i Setup", "Veckovis optimering", "A/B-test annonser", "Månatlig rapport"], featured: true },
      { name: "Löpande", price: "2 490 kr/mån", time: "Månadsvis, säg upp när du vill", desc: "Efter setup eller efter 3-månaders. Inga bindningstider.", features: ["Veckovis optimering", "Annonsuppdateringar", "Budget-justering", "Månatlig rapport"] },
    ]}
    whyAffordable="Setup tar samma tid oavsett byrå – men de flesta byråer tar 12–25 000 kr för det och låser dig i 6 månader. Jag tar fast pris och kräver inga bindningar. Vill du fortsätta är det för att det fungerar, inte för att du måste."
    faqs={[
      { q: "Hur stor budget bör jag ha?", a: "Minst 5 000–10 000 kr/mån i annonsbudget för att få meningsfull data inom rimlig tid. Mindre än så och vi gissar." },
      { q: "Kan jag göra det själv efter setup?", a: "Ja. Du får full tillgång till kontot, jag dokumenterar struktur och varför. Många kör vidare själv efter 3 månader." },
      { q: "Krävs det att jag har Analytics?", a: "Nej, jag sätter upp GA4 och Tag Manager om du inte har det. Ingår i setup." },
      { q: "Jobbar du med Performance Max?", a: "Ja, men bara när det passar. Pmax är inte alltid rätt val – det är en strategifråga vi reder ut i steg 1." },
    ]}
    related={[
      { name: "Meta Ads", price: "3 900 kr setup", to: "/tjanster/meta-ads" },
      { name: "SEO", price: "Från 4 900 kr", to: "/tjanster/seo" },
      { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
    ]}
  />
);

export default GoogleAds;

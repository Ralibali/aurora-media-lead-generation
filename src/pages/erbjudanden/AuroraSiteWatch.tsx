import OfferPage from "@/components/verkstad/OfferPage";

// Extend the existing SiteWatch offer; /sitewatch remains a compatible entry point.
const AuroraSiteWatch = () => (
  <OfferPage
    slug="aurora-watch"
    paketValue="Aurora Watch"
    serviceType="Webbövervakning och kontroll av kundflöden"
    eyebrow="Aurora Watch"
    title="Hittar kunden fram"
    titleEm="när det gäller?"
    intro="En hemsida kan vara uppe även när länken till kontakt, priser eller bokning har slutat fungera. Aurora Watch kontrollerar utvalda vägar genom er webbplats i en riktig webbläsare och bevakar viktiga sidor med SiteWatch. Ni får ett tydligt underlag när något avviker."
    seoTitle="Aurora Watch – kundflöden och webbövervakning från 299 kr/mån | Aurora Media"
    seoDescription="Bevaka viktiga sidor och testa navigering, länkar och synligt innehåll i webbläsaren. Aurora Watch från 299 kr/mån. Boka en genomgång."
    contactMessage={'Hej! Jag vill diskutera Aurora Watch för vår webbplats.\n\nWebbplats:\nViktigaste vägen till kontakt, bokning eller köp:\nAntal webbplatser:\n'}
    featuredLabel="Fler flöden"
    outcomes={[
      { title: "Se om besökaren hittar fram", body: "Kontrollen öppnar sidan, följer valda länkar och verifierar att rätt text eller element är synligt. Exempel: startsida → kontakt → kontaktformulär visas." },
      { title: "Få underlag att agera på", body: "Varje körning får tidpunkt, resultat och information om steget som avvek. Aurora Media kan granska skärmbilder i sin skyddade administration." },
      { title: "Skilj fel från tillfälliga problem", body: "En omkontroll hjälper oss att skilja återkommande fel från ett instabilt flöde. Väntande eller osäkra kontroller redovisas separat." },
      { title: "Behåll koll på webbplatsens grund", body: "Den befintliga sidbevakningen kontrollerar status, svarstid, noindex och utvald text i sidans HTML. Kundflödena kompletterar den kontrollen." },
    ]}
    includes={[
      "Tillsammans definierar vi de publika kundflöden som ska bevakas",
      "Navigering och länkklick på samma godkända webbplats",
      "Kontroll av synlig text och viktiga element i en riktig webbläsare",
      "Schemalagda kontroller och möjlighet att köa en extra kontroll",
      "Separata resultat för godkänt, avvikelse, instabilt och ej avgjort",
      "Körhistorik, stegresultat och privat bildunderlag för Aurora Medias uppföljning",
      "Nedladdningsbar sammanställning av de senaste körningarna under sju dagar",
      "SiteWatch-kontroller av serverrespons, svarstid, noindex och HTML-text",
    ]}
    tiers={[
      { name: "Watch Start", price: "299 kr", cadence: "/mån", desc: "För en webbplats med ett fåtal viktiga vägar till nästa steg.", features: ["Upp till 5 kundflöden", "Kontroll varje dygn", "Sidbevakning med SiteWatch", "Resultat och underlag via Aurora Media"] },
      { name: "Watch Pro", price: "699 kr", cadence: "/mån", featured: true, desc: "För fler kundflöden och tätare kontroll av det som är viktigt.", features: ["Upp till 20 kundflöden", "Kontroll upp till varje timme", "Sidbevakning med SiteWatch", "7-dagarsrapport från körhistoriken"] },
      { name: "Watch Byrå", price: "1 490 kr", cadence: "/mån", desc: "För byråer och företag som vill samla bevakningen av flera webbplatser.", features: ["Upp till 20 kundflöden fördelade på flera sajter", "Kontroll upp till varje timme", "Gemensam uppföljning med Aurora Media", "Fler flöden enligt offert"] },
    ]}
    pricingNote={<>Priser exklusive moms. Paketen beställs efter en genomgång av era flöden. Eventuell uppstart och särskilda anpassningar specificeras i offerten. Varje flöde omfattar upp till åtta steg på samma webbplats. Kontrollintervall är planerade tider och kan fördröjas.</>}
    process={[
      { title: "Välj vägarna som betyder något", body: "Vi väljer konkreta flöden på er publika webbplats, exempelvis att nå ett kontaktformulär eller hitta rätt bokningsinformation." },
      { title: "Verifiera första kontrollen", body: "Vi bestämmer vad som måste vara synligt och kör flödet. Det markeras inte som godkänt innan ett faktiskt test har lyckats." },
      { title: "Följ resultatet", body: "Kontroller körs enligt valt intervall. Avvikelser, instabilitet och osäkra resultat syns med tidpunkt och underlag i administrationen." },
      { title: "Bedöm och åtgärda", body: "Aurora Media kan följa upp underlaget tillsammans med er. Reparationer och löpande underhåll hanteras enligt separat offert eller Care-avtal." },
    ]}
    honesty={[
      "Flödena kontrollerar publika sidor, länkar och synligt innehåll. De skickar inte formulär, loggar inte in, skapar inga bokningar och genomför inga betalningar.",
      "Ett godkänt test gäller de definierade stegen vid den angivna tidpunkten. Det är ingen garanti för hela kundresan eller 100 procent drifttid.",
      "Kundflödenas avvikelser och underlag följs i Aurora Medias administration. Automatiska kundmejl för dessa flöden ingår inte i denna version.",
      "Rapporten är ett urval ur de senaste körningarna, inte en komplett drifttidsmätning. Privata skärmbilder sparas tidsbegränsat.",
    ]}
    faqs={[
      { q: "Vad är skillnaden mot vanlig driftbevakning?", a: "Sidbevakningen läser serverns svar. Aurora Watch öppnar dessutom sidan i en webbläsare och kontrollerar de länkar, texter och element vi valt. Det kan fånga en trasig väg till kontakt även när servern svarar normalt." },
      { q: "Testar ni kontaktformulär och checkout?", a: "Vi kan kontrollera att ett formulär eller en länk dit är synlig på samma webbplats. Vi skickar inte formulär eller betalningar och verifierar inte externa betaltjänster. Ett godkänt test bevisar därför inte att ett köp eller en registrering slutförs." },
      { q: "Vad betyder ett instabilt flöde?", a: "Första försöket misslyckades men omkontrollen lyckades. Det redovisas separat så att ett återkommande problem inte försvinner bakom ett grönt resultat." },
      { q: "Vad händer med SiteWatch?", a: "SiteWatch finns kvar som sidbevakningen i Aurora Watch. Befintliga monitorer behålls och kundflöden kan läggas till i samma administration." },
      { q: "Får vi ett eget konto?", a: "Det här är en tjänst som Aurora Media sätter upp och följer i sin administration. Om ni behöver egen kundportal eller särskild rapportleverans tar vi med det i offerten." },
    ]}
    related={[
      { name: "Aurora Care", price: "Från 995 kr/mån", to: "/care" },
      { name: "Tillgänglighetsaudit", price: "2 995 kr", to: "/tillganglighet" },
      { name: "Cookie & samtycke", price: "Från 149 kr/mån", to: "/cookie-samtycke" },
    ]}
  />
);

export default AuroraSiteWatch;

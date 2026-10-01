import OfferPage from "@/components/verkstad/OfferPage";

const AuroraSiteWatch = () => (
  <OfferPage
    slug="sitewatch"
    paketValue="Aurora SiteWatch"
    serviceType="Webbövervakning och incidentbevakning"
    eyebrow="Aurora SiteWatch"
    title="Upptäck webbproblem"
    titleEm="innan kunden gör det."
    intro="Aurora SiteWatch bevakar viktiga sidor, svarstid, noindex och att affärskritisk text faktiskt finns kvar. Vid bekräftad incident kan rätt kontakt få e-post, och när sidan återhämtar sig markeras den som återställd."
    seoTitle="Aurora SiteWatch – webbövervakning från 299 kr/mån | Aurora Media"
    seoDescription="Övervaka viktiga webbsidor, svarstid, noindex och förväntat innehåll. Bekräftade incidenter och återställningar kan aviseras via e-post."
    outcomes={[
      { title: "Fånga riktiga driftfel", body: "Vi kontrollerar HTTPS-svar, timeout och onormala statuskoder så att nedtid syns snabbt." },
      { title: "Se när en viktig sida förändras", body: "SiteWatch kan verifiera att vald text fortfarande finns i HTML och varnar om den försvinner." },
      { title: "Skydda indexeringen", body: "Oavsiktlig noindex i HTML eller X-Robots-Tag markeras som avvikelse innan den hinner bli ett långvarigt SEO-problem." },
      { title: "Mindre larmbrus", body: "En enstaka avvikelse kräver omkontroll. Incidentstatus sätts först efter två avvikande kontroller i följd." },
    ]}
    includes={[
      "Kontroll av HTTPS-status och svarstid",
      "Kontroll av noindex i HTML och X-Robots-Tag",
      "Valfri textkontroll per bevakad sida",
      "Kontrollintervall från 15 minuter till 24 timmar",
      "Incidentstatus efter två avvikande kontroller i följd",
      "E-post vid bekräftad incident och återställning när notifiering är konfigurerad",
      "Historik för de senaste kontrollerna i Aurora Medias adminportal",
      "Paus/aktivering per monitor och manuell kontroll på begäran",
    ]}
    tiers={[
      {
        name: "SiteWatch Basic",
        price: "299 kr",
        cadence: "/mån",
        desc: "För en mindre webbplats där de viktigaste sidorna behöver bevakas.",
        features: ["Upp till 5 bevakade sidor", "Kontroll varje timme", "Incident- och återställningsmail", "90 dagars kontrollhistorik"],
      },
      {
        name: "SiteWatch Pro",
        price: "799 kr",
        cadence: "/mån",
        desc: "För webbplatser där leads, bokningar eller försäljning är viktiga.",
        featured: true,
        features: ["Upp till 20 bevakade sidor", "Kontroll var 15:e minut", "Text- och noindex-kontroller", "Prioriterad incidenthantering"],
      },
      {
        name: "SiteWatch Managed",
        price: "1 490 kr",
        cadence: "/mån",
        desc: "För företag som vill att Aurora Media även följer upp och åtgärdar fel.",
        features: ["Allt i Pro", "Månadsvis genomgång", "Aurora Media följer upp bekräftade incidenter", "Åtgärdstid debiteras enligt avtal eller Care-paket"],
      },
    ]}
    pricingNote={
      <>
        Priser exklusive moms. Ingen bindningstid. SiteWatch testar serverrespons och HTML-baserade signaler.
        Inloggade användarflöden, formulärinskick och checkout-automation ingår inte i dessa paket förrän ett
        separat browser-test har satts upp och verifierats.
      </>
    }
    process={[
      { title: "Välj kritiska sidor", body: "Vi väljer de URL:er som faktiskt betyder något: startsida, kontakt, bokning, priser eller andra konverteringssidor." },
      { title: "Sätt kontrollregler", body: "Per sida bestämmer vi kontrollintervall och eventuell text som måste finnas kvar." },
      { title: "Bekräfta incident", body: "En första avvikelse markeras för omkontroll. Två avvikelser i följd blir en incident." },
      { title: "Följ återställningen", body: "När sidan är frisk igen markeras återställning och notifiering kan skickas till vald kontakt." },
    ]}
    honesty={[
      "SiteWatch är inte en garanti för 100 % drifttid och ersätter inte webbhotellets SLA.",
      "HTML-kontroller bevisar inte att ett komplext JavaScript-flöde eller ett betalsteg fungerar från början till slut.",
      "Notifiering via e-post kräver att utskicksdomänen är korrekt konfigurerad hos Aurora Media.",
    ]}
    faqs={[
      { q: "Kan ni bevaka flera sidor på samma webbplats?", a: "Ja. Varje viktig URL kan läggas upp som en egen monitor med egen textkontroll och eget intervall." },
      { q: "Testar ni formulär och checkout?", a: "Grundpaketen testar serverrespons och HTML-signaler. Riktiga browserflöden med klick och formulär kräver ett separat syntetiskt test som vi sätter upp först när flödet är definierat och verifierat." },
      { q: "Varför krävs två fel i följd?", a: "Det minskar falsklarm från korta nätverksstörningar och tillfälliga problem som går över innan en kund påverkas." },
      { q: "Kan SiteWatch ingå i Aurora Care?", a: "Ja. SiteWatch kan användas som fristående tjänst eller kombineras med Care när Aurora Media även sköter underhåll och åtgärder." },
    ]}
    related={[
      { name: "Aurora Care", price: "Från 995 kr/mån", to: "/care" },
      { name: "Tillgänglighetsaudit", price: "2 995 kr", to: "/tillganglighet" },
      { name: "Cookie & samtycke", price: "Från 149 kr/mån", to: "/cookie-samtycke" },
    ]}
  />
);

export default AuroraSiteWatch;

import OfferPage from "@/components/verkstad/OfferPage";

const AuroraCare = () => (
  <OfferPage
    slug="care"
    paketValue="Aurora Care"
    serviceType="WordPress drift och underhåll"
    eyebrow="Aurora Care"
    title="WordPress-drift som"
    titleEm="bara fungerar."
    intro="Uppdateringar, backup, säkerhet och småfix varje månad – till fast pris. Ni slipper trasiga plugins, hackade sajter och att själva hålla koll på när något behöver göras."
    seoTitle="Aurora Care – WordPress drift & underhåll från 995 kr/mån | Aurora Media"
    seoDescription="Löpande WordPress-underhåll: uppdateringar, säkerhetskopior, säkerhetsövervakning, hastighet och supporttid. Fast månadspris, ingen bindningstid. Aurora Media i Linköping."
    outcomes={[
      { title: "Sajten är uppdaterad", body: "WordPress, tema och plugins hålls aktuella och testas efter varje uppdatering. Går något sönder rullar vi tillbaka." },
      { title: "Backup som faktiskt går att återställa", body: "Dagliga säkerhetskopior lagras utanför webbhotellet. Vi testar återställning – en backup ni aldrig provat är ingen backup." },
      { title: "Färre säkerhetsincidenter", body: "Brandvägg, inloggningsskydd och övervakning av kända sårbarheter. Vid intrång ingår sanering i Complete-nivån." },
      { title: "Någon som svarar", body: "Ni mejlar info@auroramedia.se och får svar samma arbetsdag. Småfix ingår i er supporttid." },
    ]}
    includes={[
      "Uppdatering av WordPress-kärna, tema och plugins",
      "Daglig automatisk säkerhetskopiering med extern lagring",
      "Övervakning av drifttid med larm vid nedtid",
      "Säkerhetsgenomgång: inloggningsskydd, behörigheter, kända sårbarheter",
      "Prestandakontroll (Core Web Vitals) och åtgärdsförslag",
      "Databasstädning och borttagning av oanvända plugins",
      "Supporttid för textändringar och småfix",
      "Månadsrapport med vad som gjorts och vad som rekommenderas",
    ]}
    tiers={[
      {
        name: "Care Basic",
        price: "995 kr",
        cadence: "/mån",
        desc: "För enklare sajter som behöver hållas uppdaterade och säkrade.",
        features: ["Uppdateringar varje månad", "Daglig backup", "Drifttidsövervakning", "30 min supporttid/mån", "Månadsrapport"],
      },
      {
        name: "Care Plus",
        price: "1 995 kr",
        cadence: "/mån",
        desc: "För sajter som är en viktig del av försäljningen.",
        featured: true,
        features: ["Allt i Basic", "Uppdateringar varannan vecka", "Prestanda- och SEO-kontroll", "2 h supporttid/mån", "Prioriterat svar samma arbetsdag"],
      },
      {
        name: "Care Complete",
        price: "3 995 kr",
        cadence: "/mån",
        desc: "För e-handel och sajter där stillestånd kostar pengar.",
        features: ["Allt i Plus", "Veckovisa uppdateringar", "Testmiljö före större ändringar", "5 h supporttid/mån", "Sanering vid intrång ingår"],
      },
    ]}
    pricingNote={
      <>
        Priser exklusive moms. Ingen bindningstid – en månads uppsägning. Webbhotell och domän
        tillkommer om ni vill att vi hanterar dem. Behöver ni bara en engångsgenomgång av en
        eftersatt sajt gör vi det för 4 900 kr.
      </>
    }
    process={[
      { title: "Genomgång", body: "Vi tittar på sajten som den är: version, plugins, backup-läge, kända problem. Ni får en lista på vad som bör åtgärdas." },
      { title: "Upprättning", body: "Innan abonnemanget startar får sajten en ren utgångspunkt – uppdateringar, backup och grundläggande härdning." },
      { title: "Löpande drift", body: "Vi kör uppdateringar enligt vald nivå, testar viktiga sidor efteråt och åtgärdar det som behövs." },
      { title: "Rapport", body: "Varje månad får ni en kort rapport: vad som gjorts, hur sajten mår och vad vi rekommenderar härnäst." },
    ]}
    honesty={[
      "Vi garanterar inte 100 % drifttid – det avgörs av ert webbhotell. Vi larmar, felsöker och driver ärendet åt er.",
      "Omfattande ombyggnader och nya funktioner ingår inte i supporttiden. De offereras separat till fast pris.",
      "Licenskostnader för premium-plugins betalar ni själva, men vi hjälper till att välja bort det ni inte behöver.",
    ]}
    faqs={[
      { q: "Har ni bindningstid?", a: "Nej. Abonnemanget löper månadsvis med en månads uppsägning. Vi vill att ni stannar för att det är värt det." },
      { q: "Kan ni ta över en sajt någon annan byggt?", a: "Ja, det är vanligast. Vi börjar alltid med en genomgång och säger rakt ut om något behöver åtgärdas innan vi kan ta driftansvar." },
      { q: "Vad räknas som småfix?", a: "Textändringar, byta bilder, lägga till en sida, justera ett formulär, felsöka ett plugin. Allt som ryms i månadens supporttid." },
      { q: "Vad händer om sajten blir hackad?", a: "I Complete ingår sanering och återställning. I Basic och Plus hjälper vi till på löpande timpris, och backup gör att vi oftast är uppe igen samma dag." },
      { q: "Hanterar ni även andra plattformar än WordPress?", a: "Vi driftar även sajter vi själva byggt i React eller Shopify. Kontakta oss så säger vi om det passar." },
    ]}
    related={[
      { name: "Hemsidor", price: "Från 4 900 kr", to: "/tjanster/hemsidor" },
      { name: "Lokal synlighet", price: "Från 1 495 kr/mån", to: "/lokal-synlighet" },
      { name: "SEO", price: "Från 4 900 kr", to: "/tjanster/seo" },
    ]}
  />
);

export default AuroraCare;

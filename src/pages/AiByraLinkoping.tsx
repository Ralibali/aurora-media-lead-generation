import { useEffect } from "react";
import { ArrowRight, Check, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import NordicLayout, { Reveal } from "@/components/nordic/NordicLayout";
import { useContactModal } from "@/components/ContactModal";
import {
  setSEOMeta,
  setBreadcrumb,
  setJsonLd,
  removeJsonLd,
  organizationSchema,
  SITE_URL,
} from "@/lib/seoHelpers";

const PROBLEMS = [
  {
    n: "01",
    title: "Samma information skrivs in flera gånger",
    desc: "Kunduppgifter, order, dokument och fakturaunderlag flyttas manuellt mellan mejl, Excel och ekonomisystem.",
  },
  {
    n: "02",
    title: "Viktiga processer lever i kalkylblad",
    desc: "Verksamheten har vuxit, men planering, uppföljning och ansvar ligger fortfarande i listor som få vågar ändra.",
  },
  {
    n: "03",
    title: "Mejl och dokument tar för mycket tid",
    desc: "Inkommande frågor, beställningar eller underlag behöver sorteras, sammanfattas och registreras för hand.",
  },
  {
    n: "04",
    title: "Färdiga system passar nästan",
    desc: "Ni betalar för flera verktyg men behöver ändå bygga omvägar mellan dem för att få vardagen att fungera.",
  },
];

const SERVICES = [
  {
    title: "AI-automation av administration",
    desc: "Automatisera återkommande registrering, sammanställning, kategorisering och uppföljning utan att bygga bort den mänskliga kontrollen.",
  },
  {
    title: "Interna verksamhetssystem",
    desc: "Bygg ett eget arbetsverktyg för order, ärenden, planering, dokument eller uppföljning när standardprogrammen inte räcker.",
  },
  {
    title: "Mejl-, lead- och dokumentflöden",
    desc: "Låt AI tolka inkommande information, skapa utkast, föreslå nästa steg och skicka rätt underlag vidare till rätt person.",
  },
  {
    title: "Fortnox-, Visma- och API-integrationer",
    desc: "Koppla ihop ekonomi, betalningar, CRM, formulär och befintliga system så att data följer processen automatiskt.",
  },
  {
    title: "AI-assistenter med er egen kunskap",
    desc: "Bygg interna assistenter som söker i rutiner, dokument och produktinformation och ger spårbara svar till medarbetare.",
  },
  {
    title: "MVP, app och SaaS",
    desc: "Gå från idé till en första fungerande produkt med användare, databas, betalningar och AI där det faktiskt behövs.",
  },
];

const CASES = [
  {
    name: "Bergs Slussar Glamping",
    meta: "Eget verksamhetsprojekt · Linköping",
    desc: "Digital bokning, gästkommunikation och försäljning av tillval för en lokal besöksverksamhet vid Göta kanal.",
    href: "/arbete/goglamping-sweden",
  },
  {
    name: "Aurora Transport",
    meta: "Egen produkt · Transport",
    desc: "Dispatch- och fakturasystem med schemaläggning, körorder och ekonomiflöden samlade i en plattform.",
    href: "/arbete/aurora-transport",
  },
  {
    name: "Hönsgården",
    meta: "Egen produkt · App och AI",
    desc: "Freemium-app med statistik, abonnemang, hälsologg och AI-stöd för svenska hönsägare.",
    href: "/arbete/honsgarden",
  },
];

const PROCESS = [
  {
    n: "01",
    title: "Kartlägg processen",
    desc: "Vi börjar med arbetsmomentet, inte med ett AI-verktyg. Ni visar hur arbetet görs i dag och var tid eller kvalitet försvinner.",
  },
  {
    n: "02",
    title: "Välj minsta värdefulla lösning",
    desc: "Ni får ett avgränsat förslag med scope, teknik, pris och vad som uttryckligen inte ingår i första versionen.",
  },
  {
    n: "03",
    title: "Testa tidigt",
    desc: "En första version blir tillgänglig snabbt. Riktiga användare testar flödet innan vi lägger tid på detaljer som kanske inte behövs.",
  },
  {
    n: "04",
    title: "Lansera och mät",
    desc: "Vi driftsätter, dokumenterar och följer upp om lösningen faktiskt minskar manuellt arbete eller förbättrar kundflödet.",
  },
];

const FAQS = [
  {
    q: "Vilken är den bästa AI-byrån i Linköping för små och medelstora företag?",
    a: "Det beror på vad ni behöver. Vill ni ha både rådgivning och en färdigbyggd lösning till fast pris är en AI-byrå som Aurora Media rätt val: vi kartlägger processen, bygger systemet och står för driften – med fysisk närvaro i Linköping. Behöver ni bara en strategi räcker en ren AI-konsult, och behöver ni bara en hemsida räcker en webbyrå.",
  },
  {
    q: "Vad är skillnaden mellan en AI-konsult och en AI-byrå?",
    a: "En AI-konsult hjälper ofta till med analys och strategi. Aurora Media kombinerar rådgivning med design, utveckling, integration och lansering. Målet är inte en presentation om AI, utan en fungerande lösning som går att använda i verksamheten.",
  },
  {
    q: "Hur väljer jag AI-byrå i Linköping?",
    a: "Be om tre saker: konkreta exempel på lösningar i drift, ett fast pris med tydligt scope och svar på vem som äger koden. En seriös AI-byrå visar gärna fungerande produkter, skriver in GDPR- och datahantering i upplägget och låter er testa en tidig version innan ni betalar fullt.",
  },
  {
    q: "Vad kostar ett AI-projekt för företag?",
    a: "En avgränsad prototyp börjar från 14 900 kr, en MVP från 34 900 kr och en större skalbar lösning från 89 000 kr. Ni får alltid scope och fast pris innan arbetet startar. Större integrations- och verksamhetssystem offereras separat.",
  },
  {
    q: "Måste vi veta vilken AI-teknik vi behöver?",
    a: "Nej. Beskriv processen, problemet och resultatet ni vill nå. Vi bedömer om lösningen behöver generativ AI, vanlig automation, en integration eller ett nytt internt system. Ofta är rätt svar en kombination.",
  },
  {
    q: "Kan ni träffa företag på plats i Linköping?",
    a: "Ja. Aurora Media drivs från Linköping och fysiska möten kan bokas i Linköpingsområdet efter överenskommelse. Projektet kan därefter drivas effektivt med löpande digitala avstämningar och preview-länkar.",
  },
  {
    q: "Hur hanterar ni GDPR och känslig företagsdata?",
    a: "Datakällor, lagringsregion, behörigheter, loggning och vilka uppgifter som får skickas till en AI-modell bedöms i varje projekt. Vi bygger minsta nödvändiga dataflöde och använder inte känsliga uppgifter i externa modeller utan ett uttryckligt och genomtänkt upplägg.",
  },
  {
    q: "Vem äger koden och lösningen?",
    a: "Kunden får källkod, dokumentation och tillgång till relevanta projektkonton enligt avtalet. Lösningen byggs i standardteknik så att ni kan fortsätta med Aurora Media, ta över internt eller byta partner.",
  },
];

const AiByraLinkoping = () => {
  const { open } = useContactModal();
  const pageUrl = `${SITE_URL}/ai-byra-linkoping`;

  useEffect(() => {
    setSEOMeta({
      title: "AI-byrå i Linköping | Fast pris från 14 900 kr – Aurora Media",
      description:
        "AI-byrå i Linköping som hjälper företag automatisera administration, ersätta Excel och bygga AI-drivna interna system. Fast pris, lokal kontakt, första versionen på veckor.",
      canonical: "/ai-byra-linkoping",
      keywords:
        "AI-byrå Linköping, AI-konsult Linköping, AI-företag Linköping, AI-automation Linköping, AI-lösningar företag Linköping, interna system Linköping, AI byrå i Linköping",
    });

    setBreadcrumb([
      { name: "Hem", url: "/" },
      { name: "AI-konsult och AI-byrå i Linköping", url: "/ai-byra-linkoping" },
    ]);

    setJsonLd("ai-byra-linkoping-org", organizationSchema);
    setJsonLd("ai-byra-linkoping-service", {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${pageUrl}#service`,
      name: "Aurora Media – AI-konsult och AI-byrå i Linköping",
      description:
        "AI-konsult i Linköping som hjälper företag med AI-automation, interna system, integrationer, appar och SaaS.",
      url: pageUrl,
      image: `${SITE_URL}/og-image-sv.jpg`,
      email: "info@auroramedia.se",
      priceRange: "14900-89000+ SEK",
      founder: {
        "@type": "Person",
        name: "Christoffer Holstensson",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Linköping",
        addressRegion: "Östergötlands län",
        addressCountry: "SE",
      },
      areaServed: [
        { "@type": "City", name: "Linköping" },
        { "@type": "AdministrativeArea", name: "Östergötland" },
      ],
      serviceType: [
        "AI-konsulting",
        "AI-automation",
        "Systemutveckling",
        "SaaS-utveckling",
        "API-integrationer",
      ],
      makesOffer: [
        { "@type": "Offer", name: "Prototyp", price: "14900", priceCurrency: "SEK" },
        { "@type": "Offer", name: "MVP", price: "34900", priceCurrency: "SEK" },
        { "@type": "Offer", name: "Skalbar lösning", price: "89000", priceCurrency: "SEK" },
      ],
    });

    setJsonLd("ai-byra-linkoping-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });

    return () => {
      removeJsonLd("ai-byra-linkoping-org");
      removeJsonLd("ai-byra-linkoping-service");
      removeJsonLd("ai-byra-linkoping-faq");
      removeJsonLd("breadcrumb-jsonld");
    };
  }, [pageUrl]);

  return (
    <NordicLayout>
      <section className="page-hero">
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(36px,7vw,96px)",
              alignItems: "center",
            }}
          >
            <div>
              <Reveal>
                <p className="mono">ai-konsult · ai-byrå · linköping · östergötland</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1
                  className="hero-line"
                  style={{ marginTop: 18, fontSize: "clamp(2.3rem,5.6vw,4.8rem)", maxWidth: "17ch" }}
                >
                  AI-byrå i Linköping för <span className="it">verkliga arbetsflöden.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="lead" style={{ marginTop: 24, maxWidth: "62ch" }}>
                  Aurora Media är en AI-byrå i Linköping som hjälper företag att automatisera administration,
                  ersätta kalkylblad och bygga interna system som passar verksamheten. Lokal kontakt, fast pris
                  och en första version som går att testa inom några veckor.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={() => open()} className="btn btn-moss">
                    Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
                  </button>
                  <Link to="/ai-karta" className="btn btn-ghost">
                    Gör AI-kartläggningen
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.18}>
              <aside
                style={{
                  border: "1px solid var(--hair)",
                  borderRadius: 12,
                  padding: "clamp(24px,4vw,42px)",
                  background: "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.018))",
                }}
              >
                <div className="meta-label">Lokal och direkt kontakt</div>
                <h2 className="h3" style={{ marginTop: 18 }}>Aurora Media AB</h2>
                <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <MapPin size={18} style={{ flex: "0 0 auto", marginTop: 2 }} />
                    <p className="body">Drivs från Linköping. Fysiska möten i Linköpingsområdet efter överenskommelse.</p>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <ShieldCheck size={18} style={{ flex: "0 0 auto", marginTop: 2 }} />
                    <p className="body">Svenskt aktiebolag · Org.nr 559272-0220 · Kod och dokumentation enligt avtal.</p>
                  </div>
                </div>
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--hair)" }}>
                  <a href="mailto:info@auroramedia.se" className="text-link">info@auroramedia.se →</a>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Känner ni igen det här?</div></Reveal>
            <Reveal delay={0.1}>
              <div>
                <h2 className="h2">AI börjar sällan med AI. <span className="it">Det börjar med en dålig process.</span></h2>
                <p className="lead" style={{ marginTop: 22, maxWidth: "64ch" }}>
                  Vi letar efter momenten där personalen kopierar, sorterar, letar, sammanställer eller väntar.
                  Där finns ofta den snabbaste vägen till konkret nytta.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="work-grid">
            {PROBLEMS.map((problem, index) => (
              <Reveal key={problem.n} delay={index * 0.05}>
                <article className="work-card" style={{ height: "100%" }}>
                  <div className="meta-label">{problem.n}</div>
                  <h3 style={{ marginTop: 18 }}>{problem.title}</h3>
                  <p className="body" style={{ marginTop: 12 }}>{problem.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">AI-tjänster för företag</div></Reveal>
            <Reveal delay={0.1}>
              <div>
                <h2 className="h2">Från manuell rutin till <span className="it">fungerande system.</span></h2>
                <p className="lead" style={{ marginTop: 22, maxWidth: "64ch" }}>
                  Ni behöver inte beställa en viss teknik. Beskriv vad som tar tid och vad resultatet ska bli, så
                  väljer vi mellan AI, automation, integration och systemutveckling.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="feat-list">
            {SERVICES.map((service, index) => (
              <Reveal key={service.title} delay={index * 0.04}>
                <div className="feat-row">
                  <span className="feat-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{service.title}</span>
                  <span className="feat-body">{service.desc}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <button onClick={() => open()} className="btn btn-moss">
              Beskriv er process <span className="a"><ArrowRight size={14} /></span>
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Vad gör en AI-byrå?</div></Reveal>
            <Reveal delay={0.1}>
              <div>
                <h2 className="h2">En AI-byrå bygger lösningen. <span className="it">Inte bara strategin.</span></h2>
                <p className="lead" style={{ marginTop: 22, maxWidth: "64ch" }}>
                  Många som söker efter en AI-byrå i Linköping har redan pratat med konsulter som lämnat en
                  presentation och en rekommendation. Skillnaden hos en byrå är att samma part också designar,
                  programmerar, integrerar och driftsätter. Hos oss får ni båda delarna: rådgivningen om vad som
                  är värt att bygga – och bygget av det.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="work-grid">
            {[
              {
                n: "AI-konsult",
                title: "Analyserar och rekommenderar",
                desc: "Kartlägger möjligheter, håller utbildningar och tar fram strategi. Leveransen är ofta ett underlag – ni står kvar med genomförandet själva.",
              },
              {
                n: "Webbyrå",
                title: "Bygger webben, sällan AI:n",
                desc: "En traditionell webbyrå i Linköping bygger hemsidor och e-handel. När ni behöver automation, AI-assistenter och systemintegrationer räcker det sällan hela vägen.",
              },
              {
                n: "AI-byrå",
                title: "Rådgivning + bygge + drift",
                desc: "En AI-byrå kombinerar konsultens analys med byråns leverans: identifiera processen, bygg lösningen, koppla ihop systemen och följ upp att den faktiskt används.",
              },
            ].map((item, index) => (
              <Reveal key={item.n} delay={index * 0.05}>
                <article className="work-card" style={{ height: "100%" }}>
                  <div className="meta-label">{item.n}</div>
                  <h3 style={{ marginTop: 18 }}>{item.title}</h3>
                  <p className="body" style={{ marginTop: 12 }}>{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Priser</div></Reveal>
            <Reveal delay={0.1}>
              <div>
                <h2 className="h2">Vad kostar en AI-byrå i Linköping? <span className="it">Fast pris – eller konsult på timme.</span></h2>
                <p className="lead" style={{ marginTop: 22, maxWidth: "64ch" }}>
                  Byggprojekt kör vi till fast pris: ni får ett avgränsat scope innan arbetet börjar och vet exakt
                  vad AI-satsningen kostar. Behöver ni hellre en konsult i era egna team tar vi även uppdrag på
                  timme, per dag eller mot fast månadskostnad.
                </p>
              </div>
            </Reveal>
          </div>
          <style>{`@media(min-width:1000px){ .aur .work-grid.price-four{ grid-template-columns:repeat(4,1fr); } }`}</style>
          <div className="work-grid price-four">
            {[
              { name: "Prototyp", price: "från 14 900 kr", desc: "Klickbar version på 3–5 dagar. Testa idén skarpt innan ni satsar större.", href: "/priser" },
              { name: "MVP", price: "från 34 900 kr", desc: "Lanseringsklar lösning på cirka två veckor. Inloggning, betalning och admin.", href: "/priser" },
              { name: "Skalbar lösning", price: "från 89 000 kr", desc: "Full produkt eller internt system med integrationer, roller och drift.", href: "/priser" },
              { name: "Konsultuppdrag", price: "895 kr/timme", desc: "AI-rådgivning, utveckling i era team eller AI-CTO on demand – timpris 895 kr eller från 12 000 kr/mån.", href: "/ai-konsult-linkoping" },
            ].map((p, index) => (
              <Reveal key={p.name} delay={index * 0.05}>
                <Link to={p.href} className="work-card" style={{ height: "100%", display: "block" }}>
                  <div className="meta-label">{p.name}</div>
                  <h3 style={{ marginTop: 18 }}>{p.price}</h3>
                  <p className="body" style={{ marginTop: 12 }}>{p.desc}</p>
                  <div className="url" style={{ marginTop: 18 }}>Se paketet →</div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link to="/verktyg/app-prisraknare" className="btn btn-ghost">
              Räkna på ert projekt i prisräknaren <span className="a"><ArrowRight size={14} /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Lokalt i Östergötland</div></Reveal>
            <Reveal delay={0.1}>
              <div>
                <h2 className="h2">En AI-byrå med rötter i <span className="it">Linköpings tekniktradition.</span></h2>
                <p className="lead" style={{ marginTop: 22, maxWidth: "64ch" }}>
                  Linköping är en av Sveriges starkaste teknikstäder – från Mjärdevi Science Park och
                  Linköpings universitet till hundratals teknik- och industriföretag i regionen. Aurora Media
                  drivs härifrån och hjälper företag i Linköping, Norrköping och resten av Östergötland att
                  omsätta AI till konkret nytta. Fysiska möten bokas enkelt i Linköpingsområdet, och alla
                  projekt drivs med löpande digitala avstämningar och testbara versioner.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="work-grid">
            {[
              { n: "01", title: "Möten på plats i Linköping", desc: "Kickoff och viktiga avstämningar kan ske hos er eller oss – resten sköts effektivt digitalt." },
              { n: "02", title: "Samma tid, samma språk", desc: "Ingen offshoremodell. Ni pratar direkt med den som bygger, på svenska, utan mellanhänder." },
              { n: "03", title: "Svensk lagring och GDPR", desc: "Datalagring, behörigheter och AI-modeller väljs med svenska förhållanden och EU-regler i åtanke." },
            ].map((item, index) => (
              <Reveal key={item.n} delay={index * 0.05}>
                <article className="work-card" style={{ height: "100%" }}>
                  <div className="meta-label">{item.n}</div>
                  <h3 style={{ marginTop: 18 }}>{item.title}</h3>
                  <p className="body" style={{ marginTop: 12 }}>{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Så går det till</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">Mindre workshop. <span className="it">Mer fungerande produkt.</span></h2>
            </Reveal>
          </div>
          <div className="proc-grid">
            {PROCESS.map((step) => (
              <div className="proc-step" key={step.n}>
                <span className="proc-num">{step.n}</span>
                <h3 className="proc-name">{step.title}</h3>
                <p className="body">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Erfarenhet från drift</div></Reveal>
            <Reveal delay={0.1}>
              <div>
                <h2 className="h2">Vi bygger också våra <span className="it">egna verksamheter och produkter.</span></h2>
                <p className="lead" style={{ marginTop: 22, maxWidth: "64ch" }}>
                  Exemplen nedan är öppet märkta som egna projekt. Det innebär att vi själva hanterar användare,
                  betalningar, drift, fel och förbättringar efter lansering.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="work-grid">
            {CASES.map((item) => (
              <Link to={item.href} key={item.name} className="work-card">
                <div className="meta-label">{item.meta}</div>
                <h3 style={{ marginTop: 18 }}>{item.name}</h3>
                <p className="body" style={{ marginTop: 12 }}>{item.desc}</p>
                <div className="url" style={{ marginTop: 18 }}>Se projektet →</div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 32 }}>
            <Link to="/arbete" className="btn btn-ghost">
              Se alla projekt <span className="a"><ArrowRight size={14} /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div
            style={{
              border: "1px solid var(--hair)",
              borderRadius: 12,
              padding: "clamp(28px,5vw,60px)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "clamp(28px,5vw,72px)",
            }}
          >
            <div>
              <div className="meta-label">Tryggare beställning</div>
              <h2 className="h2" style={{ marginTop: 18 }}>Ni ska förstå <span className="it">vad ni köper.</span></h2>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                "Tydligt scope och pris innan start",
                "Tidigt testbar version och löpande insyn",
                "Standardteknik utan onödig leverantörslåsning",
                "Behörighet, datalagring och GDPR bedöms per lösning",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <Check size={17} style={{ flex: "0 0 auto", marginTop: 2 }} />
                  <p className="body">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Vanliga frågor</div></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2">AI-byrå i Linköping – <span className="it">frågor och svar.</span></h2>
            </Reveal>
          </div>
          <div className="feat-list">
            {FAQS.map((item, index) => (
              <Reveal key={item.q} delay={index * 0.04}>
                <div className="feat-row">
                  <span className="feat-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="feat-title">{item.q}</span>
                  <span className="feat-body">{item.a}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <Reveal><div className="meta-label">Fördjupa er</div></Reveal>
            <Reveal delay={0.1}><h2 className="h2">Nästa relevanta sida.</h2></Reveal>
          </div>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 8 }} aria-label="Relaterade sidor">
            {[
              { to: "/ai-karta", label: "Kostnadsfri AI-kartläggning" },
              { to: "/ai-automation-foretag", label: "AI-automation för företag" },
              { to: "/ai-automation-linkoping", label: "AI-automation Linköping" },
              { to: "/ai-konsult-sverige", label: "AI-konsult Sverige" },
              { to: "/saas-utveckling-linkoping", label: "SaaS-utveckling Linköping" },
              { to: "/verktyg", label: "Gratis AI-verktyg och kalkylatorer" },
              { to: "/arbete", label: "Projekt och case" },
              { to: "/priser", label: "Priser och upplägg" },
              { to: "/blogg", label: "Guider om AI och automation" },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="pill">{item.label} →</Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="meta-label">Kostnadsfri första bedömning</div>
          <h2 className="h2" style={{ marginTop: 18, maxWidth: "20ch" }}>
            Visa oss processen ni vill slippa göra <span className="it">manuellt.</span>
          </h2>
          <p className="lead" style={{ marginTop: 22, maxWidth: "60ch" }}>
            Ni får en rak återkoppling på vad som går att automatisera, vad som bör byggas som ett system och
            vad som inte behöver AI alls.
          </p>
          <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <button onClick={() => open()} className="btn btn-moss">
              Boka kostnadsfri rådgivning <span className="a"><ArrowRight size={14} /></span>
            </button>
            <a href="mailto:info@auroramedia.se" className="cta-email">info@auroramedia.se →</a>
          </div>
        </div>
      </section>
    </NordicLayout>
  );
};

export default AiByraLinkoping;

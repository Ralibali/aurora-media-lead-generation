// City landing page content – unique copy per city for local SEO.
// Used by /saas-utveckling-:slug route.

export interface CityContent {
  slug: string;
  city: string;
  region: string;
  intro: string; // Why hire AI agency in this city (300-500 chars)
  localContext: string; // Näringsliv / branschmix
  comparison: string; // How we differ from local agencies
  caseNote?: string; // Optional local case mention
  faqs: { q: string; a: string }[];
}

export const cities: CityContent[] = [
  {
    slug: "linkoping",
    city: "Linköping",
    region: "Östergötlands län",
    intro:
      "Linköping är Sveriges fjärde största universitetsstad med ett tätt teknik-näringsliv kring Saab, Ericsson och en växande startup-scen runt Mjärdevi. Många bolag här har sett dev-kostnaderna explodera de senaste åren samtidigt som leveranstiderna kryper uppåt. AI-kodning vänder den ekvationen – du får en lanseringsklar SaaS på 2 veckor istället för 6 månader.",
    localContext:
      "Mjärdevi Science Park, LiU och försvarsindustrin gör Linköping till en av Sveriges tätaste tech-kluster per capita. Jag bygger interna verktyg åt bolag som tröttnat på att betala konsultbyråer 1 800 kr/h för enkla CRUD-appar.",
    comparison:
      "En traditionell webbyrå i Linköping tar 80 000–250 000 kr för en företagshemsida och 6–12 månader för en SaaS. Jag levererar prototyp på 3–5 dagar (14 900 kr), MVP på 2 veckor (34 900 kr) och full SaaS på 4 veckor (69 000 kr). Fast pris, ingen timdebitering.",
    caseNote:
      "Aurora Transport, ett dispatching-system för svenska transportbolag, byggdes från grunden i Linköping på 3 veckor. Det visar vad som faktiskt går att leverera lokalt med rätt verktyg.",
    faqs: [
      {
        q: "Finns det bra SaaS-utvecklare i Linköping 2026?",
        a: "Ja, men de flesta jobbar internt på Saab, Ericsson eller Sectra. Frilanskonsulter ligger på 1 200–1 800 kr/timmen. Jag är ett av få alternativ som jobbar fast pris och levererar färdig produkt på veckor.",
      },
      {
        q: "Tar du fysiska möten i Linköping?",
        a: "Ja, jag är baserad här och kan ses i centrala Linköping eller på Mjärdevi. För 90 procent av kunderna räcker dock video-möten – det går snabbare att komma igång.",
      },
      {
        q: "Vilka branscher i Linköping passar för AI-byggd SaaS?",
        a: "Tillverkning, transport, hälsa, utbildning – allt som har manuella Excel-flöden eller dyra licensavtal med utländska SaaS-bolag. Jag har byggt åt transport, agility-träning, hönsuppfödning och massagebokning. Det är väldigt brett.",
      },
      {
        q: "Hur snabbt kan vi börja?",
        a: "Skickar du e-post idag svarar jag inom 24 timmar vardagar. Vi har ett kort samtal samma vecka, jag levererar offert dagen efter, och vi kan vara igång inom 7–10 dagar.",
      },
    ],
  },
  {
    slug: "norrkoping",
    city: "Norrköping",
    region: "Östergötlands län",
    intro:
      "Norrköping har gått från industristad till logistik- och datacenter-hub med Visualiseringscenter C och en växande tech-scen runt Inlandsbanan. Många mellanstora bolag här sitter fortfarande på interna Excel-system som borde vara appar. AI-kodning gör det realistiskt att bygga om dem på veckor istället för år.",
    localContext:
      "Logistik, transport, e-handel och digital konst dominerar Norrköpings näringsliv. Närheten till Linköping ger tillgång till tech-kompetens utan storstadens prislapp.",
    comparison:
      "Lokala byråer i Norrköping ligger ofta på 800–1 500 kr/timmen och 3–6 månaders ledtid. Jag har fast pris från 14 900 kr och levererar prototyp på 3–5 dagar. För Norrköpings logistikbolag betyder det att en intern app går från idé till produktion innan kvartalet är slut.",
    faqs: [
      {
        q: "Bygger du för logistikbolag i Norrköping?",
        a: "Ja, det är en av mina vanligaste branscher. Aurora Transport är ett dispatching-system för transportbolag och kan användas som mall eller skräddarsys.",
      },
      {
        q: "Hur fungerar samarbete på distans från Norrköping?",
        a: "Jag är 45 min bort i Linköping och kan ses fysiskt vid behov. Annars kör vi video-möten 1–2 gånger per vecka under projektet. Lika smidigt som lokalt.",
      },
      {
        q: "Kan ni bygga ihop oss med Fortnox eller Visma?",
        a: "Ja, jag har byggt Fortnox-integrationer i flera produkter. Visma fungerar också. Båda har bra svenska API:er.",
      },
      {
        q: "Vad kostar en intern app som ersätter Excel?",
        a: "Oftast 34 900–69 000 kr beroende på komplexitet. Det betalar sig på 3–6 månader genom sparad administrativ tid.",
      },
    ],
  },
  {
    slug: "jonkoping",
    city: "Jönköping",
    region: "Jönköpings län",
    intro:
      "Jönköping är handels- och logistik-huvudstaden i södra Sverige med en stark närvaro av familjeägda bolag och industri. Många här letar efter mer effektiva interna verktyg men har avskräckts av byrå-priser. AI-kodning gör att även mindre bolag har råd med en skräddarsydd SaaS – från 14 900 kr för en prototyp.",
    localContext:
      "Handel, logistik, träindustri och tillverkning. Familjeföretag som vuxit ur sina Excel-flöden men inte vill betala 500 000 kr för en intern app.",
    comparison:
      "Jönköpings webbyråer fokuserar oftast på WordPress och e-handel. För moderna SaaS-projekt får du leta längre. Jag bygger React + Supabase-baserade produkter på fast pris med 2–4 veckors leverans.",
    faqs: [
      {
        q: "Bygger du e-handel i Jönköping?",
        a: "Inte traditionell e-handel (Shopify gör det bättre). Men marknadsplatser, B2B-portaler, prenumerationsmodeller och hybrid-modeller bygger jag gärna.",
      },
      {
        q: "Tar du fysiska möten i Jönköping?",
        a: "Det går att lösa, men för effektivitetens skull föredrar jag video-möten. Hälften av mina kunder finns utanför Östergötland.",
      },
      {
        q: "Hur fungerar fast pris om vi ändrar oss under projektet?",
        a: "Mindre justeringar ingår. Större förändringar i scope skrivs som tilläggsoffert med fast pris. Du blir aldrig överraskad av en faktura.",
      },
      {
        q: "Vilken support får vi efter lansering?",
        a: "30 dagars buggfri-garanti ingår. Sedan kan du teckna löpande underhåll från 1 990 kr/mån eller köpa timmar vid behov.",
      },
    ],
  },
  {
    slug: "stockholm",
    city: "Stockholm",
    region: "Stockholms län",
    intro:
      "Stockholms tech-scen är Sveriges tätaste men också dyraste. Att bygga en SaaS med en stockholmsbyrå kostar ofta 500 000–2 000 000 kr och tar 6–12 månader. Jag levererar samma sak från Linköping på 2–4 veckor till en bråkdel av priset – samma React + Supabase-stack, samma kvalitet, ingen Stockholm-overhead.",
    localContext:
      "Fintech, SaaS, hälsa, e-handel och AI-startups dominerar. Många grundare här har redan testat traditionella byråer och tröttnat på prislappar och ledtider.",
    comparison:
      "Stockholmsbyråer ligger på 1 500–2 500 kr/timmen och 6–12 månaders projekt. Jag har fast pris från 14 900 kr och 2–4 veckors leverans. Samma slutprodukt – ofta bättre eftersom jag kan iterera snabbare.",
    faqs: [
      {
        q: "Du sitter i Linköping – funkar det för stockholmsbolag?",
        a: "Ja, hälften av mina kunder finns i Stockholm. Vi kör video-möten och jag åker upp för fysiska möten vid större milstolpar om det önskas.",
      },
      {
        q: "Är ni billigare för att ni är utanför Stockholm?",
        a: "Delvis, men främst för att jag använder AI-verktyg som Lovable och Bolt och därmed inte behöver fakturera 200 timmar för det som tar 30. Värdet ligger i metoden, inte i geografin.",
      },
      {
        q: "Kan ni jobba med våra interna utvecklare?",
        a: "Ja, jag levererar fullständig källkod och kan jobba ihop med era team via GitHub. Många kunder tar över utveckling efter MVP.",
      },
      {
        q: "Hur jämför ni er med Stockholms AI-byråer som dyker upp 2026?",
        a: "Jag har byggt 7 egna SaaS-produkter och har 10 års bakgrund i säkerhetsbranschen innan det. Ren erfarenhet av att leverera, inte bara använda verktygen.",
      },
    ],
  },
  {
    slug: "goteborg",
    city: "Göteborg",
    region: "Västra Götalands län",
    intro:
      "Göteborg är fordonsindustrins och tillverkningens huvudstad i Sverige. Volvo, AstraZeneca och hundratals tier 2-bolag driver tech-behov för intern automation, dashboards och B2B-portaler. AI-kodning gör att projekt som tidigare krävde 200 konsulttimmar kan levereras på fast pris från 14 900 kr.",
    localContext:
      "Fordon, life science, sjöfart och industri. Mellanstora tillverkningsbolag som vill digitalisera interna processer men inte har råd med traditionella IT-konsulter.",
    comparison:
      "Göteborgsbyråer prissätter ofta 1 200–2 000 kr/timmen för React-utveckling. Jag levererar fast pris från 14 900 kr för prototyp och 34 900 kr för MVP. Hälften till en tredjedel av kostnaden, en fjärdedel av tiden.",
    faqs: [
      {
        q: "Bygger du integrationer med Volvos system eller liknande?",
        a: "Ja, så länge ni har dokumenterade API:er. Jag har byggt integrationer mot Fortnox, Stripe, HubSpot, Resend, Slack och flera anpassade ERP-system.",
      },
      {
        q: "Hur ofta åker du till Göteborg för möten?",
        a: "Vid behov 1–2 gånger per projekt. Annars video-möten. De flesta kunder här föredrar effektiv distans framför fysiska möten.",
      },
      {
        q: "Är ni rätt val för en industribolag i Göteborg?",
        a: "Ja, särskilt för interna verktyg, dashboards och kund-portaler. Jag har byggt liknande system för transport, hälsa och utbildning.",
      },
      {
        q: "Vad är skillnaden mot en lokal Göteborgsbyrå?",
        a: "Snabbare leverans, fast pris, modernare stack (React + Supabase istället för WordPress eller .NET). Och jag jobbar ensam – ingen byråkrati.",
      },
    ],
  },
  {
    slug: "malmo",
    city: "Malmö",
    region: "Skåne län",
    intro:
      "Malmö har blivit en av Nordens mest dynamiska tech-städer med Minc, MTS och en ständigt växande startup-scen. Många nya bolag här söker snabb produktutveckling utan att binda sig till stora byråer. AI-kodning passar perfekt för MVP-fasen – från idé till lanseringsklar produkt på 2 veckor för 34 900 kr.",
    localContext:
      "Gaming, fintech, greentech, e-handel och kreativa byråer. Många grundare med svenskt-danskt nätverk som tänker norden från start.",
    comparison:
      "Malmöbyråer är ofta starka på design men dyra på utveckling. Jag levererar både design och kod på fast pris. För en startup som behöver MVP betyder det 34 900 kr och 2 veckor istället för 200 000 kr och 4 månader.",
    faqs: [
      {
        q: "Bygger du för danska kunder också?",
        a: "Ja, jag har kunder i hela Norden. Allt levereras på engelska eller svenska beroende på önskemål.",
      },
      {
        q: "Hur skiljer ni er från Malmös design-byråer?",
        a: "De gör snyggt men outsourcar utvecklingen. Jag gör båda. Du får färdig produkt, inte bara mock-ups.",
      },
      {
        q: "Kan ni bygga gaming-relaterade dashboards?",
        a: "Spel-logik nej, men metadashboards, communityverktyg, leaderboards och adminpaneler ja. Allt som är webb-baserat.",
      },
      {
        q: "Vad är ledtiden för Malmö-projekt?",
        a: "Samma som för alla andra: prototyp 3–5 dagar, MVP 2 veckor, skalbar SaaS 4 veckor. Geografin spelar ingen roll på distans.",
      },
    ],
  },
  {
    slug: "uppsala",
    city: "Uppsala",
    region: "Uppsala län",
    intro:
      "Uppsala är Sveriges äldsta universitetsstad med en stark life science- och biotech-sektor kring Uppsala universitet och SLU. Många forskningsavknoppningar här behöver enkla interna verktyg eller lättviktiga SaaS-produkter snabbt och billigt. AI-kodning gör att även mindre forskningsteam har råd med skräddarsydd mjukvara.",
    localContext:
      "Life science, biotech, akademiska avknoppningar och pharma. Små team med specifika behov som inte täcks av kommersiell mjukvara.",
    comparison:
      "Akademiska projekt har sällan stora budgetar. Jag erbjuder prototyp för 14 900 kr och MVP för 34 900 kr – det får plats i de flesta forskningsanslag eller seed-rundor.",
    faqs: [
      {
        q: "Bygger du för forskningsprojekt i Uppsala?",
        a: "Ja, så länge det är webbaserat. Datainsamling, lab-management, deltagarportaler – allt som inte är CAD eller bioinformatik kan jag bygga.",
      },
      {
        q: "Kan ni hantera GDPR-känslig forskningsdata?",
        a: "Ja, jag bygger med Supabase i EU-region och säkerställer korrekt RLS, kryptering och loggning. Jag har erfarenhet från säkerhetsbranschen.",
      },
      {
        q: "Hur fungerar samarbetet på distans från Uppsala?",
        a: "Video-möten 1–2 gånger per vecka under projektet. Vid behov åker jag upp för workshops eller större milstolpar.",
      },
      {
        q: "Vad ingår i ett MVP-paket för en biotech-startup?",
        a: "Allt som behövs för att lansera: design, utveckling, databas, autentisering, betalningar om relevant, deploy. 34 900 kr fast pris, 2 veckor.",
      },
    ],
  },
  {
    slug: "vasteras",
    city: "Västerås",
    region: "Västmanlands län",
    intro:
      "Västerås är industri- och energi-hub med ABB, Northvolt och en växande digital sektor. Många traditionella industribolag här digitaliserar nu interna processer på allvar – och många upptäcker att AI-kodning ger dem råd att bygga skräddarsydda lösningar istället för att betala dyra licensavtal.",
    localContext:
      "Energi, industri-automation, tillverkning och tunga maskiner. Bolag som behöver dashboards, rapportverktyg och interna portaler men inte vill bygga själva.",
    comparison:
      "Industribolag i Västerås har historiskt anlitat IT-konsulter på 1 500 kr/timmen för långa projekt. Jag levererar fast pris från 14 900 kr på 3–5 dagar för prototyp. Stor förändring för CFO:n.",
    faqs: [
      {
        q: "Bygger du dashboards för industri?",
        a: "Ja, det är en av mina vanligaste leveranser. Realtidsdata, KPI:er, rapportexport, användarroller – allt på React + Supabase.",
      },
      {
        q: "Kan ni integrera med PLC eller SCADA-system?",
        a: "Webb-lagret ja, om det finns ett API eller MQTT-broker. Direkt PLC-integration är inget jag tar – det kräver specialistkonsulter.",
      },
      {
        q: "Hur långa projekt brukar Västerås-bolag beställa?",
        a: "Oftast börjar de med prototyp eller MVP (2 veckor) för att testa konceptet, sedan skalar upp till full SaaS (4 veckor) när det är validerat.",
      },
      {
        q: "Tar du fysiska möten i Västerås?",
        a: "Vid behov för större projekt. För de flesta räcker video-möten – mer effektivt och håller projektet i takt.",
      },
    ],
  },
  {
    slug: "orebro",
    city: "Örebro",
    region: "Örebro län",
    intro:
      "Örebro är ett strategiskt nav mellan Stockholm och Göteborg med ett brett näringsliv från logistik till hälsa. Många mellanstora bolag här söker mer effektiva digitala verktyg men har inte resurser att anlita stora byråer. AI-kodning gör att även 50-personers företag har råd med skräddarsydd SaaS – från 14 900 kr.",
    localContext:
      "Logistik, livsmedel, hälsa och universitetsanknutna projekt via Örebro universitet. Mix av etablerade industriföretag och unga startups.",
    comparison:
      "Lokala byråer i Örebro fokuserar oftast på WordPress och visuell identitet. För moderna SaaS-projekt med inloggning, betalningar och databas behövs en annan sorts partner. Jag bygger React + Supabase på fast pris.",
    faqs: [
      {
        q: "Vilka företag i Örebro har du jobbat med?",
        a: "Jag pratar inte specifikt om kunder utan deras tillstånd. Men exempel på bygg-typer: dispatching, marknadsplatser, prenumerations-SaaS, bokningssystem och interna verktyg.",
      },
      {
        q: "Är ni rätt för en mellanstor verksamhet i Örebro?",
        a: "Ja, det är min vanligaste kundprofil. 10–100 anställda, behöver något specifikt byggt, vill inte binda upp sig i flera månaders projekt.",
      },
      {
        q: "Hur fungerar betalningsstrukturen?",
        a: "Hälften vid uppstart, hälften vid leverans. Större projekt kan delas upp i milstolpar. Inga dolda kostnader.",
      },
      {
        q: "Kan ni komma till Örebro för möten?",
        a: "Ja, vid större projekt. Annars video-möten – fungerar lika bra och sparar tid för alla.",
      },
    ],
  },
];

export const getCity = (slug: string): CityContent | undefined =>
  cities.find((c) => c.slug === slug);

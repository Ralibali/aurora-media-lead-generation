// City landing page content – unique copy per city for local SEO.
// Used by /saas-utveckling-:slug and /ai-byra-:slug routes.

export interface CityContent {
  slug: string;
  city: string;
  region: string;
  intro: string;
  localContext: string;
  comparison: string;
  caseNote?: string;
  faqs: { q: string; a: string }[];
}

export interface CitySeo {
  metaTitleSaaS: string;
  metaDescSaaS: string;
  metaTitleAI: string;
  metaDescAI: string;
  h1Pre: string;
  h1Em: string;
  keywords: string[];
  tjansterIntro: string;
}

export const cities: CityContent[] = [
  {
    slug: "linkoping",
    city: "Linköping",
    region: "Östergötlands län",
    intro: "Samlar ni kunduppgifter i flera system eller följer upp arbetsorder för hand? Vi bygger verktyg som knyter ihop det dagliga arbetet. Aurora Media är baserat i Linköping och ni har direktkontakt med den som bygger.",
    localContext: "Ett första projekt kan vara en intern portal där teamet ser uppdrag, ansvarig och nästa steg. Vi utgår från ett befintligt arbetsflöde och gör en första version som ni kan prova.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    caseNote: "I portfolion finns Aurora Transport, en egen produkt för transportflöden. Se projektet och använd det som underlag för vad ni vill bygga.",
    faqs: [
      { q: "Kan vi träffas i Linköping?", a: "Ja, ett möte i Linköping kan bokas efter överenskommelse. Vi kan också arbeta via videomöten och gemensamma genomgångar av produkten." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Linköping kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "norrkoping",
    city: "Norrköping",
    region: "Östergötlands län",
    intro: "För företag i Norrköping bygger vi interna verktyg, kundportaler och automation. Börja med ett flöde där order, kundfrågor eller leveransuppgifter behöver flyttas mellan mejl och kalkylark.",
    localContext: "En orderportal kan samla inkommande uppdrag, status och ansvarig på samma plats. Kopplingar till ekonomi- eller transportsystem utreds innan vi lämnar offert.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    caseNote: "I portfolion finns Aurora Transport, en egen produkt för transportflöden. Se projektet och använd det som underlag för vad ni vill bygga.",
    faqs: [
      { q: "Kan ni koppla ihop order och fakturering?", a: "Vi går igenom vilka system ni använder och deras API:er och behörigheter. Därefter kan vi föreslå en avgränsad integration och vad som fortsatt behöver kontrolleras av en människa." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Norrköping kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "jonkoping",
    city: "Jönköping",
    region: "Jönköpings län",
    intro: "Behöver ert företag i Jönköping en portal för kunder, återförsäljare eller interna beställningar? Vi hjälper er att göra behovet konkret och bygga en första version med tydlig omfattning.",
    localContext: "Ett exempel är en B2B-portal där kunden lämnar en förfrågan, bifogar underlag och följer status. Börja med den del som minskar flest manuella överlämningar.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Kan vi börja med en enda del av vårt orderflöde?", a: "Ja. Vi kan avgränsa exempelvis inkommande beställningar eller kundernas statusfrågor. Resten av verksamheten kan fortsätta använda befintliga system medan den första delen provas." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Jönköping kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "stockholm",
    city: "Stockholm",
    region: "Stockholms län",
    intro: "Har ni en produktidé eller ett internt arbetsflöde som behöver bli enklare? Vi hjälper företag i Stockholm att avgränsa, bygga och testa SaaS, AI-automation och interna verktyg, med direktkontakt från vår bas i Linköping.",
    localContext: "En första version kan testa ett centralt kundflöde: registrering, ett konkret arbetsmoment och resultatet användaren får. Med ett tydligt mål blir det lättare att avgöra vad som ska byggas härnäst.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    caseNote: "I portfolion finns Aurora Transport, en egen produkt för transportflöden. Se projektet och använd det som underlag för vad ni vill bygga.",
    faqs: [
      { q: "Kan ni samarbeta med vårt utvecklingsteam?", a: "Ja, vi kan planera gränssnitt, kodöverlämning och ansvar tillsammans med ert team. Om ni redan har en produkt börjar vi med att gå igenom dess förutsättningar." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Stockholm kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "goteborg",
    city: "Göteborg",
    region: "Västra Götalands län",
    intro: "Vi hjälper företag i Göteborg att bygga verktyg för sådant som idag kräver manuella sammanställningar. Det kan handla om en kundportal, en orderöversikt eller rapportering som hämtar data från era befintliga system.",
    localContext: "En verksamhetsöversikt kan visa status, avvikelser och vem som behöver agera. Datakällor, uppdateringsintervall och åtkomst behöver vara tydliga innan utvecklingen börjar.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Kan ni bygga ovanpå vårt befintliga affärssystem?", a: "Det beror på systemets API, licensvillkor och vilka uppgifter ni behöver. Vi undersöker detta först och tar med integrationsarbetet i omfattningen." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Göteborg kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "malmo",
    city: "Malmö",
    region: "Skåne län",
    intro: "För företag och produktteam i Malmö bygger vi SaaS, kundportaler och AI-stöd. Vi börjar med vad en användare ska kunna göra och avgränsar en första version kring just det.",
    localContext: "En prototyp kan hjälpa er att pröva ett bokningsflöde, en prenumerationstjänst eller en marknadsplats innan ni investerar i fler funktioner. Betalning och andra integrationer planeras när behovet är tydligt.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Kan en prototyp användas i kundintervjuer?", a: "Ja, en klickbar eller fungerande prototyp kan ge något konkret att visa. Vi bestämmer vad som ska fungera och vad som är demonstrationsdata, så att deltagarna förstår vad de provar." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Malmö kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "uppsala",
    city: "Uppsala",
    region: "Uppsala län",
    intro: "Behöver ert team i Uppsala samla projektinformation, följa upp ärenden eller minska dubbelregistrering? Vi bygger webbaserade verktyg med tydliga arbetsflöden och användarroller.",
    localContext: "En projektportal kan samla uppgifter, dokument och ansvariga. Om arbetet berör känsliga uppgifter börjar vi med dataklassning och krav på åtkomst, lagring och granskning innan vi bedömer en lösning.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Kan vi använda känsliga uppgifter i en prototyp?", a: "Vi börjar med exempeldata eller anonymiserade uppgifter. Användning av verkliga känsliga uppgifter kräver en separat genomgång av krav, ansvar och tekniska skydd." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Uppsala kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "vasteras",
    city: "Västerås",
    region: "Västmanlands län",
    intro: "Vi hjälper företag i Västerås att göra rapportering, uppföljning och interna beställningar enklare. Ett tydligt avgränsat verktyg kan samla information som annars behöver hämtas från flera håll.",
    localContext: "Börja exempelvis med en översikt för avvikelser: vad har hänt, vem ansvarar och när ska nästa kontroll ske? Vi kan utreda ett webbaserat gränssnitt till befintliga datakällor.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Kan ni ansluta till produktionssystem?", a: "Vi kan bedöma webbaserade integrationer när det finns ett dokumenterat gränssnitt. Styrning av maskiner och säkerhetskritiska system kräver särskild kompetens och ingår inte automatiskt." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Västerås kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "orebro",
    city: "Örebro",
    region: "Örebro län",
    intro: "För företag i Örebro bygger vi digitala verktyg runt vardagens återkommande uppgifter. Vi börjar med ett problem, exempelvis kundärenden som tappas mellan mejl, telefon och delade dokument.",
    localContext: "Ett ärendeflöde kan samla underlag, ansvarig person och nästa uppföljning. Teamet får en gemensam vy och kunden kan vid behov följa sin förfrågan i en portal.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Måste vi byta alla system samtidigt?", a: "Nej. Vi identifierar en avgränsad del som går att förbättra och undersöker hur den kan fungera tillsammans med det ni redan använder." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Örebro kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "motala",
    city: "Motala",
    region: "Östergötlands län",
    intro: "Vi hjälper företag i Motala med verktyg för bokningar, arbetsorder och intern uppföljning. Utgångspunkten är ett konkret moment som idag kräver extra telefonsamtal, dubbelregistrering eller letande.",
    localContext: "För en boendeverksamhet kan det vara gästinformation och tilläggstjänster. För en verkstad kan det vara arbetsorder med bilder och status. Vi väljer ett första flöde som går att prova i vardagen.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Kan ni visa exempel från en boendeverksamhet?", a: "Ja. I portfolion finns Bergs Slussar Glamping och arbetet med Stayboost i vår egen verksamhet. Det ger ett konkret underlag för att diskutera vad som kan passa er." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Motala kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "mjolby",
    city: "Mjölby",
    region: "Östergötlands län",
    intro: "För företag i Mjölby bygger vi verktyg som samlar planering, dokumentation och återkommande uppgifter. Vi hjälper er att gå från behov och befintliga kalkylark till en avgränsad första lösning.",
    localContext: "Ett exempel är en mobil vy för registrering av utfört arbete, bilder och nästa åtgärd. Vi börjar med vad som faktiskt behöver dokumenteras och vilka som ska kunna se uppgifterna.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Kan verktyget fungera ute i verksamheten på mobilen?", a: "Ja, gränssnittet kan anpassas för mobil användning. Behov av kamera, dålig uppkoppling eller arbete utan nät behöver tas med när vi bestämmer omfattningen." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Mjölby kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "finspang",
    city: "Finspång",
    region: "Östergötlands län",
    intro: "Vi hjälper företag i Finspång att samla dokumentation och göra uppföljningen lättare. Ett första verktyg kan ge bättre ordning på ärenden, underlag och vem som ansvarar för nästa steg.",
    localContext: "Ett arbetsflöde för kvalitetsdokumentation kan innehålla formulär, bilder och sökbar historik. Krav från kunder, revisioner och branschregler behöver beskrivas och valideras separat.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Kan systemet anpassas till våra dokumentationskrav?", a: "Vi går igenom kraven med er och skiljer på önskade funktioner och sådant som måste uppfylla en viss standard. Om specialiserad granskning behövs planeras den innan leverans." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Finspång kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "nykoping",
    city: "Nyköping",
    region: "Södermanlands län",
    intro: "För företag i Nyköping bygger vi verktyg som gör kundkontakt och återkommande administration enklare. Vi kan börja med en bokningsförfrågan, en arbetsorder eller information som kunden behöver före ett besök.",
    localContext: "En sammanhållen kundresa kan ta emot underlag, visa status och förbereda nästa svar. Automatiska utskick och AI-stöd avgränsas så att det är tydligt vad som kräver godkännande.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    faqs: [
      { q: "Kan ni hjälpa oss med gästinformation eller bokningsflöden?", a: "Ja, vi kan gå igenom er nuvarande resa och avgränsa en förbättring. Portfolion visar även hur vi arbetar med gästflöden i vår egen boendeverksamhet." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Nyköping kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "katrineholm",
    city: "Katrineholm",
    region: "Södermanlands län",
    intro: "Vi hjälper företag i Katrineholm att samla order, uppdrag och uppföljning i digitala flöden. Målet är att göra det tydligt vad som ska göras, vem som ansvarar och vilken information som saknas.",
    localContext: "En mobil uppdragsvy kan visa underlag och låta personal rapportera status. Kundportaler och kopplingar till fakturering kan läggas till när datakällor och ansvar är utredda.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    caseNote: "I portfolion finns Aurora Transport, en egen produkt för transportflöden. Se projektet och använd det som underlag för vad ni vill bygga.",
    faqs: [
      { q: "Finns det ett transportexempel att titta på?", a: "Ja, Aurora Transport finns i portfolion. Vi använder det som konkret utgångspunkt för att diskutera order, planering och mobil återrapportering utifrån era behov." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Katrineholm kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
  {
    slug: "eskilstuna",
    city: "Eskilstuna",
    region: "Södermanlands län",
    intro: "För företag i Eskilstuna bygger vi verktyg för orderflöden, kundportaler och intern samordning. Vi börjar med att förstå var arbetet fastnar och vilken första förändring som kan göra störst nytta.",
    localContext: "En kundportal kan samla beställningar, dokument och leveransstatus. Vi undersöker vilka uppgifter som kan hämtas automatiskt och vilka som behöver registreras eller granskas manuellt.",
    comparison: "Vi börjar med behov, användare och ett arbetsflöde att förbättra. En avgränsad prototyp erbjuds från 4 900 kr. Ni får en offert med omfattning, pris och tidsplan innan utvecklingen startar. Drift, externa tjänster och fortsatt utveckling specificeras separat.",
    caseNote: "I portfolion finns Aurora Transport, en egen produkt för transportflöden. Se projektet och använd det som underlag för vad ni vill bygga.",
    faqs: [
      { q: "Kan vi börja med en portal för ett fåtal kunder?", a: "Ja. En avgränsad pilot kan göra det lättare att få återkoppling och bedöma fortsatt utveckling. Antal användare, funktioner och åtkomst bestäms innan bygget börjar." },
      { q: "Vad kostar det att börja?", a: "En avgränsad prototyp erbjuds från 4 900 kr. Pris för ett fungerande verksamhetssystem beror på funktioner, integrationer och krav. Se paketen på prissidan; exakt omfattning och pris fastställs i offert." },
      { q: "Hur fungerar samarbetet?", a: "Ni har direktkontakt med Aurora Media i Linköping. För företag i Eskilstuna kan arbetet ske via videomöten och gemensamma genomgångar av en testbar version. Tidsplan och eventuella fysiska möten bestäms vid uppstart." },
      { q: "Vad händer efter leverans?", a: "Ni får överlämning enligt offerten, inklusive överenskommen kod och dokumentation. Drift, support och fortsatt utveckling planeras tillsammans så att ansvar och löpande kostnader är tydliga." },
    ],
  },
];

export const getCity = (slug: string): CityContent | undefined =>
  cities.find((c) => c.slug === slug);

export const citySeo: Record<string, CitySeo> = {
  linkoping: {
    metaTitleSaaS: "SaaS-utveckling för företag i Linköping | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Linköping. Fokus på interna verktyg och kundflöden. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Linköping | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Linköping. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Linköping.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Linköping", "SaaS-utveckling Linköping", "interna verktyg Linköping"],
    tjansterIntro: "Vill ni förbättra interna verktyg och kundflöden? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  norrkoping: {
    metaTitleSaaS: "SaaS-utveckling för företag i Norrköping | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Norrköping. Fokus på order, transport och uppföljning. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Norrköping | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Norrköping. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Norrköping.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Norrköping", "SaaS-utveckling Norrköping", "interna verktyg Norrköping"],
    tjansterIntro: "Vill ni förbättra order, transport och uppföljning? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  jonkoping: {
    metaTitleSaaS: "SaaS-utveckling för företag i Jönköping | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Jönköping. Fokus på handel och företagsportaler. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Jönköping | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Jönköping. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Jönköping.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Jönköping", "SaaS-utveckling Jönköping", "interna verktyg Jönköping"],
    tjansterIntro: "Vill ni förbättra handel och företagsportaler? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  stockholm: {
    metaTitleSaaS: "SaaS-utveckling för företag i Stockholm | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Stockholm. Fokus på er nästa produkt eller interna tjänst. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Stockholm | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Stockholm. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Stockholm.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Stockholm", "SaaS-utveckling Stockholm", "interna verktyg Stockholm"],
    tjansterIntro: "Vill ni förbättra er nästa produkt eller interna tjänst? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  goteborg: {
    metaTitleSaaS: "SaaS-utveckling för företag i Göteborg | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Göteborg. Fokus på orderflöden och verksamhetsöversikt. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Göteborg | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Göteborg. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Göteborg.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Göteborg", "SaaS-utveckling Göteborg", "interna verktyg Göteborg"],
    tjansterIntro: "Vill ni förbättra orderflöden och verksamhetsöversikt? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  malmo: {
    metaTitleSaaS: "SaaS-utveckling för företag i Malmö | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Malmö. Fokus på en första version att prova. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Malmö | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Malmö. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Malmö.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Malmö", "SaaS-utveckling Malmö", "interna verktyg Malmö"],
    tjansterIntro: "Vill ni förbättra en första version att prova? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  uppsala: {
    metaTitleSaaS: "SaaS-utveckling för företag i Uppsala | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Uppsala. Fokus på projektsamordning och dataöversikt. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Uppsala | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Uppsala. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Uppsala.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Uppsala", "SaaS-utveckling Uppsala", "interna verktyg Uppsala"],
    tjansterIntro: "Vill ni förbättra projektsamordning och dataöversikt? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  vasteras: {
    metaTitleSaaS: "SaaS-utveckling för företag i Västerås | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Västerås. Fokus på rapportering och interna flöden. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Västerås | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Västerås. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Västerås.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Västerås", "SaaS-utveckling Västerås", "interna verktyg Västerås"],
    tjansterIntro: "Vill ni förbättra rapportering och interna flöden? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  orebro: {
    metaTitleSaaS: "SaaS-utveckling för företag i Örebro | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Örebro. Fokus på kundärenden och intern samordning. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Örebro | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Örebro. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Örebro.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Örebro", "SaaS-utveckling Örebro", "interna verktyg Örebro"],
    tjansterIntro: "Vill ni förbättra kundärenden och intern samordning? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  motala: {
    metaTitleSaaS: "SaaS-utveckling för företag i Motala | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Motala. Fokus på bokningar och arbetsorder. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Motala | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Motala. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Motala.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Motala", "SaaS-utveckling Motala", "interna verktyg Motala"],
    tjansterIntro: "Vill ni förbättra bokningar och arbetsorder? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  mjolby: {
    metaTitleSaaS: "SaaS-utveckling för företag i Mjölby | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Mjölby. Fokus på planering och dokumentation. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Mjölby | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Mjölby. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Mjölby.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Mjölby", "SaaS-utveckling Mjölby", "interna verktyg Mjölby"],
    tjansterIntro: "Vill ni förbättra planering och dokumentation? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  finspang: {
    metaTitleSaaS: "SaaS-utveckling för företag i Finspång | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Finspång. Fokus på dokumentation och uppföljning. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Finspång | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Finspång. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Finspång.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Finspång", "SaaS-utveckling Finspång", "interna verktyg Finspång"],
    tjansterIntro: "Vill ni förbättra dokumentation och uppföljning? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  nykoping: {
    metaTitleSaaS: "SaaS-utveckling för företag i Nyköping | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Nyköping. Fokus på service, bokningar och kundkontakt. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Nyköping | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Nyköping. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Nyköping.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Nyköping", "SaaS-utveckling Nyköping", "interna verktyg Nyköping"],
    tjansterIntro: "Vill ni förbättra service, bokningar och kundkontakt? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  katrineholm: {
    metaTitleSaaS: "SaaS-utveckling för företag i Katrineholm | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Katrineholm. Fokus på order och transportuppföljning. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Katrineholm | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Katrineholm. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Katrineholm.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Katrineholm", "SaaS-utveckling Katrineholm", "interna verktyg Katrineholm"],
    tjansterIntro: "Vill ni förbättra order och transportuppföljning? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
  eskilstuna: {
    metaTitleSaaS: "SaaS-utveckling för företag i Eskilstuna | Aurora Media",
    metaDescSaaS: "Vi bygger SaaS och interna verktyg för företag i Eskilstuna. Fokus på orderöversikt och kundportaler. Avgränsad prototyp från 4 900 kr.",
    metaTitleAI: "AI-byrå för företag i Eskilstuna | Aurora Media",
    metaDescAI: "AI-automation och digitala verktyg för företag i Eskilstuna. Vi utgår från era arbetsflöden. Direktkontakt med utvecklaren i Linköping.",
    h1Pre: "AI och SaaS för företag i Eskilstuna.",
    h1Em: "Börja med ett konkret behov.",
    keywords: ["AI-byrå Eskilstuna", "SaaS-utveckling Eskilstuna", "interna verktyg Eskilstuna"],
    tjansterIntro: "Vill ni förbättra orderöversikt och kundportaler? Vi hjälper er att välja en första insats, från avgränsad prototyp till ett system med överenskomna funktioner och integrationer.",
  },
};

export const getCitySeo = (slug: string): CitySeo | undefined => citySeo[slug];

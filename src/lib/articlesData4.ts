import type { Article } from "./articleTypes";

export const articles19to24: Article[] = [
  {
    slug: "lovable-vs-bolt-vs-cursor-2026",
    keyword: "Lovable vs Bolt vs Cursor 2026, AI-kodare, Lovable, Bolt, Cursor, SaaS med AI, AI-kodning",
    category: "AI-kodning",
    title: "Lovable vs Bolt vs Cursor 2026: vilken AI-kodare ska du faktiskt välja?",
    metaTitle: "Lovable vs Bolt vs Cursor 2026 – jämförelse & prompts | Aurora Media",
    metaDesc:
      "Lovable, Bolt eller Cursor 2026? En praktisk jämförelse med exakta prompts, workflows, priser, styrkor och svagheter från verkliga SaaS-projekt.",
    publishedDate: "2026-05-03",
    updatedDate: "2026-05-03",
    readMinutes: 16,
    intro:
      "Lovable bygger din SaaS från noll till lansering. Bolt är bäst för snabba prototyper där du vill kunna gå djupt i koden. Cursor är inte ett alternativ till de andra två — det är vad du flyttar till när din SaaS växer förbi vad en webbläsare orkar. De flesta builders som faktiskt levererar produkter kombinerar minst två av dem. Den här guiden visar exakt när, hur och med vilka prompts.",
    sections: [
      {
        heading: "Det första alla missförstår: de konkurrerar inte",
        content:
          "Om du läser tio jämförelser online kommer nio av dem ranka verktygen mot varandra som om de gjorde samma sak. Det gör de inte. Lovable är en produktbyggare. Du beskriver vad du vill ha och får en fullstack-app med Supabase, autentisering, betalning och hosting. Du behöver inte öppna en terminal. Bolt är en AI-IDE i webbläsaren. Du får hela filträdet, en terminal och kan installera npm-paket. Det är som att ha Cursor lite — men i webbläsaren och med mer fokus på att generera nytt än att redigera befintligt. Cursor är en kodredigerare för utvecklare. Den lever på din dator, öppnar dina existerande repon och accelererar arbetet med AI-agenter. Den bygger inget åt dig från noll — den hjälper dig att gå snabbare med kod du redan har. Att jämföra dem som 'vilken är bäst' är som att fråga om hammaren eller skruvmejseln är bäst. Frågan är vad du försöker bygga och i vilket skede.",
      },
      {
        heading: "Lovable: när du har en idé och inget mer",
        content:
          "Prisbilden i maj 2026 är ungefär Free med dagliga credits, Pro runt 25 dollar per månad och Business runt 50 dollar per månad beroende på plan och villkor. Lovables sweet spot är att gå från 'jag har en idé i huvudet' till 'jag har en fungerande SaaS som tar emot betalningar' på 2–4 veckor. Lovable är dramatiskt bättre på detta än de flesta andra AI-kodare, framför allt eftersom Supabase-integrationen inte bara handlar om att skicka SQL. Den skapar tabeller, sätter upp Row Level Security-policys, kopplar autentisering och skriver klientkoden som binder ihop allt. Det är inte trivialt om du försöker göra det själv.",
      },
      {
        heading: "Lovables vanligaste failure modes",
        content:
          "Det första som brukar gå fel är komplexa refactors. När kodbasen växer förbi ungefär 30 filer börjar Lovable lätt tappa kontext mellan komponenter. Den ändrar något i en fil och bryter något i en annan utan att märka det. Det andra är branchad logik och edge cases. Lovable är fenomenal på att bygga happy path, men medioker på att tänka igenom alla felfall. Du kommer behöva påpeka saker som: vad händer om användaren saknar prenumeration? Det tredje är credit-bränning på ostrukturerade prompts. En vag prompt kostar lika många credits som en specifik, men ger ofta resultat du måste bygga om. Det är den största kostnadsfällan.",
      },
      {
        heading: "Bootstrap-prompten jag faktiskt använder i Lovable",
        content:
          "Den här prompten är tråkig att läsa — och det är poängen. Lovable bygger exakt vad du beskriver. Vag input ger vag output. Specifik input ger något du kan ta betalt för.",
        code: `Bygg en SaaS för [tydlig användarpersona] som behöver [primär jobb-att-utföra].

TEKNISK STACK (icke förhandlingsbart):
- React + TypeScript + Tailwind + shadcn/ui
- Supabase som backend (PostgreSQL + Auth + RLS + Edge Functions)
- Stripe för prenumerationer (Checkout + Customer Portal)
- Brevo för transaktionella mejl (via Edge Function)
- Lokalisering: svenska som default

DATAMODELL (skapa Supabase-tabeller med RLS från dag 1):
- profiles (id uuid pk → auth.users, email, full_name, organization_id, role)
- organizations (id uuid pk, name, stripe_customer_id, subscription_status, plan)
- [din domänentitet] (id, organization_id fk, ...)

RLS-POLICY: alla queries filtreras på organization_id via en SECURITY DEFINER-funktion 
get_current_org_id() som läser från JWT.

KÄRNFUNKTIONER I MVP (bygg INTE mer än detta i första iterationen):
1. [konkret feature med användarvärde]
2. [konkret feature med användarvärde]
3. [konkret feature med användarvärde]

SIDOR: /, /login, /signup, /dashboard, /settings, /pricing, /thanks
INGEN admin-panel, ingen onboarding-wizard, inga notifikationer i denna iteration. 
Vi lägger till det när basen är stabil.

VISUELL STIL: Modern, lugn, mycket whitespace, neutral färgpalett 
(referens: Linear, Notion, Vercel). Ingen gradient-spam, inga emojis i UI.`,
      },
      {
        heading: "Två mindre kända Lovable-trick",
        content:
          "Använd Plan Mode först, alltid. Innan du klickar Build — be Lovable skriva en plan över vad den tänker bygga. Be den beskriva arkitekturen, datamodellen och vilka komponenter den tänker skapa, och säg uttryckligen att den ska vänta på ditt godkännande. Det kostar lite, men sparar mycket när planen är fel. Knyt också GitHub direkt. I Pro-planen kan du synka till ett GitHub-repo. Gör det första dagen. När Lovable börjar tappa fattningen kan du checka ut till Cursor på fem minuter.",
      },
      {
        heading: "Cursor: när din SaaS växt förbi Lovable",
        content:
          "Prisbilden i maj 2026 är ungefär Hobby gratis, Pro runt 20 dollar per månad, Pro+ runt 60 dollar per månad, Ultra runt 200 dollar per månad och Teams runt 40 dollar per seat och månad. Cursors sweet spot är när du har en kodbas på 50+ filer, specifika krav på kodkvalitet och refactors som spänner över flera filer. Det är här Cursor i Agent mode med en stark modell kan göra arbete som hade tagit tre dagar manuellt på 30 minuter.",
      },
      {
        heading: "Cursors vanligaste failure modes",
        content:
          "Långa Agent-sessioner degraderar. Efter runt 20 turer i samma chat börjar agenten ofta glömma tidigare beslut och göra dubbelarbete. Lösningen är att starta en ny chat för varje uppgift och lägga långsiktig kontext i .cursorrules. Monorepo utan .cursorignore är också dödligt. Cursor indexerar varje fil. Om du har node_modules, .next eller stora loggfiler i repot tar indexeringen tid och kontextfönstret fylls med skräp. Det tredje problemet är credit-bränning på fel modell. Den dyraste modellen är inte alltid bäst för rutinjobb. Auto mode eller billigare modeller räcker ofta långt.",
      },
      {
        heading: ".cursorrules jag använder för Aurora-projekten",
        content:
          "Lägg filen i repo-rooten. Den här filen är skillnaden mellan en agent som bygger som en junior-utvecklare och en som bygger med tydliga guardrails. Iterera den över tid. Varje gång Cursor gör något korkat, lägg till en regel som hade förhindrat det.",
        code: `Du arbetar på en svensk SaaS-produkt byggd med:
- React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Supabase (Postgres + Auth + RLS + Edge Functions)
- Stripe för prenumerationer
- Brevo för transaktionella mejl

KODKONVENTIONER:
- Aldrig any utan explicit motivering i en kommentar.
- Alla Supabase-queries går via typed clients i src/integrations/supabase/.
- Alla RLS-policys är multi-tenant via organization_id.
- UI-text på svenska om inget annat anges av användaren.
- Använd shadcn/ui-komponenter från @/components/ui innan du skapar nya.
- Tailwind utility classes; inga inline styles.
- File names: PascalCase för komponenter, camelCase för hooks/utils.
- Före någon refactor: läs igenom relevanta filer först. Skapa en plan. Vänta på godkännande.

INGET FÅR HÄNDA UTAN BEKRÄFTELSE:
- Migrations mot databasen (skapa SQL-filen, kör den inte automatiskt)
- Ändringar i src/integrations/supabase/types.ts (auto-genererad)
- Borttagning av filer eller funktioner
- Installation av nya npm-paket

NÄR DU FELSÖKER:
- Läs felmeddelandet helt först.
- Kontrollera RLS-policys först om frågan handlar om data som inte syns.
- Kontrollera typdefinitionen i src/integrations/supabase/types.ts först om TS-fel.`,
      },
      {
        heading: "Cursors tre modes och när du använder vilket",
        content:
          "Ask använder du innan du gör någonting. Exempel: förklara hur autentiseringen flödar mellan Supabase Auth, Edge Functions och frontend i den här kodbasen. Du bygger inget — du förstår. Agent använder du när du har en konkret uppgift, till exempel att lägga till en endpoint i Supabase Edge Functions för att skicka välkomstmejl via Brevo när en ny user signar upp. Manual edit, ofta Cmd+K, använder du när du vet exakt vad du vill ändra och bara behöver hjälp att skriva det. Mönstret som ger bäst output är Ask → Plan → Agent → Manual för polering. Att hoppa direkt till Agent är en vanlig anledning till att Cursor skriver skräp.",
      },
      {
        heading: "Bolt: den underskattade mellanvägen",
        content:
          "Prisbilden i maj 2026 är ungefär Free med tokenbegränsning, Pro runt 25 dollar per månad och Teams runt 30 dollar per användare och månad. Bolts sweet spot är snabba prototyper där du vill kunna se och redigera koden direkt, men där du inte är redo att flytta projektet till en lokal IDE än. Bolt är fantastisk när du behöver bygga ett verktyg som ska fungera imorgon och du inte har tid att sätta upp lokal miljö.",
      },
      {
        heading: "Var Bolt slår Lovable — och var Bolt förlorar",
        content:
          "Bolt slår Lovable när du vill se hela filträdet, använda terminal i webbläsaren via WebContainers, köra npm install, npm run test och installera valfria paket. Det känns magiskt första gången. Bolt uppdaterar också ofta bara ändrade filer mellan iterationer, vilket gör att det känns snabbare på iterativa uppgifter. Bolt förlorar mot Lovable när backend är viktig. Bolt Cloud har blivit bättre, men Lovables Supabase-integration är fortfarande mer mogen. Om din SaaS lever och dör på databasen väljer jag Lovable. Bolts tokenmodell kan dessutom bli opredikterbar när projekt växer eftersom mer kod skickas in i kontexten.",
      },
      {
        heading: "Bolt-prompten jag använder för en snabb prototyp",
        content:
          "Skillnaden mellan Bolt-prompten och Lovable-prompten är medveten. Lovable bygger din produkt. Bolt bygger din prototyp. Att blanda ihop dem är att betala för fel jobb.",
        code: `Skapa en enkel app för [användare] som löser [konkret problem]. 
Inga inloggningar, inga betalningar, ingen databas — bara en fungerande UI 
med state hanterad i React (useState/useReducer). 

Stack: Vite + React + TypeScript + Tailwind. 
Inga andra dependencies om jag inte uttryckligen säger till.

Mål: en klickbar prototyp jag kan visa en kund för feedback inom 30 minuter. 
Skitsnyggt är inte målet. Att förstå om idén är värd att bygga är målet.

Specifika skärmar:
1. [skärm + vad användaren gör där]
2. [skärm + vad användaren gör där]
3. [skärm + vad användaren gör där]

Mock-data: använd hårdkodade arrayer i src/data/. Inga API-anrop.`,
      },
      {
        heading: "Det verkliga arbetsflödet: kombinationen som faktiskt fungerar",
        content:
          "Fas 1 är validering på timmar med Bolt eller Lovable Free. Målet är en klickbar prototyp du kan visa fem potentiella kunder. Inga riktiga konton, ingen betalning, ingen databas. Bara mock-data. Fas 2 är MVP på 1–3 veckor med Lovable Pro och GitHub-sync. Målet är en fungerande SaaS med inloggning, betalning och kärnfunktioner som kan ta emot riktiga kunder. Fas 3 är skala och polering i Cursor Pro med lokal miljö. När du har aktiva användare och Lovable börjar tappa kontext klonar du GitHub-repot, lägger till .cursorrules och fortsätter i Cursor.",
      },
      {
        heading: "Bootstrap-flödet jag faktiskt använder",
        content:
          "Först bygger jag basen i Lovable med prompten ovan, ofta 5–10 credits. Sedan synkar jag till GitHub direkt. Därefter bygger jag ut kärnfunktionerna i Lovable, en feature i taget. Innan varje större feature använder jag Plan Mode: skriv en plan, vänta på godkännande. När jag har användare som kraschar saker går jag över till Cursor. I praktiken bygger jag ofta 80 procent av en MVP i Lovable och flyttar till Cursor när jag behöver skriva komplexa Edge Functions, Stripe webhook-hantering med signaturverifiering, refactora flera filer samtidigt, skriva tester, felsöka över frontend/backend/databas eller bygga något performance-kritiskt. Lovable och Cursor är inte konkurrenter. De är två steg i samma arbetsflöde.",
      },
      {
        heading: "Kostnaden för en riktig SaaS, jämförd",
        content:
          "Säg att du bygger en MVP: multi-tenant SaaS med inloggning, prenumeration, dashboard och två kärnfunktioner. Här är ungefär vad verktygsavgifterna kan kosta över tre månader. Poängen är inte att varje dollar är exakt för alltid, utan att verktygskostnaden är dramatiskt lägre än lönen för ett team på sex personer.",
        table: {
          headers: ["Workflow", "Lovable", "Bolt", "Cursor", "Totalt"],
          rows: [
            ["Endast Lovable", "$75 (3 mån Pro)", "–", "–", "$75"],
            ["Endast Bolt", "–", "$75 (3 mån Pro)", "–", "$75"],
            ["Endast Cursor", "–", "–", "$60 (3 mån Pro)", "$60"],
            ["Lovable → Cursor", "$50 (2 mån Pro)", "–", "$40 (2 mån Pro)", "$90"],
            ["Bolt → Cursor", "–", "$25 (1 mån Pro)", "$40 (2 mån Pro)", "$65"],
          ],
        },
      },
      {
        heading: "Vad totalkostnaden betyder i praktiken",
        content:
          "För ungefär 90 dollar — cirka 950 kronor — har du allt du behöver i verktyg för att bygga en fungerande, säljbar SaaS. Lägg till Supabase, Stripe-fees och domän så landar du fortfarande mycket lågt jämfört med traditionell utveckling. Det är därför AI-assisterad SaaS-utveckling kan ha helt annan prisbild än en klassisk byrå. Inte för att kompetens är oviktig, utan för att verktygskostnaden och ledtiden är mycket lägre än i ett traditionellt teamupplägg.",
      },
      {
        heading: "Vilket ska du välja idag?",
        content:
          "Om du är non-technical founder med en idé: välj Lovable Pro. Det är det enda av de tre du sannolikt kan använda meningsfullt utan kodkunskap. Om du är utvecklare som bygger kommersiell SaaS: använd Lovable Pro för bootstrap och Cursor Pro för skalning. Skippa ofta Bolt i det flödet. Om du är utvecklare som vill prototypa snabbt och vill se koden: välj Bolt Pro. Om du har en existerande kodbas och vill accelerera: välj Cursor Pro. De andra är då knappt ens i diskussionen.",
      },
      {
        heading: "Vad jag bygger med dem just nu",
        content:
          "För transparens: Hönsgården, en produkt för chicken flock management med betalande Premium-användare, byggdes initialt i Lovable och underhålls mestadels i Cursor. Aurora Transport, en B2B dispatch-SaaS, bootstrappades i Lovable medan komplex logik som multi-tenant RLS, Stripe-integration och Brevo-automation byggdes i Cursor. Updro, en svensk byråmarknadsplats, byggs i Lovable och kommer att flyttas till Cursor när trafiken motiverar det. Jag använder Lovable Pro, Cursor Pro+ och kortvarig Bolt Pro när jag prototypar snabbt åt klienter. För det kan jag driva flera SaaS-produkter parallellt med klientarbete vid sidan av.",
      },
      {
        heading: "Vad du gör nu",
        content:
          "Om du har en idé du suttit på länge: sätt upp ett Lovable-konto, använd Free-planen för att utvärdera, skriv prompten ovan med din egen användarpersona och datamodell och bygg så långt dina daily credits räcker. Det är ofta minst en klickbar prototyp. Om du fastnar — eller om du vill ha det rätt från dag ett — boka 30 minuter med mig. Jag tar fast pris från 14 900 kr för en prototyp som faktiskt fungerar. Skillnaden är att jag har gjort många produkter med de här verktygen och därför undviker fällorna du hittar första gången.",
      },
      {
        heading: "Källor och uppdateringar",
        content:
          "Priser och credit-strukturer förändras ofta hos alla tre verktygen. Verifiera alltid mot officiella prissidor innan du beställer. Källor: Lovable pricing och docs, Cursor pricing och Models & Pricing, Bolt pricing breakdown 2026, Cursor IDE Complete Guide 2026 samt NoCode MBA:s jämförelser av Bolt och Lovable. Den här artikeln ska uppdateras kvartalsvis eftersom funktioner och priser ändras snabbt.",
      },
    ],
    faq: [
      {
        q: "Är Lovable bättre än Bolt?",
        a: "För fullstack-SaaS med Supabase, autentisering och betalning väljer jag Lovable. För snabb prototyp där du vill se koden direkt är Bolt ofta bättre.",
      },
      {
        q: "Är Cursor ett alternativ till Lovable?",
        a: "Inte riktigt. Lovable hjälper dig bygga från noll i webbläsaren. Cursor är bäst när du redan har ett repo och vill utveckla, refactora och skala kodbasen.",
      },
      {
        q: "Vilket verktyg ska en non-technical founder välja?",
        a: "Lovable Pro är det mest rimliga valet om du saknar kodbakgrund och vill bygga en SaaS-idé till MVP.",
      },
      {
        q: "När ska jag flytta från Lovable till Cursor?",
        a: "När kodbasen blir större, när refactors spänner över många filer, eller när du behöver komplex backendlogik som webhooks, tester och avancerade RLS-flöden.",
      },
      {
        q: "Kan man bygga en riktig SaaS med AI-kodare?",
        a: "Ja, men verktygen ersätter inte produktomdöme. Du behöver fortfarande tydlig scope, datamodell, säkerhetstänk och testning. AI gör processen snabbare, inte automatiskt korrekt.",
      },
    ],
    relatedSlugs: [
      "bygga-saas-med-ai-fast-pris",
      "bygga-saas-med-ai-2026",
      "mvp-utveckling-for-startup",
      "vad-kostar-saas-utveckling-2026",
    ],
  },
];

import type { Article } from "./articleTypes";

export const articles19to24: Article[] = [
  {
    slug: "lovable-vs-bolt-vs-cursor-2026",
    keyword: "Lovable vs Bolt vs Cursor 2026",
    category: "AI-kodning",
    title: "Lovable vs Bolt vs Cursor 2026: vilken AI-kodare ska du faktiskt välja?",
    metaTitle: "Lovable vs Bolt vs Cursor 2026 – jämförelse & prompts | Aurora Media",
    metaDesc:
      "Lovable, Bolt eller Cursor 2026? En praktisk jämförelse av AI-kodare med exakta prompts, workflows, priser, styrkor och svagheter.",
    publishedDate: "2026-05-03",
    updatedDate: "2026-05-03",
    readMinutes: 13,
    intro:
      "Lovable bygger din SaaS från noll till lansering. Bolt är bäst för snabba prototyper där du vill kunna gå djupt i koden. Cursor är inte ett alternativ till de andra två — det är vad du flyttar till när din SaaS växer förbi vad en webbläsare orkar. Här är exakt när, hur och med vilka prompts jag använder dem.",
    sections: [
      {
        heading: "Det första alla missförstår: de konkurrerar inte",
        content:
          "Om du läser tio jämförelser online kommer nio av dem ranka verktygen mot varandra som om de gjorde samma sak. Det gör de inte. Lovable är en produktbyggare: du beskriver vad du vill ha och får en fullstack-app med Supabase, autentisering, betalning och hosting. Bolt är en AI-IDE i webbläsaren: du får filträd, terminal och möjlighet att installera npm-paket. Cursor är en kodredigerare för utvecklare: den lever på din dator, öppnar dina existerande repon och accelererar arbetet med AI-agenter. Att fråga vilken som är bäst är som att fråga om hammaren eller skruvmejseln är bäst. Frågan är vad du försöker bygga och i vilket skede.",
      },
      {
        heading: "Lovable: när du har en idé och inget mer",
        content:
          "Lovables sweet spot är att gå från 'jag har en idé i huvudet' till 'jag har en fungerande SaaS som tar emot betalningar' på 2–4 veckor. Deras Supabase-integration är inte bara att skicka SQL. Den skapar tabeller, sätter upp Row Level Security, kopplar autentisering och skriver klientkoden som binder ihop allt. Det som går fel är framför allt komplexa refactors, edge cases och ostrukturerade prompts som bränner credits utan att ge stabil output.",
      },
      {
        heading: "Bootstrap-prompten jag använder i Lovable",
        content:
          "Den här prompten är medvetet torr och specifik. Det är poängen. Lovable bygger exakt det du beskriver. Vag input ger vag output. Specifik input ger något du kan ta betalt för.",
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

RLS-POLICY: alla queries filtreras på organization_id via en SECURITY DEFINER-funktion get_current_org_id() som läser från JWT.

KÄRNFUNKTIONER I MVP (bygg INTE mer än detta i första iterationen):
1. [konkret feature med användarvärde]
2. [konkret feature med användarvärde]
3. [konkret feature med användarvärde]

SIDOR: /, /login, /signup, /dashboard, /settings, /pricing, /thanks
INGEN admin-panel, ingen onboarding-wizard, inga notifikationer i denna iteration.
Vi lägger till det när basen är stabil.

VISUELL STIL: Modern, lugn, mycket whitespace, neutral färgpalett (referens: Linear, Notion, Vercel). Ingen gradient-spam, inga emojis i UI.`,
      },
      {
        heading: "Två Lovable-trick som sparar credits",
        content:
          "Använd Plan Mode först, alltid. Innan du klickar Build, be Lovable skriva en plan över vad den tänker bygga: arkitektur, datamodell och komponenter. Det kostar lite, men sparar många felbyggen. Koppla också GitHub direkt i Pro-planen. När Lovable börjar tappa sammanhanget kan du checka ut till Cursor på fem minuter.",
      },
      {
        heading: "Cursor: när din SaaS växt förbi Lovable",
        content:
          "Cursor är rätt när kodbasen är 50+ filer, när du har krav på kodkvalitet och när du behöver göra refactors som spänner över flera filer. I Agent mode kan Cursor göra arbete som annars hade tagit dagar. Det som går fel är långa agent-sessioner, monorepon utan .cursorignore och att du använder för dyr modell för enkla uppgifter. Mönstret som fungerar bäst är Ask → Plan → Agent → Manual edit.",
      },
      {
        heading: ".cursorrules jag använder i Aurora-projekt",
        content:
          "Den här filen är skillnaden mellan en agent som bygger som en junior-utvecklare och en som bygger med tydliga guardrails. Varje gång Cursor gör något dumt lägger jag till en regel som hade förhindrat det.",
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
          "Ask använder jag innan jag gör något: för att förstå hur autentisering, databasen eller en integration fungerar. Agent använder jag när uppgiften är konkret: bygg en endpoint, refactora ett flöde, skapa en Edge Function. Manual edit använder jag när jag vet exakt vad som ska ändras och bara vill få hjälp med koden. Att hoppa direkt till Agent är den vanligaste anledningen till att folk tycker Cursor skriver skräp.",
      },
      {
        heading: "Bolt: den underskattade mellanvägen",
        content:
          "Bolt är bäst för snabba prototyper där du vill se och redigera koden direkt, men inte är redo att flytta projektet till lokal IDE. Bolt slår Lovable när du vill se hela filträdet, använda terminal i webbläsaren och iterera snabbt. Bolt förlorar mot Lovable när backend, databas och autentisering är avgörande. Om din SaaS lever och dör på databasen väljer jag Lovable.",
      },
      {
        heading: "Bolt-prompten jag använder för snabb prototyp",
        content:
          "Skillnaden mellan Bolt-prompten och Lovable-prompten är medveten. Lovable bygger din produkt. Bolt bygger din prototyp. Att blanda ihop dem är att betala för fel jobb.",
        code: `Skapa en enkel app för [användare] som löser [konkret problem].
Inga inloggningar, inga betalningar, ingen databas — bara en fungerande UI med state hanterad i React (useState/useReducer).

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
        heading: "Det verkliga arbetsflödet: kombinationen som fungerar",
        content:
          "Fas 1 är validering med Bolt eller Lovable Free: en klickbar prototyp med mock-data som kan visas för fem potentiella kunder. Fas 2 är MVP med Lovable Pro och GitHub-sync: fungerande SaaS med inloggning, betalning och kärnfunktion. Fas 3 är skalning och polering i Cursor Pro: lokal miljö, .cursorrules, tester, komplexa Edge Functions, Stripe webhooks och refactors. I praktiken bygger jag ofta 80 procent av en MVP i Lovable och flyttar till Cursor när komplexiteten kräver det.",
      },
      {
        heading: "Kostnaden för en riktig SaaS, jämförd",
        content:
          "Säg att du bygger en MVP med multi-tenant SaaS, inloggning, prenumeration, dashboard och två kärnfunktioner. Verktygskostnaden är inte det som gör traditionell SaaS-utveckling dyr. Det dyra är teamtid, byråstruktur och långsam process. Därför kan AI-assisterad utveckling bli dramatiskt billigare.",
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
        heading: "Vilket ska du välja idag?",
        content:
          "Är du non-technical founder med en idé: välj Lovable Pro. Är du utvecklare som bygger kommersiell SaaS: Lovable Pro för bootstrap och Cursor Pro för skalning. Är du utvecklare som vill prototypa snabbt och se koden: Bolt Pro. Har du en existerande kodbas och vill accelerera: Cursor Pro. De flesta som faktiskt levererar produkter kombinerar minst två verktyg.",
      },
      {
        heading: "Vad jag bygger med dem just nu",
        content:
          "Hönsgården byggdes initialt i Lovable och underhålls mestadels i Cursor. Aurora Transport bootstrappades i Lovable medan komplex logik som multi-tenant RLS, Stripe-integration och Brevo-automation byggdes i Cursor. Updro byggs i Lovable och kommer flyttas till Cursor när trafiken motiverar det. Jag använder Lovable Pro, Cursor Pro+ och Bolt Pro kortvarigt när jag prototypar åt klienter.",
      },
      {
        heading: "Vad du gör nu",
        content:
          "Om du har en idé du suttit på länge: sätt upp ett Lovable-konto, skriv prompten ovan med din egen användarpersona och datamodell, bygg så långt daily credits räcker och visa prototypen för riktiga människor. Om du fastnar — eller vill ha det rätt från dag ett — boka 30 minuter med Aurora Media. Jag tar fast pris från 14 900 kr för en prototyp som faktiskt fungerar.",
      },
      {
        heading: "Källor och uppdateringar",
        content:
          "Priser och credit-strukturer förändras ofta hos Lovable, Bolt och Cursor. Verifiera alltid mot respektive officiella prissida innan du beställer. Den här artikeln är skriven utifrån praktisk användning och ska uppdateras löpande när verktygen förändras.",
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

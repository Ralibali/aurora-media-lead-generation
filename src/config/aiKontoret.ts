/**
 * ============================================================================
 * AI-KONTORET — produktkonfiguration och innehåll (/grok-bot)
 * ============================================================================
 *
 * DETTA ÄR DEN ENDA FIL SOM BEHÖVER RÖRAS FÖR ATT DRIVA PRODUKTEN.
 *
 * ── LANSERING (prelaunch → live) ────────────────────────────────────────────
 * 1. Sätt PRODUCT_STATUS = "live" nedan.
 * 2. Klistra in de tre Stripe Payment Link-url:erna i STRIPE_LINKS.
 *    (Stripe Dashboard → Payment Links. Inga nycklar i klientkoden —
 *     Payment Links är publika, säkra url:er. Hemligheter hör hemma i
 *     Supabase-secrets, aldrig här.)
 * 3. Sätt success-URL på alla tre länkarna till STRIPE_SUCCESS_URL
 *    (neutral retur – den bekräftar INTE betalning och loggar bara ett
 *     grok_checkout_return-event. Verifierade köp loggas server-side.)

 * 4. Deploy:a. Klart — samtliga CTA:er på sidan blir köpflöden automatiskt.
 *
 * ── LEVERANSARKITEKTUR (förberedd, ej aktiverad) ───────────────────────────
 * Planerat flöde när produkten går live:
 *   Stripe Payment Link → Stripe webhook (checkout.session.completed)
 *   → edge-funktion verifierar mot Stripe och skriver rad i
 *     `ai_kontoret_purchases` (se supabase/migrations/20260825_ai_kontoret.sql)
 *   → kunden får mejl med personlig, signerad och tidsbegränsad
 *     nedladdningslänk (Supabase Storage signed URL, kort TTL)
 *   → produktfilerna ligger i en PRIVAT storage-bucket — aldrig på
 *     gissningsbara publika url:er.
 * Saknas innan live (ägarens åtgärd):
 *   [ ] Stripe-konto + tre Payment Links (Guide 199 kr / Vault 199 kr / Bundle 349 kr)
 *   [ ] STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET som Supabase-secrets
 *   [ ] Edge-funktion `ai-kontoret-deliver` (webhook + signerad länk + mejl)
 *   [ ] Färdiga produktfiler (guide-PDF + Prompt Vault) i privat bucket
 *   [ ] Ägaren bekräftar villkor/ångerrättstexter (se LEGAL_DRAFT_NOTES)
 * ============================================================================
 */

// ── Lanseringsläge ──────────────────────────────────────────────────────────
// "prelaunch" = väntelista (säljer inget ofärdigt). "live" = köp via Stripe.
export const PRODUCT_STATUS: "prelaunch" | "live" = "prelaunch";

export const PRODUCT_NAME = "AI-KONTORET";
export const PRODUCT_TAGLINE = "Så bygger du ett AI-drivet företag med Grok Bot";
export const PRODUCT_VERSION = "1.0";
export const PRODUCT_UPDATED = "Augusti 2026";
export const PRODUCT_UPDATED_ISO = "2026-08-25";
/** Färskhet är en säljpunkt: fakta i guiden verifieras mot officiella källor. */
export const PRODUCT_VERIFIED_ISO = "2026-08-25";
export const PRODUCT_FRESHNESS =
  "Fakta kontrollerade mot aktuella officiella källor";

// ── Priser (SEK, konsumentpriser) ───────────────────────────────────────────
export const PRICES = {
  guide: 199,
  vault: 199,
  bundle: 349,
  /** guide + vault köpta separat – används för ärlig bundle-matte (199+199=398) */
  bundleReference: 398,
} as const;

// ── Stripe Payment Links ────────────────────────────────────────────────────
// ÄGAREN: klistra in de riktiga länkarna här vid live. Lämna tomma i prelaunch.
// Sätt success-URL i Stripe till STRIPE_SUCCESS_URL (neutral retursida).
export const STRIPE_LINKS = {
  guide: "", // t.ex. "https://buy.stripe.com/…" — Guide 199 kr
  vault: "", // Prompt Vault 199 kr (för befintliga guideägare)
  bundle: "", // Launch bundle 349 kr
} as const;

export type AiKontoretProduct = keyof typeof STRIPE_LINKS;

/**
 * Neutral retur efter checkout. Query-parametern bevisar INTE att betalning
 * skett – sidan får därför aldrig påstå att ordern är bekräftad, och
 * grok_purchase får aldrig loggas från en URL-parameter. Klienten loggar
 * som mest ett grok_checkout_return-event. Riktiga purchase-event ska komma
 * från Stripe-webhook som verifierats server-side.
 */
export const STRIPE_SUCCESS_URL = "https://auroramedia.se/grok-bot?checkout=return";


export const PRODUCT_SKUS: Record<AiKontoretProduct, string> = {
  guide: "ai-kontoret-guide",
  vault: "ai-kontoret-prompt-vault",
  bundle: "ai-kontoret-bundle",
};

// ── Waitlist (prelaunch) ────────────────────────────────────────────────────
// Återanvänder befintliga edge-funktionen send-contact-email (rate limit,
// honeypot, leads-tabell, Resend-mejl till info@auroramedia.se).
export const WAITLIST_PAKET = "AI-KONTORET – väntelista";

// ── Juridik (UTKAST — ska bekräftas av ägaren före live, se LEGAL_DRAFT_NOTES)
export const LEGAL_LINKS = {
  villkor: "/villkor",
  integritetspolicy: "/integritetspolicy",
};

// ============================================================================
// INNEHÅLL — all copy på sidan hämtas härifrån (lätt att redigera)
// ============================================================================

// ── Vad du lär dig (8 kort) ─────────────────────────────────────────────────
export const LEARN_CARDS: { title: string; desc: string }[] = [
  {
    title: "Botar",
    desc: "Så skriver du riktiga job descriptions istället för engångspromptar.",
  },
  {
    title: "Skills",
    desc: "Så lär du Grok ett återkommande arbetsflöde.",
  },
  {
    title: "Routines",
    desc: "Så får jobbet att köras automatiskt på rätt tid.",
  },
  {
    title: "Groups & handoffs",
    desc: "Så låter du AI-medarbetare lämna över arbete utan att du blir mellanhand.",
  },
  {
    title: "AI-usage",
    desc: "Så undviker du att flera Botar bränner kapacitet på samma problem.",
  },
  {
    title: "Owner gates",
    desc: "Så låter du AI arbeta själv utan att ge bort kontroll över pengar, publicering eller riskfyllda åtgärder.",
  },
  {
    title: "Evidence",
    desc: "Så kräver du bevis på att jobbet faktiskt blev gjort.",
  },
  {
    title: "Growth",
    desc: "Så bygger du återkommande research-, content-, SEO- och sales-loopar.",
  },
];

// ── Äkta lärdomar (presenteras som praktiska erfarenheter, inte påståenden) ──
export const LESSONS: { quote: string; takeaway: string }[] = [
  {
    quote: "Jag lät för många Botar leta efter jobb.",
    takeaway:
      "Fem Botar som alla letar uppgifter bränner usage och producerar överlapp. En Bot som får ett tydligt uppdrag slår dem alla.",
  },
  {
    quote: "QA behöver inte granska allt hela tiden.",
    takeaway:
      "Fullständig granskning av varje steg blir själv en flaskhals. Guiden visar var QA faktiskt betalar sig – och var den inte gör det.",
  },
  {
    quote: "En Engineer ska inte göra generiska dagliga audits.",
    takeaway:
      "Specialister tappar skärpa när de används som allmänna kontrollanter. Ge varje Bot ett jobb den kan bli bäst på.",
  },
  {
    quote: "Groups ska vara arbetsrum, inte AI-möten.",
    takeaway:
      "En Group som bara diskuterar producerar inget. Strukturen i guiden gör Groups till platser där arbete lämnas in och hämtas ut.",
  },
  {
    quote: "En stabil Skill är bättre än samma gigantiska prompt varje dag.",
    takeaway:
      "Att klistra in monsterprompten igen och igen är skört och svårt att förbättra. En Skill är versionerbar, testbar och återanvändbar.",
  },
  {
    quote: "Agent activity är inte business value.",
    takeaway:
      "Att Botarna varit aktiva säger inget om värdet. Därför bygger upplägget på evidence receipts: bevis på leverans, inte logg på aktivitet.",
  },
];

// ── Prompt Vault-innehåll (kategorier — ingen exakt räkning påstås) ─────────
export const VAULT_BLURB =
  "Ett växande bibliotek av de färdiga prompts, templates och operating rules som används i upplägget.";

/** Metod kontra copy-paste: guiden står på egna ben, Vault accelererar. */
export const VAULT_METHOD_NOTE =
  "Guiden lär dig metoden – Vault är copy-paste-implementeringen. Guiden är fullständig utan Vault, och alla säkerhetskritiska regler (owner gates och evidence-krav) ligger alltid i huvudguiden, aldrig bakom tillägget.";

export const VAULT_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Roller & ledning",
    items: ["CEO / Chief of Staff", "Growth", "Sales", "Research", "QA", "Engineer"],
  },
  {
    title: "Operativa system",
    items: ["Opportunity Engine", "Company Method", "MAX MODE", "AI Usage Governor", "Work Elimination"],
  },
  {
    title: "Arbetsflöden",
    items: ["Skills", "Routines", "Handoffs", "Work Packets", "Validation workflows"],
  },
  {
    title: "Kontroll & uppföljning",
    items: ["Email outbound", "Weekly reviews", "Evidence requirements", "Owner gates"],
  },
  {
    title: "Bygg eget",
    items: [
      "SKILL.md-mall",
      "Permission matrix",
      "MCP access matrix",
      "Agent architecture template",
      "Approval gates",
      "Vertical AI Employee brief",
    ],
  },
];

// ── Avancerad bonus: bygg din egen AI-medarbetare ───────────────────────────
// Grok Bot är den färdiga plattformen. Kimi nämns som ETT aktuellt exempel på
// stack för den som vill bygga samma arkitektur in i en egen vertikal produkt.
// Endast verifierbara påståenden: Agent SDK finns för Python, Node.js och Go,
// exponerar Kimi Code-runtimen programmatiskt och återanvänder konfiguration,
// verktyg, Skills och MCP-servrar samt visar godkännanden/verktygsanrop.
// Kimi Code stödjer Skills, MCP, subagenter och AgentSwarm. Permission rules
// använder allow / deny / ask.
export const ADVANCED_BONUS = {
  kicker: "Avancerad bonus",
  headline: "Bygg din egen AI-medarbetare.",
  lead:
    "Grok Bot ger dig den färdiga AI-medarbetarplattformen – det är där guiden bor. Men när du förstått metoden är den inte låst till ett verktyg: samma arkitektur kan byggas in i din egen vertikala produkt. Kimi Code och Kimi Agent SDK är ett aktuellt exempel på en sådan stack, inte ett krav.",
  readyMade: {
    label: "Färdigt · Grok Bot",
    note: "Plattformen finns redan – du bygger kontoret ovanpå.",
    steps: ["Botar", "Dator & verktyg", "Skills", "Routines", "Groups & handoffs", "Godkännanden"],
  },
  buildYourOwn: {
    label: "Bygg eget · exempelstack",
    note:
      "Kimi Agent SDK finns officiellt för Python, Node.js och Go och exponerar Kimi Code-runtimen programmatiskt. Den återanvänder din Kimi Code-konfiguration, verktyg, Skills och MCP-servrar, och visar verktygsanrop och godkännanden – vilket gör den användbar i egna produkter och automationer. Kimi Code stödjer Skills, MCP, subagenter och AgentSwarm, och permission rules sätts som allow / deny / ask.",
    steps: [
      "Kimi K3",
      "Kimi Code",
      "Skills",
      "MCP",
      "Agent SDK",
      "Subagenter / AgentSwarm",
      "Permissions (allow/deny/ask)",
      "Din egen vertikala AI-produkt",
    ],
  },
  trustNote:
    "Ärligt besked: guiden lovar inte att ett SDK trollar fram en medarbetare som jobbar dygnet runt. Schemaläggning, hosting, integrationer, övervakning och produktionsstabilitet är fortfarande ingenjörsarbete – bonusen visar arkitekturen och besluten, inte en genväg runt driften.",
} as const;

export const BONUS_CHAPTER = {
  title: "BONUS: Från Grok Bot till egen AI-medarbetare",
  desc:
    "Hur samma principer – roll, skill, verktyg, permissions, evidence och handoffs – flyttas in i din egen agentiska mjukvara. Kimi Code och Kimi Agent SDK används som konkret exempel: Skills, MCP, subagenter/AgentSwarm och permission rules (allow/deny/ask). Ingen färdig hostad produkt – hosting, schemaläggning och integrationer är ditt arbete.",
} as const;


// ── Guidekapitel (aktuell struktur, Version 1.0 — redigera fritt här) ───────
export const CHAPTERS: { title: string; desc: string }[] = [
  {
    title: "Från chatbot till AI-medarbetare",
    desc: "Skillnaden mellan att prata med Grok och att anställa den. Grunden för allt som följer.",
  },
  {
    title: "Din första Bot",
    desc: "Ett komplett bygge från tom chatt till en Bot med ett riktigt jobb – steg för steg.",
  },
  {
    title: "Så skriver du en Bot Charter",
    desc: "Mallen som gör en Bot till en medarbetare: roll, verktyg, ansvar, gränser och definitionen av klart.",
  },
  {
    title: "Skills",
    desc: "Teach a Task på riktigt: fånga ett återkommande arbetsflöde en gång och återanvänd det för alltid.",
  },
  {
    title: "Routines",
    desc: "Schemalagt och eventdrivet arbete – så jobbet körs på rätt tid utan att du startar det.",
  },
  {
    title: "Groups & handoffs",
    desc: "Arbetsrum där Botar lämnar över till varandra – utan att du blir mellanhand.",
  },
  {
    title: "Chief of Staff",
    desc: "Boten som håller ihop kontoret: prioriterar, fördelar och eskalerar till dig när det behövs.",
  },
  {
    title: "AI-företaget",
    desc: "Ägare → HQ → CEO → specialister. Det minsta teamet som slutför ett riktigt uppdrag end-to-end.",
  },
  {
    title: "Säkerhet & owner gates",
    desc: "Låt AI arbeta fritt – men lås pengar, publicering och riskfyllda åtgärder bakom ditt godkännande.",
  },
  {
    title: "Usage och AI-kapital",
    desc: "AI usage är en budget. Fördela den där avkastningen är störst och stoppa dubbelarbete.",
  },
  {
    title: "Growth & sales automation",
    desc: "Återkommande research-, content-, SEO- och sales-loopar – inklusive email-first-flöden med owner gate.",
  },
  {
    title: "Så bygger du vidare",
    desc: "Underhåll, nya versioner av Skills, och hur kontoret växer utan att växa sig ohållbart.",
  },
];

// ── Use cases (flöden guiden lär ut) ────────────────────────────────────────
export const USE_CASES: { title: string; mono: string; desc: string }[] = [
  {
    title: "Email-first sales automation",
    mono: "sales",
    desc: "Research-Boten hittar och kvalificerar bolag, Sales-Boten skriver utkasten – men inget skickas förrän du passerat owner gate. Varje utskick loggas som evidence.",
  },
  {
    title: "Veckovis research-loop",
    mono: "research",
    desc: "Varje måndag kör en Routine: Research sammanställer vad som rör sig i din nisch, Chief of Staff destillerar det till tre beslut du kan ta på kafferasten.",
  },
  {
    title: "Content & SEO-loop",
    mono: "growth",
    desc: "Från ämnesresearch till utkast, QA och publiceringsklar text i ett Work Packet. Du godkänner, kontoret producerar, vecka efter vecka.",
  },
  {
    title: "QA med evidence receipts",
    mono: "kvalitet",
    desc: "QA-Boten granskar leveranserna mot checklistan och kvitterar med bevis: vad som testades, vad som hittades, vad som eskaleras.",
  },
  {
    title: "Owner gates för riskåtgärder",
    mono: "kontroll",
    desc: "Köp, publicering och kundkontakt stannar alltid bakom din knapp. Allt annat kan kontoret köra själv – och redovisa efteråt.",
  },
];

// ── Vem guiden är för / inte för ────────────────────────────────────────────
export const WHO_FOR: string[] = [
  "Entreprenörer och soloprenörer som vill få mer gjort utan att anställa.",
  "Konsulter och byråer som vill paketera AI-arbete som återkommande system.",
  "Utvecklare och AI power users som vill ha struktur, inte fler prompttrådar.",
  "Dig som redan använder – eller funderar på – Cursor och Grok Bot i arbetet.",
  "Småföretagare som drunknar i admin, research och uppföljning.",
];

export const WHO_NOT_FOR: string[] = [
  "Dig som vill bli rik på AI över en natt – det här är ett operativsystem, inte ett lotteri.",
  "Dig som vill ha en färdig verksamhet utan att lägga något arbete alls.",
  "Dig som aldrig tänker öppna verktyget – guiden är praktisk, inte teoretisk underhållning.",
  "Team som redan driver en mogen agentplattform med egna processer.",
];

// ── FAQ / invändningar (CRO) — svarar på de tio vanligaste ──────────────────
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Jag är ny på Grok Bot – funkar guiden ändå?",
    a: "Ja. Guiden börjar från noll: din första Bot byggs steg för steg i kapitel 2, innan vi går vidare till Skills, Routines och Groups. Du behöver inte ha använt Grok Bot tidigare.",
  },
  {
    q: "Behöver jag vara programmerare?",
    a: "Nej. Upplägget är skrivet för operatörer, inte utvecklare. Allt byggs i Grok Bots egna ytor med copy-paste-mallar. Kan du beskriva ett jobb på svenska kan du bygga en Bot.",
  },
  {
    q: "Är det bara prompts?",
    a: "Nej – det är hela poängen. En prompt säger “gör den här uppgiften”. Guiden lär dig bygga Botar som äger ett jobb: roll, verktyg, Skills, Routines, evidence och handoffs. Promptar är bara ett av materialen.",
  },
  {
    q: "Vad är skillnaden mellan Bot, Skill och Routine?",
    a: "En Bot är en AI-medarbetare – en digital kollega med ett definierat jobb. En Skill är ett inlärt, återkommande arbetsflöde som Boten kan. En Routine bestämmer när jobbet körs – schemalagt eller triggat av en händelse.",
  },
  {
    q: "Kan jag använda detta i ett vanligt småföretag?",
    a: "Ja. Exemplen kommer från verklig drift: research, innehåll, uppföljning, sales outreach och QA. Det är AI-automatisering anpassad för företag utan teknikavdelning – upplägget skalar ner till en enda Bot lika väl som det skalar upp till ett helt AI-kontor.",
  },
  {
    q: "Fungerar det om jag använder Cursor?",
    a: "Ja. Principerna – Bot Charter, Skills, Routines, handoffs, owner gates – är desamma. Guiden visar upplägget i Grok Bot, men strukturen följer med dig oavsett vilket AI-verktyg du kör.",
  },
  {
    q: "Hur mycket kan Botarna göra helt själva?",
    a: "Mer än du tror – men inte allt. Guiden bygger medvetet på owner gates: repetitiva delar som research, utkast och sammanställningar kör autonomt, medan pengar, publicering och riskfyllda åtgärder alltid kräver ditt godkännande.",
  },
  {
    q: "Hur behåller jag kontrollen?",
    a: "Genom tre mekanismer som genomsyrar guiden: owner gates (inga riskåtgärder utan ditt godkännande), evidence receipts (varje leverans ska kunna bevisas) och usage-styrning (du ser vad varje Bot kostar i kapacitet).",
  },
  {
    q: "Blir guiden gammal när Grok ändras?",
    a: "Verktyg ändras – operativsystem består. Det mesta i guiden är plattformsoberoende: roller, Skills, handoffs och kontrollstrukturer. Guiden är dessutom versionerad och faktagranskad mot aktuella officiella källor; du ser alltid vilken version du har, när den uppdaterades och när fakta senast verifierades.",
  },
  {
    q: "Har varje Bot en egen dator?",
    a: "Nej – det är en vanlig missuppfattning. Alla Botar delar en och samma beständiga molndator som är knuten till ditt konto, men varje Bot arbetar på sin egen arbetsyta. Guiden visar hur du organiserar dem så att de samarbetar istället för att krocka.",
  },
  {
    q: "Vad får jag i Prompt Vault?",
    a: "Ett växande bibliotek av de färdiga prompts, templates och operating rules som används i upplägget: roller som CEO/Chief of Staff, Growth, Sales, QA och Engineer, plus system som Opportunity Engine, AI Usage Governor, Work Packets, owner gates och weekly reviews – redo att kopiera rakt in. Guiden är fullständig utan Vault; det här är genvägen för dig som vill kopiera implementeringen direkt.",
  },
];

// ── Legal-utkast som syns i köpflödet (Bekräftas av ägaren före live) ───────
export const LEGAL_DRAFT_NOTES = [
  "Prisvisning: konsumentpriser ska anges inklusive moms – bekräfta momshantering för digitalt innehåll innan live.",
  "Ångerrätt: distansavtalslagens 14-dagars ångerrätt med standardundantag för digitalt innehåll som levereras direkt med samtycke – texten nedan är ett utkast som ägaren ska godkänna.",
  "Köpbekräftelse: Stripe-mejl + leveransmejl. Bekräfta att villkor + integritetspolicy täcker försäljning av digitala produkter.",
];

export const DIGITAL_DELIVERY_NOTE =
  "Digital produkt – levereras direkt. Efter köpet får du guiden som nedladdning och på mejl. Vid köp samtycker du till att leveransen av det digitala innehållet påbörjas omedelbart, och du får information om vad det innebär för ångerrätten innan du betalar.";

// ── Preview-utdrag (ur kapitel 3) ───────────────────────────────────────────
export const PREVIEW_EXCERPT = `BOT CHARTER — urdrag ur kapitel 3

Roll: Research-bot för din nisch
Primärt jobb: Leverera en kort lägesbild varje måndag kl 07:00.

Verktyg: webbsökning, anteckningar i Group "Research".
Gör: söker veckans rörelser, sparar källor, skriver max 12 rader.
Gör inte: kontaktar aldrig kunder, publicerar aldrig.

Klart när: lägesbilden ligger i Group "HQ" med källor listade.
Evidence: länk till varje påstående + tidsstämpel.
Handoff: Chief of Staff destillerar till tre beslut.

Eskalera till ägaren om: något kräver köp, publicering eller kundkontakt.`;

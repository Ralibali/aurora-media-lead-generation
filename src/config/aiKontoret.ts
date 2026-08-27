/**
 * ============================================================================
 * AI-KONTORET — produktkonfiguration och innehåll (/grok-bot)
 * ============================================================================
 *
 * ── ARKITEKTUR (server-side, inga klientlänkar) ─────────────────────────────
 * Köpflödet går ALDRIG via statiska Payment Links. Kedjan är:
 *   1. Klienten anropar edge-funktionen `ai-kontoret-create-checkout`
 *      (produkt + e-post + uttryckligt samtycke) → Stripe Checkout Session
 *      skapas server-side med belopp och SKU från serverns katalog.
 *   2. Stripe → webhook `ai-kontoret-deliver` (signaturverifierad, idempotent)
 *      → rad i `ai_kontoret_purchases` + signerade, tidsbegränsade
 *        nedladdningslänkar från den PRIVATA bucketen `ai-kontoret-assets`
 *      → leveransmejl via Resend.
 *   3. Retursidan verifierar sessionen server-side via
 *      `ai-kontoret-verify-session`. En query-parameter är aldrig köpbevis.
 *   4. `ai-kontoret-launch-status` är lanseringsspärren: sidan visar aldrig
 *      köpknappar om Stripe, webhook-secret, produktfiler, leverans eller
 *      ägarens juridiska godkännande saknas.
 *
 * ── LANSERING (prelaunch → live) ────────────────────────────────────────────
 *   [ ] STRIPE_SECRET_KEY som secret i projektet
 *   [ ] STRIPE_WEBHOOK_SECRET som secret (webhook → /ai-kontoret-deliver,
 *       event: checkout.session.completed)
 *   [ ] De riktiga PDF:erna uppladdade via Admin → AI-KONTORET
 *       (privat bucket ai-kontoret-assets, se ASSET_PATHS nedan)
 *   [ ] Ägaren bekräftar juridiken (legal gate) i Admin → AI-KONTORET
 *   [ ] Sätt PRODUCT_STATUS = "live" nedan
 * Även med "live" öppnas köpflödet endast om launch-status svarar ready:true.
 * LEGAL_OWNER_CONFIRMED och VAT_CLASSIFICATION_CONFIRMED är kodflaggor.
 * Admin-krysset ensamt räcker inte. Ingen av dem är juridiskt godkännande.
 * ============================================================================
 */

// ── Lanseringsläge ──────────────────────────────────────────────────────────
// "prelaunch" = väntelista (säljer inget ofärdigt). "live" = köp via Stripe
// (men bara om lanseringsspärren `ai-kontoret-launch-status` svarar ready).
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
// OBS: dessa värden är endast för visning. Beloppen som debiteras sätts
// server-side i supabase/functions/_shared/aiKontoret.ts (CATALOG).
export const PRICES = {
  guide: 199,
  vault: 199,
  bundle: 349,
  /** guide + vault köpta separat – används för ärlig bundle-matte (199+199=398) */
  bundleReference: 398,
} as const;

export type AiKontoretProduct = "guide" | "vault" | "bundle";

// ── Edge-funktioner (server-side köp, verifiering och lanseringsspärr) ──────
export const FN_CREATE_CHECKOUT = "ai-kontoret-create-checkout";
export const FN_VERIFY_SESSION = "ai-kontoret-verify-session";
export const FN_LAUNCH_STATUS = "ai-kontoret-launch-status";
export const FN_UPLOAD_ASSET = "ai-kontoret-upload-asset";
export const FN_DELIVER = "ai-kontoret-deliver";
export const FN_WITHDRAW = "ai-kontoret-withdraw";

/**
 * Neutral retur efter checkout: /grok-bot?checkout=return&session_id=…
 * session_id är INTE ett köpbevis – det används bara som nyckel för
 * serververifiering. Cancel → /grok-bot?checkout=cancel.
 */
export const STRIPE_SUCCESS_URL =
  "https://auroramedia.se/grok-bot?checkout=return&session_id={CHECKOUT_SESSION_ID}";
export const STRIPE_CANCEL_URL = "https://auroramedia.se/grok-bot?checkout=cancel";

export const PRODUCT_SKUS: Record<AiKontoretProduct, string> = {
  guide: "ai-kontoret-guide",
  vault: "ai-kontoret-prompt-vault",
  bundle: "ai-kontoret-bundle",
};

/** Filerna ligger i den PRIVATA bucketen `ai-kontoret-assets` – aldrig publikt. */
export const ASSET_BUCKET = "ai-kontoret-assets";
export const ASSET_PATHS: Record<"guide" | "vault", string> = {
  guide: "ai-kontoret/v1.0/AI-KONTORET_Guide_v1.0.pdf",
  vault: "ai-kontoret/v1.0/AI-KONTORET_Prompt_Vault_v1.0.pdf",
};

// ── Waitlist (prelaunch) ────────────────────────────────────────────────────
// Återanvänder befintliga edge-funktionen send-contact-email (rate limit,
// honeypot, leads-tabell, Resend-mejl till info@auroramedia.se).
export const WAITLIST_PAKET = "AI-KONTORET – väntelista";

// ── Juridik (UTKAST — ska bekräftas av ägaren före live, se LEGAL_DRAFT_NOTES)
export const LEGAL_LINKS = {
  villkor: "/villkor#ai-kontoret",
  integritetspolicy: "/integritetspolicy",
  angra: "/angra-kop",
};

/**
 * UTKAST – KRÄVER ÄGARENS BEKRÄFTELSE.
 * Kunden måste aktivt kryssa i rutan. Rutan får inte vara förifylld.
 * LEGAL_OWNER_CONFIRMED hålls false tills ägaren godkänt den slutliga formuleringen.
 * Detta är inte ett juridiskt godkännande.
 */
export const LEGAL_ACK_TEXT =
  "Jag samtycker uttryckligen till att leveransen av det digitala innehållet påbörjas omedelbart och går med på att det därigenom inte finns någon ångerrätt när leveransen har påbörjats.";
export const LEGAL_ACK_OWNER_CONFIRMATION_REQUIRED = true;
export const LEGAL_OWNER_CONFIRMED = false;
export const VAT_CLASSIFICATION_CONFIRMED = false;
/** Speglar serverns klasser för adminvisning. Servern är sanningen. */
export const VAT_CLASSES = {
  guide: "electronic_publication_6",
  vault: "ess_25",
  bundle: "split_two_supplies",
} as const;


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
    title: "Evidence receipts",
    desc: "Så kräver du bevis på att jobbet är gjort – inte bara en rapport om att det är klart.",
  },
  {
    title: "Egen AI-medarbetare",
    desc: "Bonus: så tar du samma job description och bygger en egen agent med Kimi Code / Kimi Agent SDK när du behöver mer kontroll.",
  },
];

// ── Verkliga lärdomar / misstag ─────────────────────────────────────────────
export const LESSONS: { quote: string; takeaway: string }[] = [
  {
    quote: "En Bot ska ha ett jobb – inte ett helt företag.",
    takeaway:
      "När flera Botar hade samma breda mandat började de göra samma research och bränna usage på varandras arbete. Smalare roller vann.",
  },
  {
    quote: "Automatisera först när det manuella flödet faktiskt fungerar.",
    takeaway:
      "En dålig process blir inte bättre av att köras varje dag. Vi lär först upp uppgiften som Skill – sedan lägger vi en Routine ovanpå.",
  },
  {
    quote: "Bevis före aktivitet.",
    takeaway:
      "Det räcker inte att Boten säger att den har granskat något. Vi kräver artifacts, länkar, tester eller andra kvitton på leveransen.",
  },
  {
    quote: "Usage är ett kapital – inte en trofé.",
    takeaway:
      "Fler parallella agenter är inte automatiskt bättre. Kör den minsta struktur som klarar uppgiften och lägg kapaciteten där den ger affärsvärde.",
  },
  {
    quote: "Owner gates ska sitta på konsekvens – inte på allt.",
    takeaway:
      "Research och förberedelser kan gå automatiskt. Pengar, extern publicering, radering och produktionsändringar behöver en tydlig knapp från ägaren.",
  },
  {
    quote: "Handoffs måste vara konkreta.",
    takeaway:
      "En bra överlämning säger vad som är gjort, vad nästa Bot ska göra, vilket underlag som finns och när jobbet räknas som klart.",
  },
];

// ── Prompt Vault ─────────────────────────────────────────────────────────────
export const VAULT_BLURB =
  "Ett separat copy-paste-bibliotek med färdiga prompts, templates och operating rules för roller, Growth & Sales, Engineering, Operations, Skills/Routines/Handoffs, kontroll/evidence och avancerat eget agentbygge.";
export const VAULT_METHOD_NOTE =
  "Prompts i Vaulten använder samma kedja som guiden: roll → verktyg → Skill → Routine → evidence → handoff → resultat.";
export const VAULT_GROUPS: { title: string; items: string[] }[] = [
  { title: "Roller & ledning", items: ["HQ Charter", "Company CEO", "Research", "Growth", "Revenue"] },
  { title: "Growth & Sales", items: ["Sales Research Worker", "Email-first", "Reply classifier", "X engine", "SEO opportunity", "Launch command"] },
  { title: "Engineering & QA", items: ["Engineer Work Packet", "Production QA", "Bug reproduction"] },
  { title: "Operativa system", items: ["Opportunity Engine", "Work Elimination", "Usage Governor", "MAX MODE", "AI ROI"] },
  { title: "Skills & Routines", items: ["Skill Builder", "Routine Builder", "Handoff formatter"] },
  { title: "Kontroll & Evidence", items: ["Evidence Receipt", "Failure autopsy", "Owner Gate", "Permission matrix", "Claim classifier", "Safe external action", "Credential minimizer"] },
  { title: "Bygg eget", items: ["SKILL.md", "Kimi permissions", "MCP access matrix", "Agent architecture", "Vertical AI Employee", "Agent SDK readiness"] },
  { title: "Quick prompts", items: ["Visa tejpen", "Stoppa dubbelarbete", "En Bot = ett jobb", "Review-ready", "Minska owner actions", "Event före poll", "Kill rule", "Second-input test", "Owner inbox"] },
];

// ── Guidekapitel – synkad med PDF v1.0 ───────────────────────────────────────
export const CHAPTERS: { title: string; desc: string }[] = [
  {
    title: "Från chatbot till AI-medarbetare",
    desc: "Vad som skiljer ett bra svar från ett faktiskt återkommande jobb – och kedjan roll → verktyg → Skill → Routine → evidence → handoff → resultat.",
  },
  {
    title: "Din första Bot",
    desc: "Hur du börjar med en enda konkret arbetsuppgift, sätter owner gates och kräver ett kvitto på att uppgiften är klar.",
  },
  {
    title: "Bot Charter",
    desc: "Mallen för roll, ansvar, verktyg, gränser, cadence, output, DoD och eskalering – plus ett ifyllt exempel.",
  },
  {
    title: "Skills – återanvändbart arbetssätt",
    desc: "Så bygger du en Skill först efter att arbetsflödet fungerat manuellt och håller instruktionerna versionerbara.",
  },
  {
    title: "Routines – när jobbet körs",
    desc: "Schemalagda och eventdrivna Routines, run log, spamfällor och regeln: riktig uppgift → stabil Skill → Routine.",
  },
  {
    title: "Groups & handoffs",
    desc: "Hur Botar samarbetar utan att alla gör samma jobb – med en ansvarig, specialister och tydliga överlämningar.",
  },
  {
    title: "Chief of Staff – ett gränssnitt",
    desc: "En front door som prioriterar, delegerar och sammanfattar beslut – istället för att du hoppar mellan tio trådar.",
  },
  {
    title: "AI-företaget – HQ, CEO och specialister",
    desc: "Portföljnivån med HQ, Company CEO, Growth & Sales, Engineering, QA och Research – och vad varje nivå faktiskt ska äga.",
  },
  {
    title: "Säkerhet, approvals och owner gates",
    desc: "Konsekvensbaserade approvals för extern kommunikation, publicering, pengar, radering, permissions, produktion och juridiska commitments.",
  },
  {
    title: "Usage och AI-kapital",
    desc: "Hur du styr usage mot affärsvärde, hittar dubbelarbete och sätter stoppregler innan automatisering blir dyr aktivitet.",
  },
  {
    title: "Growth & Sales automation",
    desc: "Ett growth-system med research, kvalificering, drafts, reply-hantering, winner loop och tydliga gates för riktiga utskick.",
  },
  {
    title: "Så bygger du vidare",
    desc: "60-minuters quickstart, veckovis ROI-review, kill rules och hur du växer från en fungerande Bot till ett litet AI-kontor.",
  },
];

export const BONUS_CHAPTER = {
  title: "BONUS — Från Grok Bot till egen AI-medarbetare",
  desc: "När du behöver mer kontroll: samma charter byggd som egen agent med Kimi Code, Kimi Agent SDK, Skills, MCP och explicita permission-regler.",
} as const;

export const ADVANCED_BONUS = {
  kicker: "Avancerad bonus · från Bot till egen agent",
  headline: "När en färdig Bot inte längre räcker.",
  lead:
    "Grok Bot är det snabbaste sättet att få en digital kollega i arbete. Bonuskapitlet visar nästa nivå: hur samma job description kan bli en egen AI-medarbetare med Kimi Code, Kimi Agent SDK, Skills, MCP och explicita permission-regler – utan att blanda ihop prototyp med produktionssystem.",
  readyMade: {
    label: "Färdig AI-medarbetare",
    steps: ["Bot Charter", "Skill", "Routine", "Evidence", "Owner gate"],
    note: "Bäst när du vill få ett verkligt arbetsflöde i drift snabbt.",
  },
  buildYourOwn: {
    label: "Bygg din egen",
    steps: ["Job description", "Agent SDK", "Tools / MCP", "Permissions", "Logs / evidence", "Test / deploy"],
    note: "Bäst när du behöver egen produkt, integrationslager eller mer kontroll över runtime och UX.",
  },
  trustNote:
    "Bonuskapitlet är ett tekniskt nästa steg – inte ett löfte om en självkörande agent utan ansvar, tester eller approvals.",
} as const;

// ── Verkliga användningsfall ────────────────────────────────────────────────
export const USE_CASES: { mono: string; title: string; desc: string }[] = [
  {
    mono: "GROWTH LOOP",
    title: "Från data till nästa tillväxtåtgärd",
    desc: "Growth-boten läser utfallet, hittar största flaskhalsen, förbereder nästa experiment och lämnar ett mätbart work packet.",
  },
  {
    mono: "SALES RESEARCH",
    title: "Research → kvalificering → email draft",
    desc: "Hitta bolag och beslutsfattare, samla evidens, kvalificera mot ICP och skriv personliga utkast – med mänsklig gate före extern sändning.",
  },
  {
    mono: "ENGINEERING",
    title: "Work Packet → kod → QA → evidence",
    desc: "Company CEO definierar outcome, Engineer bygger, QA verifierar mot Definition of Done och returnerar tester/länkar istället för aktivitetsrapport.",
  },
  {
    mono: "OPPORTUNITY ENGINE",
    title: "Signaler → shortlist → billig validering",
    desc: "Samla riktiga signaler, deduplicera, prioritera på sannolik affärsnytta och testa efterfrågan innan du bygger en ny produkt.",
  },
  {
    mono: "OWNER INBOX",
    title: "Ett ställe för riktiga beslut",
    desc: "Chief of Staff visar bara beslut som kräver ägare: SEND, PUBLISH, SPEND, DELETE, PROD eller LEGAL – resten fortsätter i systemet.",
  },
];

// ── Vem guiden är / inte är för ─────────────────────────────────────────────
export const WHO_FOR: string[] = [
  "Driver företag eller bygger produkter och vill få verkligt arbete ur Grok Bot",
  "Har börjat testa AI-agenter men saknar roller, handoffs och ett driftsäkert upplägg",
  "Vill automatisera repetitiva uppgifter utan att ge AI fri tillgång till pengar eller produktion",
  "Vill kunna starta med Grok Bot nu och förstå hur samma mönster kan bli en egen agent senare",
];

export const WHO_NOT_FOR: string[] = [
  "Vill ha en lista med 500 generiska ChatGPT-prompts",
  "Söker ett löfte om helt självkörande företag utan mänskliga beslut",
  "Behöver en teknisk API-referens för xAI – den officiella dokumentationen är bättre för det",
  "Vill installera så många agenter som möjligt utan ett konkret jobb för varje agent",
];

// ── FAQ ─────────────────────────────────────────────────────────────────────
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Vad är Grok Bot?",
    a: "Grok Bot är xAI:s AI-agent/AI-teammate som kan arbeta via sin beständiga molndator, använda anslutna verktyg och köra Skills och Routines. AI-KONTORET handlar om hur du organiserar det som verkligt arbete – inte bara hur du startar Boten.",
  },
  {
    q: "Är AI-KONTORET en officiell xAI-guide?",
    a: "Nej. AI-KONTORET är en oberoende svensk guide från Aurora Media och är inte ansluten till, sponsrad av eller godkänd av xAI, Cursor eller Moonshot AI.",
  },
  {
    q: "Måste jag kunna programmera?",
    a: "Nej för huvuddelen av guiden. Bot Charter, Skills, Routines, handoffs och owner gates kan byggas utan att du utvecklar en egen agent. Bonusdelen om Kimi Agent SDK är mer teknisk och är tydligt avskild.",
  },
  {
    q: "Behöver jag ett särskilt abonnemang för Grok Bot?",
    a: "Grok Bot är en separat tjänst med behörighet och planvillkor som kan förändras. Därför hårdkodar guiden inte gamla planpriser. Kontrollera aktuell tillgång i Grok Bot/xAI/Cursor innan köp av en extern plan.",
  },
  {
    q: "Arbetar Botar när datorn är stängd?",
    a: "Bakgrundsarbete och Routines kan fortsätta på Grok Bots molndator även när din laptop är stängd, inom tjänstens aktuella usage- och planvillkor.",
  },
  {
    q: "Har varje Bot en egen dator?",
    a: "Nej – och det är en viktig detalj. Botarna har separata arbetsytor men delar användarens beständiga Grok Bot-dator, inklusive filer och browser sessions. Därför ska olika Botar inte behandlas som säkerhetsgränser.",
  },
  {
    q: "Vad är Prompt Vault?",
    a: "Prompt Vault är ett separat copy-paste-bibliotek med färdiga prompts och templates för roller, Growth & Sales, Engineering/QA, operativa system, Skills/Routines/Handoffs, evidence/owner gates och avancerat eget agentbygge. Guiden står på egna ben utan Vault.",
  },
  {
    q: "Ingår framtida uppdateringar?",
    a: "Köpet avser den levererade versionen och de Version 1.x-uppdateringar som Aurora Media uttryckligen publicerar för produkten. Det är inte ett abonnemang och innebär inte ett löfte om obegränsade framtida versioner.",
  },
  {
    q: "Bygger guiden ett helt autonomt företag åt mig?",
    a: "Nej. Den visar hur du bygger ett AI-kontor som gör mer arbete med mindre handpåläggning. Pengar, extern publicering, känsliga produktionsändringar och juridiska commitments ska fortfarande ha tydliga owner gates.",
  },
  {
    q: "Kan jag bygga en egen AI-medarbetare istället för Grok Bot?",
    a: "Ja. Bonuskapitlet visar mönstret från en färdig Grok Bot till en egen agent med Kimi Code / Kimi Agent SDK, Skills, MCP och permission-regler. Det är ett avancerat nästa steg – inte huvudprodukten.",
  },
];

// ── Preview-excerpt ─────────────────────────────────────────────────────────
export const PREVIEW_EXCERPT = `BOT CHARTER — RESEARCH

ROLL
Du är Research för [företag]. Du levererar beslutsunderlag – inte beslut.

UPPDRAG
Samla verifierbara fakta, skilj fakta från tolkning och lämna ett kort underlag som nästa ägare kan använda direkt.

VERKTYG
Tillåtna: webbsökning, godkända datakällor, interna dokument med läsbehörighet.
Inte tillåtna: extern publicering, köp, borttagning, ändrade permissions.

EVIDENCE STANDARD
• Länka källan till varje materiellt påstående.
• Märk osäkra slutsatser som HYPOTES.
• Skriv OKÄNT när det inte går att verifiera.

DEFINITION OF DONE
En färdig leverans innehåller:
1. Slutsats i högst fem rader.
2. Verifierade fakta med källor.
3. Osäkerheter.
4. Rekommenderad nästa ägare.
5. Evidence Receipt.`;

// ── Leveranscopy ─────────────────────────────────────────────────────────────
export const DIGITAL_DELIVERY_NOTE =
  "Digital leverans: länkarna skapas privat efter verifierad betalning, gäller under begränsad tid och skickas till e-postadressen du anger.";

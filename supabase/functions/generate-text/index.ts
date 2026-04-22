// Aurora Media – Gemini text generator via Lovable AI Gateway
// Anti-AI röstregler, validation pipeline, 9 text-typer.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const MODEL = "google/gemini-2.5-pro";

const SYSTEM_PROMPT = `Du skriver texter för Aurora Media AB – en enmans-konsultfirma i Linköping som bygger SaaS-produkter, interna verktyg och hemsidor med AI-kodningsverktyg (Lovable, Bolt, Emergent, Claude). Företaget drivs av Christoffer.

DITT JOBB: Skriva texter som låter som Christoffer själv skrivit dem på 20 minuter efter en kopp kaffe. Inte polerat, inte marketing. Raka, ärliga, konkreta.

RÖST – DETTA ÄR VIKTIGAST:

1. FÖRSTA PERSON SINGULAR ALLTID
- "Jag bygger" – aldrig "vi bygger", "Aurora Media bygger", "vårt team"
- Christoffer ÄR företaget. Byrå-språk är förbjudet.
- Undantag: när företagsinfo är nödvändig (org.nr, fakturering) skrivs "Aurora Media AB" bara på det juridiska.

2. DIREKT TILLTAL
- "du" (lowercase) – aldrig "Ni"
- Aldrig "man" eller "kunden" – alltid "du"

3. KORTA MENINGAR. BLANDA MED LÅNGA.
Variera rytmen. Efter en lång förklaring kommer en kort mening. Som slag.

4. KONKRET ÖVER ABSTRAKT
"Jag levererar snabbt" → NEJ. "Prototyp dag 3. Produktion dag 14." → JA.
"Vi har lång erfarenhet" → NEJ. "Jag har byggt sju SaaS det senaste året." → JA.

5. SIFFROR OCH DATA ÖVERALLT
- Kronor med mellanslag: 14 900 kr
- Antal dagar: "på 14 dagar"
- Stack-namn: "Lovable + Supabase + Stripe"
- Procent: "67 procent" i prosa, "67%" i siffer-kontexter

6. INGA BYRÅ-CLICHÉER. FÖRBJUDNA ORD OCH FRASER:
elevera, lyfta ert varumärke, ta er till nästa nivå, sömlös, sömlöst, skräddarsy, skräddarsydda, framtidssäkra, framtidssäker, digital transformation, heltäckande lösning, allt-i-ett, innovativ, innovation, kraftfull, modern och responsiv, i dagens digitala landskap, det är viktigt att notera, oavsett om du är, när det kommer till, kort sagt, sammanfattningsvis, slutligen, i slutet av dagen, när allt kommer omkring, det råder ingen tvekan, låt oss dyka, låt oss utforska, game changer, revolutionerande, banbrytande, branschledande, marknadsledande, best-in-class, världsklass, unleash, empower, leverage, synergier, i en värld där, din partner för.

FÖRBJUDNA STRUKTURER:
- Börja aldrig en text med "I denna artikel kommer vi att..."
- Inga "sammanfattning"-sektioner längst ner
- Inga tre-punkts-meningsrytmer ("snabbt, enkelt och smart")
- Inga adjektiv-staplar ("modern, skalbar och framtidssäker")
- Inga "[X] isn't just about Y — it's about Z"-konstruktioner

ANVÄND ISTÄLLET:
- Direktformuleringar: "Det tar 3 dagar" istället för "Leveranstiden är tre dagar"
- Aktiv röst: "Jag bygger" inte "bygget levereras"
- Personliga anekdoter när det passar: "Första gången jag byggde en sådan..."

TROVÄRDIGHET. Skriv utifrån vad som ÄR:
- 7 egna SaaS lanserade
- 10+ levererade kundprojekt
- 10 år i säkerhetsbranschen innan (INTE "10 år som byrå")
- Baserad i Linköping
- 1 person (Christoffer)
- Startade Aurora Media 2020 som sidoprojekt, heltid sedan 2024

Ljug INTE om antal kunder, anställda eller branscherfarenhet som byrå. Vid osäkerhet – utelämna hellre.

SPRÅK:
- Sverigesvenska, inte översatt amerikanska
- Datum: "15 mars 2026"
- Priser: "14 900 kr" med mellanslag
- Inga utropstecken på säljtext (max 1 per lång text)
- Inga emojis (någonsin)
- Korta stycken: 2-4 meningar max
- Markdown för struktur, listor sparsamt

KVALITETSTEST: Skulle detta kunna stå på vilken byråhemsida som helst i Sverige? Om ja → skriv om. Om detta var en e-post från en vän, skulle jag tro den? Om nej → för polerat.

OUTPUT: Returnera ALLTID endast giltig JSON enligt det format användaren ber om. Ingen markdown-fence, ingen förklarande text utanför JSON.`;

const BLOCKED_PHRASES = [
  "navigera den digitala", "i dagens digitala landskap", "det är viktigt att notera",
  "lyfta ert varumärke", "elevera", "ta er till nästa nivå", "sömlös", "sömlöst",
  "skräddarsy", "skräddarsydda", "framtidssäkra", "framtidssäker", "heltäckande lösning",
  "digital transformation", "låt oss dyka", "i en värld där", "game changer",
  "banbrytande", "revolutionerande", "branschledande", "marknadsledande",
  "det råder ingen tvekan", "kort sagt,", "sammanfattningsvis", "i slutet av dagen",
  "när allt kommer omkring", "oavsett om du är", "din partner för", "synergier",
  "best-in-class", "världsklass", "när det kommer till", "unleash", "empower", "leverage",
];

function buildUserPrompt(textType: string, topic: string, targetKeyword?: string, context?: string, minLength?: number, maxLength?: number): string {
  const ctx = context || "ingen extra kontext";
  const kw = targetKeyword || "(inget specifikt keyword)";

  switch (textType) {
    case "hero":
      return `Skriv hero-text för en sida/tjänst. Ämne: ${topic}. Kontext: ${ctx}.
Returnera JSON: { "h1": "max 10 ord", "subtitle": "1-2 meningar max 30 ord", "ctaText": "2-4 ord" }`;

    case "service-page":
      return `Skriv innehåll till en tjänstesida för Aurora Media. Tjänst: ${topic}. Pris/kontext: ${ctx}.
Returnera JSON: {
  "metaTitle": "55-60 tecken",
  "metaDesc": "145-155 tecken",
  "heroH1": "kort, konkret",
  "heroSubtitle": "en mening med pris nämnt",
  "intro": "300-400 tecken, etablera trovärdighet direkt",
  "whatsIncluded": ["6-10 punkter med konkret innehåll"],
  "processSteps": [{ "title": "string", "body": "80-120 tecken" }],
  "whyAffordable": "200-300 tecken",
  "faq": [{ "q": "string", "a": "string" }],
  "cta": "uppmaning, 1-2 meningar"
}`;

    case "article":
      return `Skriv en artikel för auroramedia.se/artiklar. Ämne: ${topic}. Keyword: ${kw}. Min-längd: ${minLength || 4000} tecken.
5-7 sektioner, 4-6 FAQ. När möjligt, nämn egna erfarenheter från AgilityManager, Aurora Transport, Updro, Hönsgården, Odlingsdagboken, GoGlamping Sweden eller Viriditas.
Returnera JSON: { "slug": "kebab-case", "metaTitle": "string", "metaDesc": "string", "h1": "string", "intro": "string", "sections": [{ "h2": "string", "body": "markdown" }], "faq": [{ "q": "string", "a": "string" }], "relatedLinks": [{ "title": "string", "url": "string" }] }`;

    case "case-study":
      return `Skriv en case study för Aurora Medias portfölj. Produkt: ${topic}. Kontext: ${ctx}.
Returnera JSON: { "hero": "1 mening", "problem": "300-400 tecken", "solution": "400-500 tecken", "technicalChoices": "200-300 tecken", "results": "konkreta siffror eller kvalitativ", "lessons": "200-300 tecken personligt" }`;

    case "faq-answer":
      return `Skriv ett svar till en FAQ-fråga på Aurora Medias sida. Fråga: ${topic}.
Svar 80-250 tecken. Direkt, ärligt. Vid obekväma frågor – erkänn istället för att snacka runt.
Returnera JSON: { "question": "${topic}", "answer": "string" }`;

    case "email-response":
      return `Skriv en e-postmall som Christoffer kan skicka som första svar till en projektförfrågan. Kontext: ${ctx}.
Varm men inte överdrivet entusiastisk. Max 150 ord. Signatur: "Christoffer // Aurora Media AB".
Returnera JSON: { "subject": "string", "body": "string" }`;

    case "landing-section":
    case "cta-block":
      return `Skriv en sektion på en landningssida. Sektionstyp: ${topic}. Kontext: ${ctx}. Max 500 tecken totalt.
Returnera JSON: { "heading": "string", "paragraphs": ["string"], "ctaText": "string (optional)" }`;

    case "about-section":
      return `Skriv en sektion till /om-sidan. Ämne: ${topic}. Aldrig personlig info utöver Linköping, 10 år i säkerhetsbranschen, 2024 på heltid. Aldrig politik, religion, familj. Inga "jag brinner för..."-formuleringar.
Returnera JSON: { "heading": "string", "body": "string" }`;

    default:
      return `Skriv text om: ${topic}. Kontext: ${ctx}. Returnera JSON: { "content": "string" }`;
  }
}

function extractJson(raw: string): unknown {
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = cleaned.search(/[\{\[]/);
  if (start === -1) throw new Error("Ingen JSON hittades i svaret");
  const opener = cleaned[start];
  const closer = opener === "[" ? "]" : "}";
  const end = cleaned.lastIndexOf(closer);
  if (end === -1) throw new Error("Ofullständig JSON i svaret");
  cleaned = cleaned.substring(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, " ");
    return JSON.parse(cleaned);
  }
}

function flatten(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (!value) return "";
  if (Array.isArray(value)) return value.map(flatten).join(" ");
  return Object.values(value as Record<string, unknown>).map(flatten).join(" ");
}

function findBlocked(text: string): string[] {
  const lc = text.toLowerCase();
  return BLOCKED_PHRASES.filter((p) => lc.includes(p));
}

function countPlural(text: string): number {
  const matches = text.toLowerCase().match(/\b(vi|vårt|vår|våra|oss)\b/g);
  return matches ? matches.length : 0;
}

function stripEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}]/gu, "");
}

function stripEmojisDeep(value: unknown): unknown {
  if (typeof value === "string") return stripEmojis(value);
  if (Array.isArray(value)) return value.map(stripEmojisDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = stripEmojisDeep(v);
    return out;
  }
  return value;
}

async function callGemini(messages: Array<{ role: string; content: string }>): Promise<string> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.85,
      top_p: 0.95,
      max_tokens: 8192,
    }),
  });

  if (resp.status === 429) throw new Error("RATE_LIMIT:Lovable AI är överbelastad just nu, försök igen om en stund.");
  if (resp.status === 402) throw new Error("PAYMENT:Krediterna i Lovable AI är slut. Lägg till mer i Workspace > Usage.");
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI gateway error ${resp.status}: ${t.slice(0, 300)}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Tomt svar från Lovable AI");
  return content as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY saknas i miljön");

    const body = await req.json();
    const {
      textType,
      topic,
      targetKeyword,
      context,
      minLength,
      maxLength,
      outputFormat = "json",
    } = body ?? {};

    if (!textType || typeof textType !== "string") {
      return new Response(JSON.stringify({ error: "textType krävs" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({ error: "topic krävs" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = buildUserPrompt(textType, topic, targetKeyword, context, minLength, maxLength);
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    let regenerationCount = 0;
    let blocked: string[] = [];
    let parsed: unknown = null;
    let raw = "";

    for (let attempt = 0; attempt < 3; attempt++) {
      raw = await callGemini(messages);

      if (outputFormat === "json") {
        try {
          parsed = extractJson(raw);
        } catch (e) {
          // Be om att skriva om som strikt JSON
          messages.push({ role: "assistant", content: raw });
          messages.push({
            role: "user",
            content: `Det där gick inte att parsa som JSON (${(e as Error).message}). Skicka ENDAST giltig JSON enligt formatet ovan – ingen markdown, ingen förklaring.`,
          });
          regenerationCount++;
          continue;
        }
      } else {
        parsed = { content: raw };
      }

      // Validation
      const flat = flatten(parsed);
      blocked = findBlocked(flat);
      const pluralCount = countPlural(flat);
      const exclamationCount = (flat.match(/!/g) || []).length;
      const exclamationLimit = Math.max(1, Math.floor(flat.length / 1000));

      const issues: string[] = [];
      if (blocked.length > 0) issues.push(`Du använde förbjudna fraser: ${blocked.join(", ")}.`);
      if (pluralCount > 2) issues.push(`Du använde "vi/vårt/oss/vår/våra" ${pluralCount} gånger. Aurora Media är ENMANS – skriv i första person singular.`);
      if (exclamationCount > exclamationLimit) issues.push(`För många utropstecken (${exclamationCount}). Aurora Media-rösten är lugnt självsäker.`);
      if (minLength && flat.length < minLength * 0.7) issues.push(`Texten är för kort (${flat.length} tecken, min ${minLength}). Utöka med konkret innehåll, inte fler ord.`);
      if (maxLength && flat.length > maxLength * 1.3) issues.push(`Texten är för lång (${flat.length} tecken, max ${maxLength}). Korta ner.`);

      if (issues.length === 0) break;

      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content: `Skriv om. Problem: ${issues.join(" ")} Använd konkret, direkt svenska. Returnera samma JSON-format.`,
      });
      regenerationCount++;
    }

    // Strippa emojis oavsett
    parsed = stripEmojisDeep(parsed);

    const flat = flatten(parsed);
    const wordCount = flat.split(/\s+/).filter(Boolean).length;
    const characterCount = flat.length;

    return new Response(
      JSON.stringify({
        content: parsed,
        metadata: {
          regenerationCount,
          blockedPhrasesFound: blocked,
          wordCount,
          characterCount,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Okänt fel";
    let status = 500;
    if (msg.startsWith("RATE_LIMIT:")) status = 429;
    if (msg.startsWith("PAYMENT:")) status = 402;
    console.error("generate-text error:", msg);
    return new Response(JSON.stringify({ error: msg.replace(/^(RATE_LIMIT:|PAYMENT:)/, "") }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

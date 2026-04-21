// RSS 2.0 feed för Aurora Media-artiklar.
// Anropa: GET /functions/v1/generate-rss
// Returnerar application/rss+xml med 30 minuters cache.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://auroramedia.se";

// Speglar artikel-metadata från src/lib/articlesData{1,2}.ts.
// Uppdatera här när nya artiklar publiceras.
const articles = [
  {
    slug: "bygga-saas-med-ai-2026",
    title: "Så bygger man en SaaS med AI 2026 – komplett guide",
    publishedDate: "2026-01-15",
    category: "AI-utveckling",
    description:
      "Komplett guide till att bygga SaaS-produkter med AI-kodningsverktyg som Lovable, Bolt och Emergent. Verktyg, kostnader och steg-för-steg-process.",
  },
  {
    slug: "lovable-eller-bolt-eller-emergent",
    title: "Lovable, Bolt eller Emergent – vilket AI-verktyg ska du välja?",
    publishedDate: "2026-01-22",
    category: "AI-verktyg",
    description:
      "Jämförelse mellan Lovable, Bolt.new och Emergent baserat på 7+ produkter. Styrkor, svagheter, priser och rekommendationer.",
  },
  {
    slug: "vad-kostar-saas-utveckling-2026",
    title: "Vad kostar det att utveckla en SaaS 2026? Prisguide Sverige",
    publishedDate: "2026-02-04",
    category: "Prisguide",
    description:
      "Prisintervall för SaaS-utveckling i Sverige 2026. Byrå, freelance, AI-kodning och egenbyggt jämfört med konkreta siffror.",
  },
  {
    slug: "bygga-saas-pa-2-veckor",
    title: "Så bygger man en SaaS på 2 veckor – praktisk guide",
    publishedDate: "2026-02-12",
    category: "Metodik",
    description:
      "Praktisk guide till att gå från idé till lanserad SaaS på 2 veckor med AI-kodning. Vecka för vecka, vad som ingår och vad som skjuts upp.",
  },
  {
    slug: "ai-kodning-sverige-2026",
    title: "AI-kodning i Sverige 2026 – läget, verktyg och möjligheter",
    publishedDate: "2026-02-20",
    category: "AI-utveckling",
    description:
      "Lägesrapport om AI-kodning i Sverige 2026. Hur dev-branschen förändrats, vilka företag använder det och prognosen för 2027.",
  },
  {
    slug: "saas-utvecklare-linkoping",
    title: "SaaS-utvecklare i Linköping – så hittar du rätt partner",
    publishedDate: "2026-03-01",
    category: "Lokalt",
    description:
      "Guide till att hitta rätt SaaS-utvecklare i Linköping 2026. Frågor att ställa, prisintervall och vad som skiljer aktörerna.",
  },
  {
    slug: "mvp-utveckling-for-startup",
    title: "MVP-utveckling för svenska startups – komplett guide",
    publishedDate: "2026-03-08",
    category: "Startup",
    description:
      "Komplett guide till MVP-utveckling för svenska startups. Vanliga misstag, vad som ska byggas, validering och prisintervall 2026.",
  },
  {
    slug: "intern-app-istallet-for-excel",
    title: "Ersätt Excel med en intern app – när och hur",
    publishedDate: "2026-03-15",
    category: "Intern verktyg",
    description:
      "När Excel blir flaskhalsen är det dags att bygga intern app. Guide till ROI, byggmetodik och integrationer med Fortnox m.m.",
  },
  {
    slug: "saas-for-startup-utan-utvecklare",
    title: "Bygga SaaS utan utvecklare 2026 – verkligt möjligt?",
    publishedDate: "2026-03-22",
    category: "Startup",
    description:
      "Är det realistiskt att bygga en SaaS utan utvecklare 2026? Vi går igenom vad som faktiskt går och var gränserna går.",
  },
  {
    slug: "supabase-eller-firebase-2026",
    title: "Supabase vs Firebase 2026 – vilken ska du välja?",
    publishedDate: "2026-03-29",
    category: "Verktyg",
    description:
      "Detaljerad jämförelse Supabase vs Firebase 2026. Pris, funktioner, EU-data, ekosystem och rekommendationer per projekttyp.",
  },
  {
    slug: "fortnox-integration-saas",
    title: "Integrera Fortnox med din SaaS – komplett guide",
    publishedDate: "2026-04-05",
    category: "Integration",
    description:
      "Komplett guide till Fortnox API-integration i SaaS-produkter. Authentication, vanliga endpoints och vanliga fallgropar.",
  },
  {
    slug: "traditionell-webbyra-vs-ai-byggare",
    title: "Traditionell webbyrå eller AI-byggare – jämförelse",
    publishedDate: "2026-04-12",
    category: "Jämförelse",
    description:
      "När ska du välja en traditionell webbyrå och när en AI-byggare? Pris, leveranstid, kvalitet och support jämförda.",
  },
];

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildRss = (): string => {
  const sorted = [...articles].sort((a, b) =>
    b.publishedDate.localeCompare(a.publishedDate)
  );
  const lastBuildDate = new Date().toUTCString();

  const items = sorted
    .map((a) => {
      const url = `${SITE_URL}/artiklar/${a.slug}`;
      const pubDate = new Date(`${a.publishedDate}T08:00:00Z`).toUTCString();
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(a.category)}</category>
      <description>${escapeXml(a.description)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Aurora Media – Artiklar om AI-kodning och SaaS-utveckling</title>
    <link>${SITE_URL}/artiklar</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Erfarenheter, jämförelser och konkreta siffror från att bygga SaaS-produkter med AI-verktyg som Lovable, Bolt och Emergent.</description>
    <language>sv-SE</language>
    <copyright>© Aurora Media AB</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Aurora Media RSS edge function</generator>
${items}
  </channel>
</rss>`;
};

Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const xml = buildRss();
    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

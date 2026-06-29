#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://auroramedia.se";
const route = "/ai-karta";
const url = `${SITE_URL}${route}`;
const title = "AI-kartläggning för företag – kostnadsfri AI-analys | Aurora Media";
const description =
  "Kartlägg företagets bästa områden för AI, automation och interna system. Få prioriterad topp 3, tidsuppskattning och PDF på cirka 3–5 minuter.";

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Aurora AI-karta",
  url,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "sv-SE",
  description,
  provider: { "@id": `${SITE_URL}/#organization` },
  offers: { "@type": "Offer", price: "0", priceCurrency: "SEK" },
  featureList: [
    "Prioriterad topp 3",
    "Uppskattad tidsbesparing",
    "Lösningsförslag",
    "PDF-underlag",
  ],
};

const body = `
  <article>
    <h1>Se var AI kan spara mest tid i ert företag</h1>
    <p>Aurora AI-karta är en kostnadsfri AI-kartläggning för företag. Beskriv era återkommande arbetsuppgifter och få en prioriterad topp tre med lösningsförslag, uppskattad tidsbesparing och ett PDF-underlag.</p>
    <h2>Vad kartläggningen visar</h2>
    <p>Analysen bedömer om varje process främst lämpar sig för AI, vanlig automation, integration eller ett internt verksamhetssystem. Rangordningen bygger på frekvens, tidsåtgång, regelstyrning, tillgänglig data och affärsnytta.</p>
    <h2>Så fungerar AI-kartan</h2>
    <p>Markera var tiden försvinner, beskriv minst en återkommande process och ange vart resultatet ska skickas. Kartläggningen tar normalt cirka tre till fem minuter. Resultatet visas direkt och kan laddas ner som PDF.</p>
    <h2>Trygg användning</h2>
    <p>Beskriv processen på en övergripande nivå och undvik känsliga personuppgifter, kundlistor, avtal och företagshemligheter. Resultatet är en första indikation och ersätter inte en full teknisk eller juridisk förstudie.</p>
    <p><a href="/ai-karta/start">Starta den kostnadsfria AI-kartläggningen</a></p>
  </article>`;

async function main() {
  const dist = path.resolve(process.cwd(), "dist");
  const template = await fs.readFile(path.join(dist, "index.html"), "utf8");
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="robots"[^>]*>\s*/gi, "");

  const head = [
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:image" content="${SITE_URL}/og-image-sv.jpg" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og-image-sv.jpg" />`,
    `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`,
  ].join("\n    ");

  html = html.replace("</head>", `    ${head}\n  </head>`);
  html = html.replace(/\s*<div id="seo-content"[\s\S]*?<\/div>\s*(?=<div id="root"><\/div>)/i, "");
  html = html.replace(
    '<div id="root"></div>',
    `\n    <div id="seo-content" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">${body}</div>\n    <div id="root"></div>`,
  );

  const output = path.join(dist, "ai-karta", "index.html");
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, html, "utf8");
  console.log("Generated static AI map landing page.");
}

main();

#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const pages = [
  {
    file: path.resolve(process.cwd(), "dist", "index.html"),
    title: "Aurora Media AB | AI-driven mjukvarupartner för svenska företag",
    description:
      "Aurora Media bygger AI-lösningar, interna system, appar och SaaS för svenska företag. Snabb leverans, tydligt scope och kod ni äger.",
    body:
      "Aurora Media AB bygger AI-lösningar, interna system, appar, integrationer och SaaS för svenska företag. Företaget är baserat i Linköping och hjälper verksamheter att minska manuellt arbete och skapa bättre digitala flöden.",
  },
  {
    file: path.resolve(process.cwd(), "dist", "ai-byra-linkoping", "index.html"),
    title: "AI-konsult & AI-byrå i Linköping | Aurora Media",
    description:
      "Aurora Media hjälper företag i Linköping att automatisera administration, ersätta Excel och bygga AI-drivna interna system. Lokal kontakt och tydligt scope.",
    body:
      "Aurora Media är en AI-konsult och AI-byrå i Linköping som hjälper företag att automatisera administration, ersätta kalkylblad, koppla ihop system och bygga AI-drivna interna verktyg.",
  },
];

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function replaceMeta(html, attribute, key, value) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, "i");
  return html.replace(
    pattern,
    `<meta ${attribute}="${key}" content="${escapeAttribute(value)}" />`,
  );
}

async function patchPage(page) {
  let html = await fs.readFile(page.file, "utf8");

  html = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeAttribute(page.title)}</title>`,
  );
  html = replaceMeta(html, "name", "description", page.description);
  html = replaceMeta(html, "property", "og:title", page.title);
  html = replaceMeta(html, "property", "og:description", page.description);
  html = replaceMeta(html, "name", "twitter:title", page.title);
  html = replaceMeta(html, "name", "twitter:description", page.description);
  html = html.replace(
    /(<div id="seo-content"[\s\S]*?>)[\s\S]*?(<\/div>\s*<div id="root"><\/div>)/i,
    `$1\n      ${page.body}\n    $2`,
  );

  await fs.writeFile(page.file, html, "utf8");
}

for (const page of pages) {
  await patchPage(page);
}

console.log("Patched generated metadata for the homepage and Linköping AI page.");

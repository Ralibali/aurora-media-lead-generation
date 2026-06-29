#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const file = path.resolve(process.cwd(), "dist", "index.html");
const title = "Aurora Media AB | AI-driven mjukvarupartner för svenska företag";
const description =
  "Aurora Media bygger AI-lösningar, interna system, appar och SaaS för svenska företag. Snabb leverans, tydligt scope och kod ni äger.";
const body =
  "Aurora Media AB bygger AI-lösningar, interna system, appar, integrationer och SaaS för svenska företag. Företaget är baserat i Linköping och hjälper verksamheter att minska manuellt arbete och skapa bättre digitala flöden.";

function replaceMeta(html, selector, value) {
  const escaped = value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const pattern = new RegExp(`<meta\\s+${selector}="[^"]+"[^>]*>`, "i");
  const attribute = selector === "name" ? "name" : "property";
  const key = selector === "name" ? "description" : selector;
  return html.replace(pattern, `<meta ${attribute}="${key}" content="${escaped}" />`);
}

let html = await fs.readFile(file, "utf8");
html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
html = html.replace(
  /<meta\s+name="description"[^>]*>/i,
  `<meta name="description" content="${description}" />`,
);
html = html.replace(
  /<meta\s+property="og:title"[^>]*>/i,
  `<meta property="og:title" content="${title}" />`,
);
html = html.replace(
  /<meta\s+property="og:description"[^>]*>/i,
  `<meta property="og:description" content="${description}" />`,
);
html = html.replace(
  /<meta\s+name="twitter:title"[^>]*>/i,
  `<meta name="twitter:title" content="${title}" />`,
);
html = html.replace(
  /<meta\s+name="twitter:description"[^>]*>/i,
  `<meta name="twitter:description" content="${description}" />`,
);
html = html.replace(
  /(<div id="seo-content"[\s\S]*?>)[\s\S]*?(<\/div>\s*<div id="root"><\/div>)/i,
  `$1\n      ${body}\n    $2`,
);

await fs.writeFile(file, html, "utf8");
console.log("Patched generated homepage title, description and static SEO body.");

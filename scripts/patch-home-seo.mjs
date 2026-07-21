#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { buildInstantPreview, setInstantPreview } from "./instant-preview.mjs";

const pages = [
  {
    file: path.resolve(process.cwd(), "dist", "index.html"),
    title: "Aurora Media AB | AI-driven mjukvarupartner för svenska företag",
    description:
      "Aurora Media bygger AI-lösningar, interna system, appar och SaaS för svenska företag. Snabb leverans, tydligt scope och kod ni äger.",
    body:
      "Aurora Media AB bygger AI-lösningar, interna system, appar, integrationer och SaaS för svenska företag. Företaget är baserat i Linköping och hjälper verksamheter att minska manuellt arbete och skapa bättre digitala flöden.",
    preview: {
      h1: "AI-driven mjukvarupartner för svenska företag",
      mono: "Aurora Media · Linköping",
      ctas: [
        { label: "Starta AI-kartan – gratis", href: "/ai-karta" },
        { label: "Boka samtal", href: "/kontakt", ghost: true },
      ],
    },
  },
  {
    file: path.resolve(process.cwd(), "dist", "ai-byra-linkoping", "index.html"),
    title: "AI-byrå i Linköping | Fast pris från 4 900 kr – Aurora Media",
    description:
      "AI-byrå i Linköping som hjälper företag automatisera administration, ersätta Excel och bygga AI-drivna interna system. Fast pris, lokal kontakt, första versionen på veckor.",
    body:
      "Aurora Media är en AI-byrå i Linköping som hjälper företag att automatisera administration, ersätta kalkylblad, koppla ihop system och bygga AI-drivna interna verktyg. Fast pris från 4 900 kr, fysiska möten i Linköpingsområdet och en första testbar version inom några veckor.",
    preview: {
      h1: "AI-byrå i Linköping",
      mono: "Linköping · Fast pris från 4 900 kr",
      ctas: [
        { label: "Boka samtal", href: "/kontakt" },
        { label: "Starta AI-kartan – gratis", href: "/ai-karta", ghost: true },
      ],
    },
  },
  {
    file: path.resolve(process.cwd(), "dist", "priser", "index.html"),
    title: "Priser för AI-system, MVP, SaaS och konsult | Aurora Media",
    description:
      "Se riktpriser för prototyp, MVP, SaaS, AI-automation och konsultuppdrag. Utvecklingskonsult 895 kr/timme, rådgivning från 12 000 kr/mån. Projekt från 4 900 kr.",
    body:
      "Aurora Media erbjuder prototyper från 4 900 kr, MVP från 11 900 kr, skalbar SaaS från 24 900 kr och AI-automation efter tydligt scope – samt konsultuppdrag inom AI-rådgivning och utveckling för 895 kr/timme eller från 12 000 kr/månad. Alla priser är riktpriser exklusive moms och exakt pris lämnas före projektstart.",
    preview: {
      h1: "Priser – fast pris, inga överraskningar",
      mono: "Prototyp från 4 900 kr · Konsult 895 kr/h",
      ctas: [
        { label: "Boka samtal", href: "/kontakt" },
        { label: "Starta AI-kartan – gratis", href: "/ai-karta", ghost: true },
      ],
    },
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
  // Ersätt förhandsvisningen med denna sidas skarpare titel/brödtext
  html = setInstantPreview(
    html,
    buildInstantPreview({
      title: page.preview.h1,
      body: page.body,
      mono: page.preview.mono,
      ctas: page.preview.ctas,
    }),
  );

  await fs.writeFile(page.file, html, "utf8");
}

for (const page of pages) {
  await patchPage(page);
}

const articleGenerator = path.resolve(
  process.cwd(),
  "scripts",
  "generate-local-article-pages.mjs",
);
const articleResult = spawnSync(process.execPath, [articleGenerator], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (articleResult.status !== 0) {
  throw new Error("Static generation of local AI article pages failed.");
}

console.log(
  "Patched homepage, Linköping and pricing metadata and generated local AI article pages.",
);

#!/usr/bin/env node
import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { buildInstantPreview, setInstantPreview } from "./instant-preview.mjs";

const SITE_URL = "https://auroramedia.se";
const SITE_NAME = "Aurora Media AB";
const DIST_DIR = path.resolve(process.cwd(), "dist");
const SOURCE_FILE = path.resolve(process.cwd(), "src", "lib", "articlesData6.ts");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function decodeString(value) {
  return String(value ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");
}

function extractString(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*"([\\s\\S]*?)"`, "m"));
  return match ? decodeString(match[1]) : "";
}

function splitArticleBlocks(text) {
  const starts = [];
  const marker = /\n\s*\{\s*\n\s*slug:\s*"/g;
  let match;

  while ((match = marker.exec(text))) starts.push(match.index + 1);

  return starts.map((start, index) =>
    text.slice(start, starts[index + 1] || text.lastIndexOf("\n];")),
  );
}

function extractSections(block) {
  const sectionsStart = block.indexOf("sections:");
  const faqStart = block.indexOf("faq:");
  if (sectionsStart < 0) return [];

  const sectionBlock = block.slice(
    sectionsStart,
    faqStart > sectionsStart ? faqStart : undefined,
  );
  const sections = [];
  const regex = /heading:\s*"([\s\S]*?)"[\s\S]*?content:\s*"([\s\S]*?)"/g;
  let match;

  while ((match = regex.exec(sectionBlock))) {
    const heading = decodeString(match[1]);
    const content = decodeString(match[2]);
    if (heading && content) sections.push({ heading, content });
  }

  return sections;
}

function extractFaq(block) {
  const faqStart = block.indexOf("faq:");
  const relatedStart = block.indexOf("relatedSlugs:");
  if (faqStart < 0) return [];

  const faqBlock = block.slice(
    faqStart,
    relatedStart > faqStart ? relatedStart : undefined,
  );
  const faq = [];
  const regex = /q:\s*"([\s\S]*?)"[\s\S]*?a:\s*"([\s\S]*?)"/g;
  let match;

  while ((match = regex.exec(faqBlock))) {
    faq.push({ q: decodeString(match[1]), a: decodeString(match[2]) });
  }

  return faq;
}

function extractArticles() {
  if (!existsSync(SOURCE_FILE)) return [];
  const text = readFileSync(SOURCE_FILE, "utf8");

  return splitArticleBlocks(text)
    .map((block) => ({
      slug: extractString(block, "slug"),
      keyword: extractString(block, "keyword"),
      category: extractString(block, "category"),
      title: extractString(block, "title"),
      metaTitle: extractString(block, "metaTitle"),
      metaDesc: extractString(block, "metaDesc"),
      publishedDate: extractString(block, "publishedDate"),
      updatedDate: extractString(block, "updatedDate"),
      intro: extractString(block, "intro"),
      sections: extractSections(block),
      faq: extractFaq(block),
    }))
    .filter((article) => article.slug && article.title);
}

function buildBody(article) {
  const sections = article.sections
    .map(
      (section) =>
        `<section><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.content)}</p></section>`,
    )
    .join("\n");

  const faq = article.faq.length
    ? `<section><h2>Vanliga frågor</h2>${article.faq
        .map((item) => `<h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p>`)
        .join("\n")}</section>`
    : "";

  return `<article><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.intro)}</p>${sections}${faq}</article>`;
}

function buildSchemas(article, url) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.metaDesc,
      datePublished: article.publishedDate,
      dateModified: article.updatedDate || article.publishedDate,
      author: {
        "@type": "Person",
        name: "Christoffer Holstensson",
        url: `${SITE_URL}/om`,
      },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      articleSection: article.category,
      keywords: article.keyword,
      inLanguage: "sv-SE",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Hem", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blogg", item: `${SITE_URL}/blogg` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  if (article.faq.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return schemas;
}

function injectPage(template, article) {
  const route = `/blogg/${article.slug}`;
  const url = `${SITE_URL}${route}`;
  const fullTitle = article.metaTitle.includes("Aurora Media")
    ? article.metaTitle
    : `${article.metaTitle} | ${SITE_NAME}`;

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`)
    .replace(
      /<meta\s+name="description"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(article.metaDesc)}" />`,
    )
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>\s*/gi, "")
    .replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="robots"[^>]*>\s*/gi, "");

  const headTags = [
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(article.metaDesc)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:image" content="${SITE_URL}/og-image-sv.jpg" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="sv_SE" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(article.metaDesc)}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og-image-sv.jpg" />`,
    ...buildSchemas(article, url).map(
      (schema) => `<script type="application/ld+json">${escapeJsonLd(schema)}</script>`,
    ),
  ];

  html = html.replace("</head>", `    ${headTags.join("\n    ")}\n  </head>`);

  // Synlig statisk förhandsvisning (mallen = dist/index.html har redan en
  // preview för startsidan – setInstantPreview ersätter hela det blocket).
  html = setInstantPreview(
    html,
    buildInstantPreview({
      title: article.title,
      body: buildBody(article),
      mono: "Aurora Media · Blogg",
      ctas: [{ label: "Boka samtal", href: "/kontakt" }],
    }),
  );

  return html;
}

async function main() {
  const template = await fs.readFile(path.join(DIST_DIR, "index.html"), "utf8");
  const articles = extractArticles();

  for (const article of articles) {
    const output = path.join(DIST_DIR, "blogg", article.slug, "index.html");
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, injectPage(template, article), "utf8");
  }

  console.log(`Generated ${articles.length} local AI article pages.`);
}

main();

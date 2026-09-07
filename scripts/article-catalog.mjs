import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EDITORIAL_FILE = resolve(ROOT, "src/content/editorial/articles.json");
const ARTICLE_DATA_FILES = [
  "articlesData1.ts",
  "articlesData2.ts",
  "articlesData3.ts",
  "articlesData4.ts",
  "articlesData5.ts",
  "articlesData6.ts",
  "articlesData7.ts",
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractString(block, key) {
  const re = new RegExp(`${key}:\\s*"([\\s\\S]*?)"`, "m");
  const match = block.match(re);
  return match ? match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : "";
}

function splitArticleBlocks(text) {
  const blocks = [];
  const marker = /\n\s*\{\s*\n\s*slug:\s*"/g;
  const starts = [];
  let match;
  while ((match = marker.exec(text))) starts.push(match.index + 1);
  for (let i = 0; i < starts.length; i++) {
    blocks.push(text.slice(starts[i], starts[i + 1] || text.lastIndexOf("\n];")));
  }
  return blocks;
}

function extractSections(block) {
  const sections = [];
  const re = /heading:\s*"([\s\S]*?)"[\s\S]*?content:\s*(?:`([\s\S]*?)`|"([\s\S]*?)")/g;
  let match;
  while ((match = re.exec(block))) {
    const heading = (match[1] || "").replace(/\\"/g, '"');
    const content = (match[2] || match[3] || "").replace(/\\n/g, "\n").replace(/\\"/g, '"');
    if (heading && content) sections.push({ heading, content });
  }
  return sections;
}

function extractFaq(block) {
  const faq = [];
  const re = /q:\s*"([\s\S]*?)"[\s\S]*?a:\s*"([\s\S]*?)"/g;
  let match;
  while ((match = re.exec(block))) {
    faq.push({ q: match[1].replace(/\\"/g, '"'), a: match[2].replace(/\\"/g, '"') });
  }
  return faq;
}

function loadLegacyArticles() {
  const articles = [];
  for (const file of ARTICLE_DATA_FILES) {
    const filePath = resolve(ROOT, "src/lib", file);
    if (!existsSync(filePath)) continue;
    const text = readFileSync(filePath, "utf8");
    for (const block of splitArticleBlocks(text)) {
      const slug = extractString(block, "slug");
      if (!slug) continue;
      articles.push({
        slug,
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
      });
    }
  }
  return articles;
}

/** Editorial JSON first, then legacy TS articles. One catalog for sitemap, static HTML, and tests. */
export function loadArticles() {
  const editorial = existsSync(EDITORIAL_FILE)
    ? JSON.parse(readFileSync(EDITORIAL_FILE, "utf8"))
    : [];
  const seen = new Set();
  return [...editorial, ...loadLegacyArticles()].filter((article) => {
    if (!article?.slug || seen.has(article.slug)) return false;
    seen.add(article.slug);
    return true;
  });
}

export function buildBlogIndexBody(articles = loadArticles()) {
  const items = articles
    .map(
      (article) =>
        `<li><a href="/blogg/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a></li>`,
    )
    .join("\n");

  return `<main>
    <h1>Blogg om AI-kodning och SaaS-utveckling</h1>
    <p>Aurora Media publicerar guider om AI-kodning, SaaS-utveckling, MVP, prototyper, Lovable, Bolt, Cursor och modern digital produktutveckling.</p>
    <h2>Alla artiklar</h2>
    <ul>
      ${items}
    </ul>
  </main>`;
}

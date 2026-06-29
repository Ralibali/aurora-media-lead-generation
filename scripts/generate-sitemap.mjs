#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC_DIR = resolve(ROOT, "public");
const DIST_DIR = resolve(ROOT, "dist");
const SITE_URL = "https://auroramedia.se";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/ai-karta", changefreq: "weekly", priority: "0.95" },
  { path: "/ai-byra-linkoping", changefreq: "weekly", priority: "0.95" },
  { path: "/ai-automation-foretag", changefreq: "weekly", priority: "0.9" },
  { path: "/ai-konsult-sverige", changefreq: "monthly", priority: "0.85" },
  { path: "/saas-utveckling-linkoping", changefreq: "monthly", priority: "0.75" },
  { path: "/tjanster", changefreq: "weekly", priority: "0.9" },
  { path: "/tjanster/hemsidor", changefreq: "monthly", priority: "0.8" },
  { path: "/tjanster/ehandel", changefreq: "monthly", priority: "0.8" },
  { path: "/tjanster/mobilapp", changefreq: "monthly", priority: "0.85" },
  { path: "/tjanster/seo", changefreq: "monthly", priority: "0.8" },
  { path: "/tjanster/google-ads", changefreq: "monthly", priority: "0.7" },
  { path: "/tjanster/meta-ads", changefreq: "monthly", priority: "0.7" },
  { path: "/tjanster/content", changefreq: "monthly", priority: "0.7" },
  { path: "/tjanster/grafisk-profil", changefreq: "monthly", priority: "0.65" },
  { path: "/tjanster/fotografering", changefreq: "monthly", priority: "0.65" },
  { path: "/arbete", changefreq: "monthly", priority: "0.85" },
  { path: "/produkter", changefreq: "monthly", priority: "0.75" },
  { path: "/process", changefreq: "monthly", priority: "0.75" },
  { path: "/priser", changefreq: "monthly", priority: "0.85" },
  { path: "/om", changefreq: "monthly", priority: "0.7" },
  { path: "/kontakt", changefreq: "monthly", priority: "0.8" },
  { path: "/blogg", changefreq: "weekly", priority: "0.9" },
  { path: "/metodik", changefreq: "monthly", priority: "0.7" },
  { path: "/webbyra-linkoping", changefreq: "monthly", priority: "0.75" },
  { path: "/redaktionell-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/integritetspolicy", changefreq: "yearly", priority: "0.3" },
];

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  })[character]);
}

function urlBlock({ loc, lastmod, changefreq, priority }) {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function buildUrlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(urlBlock).join("\n")}\n</urlset>\n`;
}

function buildIndex(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps.map((sitemap) => `  <sitemap>\n    <loc>${escapeXml(`${SITE_URL}/${sitemap.file}`)}</loc>\n    <lastmod>${sitemap.lastmod}</lastmod>\n  </sitemap>`).join("\n")}\n</sitemapindex>\n`;
}

function writeTo(directory, file, content) {
  const output = resolve(directory, file);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, content, "utf8");
}

function write(file, content) {
  writeTo(PUBLIC_DIR, file, content);
  if (existsSync(DIST_DIR)) writeTo(DIST_DIR, file, content);
}

function extractArticles() {
  const files = ["articlesData1.ts", "articlesData2.ts", "articlesData3.ts", "articlesData4.ts", "articlesData5.ts", "articlesData6.ts"];
  const articles = [];
  for (const file of files) {
    const source = resolve(ROOT, "src/lib", file);
    if (!existsSync(source)) continue;
    const text = readFileSync(source, "utf8");
    for (const match of text.matchAll(/slug:\s*"([^"]+)"[\s\S]*?updatedDate:\s*"([^"]+)"/g)) {
      articles.push({
        loc: `${SITE_URL}/blogg/${match[1]}`,
        lastmod: match[2] || BUILD_DATE,
        changefreq: "monthly",
        priority: "0.8",
      });
    }
  }
  const seen = new Set();
  return articles.filter((article) => {
    if (seen.has(article.loc)) return false;
    seen.add(article.loc);
    return true;
  });
}

function main() {
  const pages = STATIC_ROUTES.map((route) => ({
    loc: `${SITE_URL}${route.path}`,
    lastmod: BUILD_DATE,
    changefreq: route.changefreq,
    priority: route.priority,
  }));
  const blog = extractArticles();
  write("sitemap-pages.xml", buildUrlset(pages));
  write("sitemap-blog.xml", buildUrlset(blog));
  write("sitemap.xml", buildIndex([
    { file: "sitemap-pages.xml", lastmod: BUILD_DATE },
    { file: "sitemap-blog.xml", lastmod: BUILD_DATE },
  ]));
  console.log(`Generated sitemap index with ${pages.length} pages and ${blog.length} blog posts.`);
}

main();

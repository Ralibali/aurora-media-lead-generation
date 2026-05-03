#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC_DIR = resolve(ROOT, 'public');
const SITE_URL = 'https://auroramedia.se';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/ai-konsult-sverige', changefreq: 'weekly', priority: '0.95' },
  { path: '/tjanster', changefreq: 'weekly', priority: '0.9' },
  { path: '/tjanster/hemsidor', changefreq: 'monthly', priority: '0.85' },
  { path: '/tjanster/ehandel', changefreq: 'monthly', priority: '0.85' },
  { path: '/tjanster/mobilapp', changefreq: 'monthly', priority: '0.85' },
  { path: '/tjanster/seo', changefreq: 'monthly', priority: '0.85' },
  { path: '/tjanster/google-ads', changefreq: 'monthly', priority: '0.8' },
  { path: '/tjanster/meta-ads', changefreq: 'monthly', priority: '0.8' },
  { path: '/tjanster/content', changefreq: 'monthly', priority: '0.8' },
  { path: '/tjanster/grafisk-profil', changefreq: 'monthly', priority: '0.75' },
  { path: '/tjanster/fotografering', changefreq: 'monthly', priority: '0.75' },
  { path: '/arbete', changefreq: 'monthly', priority: '0.85' },
  { path: '/priser', changefreq: 'monthly', priority: '0.85' },
  { path: '/om', changefreq: 'monthly', priority: '0.75' },
  { path: '/kontakt', changefreq: 'monthly', priority: '0.8' },
  { path: '/blogg', changefreq: 'weekly', priority: '0.9' },
  { path: '/metodik', changefreq: 'monthly', priority: '0.75' },
  { path: '/webbyra-linkoping', changefreq: 'monthly', priority: '0.8' },
  { path: '/redaktionell-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/integritetspolicy', changefreq: 'yearly', priority: '0.3' },
];

const CITY_ROUTES = [
  'linkoping',
  'norrkoping',
  'stockholm',
  'goteborg',
  'malmo',
  'uppsala',
  'orebro',
  'jonkoping',
];

for (const slug of CITY_ROUTES) {
  STATIC_ROUTES.push({ path: `/saas-utveckling-${slug}`, changefreq: 'monthly', priority: '0.7' });
  STATIC_ROUTES.push({ path: `/ai-byra-${slug}`, changefreq: 'monthly', priority: '0.7' });
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  }[c]));
}

function urlBlock({ loc, lastmod, changefreq, priority }) {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function buildUrlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(urlBlock).join('\n')}\n</urlset>\n`;
}

function buildIndex(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps
    .map((s) => `  <sitemap>\n    <loc>${escapeXml(`${SITE_URL}/${s.file}`)}</loc>\n    <lastmod>${s.lastmod}</lastmod>\n  </sitemap>`)
    .join('\n')}\n</sitemapindex>\n`;
}

function write(file, content) {
  const out = resolve(PUBLIC_DIR, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, content, 'utf8');
}

function extractArticles() {
  const files = ['articlesData1.ts', 'articlesData2.ts', 'articlesData3.ts', 'articlesData4.ts'];
  const articles = [];

  for (const file of files) {
    const path = resolve(ROOT, 'src/lib', file);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, 'utf8');
    const blocks = text.matchAll(/slug:\s*"([^"]+)"[\s\S]*?updatedDate:\s*"([^"]+)"/g);
    for (const match of blocks) {
      articles.push({
        loc: `${SITE_URL}/blogg/${match[1]}`,
        lastmod: match[2] || BUILD_DATE,
        changefreq: 'monthly',
        priority: '0.8',
      });
    }
  }

  const seen = new Set();
  return articles.filter((a) => {
    if (seen.has(a.loc)) return false;
    seen.add(a.loc);
    return true;
  });
}

function main() {
  const pages = STATIC_ROUTES.map((r) => ({
    loc: `${SITE_URL}${r.path}`,
    lastmod: BUILD_DATE,
    changefreq: r.changefreq,
    priority: r.priority,
  }));
  const blog = extractArticles();

  write('sitemap-pages.xml', buildUrlset(pages));
  write('sitemap-blog.xml', buildUrlset(blog));
  write('sitemap.xml', buildIndex([
    { file: 'sitemap-pages.xml', lastmod: BUILD_DATE },
    { file: 'sitemap-blog.xml', lastmod: BUILD_DATE },
  ]));

  console.log(`Generated sitemap index with ${pages.length} pages and ${blog.length} blog posts.`);
}

main();

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { renderEditorialArticle } from '../../scripts/editorial-html.mjs';
import { buildBlogIndexBody, loadArticles } from '../../scripts/article-catalog.mjs';
import articles from '../content/editorial/articles.json';
import { articles as siteArticles } from '../lib/articles';
it('renders complete editorial content and next-step links without executable text', () => {
  const article = articles[0];
  const html = renderEditorialArticle(article);
  expect(html).toContain(article.sections.at(-1)!.heading);
  expect((html.match(/<h1/g) || []).length).toBe(1);
  expect(html).toContain('href="/blogg"');
  expect(html).toContain('AI-assisterad originalguide');
  const unsafe = renderEditorialArticle({ ...article, intro: '<script>alert(1)</script>', sections: [] });
  expect(unsafe).not.toContain('<script>');
  expect(unsafe).toContain('&lt;script&gt;');
});

it('sitemap-blog includes every editorial slug from articles.json', () => {
  const xml = readFileSync(resolve(__dirname, '../../public/sitemap-blog.xml'), 'utf8');
  for (const article of articles) {
    expect(xml).toContain(`https://auroramedia.se/blogg/${article.slug}`);
  }
});

it('runtime blog catalog includes every editorial slug from articles.json', () => {
  const slugs = new Set(siteArticles.map((article) => article.slug));
  for (const article of articles) {
    expect(slugs.has(article.slug)).toBe(true);
  }
});

it('shared catalog and blog index HTML include every editorial slug', () => {
  const catalog = loadArticles();
  const indexHtml = buildBlogIndexBody(catalog);
  for (const article of articles) {
    expect(catalog.some((item) => item.slug === article.slug)).toBe(true);
    expect(indexHtml).toContain(`/blogg/${article.slug}`);
  }
});

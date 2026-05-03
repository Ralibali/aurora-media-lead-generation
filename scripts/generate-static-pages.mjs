#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://auroramedia.se';
const SITE_NAME = 'Aurora Media AB';
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const SRC_LIB_DIR = path.resolve(process.cwd(), 'src/lib');

const STATIC_PAGES = [
  {
    route: '/',
    title: 'Aurora Media AB – AI-driven mjukvarubyrå',
    description: 'Aurora Media bygger SaaS, appar, AI-lösningar och skräddarsydda system för svenska bolag med fast pris och kod du äger.',
    body: 'Aurora Media AB är en AI-driven mjukvarubyrå i Linköping. Vi bygger SaaS, MVP:er, interna system, webbappar, mobilappar, e-handel, integrationer och automatiseringar för svenska företag.',
  },
  {
    route: '/ai-konsult-sverige',
    title: 'AI-konsult Sverige – från strategi till färdig produkt',
    description: 'Aurora Media är AI-konsulten som bygger produkten: SaaS, interna appar och AI-automationer med fast pris, snabb leverans och kod du äger.',
    body: 'Aurora Media är en AI-konsult och AI-builder i Sverige som bygger SaaS, interna appar och AI-automationer. Vi hjälper företag gå från AI-strategi till fungerande produkt med fast pris, snabb leverans, modern stack och kod kunden äger. Mindre workshop. Mer fungerande produkt.',
  },
  {
    route: '/tjanster',
    title: 'Tjänster – SaaS, AI, appar och webb',
    description: 'Utforska Aurora Medias tjänster inom SaaS-utveckling, AI-integration, webbappar, mobilappar, SEO, Google Ads, Meta Ads och content.',
    body: 'Aurora Media hjälper företag med SaaS-utveckling, AI-system, automatisering, integrationer, hemsidor, e-handel, mobilappar, SEO, annonsering och content.',
  },
  { route: '/tjanster/hemsidor', title: 'Hemsidor som konverterar', description: 'Moderna hemsidor med snabb laddning, stark SEO och tydlig konvertering.', body: 'Aurora Media bygger moderna hemsidor för företag som vill ha bättre synlighet, fler leads och en tydligare digital närvaro.' },
  { route: '/tjanster/ehandel', title: 'E-handel för svenska företag', description: 'Skalbar e-handel med smart UX, betalningar, integrationer och mätbar tillväxt.', body: 'Aurora Media bygger e-handelslösningar med fokus på användarupplevelse, betalflöden, integrationer och lönsam tillväxt.' },
  { route: '/tjanster/mobilapp', title: 'Mobilappar och webbappar', description: 'Mobilappar och webbappar byggda med modern teknik, snabb leverans och tydlig affärsnytta.', body: 'Aurora Media bygger mobilappar och webbappar för företag som behöver digitala produkter som fungerar i verkligheten.' },
  { route: '/tjanster/seo', title: 'SEO för svenska företag', description: 'Teknisk SEO, innehåll, struktur och synlighet för företag som vill växa organiskt.', body: 'Aurora Media arbetar med teknisk SEO, innehållsstrategi, internlänkning, strukturerad data och konverterande landningssidor.' },
  { route: '/tjanster/google-ads', title: 'Google Ads', description: 'Datadriven Google Ads med fokus på leads, konvertering och lönsamhet.', body: 'Aurora Media hjälper företag med Google Ads, sökannonsering, kampanjstruktur och löpande optimering.' },
  { route: '/tjanster/meta-ads', title: 'Meta Ads', description: 'Annonsering på Facebook och Instagram med rätt målgrupp, budskap och konvertering.', body: 'Aurora Media skapar och optimerar Meta Ads-kampanjer för svenska företag.' },
  { route: '/arbete', title: 'Case och projekt', description: 'Se projekt, SaaS-lösningar och digitala system byggda av Aurora Media.', body: 'Aurora Media bygger egna SaaS-produkter och kundprojekt inom AI, transport, marknadsplatser och interna system.' },
  { route: '/priser', title: 'Priser för SaaS, prototyp och MVP', description: 'Fast pris från 14 900 kr för prototyp, 34 900 kr för MVP och 89 000 kr för skalbar SaaS.', body: 'Aurora Media erbjuder fast pris för prototyper, MVP:er och skalbara SaaS-projekt. Du vet kostnaden innan projektet börjar.' },
  { route: '/om', title: 'Om Aurora Media', description: 'Aurora Media AB drivs av Christoffer Holstensson i Linköping och bygger AI-driven mjukvara för svenska bolag.', body: 'Aurora Media AB är en AI-driven mjukvarubyrå från Linköping grundad av Christoffer Holstensson. Bolaget bygger SaaS, appar och skräddarsydda system.' },
  { route: '/kontakt', title: 'Kontakt', description: 'Kontakta Aurora Media för SaaS, AI, webbappar, integrationer och digital produktutveckling.', body: 'Kontakta Aurora Media AB via info@auroramedia.se för att diskutera SaaS, MVP, AI-system, webbappar och digital utveckling.' },
  { route: '/blogg', title: 'Blogg om AI-kodning och SaaS-utveckling', description: 'Guider om AI-kodning, SaaS, MVP, Lovable, Bolt, Cursor, SEO och digital produktutveckling.', body: 'Aurora Media publicerar guider om AI-kodning, SaaS-utveckling, MVP, prototyper, Lovable, Bolt, Cursor och modern digital produktutveckling.' },
  { route: '/metodik', title: 'Metodik', description: 'Så arbetar Aurora Media med strategi, design, AI-kodning, utveckling och lansering.', body: 'Aurora Media arbetar snabbt och strukturerat med tydlig scope, fast pris, AI-assisterad utveckling, testning och överlämning av kod.' },
  { route: '/webbyra-linkoping', title: 'Webbyrå i Linköping', description: 'Aurora Media är en webbyrå och mjukvarupartner i Linköping för SaaS, AI och webb.', body: 'Aurora Media är en webbyrå i Linköping som bygger hemsidor, SaaS, AI-lösningar, integrationer och digitala produkter för svenska företag.' },
  { route: '/integritetspolicy', title: 'Integritetspolicy', description: 'Aurora Medias integritetspolicy och information om personuppgifter.', body: 'Aurora Media AB behandlar personuppgifter enligt GDPR och svensk dataskyddslagstiftning.' },
  { route: '/redaktionell-policy', title: 'Redaktionell policy', description: 'Aurora Medias redaktionella principer för artiklar, guider och innehåll.', body: 'Aurora Media publicerar artiklar och guider med fokus på praktisk erfarenhet, transparens och uppdaterad information.' },
];

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizePath(route) {
  if (route === '/') return '/';
  return route.replace(/\/+$/, '');
}

function fullUrl(route) {
  return `${SITE_URL}${normalizePath(route)}`;
}

function buildPageSchema({ route, title, description }) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: fullUrl(route),
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
        ...(route === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: title, item: fullUrl(route) }]),
      ],
    },
  ];
}

function buildArticleSchema(article) {
  const url = fullUrl(`/blogg/${article.slug}`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.metaTitle || article.title,
      description: article.metaDesc || article.intro,
      image: [`${SITE_URL}/og-image-sv.jpg`],
      datePublished: article.publishedDate,
      dateModified: article.updatedDate || article.publishedDate,
      author: { '@type': 'Person', name: 'Christoffer Holstensson' },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      articleSection: article.category,
      keywords: article.keyword,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hem', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Blogg', item: `${SITE_URL}/blogg` },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    },
    ...(article.faq?.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }]
      : []),
  ];
}

function injectHtml({ template, route, title, description, ogType = 'website', jsonLd = [], body }) {
  const canonical = fullUrl(route);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`);

  if (/<meta\s+name="description"[^>]*>/.test(html)) {
    html = html.replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  } else {
    html = html.replace('</head>', `    <meta name="description" content="${escapeHtml(description)}" />\n  </head>`);
  }

  const headTags = [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:image" content="${SITE_URL}/og-image-sv.jpg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="sv_SE" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og-image-sv.jpg" />`,
    ...jsonLd.map((schema) => `<script type="application/ld+json">${escapeJsonLd(schema)}</script>`),
  ];

  html = html
    .replace(/<link\s+rel="canonical"[^>]*>\s*/g, '')
    .replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/g, '')
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/g, '')
    .replace(/<meta\s+name="robots"[^>]*>\s*/g, '');

  html = html.replace('</head>', `    ${headTags.join('\n    ')}\n  </head>`);

  const seoBody = `\n    <div id="seo-content" aria-hidden="true" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden">\n      ${body}\n    </div>`;
  html = html.replace('<div id="root"></div>', `${seoBody}\n    <div id="root"></div>`);

  return html;
}

function routeToOutput(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html');
  return path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');
}

async function writeRoute(route, html) {
  const out = routeToOutput(route);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, html, 'utf8');
}

function extractString(block, key) {
  const re = new RegExp(`${key}:\\s*\"([\\s\\S]*?)\"`, 'm');
  const m = block.match(re);
  return m ? m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
}

function splitArticleBlocks(text) {
  const blocks = [];
  const marker = /\n\s*\{\s*\n\s*slug:\s*"/g;
  const starts = [];
  let m;
  while ((m = marker.exec(text))) starts.push(m.index + 1);
  for (let i = 0; i < starts.length; i++) {
    blocks.push(text.slice(starts[i], starts[i + 1] || text.lastIndexOf('\n];')));
  }
  return blocks;
}

function extractSections(block) {
  const sections = [];
  const re = /heading:\s*"([\s\S]*?)"[\s\S]*?content:\s*(?:`([\s\S]*?)`|"([\s\S]*?)")/g;
  let m;
  while ((m = re.exec(block))) {
    const heading = (m[1] || '').replace(/\\"/g, '"');
    const content = (m[2] || m[3] || '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
    if (heading && content) sections.push({ heading, content });
  }
  return sections;
}

function extractFaq(block) {
  const faq = [];
  const re = /q:\s*"([\s\S]*?)"[\s\S]*?a:\s*"([\s\S]*?)"/g;
  let m;
  while ((m = re.exec(block))) {
    faq.push({ q: m[1].replace(/\\"/g, '"'), a: m[2].replace(/\\"/g, '"') });
  }
  return faq;
}

function extractArticles() {
  const files = ['articlesData1.ts', 'articlesData2.ts', 'articlesData3.ts', 'articlesData4.ts'];
  const articles = [];

  for (const file of files) {
    const filePath = path.join(SRC_LIB_DIR, file);
    if (!existsSync(filePath)) continue;
    const text = readFileSync(filePath, 'utf8');
    for (const block of splitArticleBlocks(text)) {
      const slug = extractString(block, 'slug');
      if (!slug) continue;
      const article = {
        slug,
        keyword: extractString(block, 'keyword'),
        category: extractString(block, 'category'),
        title: extractString(block, 'title'),
        metaTitle: extractString(block, 'metaTitle'),
        metaDesc: extractString(block, 'metaDesc'),
        publishedDate: extractString(block, 'publishedDate'),
        updatedDate: extractString(block, 'updatedDate'),
        intro: extractString(block, 'intro'),
        sections: extractSections(block),
        faq: extractFaq(block),
      };
      articles.push(article);
    }
  }

  const seen = new Set();
  return articles.filter((a) => {
    if (seen.has(a.slug)) return false;
    seen.add(a.slug);
    return true;
  });
}

function buildArticleBody(article) {
  const sections = article.sections
    .map((s) => `<section><h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(stripTags(s.content))}</p></section>`)
    .join('\n');
  const faq = article.faq?.length
    ? `<section><h2>Vanliga frågor</h2>${article.faq.map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`).join('\n')}</section>`
    : '';
  return `<article><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.intro)}</p>${sections}${faq}</article>`;
}

async function main() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  const template = await fs.readFile(templatePath, 'utf8');

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    email: 'info@auroramedia.se',
    address: { '@type': 'PostalAddress', addressLocality: 'Linköping', addressCountry: 'SE' },
    sameAs: ['https://github.com/Ralibali'],
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'sv-SE',
  };

  for (const page of STATIC_PAGES) {
    const html = injectHtml({
      template,
      route: page.route,
      title: page.title,
      description: page.description,
      jsonLd: [organizationSchema, websiteSchema, ...buildPageSchema(page)],
      body: `<main><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.body)}</p></main>`,
    });
    await writeRoute(page.route, html);
  }

  for (const article of extractArticles()) {
    const route = `/blogg/${article.slug}`;
    const html = injectHtml({
      template,
      route,
      title: article.metaTitle || article.title,
      description: article.metaDesc || article.intro,
      ogType: 'article',
      jsonLd: [organizationSchema, websiteSchema, ...buildArticleSchema(article)],
      body: buildArticleBody(article),
    });
    await writeRoute(route, html);
  }

  console.log('Generated static SEO pages for Aurora Media.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

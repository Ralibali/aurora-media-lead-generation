#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { buildInstantPreview, setInstantPreview } from './instant-preview.mjs';

const SITE_URL = 'https://auroramedia.se';
const SITE_NAME = 'Aurora Media AB';
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const SRC_LIB_DIR = path.resolve(process.cwd(), 'src/lib');

const STATIC_PAGES = [
  {
    route: '/',
    title: 'Aurora Media – AI-byrå i Linköping | SaaS & AI från 4 900 kr',
    description: 'AI-byrå i Linköping. Vi bygger SaaS, AI-automationer och interna verktyg med fast pris från 4 900 kr. Leverans på veckor, kod du äger.',
    body: 'Aurora Media AB är en AI-byrå i Linköping. Vi bygger SaaS, MVP:er, interna system, webbappar, mobilappar, e-handel, integrationer och AI-automationer för svenska företag.',
    hreflang: true,
  },
];

function readAiKontoretStatus() {
  try {
    const src = readFileSync(path.resolve(process.cwd(), 'src/config/aiKontoret.ts'), 'utf8');
    const m = src.match(/PRODUCT_STATUS:\s*"prelaunch"\s*\|\s*"live"\s*=\s*"(prelaunch|live)"/);
    return m ? m[1] : 'prelaunch';
  } catch {
    return 'prelaunch';
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildPageSchema({ route, title, description }) {
  return [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: `${SITE_URL}${route}` }];
}

async function main() {
  console.log(`Generated ${STATIC_PAGES.length} static pages`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

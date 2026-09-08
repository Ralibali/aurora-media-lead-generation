/** Local, repeatable browser checks. All backend requests are intercepted; no mail or leads are sent. */
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const base = process.env.AURORA_TEST_URL || 'http://127.0.0.1:4188';
const out = path.resolve(process.env.AURORA_TEST_OUTPUT || '../outputs/browser');
const browser = await chromium.launch({ executablePath: process.env.AURORA_TEST_CHROME, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
await mkdir(out, { recursive: true });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const report = { checks: [], routes: [], errors: [] };
let contactReceipt = { ok: true };
let submittedContact;
let submittedMap;
let expired = false;
let privateCalls = 0;
const sampleProcess = { position: 0, process_name: 'Sammanställ veckorapport', frequency: 'weekly', weekly_time: '3-5', systems: 'Excel', rule_based: 'yes', data_available: 'yes', business_value: 'high', score: 13, potential: 'Direkt AI-case', recommended_solution: 'Dashboard och AI-rapportering', next_step: 'Granska ett dataexempel och avgränsa en pilot.', saved_hours_per_week: 3.4 };
const result = { ok: true, leadId: 'test-map-only', totalScore: 13, avg: 13, total_potential: 'Mycket hög', processes: [sampleProcess], top3: [sampleProcess], totalSavedPerWeek: 3.4, totalSavedPerYear: 156, ai_analysis: null, pain_areas: ['Administration'], meta: { company_name: 'Exempelbolaget – DEMONSTRATION', contact_name: 'Testperson', email: '', industry: 'Transport', employee_count: '1–5' } };
const leads = [
  { id: 'test-new', source: 'genomlysning', name: 'Testperson', email: 'test@example.test', company: 'Exempelbolaget', status: 'ny', created_at: '2026-09-01T10:00:00Z', followup_at: null, notes: '', message: 'Test av kundflödet', phone: null },
  { id: 'test-due', source: 'kontakt', name: 'Test Uppföljning', email: 'test2@example.test', company: 'Demoföretaget', status: 'kontaktad', created_at: '2026-09-01T10:00:00Z', followup_at: '2026-09-01', notes: '', message: 'En lokal testförfrågan', phone: null },
];
await context.route(url => url.hostname.endsWith('.supabase.co'), async route => {
  const req = route.request();
  if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } });
  const fn = new URL(req.url()).pathname.split('/').pop();
  const body = req.postDataJSON();
  let data = {}; let status = 200;
  if (fn === 'send-contact-email') { submittedContact = body; data = contactReceipt; }
  else if (fn === 'submit-ai-map') { submittedMap = body; data = result; }
  else if (fn === 'get-ai-map-result') data = result;
  else if (fn === 'list-leads' || fn?.startsWith('admin-')) {
    privateCalls++;
    if (expired || req.headers().authorization !== 'Bearer local-test-password') { status = 401; data = { error: 'Unauthorized' }; }
    else if (fn === 'list-leads') data = { leads, stats: { total: 2, new_this_week: 0, unhandled: 1, meetings_booked: 0, karta_to_booking_pct: 0 } };
    else if (fn === 'admin-overview') data = { overview: { leads_total: 2, leads_karta: 0, leads_kontakt: 1, leads_genomlysning: 1, leads_7d: 0, leads_30d: 2, cta_clicks_30d: 0, faq_searches_30d: 0, faq_zero_results_30d: 0, ai_karta_clicks_30d: 0 }, recent_leads: [], analytics: { top_cta: [], top_pages: [], top_faq_queries: [], faq_cta: [], ai_karta_top: [] } };
  }
  await route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(data) });
});
page.on('pageerror', error => report.errors.push({ url: page.url(), message: error.message }));
const check = name => { report.checks.push(name); console.log('PASS', name); };
try {
  await page.goto(base); await page.getByRole('heading', { level: 1 }).waitFor();
  await page.getByRole('link', { name: /Från bokning till gästupplevelse/ }).waitFor();
  await page.getByRole('button', { name: 'Kundkontakt', exact: true }).click();
  await page.getByRole('heading', { name: 'Ge kunden ett tydligt nästa steg.' }).waitFor();
  await page.screenshot({ path: path.join(out, 'home-desktop.png'), fullPage: true });
  check('Homepage use cases and real portfolio link');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /Öppna meny/ }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Gratis AI-karta', exact: true }).click();
  await page.waitForURL('**/ai-karta');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  check('Mobile menu opens, navigates and closes');
  await page.goto(base);
  await page.getByRole('button', { name: 'Prata om ert projekt', exact: true }).click();
  await page.getByLabel('Namn *', { exact: true }).fill('Alex');
  await page.getByLabel('E-post *', { exact: true }).fill('test@example.test');
  await page.getByLabel('Beskriv projektet kort *').fill('Vi vill få hjälp att samla rapporter i ett eget system.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Skicka', exact: true }).click();
  await page.getByText('Kunde inte skicka just nu', { exact: true }).waitFor();
  assert.equal(await page.getByText('Tack!', { exact: true }).count(), 0);
  assert.equal(submittedContact.paket, 'Vet inte');
  contactReceipt = { ok: true, leadId: 'local-test-contact' };
  await page.getByRole('button', { name: 'Skicka', exact: true }).click();
  await page.getByText('Tack!', { exact: true }).waitFor();
  check('Contact without a package saves; unconfirmed server receipt never shows success');
  await page.goto(base + '/ai-karta/start?bransch=transport');
  await page.getByRole('button', { name: 'Administration', exact: true }).click();
  await page.getByRole('button', { name: 'Fortsätt →', exact: true }).click();
  await page.getByLabel('Namn på arbetsuppgift 1', { exact: true }).fill('Sammanställ veckorapport');
  await page.getByRole('button', { name: 'Veckovis', exact: true }).click();
  await page.getByRole('button', { name: '3–5 h/vecka', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Fortsätt', exact: true }).click();
  assert.equal(await page.getByLabel('Namn på arbetsuppgift 1', { exact: true }).inputValue(), 'Sammanställ veckorapport');
  await page.getByRole('button', { name: 'Fortsätt →', exact: true }).click();
  await page.getByLabel('Företagsnamn', { exact: true }).fill('Exempelbolaget – DEMONSTRATION');
  await page.getByRole('button', { name: '1–5', exact: true }).click();
  await page.getByLabel('Kontaktperson', { exact: true }).fill('Testperson');
  await page.getByLabel('E-post', { exact: true }).fill('test@example.test');
  await page.getByRole('checkbox').check();
  await page.screenshot({ path: path.join(out, 'wizard-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: /Skapa.*AI-karta|Visa.*AI-karta|Få.*AI-karta/ }).click();
  await page.waitForURL('**/ai-karta/resultat');
  await page.getByRole('button', { name: /Ladda ner AI-kartan som PDF/ }).waitFor();
  assert.equal(submittedMap.processes[0].process_name, sampleProcess.process_name);
  await page.screenshot({ path: path.join(out, 'result-mobile.png'), fullPage: true });
  const downloadWait = page.waitForEvent('download');
  await page.getByRole('button', { name: /Ladda ner AI-kartan som PDF/ }).click();
  await (await downloadWait).saveAs(path.join(out, 'ai-karta-demo.pdf'));
  check('AI map: all three steps, reload/resume, submitted data, result and PDF download');
  await context.clearCookies();
  await page.evaluate(() => sessionStorage.clear());
  const before = privateCalls;
  for (const route of ['/admin', '/admin/leads', '/admin/content', '/admin/seo', '/admin/email', '/admin/prospektering', '/admin/ai-kontoret', '/admin/text-generator', '/admin/faq-rapport']) {
    await page.goto(base + route); await page.getByRole('heading', { name: 'Välkommen tillbaka.' }).waitFor();
  }
  assert.equal(privateCalls, before);
  check('Nine admin pages do not load private data before login');
  await page.goto(base + '/admin');
  await page.getByLabel('Lösenord', { exact: true }).fill('wrong-local-password');
  await page.getByRole('button', { name: 'Logga in', exact: true }).click();
  await page.getByRole('alert').getByText(/Lösenordet fungerar inte/).waitFor();
  await page.getByLabel('Lösenord', { exact: true }).fill('local-test-password');
  await page.getByRole('button', { name: 'Logga in', exact: true }).click();
  await page.getByText('Demoföretaget', { exact: true }).first().waitFor();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: path.join(out, 'admin-dashboard.png'), fullPage: true });
  await page.goto(base + '/admin/leads?view=followup&lead=test-due');
  await page.getByText('Test Uppföljning', { exact: true }).first().waitFor();
  await page.screenshot({ path: path.join(out, 'admin-leads.png'), fullPage: true });
  check('Admin login without reload, followup queue, lead filter and direct detail link');
  expired = true;
  await page.goto(base + '/admin');
  await page.getByRole('heading', { name: 'Välkommen tillbaka.' }).waitFor();
  assert.equal(await page.evaluate(() => sessionStorage.getItem('faq_analytics_pwd')), null);
  check('Expired admin password is cleared and protected content unmounts');
  // Visit every concrete public route, plus representative dynamic cases, articles and cities.
  const app = await readFile('src/App.tsx', 'utf8');
  const routes = [...new Set([...app.matchAll(/<Route path="([^"]+)"/g)].map(m => m[1]).filter(p => p.startsWith('/') && !p.includes(':') && !p.startsWith('/admin') && p !== '/v5'))];
  const sitemap = await readFile('dist/sitemap-pages.xml', 'utf8');
  const blogmap = await readFile('dist/sitemap-blog.xml', 'utf8');
  for (const match of (sitemap + blogmap).matchAll(/<loc>([^<]+)<\/loc>/g)) { const route = new URL(match[1]).pathname; if (!routes.includes(route)) routes.push(route); }
  routes.push('/saknad-testsida');
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      report.currentRoute = { route, viewport: viewport.width };
      await page.goto(base + route);
      if (route !== '/ai-karta/resultat') await page.locator('.vk-menu-trigger').waitFor({ state: 'attached' });
      else await page.getByRole('button', { name: /Starta AI-kartan/ }).waitFor();
      await page.locator('h1').first().waitFor({ timeout: 10000 });
      await page.evaluate(() => document.fonts.ready);
      const details = await page.evaluate(() => ({ title: document.title, h1: [...document.querySelectorAll('h1')].map(n => n.textContent), width: innerWidth, scroll: document.documentElement.scrollWidth, brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')) }));
      report.routes.push({ route, viewport: viewport.width, ...details });
    }
  }
  check(`Public route review: ${report.routes.length} desktop/mobile checks`);
  assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
  const overflows = report.routes.filter(r => r.scroll > r.width + 2);
  assert.equal(overflows.length, 0, JSON.stringify(overflows));
} catch (error) {
  report.failure = error.stack;
  await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true });
  throw error;
} finally {
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}

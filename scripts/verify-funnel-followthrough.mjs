/** Every backend request is mocked. This check cannot create leads or send mail. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.AURORA_TEST_URL || 'http://127.0.0.1:4188';
const out = '../outputs/followthrough-browser';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.AURORA_TEST_CHROME, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const errors = []; const checks = []; const updates = []; let contact; let saveMode = 'ok';
const lead = { id: '00000000-0000-4000-8000-000000000001', source: 'kontakt', name: 'Testperson', company: 'Testbolaget', email: 'test@example.test', message: 'Lokal testförfrågan', notes: 'Sparat sedan tidigare', status: 'ny', followup_at: null, created_at: '2026-09-01T12:00:00Z' };
await context.route(url => url.hostname.endsWith('.supabase.co'), async route => {
  const request = route.request();
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 200, headers });
  const fn = new URL(request.url()).pathname.split('/').pop();
  const body = request.postDataJSON(); let data = {}; let status = 200;
  if (fn === 'send-contact-email') { contact = body; data = { ok: true, leadId: 'local-test-receipt' }; }
  else if (fn === 'list-leads') {
    if (request.headers().authorization !== 'Bearer local-test-password') { status = 401; data = { error: 'Unauthorized' }; }
    else if (body.action === 'update') {
      updates.push(body);
      if (saveMode === 'fail') { status = 503; data = { error: 'Local test failure' }; }
      else if (saveMode === 'unconfirmed') data = { ok: true };
      else {
        await new Promise(resolve => setTimeout(resolve, 150));
        for (const key of ['status', 'notes', 'followup_at']) if (key in body) lead[key] = body[key];
        data = { ok: true, lead: { id: lead.id, status: lead.status, notes: lead.notes, followup_at: lead.followup_at } };
      }
    } else data = { leads: [lead], stats: { total: 1, new_this_week: 0, unhandled: 1, meetings_booked: 0, karta_to_booking_pct: 0 } };
  }
  await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(data) });
});
page.on('pageerror', error => errors.push(error.message));
const check = message => { checks.push(message); console.log('PASS', message); };
try {
  await page.goto(base + '/verktyg/app-prisraknare');
  await page.getByRole('button', { name: /En första version för användare/ }).waitFor();
  assert.match(await page.locator('main').innerText(), /från 11 900 kr/);
  assert.match(await page.locator('main').innerText(), /3–5 veckor/);
  await page.getByRole('button', { name: /En prototyp att testa/ }).click();
  assert.match(await page.locator('main').innerText(), /från 4 900 kr/);
  await page.getByRole('button', { name: 'iOS och Android', exact: true }).click();
  await page.getByText('Offert efter genomgång', { exact: true }).waitFor();
  assert.doesNotMatch(await page.locator('main').innerText(), /89 000|buggfri/);
  await page.getByRole('button', { name: 'Webb', exact: true }).click();
  await page.getByRole('button', { name: /En första version för användare/ }).click();
  const goal = 'Vi vill samla kundernas förfrågningar och följa upp varje beställning i samma system. '.repeat(9).trim();
  await page.getByLabel('Vilket arbetsflöde ska bli bättre?').fill(goal);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: /PDF/ }).first().click();
  const download = await downloadEvent; await download.saveAs(out + '/projektunderlag.pdf');
  await page.getByRole('button', { name: /Få offert på den här lösningen/ }).click();
  const form = page.getByRole('dialog');
  assert.equal(await form.locator('#message').inputValue(), goal);
  await form.getByLabel('Namn', { exact: false }).fill('Test Person');
  await form.getByLabel('E-post', { exact: false }).fill('test@example.test');
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'Skicka', exact: true }).click();
  await form.getByText('Tack!', { exact: true }).waitFor();
  assert.ok(contact.internalNote.length > 500);
  assert.ok(contact.internalNote.includes(goal));
  assert.equal(contact.message, goal);
  check('Published package references, mobile quote path, PDF, and full tool context survive contact submission');

  await page.goto(base + '/admin/leads?lead=' + lead.id);
  await page.getByLabel('Lösenord').fill('local-test-password');
  await page.getByRole('button', { name: /Logga in/ }).click();
  let drawer = page.getByRole('dialog', { name: 'Testperson', exact: true });
  await drawer.waitFor();
  const draft = 'Nästa steg: stäm av orderflödet med ansvarig och boka en genomgång.';
  await drawer.locator('textarea').fill(draft);
  await drawer.getByRole('button', { name: 'Stäng', exact: true }).click();
  await drawer.getByText('Du har osparade anteckningar', { exact: true }).waitFor();
  assert.equal(updates.length, 0);
  await drawer.getByRole('button', { name: 'Fortsätt redigera' }).click();
  saveMode = 'fail';
  await drawer.getByRole('button', { name: 'Spara anteckning', exact: true }).click();
  await page.getByText(/HTTP 503/).waitFor();
  await drawer.getByRole('button', { name: 'Spara anteckning', exact: true }).waitFor();
  assert.equal(await drawer.locator('textarea').inputValue(), draft);
  assert.equal(lead.notes, 'Sparat sedan tidigare');
  saveMode = 'unconfirmed';
  await drawer.getByRole('button', { name: 'Spara anteckning', exact: true }).click();
  await page.getByText('Servern bekräftade inte ändringen.', { exact: true }).waitFor();
  assert.equal(lead.notes, 'Sparat sedan tidigare');
  saveMode = 'ok';
  await drawer.getByRole('button', { name: 'Spara anteckning', exact: true }).click();
  await drawer.getByRole('status').getByText('Sparat', { exact: true }).waitFor();
  assert.equal(lead.notes, draft);
  await drawer.locator('select').selectOption('kontaktad');
  await drawer.locator('select').selectOption('offert_skickad');
  await page.waitForFunction(() => document.querySelector('[role="dialog"] select')?.value === 'offert_skickad');
  assert.equal(lead.status, 'offert_skickad');
  assert.match(await page.getByText('Obehandlade', { exact: true }).locator('..').innerText(), /Obehandlade\s+0/);
  assert.deepEqual(updates.filter(item => item.status).map(item => item.status), ['kontaktad', 'offert_skickad']);
  await drawer.screenshot({ path: out + '/admin-saved.png' });
  await drawer.getByRole('button', { name: 'Stäng', exact: true }).click();
  await page.reload();
  drawer = page.getByRole('dialog', { name: 'Testperson', exact: true }); await drawer.waitFor();
  assert.equal(await drawer.locator('textarea').inputValue(), draft);
  check('Admin preserves unsaved notes, rejects failed/unconfirmed receipts, saves in order and survives reload');

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/priser', '/tjanster', '/saas-utveckling-stockholm', '/ai-byra-linkoping', '/verktyg/app-prisraknare', '/en']) {
      await page.goto(base + route);
      await page.locator('.vk-menu-trigger').waitFor({ state: 'attached' });
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('h1').count(), 1, route);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), route + ' overflow');
      if (route === '/verktyg/app-prisraknare') await page.screenshot({ path: out + `/price-${width}.png`, fullPage: true });
    }
  }
  check('Shared offers and calculator render on desktop and mobile without overflow');
  assert.deepEqual(errors, []);
  await writeFile(out + '/report.json', JSON.stringify({ checks, errors, success: true }, null, 2));
} catch (error) {
  await page.screenshot({ path: out + '/failure.png', fullPage: true });
  await writeFile(out + '/report.json', JSON.stringify({ checks, errors, failure: error.stack }, null, 2));
  throw error;
} finally { await browser.close(); }

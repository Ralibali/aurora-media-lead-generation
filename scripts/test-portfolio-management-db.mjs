import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
await db.exec(await readFile('supabase/migrations/20261001133956_portfolio_dashboard.sql', 'utf8'));
await db.exec(await readFile('supabase/migrations/20261005171402_portfolio_project_management.sql', 'utf8'));
const plan = { note: ' Private note ', nextAction: ' Follow up ', followupDate: '2026-10-06' };
const save = async (version, value = plan) => (await db.query(
  'select portfolio_update_management($1,$2,$3) result', ['alpha', version, JSON.stringify(value)],
)).rows[0].result;
for (const role of ['anon', 'authenticated']) {
  await db.exec(`set role ${role}`);
  await assert.rejects(() => save(0), /permission denied/);
  await db.exec('reset role');
}
await db.exec('set role service_role');
const metadata = { id: 'alpha', url: 'https://example.test', github: { fullName: 'owner/alpha' }, ga4Property: '1234' };
await db.query('insert into portfolio_projects(project_id,payload) values($1,$2)', ['alpha', JSON.stringify(metadata)]);
assert.deepEqual(await save(0), { note: 'Private note', nextAction: 'Follow up', followupDate: '2026-10-06', version: 1 });
await assert.rejects(() => save(0, { ...plan, note: 'Stale overwrite' }), /PORTFOLIO_VERSION_CONFLICT/);
await assert.rejects(() => save(1, { ...plan, url: 'https://untrusted.test' }), /PORTFOLIO_MANAGEMENT_INVALID/);
await assert.rejects(() => save(1, { ...plan, followupDate: '2026-02-30' }), /date\/time|PORTFOLIO_MANAGEMENT_INVALID/);
await assert.rejects(() => save(1, { ...plan, note: 'x'.repeat(2001) }), /PORTFOLIO_MANAGEMENT_INVALID/);
const payload = (await db.query("select payload from portfolio_projects where project_id='alpha'")).rows[0].payload;
assert.deepEqual(Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'management')), metadata);
assert.equal(payload.management.note, 'Private note');
assert.equal(payload.management.version, 1);
assert.equal((await save(1, { note: '', nextAction: '', followupDate: null })).version, 2);
await db.close();
console.log('Portfolio plans: role isolation, conflict protection, calendar validation and registry preservation verified.');

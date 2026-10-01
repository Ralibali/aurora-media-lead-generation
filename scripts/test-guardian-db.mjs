import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
await db.exec(await readFile('supabase/migrations/20260928065604_website_guardian.sql','utf8'));
await db.exec(await readFile('supabase/migrations/20261001084700_sitewatch_commercial_layer.sql','utf8'));
for (const role of ['anon','authenticated']) {
  await db.exec(`set role ${role}`);
  await assert.rejects(()=>db.query('select * from guardian_sites'),/permission denied/);
  await assert.rejects(()=>db.query('select * from guardian_checks'),/permission denied/);
  await db.exec('reset role');
}
await db.exec('set role service_role');
const created=(await db.query("insert into guardian_sites(name,url) values('Test','https://example.test') returning id,check_interval_minutes,last_notified_state")).rows[0];
assert.equal(created.check_interval_minutes,60);
assert.equal(created.last_notified_state,'none');
const site=created.id;
await assert.rejects(()=>db.query("update guardian_sites set check_interval_minutes=30 where id=$1",[site]),/guardian_sites_interval_check/);
await db.query("update guardian_sites set check_interval_minutes=15,notify_email='drift@example.test' where id=$1",[site]);
await db.query("insert into guardian_checks(site_id,slot,status) values($1,'2026-09-28T08:00:00Z','running')",[site]);
await assert.rejects(()=>db.query("insert into guardian_checks(site_id,slot,status) values($1,'2026-09-28T08:00:00Z','running')",[site]),/unique/);
await db.query("update guardian_checks set status='healthy' where site_id=$1",[site]);
assert.equal((await db.query('select status from guardian_checks')).rows[0].status,'healthy');
await db.close(); console.log('Guardian DB: browser roles denied, service persistence and duplicate run guard verified.');

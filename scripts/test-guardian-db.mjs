import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
await db.exec(await readFile('supabase/migrations/20260928065604_website_guardian.sql','utf8'));
for (const role of ['anon','authenticated']) {
  await db.exec(`set role ${role}`);
  await assert.rejects(()=>db.query('select * from guardian_sites'),/permission denied/);
  await assert.rejects(()=>db.query('select * from guardian_checks'),/permission denied/);
  await db.exec('reset role');
}
await db.exec('set role service_role');
const site=(await db.query("insert into guardian_sites(name,url) values('Test','https://example.test') returning id")).rows[0].id;
await db.query("insert into guardian_checks(site_id,slot,status) values($1,'2026-09-28T08:00:00Z','running')",[site]);
await assert.rejects(()=>db.query("insert into guardian_checks(site_id,slot,status) values($1,'2026-09-28T08:00:00Z','running')",[site]),/unique/);
await db.query("update guardian_checks set status='healthy' where site_id=$1",[site]);
assert.equal((await db.query('select status from guardian_checks')).rows[0].status,'healthy');
await db.close(); console.log('Guardian DB: browser roles denied, service persistence and duplicate run guard verified.');

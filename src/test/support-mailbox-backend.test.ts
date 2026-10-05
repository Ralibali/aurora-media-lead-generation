// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { sha256 } from '../../supabase/functions/_shared/support-validation';
const event = { event_id: '00000000-0000-0000-0000-000000000001', record_id: 'imap:42:10', revision: '1', event_type: 'upsert', record: { kind: 'email', title: 'Fixture subject', body: 'Fixture text', created_at: '2026-10-05T12:00:00Z' } };
const mailbox = { address: 'info@auroramedia.se', configured: true, enabled: true, last_error: null };
const lease = { lease_token: '00000000-0000-0000-0000-000000000002', password: 'PRIVATE_FIXTURE_PASSWORD', source_id: '00000000-0000-0000-0000-000000000003', source_hash: 'b'.repeat(64), uid_validity: '42', last_uid: 9 };
const batch = { events: [event], uid_validity: '42', last_uid: 10, initial_since: null, initial_through_uid: null, more: false };
async function handler(client: unknown, readMailbox = vi.fn().mockResolvedValue(batch)) {
  const path = resolve(__dirname, '../../supabase/functions/admin-support-mailbox/index.ts');
  const source = (await readFile(path, 'utf8'))
    .replace(/^import \{ createClient \} from [^\n]+;/m, 'const createClient = () => globalThis.__mailboxClient;')
    .replace(/^import \{ readMailbox \} from [^\n]+;/m, 'const readMailbox = globalThis.__mailboxRead;');
  const compiled = await build({ stdin: { contents: source, sourcefile: path, resolveDir: dirname(path), loader: 'ts' }, bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent' });
  let serve: (request: Request) => Promise<Response>;
  vi.stubGlobal('__mailboxClient', client); vi.stubGlobal('__mailboxRead', readMailbox);
  vi.stubGlobal('Deno', { env: { get: (key: string) => ({ SUPABASE_URL: 'https://fixture.invalid', SUPABASE_SERVICE_ROLE_KEY: 'fixture-service', ADMIN_SECRET: 'owner-fixture' })[key] }, serve: (fn: typeof serve) => { serve = fn; } });
  await import(/* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}#${Math.random()}`);
  return (body: unknown, authorization = 'Bearer owner-fixture', extra = {}) => serve(new Request('https://fixture.invalid', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: authorization, ...extra }, body: JSON.stringify(body) }));
}
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('Private mailbox endpoint', () => {
  it('rejects missing owner/worker auth before accessing data and rejects arbitrary connection destinations', async () => {
    const rpc = vi.fn(), read = vi.fn(); const invoke = await handler({ rpc }, read);
    expect((await invoke({ action: 'status' }, '')).status).toBe(401);
    expect((await invoke({ action: 'configure', host: '169.254.169.254', password: 'fixture' })).status).toBe(400);
    expect(rpc).not.toHaveBeenCalled(); expect(read).not.toHaveBeenCalled();
  });
  it('worker token can sync but cannot configure or read settings', async () => {
    const token = 'a'.repeat(64), rpc = vi.fn();
    const client = { rpc, from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { worker_token_sha256: await sha256(token) }, error: null }) }) }) }) };
    const invoke = await handler(client);
    expect((await invoke({ action: 'configure', password: 'other' }, '', { 'x-support-mailbox-worker': token })).status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });
  it('advances cursor only after all events are acknowledged and never exposes the mailbox password', async () => {
    const rpc = vi.fn(async (name: string) => ({ data: name === 'support_mailbox_claim' ? structuredClone(lease) : name === 'support_ingest_batch' ? { ok: true, source_id: lease.source_id, acknowledged: [{ ...event, outcome: 'created' }] } : name === 'support_mailbox_finish' ? true : mailbox, error: null }));
    const invoke = await handler({ rpc }); const response = await invoke({ action: 'sync' });
    const body = await response.text(); expect(response.status).toBe(200); expect(body).not.toContain('PRIVATE_FIXTURE_PASSWORD'); expect(body).not.toContain(lease.source_hash);
    expect(rpc.mock.calls.map(call => call[0])).toEqual(['support_mailbox_claim', 'support_ingest_batch', 'support_mailbox_finish', 'support_mailbox_status']);
    expect(rpc).toHaveBeenCalledWith('support_mailbox_finish', expect.objectContaining({ p_last_uid: 10, p_uid_validity: '42', p_error: null }));
  });
  it('missing ingest receipt preserves cursor and reports a fixed storage error', async () => {
    const rpc = vi.fn(async (name: string) => ({ data: name === 'support_mailbox_claim' ? structuredClone(lease) : name === 'support_ingest_batch' ? { ok: true, source_id: lease.source_id, acknowledged: [] } : true, error: null }));
    const response = await (await handler({ rpc }))({ action: 'sync' });
    expect(response.status).toBe(503);
    expect(rpc).toHaveBeenCalledWith('support_mailbox_finish', expect.objectContaining({ p_last_uid: null, p_error: 'storage' }));
  });
  it('provider errors never disclose responses, credentials or mail contents', async () => {
    const rpc = vi.fn(async (name: string) => ({ data: name === 'support_mailbox_claim' ? structuredClone(lease) : true, error: null }));
    const read = vi.fn().mockRejectedValue(Object.assign(new Error('PRIVATE_FIXTURE_PASSWORD and message content'), { authenticationFailed: true }));
    const response = await (await handler({ rpc }, read))({ action: 'sync' });
    expect(response.status).toBe(503); expect(await response.text()).not.toContain('PRIVATE_FIXTURE_PASSWORD');
    expect(rpc).toHaveBeenCalledWith('support_mailbox_finish', expect.objectContaining({ p_last_uid: null, p_error: 'auth' }));
  });
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.104.0';
import { equalSecret } from '../_shared/secret.ts';
import { sha256, validateIngest } from '../_shared/support-validation.ts';
import { readMailbox } from './imap.ts';
import { safeMailboxError } from './mailbox.ts';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,content-type,apikey,x-client-info', 'Access-Control-Allow-Methods': 'POST,OPTIONS' };
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { ...cors, 'Cache-Control': 'no-store' } });

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const owner = token.length <= 4096 && [Deno.env.get('ADMIN_SECRET') ?? '', Deno.env.get('FAQ_ANALYTICS_PASSWORD') ?? ''].some(secret => equalSecret(token, secret));
  const worker = request.headers.get('x-support-mailbox-worker') ?? '';
  if (!owner && !/^[a-f0-9]{64}$/.test(worker)) return json({ error: 'unauthorized' }, 401);
  const url = Deno.env.get('SUPABASE_URL'), key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return json({ error: 'Mejlanslutningen är inte tillgänglig.' }, 503);
  const db = createClient(url, key, { auth: { persistSession: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }) } });
  if (!owner) {
    const { data, error } = await db.from('support_mailbox_connection').select('worker_token_sha256').eq('id', true).single();
    if (error || !data || !equalSecret(await sha256(worker), data.worker_token_sha256)) return json({ error: 'unauthorized' }, 401);
  }
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 3000) throw new Error();
    body = JSON.parse(raw);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch { return json({ error: 'Ogiltig begäran.' }, 400); }
  if (!owner && body.action !== 'sync') return json({ error: 'unauthorized' }, 401);
  try {
    if (body.action === 'status') {
      const { data, error } = await db.rpc('support_mailbox_status');
      if (error) throw error;
      return json({ mailbox: data });
    }
    if (body.action === 'configure' || body.action === 'pause') {
      if (Object.keys(body).some(key => !['action', 'password'].includes(key)) || (body.password !== undefined && (typeof body.password !== 'string' || body.password.length < 1 || body.password.length > 1024 || body.password.includes('\0')))) return json({ error: 'Ange ett giltigt mejllösenord.' }, 400);
      const { data, error } = await db.rpc('support_mailbox_configure', { p_password: body.action === 'configure' ? body.password ?? null : null, p_enabled: body.action === 'configure' });
      if (error?.message.includes('MAILBOX_BUSY')) return json({ error: 'En uppdatering pågår. Vänta en stund innan du ändrar anslutningen.' }, 409);
      if (error?.message.includes('MAILBOX_NOT_CONFIGURED')) return json({ error: 'Ange mejlens lösenord för att ansluta.' }, 400);
      if (error) throw error;
      return json({ mailbox: data });
    }
    if (body.action !== 'sync' || Object.keys(body).some(key => key !== 'action')) return json({ error: 'Okänd åtgärd.' }, 400);
    const { data: lease, error: claimError } = await db.rpc('support_mailbox_claim');
    if (claimError) throw claimError;
    if (!lease) {
      const { data: status, error } = await db.rpc('support_mailbox_status');
      if (error) throw error;
      return json({ mailbox: status, skipped: true, message: status?.enabled ? 'Uppdatering pågår eller startades nyss. Försök igen om en stund.' : 'Anslut eller återuppta mejlen först.' });
    }
    let storageFailure = false;
    try {
      const batch = await readMailbox(lease.password, lease);
      lease.password = ''; // Never included in returned state or diagnostic output.
      const validated = validateIngest({ events: batch.events, heartbeat: { pending_count: batch.more ? 1 : 0, failed_count: 0 } });
      storageFailure = true;
      const { data: receipt, error: ingestError } = await db.rpc('support_ingest_batch', { p_source_id: lease.source_id, p_token_sha256: lease.source_hash, p_events: validated.events, p_heartbeat: validated.heartbeat });
      if (ingestError || !receipt?.ok || receipt.source_id !== lease.source_id || !Array.isArray(receipt.acknowledged) || receipt.acknowledged.length !== batch.events.length || batch.events.some(event => !receipt.acknowledged.some((ack: { event_id: string; record_id: string; revision: string }) => ack.event_id === event.event_id && ack.record_id === event.record_id && ack.revision === event.revision))) throw new Error('mailbox_ingest_unconfirmed');
      const imported = receipt.acknowledged.filter((ack: { outcome: string }) => ack.outcome === 'created').length;
      const { data: finished, error: finishError } = await db.rpc('support_mailbox_finish', { p_lease_token: lease.lease_token, p_uid_validity: batch.uid_validity, p_last_uid: batch.last_uid, p_initial_since: batch.initial_since, p_initial_through_uid: batch.initial_through_uid, p_imported: imported, p_more: batch.more, p_error: null });
      if (finishError || !finished) throw new Error('mailbox_checkpoint_unconfirmed');
      const { data: status, error } = await db.rpc('support_mailbox_status');
      if (error) throw error;
      return json({ mailbox: status, imported, message: imported ? `${imported} nya mejl har hämtats.` : 'Mejlen är uppdaterad.' });
    } catch (error) {
      lease.password = '';
      // Fixed error codes only. IMAP errors may contain credentials, server responses or mail bodies.
      await db.rpc('support_mailbox_finish', { p_lease_token: lease.lease_token, p_uid_validity: null, p_last_uid: null, p_initial_since: null, p_initial_through_uid: null, p_imported: 0, p_more: false, p_error: storageFailure ? 'storage' : safeMailboxError(error) });
      return json({ error: 'Mejlen kunde inte uppdateras. Kontrollera anslutningsstatus och försök igen.' }, 503);
    }
  } catch {
    return json({ error: 'Mejlanslutningen kunde inte läsas eller sparas. Försök igen.' }, 503);
  }
});

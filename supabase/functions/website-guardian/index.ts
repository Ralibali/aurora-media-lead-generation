import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.104.0';
import { allowedUrl, checkWebsite } from './check.ts';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info' };
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { ...cors, 'Cache-Control': 'no-store' } });
function equal(a: string, b: string) { let diff = a.length ^ b.length; for (let i = 0; i < b.length; i++) diff |= (a.charCodeAt(i) || 0) ^ b.charCodeAt(i); return !!a && !!b && diff === 0; }
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const adminAccess = [Deno.env.get('ADMIN_SECRET') ?? '', Deno.env.get('FAQ_ANALYTICS_PASSWORD') ?? ''].some(key => equal(token, key));
  const scheduler = equal(token, Deno.env.get('GUARDIAN_CRON_SECRET') ?? '');
  if (!adminAccess && !scheduler) return json({ error: 'unauthorized' }, 401);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Ogiltig begäran.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Ogiltig begäran.' }, 400);
  if (scheduler && !adminAccess && body.action !== 'run_due') return json({ error: 'forbidden' }, 403);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const origins = (Deno.env.get('GUARDIAN_ALLOWED_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean);
  try {
    if (body.action === 'create') {
      let url;
      try { url = allowedUrl(String(body.url ?? ''), origins); } catch { return json({ error: 'Adressen finns inte i serverns godkända HTTPS-domänlista.' }, 400); }
      const name = String(body.name ?? '').trim();
      if (!name || name.length > 160 || String(body.expected_text ?? '').length > 300) return json({ error: 'Kontrollera namn och förväntad text.' }, 400);
      const { error } = await db.from('guardian_sites').insert({ name, url: url.href, expected_text: String(body.expected_text ?? '') });
      if (error) throw error;
    } else if (body.action === 'toggle') {
      if (typeof body.active !== 'boolean') return json({ error: 'Ogiltigt läge.' }, 400);
      const { error } = await db.from('guardian_sites').update({ active: body.active }).eq('id', body.id);
      if (error) throw error;
    } else if (!['list', 'run', 'run_due'].includes(body.action)) return json({ error: 'Okänd åtgärd.' }, 400);
    const { data: sites, error: listError } = await db.from('guardian_sites').select('*').order('created_at');
    if (listError) throw listError;
    if (body.action === 'run' || body.action === 'run_due') {
      let targets = (sites ?? []).filter(site => site.active && (body.action === 'run_due' || site.id === body.id));
      if (body.action === 'run_due') {
        const { data: recent, error } = await db.from('guardian_checks').select('site_id').gte('created_at', new Date(Date.now() - 3600000).toISOString());
        if (error) throw error;
        const checked = new Set((recent ?? []).map(check => check.site_id));
        targets = targets.filter(site => !checked.has(site.id));
      }
      // Small batches keep runtime, bandwidth and customer-site load bounded.
      await Promise.all(targets.slice(0, 5).map(async site => {
        const url = allowedUrl(site.url, origins);
        const slot = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
        const { data: reservation, error } = await db.from('guardian_checks').insert({ site_id: site.id, slot, status: 'running' }).select('id').single();
        if (error?.code === '23505') return;
        if (error) throw error;
        const result = await checkWebsite(url, site.expected_text);
        const { error: writeError } = await db.from('guardian_checks').update({ status: result.status, details: result }).eq('id', reservation.id);
        if (writeError) throw writeError;
      }));
      // Bounded retention. Scheduler never sends email or customer messages.
      const { error } = await db.from('guardian_checks').delete().lt('created_at', new Date(Date.now() - 90 * 86400000).toISOString());
      if (error) throw error;
    }
    if (scheduler && !adminAccess) return json({ ok: true });
    const history = await Promise.all((sites ?? []).map(async site => {
      const { data: checks, error } = await db.from('guardian_checks').select('*').eq('site_id', site.id).order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return { ...site, checks };
    }));
    return json({ sites: history });
  } catch { return json({ error: 'Kontrollen kunde inte sparas eller konfigurationen är ofullständig.' }, 500); }
});

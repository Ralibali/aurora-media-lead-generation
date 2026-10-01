import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.104.0';
import { allowedUrl, checkWebsite, incidentState, isDue } from './check.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
};
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { ...cors, 'Cache-Control': 'no-store' } });

function equal(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= (a.charCodeAt(i) || 0) ^ b.charCodeAt(i);
  return !!a && !!b && diff === 0;
}

function validInterval(value: unknown) {
  const interval = Number(value ?? 60);
  if (![15, 60, 360, 1440].includes(interval)) throw new Error('Ogiltigt kontrollintervall.');
  return interval;
}

function validEmail(value: unknown) {
  const email = String(value ?? '').trim();
  if (!email) return '';
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Ogiltig e-postadress.');
  return email;
}

type GuardianSite = {
  id: string;
  name: string;
  url: string;
  expected_text: string;
  active: boolean;
  check_interval_minutes: number;
  notify_email: string;
  last_checked_at: string | null;
  last_notified_state: 'none' | 'incident' | 'healthy';
};

async function sendSiteWatchEmail(site: GuardianSite, kind: 'incident' | 'recovered', result: Awaited<ReturnType<typeof checkWebsite>>) {
  const apiKey = Deno.env.get('RESEND_API_KEY') ?? '';
  const from = Deno.env.get('SITEWATCH_FROM_EMAIL') ?? '';
  if (!apiKey || !from || !site.notify_email) return false;

  const incident = kind === 'incident';
  const subject = incident
    ? `Aurora SiteWatch: incident på ${site.name}`
    : `Aurora SiteWatch: ${site.name} är återställd`;
  const lines = [
    incident ? 'Två avvikande kontroller i följd har bekräftat en incident.' : 'Webbplatsen har återgått till ett friskt kontrollresultat.',
    '',
    site.name,
    site.url,
    `HTTP: ${result.httpStatus ?? 'ej svar'}`,
    `Svarstid: ${result.durationMs} ms`,
    ...(result.issues.length ? ['', ...result.issues] : []),
    '',
    'Aurora SiteWatch · Aurora Media AB',
  ];

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [site.notify_email], subject, text: lines.join('\n') }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    console.error('[sitewatch] email failed', response.status, await response.text().catch(() => ''));
    return false;
  }
  return true;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const adminAccess = [Deno.env.get('ADMIN_SECRET') ?? '', Deno.env.get('FAQ_ANALYTICS_PASSWORD') ?? ''].some(key => equal(token, key));
  const scheduler = equal(token, Deno.env.get('GUARDIAN_CRON_SECRET') ?? '');
  if (!adminAccess && !scheduler) return json({ error: 'unauthorized' }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Ogiltig begäran.' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Ogiltig begäran.' }, 400);
  if (scheduler && !adminAccess && body.action !== 'run_due') return json({ error: 'forbidden' }, 403);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const origins = (Deno.env.get('GUARDIAN_ALLOWED_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean);

  try {
    if (body.action === 'create') {
      let url: URL;
      try {
        url = allowedUrl(String(body.url ?? ''), origins);
      } catch {
        return json({ error: 'Adressen finns inte i serverns godkända HTTPS-domänlista.' }, 400);
      }
      const name = String(body.name ?? '').trim();
      const expectedText = String(body.expected_text ?? '');
      if (!name || name.length > 160 || expectedText.length > 300) return json({ error: 'Kontrollera namn och förväntad text.' }, 400);

      let interval: number;
      let notifyEmail: string;
      try {
        interval = validInterval(body.check_interval_minutes);
        notifyEmail = validEmail(body.notify_email);
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : 'Ogiltiga inställningar.' }, 400);
      }

      const { error } = await db.from('guardian_sites').insert({
        name,
        url: url.href,
        expected_text: expectedText,
        check_interval_minutes: interval,
        notify_email: notifyEmail,
      });
      if (error) throw error;
    } else if (body.action === 'update') {
      let interval: number;
      let notifyEmail: string;
      try {
        interval = validInterval(body.check_interval_minutes);
        notifyEmail = validEmail(body.notify_email);
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : 'Ogiltiga inställningar.' }, 400);
      }
      const expectedText = String(body.expected_text ?? '');
      if (expectedText.length > 300) return json({ error: 'Förväntad text är för lång.' }, 400);
      const { error } = await db.from('guardian_sites').update({
        check_interval_minutes: interval,
        notify_email: notifyEmail,
        expected_text: expectedText,
      }).eq('id', String(body.id ?? ''));
      if (error) throw error;
    } else if (body.action === 'toggle') {
      if (typeof body.active !== 'boolean') return json({ error: 'Ogiltigt läge.' }, 400);
      const { error } = await db.from('guardian_sites').update({ active: body.active }).eq('id', body.id);
      if (error) throw error;
    } else if (!['list', 'run', 'run_due'].includes(String(body.action ?? ''))) {
      return json({ error: 'Okänd åtgärd.' }, 400);
    }

    const { data: sites, error: listError } = await db.from('guardian_sites').select('*').order('created_at');
    if (listError) throw listError;

    if (body.action === 'run' || body.action === 'run_due') {
      const targets = (sites ?? []).filter((site: GuardianSite) =>
        site.active &&
        (body.action === 'run_due'
          ? isDue(site.last_checked_at, site.check_interval_minutes)
          : site.id === body.id)
      );

      await Promise.all(targets.slice(0, 5).map(async (site: GuardianSite) => {
        const url = allowedUrl(site.url, origins);
        const { data: previousChecks, error: previousError } = await db
          .from('guardian_checks')
          .select('status')
          .eq('site_id', site.id)
          .neq('status', 'running')
          .order('created_at', { ascending: false })
          .limit(1);
        if (previousError) throw previousError;
        const previousStatus = previousChecks?.[0]?.status as string | undefined;

        const slot = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
        const { data: reservation, error } = await db
          .from('guardian_checks')
          .insert({ site_id: site.id, slot, status: 'running' })
          .select('id')
          .single();
        if (error?.code === '23505') return;
        if (error) throw error;

        const result = await checkWebsite(url, site.expected_text);
        const { error: writeError } = await db
          .from('guardian_checks')
          .update({ status: result.status, details: result })
          .eq('id', reservation.id);
        if (writeError) throw writeError;

        const checkedAt = result.checkedAt;
        const state = incidentState(result.status, previousStatus);
        const siteUpdate: Record<string, unknown> = { last_checked_at: checkedAt };

        if (state === 'Incident' && site.last_notified_state !== 'incident') {
          try {
            if (await sendSiteWatchEmail(site, 'incident', result)) {
              siteUpdate.last_notified_state = 'incident';
              siteUpdate.last_notified_at = checkedAt;
            }
          } catch (error) {
            console.error('[sitewatch] incident notification error', error);
          }
        } else if (state === 'Återställd' && site.last_notified_state === 'incident') {
          try {
            if (await sendSiteWatchEmail(site, 'recovered', result)) {
              siteUpdate.last_notified_state = 'healthy';
              siteUpdate.last_notified_at = checkedAt;
            }
          } catch (error) {
            console.error('[sitewatch] recovery notification error', error);
          }
        }

        const { error: siteError } = await db.from('guardian_sites').update(siteUpdate).eq('id', site.id);
        if (siteError) throw siteError;
      }));

      const { error } = await db.from('guardian_checks').delete().lt('created_at', new Date(Date.now() - 90 * 86400000).toISOString());
      if (error) throw error;
    }

    if (scheduler && !adminAccess) return json({ ok: true });

    const { data: currentSites, error: refreshError } = await db.from('guardian_sites').select('*').order('created_at');
    if (refreshError) throw refreshError;
    const history = await Promise.all((currentSites ?? []).map(async site => {
      const { data: checks, error } = await db
        .from('guardian_checks')
        .select('*')
        .eq('site_id', site.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return { ...site, checks };
    }));
    return json({ sites: history });
  } catch (error) {
    console.error('[sitewatch] request failed', error);
    return json({ error: 'Kontrollen kunde inte sparas eller konfigurationen är ofullständig.' }, 500);
  }
});

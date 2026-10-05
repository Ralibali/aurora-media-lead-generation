import { useCallback, useEffect, useState } from 'react';
import AdminShell, { adminFetch, AdminStatus } from './AdminShell';
import WatchFlows from './WatchFlows';
import type { WatchFlow } from '@/lib/auroraWatch';
import { incidentState } from '../../../supabase/functions/website-guardian/check';

type Check = {
  id: string;
  status: string;
  created_at: string;
  details: { issues?: string[]; durationMs?: number; httpStatus?: number | null };
};

type Site = {
  id: string;
  name: string;
  url: string;
  expected_text: string;
  active: boolean;
  check_interval_minutes: number;
  notify_email: string;
  last_checked_at: string | null;
  last_notified_state: string;
  checks: Check[];
  flows?: WatchFlow[];
};

const intervalLabel = (minutes: number) =>
  minutes === 15 ? 'Var 15:e minut' :
  minutes === 60 ? 'Varje timme' :
  minutes === 360 ? 'Var 6:e timme' : 'Varje dygn';

export default function WebsiteGuardian() {
  const [sites, setSites] = useState<Site[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [expected, setExpected] = useState('');
  const [interval, setInterval] = useState(60);
  const [notifyEmail, setNotifyEmail] = useState('');

  const request = useCallback(async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(undefined);
    try {
      const data = await adminFetch('website-guardian', {
        method: 'POST',
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45000),
      });
      setSites(data.sites);
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { void request({ action: 'list' }); }, [request]);

  const patchSite = (id: string, patch: Partial<Site>) =>
    setSites(current => current.map(site => site.id === id ? { ...site, ...patch } : site));

  const createSite = async () => {
    const ok = await request({
      action: 'create',
      name,
      url,
      expected_text: expected,
      check_interval_minutes: interval,
      notify_email: notifyEmail,
    });
    if (ok) {
      setName('');
      setUrl('');
      setExpected('');
      setNotifyEmail('');
      setInterval(60);
    }
  };

  return (
    <AdminShell title="Aurora Watch" kicker="Webbövervakning och kundflöden">
      <div className="space-y-2">
        <p>
          Bevaka tillgänglighet, svarstid, noindex och viktig sidtext. En första avvikelse markeras för
          omkontroll; två avvikande kontroller i följd blir en incident.
        </p>
        <p className="text-sm text-muted-foreground">
          Sidkontrollen läser serverns HTML-svar. Lägg till kundflöden under en monitor för att även testa
          navigering och synligt innehåll i en webbläsare. Endast servergodkända HTTPS-domäner kan läggas till.
        </p>
      </div>

      <form
        className="my-6 grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-2"
        onSubmit={e => {
          e.preventDefault();
          void createSite();
        }}
      >
        <label className="md:col-span-1">
          Kund / webbplats
          <input className="mt-1 block w-full rounded border p-2" required maxLength={160} value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label className="md:col-span-1">
          Sidans HTTPS-adress
          <input type="url" className="mt-1 block w-full rounded border p-2" required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.se/kontakt" />
        </label>
        <label>
          Kontrollintervall
          <select className="mt-1 block w-full rounded border p-2" value={interval} onChange={e => setInterval(Number(e.target.value))}>
            <option value={15}>Var 15:e minut</option>
            <option value={60}>Varje timme</option>
            <option value={360}>Var 6:e timme</option>
            <option value={1440}>Varje dygn</option>
          </select>
        </label>
        <label>
          Incidentmail (valfritt)
          <input type="email" className="mt-1 block w-full rounded border p-2" maxLength={320} value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} placeholder="drift@kund.se" />
        </label>
        <label className="md:col-span-2">
          Text som ska finnas i HTML (valfritt)
          <input className="mt-1 block w-full rounded border p-2" maxLength={300} value={expected} onChange={e => setExpected(e.target.value)} />
        </label>
        <button className="vk-btn vk-btn-primary md:col-span-2" disabled={busy}>Lägg till monitor</button>
      </form>

      <AdminStatus error={error} loading={busy} />
      <button className="vk-btn" disabled={busy} onClick={() => void request({ action: 'list' })}>Uppdatera historik</button>

      {!busy && sites.length === 0 && <p>Inga webbplatser har lagts till.</p>}

      <div className="my-6 grid gap-4">
        {sites.map(site => {
          const state = site.active ? incidentState(site.checks[0]?.status, site.checks[1]?.status) : 'Pausad';
          return (
            <section key={site.id} className="space-y-4 rounded-xl border bg-white p-5">
              <div>
                <h2 className="text-xl font-semibold">{site.name} · {state}</h2>
                <a className="break-all underline" href={site.url} target="_blank" rel="noreferrer">{site.url}</a>
                <p className="mt-1 text-xs text-muted-foreground">
                  {intervalLabel(site.check_interval_minutes)}
                  {site.last_checked_at ? ` · Senast kontrollerad ${new Date(site.last_checked_at).toLocaleString('sv-SE')}` : ' · Inte kontrollerad ännu'}
                </p>
              </div>

              <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-3">
                <label>
                  Intervall
                  <select
                    className="mt-1 block w-full rounded border bg-white p-2"
                    value={site.check_interval_minutes}
                    onChange={e => patchSite(site.id, { check_interval_minutes: Number(e.target.value) })}
                  >
                    <option value={15}>15 min</option>
                    <option value={60}>1 timme</option>
                    <option value={360}>6 timmar</option>
                    <option value={1440}>24 timmar</option>
                  </select>
                </label>
                <label>
                  Incidentmail
                  <input
                    type="email"
                    className="mt-1 block w-full rounded border bg-white p-2"
                    maxLength={320}
                    value={site.notify_email ?? ''}
                    onChange={e => patchSite(site.id, { notify_email: e.target.value })}
                    placeholder="drift@kund.se"
                  />
                </label>
                <label>
                  Förväntad text
                  <input
                    className="mt-1 block w-full rounded border bg-white p-2"
                    maxLength={300}
                    value={site.expected_text ?? ''}
                    onChange={e => patchSite(site.id, { expected_text: e.target.value })}
                  />
                </label>
                <div className="md:col-span-3">
                  <button
                    className="vk-btn"
                    disabled={busy}
                    onClick={() => void request({
                      action: 'update',
                      id: site.id,
                      check_interval_minutes: site.check_interval_minutes,
                      notify_email: site.notify_email,
                      expected_text: site.expected_text,
                    })}
                  >
                    Spara monitorinställningar
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="vk-btn vk-btn-primary" disabled={busy || !site.active} onClick={() => void request({ action: 'run', id: site.id })}>Kontrollera nu</button>
                <button className="vk-btn" disabled={busy} onClick={() => void request({ action: 'toggle', id: site.id, active: !site.active })}>{site.active ? 'Pausa' : 'Aktivera'}</button>
                <button
                  className="vk-btn"
                  onClick={() => {
                    const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(site, null, 2)], { type: 'application/json' }));
                    const a = document.createElement('a');
                    a.href = objectUrl;
                    a.download = 'aurora-sitewatch-rapport.json';
                    a.click();
                    URL.revokeObjectURL(objectUrl);
                  }}
                >
                  Hämta rapport
                </button>
              </div>

              <h3 className="font-semibold">Sidkontroller · HTTP och HTML</h3>
              <ul className="space-y-2">
                {site.checks.slice(0, 10).map(check => (
                  <li key={check.id} className="rounded border p-3 text-sm">
                    {new Date(check.created_at).toLocaleString('sv-SE')} · {check.status === 'running' ? 'Ej slutförd' : check.status === 'healthy' ? 'OK' : 'Avvikelse'} · {check.details.durationMs ?? '–'} ms
                    {check.details.httpStatus != null && <span> · HTTP {check.details.httpStatus}</span>}
                    {!!check.details.issues?.length && <p className="mt-1">{check.details.issues.join(' ')}</p>}
                  </li>
                ))}
              </ul>
              <WatchFlows site={site} busy={busy} request={request} />
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}

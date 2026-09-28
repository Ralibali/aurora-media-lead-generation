import { useCallback, useEffect, useState } from 'react';
import AdminShell, { adminFetch, AdminStatus } from './AdminShell';
import { incidentState } from '../../../supabase/functions/website-guardian/check';
type Check = { id: string; status: string; created_at: string; details: { issues?: string[]; durationMs?: number; httpStatus?: number | null } };
type Site = { id: string; name: string; url: string; active: boolean; checks: Check[] };
export default function WebsiteGuardian() {
  const [sites, setSites] = useState<Site[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [name, setName] = useState(''); const [url, setUrl] = useState(''); const [expected, setExpected] = useState('');
  const request = useCallback(async (body: Record<string, unknown>) => {
    setBusy(true); setError(undefined);
    try { const data = await adminFetch('website-guardian', { method: 'POST', body: JSON.stringify(body), signal: AbortSignal.timeout(45000) }); setSites(data.sites); }
    catch (err) { setError(err); } finally { setBusy(false); }
  }, []);
  useEffect(() => { void request({ action: 'list' }); }, [request]);
  return <AdminShell title="Website Guardian" kicker="Drift och kunduppföljning">
    <p>Kontrollera tillgänglighet, svarstid, noindex och viktig sidtext. Två avvikande kontroller i följd markeras som incident. Kontrollerna läser HTML; formulär och inloggade flöden testas inte.</p>
    <p>Endast servergodkända domäner kan läggas till. Aviseringar visas här, inga kundmeddelanden skickas.</p>
    <form className="my-6 grid gap-3 rounded-xl border bg-white p-5" onSubmit={e => { e.preventDefault(); void request({ action: 'create', name, url, expected_text: expected }); }}>
      <label>Kund / webbplats<input className="block w-full rounded border p-2" required maxLength={160} value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Sidans HTTPS-adress<input type="url" className="block w-full rounded border p-2" required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.se/kontakt" /></label>
      <label>Text som ska finnas i HTML (valfritt)<input className="block w-full rounded border p-2" maxLength={300} value={expected} onChange={e => setExpected(e.target.value)} /></label>
      <button className="vk-btn vk-btn-primary" disabled={busy}>Lägg till kontroll</button>
    </form>
    <AdminStatus error={error} loading={busy} />
    <button className="vk-btn" disabled={busy} onClick={() => void request({ action: 'list' })}>Uppdatera historik</button>
    {!busy && sites.length === 0 && <p>Inga webbplatser har lagts till.</p>}
    <div className="my-6 grid gap-4">{sites.map(site => <section key={site.id} className="space-y-3 rounded-xl border bg-white p-5">
      <h2 className="text-xl font-semibold">{site.name} · {site.active ? incidentState(site.checks[0]?.status, site.checks[1]?.status) : 'Pausad'}</h2>
      <a className="break-all underline" href={site.url} target="_blank" rel="noreferrer">{site.url}</a>
      <div className="flex flex-wrap gap-2"><button className="vk-btn vk-btn-primary" disabled={busy || !site.active} onClick={() => void request({ action: 'run', id: site.id })}>Kontrollera nu</button>
        <button className="vk-btn" disabled={busy} onClick={() => void request({ action: 'toggle', id: site.id, active: !site.active })}>{site.active ? 'Pausa' : 'Aktivera'}</button>
        <button className="vk-btn" onClick={() => { const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(site, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = objectUrl; a.download = 'website-guardian-rapport.json'; a.click(); URL.revokeObjectURL(objectUrl); }}>Hämta rapport</button></div>
      <ul className="space-y-2">{site.checks.slice(0, 10).map(check => <li key={check.id} className="rounded border p-3 text-sm">
        {new Date(check.created_at).toLocaleString('sv-SE')} · {check.status === 'running' ? 'Ej slutförd' : check.status === 'healthy' ? 'OK' : 'Avvikelse'} · {check.details.durationMs ?? '–'} ms
        <p>{check.details.issues?.join(' ')}</p>
      </li>)}</ul>
    </section>)}</div>
  </AdminShell>;
}

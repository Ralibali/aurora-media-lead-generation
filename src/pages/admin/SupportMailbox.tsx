import { useCallback, useEffect, useState } from 'react';
import { Mail, Pause, RefreshCw, ShieldCheck } from 'lucide-react';
import { adminFetch } from '@/lib/adminClient';

type MailboxState = {
  address: string; configured: boolean; enabled: boolean; syncing: boolean;
  last_attempt_at: string | null; last_success_at: string | null;
  last_error: 'auth' | 'timeout' | 'connection' | 'storage' | null;
  last_imported_count: number; more_pending: boolean;
};
const errorMessages = {
  auth: 'Titan nekade inloggningen. Kontrollera mejllösenordet och att åtkomst från andra e-postappar är tillåten. Använd app-lösenord om kontot kräver det.',
  timeout: 'Mejlservern tog för lång tid på sig. Nästa försök sker automatiskt.',
  connection: 'Anslutningen till Titan misslyckades. Kontrollera inställningarna för åtkomst från andra e-postappar.',
  storage: 'Mejlen kunde inte sparas här. Nästa försök återupptar importen utan att duplicera sparade mejl.',
};
const date = (value: string | null) => value ? new Date(value).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' }) : 'Inte ännu';
function validState(value: unknown): value is MailboxState {
  return !!value && typeof value === 'object' && 'address' in value && value.address === 'info@auroramedia.se' && 'configured' in value && typeof value.configured === 'boolean' && 'enabled' in value && typeof value.enabled === 'boolean';
}

export default function SupportMailbox({ onSynced }: { onSynced?: () => void }) {
  const [state, setState] = useState<MailboxState | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async (signal?: AbortSignal) => {
    const result = await adminFetch('admin-support-mailbox', { method: 'POST', body: JSON.stringify({ action: 'status' }), signal });
    if (!validState(result.mailbox)) throw new Error('Mejlanslutningen kunde inte läsas.');
    setState(result.mailbox);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Mejlanslutningen kunde inte läsas.'); });
    return () => controller.abort();
  }, [load]);
  const act = async (action: 'configure' | 'pause' | 'sync') => {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    const payload: { action: string; password?: string } = { action };
    if (action === 'configure' && password) payload.password = password;
    // Erase the local field as the request starts; never persist it in browser storage.
    if (action === 'configure') setPassword('');
    try {
      const result = await adminFetch('admin-support-mailbox', { method: 'POST', body: JSON.stringify(payload), signal: AbortSignal.timeout(action === 'sync' ? 95_000 : 20_000) });
      if (!validState(result.mailbox)) throw new Error('Servern bekräftade inte anslutningen.');
      setState(result.mailbox);
      setNotice(result.message ?? (action === 'pause' ? 'Mejlimporten är pausad.' : 'Anslutningen är sparad. Hämta mejlen nu, eller låt den automatiska uppdateringen starta inom fem minuter.'));
      if (action === 'sync' && !result.skipped) onSynced?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Åtgärden kunde inte slutföras.');
      await load().catch(() => {});
    } finally { payload.password = undefined; setBusy(false); }
  };
  return <section className="sh-sources" aria-labelledby="mailbox-title">
    <div className="sh-detail-header"><div><h2 id="mailbox-title"><Mail size={20} aria-hidden="true" /> info@auroramedia.se</h2><p>Samla mejlen tillsammans med support och feedback.</p></div><span className={`sh-pill ${state?.enabled && state.last_success_at && !state.last_error ? 'sh-pill-good' : 'sh-pill-warning'}`}>{state?.syncing ? 'Uppdaterar' : state?.last_error ? 'Kontrollera anslutningen' : state?.enabled ? state.last_success_at ? 'Import aktiverad' : 'Väntar på första import' : state?.configured ? 'Pausad' : 'Inte ansluten'}</span></div>
    <p className="sh-muted">Första importen hämtar högst de senaste 100 mejlen i inkorgen från de senaste 30 dagarna. Nya mejl uppdateras därefter var femte minut, i mindre omgångar. Bilagor visas med namn och storlek.</p>
    <p className="sh-muted"><ShieldCheck size={15} aria-hidden="true" /> Anslutningen läser bara inkorgen. Mejlen markeras inte som lästa och ingenting skickas eller flyttas.</p>
    {state && <div className="sh-source-context"><span>Senast uppdaterad: <strong>{date(state.last_success_at)}</strong></span><span>Senaste försök: {date(state.last_attempt_at)}</span></div>}
    {state?.last_error && <p role="alert" className="sh-warning">{errorMessages[state.last_error]}</p>}
    {state?.more_pending && <p className="sh-warning">Fler mejl väntar. Importen fortsätter automatiskt vid nästa uppdatering.</p>}
    <form className="sh-case-form" onSubmit={event => { event.preventDefault(); void act('configure'); }}>
      <label>Lösenord för info@auroramedia.se<input type="password" autoComplete="new-password" name="mailbox-password" maxLength={1024} value={password} onChange={event => setPassword(event.target.value)} disabled={busy} placeholder={state?.configured ? 'Lämna tomt för att behålla sparat lösenord' : 'Ange mejlens lösenord eller app-lösenord'} aria-describedby="mailbox-password-help" /></label>
      <p id="mailbox-password-help" className="sh-muted">Lösenordet sparas krypterat på servern och visas aldrig igen. Aktivera åtkomst från andra e-postappar i Titan om det behövs.</p>
      <div className="sh-reply-actions"><button className="sh-button sh-button-primary" disabled={busy || !state || (!state.configured && !password)}>{busy ? 'Arbetar…' : state?.configured ? state.enabled ? 'Spara anslutning' : 'Återuppta import' : 'Anslut mejlen'}</button><button type="button" className="sh-button" disabled={busy || !state?.enabled || state.syncing} onClick={() => void act('sync')}><RefreshCw size={15} />Hämta mejl nu</button>{state?.enabled && <button type="button" className="sh-text-button" disabled={busy || state.syncing} onClick={() => void act('pause')}><Pause size={15} />Pausa import</button>}<a href="https://app.titan.email/" target="_blank" rel="noopener noreferrer">Öppna webbmejlen</a></div>
    </form>
    {error && <p className="sh-error" role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {!state && <button type="button" className="sh-button" disabled={busy} onClick={() => { setError(''); void load().catch(cause => setError(cause instanceof Error ? cause.message : 'Anslutningen kunde inte läsas.')); }}>Läs in anslutningen igen</button>}
  </section>;
}

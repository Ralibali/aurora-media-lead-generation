import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronRight, Copy, Inbox, RefreshCw, Save, Search, TriangleAlert, X } from 'lucide-react';
import AdminShell from './AdminShell';
import SupportMailbox from './SupportMailbox';
import { adminFetch } from '@/lib/adminClient';
import { safeExternalUrl } from '@/lib/portfolioPresentation';
import { isSupportResponse, localDateTime, sourceStateLabels, supportDate, supportKindLabels, supportOverdue, supportPriorityLabels, supportStatusLabels, type SupportCase, type SupportCursor, type SupportFilters, type SupportListResponse, type SupportPatch, type SupportSource } from '@/lib/supportHub';
import '@/styles/support-hub.css';

const request = (body: object, signal?: AbortSignal) => adminFetch('admin-support', { method: 'POST', body: JSON.stringify(body), signal });
const stateClass = (state: SupportCase['owner_status']) => state === 'resolved' ? 'sh-pill-good' : state === 'new' ? 'sh-pill-new' : '';

function SourceCoverage({ sources, projects }: Pick<SupportListResponse, 'sources' | 'projects'>) {
  const connected = sources.filter(source => source.active && source.connection_state === 'connected').length;
  return <details id="kallor" className="sh-sources">
    <summary><span><span className="sh-source-dot" /><strong>{connected} av {sources.length} källor anslutna</strong><span>Kontrollera täckning och senaste uppdatering</span></span><ChevronRight size={18} /></summary>
    <p>Listan visar det som har lästs in. En tom lista betyder inte att ett projekt utan anslutning saknar ärenden.</p>
    {!sources.length && <p>Inga support- eller feedbackkällor är registrerade ännu.</p>}
    <div className="sh-source-grid">{sources.map(source => <section key={source.id} className="sh-source-card">
      <strong>{projects.find(project => project.id === source.project_id)?.name ?? source.project_id}</strong>
      <span>{source.label}</span>
      <span className={`sh-pill ${source.connection_state === 'connected' && source.active ? 'sh-pill-good' : 'sh-pill-warning'}`}>{source.active ? sourceStateLabels[source.connection_state] : 'Pausad'}</span>
      <small>Senaste uppdatering: {supportDate(source.sync_received_at)}</small>
      {source.last_error && <p className="sh-warning">{source.last_error}</p>}
    </section>)}</div>
  </details>;
}

function CaseEditor({ item, source, projects, projectName, onSaved, onDirty, onClose }: { item: SupportCase; source?: SupportSource; projects: SupportListResponse['projects']; projectName: string; onSaved: (item: SupportCase) => void; onDirty: (dirty: boolean) => void; onClose: () => void }) {
  const initial = useMemo(() => ({ project_id: item.project_id, owner_status: item.owner_status, owner_priority: item.owner_priority, assigned_to: item.assigned_to ?? '', followup_at: localDateTime(item.followup_at), private_notes: item.private_notes, reply_draft: item.reply_draft }), [item]);
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const originalUrl = safeExternalUrl(source?.original_url);
  useEffect(() => { onDirty(dirty); return () => onDirty(false); }, [dirty, onDirty]);
  const patch = (value: Partial<typeof draft>) => { setDraft(current => ({ ...current, ...value })); setMessage(''); };
  return <section className="sh-detail" aria-labelledby="case-title">
    <div className="sh-detail-header"><div><p className="sh-eyebrow">{projectName} · {supportKindLabels[item.kind]}</p><h2 id="case-title">{item.title}</h2><p>{item.source_label} · {supportDate(item.source_created_at)}</p></div><button className="sh-icon-button" aria-label="Stäng ärende" disabled={dirty || saving} onClick={onClose}><X size={19} /></button></div>
    {item.source_deleted_at && <p className="sh-warning">Ärendet har tagits bort i originalsystemet. Den centrala arbetsanteckningen visas fortfarande.</p>}
    <div className="sh-message"><div className="sh-message-author"><strong>{item.requester_name || 'Avsändare ej angiven'}</strong>{item.requester_email && <span>{item.requester_email}</span>}</div><p>{item.body || 'Inget meddelandeinnehåll från källan.'}</p></div>
    <div className="sh-source-context"><span>Status i originalsystemet: <strong>{item.source_status || 'Ej angiven'}</strong></span><span>Mottaget här {supportDate(item.received_at)}</span></div>
    {item.source_reply && <details className="sh-source-reply"><summary>Befintligt svar i originalsystemet</summary><p>{item.source_reply}</p></details>}
    <form className="sh-case-form" onSubmit={async event => {
      event.preventDefault(); if (saving || !dirty) return;
      setSaving(true); setError(''); setMessage('');
      try {
        const { project_id, ...ownerDraft } = draft;
        const values: SupportPatch = { ...ownerDraft, ...(item.kind === 'email' && project_id !== item.project_id ? { project_id } : {}), assigned_to: draft.assigned_to.trim() || null, followup_at: draft.followup_at ? new Date(draft.followup_at).toISOString() : null };
        const result = await request({ action: 'update', id: item.id, expected_version: item.version, patch: values });
        if (!result.case || result.case.id !== item.id || !(result.case.version > item.version)) throw new Error('Servern bekräftade inte ändringen. Din text finns kvar.');
        onDirty(false); onSaved(result.case);
      } catch (cause) {
        const conflict = !!cause && typeof cause === 'object' && 'status' in cause && cause.status === 409;
        setError(conflict ? 'Ärendet har ändrats sedan du öppnade det. Din text finns kvar. Kopiera dina ändringar, återställ formuläret och uppdatera listan för att läsa den senaste versionen.' : cause instanceof Error ? cause.message : 'Ärendet kunde inte sparas. Din text finns kvar.');
      } finally { setSaving(false); }
    }}>
      <div><h3>Din handläggning</h3><p className="sh-muted">Sparas privat i Aurora Media. Kundens originalmeddelande ändras inte.</p></div>
      {item.kind === 'email' && <label>Tillhör projekt<select disabled={saving} value={draft.project_id} onChange={event => patch({ project_id: event.target.value })}>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>}
      <div className="sh-form-grid">
        <label>Arbetsstatus<select disabled={saving} value={draft.owner_status} onChange={event => patch({ owner_status: event.target.value as SupportCase['owner_status'] })}>{Object.entries(supportStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Prioritet<select disabled={saving} value={draft.owner_priority} onChange={event => patch({ owner_priority: event.target.value as SupportCase['owner_priority'] })}>{Object.entries(supportPriorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Ansvarig<input disabled={saving} maxLength={120} value={draft.assigned_to} placeholder="Namn på ansvarig" onChange={event => patch({ assigned_to: event.target.value })} /></label>
        <label>Följ upp<input disabled={saving} type="datetime-local" value={draft.followup_at} onChange={event => patch({ followup_at: event.target.value })} /></label>
      </div>
      <label>Privat notering<textarea disabled={saving} rows={4} maxLength={4000} value={draft.private_notes} placeholder="Vad har du gjort, och vad återstår?" onChange={event => patch({ private_notes: event.target.value })} /></label>
      <label>Svarsutkast<textarea disabled={saving} rows={4} maxLength={6000} value={draft.reply_draft} placeholder="Förbered ett svar. Ingenting skickas härifrån." onChange={event => patch({ reply_draft: event.target.value })} /></label>
      <div className="sh-reply-actions"><button type="button" className="sh-text-button" disabled={!draft.reply_draft.trim()} onClick={async () => { try { await navigator.clipboard.writeText(draft.reply_draft); setMessage('Svarsutkastet är kopierat.'); } catch { setError('Kunde inte kopiera automatiskt. Markera texten och kopiera den.'); } }}><Copy size={14} />Kopiera utkast</button>{originalUrl ? <a href={originalUrl} target="_blank" rel="noopener noreferrer">Öppna originalsystem för att svara <ArrowUpRight size={15} /></a> : <span>Ingen verifierad länk till originalsystemet finns ännu.</span>}</div>
      {error && <p role="alert" className="sh-error">{error}</p>}{message && <p role="status">{message}</p>}
      <div className="sh-save-bar"><button className="sh-button sh-button-primary" disabled={saving || !dirty}><Save size={16} />{saving ? 'Sparar…' : 'Spara handläggning'}</button><button type="button" className="sh-button" disabled={saving || !dirty} onClick={() => { setDraft(initial); setError(''); }}>Återställ formulär</button></div>
      {dirty && <p className="sh-muted">Du har osparade ändringar. Spara eller återställ innan du byter ärende.</p>}
    </form>
  </section>;
}

export default function SupportHub() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<SupportListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<SupportCase | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState(params.get('query') ?? '');
  const moreAbort = useRef<AbortController | null>(null);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  const selectedId = params.get('case') ?? '';
  const project = params.get('project') ?? '';
  const source = params.get('source') ?? '';
  const status = params.get('status') ?? '';
  const kind = params.get('kind') ?? '';
  const query = params.get('query') ?? '';
  const filters: SupportFilters = useMemo(() => ({ ...(project ? { project_id: project } : {}), ...(source ? { source_id: source } : {}), ...(Object.keys(supportStatusLabels).includes(status) ? { owner_status: status as SupportCase['owner_status'] } : {}), ...(Object.keys(supportKindLabels).includes(kind) ? { kind: kind as SupportCase['kind'] } : {}), ...(query ? { query } : {}), limit: 30 }), [project, source, status, kind, query]);
  const updateParams = (patch: Record<string, string | null>) => { setParams(previous => { const next = new URLSearchParams(previous); for (const [key, value] of Object.entries(patch)) if (value) next.set(key, value); else next.delete(key); return next; }); };
  useEffect(() => {
    moreAbort.current?.abort(); setLoadingMore(false);
    const controller = new AbortController();
    setLoading(true); setError(''); setData(null);
    request({ action: 'list', ...filters }, controller.signal).then((result: SupportListResponse) => {
      if (!isSupportResponse(result)) throw new Error('Ärendelistan gav ett oväntat svar.');
      if (!controller.signal.aborted) setData(result);
    }).catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Ärenden kunde inte hämtas.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => { controller.abort(); moreAbort.current?.abort(); };
  }, [filters, reload]);
  useEffect(() => {
    setSelected(null); setDetailError('');
    if (!selectedId) { setDetailLoading(false); return; }
    const controller = new AbortController(); setDetailLoading(true);
    request({ action: 'detail', id: selectedId }, controller.signal).then(result => {
      if (!result.case || result.case.id !== selectedId) throw new Error('Ärendet kunde inte hittas.');
      if (!controller.signal.aborted) setSelected(result.case);
    }).catch(cause => { if (!controller.signal.aborted) setDetailError(cause instanceof Error ? cause.message : 'Ärendet kunde inte hämtas.'); }).finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [selectedId, reload]);
  const onDirty = useCallback((value: boolean) => setDirty(value), []);
  const more = async (cursor: SupportCursor) => {
    const controller = new AbortController(); moreAbort.current = controller;
    setLoadingMore(true); setError('');
    try {
      const result: SupportListResponse = await request({ action: 'list', ...filters, cursor }, controller.signal);
      if (!isSupportResponse(result)) throw new Error('Nästa sida gav ett oväntat svar.');
      if (controller.signal.aborted) return;
      setData(current => current ? { ...result, cases: [...current.cases, ...result.cases.filter(item => !current.cases.some(existing => existing.id === item.id))] } : result);
    } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Kunde inte läsa fler ärenden.'); }
    finally { if (!controller.signal.aborted) setLoadingMore(false); }
  };
  return <AdminShell title="Support och feedback" kicker="Admin · Ärenden"><div className="sh-hub">
    <div className="sh-heading"><div><p className="sh-eyebrow">Inkommet från dina projekt</p><h1>Samlat. Sorterat. Uppföljt.</h1><p>Support, feedback och e-post med projektets sammanhang nära till hands.</p></div><button className="sh-button" disabled={loading || dirty || loadingMore} onClick={() => { setSaved(''); setReload(value => value + 1); }}><RefreshCw size={16} className={loading ? 'sh-spin' : ''} />Uppdatera</button></div>
    {data && <>
      <div className="sh-counts"><span><strong>{data.counts.total}</strong> inlästa i urvalet</span><span><strong>{data.counts.new}</strong> nya</span><span><strong>{data.counts.in_progress}</strong> pågår</span><span><strong>{data.counts.waiting}</strong> väntar</span><span className={data.counts.overdue ? 'sh-warning' : ''}><strong>{data.counts.overdue}</strong> förfallna</span><small>Hämtat {supportDate(data.generated_at)}</small></div>
      <SourceCoverage sources={data.sources} projects={data.projects} />
    </>}
    <details className="sh-mailbox-connection"><summary><span><strong>Mejlanslutning · info@auroramedia.se</strong><small>Anslut eller hantera inkorgen</small></span><ChevronRight size={18} /></summary><SupportMailbox onSynced={() => { if (dirtyRef.current) setSaved('Mejlen är hämtade. Spara handläggningen och uppdatera listan för att visa de nya ärendena.'); else setReload(value => value + 1); }} /></details>
    <form className="sh-filters" onSubmit={event => { event.preventDefault(); updateParams({ query: search.trim(), case: null }); }}>
      <label>Projekt<select aria-label="Filtrera projekt" disabled={dirty || loadingMore} value={project} onChange={event => updateParams({ project: event.target.value, source: null, case: null })}><option value="">Alla projekt</option>{data?.projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Källa<select disabled={dirty || loadingMore} value={source} onChange={event => updateParams({ source: event.target.value, case: null })}><option value="">Alla källor</option>{data?.sources.filter(item => !project || item.project_id === project).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label>Typ<select disabled={dirty || loadingMore} value={kind} onChange={event => updateParams({ kind: event.target.value, case: null })}><option value="">Alla typer</option>{Object.entries(supportKindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Status<select disabled={dirty || loadingMore} value={status} onChange={event => updateParams({ status: event.target.value, case: null })}><option value="">Alla statusar</option>{Object.entries(supportStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="sh-search">Sök ärenden<div><Search size={16} /><input type="search" maxLength={200} placeholder="Ämne, meddelande eller avsändare…" disabled={dirty || loadingMore} value={search} onChange={event => setSearch(event.target.value)} /><button disabled={dirty || loadingMore}>Sök</button></div></label>
    </form>
    {error && <div role="alert" className="sh-error"><TriangleAlert size={18} />{error}</div>}
    {saved && <p role="status" className="sh-saved"><Check size={16} />{saved}</p>}
    {loading && <p role="status" className="sh-loading"><RefreshCw size={20} className="sh-spin" />Hämtar ärenden och källornas status…</p>}
    <div className={`sh-workspace ${selectedId ? 'sh-workspace-selected' : ''}`}>
      {data && <div className="sh-list" aria-label="Ärendelista">
        {data.cases.map(item => <button key={item.id} className={`sh-case ${selectedId === item.id ? 'sh-case-selected' : ''}`} aria-pressed={selectedId === item.id} disabled={dirty} onClick={() => { setSaved(''); updateParams({ case: item.id }); }}>
          <span className="sh-case-top"><span>{data.projects.find(p => p.id === item.project_id)?.name ?? item.project_id}</span><span className={`sh-pill ${stateClass(item.owner_status)}`}>{supportStatusLabels[item.owner_status]}</span></span>
          <strong>{item.title}</strong><span className="sh-case-preview">{item.body}</span>
          <span className="sh-case-footer"><span>{supportKindLabels[item.kind]} · {supportDate(item.source_created_at)}</span>{supportOverdue(item) ? <span className="sh-warning">Uppföljning förfallen</span> : item.assigned_to ? <span>{item.assigned_to}</span> : null}</span>
        </button>)}
        {!data.cases.length && <div className="sh-empty"><Inbox size={30} /><h2>Inga inlästa ärenden i urvalet</h2><p>Ändra filtret eller kontrollera källornas anslutning ovan. Ärenden kan fortfarande finnas i projekt som inte är anslutna.</p></div>}
        {data.next_cursor && <button className="sh-button sh-load-more" disabled={dirty || loadingMore} onClick={() => void more(data.next_cursor!)}>{loadingMore ? 'Hämtar…' : 'Visa fler ärenden'}</button>}
      </div>}
      {selectedId && <div className="sh-detail-wrap">{detailLoading && <p className="sh-loading" role="status">Hämtar ärendet…</p>}{detailError && <p role="alert" className="sh-error">{detailError}</p>}{selected && <CaseEditor key={`${selected.id}:${selected.version}`} item={selected} source={data?.sources.find(source => source.id === selected.source_id)} projects={data?.projects ?? []} projectName={data?.projects.find(project => project.id === selected.project_id)?.name ?? selected.project_id} onDirty={onDirty} onClose={() => updateParams({ case: null })} onSaved={item => { setSelected(item); setSaved('Handläggningen är sparad. Inget meddelande har skickats.'); setReload(value => value + 1); }} />}</div>}
    </div>
  </div></AdminShell>;
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, Check, ChevronDown, Clock3, ExternalLink, Globe2, Layers3, RefreshCw, Search, SearchCheck, TrendingUp, TriangleAlert, Users } from 'lucide-react';
import { adminFetch } from '@/lib/adminClient';
import type { AnalyticsSnapshot, MetricPair, PortfolioResponse } from '@/lib/portfolioDashboard';
import { attentionItems, changeLabel, googleLink, healthPresentation, IMPORT_MAX_AGE, isStale, metric, missingData, numberLabel, periodLabel, projectViews, refreshTasks, safeExternalUrl, SOURCE_MAX_AGE, sumMetric, summarySnapshots, timeLabel, type PortfolioSource, type ProjectView, type Tone } from '@/lib/portfolioPresentation';
import '@/styles/portfolio-dashboard.css';
import ProjectManagement, { ProjectLinks, type ManageProject } from './ProjectManagement';
import { useSupportOverview } from '@/lib/supportHub';

type RangeDays = 7 | 28 | 90;
type Filter = 'all' | 'live' | 'attention' | 'missing';
type Progress = { done: number; total: number; failed: number; unchanged: number };
const sourceNames = { ga4: 'Google Analytics', gsc: 'Google Search Console', health: 'Tillgänglighet' };
const stageNames = { live: 'Publicerat', build: 'Under utveckling', internal: 'Internt' };

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`pf-pill pf-tone-${tone}`}><span className="pf-dot" />{children}</span>;
}

function Delta({ pair, reverse = false }: { pair: MetricPair; reverse?: boolean }) {
  const change = changeLabel(pair);
  const tone = change.direction === 'unknown' || change.direction === 'flat' ? 'neutral' : (change.direction === 'up') !== reverse ? 'good' : 'warning';
  return <span className={`pf-delta pf-text-${tone}`}>
    {change.direction === 'up' ? <ArrowUpRight size={14} aria-hidden="true" /> : change.direction === 'down' ? <ArrowDownRight size={14} aria-hidden="true" /> : null}
    {change.label}
  </span>;
}

function Sparkline({ snapshot }: { snapshot?: AnalyticsSnapshot }) {
  const series = snapshot?.series.filter(point => Number.isFinite(point.value));
  if (!series || series.length < 2) return null;
  const max = Math.max(...series.map(point => point.value), 1);
  const points = series.map((point, index) => `${index / (series.length - 1) * 88},${28 - point.value / max * 24}`).join(' ');
  return <svg className="pf-sparkline" viewBox="0 0 88 32" aria-label="Utveckling under perioden" role="img"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SourcePeriod({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return <div className="pf-source-period">
    <p><Clock3 size={14} aria-hidden="true" /><strong>{periodLabel(snapshot)}</strong></p>
    <p>Jämförs med {periodLabel(snapshot, true)}</p>
    <p className={isStale(snapshot.fetchedAt, snapshot.method === 'verified_import' ? IMPORT_MAX_AGE : SOURCE_MAX_AGE[snapshot.source]) ? 'pf-text-warning' : ''}>
      {snapshot.method === 'verified_import' ? 'Importerad rapport' : 'Hämtat från Google'} · {timeLabel(snapshot.fetchedAt)}
    </p>
    {snapshot.method === 'verified_import' && <p>Historiskt underlag från en sparad rapport.</p>}
  </div>;
}

function MetricCell({ label, pair, format = 'number', reverse = false }: { label: string; pair: MetricPair; format?: 'number' | 'percent' | 'decimal'; reverse?: boolean }) {
  const formatValue = (value: number | null) => value === null ? '—' : format === 'percent' ? `${numberLabel(value * 100, 1)} %` : numberLabel(value, format === 'decimal' ? 1 : 0);
  return <div className="pf-detail-metric"><span>{label}</span><strong>{formatValue(pair.current)}</strong><Delta pair={pair} reverse={reverse} /><small>Föregående: {formatValue(pair.previous)}</small></div>;
}

function RankedList({ title, items, valueLabel }: { title: string; items: { label: string; value: number }[]; valueLabel: string }) {
  const [all, setAll] = useState(false);
  return <div className="pf-ranked"><h4>{title}</h4>{items.length ? <>
    <div className="pf-list-label"><span>{title === 'Populära sidor' ? 'Sida' : 'Namn'}</span><span>{valueLabel}</span></div>
    <ol>{(all ? items : items.slice(0, 5)).map((item, index) => <li key={`${item.label}-${index}`}><span title={item.label}>{item.label || '(ej angivet)'}</span><strong>{numberLabel(item.value)}</strong></li>)}</ol>
    {items.length > 5 && <button className="pf-text-button" onClick={() => setAll(!all)}>{all ? 'Visa färre' : `Visa alla ${items.length}`}</button>}
  </> : <p className="pf-muted">Inga detaljer i det här underlaget.</p>}</div>;
}

function QueryList({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const [all, setAll] = useState(false);
  const queries = snapshot.topQueries;
  return <div className="pf-ranked"><h4>Det här söker människor på</h4>{queries.length ? <>
    <div className="pf-query-scroll"><table className="pf-query-table"><thead><tr><th scope="col">Sökning</th><th scope="col">Klick</th><th scope="col">Visningar</th><th scope="col">Position</th></tr></thead><tbody>
      {(all ? queries : queries.slice(0, 8)).map((item, index) => <tr key={`${item.label}-${index}`}><th scope="row">{item.label || '(ej angivet)'}</th><td>{numberLabel(item.value)}</td><td>{numberLabel(item.impressions)}</td><td>{numberLabel(item.position, 1)}</td></tr>)}
    </tbody></table></div>
    {queries.length > 8 && <button className="pf-text-button" onClick={() => setAll(!all)}>{all ? 'Visa färre' : `Visa alla ${queries.length} sökningar`}</button>}
  </> : <p className="pf-muted">Inga sökfrågor i underlaget. Google kan dölja sökningar med få användare.</p>}</div>;
}

function SourceDetail({ view, source, connected, busy, onRefresh }: { view: ProjectView; source: 'ga4' | 'gsc'; connected: boolean; busy: boolean; onRefresh: (source: PortfolioSource) => void }) {
  const snapshot = view[source];
  const mapped = !!(source === 'ga4' ? view.project.ga4PropertyId : view.project.gscSiteUrl);
  const external = googleLink(view.project, source);
  const state = view.states[source];
  return <section className="pf-source-detail" aria-label={sourceNames[source]}>
    <div className="pf-detail-heading"><h3>{source === 'ga4' ? <Users size={18} aria-hidden="true" /> : <SearchCheck size={18} aria-hidden="true" />}{sourceNames[source]}</h3>
      {external && <a className="pf-icon-link" href={external} target="_blank" rel="noopener noreferrer" aria-label={`Öppna ${sourceNames[source]} för ${view.project.name}`}><ExternalLink size={17} /></a>}
    </div>
    {!connected || !mapped ? <div className="pf-connection-note"><span className="pf-dot" />{!connected ? 'Behöver anslutas för automatisk uppdatering' : 'Projektet behöver kopplas till Google'}</div> : <div className="pf-connection-note"><Check size={14} />Anslutning konfigurerad{state?.succeededAt && !state.error ? ` · senast lyckad ${timeLabel(state.succeededAt)}` : ''}</div>}
    {state?.error && <div className="pf-source-error" role="status"><TriangleAlert size={16} /><div><strong>Senaste uppdateringen misslyckades</strong><p>{state.error}</p><small>{timeLabel(state.attemptedAt)}. Sparade värden visas om de finns.</small></div></div>}
    {snapshot ? <>
      <SourcePeriod snapshot={snapshot} />
      <div className="pf-detail-metrics">
        {source === 'ga4' ? <>
          <MetricCell label="Aktiva användare" pair={metric(snapshot, 'activeUsers')} />
          <MetricCell label="Besök (sessioner)" pair={metric(snapshot, 'sessions')} />
          <MetricCell label="Sidvisningar" pair={metric(snapshot, 'screenPageViews')} />
          <MetricCell label="Engagemangsgrad" pair={metric(snapshot, 'engagementRate')} format="percent" />
          <MetricCell label="Viktiga händelser" pair={metric(snapshot, 'keyEvents')} />
        </> : <>
          <MetricCell label="Klick från Google" pair={metric(snapshot, 'clicks')} />
          <MetricCell label="Visningar i Google" pair={metric(snapshot, 'impressions')} />
          <MetricCell label="Andel som klickar" pair={metric(snapshot, 'ctr')} format="percent" />
          <MetricCell label="Genomsnittlig position" pair={metric(snapshot, 'position')} format="decimal" reverse />
        </>}
      </div>
      {source === 'ga4' ? <>
        <RankedList title="Varifrån besökarna kommer" items={snapshot.topSources} valueLabel="Besök" />
        <RankedList title="Populära sidor" items={snapshot.topPages} valueLabel="Visningar" />
        <RankedList title="Händelser på sajten" items={snapshot.topEvents} valueLabel="Antal" />
        <p className="pf-explanation">Aktiva användare visar hur många som använt sajten. Engagemangsgrad är andelen besök med meningsfull aktivitet. Viktiga händelser följer de mål som är inställda i GA4.</p>
      </> : <>
        <QueryList snapshot={snapshot} />
        <RankedList title="Populära sidor" items={snapshot.topPages} valueLabel="Klick" />
        <p className="pf-explanation">Visningar visar hur ofta sajten synts i Googles sökresultat. En lägre position är bättre. Google Search Console har normalt några dagars fördröjning.</p>
      </>}
      {snapshot.notes.length > 0 && <details className="pf-notes"><summary>Om underlaget</summary><ul>{snapshot.notes.map((note, index) => <li key={index}>{note}</li>)}</ul></details>}
    </> : <div className="pf-source-empty"><div className="pf-empty-icon">{source === 'ga4' ? <Users size={23} /> : <SearchCheck size={23} />}</div><h4>{mapped && connected ? 'Ingen rapport för den här perioden' : 'Här kommer projektets statistik'}</h4><p>{!connected ? `${sourceNames[source]} behöver anslutas innan färska siffror kan hämtas.` : !mapped ? 'Koppla rätt egendom till projektet för att visa statistik här.' : 'Uppdatera källan för att hämta vald period från Google.'}</p><p>— betyder att underlag saknas, inte att resultatet är noll.</p></div>}
    <button className="pf-button pf-button-small" disabled={busy || !connected || !mapped} onClick={() => onRefresh(source)}><RefreshCw size={14} />Uppdatera {source.toUpperCase()}</button>
  </section>;
}

function ProjectRow({ view, open, onToggle, connections, busy, onRefresh, onManage, supportCount }: { view: ProjectView; open: boolean; onToggle: () => void; connections: PortfolioResponse['connections']; busy: boolean; onRefresh: (source: PortfolioSource) => void; onManage: ManageProject; supportCount?: number }) {
  const health = healthPresentation(view);
  const site = safeExternalUrl(view.project.url);
  const users = metric(view.ga4, 'activeUsers');
  const clicks = metric(view.gsc, 'clicks');
  const detailId = `portfolio-detail-${view.project.id}`;
  return <article className={`pf-project ${open ? 'pf-project-open' : ''}`}>
    <button className="pf-project-summary" aria-expanded={open} aria-controls={detailId} onClick={onToggle}>
      <span className="pf-project-name"><span className="pf-project-avatar">{view.project.name.slice(0, 1).toLocaleUpperCase('sv-SE')}</span><span><strong>{view.project.name}</strong><span className="pf-project-meta">{site ? new URL(site).hostname.replace(/^www\./, '') : stageNames[view.project.stage]}<span aria-hidden="true"> · </span>{view.project.kind}</span></span></span>
      <span className="pf-project-health"><Pill tone={health.tone}>{health.label}</Pill><small>{view.check ? timeLabel(view.check.checkedAt) : 'Ingen mätning ännu'}</small></span>
      <span className="pf-project-metric"><span className="pf-mobile-label">Aktiva användare</span><span className="pf-value-line"><strong>{numberLabel(users.current)}</strong><Sparkline snapshot={view.ga4} /></span>{view.ga4 ? <Delta pair={users} /> : <small>GA4: underlag saknas</small>}</span>
      <span className="pf-project-metric"><span className="pf-mobile-label">Klick från Google</span><strong>{numberLabel(clicks.current)}</strong>{view.gsc ? <Delta pair={clicks} /> : <small>GSC: underlag saknas</small>}</span>
      <ChevronDown size={18} className="pf-expand-icon" aria-hidden="true" />
    </button>
    <div id={detailId} hidden={!open} className="pf-project-details">
      {open && <>
        <div className="pf-project-links"><span className="pf-stage">{stageNames[view.project.stage]}</span>{site && <a href={site} target="_blank" rel="noopener noreferrer">Öppna webbplats <ExternalLink size={14} /></a>}{view.project.lovableProjectId && /^[\w-]+$/.test(view.project.lovableProjectId) && <a href={`https://lovable.dev/projects/${encodeURIComponent(view.project.lovableProjectId)}`} target="_blank" rel="noopener noreferrer">Lovable <ExternalLink size={14} /></a>}<ProjectLinks project={view.project} supportCount={supportCount} /></div>
        <ProjectManagement project={view.project} onSave={onManage} />
        <div className="pf-health-detail"><Activity size={18} aria-hidden="true" /><div><strong>Tillgänglighet: {health.label.toLocaleLowerCase('sv-SE')}</strong><p>{health.detail}</p><small>Kontrollen visar om webbadressen svarar. Inloggning, betalning och bokning behöver egna funktionskontroller.</small></div>{site && <button className="pf-button pf-button-small" disabled={busy} onClick={() => onRefresh('health')}><RefreshCw size={14} />Kontrollera</button>}</div>
        {view.states.health?.error && <div className="pf-source-error"><TriangleAlert size={16} /><p>{view.states.health.error}</p></div>}
        <div className="pf-source-grid"><SourceDetail view={view} source="ga4" connected={connections.ga4} busy={busy} onRefresh={onRefresh} /><SourceDetail view={view} source="gsc" connected={connections.gsc} busy={busy} onRefresh={onRefresh} /></div>
      </>}
    </div>
  </article>;
}

function OverviewCard({ label, value, description, icon, emphasis = false, children }: { label: string; value: string; description: string; icon: React.ReactNode; emphasis?: boolean; children?: React.ReactNode }) {
  return <div className={`pf-overview-card ${emphasis ? 'pf-overview-dark' : ''}`}><div className="pf-card-label"><span>{label}</span>{icon}</div><strong className="pf-card-value">{value}</strong><p>{description}</p>{children && <div className="pf-card-foot">{children}</div>}</div>;
}

function AggregatePeriod({ views, source }: { views: ProjectView[]; source: 'ga4' | 'gsc' }) {
  const snapshots = summarySnapshots(views, source, source === 'ga4' ? 'activeUsers' : 'clicks');
  const periods = [...new Set(snapshots.map(snapshot => periodLabel(snapshot)))];
  const imports = snapshots.filter(snapshot => snapshot.method === 'verified_import').length;
  const excluded = views.filter(view => metric(view[source], source === 'ga4' ? 'activeUsers' : 'clicks').current !== null).length - snapshots.length;
  return <><span>{periods[0] ?? 'Ingen rapportperiod tillgänglig'}</span>{excluded > 0 && <span>{excluded} äldre rapportperioder ingår inte i summan</span>}{imports > 0 && <span>{imports} importerade rapporter</span>}</>;
}

export default function PortfolioDashboard({ managementMode = false }: { managementMode?: boolean }) {
  const { data: supportData } = useSupportOverview(managementMode);
  const [rangeDays, setRangeDays] = useState<RangeDays>(28);
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNote, setRefreshNote] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(managementMode ? 'live' : 'all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [allAttention, setAllAttention] = useState(false);
  const [reload, setReload] = useState(0);
  const busyRef = useRef(false);
  const autoAttempted = useRef(new Set<string>());
  const refreshAbort = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const rangeRef = useRef(rangeDays);
  rangeRef.current = rangeDays;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; refreshAbort.current?.abort(); }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    adminFetch('admin-portfolio', { method: 'POST', body: JSON.stringify({ action: 'overview', rangeDays }), signal: controller.signal })
      .then((result: PortfolioResponse) => {
        if (!Array.isArray(result?.projects) || !Array.isArray(result.snapshots) || !Array.isArray(result.checks) || !Array.isArray(result.sourceStates) || !result.connections) throw new Error('Översikten gav ett oväntat svar. Försök igen.');
        if (!controller.signal.aborted) setData(result);
      })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Översikten kunde inte hämtas.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [rangeDays, reload]);

  const views = useMemo(() => data ? projectViews(data, rangeDays) : [], [data, rangeDays]);
  const alerts = useMemo(() => attentionItems(views), [views]);
  const attentionIds = useMemo(() => new Set(alerts.filter(alert => alert.tone !== 'good').map(alert => alert.projectId)), [alerts]);
  const priority = useMemo(() => new Map(views.map(view => [view.project.id, alerts.filter(alert => alert.projectId === view.project.id).reduce((score, alert) => Math.max(score, alert.tone === 'danger' ? 3 : alert.tone === 'warning' ? 2 : 0), 0)])), [views, alerts]);

  const runRefresh = useCallback(async (tasks: { projectId: string; source: PortfolioSource }[]) => {
    if (busyRef.current || !tasks.length) return;
    busyRef.current = true;
    const controller = new AbortController();
    refreshAbort.current = controller;
    const currentRange = rangeRef.current;
    let next = 0;
    let done = 0;
    let failed = 0;
    let unchanged = 0;
    setRefreshNote(null); setProgress({ done, total: tasks.length, failed, unchanged });
    const worker = async () => {
      while (next < tasks.length && !controller.signal.aborted) {
        const task = tasks[next++];
        const started = Date.now();
        const requestController = new AbortController();
        const cancelRequest = () => requestController.abort();
        controller.signal.addEventListener('abort', cancelRequest, { once: true });
        const requestTimeout = window.setTimeout(cancelRequest, 40_000);
        try {
          const result = await adminFetch('admin-portfolio', { method: 'POST', body: JSON.stringify({ action: 'refresh', ...task, rangeDays: currentRange }), signal: requestController.signal }) as PortfolioResponse;
          const state = result.sourceStates?.find(row => row.projectId === task.projectId && row.source === task.source);
          if (state?.error || !state?.succeededAt) failed++;
          else if (Date.parse(state.succeededAt) < started - 1000) unchanged++;
          if (result.projects && result.snapshots && result.checks && result.sourceStates && result.connections && mounted.current && !controller.signal.aborted) setData(result);
        } catch { if (!controller.signal.aborted) failed++; }
        finally { window.clearTimeout(requestTimeout); controller.signal.removeEventListener('abort', cancelRequest); }
        done++;
        if (mounted.current && !controller.signal.aborted) setProgress({ done, total: tasks.length, failed, unchanged });
      }
    };
    await Promise.all([worker(), worker()]);
    if (mounted.current && !controller.signal.aborted) {
      setRefreshNote(`${done - failed - unchanged} av ${done} källor uppdaterades.${failed ? ` ${failed} kunde inte uppdateras; sparat underlag visas.` : ''}${unchanged ? ` ${unchanged} var nyligen uppdaterade och hämtades inte på nytt.` : ''}`);
      setReload(value => value + 1);
      setProgress(null);
    }
    busyRef.current = false;
  }, []);

  useEffect(() => {
    if (!data || loading || busyRef.current) return;
    const tasks = refreshTasks(views, data.connections, true).filter(task => !autoAttempted.current.has(`${rangeDays}:${task.projectId}:${task.source}`));
    tasks.forEach(task => autoAttempted.current.add(`${rangeDays}:${task.projectId}:${task.source}`));
    if (tasks.length) void runRefresh(tasks);
  }, [data, views, loading, rangeDays, runRefresh]);

  const filteredViews = views.filter(view => {
    const matches = `${view.project.name} ${view.project.url ?? ''} ${view.project.kind}`.toLocaleLowerCase('sv-SE').includes(query.trim().toLocaleLowerCase('sv-SE'));
    return matches && (filter === 'all' || filter === 'live' && view.project.stage === 'live' || filter === 'attention' && attentionIds.has(view.project.id) || filter === 'missing' && missingData(view));
  }).sort((a, b) => (priority.get(b.project.id) ?? 0) - (priority.get(a.project.id) ?? 0) || a.project.name.localeCompare(b.project.name, 'sv'));
  const users = sumMetric(views, 'ga4', 'activeUsers');
  const clicks = sumMetric(views, 'gsc', 'clicks');
  const liveCount = views.filter(view => view.project.stage === 'live').length;
  const checkable = views.filter(view => !!safeExternalUrl(view.project.url));
  const freshChecks = checkable.filter(view => view.check && !isStale(view.check.checkedAt, SOURCE_MAX_AGE.health));
  const healthy = freshChecks.filter(view => view.check?.status === 'healthy').length;
  const busy = !!progress;
  const manageProject: ManageProject = async (projectId, expectedVersion, management) => {
    const result: PortfolioResponse = await adminFetch('admin-portfolio', { method: 'POST', body: JSON.stringify({ action: 'manage', projectId, expectedVersion, management, rangeDays }) });
    const saved = result.projects?.find(project => project.id === projectId)?.management;
    if (!saved) throw new Error('Servern bekräftade inte den sparade projektplanen.');
    if (mounted.current) setData(result);
    return saved;
  };
  const openProject = (id: string) => {
    setQuery(''); setFilter('all'); setExpanded(previous => new Set([...previous, id]));
    window.setTimeout(() => document.getElementById(`portfolio-detail-${id}`)?.closest('article')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  return <section className="pf-dashboard" aria-labelledby="portfolio-heading">
    <div className="pf-header"><div><p className="pf-eyebrow">Aurora Media · Projektportfölj</p><h2 id="portfolio-heading">{managementMode ? 'Ett projekt i taget' : 'Din dagliga överblick'}<span className="pf-heading-dot">.</span></h2><p className="pf-subtitle">{managementMode ? 'Webbplats, kod, support och nästa steg. Publicerade projekt visas först; hela registret finns under Alla.' : 'Trafik, synlighet och tillgänglighet. Alla dina projekt på samma plats.'}</p></div><span className="pf-today">{new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(new Date())}</span></div>
    <div className="pf-toolbar"><div className="pf-ranges" role="group" aria-label="Rapportperiod">{([7, 28, 90] as const).map(days => <button key={days} className={days === rangeDays ? 'pf-selected' : ''} aria-pressed={days === rangeDays} disabled={busy} onClick={() => setRangeDays(days)}>{days} dagar</button>)}</div><div className="pf-toolbar-right"><span className="pf-muted">Jämfört med föregående lika långa period</span><button className="pf-button pf-button-primary" disabled={!data || busy || loading} onClick={() => { if (data) { const tasks = refreshTasks(views, data.connections, false); if (tasks.length) void runRefresh(tasks); else setRefreshNote('Inga källor är anslutna för uppdatering ännu.'); } }}><RefreshCw size={16} className={busy ? 'pf-spin' : ''} />{busy ? `Uppdaterar ${progress.done}/${progress.total}` : 'Uppdatera allt'}</button></div></div>
    <div className="pf-refresh-status" role="status" aria-live="polite">{progress ? <><span>Hämtar projektens data. Du kan läsa översikten under tiden.</span><progress max={progress.total} value={progress.done} aria-label="Uppdaterade datakällor" /></> : refreshNote ? <span>{refreshNote}</span> : data ? <span>Översikt hämtad {timeLabel(data.generatedAt)} · Äldre kontroller uppdateras när du öppnar sidan.</span> : <span>{loading ? 'Hämtar projekt och sparade rapporter…' : ''}</span>}</div>
    {error && <div className="pf-error" role="alert"><TriangleAlert size={20} /><div><strong>Översikten kunde inte uppdateras</strong><p>{error}{data ? ' Senast hämtade underlag visas nedan.' : ''}</p></div><button className="pf-button pf-button-small" onClick={() => setReload(value => value + 1)} disabled={loading}>Försök igen</button></div>}
    {loading && !data && <div className="pf-loading" aria-busy="true"><RefreshCw size={22} className="pf-spin" /><p>Samlar dina projekt…</p></div>}
    {data && <>
      {!managementMode && <>
      <div className="pf-overview-grid">
        <OverviewCard label="Hela portföljen" value={numberLabel(views.length)} description={`${liveCount} publicerade · ${views.length - liveCount} under utveckling eller interna`} icon={<Layers3 size={20} />} emphasis><span>{attentionIds.size ? `${attentionIds.size} projekt att följa upp` : 'Se mätt status och datatäckning nedan'}</span></OverviewCard>
        <OverviewCard label="Aktiva användare · GA4" value={numberLabel(users.value)} description={`Summa för ${users.covered} av ${views.length} projekt. En person kan räknas i flera projekt.`} icon={<Users size={20} />}><AggregatePeriod views={views} source="ga4" /></OverviewCard>
        <OverviewCard label="Klick från Google · GSC" value={numberLabel(clicks.value)} description={`${clicks.covered} av ${views.length} projekt ingår i summan för perioden nedan.`} icon={<SearchCheck size={20} />}><AggregatePeriod views={views} source="gsc" /></OverviewCard>
        <OverviewCard label="Tillgänglighet just nu" value={freshChecks.length ? `${healthy} / ${checkable.length}` : '—'} description={freshChecks.length ? `Webbplatser som svarar. ${freshChecks.length} av ${checkable.length} har färsk kontroll.` : 'Inga färska kontroller. Okänd status räknas aldrig som fungerande.'} icon={<Activity size={20} />}><span>{checkable.length - freshChecks.length} saknar färsk kontroll · {views.length - checkable.length} saknar publik URL</span></OverviewCard>
      </div>
      {(!data.connections.ga4 || !data.connections.gsc) && <div className="pf-connection-banner"><Globe2 size={20} aria-hidden="true" /><div><strong>{!data.connections.ga4 && !data.connections.gsc ? 'Anslut Google för löpande statistik' : `${!data.connections.ga4 ? 'Google Analytics' : 'Search Console'} behöver anslutas`}</strong><p>Importerade rapporter visas med sin egen period och importtid. Automatisk hämtning av färska siffror kräver en anslutning.</p></div><div className="pf-connection-pills"><Pill tone={data.connections.ga4 ? 'good' : 'warning'}>GA4 {data.connections.ga4 ? 'anslutet' : 'ej anslutet'}</Pill><Pill tone={data.connections.gsc ? 'good' : 'warning'}>GSC {data.connections.gsc ? 'anslutet' : 'ej anslutet'}</Pill></div></div>}
      <section className="pf-attention" aria-labelledby="pf-attention-heading"><div className="pf-section-heading"><div><h3 id="pf-attention-heading">Börja här idag <span className="pf-count">{alerts.length}</span></h3><p>Uppmätta avvikelser och förändringar att följa upp.</p></div>{alerts.length > 5 && <button className="pf-text-button" onClick={() => setAllAttention(value => !value)}>{allAttention ? 'Visa färre' : `Visa alla ${alerts.length}`}</button>}</div>
        {alerts.length ? <div className="pf-attention-list">{(allAttention ? alerts : alerts.slice(0, 5)).map(alert => <button key={alert.id} className={`pf-attention-item pf-attention-${alert.tone}`} onClick={() => openProject(alert.projectId)}><span className="pf-attention-symbol">{alert.tone === 'good' ? <TrendingUp size={18} /> : <TriangleAlert size={18} />}</span><span><strong>{views.find(view => view.project.id === alert.projectId)?.project.name}<span> · {alert.title}</span></strong><span className="pf-attention-description">{alert.detail}</span></span><ArrowUpRight size={18} aria-hidden="true" /></button>)}</div> : <div className="pf-no-alerts"><Check size={18} /><p>Inga avvikelser hittades i det tillgängliga underlaget. {views.filter(missingData).length} projekt saknar delar av sin statistik; deras resultat är ännu okända.</p></div>}
      </section>
      </>}
      <section className="pf-projects" aria-labelledby="pf-projects-heading"><div className="pf-section-heading"><div><h3 id="pf-projects-heading">Alla projekt <span className="pf-count">{views.length}</span></h3><p>{managementMode ? 'Öppna ett projekt för länkar, ärenden, privat arbetsplan och statistik.' : 'Öppna ett projekt för siffror, sökningar, trafikkällor och kontroller.'}</p></div><label className="pf-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Sök projekt</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Sök projekt eller domän…" type="search" /></label></div>
        <div className="pf-filters" role="group" aria-label="Filtrera projekt">{([{ id: 'all', label: 'Alla', count: views.length }, { id: 'live', label: 'Publicerade', count: liveCount }, { id: 'attention', label: 'Att följa upp', count: attentionIds.size }, { id: 'missing', label: 'Saknar underlag', count: views.filter(missingData).length }] as const).map(item => <button key={item.id} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={filter === item.id ? 'pf-filter-active' : ''}>{item.label}<span>{item.count}</span></button>)}</div>
        <div className="pf-table-heading" aria-hidden="true"><span>Projekt</span><span>Tillgänglighet</span><span>Aktiva användare · GA4</span><span>Google-klick · GSC</span><span /></div>
        <div className="pf-project-list">{filteredViews.map(view => <ProjectRow key={view.project.id} view={view} open={expanded.has(view.project.id)} onToggle={() => setExpanded(previous => { const next = new Set(previous); if (next.has(view.project.id)) next.delete(view.project.id); else next.add(view.project.id); return next; })} connections={data.connections} busy={busy} onRefresh={source => void runRefresh([{ projectId: view.project.id, source }])} onManage={manageProject} supportCount={supportData?.project_counts?.[view.project.id]?.open} />)}</div>
        {!filteredViews.length && <div className="pf-filter-empty"><Search size={24} /><h4>Inga projekt matchar urvalet</h4><button className="pf-text-button" onClick={() => { setQuery(''); setFilter('all'); }}>Visa alla projekt</button></div>}
        <div className="pf-list-footer"><span>Visar {filteredViews.length} av {views.length} projekt</span><span>— = saknat underlag · 0 = uppmätt noll</span></div>
      </section>
    </>}
  </section>;
}

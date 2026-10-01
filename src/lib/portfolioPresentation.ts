import type { AnalyticsSnapshot, MetricPair, PortfolioCheck, PortfolioProject, PortfolioResponse, SourceState } from './portfolioDashboard';

export type PortfolioSource = 'ga4' | 'gsc' | 'health';
export type Tone = 'good' | 'warning' | 'danger' | 'neutral';
export type ProjectView = {
  project: PortfolioProject;
  ga4?: AnalyticsSnapshot;
  gsc?: AnalyticsSnapshot;
  check?: PortfolioCheck;
  states: Partial<Record<PortfolioSource, SourceState>>;
};
export type AttentionItem = { id: string; projectId: string; title: string; detail: string; tone: Tone };
export const SOURCE_MAX_AGE = { health: 15 * 60_000, ga4: 6 * 60 * 60_000, gsc: 6 * 60 * 60_000 };
export const IMPORT_MAX_AGE = 48 * 60 * 60_000;

export function metric(snapshot: AnalyticsSnapshot | undefined, key: string): MetricPair {
  const pair = snapshot?.metrics[key];
  return { current: finite(pair?.current), previous: finite(pair?.previous) };
}

function finite(value: number | undefined | null): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function numberLabel(value: number | null | undefined, digits = 0): string {
  return finite(value) === null ? '—' : new Intl.NumberFormat('sv-SE', { maximumFractionDigits: digits }).format(value as number);
}

export function changeLabel(pair: MetricPair): { label: string; direction: 'up' | 'down' | 'flat' | 'unknown'; percent: number | null } {
  const current = finite(pair.current);
  const previous = finite(pair.previous);
  if (current === null || previous === null) return { label: 'Jämförelse saknas', direction: 'unknown', percent: null };
  if (current === previous) return { label: 'Oförändrat', direction: 'flat', percent: 0 };
  if (previous === 0) return { label: 'Tidigare 0', direction: current > 0 ? 'up' : 'down', percent: null };
  const percent = (current - previous) / Math.abs(previous) * 100;
  return { label: `${percent > 0 ? '+' : '−'}${numberLabel(Math.abs(percent), 1)} %`, direction: percent > 0 ? 'up' : 'down', percent };
}

export function isStale(timestamp: string | null | undefined, maxAge: number, now = Date.now()): boolean {
  const time = timestamp ? Date.parse(timestamp) : NaN;
  return !Number.isFinite(time) || time > now + 60_000 || now - time > maxAge;
}

export function timeLabel(timestamp: string | null | undefined): string {
  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return 'Tid saknas';
  return new Intl.DateTimeFormat('sv-SE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Stockholm' }).format(new Date(timestamp));
}

export function periodLabel(snapshot: AnalyticsSnapshot | undefined, previous = false): string {
  if (!snapshot) return 'Period saknas';
  const start = previous ? snapshot.previousStart : snapshot.periodStart;
  const end = previous ? snapshot.previousEnd : snapshot.periodEnd;
  if (!start || !end || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end))) return 'Period saknas';
  const format = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return `${format.format(new Date(start))} – ${format.format(new Date(end))}`;
}

export function safeExternalUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function googleLink(project: PortfolioProject, source: 'ga4' | 'gsc'): string | null {
  if (source === 'ga4') {
    const id = project.ga4PropertyId?.replace(/^properties\//, '');
    return id && /^\d+$/.test(id) ? `https://analytics.google.com/analytics/web/#/p${id}/reports/intelligenthome` : null;
  }
  return project.gscSiteUrl ? `https://search.google.com/search-console/performance/search-analytics?resource_id=${encodeURIComponent(project.gscSiteUrl)}` : null;
}

export function projectViews(data: PortfolioResponse, rangeDays: number): ProjectView[] {
  return data.projects.map(project => {
    const snapshots = data.snapshots.filter(row => row.projectId === project.id && row.rangeDays === rangeDays && (row.method !== 'verified_import' || rangeDays === 28));
    const newest = <T extends { fetchedAt: string }>(rows: T[]) => rows.sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0];
    return {
      project,
      ga4: newest(snapshots.filter(row => row.source === 'ga4')),
      gsc: newest(snapshots.filter(row => row.source === 'gsc')),
      check: data.checks.filter(row => row.projectId === project.id).sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))[0],
      states: Object.fromEntries(data.sourceStates.filter(row => row.projectId === project.id && (row.source === 'health' || row.rangeDays === rangeDays)).sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt)).map(row => [row.source, row])),
    };
  });
}

export function summarySnapshots(views: ProjectView[], source: 'ga4' | 'gsc', key: string): AnalyticsSnapshot[] {
  const snapshots = views.map(view => view[source]).filter((snapshot): snapshot is AnalyticsSnapshot => !!snapshot && metric(snapshot, key).current !== null);
  const latest = [...snapshots].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd) || b.periodStart.localeCompare(a.periodStart))[0];
  return latest ? snapshots.filter(snapshot => snapshot.periodStart === latest.periodStart && snapshot.periodEnd === latest.periodEnd) : [];
}

export function sumMetric(views: ProjectView[], source: 'ga4' | 'gsc', key: string): { value: number | null; covered: number } {
  const values = summarySnapshots(views, source, key).map(snapshot => metric(snapshot, key).current).filter((value): value is number => value !== null);
  return { value: values.length ? values.reduce((sum, value) => sum + value, 0) : null, covered: values.length };
}

export function healthPresentation(view: ProjectView, now = Date.now()): { label: string; tone: Tone; detail: string } {
  if (!view.project.url) return { label: 'Ingen publik URL', tone: 'neutral', detail: 'Tillgänglighet kan inte kontrolleras utan webbadress.' };
  if (!view.check) return { label: 'Ej kontrollerad', tone: 'neutral', detail: 'Ingen tillgänglighetskontroll har sparats.' };
  if (isStale(view.check.checkedAt, SOURCE_MAX_AGE.health, now)) return { label: 'Äldre kontroll', tone: 'warning', detail: `Senast ${timeLabel(view.check.checkedAt)}. Status då: ${view.check.status === 'healthy' ? 'svarade' : view.check.status === 'down' ? 'svarade inte' : 'avvikelse'}.` };
  const labels = { healthy: 'Svarar', degraded: 'Avvikelse', down: 'Svarar inte' };
  const tones = { healthy: 'good', degraded: 'warning', down: 'danger' } as const;
  return { label: labels[view.check.status], tone: tones[view.check.status], detail: view.check.issues.join(' · ') || `HTTP ${view.check.httpStatus ?? '—'} · ${numberLabel(view.check.durationMs)} ms` };
}

export function missingData(view: ProjectView): boolean {
  return !view.ga4 || !view.gsc || (!!view.project.url && !view.check);
}

export function attentionItems(views: ProjectView[], now = Date.now()): AttentionItem[] {
  const result: AttentionItem[] = [];
  for (const view of views) {
    const add = (id: string, title: string, detail: string, tone: Tone) => result.push({ id: `${view.project.id}:${id}`, projectId: view.project.id, title, detail, tone });
    const health = healthPresentation(view, now);
    if (health.tone === 'danger' || health.tone === 'warning') add('health', health.label, health.detail, health.tone);
    for (const source of ['ga4', 'gsc', 'health'] as const) {
      const state = view.states[source];
      if (state?.error) add(`${source}-error`, `${source === 'health' ? 'Tillgänglighetskontrollen' : source.toUpperCase()} kunde inte uppdateras`, state.error, 'warning');
      const snapshot = source === 'health' ? undefined : view[source];
      if (snapshot && !state?.error && isStale(snapshot.fetchedAt, snapshot.method === 'verified_import' ? IMPORT_MAX_AGE : SOURCE_MAX_AGE[source], now)) add(`${source}-stale`, `${source.toUpperCase()}: äldre underlag`, `${snapshot.method === 'verified_import' ? 'Importerad rapport' : 'Senast hämtad'} ${timeLabel(snapshot.fetchedAt)}.`, 'warning');
    }
    const traffic = metric(view.ga4, 'activeUsers');
    const trafficChange = changeLabel(traffic);
    if (trafficChange.percent !== null && trafficChange.percent <= -20 && (traffic.previous ?? 0) >= 20) add('traffic', 'Färre aktiva användare', `${trafficChange.label}: ${numberLabel(traffic.current)} mot ${numberLabel(traffic.previous)} föregående period. ${periodLabel(view.ga4)}.`, 'warning');
    const clicks = metric(view.gsc, 'clicks');
    const searchChange = changeLabel(clicks);
    if (searchChange.percent !== null && searchChange.percent >= 20 && (clicks.current ?? 0) - (clicks.previous ?? 0) >= 5) add('seo-growth', 'Fler klick från Google', `${searchChange.label}: ${numberLabel(clicks.current)} mot ${numberLabel(clicks.previous)} föregående period. ${periodLabel(view.gsc)}.`, 'good');
  }
  const rank: Record<Tone, number> = { danger: 0, warning: 1, good: 2, neutral: 3 };
  return result.sort((a, b) => rank[a.tone] - rank[b.tone]);
}

export function refreshTasks(views: ProjectView[], connections: PortfolioResponse['connections'], onlyStale: boolean, now = Date.now()) {
  const tasks: { projectId: string; source: PortfolioSource }[] = [];
  for (const view of views) for (const source of ['health', 'ga4', 'gsc'] as const) {
    const available = source === 'health' ? !!safeExternalUrl(view.project.url) : connections[source] && !!(source === 'ga4' ? view.project.ga4PropertyId : view.project.gscSiteUrl);
    if (!available) continue;
    const timestamp = source === 'health' ? view.check?.checkedAt : view[source]?.fetchedAt;
    const lastAttempt = view.states[source]?.attemptedAt;
    const imported = source !== 'health' && view[source]?.method === 'verified_import';
    if (!onlyStale || ((imported || isStale(timestamp, SOURCE_MAX_AGE[source], now)) && isStale(lastAttempt, SOURCE_MAX_AGE[source], now))) tasks.push({ projectId: view.project.id, source });
  }
  return tasks;
}

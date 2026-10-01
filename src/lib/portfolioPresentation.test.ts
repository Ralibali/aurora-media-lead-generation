import { describe, expect, it } from 'vitest';
import type { AnalyticsSnapshot, PortfolioResponse } from './portfolioDashboard';
import { attentionItems, changeLabel, googleLink, healthPresentation, IMPORT_MAX_AGE, isStale, metric, missingData, numberLabel, periodLabel, projectViews, refreshTasks, safeExternalUrl, SOURCE_MAX_AGE, sumMetric, type ProjectView } from './portfolioPresentation';

const now = Date.parse('2026-10-01T12:00:00Z');
const project = { id: 'aurora', name: 'Aurora Media', url: 'https://auroramedia.se', kind: 'Företag', stage: 'live' as const, ga4PropertyId: '123456', gscSiteUrl: 'sc-domain:auroramedia.se' };
const snapshot = (changes: Partial<AnalyticsSnapshot> = {}): AnalyticsSnapshot => ({
  projectId: project.id, source: 'ga4', rangeDays: 28, periodStart: '2026-09-03', periodEnd: '2026-09-30', previousStart: '2026-08-06', previousEnd: '2026-09-02', fetchedAt: '2026-10-01T11:00:00Z', method: 'api',
  metrics: { activeUsers: { current: 100, previous: 80 } }, series: [], topPages: [], topQueries: [], topSources: [], topEvents: [], notes: [], ...changes,
});
const view = (changes: Partial<ProjectView> = {}): ProjectView => ({ project, ga4: snapshot(), states: {}, ...changes });
const response = (changes: Partial<PortfolioResponse> = {}): PortfolioResponse => ({ projects: [project], snapshots: [], checks: [], sourceStates: [], generatedAt: new Date(now).toISOString(), connections: { ga4: true, gsc: true }, ...changes });

describe('portfolio metrics preserve the evidence', () => {
  it('distinguishes a measured zero from missing or non-finite data', () => {
    expect(numberLabel(0)).toBe('0');
    expect(numberLabel(null)).toBe('—');
    expect(metric(undefined, 'activeUsers')).toEqual({ current: null, previous: null });
    expect(metric(snapshot({ metrics: { activeUsers: { current: 0, previous: Infinity } } }), 'activeUsers')).toEqual({ current: 0, previous: null });
  });
  it('never manufactures a percentage when the previous period is zero or unknown', () => {
    expect(changeLabel({ current: 12, previous: 0 })).toEqual({ label: 'Tidigare 0', direction: 'up', percent: null });
    expect(changeLabel({ current: 0.04, previous: 0 })).toEqual({ label: 'Tidigare 0', direction: 'up', percent: null });
    expect(changeLabel({ current: 0, previous: 0 }).percent).toBe(0);
    expect(changeLabel({ current: 12, previous: null }).direction).toBe('unknown');
    expect(changeLabel({ current: 0, previous: 12 }).percent).toBe(-100);
  });
  it('sums only measured values, with explicit coverage', () => {
    expect(sumMetric([view({ ga4: undefined })], 'ga4', 'activeUsers')).toEqual({ value: null, covered: 0 });
    expect(sumMetric([view({ ga4: snapshot({ metrics: { activeUsers: { current: 0, previous: 10 } } }) }), view({ ga4: undefined })], 'ga4', 'activeUsers')).toEqual({ value: 0, covered: 1 });
  });
  it('does not combine an old imported period with a freshly fetched period', () => {
    const old = view({ ga4: snapshot({ method: 'verified_import' }) });
    const fresh = view({ ga4: snapshot({ periodStart: '2026-09-13', periodEnd: '2026-10-10', metrics: { activeUsers: { current: 7, previous: 2 } } }) });
    expect(sumMetric([old, fresh], 'ga4', 'activeUsers')).toEqual({ value: 7, covered: 1 });
  });
  it('also requires period starts to match before combining reports', () => {
    expect(sumMetric([view(), view({ ga4: snapshot({ periodStart: '2026-09-04', metrics: { activeUsers: { current: 5, previous: null } } }) })], 'ga4', 'activeUsers')).toEqual({ value: 5, covered: 1 });
  });
  it('selects the newest snapshot only for the chosen source and range', () => {
    const rows = projectViews(response({ snapshots: [snapshot(), snapshot({ fetchedAt: '2026-10-01T11:59:00Z' }), snapshot({ rangeDays: 7, fetchedAt: '2026-10-01T12:00:00Z' })] }), 28);
    expect(rows[0].ga4?.fetchedAt).toBe('2026-10-01T11:59:00Z');
    expect(rows[0].gsc).toBeUndefined();
  });
  it('does not reuse imported 28-day data for the 7- or 90-day view', () => {
    expect(projectViews(response({ snapshots: [snapshot({ method: 'verified_import' })] }), 7)[0].ga4).toBeUndefined();
    expect(projectViews(response({ snapshots: [snapshot({ method: 'verified_import', rangeDays: 90 })] }), 90)[0].ga4).toBeUndefined();
  });
  it('shows source-specific dates and has a truthful unknown fallback', () => {
    const text = periodLabel(snapshot());
    expect(text).toContain('3 sep. 2026');
    expect(text).toContain('30 sep. 2026');
    expect(periodLabel(snapshot(), true)).toContain('6 aug. 2026');
    expect(periodLabel(undefined)).toBe('Period saknas');
  });
});

describe('portfolio availability, freshness and attention', () => {
  it('treats absent, invalid and future times as unknown/stale', () => {
    expect(isStale(undefined, SOURCE_MAX_AGE.health, now)).toBe(true);
    expect(isStale('invalid', SOURCE_MAX_AGE.health, now)).toBe(true);
    expect(isStale('2026-10-02T12:00:00Z', SOURCE_MAX_AGE.health, now)).toBe(true);
    expect(isStale('2026-10-01T11:50:00Z', SOURCE_MAX_AGE.health, now)).toBe(false);
    expect(isStale('2026-10-01T11:40:00Z', SOURCE_MAX_AGE.health, now)).toBe(true);
  });
  it('never calls an unmeasured or old site healthy', () => {
    expect(healthPresentation(view(), now).tone).toBe('neutral');
    expect(healthPresentation(view({ check: { projectId: project.id, checkedAt: '2026-09-30T12:00:00Z', status: 'healthy', httpStatus: 200, durationMs: 300, issues: [] } }), now).label).toBe('Äldre kontroll');
  });
  it('does not create an availability alert for an internal project without a URL', () => {
    const internal = view({ project: { ...project, url: null, stage: 'internal' }, ga4: undefined });
    expect(attentionItems([internal], now)).toEqual([]);
    expect(healthPresentation(internal, now).label).toBe('Ingen publik URL');
  });
  it('does not call a few-hour-old import stale but warns after 48 hours', () => {
    expect(IMPORT_MAX_AGE).toBe(48 * 60 * 60_000);
    expect(attentionItems([view({ ga4: snapshot({ method: 'verified_import', fetchedAt: '2026-10-01T00:00:00Z' }) })], now)).toEqual([]);
    expect(attentionItems([view({ ga4: snapshot({ method: 'verified_import', fetchedAt: '2026-09-28T00:00:00Z' }) })], now)[0].id).toContain('ga4-stale');
  });
  it('raises a traffic drop only when a meaningful comparison exists', () => {
    expect(attentionItems([view({ ga4: snapshot({ metrics: { activeUsers: { current: 50, previous: 100 } } }) })], now).some(item => item.id.endsWith(':traffic'))).toBe(true);
    expect(attentionItems([view({ ga4: snapshot({ metrics: { activeUsers: { current: 0, previous: 1 } } }) })], now)).toEqual([]);
    expect(attentionItems([view({ ga4: snapshot({ metrics: { activeUsers: { current: 0, previous: null } } }) })], now)).toEqual([]);
  });
  it('puts a measured outage before search growth', () => {
    const row = view({ check: { projectId: project.id, checkedAt: '2026-10-01T11:58:00Z', status: 'down', httpStatus: 500, durationMs: 200, issues: ['Serverfel'] }, gsc: snapshot({ source: 'gsc', metrics: { clicks: { current: 30, previous: 20 } } }) });
    const items = attentionItems([row], now);
    expect(items.map(item => item.tone)).toEqual(['danger', 'good']);
  });
  it('keeps another source and measured zero available when one source fails', () => {
    const row = view({ gsc: snapshot({ source: 'gsc', metrics: { clicks: { current: 0, previous: null } } }), states: { ga4: { projectId: project.id, source: 'ga4', rangeDays: 28, attemptedAt: '2026-10-01T11:59:00Z', succeededAt: null, error: 'Behörighet saknas' } } });
    expect(metric(row.gsc, 'clicks').current).toBe(0);
    expect(attentionItems([row], now)[0].detail).toBe('Behörighet saknas');
    expect(missingData(row)).toBe(true);
  });
});

describe('portfolio safe refresh and links', () => {
  it('refreshes available missing sources and never disconnected Google sources', () => {
    expect(refreshTasks([view({ ga4: undefined })], { ga4: false, gsc: false }, true, now)).toEqual([{ projectId: project.id, source: 'health' }]);
    expect(refreshTasks([view({ ga4: undefined })], { ga4: true, gsc: true }, true, now)).toHaveLength(3);
  });
  it('refreshes a fresh imported report immediately once the source is connected', () => {
    expect(refreshTasks([view({ ga4: snapshot({ method: 'verified_import' }) })], { ga4: true, gsc: false }, true, now)).toContainEqual({ projectId: project.id, source: 'ga4' });
  });
  it('does not automatically retry recent failed attempts', () => {
    const row = view({ ga4: undefined, states: { ga4: { projectId: project.id, source: 'ga4', rangeDays: 28, attemptedAt: '2026-10-01T11:58:00Z', succeededAt: null, error: 'Permission denied' } } });
    expect(refreshTasks([row], { ga4: true, gsc: false }, true, now)).not.toContainEqual({ projectId: project.id, source: 'ga4' });
    expect(refreshTasks([row], { ga4: true, gsc: false }, false, now)).toContainEqual({ projectId: project.id, source: 'ga4' });
  });
  it('rejects executable and credential-bearing URLs', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('https://user:secret@example.com')).toBeNull();
    expect(safeExternalUrl('https://auroramedia.se')).toBe('https://auroramedia.se/');
    expect(googleLink({ ...project, ga4PropertyId: 'javascript:123' }, 'ga4')).toBeNull();
    expect(googleLink(project, 'gsc')).toContain('resource_id=sc-domain%3Aauroramedia.se');
  });
});

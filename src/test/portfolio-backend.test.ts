// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { authorized, connectionStatus, fetchGa4, fetchGsc, gaTotals, gscTotals, reportPeriods, requestJson, safeSourceError, validRange } from '../../supabase/functions/admin-portfolio/analytics';
import type { PortfolioProject } from '../../supabase/functions/_shared/portfolio-types';

const project: PortfolioProject = { id: 'test', name: 'Test', url: 'https://example.com', kind: 'site', stage: 'live', ga4PropertyId: '123456', gscSiteUrl: 'sc-domain:example.com' };
const fixedNow = new Date('2026-10-01T12:00:00Z');
const oauth = (name: string) => ({ GOOGLE_ANALYTICS_CLIENT_ID: 'client', GOOGLE_ANALYTICS_CLIENT_SECRET: 'secret', GOOGLE_ANALYTICS_REFRESH_TOKEN: 'refresh' })[name];
const gscEnv = (name: string) => ({ LOVABLE_API_KEY: 'lovable', GOOGLE_SEARCH_CONSOLE_API_KEY: 'connection' })[name];
const reportRow = (metrics: (number | string)[], dimension?: string) => ({
  ...(dimension ? { dimensionValues: [{ value: dimension }] } : {}), metricValues: metrics.map(value => ({ value: String(value) })),
});

describe('portfolio authentication and periods', () => {
  it('fails closed for absent/empty/wrong passwords while allowing either configured admin key', () => {
    expect(authorized('', [undefined, ''])).toBe(false);
    expect(authorized('secret', ['secret!', undefined])).toBe(false);
    expect(authorized('secret', ['', 'secret'])).toBe(true);
    expect(authorized('secret', ['secret', 'other'])).toBe(true);
    expect(authorized('secre', ['secret'])).toBe(false);
  });

  it('allows only supported integer periods and compares nonoverlapping inclusive windows', () => {
    expect(validRange(28)).toBe(true);
    expect(validRange('28')).toBe(false);
    expect(validRange(365)).toBe(false);
    expect(reportPeriods(28, 'ga4', fixedNow)).toEqual({ periodStart: '2026-09-03', periodEnd: '2026-09-30', previousStart: '2026-08-06', previousEnd: '2026-09-02' });
    expect(reportPeriods(7, 'gsc', fixedNow)).toEqual({ periodStart: '2026-09-22', periodEnd: '2026-09-28', previousStart: '2026-09-15', previousEnd: '2026-09-21' });
  });

  it('does not treat a measurement ID or partially configured OAuth as report access', () => {
    expect(connectionStatus(name => name === 'GOOGLE_ANALYTICS_MEASUREMENT_ID' ? 'G-TEST' : undefined).ga4).toBe(false);
    expect(connectionStatus(name => name === 'GOOGLE_ANALYTICS_CLIENT_ID' ? 'client' : undefined).ga4).toBe(false);
    expect(connectionStatus(oauth)).toEqual({ ga4: true, gsc: false });
    expect(connectionStatus(gscEnv)).toEqual({ ga4: false, gsc: true });
  });
});

describe('Google response handling', () => {
  it('throws on failed HTTP and never leaks upstream response contents', async () => {
    const fetcher = vi.fn(async () => new Response('SECRET upstream credential response', { status: 403 }));
    await expect(requestJson('https://example.com', {}, fetcher)).rejects.toThrow('läsbehörighet');
    try { await requestJson('https://example.com', {}, fetcher); } catch (error) { expect(safeSourceError(error)).not.toContain('SECRET'); }
    expect(safeSourceError(new Error('SECRET'))).not.toContain('SECRET');
  });

  it('keeps missing ratios unknown and rejects malformed numeric totals', () => {
    expect(gscTotals({})).toEqual({ clicks: 0, impressions: 0, ctr: null, position: null });
    expect(gaTotals({ rows: [] }).activeUsers).toBe(0);
    expect(() => gaTotals({ rows: [reportRow(['broken', 1, 2, 3, 0.5])] })).toThrow('ogiltigt');
    expect(() => gaTotals({ rows: [reportRow([1])] })).toThrow('saknar');
  });

  it('fetches GA4 current and previous totals and correctly labels sessions, pageviews and events', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).endsWith('/token')) return Response.json({ access_token: 'access' });
      const body = JSON.parse(String(init?.body));
      const dimension = body.dimensions?.[0].name;
      const metric = body.metrics[0].name;
      if (!dimension) return Response.json({ rows: [reportRow(body.dateRanges[0].startDate === '2026-09-03' ? [42, 60, 100, 4, 0.6] : [21, 40, 70, 2, 0.5])] });
      if (dimension === 'date') return Response.json({ rows: [reportRow([6], '20260930')] });
      return Response.json({ rows: [reportRow([metric === 'eventCount' ? 9 : 5], dimension === 'eventName' ? 'sign_up' : dimension === 'pagePath' ? '/guide' : 'Organic Search')] });
    });
    const snapshot = await fetchGa4(project, 28, oauth, fetcher, fixedNow);
    expect(snapshot.metrics.activeUsers).toEqual({ current: 42, previous: 21 });
    expect(snapshot.metrics.engagementRate.current).toBe(0.6);
    expect(snapshot.series).toEqual([{ date: '2026-09-30', value: 6 }]);
    expect(snapshot.topEvents).toEqual([{ label: 'sign_up', value: 9 }]);
    expect(snapshot.topPages).toEqual([{ label: '/guide', value: 5 }]);
    expect(fetcher).toHaveBeenCalledTimes(7);
    const request = fetcher.mock.calls[1];
    expect(String(request[0])).toBe('https://analyticsdata.googleapis.com/v1beta/properties/123456:runReport');
    expect((request[1]?.headers as Record<string, string>).Authorization).toBe('Bearer access');
    expect(snapshot).not.toHaveProperty('access_token');
  });

  it('does not return a fabricated GA4 snapshot if one required report fails', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).endsWith('/token')) return Response.json({ access_token: 'access' });
      const body = JSON.parse(String(init?.body));
      if (body.dimensions?.[0].name === 'pagePath') return new Response('private upstream payload', { status: 429 });
      return Response.json({ rows: [] });
    });
    await expect(fetchGa4(project, 28, oauth, fetcher, fixedNow)).rejects.toThrow('begränsar');
  });

  it('signs service-account assertions locally with only the read-only Analytics scope', async () => {
    const key = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
    const privateKey = Buffer.from(await crypto.subtle.exportKey('pkcs8', key.privateKey)).toString('base64');
    const credentials = JSON.stringify({ client_email: 'test@example.iam.gserviceaccount.com', private_key: `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----` });
    const fetcher = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      if (!String(input).endsWith('/token')) return Response.json({ rows: [] });
      const body = new URLSearchParams(String(init?.body));
      const assertion = body.get('assertion')!;
      const [header, claims, signature] = assertion.split('.');
      expect(JSON.parse(Buffer.from(claims, 'base64url').toString())).toMatchObject({ iss: 'test@example.iam.gserviceaccount.com', scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token' });
      expect(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key.publicKey, Buffer.from(signature, 'base64url'), new TextEncoder().encode(`${header}.${claims}`))).toBe(true);
      expect(String(init?.body)).not.toContain(privateKey);
      return Response.json({ access_token: 'signed-access' });
    });
    const snapshot = await fetchGa4(project, 28, name => name === 'GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON' ? credentials : undefined, fetcher, fixedNow);
    expect(snapshot.metrics.sessions.current).toBe(0);
    expect(JSON.stringify(snapshot)).not.toContain('signed-access');
  });

  it('queries GSC finalized equal periods with correctly encoded domain properties and ratios', async () => {
    const fetcher = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      expect(body.dataState).toBe('final');
      expect(body.type).toBe('web');
      const dimension = body.dimensions[0];
      return Response.json({ rows: [{ ...(dimension ? { keys: [dimension === 'date' ? '2026-09-28' : dimension === 'query' ? 'example search' : 'https://example.com/page'] } : {}), clicks: 12, impressions: 120, ctr: 0.1, position: 8.5 }] });
    });
    const snapshot = await fetchGsc(project, 7, gscEnv, fetcher, fixedNow);
    expect(snapshot.metrics.ctr).toEqual({ current: 0.1, previous: 0.1 });
    expect(snapshot.topQueries[0]).toEqual({ label: 'example search', value: 12, impressions: 120, ctr: 0.1, position: 8.5 });
    expect(snapshot.periodEnd).toBe('2026-09-28');
    expect(String(fetcher.mock.calls[0][0])).toContain('/sites/sc-domain%3Aexample.com/searchAnalytics/query');
    expect((fetcher.mock.calls[0][1]?.headers as Record<string, string>)['X-Connection-Api-Key']).toBe('connection');
    expect(fetcher).toHaveBeenCalledTimes(5);
  });
});

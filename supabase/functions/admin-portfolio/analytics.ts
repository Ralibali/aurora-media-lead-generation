import type { AnalyticsSnapshot, PortfolioProject } from '../_shared/portfolio-types.ts';

export type Environment = (name: string) => string | undefined;
type JsonObject = Record<string, unknown>;
type ReportRow = { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] };
type GaReport = { rows?: ReportRow[]; metadata?: JsonObject };
type GscRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };
type GscReport = { rows?: GscRow[] };
export type AnalyticsSource = 'ga4' | 'gsc';
export const ANALYTICS_TTL_MS = 6 * 60 * 60 * 1000;
export const HEALTH_TTL_MS = 15 * 60 * 1000;
const ANALYTICS_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GSC_GATEWAY = 'https://connector-gateway.lovable.dev/google_search_console';
const GA_METRICS = ['activeUsers', 'sessions', 'screenPageViews', 'keyEvents', 'engagementRate'] as const;

/** Only errors deliberately produced here may be shown outside the server. */
export class SourceError extends Error {}

export function safeSourceError(error: unknown): string {
  return error instanceof SourceError ? error.message : 'Datakällan kunde inte uppdateras. Senaste lyckade data finns kvar.';
}

export function validRange(value: unknown): value is 7 | 28 | 90 {
  return value === 7 || value === 28 || value === 90;
}

export function authorized(token: string, candidates: (string | undefined)[]): boolean {
  // Compare every character without early exit. The length check is included in
  // the accumulator and empty configured values never authorize.
  let matched = 0;
  for (const candidate of candidates) {
    const secret = candidate ?? '';
    let diff = token.length ^ secret.length;
    for (let i = 0; i < Math.max(token.length, secret.length); i++) {
      diff |= (token.charCodeAt(i) || 0) ^ (secret.charCodeAt(i) || 0);
    }
    matched |= Number(Boolean(token && secret) && diff === 0);
  }
  return matched === 1;
}

export function connectionStatus(env: Environment) {
  const serviceAccount = Boolean(env('GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON'));
  return {
    ga4: serviceAccount || Boolean(env('GOOGLE_ANALYTICS_CLIENT_ID') && env('GOOGLE_ANALYTICS_CLIENT_SECRET') && env('GOOGLE_ANALYTICS_REFRESH_TOKEN')),
    gsc: Boolean(env('LOVABLE_API_KEY') && env('GOOGLE_SEARCH_CONSOLE_API_KEY')) || serviceAccount,
  };
}

/** Equal inclusive periods. GSC uses finalized data and leaves a three-day delay. */
export function reportPeriods(days: number, source: AnalyticsSource, now = new Date()) {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: source === 'gsc' ? 'America/Los_Angeles' : 'Europe/Stockholm',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
  const anchor = new Date(`${date}T12:00:00Z`);
  const shift = (offset: number) => new Date(anchor.getTime() - offset * 86_400_000).toISOString().slice(0, 10);
  const lag = source === 'gsc' ? 3 : 1;
  return {
    periodStart: shift(lag + days - 1), periodEnd: shift(lag),
    previousStart: shift(lag + days * 2 - 1), previousEnd: shift(lag + days),
  };
}

export async function requestJson(url: string, init: RequestInit, fetcher: typeof fetch = fetch): Promise<JsonObject> {
  let response: Response;
  try {
    response = await fetcher(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new SourceError('Google svarade inte inom tio sekunder eller kunde inte nås. Försök igen senare.');
  }
  if (!response.ok) {
    // Never return Google's body: it may contain credentials, account details or request data.
    await response.body?.cancel().catch(() => {});
    const description = response.status === 401 ? 'Anslutningen behöver förnyas.'
      : response.status === 403 ? 'Anslutningen saknar läsbehörighet eller Google-API:t är inte aktiverat.'
      : response.status === 429 ? 'Google begränsar antalet anrop. Försök igen senare.'
      : response.status === 404 ? 'Den valda Google-egendomen hittades inte.'
      : 'Google kunde inte leverera rapporten.';
    throw new SourceError(`${description} (HTTP ${response.status})`);
  }
  const value: unknown = await response.json().catch(() => null);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SourceError('Google gav ett ogiltigt rapportsvar.');
  return value as JsonObject;
}

function base64Url(bytes: Uint8Array) {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function serviceAccountToken(env: Environment, scope: string, fetcher: typeof fetch): Promise<string> {
  let account: { client_email?: string; private_key?: string };
  try {
    account = JSON.parse(env('GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON') ?? '{}');
    if (!account.client_email || !account.private_key?.includes('-----BEGIN PRIVATE KEY-----')) throw new Error();
  } catch {
    throw new SourceError('Google-tjänstekontot är inte korrekt konfigurerat på servern.');
  }
  const encode = (value: unknown) => base64Url(new TextEncoder().encode(JSON.stringify(value)));
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: account.client_email, scope, aud: TOKEN_ENDPOINT, iat: now, exp: now + 3600,
  })}`;
  let signature: ArrayBuffer;
  try {
    const pem = account.private_key!.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
    const keyBytes = Uint8Array.from(atob(pem), character => character.charCodeAt(0));
    const key = await crypto.subtle.importKey('pkcs8', keyBytes, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
    signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  } catch {
    throw new SourceError('Google-tjänstekontots servernyckel kunde inte användas.');
  }
  const body = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${base64Url(new Uint8Array(signature))}` });
  return extractToken(await requestJson(TOKEN_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }, fetcher));
}

function extractToken(body: JsonObject): string {
  if (typeof body.access_token !== 'string' || !body.access_token) throw new SourceError('Google-anslutningen kunde inte förnyas.');
  return body.access_token;
}

async function analyticsToken(env: Environment, fetcher: typeof fetch): Promise<string> {
  if (env('GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON')) return serviceAccountToken(env, ANALYTICS_SCOPE, fetcher);
  const clientId = env('GOOGLE_ANALYTICS_CLIENT_ID');
  const clientSecret = env('GOOGLE_ANALYTICS_CLIENT_SECRET');
  const refreshToken = env('GOOGLE_ANALYTICS_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) {
    throw new SourceError('GA4 behöver en anslutning med läsbehörighet. Webbplatsens G-ID ger inte tillgång till rapporterna.');
  }
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' });
  return extractToken(await requestJson(TOKEN_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }, fetcher));
}

function numeric(value: unknown): number {
  if (value === undefined || value === null || value === '') throw new SourceError('Google-rapporten saknar ett förväntat mätvärde.');
  const number = Number(value);
  if (!Number.isFinite(number)) throw new SourceError('Google-rapporten innehåller ett ogiltigt mätvärde.');
  return number;
}

function gaRows(report: GaReport): ReportRow[] {
  if (report.rows !== undefined && !Array.isArray(report.rows)) throw new SourceError('Google-rapporten har ett oväntat format.');
  return report.rows ?? [];
}

export function gaTotals(report: GaReport): Record<string, number> {
  const rows = gaRows(report);
  return Object.fromEntries(GA_METRICS.map((name, index) => [name, rows.length ? numeric(rows[0].metricValues?.[index]?.value) : 0]));
}

function gaList(report: GaReport) {
  return gaRows(report).map(row => ({ label: row.dimensionValues?.[0]?.value ?? '(saknas)', value: numeric(row.metricValues?.[0]?.value) }));
}

export async function fetchGa4(project: PortfolioProject, days: number, env: Environment, fetcher: typeof fetch = fetch, now = new Date()): Promise<AnalyticsSnapshot> {
  if (!project.ga4PropertyId || !/^\d+$/.test(project.ga4PropertyId)) throw new SourceError('Projektet saknar en verifierad GA4-egendom.');
  const token = await analyticsToken(env, fetcher);
  const periods = reportPeriods(days, 'ga4', now);
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${project.ga4PropertyId}:runReport`;
  const report = async (startDate: string, endDate: string, metrics: readonly string[], dimension?: string, limit = 20): Promise<GaReport> => {
    const body = {
      dateRanges: [{ startDate, endDate }], metrics: metrics.map(name => ({ name })),
      ...(dimension ? { dimensions: [{ name: dimension }], orderBys: dimension === 'date'
        ? [{ dimension: { dimensionName: 'date' } }]
        : [{ metric: { metricName: metrics[0] }, desc: true }] } : {}),
      limit, keepEmptyRows: true,
    };
    return requestJson(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, fetcher) as Promise<GaReport>;
  };
  const currentReport = report(periods.periodStart, periods.periodEnd, GA_METRICS);
  const previousReport = report(periods.previousStart, periods.previousEnd, GA_METRICS);
  const [current, previous, series, pages, sources, events] = await Promise.all([
    currentReport, previousReport,
    report(periods.periodStart, periods.periodEnd, ['sessions'], 'date', days),
    report(periods.periodStart, periods.periodEnd, ['screenPageViews'], 'pagePath'),
    report(periods.periodStart, periods.periodEnd, ['sessions'], 'sessionDefaultChannelGroup'),
    report(periods.periodStart, periods.periodEnd, ['eventCount'], 'eventName'),
  ]);
  const currentValues = gaTotals(current), previousValues = gaTotals(previous);
  const reports = [current, previous, series, pages, sources, events];
  const notes = ['GA4 mäter registrerad trafik och händelser; noll registrerade viktiga händelser bevisar inte noll försäljning.', 'Periodens slutdatum är igår i svensk tid. Google grupperar dagarna enligt egendomens tidszon; färska siffror kan justeras.'];
  if (reports.some(item => item.metadata?.subjectToThresholding === true)) notes.push('Google har tillämpat integritetströsklar; vissa små datamängder kan saknas.');
  if (reports.some(item => item.metadata?.dataLossFromOtherRow === true)) notes.push('Google grupperar vissa detaljer i övrigt.');
  if (reports.some(item => Array.isArray(item.metadata?.samplingMetadatas) && item.metadata!.samplingMetadatas.length > 0)) notes.push('Google använder ett urval av data i minst en delrapport.');
  return {
    projectId: project.id, source: 'ga4', rangeDays: days, ...periods, fetchedAt: now.toISOString(), method: 'api',
    metrics: Object.fromEntries(GA_METRICS.map(name => [name, { current: currentValues[name], previous: previousValues[name] }])),
    series: gaList(series).map(item => ({ date: item.label.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'), value: item.value })),
    topPages: gaList(pages), topSources: gaList(sources), topEvents: gaList(events), topQueries: [], notes,
  };
}

export function gscTotals(report: GscReport): Record<string, number | null> {
  const row = report.rows?.[0];
  if (!row) return { clicks: 0, impressions: 0, ctr: null, position: null };
  const impressions = numeric(row.impressions);
  return { clicks: numeric(row.clicks), impressions, ctr: impressions ? numeric(row.ctr) : null, position: impressions ? numeric(row.position) : null };
}

export async function fetchGsc(project: PortfolioProject, days: number, env: Environment, fetcher: typeof fetch = fetch, now = new Date()): Promise<AnalyticsSnapshot> {
  if (!project.gscSiteUrl || !/^(https:\/\/|sc-domain:)/.test(project.gscSiteUrl)) throw new SourceError('Projektet saknar en verifierad Search Console-egendom.');
  const gateway = Boolean(env('LOVABLE_API_KEY') && env('GOOGLE_SEARCH_CONSOLE_API_KEY'));
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (gateway) {
    headers.Authorization = `Bearer ${env('LOVABLE_API_KEY')}`;
    headers['X-Connection-Api-Key'] = env('GOOGLE_SEARCH_CONSOLE_API_KEY')!;
  } else if (env('GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON')) {
    headers.Authorization = `Bearer ${await serviceAccountToken(env, GSC_SCOPE, fetcher)}`;
  } else {
    throw new SourceError('Search Console behöver kopplas till Google med läsbehörighet.');
  }
  const periods = reportPeriods(days, 'gsc', now);
  const url = `${gateway ? GSC_GATEWAY : 'https://www.googleapis.com'}/webmasters/v3/sites/${encodeURIComponent(project.gscSiteUrl)}/searchAnalytics/query`;
  const report = (startDate: string, endDate: string, dimensions: string[] = [], rowLimit = 20) => requestJson(url, {
    method: 'POST', headers, body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, dataState: 'final', type: 'web' }),
  }, fetcher) as Promise<GscReport>;
  const [current, previous, series, pages, queries] = await Promise.all([
    report(periods.periodStart, periods.periodEnd), report(periods.previousStart, periods.previousEnd),
    report(periods.periodStart, periods.periodEnd, ['date'], days),
    report(periods.periodStart, periods.periodEnd, ['page']), report(periods.periodStart, periods.periodEnd, ['query']),
  ]);
  const currentValues = gscTotals(current), previousValues = gscTotals(previous);
  return {
    projectId: project.id, source: 'gsc', rangeDays: days, ...periods, fetchedAt: now.toISOString(), method: 'api',
    metrics: Object.fromEntries(['clicks', 'impressions', 'ctr', 'position'].map(name => [name, { current: currentValues[name], previous: previousValues[name] }])),
    series: (series.rows ?? []).map(row => ({ date: row.keys?.[0] ?? '', value: numeric(row.clicks) })),
    topPages: (pages.rows ?? []).map(row => ({ label: row.keys?.[0] ?? '(saknas)', value: numeric(row.clicks) })),
    topQueries: (queries.rows ?? []).map(row => ({ label: row.keys?.[0] ?? '(saknas)', value: numeric(row.clicks), impressions: numeric(row.impressions), ctr: numeric(row.ctr), position: numeric(row.position) })),
    topSources: [], topEvents: [],
    notes: ['Endast slutbehandlade data för webbsökning. Perioden slutar tre dagar före dagens datum.', 'Sökfrågor anonymiseras och topplistor begränsas av Google. Topplistor summerar därför inte alltid till totalen.', 'Sökfrågor och sidor är separata topplistor och visar inte vilka sökfrågor som leder till en viss sida.'],
  };
}

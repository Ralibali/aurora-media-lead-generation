export type PortfolioProject = {
  id: string; name: string; url: string | null;
  kind: string; stage: 'live' | 'build' | 'internal';
  lovableProjectId?: string; ga4PropertyId?: string; gscSiteUrl?: string;
};
export type MetricPair = { current: number | null; previous: number | null };
export type AnalyticsSnapshot = {
  projectId: string; source: 'ga4' | 'gsc'; rangeDays: number;
  periodStart: string; periodEnd: string; previousStart: string; previousEnd: string;
  fetchedAt: string; method: 'api' | 'verified_import';
  metrics: Record<string, MetricPair>;
  series: { date: string; value: number }[];
  topPages: { label: string; value: number }[];
  topSources: { label: string; value: number }[];
  topEvents: { label: string; value: number }[];
  topQueries: { label: string; value: number; impressions?: number; position?: number; ctr?: number }[];
  notes: string[];
};
export type PortfolioCheck = {
  projectId: string; checkedAt: string; status: 'healthy' | 'degraded' | 'down';
  httpStatus: number | null; durationMs: number; issues: string[];
};
export type SourceState = {
  projectId: string; source: 'ga4' | 'gsc' | 'health';
  rangeDays: number;
  attemptedAt: string; succeededAt: string | null; error: string | null;
};
export type PortfolioResponse = {
  projects: PortfolioProject[]; snapshots: AnalyticsSnapshot[]; checks: PortfolioCheck[];
  sourceStates: SourceState[]; generatedAt: string;
  connections: { ga4: boolean; gsc: boolean };
};

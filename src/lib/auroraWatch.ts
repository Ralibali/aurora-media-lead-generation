export type WatchStep =
  | { type: 'navigate'; url: string }
  | { type: 'click_link'; selector: string }
  | { type: 'assert_visible'; selector: string }
  | { type: 'assert_text'; selector: string; text: string };

export type WatchStepEvidence = { index: number; type: string; status: 'passed' | 'failed'; duration_ms?: number; message?: string };
export type WatchScreenshot = { attempt: number; url: string; expires_at: string };

export type WatchRun = {
  id: string;
  flow_id: string;
  status: 'running' | 'passed' | 'failed' | 'flaky' | 'inconclusive';
  incident_state: 'unknown' | 'healthy' | 'first_failure' | 'confirmed_failure' | 'recovered' | 'flaky';
  attempts: number;
  duration_ms: number | null;
  created_at: string;
  completed_at: string | null;
  details: {
    error?: string;
    screenshots?: WatchScreenshot[];
    steps?: WatchStepEvidence[];
    attempts_detail?: { attempt: number; status: 'passed' | 'failed'; duration_ms: number; error?: string; steps: WatchStepEvidence[] }[];
  };
};

export type WatchFlow = {
  id: string;
  site_id: string;
  name: string;
  steps: WatchStep[];
  active: boolean;
  check_interval_minutes: number;
  next_run_at: string;
  last_run_at: string | null;
  runs: WatchRun[];
};

export const watchRunLabel = (run: WatchRun): string => {
  if (run.status === 'running') return 'Pågår';
  if (run.status === 'flaky' || (run.status === 'passed' && run.attempts > 1)) return 'Instabilt · godkänd vid omkontroll';
  if (run.status === 'passed') return run.incident_state === 'recovered' ? 'Återställd' : 'Godkänd';
  if (run.status === 'inconclusive') return 'Kunde inte avgöras';
  return run.incident_state === 'confirmed_failure' ? 'Bekräftad avvikelse' : 'Avvikelse · behöver följas upp';
};

export function watchScheduleLabel(flow: WatchFlow, siteActive: boolean, now = Date.now()): string {
  if (!siteActive || !flow.active) return 'Pausad';
  if (flow.runs.some(run => run.status === 'running')) return 'Kontroll pågår';
  if (flow.last_run_at && now - new Date(flow.last_run_at).getTime() > flow.check_interval_minutes * 120_000) return 'Kontroll försenad';
  if (new Date(flow.next_run_at).getTime() <= now) return 'Väntar på körning';
  if (!flow.last_run_at) return 'Inte testat ännu';
  return 'Schemalagd';
}

/** Only short-lived evidence from this project's private storage is shown. */
export function watchScreenshotUrl(screenshot: WatchScreenshot, now = Date.now()): string | null {
  if (!screenshot.url || !(Date.parse(screenshot.expires_at) > now)) return null;
  try {
    const url = new URL(screenshot.url);
    const project = new URL(import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://cyymcdqkpvcvwjoqxbco.supabase.co');
    return url.protocol === 'https:' && url.origin === project.origin && !url.username && !url.password &&
      url.pathname.startsWith('/storage/v1/object/sign/aurora-watch-evidence/') && url.searchParams.has('token') ? url.href : null;
  } catch { return null; }
}

export function watchWeeklyReport(siteName: string, flow: WatchFlow, now = new Date()): string {
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const runs = flow.runs.filter(run => {
    const date = new Date(run.completed_at ?? run.created_at);
    return date >= since && date <= now;
  });
  const lines = runs.map(run => `${run.completed_at ?? run.created_at} | ${watchRunLabel(run)} | ${run.attempts} försök | ${run.duration_ms ?? '–'} ms${run.details.error ? ` | ${run.details.error}` : ''}`);
  return [
    `Aurora Watch · ${siteName} · ${flow.name}`,
    `Period: ${since.toISOString()} – ${now.toISOString()}`,
    `Genererad: ${now.toISOString()}`,
    'Underlag: de senaste högst 20 körningarna per flöde som visas i administrationen, filtrerade till sju dagar. Rapporten är ett urval, inte en komplett drifttidsmätning.',
    `Körningar i urvalet: ${runs.length}`,
    `Godkända vid första försök: ${runs.filter(run => run.status === 'passed' && run.attempts === 1).length}`,
    `Instabila: ${runs.filter(run => run.status === 'flaky' || (run.status === 'passed' && run.attempts > 1)).length}`,
    `Avvikelser: ${runs.filter(run => run.status === 'failed').length}`,
    `Ej avgjorda: ${runs.filter(run => run.status === 'inconclusive').length}`,
    `Pågår: ${runs.filter(run => run.status === 'running').length}`,
    '',
    ...(lines.length ? lines : ['Inga körningar i perioden. Flödet är inte verifierat av denna rapport.']),
  ].join('\n');
}

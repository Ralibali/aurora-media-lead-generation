import { describe, expect, it } from 'vitest';
import { watchRunLabel, watchScheduleLabel, watchScreenshotUrl, watchWeeklyReport, type WatchFlow, type WatchRun } from './auroraWatch';

const now = new Date('2026-10-05T12:00:00Z');
const run = (patch: Partial<WatchRun> = {}): WatchRun => ({
  id: 'run-1', flow_id: 'flow-1', status: 'passed', incident_state: 'healthy', attempts: 1,
  duration_ms: 1200, created_at: '2026-10-05T11:30:00Z', completed_at: '2026-10-05T11:30:02Z', details: {}, ...patch,
});
const flow = (patch: Partial<WatchFlow> = {}): WatchFlow => ({
  id: 'flow-1', site_id: 'site-1', name: 'Kontaktflöde', active: true,
  steps: [{ type: 'navigate', url: 'https://example.se' }, { type: 'assert_visible', selector: 'form' }],
  check_interval_minutes: 60, next_run_at: '2026-10-05T12:30:00Z', last_run_at: '2026-10-05T11:30:00Z', runs: [], ...patch,
});

describe('Aurora Watch evidence presentation', () => {
  it('keeps retries, inconclusive runs and recoveries distinct from a first-pass success', () => {
    expect(watchRunLabel(run())).toBe('Godkänd');
    expect(watchRunLabel(run({ status: 'flaky', attempts: 2 }))).toMatch(/^Instabilt/);
    expect(watchRunLabel(run({ status: 'passed', attempts: 2 }))).toMatch(/^Instabilt/);
    expect(watchRunLabel(run({ status: 'inconclusive' }))).toBe('Kunde inte avgöras');
    expect(watchRunLabel(run({ incident_state: 'recovered' }))).toBe('Återställd');
    expect(watchRunLabel(run({ status: 'failed', incident_state: 'first_failure' }))).toMatch(/behöver följas upp/);
    expect(watchRunLabel(run({ status: 'failed', incident_state: 'confirmed_failure' }))).toBe('Bekräftad avvikelse');
  });

  it('marks an old green result as delayed even after its next scheduled time has passed', () => {
    const stale = flow({ last_run_at: '2026-10-05T08:00:00Z', next_run_at: '2026-10-05T09:00:00Z', runs: [run()] });
    expect(watchScheduleLabel(stale, true, now.getTime())).toBe('Kontroll försenad');
    expect(watchScheduleLabel(stale, false, now.getTime())).toBe('Pausad');
    expect(watchScheduleLabel(flow({ last_run_at: null }), true, now.getTime())).toBe('Inte testat ännu');
    expect(watchScheduleLabel(flow({ next_run_at: '2026-10-05T11:55:00Z' }), true, now.getTime())).toBe('Väntar på körning');
    expect(watchScheduleLabel(flow({ runs: [run({ status: 'running' })] }), true, now.getTime())).toBe('Kontroll pågår');
  });

  it('only links unexpired signed screenshot URLs from this project private bucket', () => {
    const screenshot = { attempt: 1, expires_at: '2026-10-05T12:10:00Z', url: 'https://cyymcdqkpvcvwjoqxbco.supabase.co/storage/v1/object/sign/aurora-watch-evidence/run-1/attempt-1.png?token=signed' };
    expect(watchScreenshotUrl(screenshot, now.getTime())).toBe(screenshot.url);
    for (const url of ['javascript:alert(1)', 'https://evil.example/screenshot.png', 'https://github.com/Ralibali/aurora-media-lead-generation/actions/runs/123', screenshot.url.replace('/sign/', '/public/'), screenshot.url.replace('https:', 'http:')]) {
      expect(watchScreenshotUrl({ ...screenshot, url }, now.getTime())).toBeNull();
    }
    expect(watchScreenshotUrl({ ...screenshot, expires_at: now.toISOString() }, now.getTime())).toBeNull();
  });

  it('exports the seven-day sample honestly without leaked signed screenshot links', () => {
    const report = watchWeeklyReport('Exempel', flow({ runs: [
      run({ id: 'green', details: { screenshots: [{ attempt: 1, url: 'https://example.test/private?token=secret', expires_at: now.toISOString() }] } }),
      run({ id: 'flaky', status: 'flaky', attempts: 2 }),
      run({ id: 'unknown', status: 'inconclusive' }),
      run({ id: 'old', status: 'failed', completed_at: '2026-09-20T00:00:00Z' }),
      run({ id: 'future', status: 'failed', completed_at: '2026-10-06T00:00:00Z' }),
    ] }), now);
    expect(report).toContain('Körningar i urvalet: 3');
    expect(report).toContain('Godkända vid första försök: 1');
    expect(report).toContain('Instabila: 1');
    expect(report).toContain('Ej avgjorda: 1');
    expect(report).toContain('Avvikelser: 0');
    expect(report).toContain('ett urval, inte en komplett drifttidsmätning');
    expect(report).not.toContain('token=secret');
    expect(watchWeeklyReport('Exempel', flow(), now)).toContain('Flödet är inte verifierat');
  });
});

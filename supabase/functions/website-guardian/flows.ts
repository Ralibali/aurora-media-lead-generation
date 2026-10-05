import { allowedUrl } from './check.ts';

export type FlowStep =
  | { type: 'navigate'; url: string }
  | { type: 'click_link'; selector: string }
  | { type: 'assert_visible'; selector: string }
  | { type: 'assert_text'; selector: string; text: string };
export type StepEvidence = { index: number; type: FlowStep['type']; status: 'passed' | 'failed'; duration_ms: number; message?: string };
export type AttemptEvidence = { attempt: number; status: 'passed' | 'failed'; duration_ms: number; steps: StepEvidence[]; error?: string };
export type FlowResult = {
  status: 'passed' | 'failed' | 'flaky' | 'inconclusive'; attempts: number; duration_ms: number;
  steps: StepEvidence[]; error?: string; attempts_detail?: AttemptEvidence[];
};

export class FlowValidationError extends Error {}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new FlowValidationError('Ogiltigt format.');
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new FlowValidationError(`Kontrollera ${label}.`);
  return value.trim();
}

export function flowId(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(value)) throw new FlowValidationError('Ogiltigt ID.');
  return value;
}

export function flowName(value: unknown): string { return text(value, 'flödets namn', 160); }
export function flowInterval(value: unknown): number {
  if (typeof value !== 'number' || ![60, 360, 1440].includes(value)) throw new FlowValidationError('Välj 1 timme, 6 timmar eller 1 dygn.');
  return value;
}

// The browser runner applies the same rule to every link target and redirect.
// Public monitoring never visits known state-changing routes, even with GET.
export function readOnlyFlowUrl(raw: string, origin: string): URL {
  let url: URL;
  try { url = allowedUrl(raw, [origin]); } catch { throw new FlowValidationError('Alla steg måste använda webbplatsens godkända HTTPS-domän.'); }
  let path: string;
  try { path = decodeURIComponent(url.pathname); } catch { throw new FlowValidationError('Ogiltig adress.'); }
  if (/(?:^|[/_.-])(logout|signout|sign-out|log-out|delete|remove|unsubscribe|confirm|activate|purchase|pay|reset-password)(?:$|[/_.-])/i.test(path)
    || Array.from(url.searchParams.keys()).some(key => /^(action|token|password|secret|access_token|code)$/i.test(key))) {
    throw new FlowValidationError('Flöden får bara öppna offentliga sidor utan konto-, betalnings- eller ändringsåtgärder.');
  }
  return url;
}

export function validateFlowSteps(value: unknown, siteUrl: string, origins: string[]): FlowStep[] {
  let site: URL;
  try { site = allowedUrl(siteUrl, origins); } catch { throw new FlowValidationError('Webbplatsen finns inte i serverns godkända domänlista.'); }
  if (!Array.isArray(value) || value.length < 2 || value.length > 8) throw new FlowValidationError('Ett flöde behöver 2–8 steg.');
  const steps: FlowStep[] = value.map((raw, index) => {
    const step = record(raw);
    if (index === 0 && step.type !== 'navigate') throw new FlowValidationError('Första steget måste öppna en sida.');
    if (step.type === 'navigate') return { type: 'navigate', url: readOnlyFlowUrl(text(step.url, 'adressen', 1000), site.origin).href };
    if (!['click_link', 'assert_visible', 'assert_text'].includes(String(step.type))) throw new FlowValidationError('Endast sidöppning, länkar och kontroller är tillåtna.');
    const selector = text(step.selector, 'selektorn', 500);
    if (step.type === 'assert_text') return { type: 'assert_text', selector, text: text(step.text, 'förväntad text', 500) };
    return { type: step.type as 'click_link' | 'assert_visible', selector };
  });
  if (!steps.some(step => step.type === 'assert_visible' || step.type === 'assert_text')) throw new FlowValidationError('Lägg till minst en kontroll av synligt innehåll.');
  return steps;
}

function duration(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 600_000) throw new FlowValidationError('Ogiltig körtid.');
  return value;
}

function evidence(value: unknown, expected: FlowStep[], succeeded: boolean): StepEvidence[] {
  if (!Array.isArray(value) || value.length > expected.length || (succeeded && value.length !== expected.length)) throw new FlowValidationError('Stegresultaten är ofullständiga.');
  let failed = false;
  const steps = value.map((raw, index) => {
    const step = record(raw);
    if (failed || step.index !== index || step.type !== expected[index].type || !['passed', 'failed'].includes(String(step.status))) throw new FlowValidationError('Stegresultaten matchar inte det reserverade flödet.');
    if (step.status === 'failed') failed = true;
    const result: StepEvidence = { index, type: expected[index].type, status: step.status as 'passed' | 'failed', duration_ms: duration(step.duration_ms) };
    if (step.message !== undefined) result.message = text(step.message, 'stegmeddelandet', 1000);
    return result;
  });
  if (succeeded && failed) throw new FlowValidationError('Ett godkänt resultat kan inte innehålla misslyckade steg.');
  return steps;
}

export function validateFlowResult(value: unknown, expected: FlowStep[]): FlowResult {
  const raw = record(value);
  if (raw.status === 'inconclusive') {
    if (raw.attempts !== 0 || !Array.isArray(raw.steps) || raw.steps.length !== 0) throw new FlowValidationError('En ej genomförd kontroll får inte ha stegresultat.');
    return { status: 'inconclusive', attempts: 0, duration_ms: duration(raw.duration_ms), steps: [], error: text(raw.error, 'körarfelet', 2000) };
  }
  if (!['passed', 'failed', 'flaky'].includes(String(raw.status)) || ![1, 2].includes(Number(raw.attempts)) || typeof raw.attempts !== 'number') throw new FlowValidationError('Ogiltigt resultat.');
  if ((raw.status === 'passed' && raw.attempts !== 1) || (raw.status === 'flaky' && raw.attempts !== 2)) throw new FlowValidationError('Ett godkänt omförsök ska rapporteras som instabilt.');
  const result: FlowResult = {
    status: raw.status as FlowResult['status'], attempts: raw.attempts,
    duration_ms: duration(raw.duration_ms), steps: evidence(raw.steps, expected, raw.status !== 'failed'),
  };
  if (raw.error !== undefined) result.error = text(raw.error, 'felmeddelandet', 2000);
  if (raw.status === 'failed' && !result.steps.some(step => step.status === 'failed') && !result.error) throw new FlowValidationError('Ett misslyckat resultat behöver felbevis.');
  if (raw.attempts_detail !== undefined) {
    if (!Array.isArray(raw.attempts_detail) || raw.attempts_detail.length !== result.attempts) throw new FlowValidationError('Alla försök måste ha bevis.');
    result.attempts_detail = raw.attempts_detail.map((value, index) => {
      const attempt = record(value);
      const status = result.status === 'failed' || (result.status === 'flaky' && index === 0) ? 'failed' : 'passed';
      if (attempt.attempt !== index + 1 || attempt.status !== status) throw new FlowValidationError('Omförsökets resultat är inkonsekvent.');
      const item: AttemptEvidence = { attempt: index + 1, status, duration_ms: duration(attempt.duration_ms), steps: evidence(attempt.steps, expected, status === 'passed') };
      if (attempt.error !== undefined) item.error = text(attempt.error, 'felmeddelandet', 2000);
      if (status === 'failed' && !item.steps.some(step => step.status === 'failed') && !item.error) throw new FlowValidationError('Ett misslyckat försök behöver felbevis.');
      return item;
    });
  }
  if (result.attempts === 2 && !result.attempts_detail) throw new FlowValidationError('Båda försökens bevis krävs efter omförsök.');
  return result;
}

export function validateScreenshots(value: unknown, attempts: number): { attempt: number; bytes: Uint8Array }[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 2) throw new FlowValidationError('Högst två skärmbilder är tillåtna.');
  const seen = new Set<number>();
  return value.map(raw => {
    const item = record(raw);
    if (typeof item.attempt !== 'number' || !Number.isInteger(item.attempt) || item.attempt < 1 || item.attempt > attempts || seen.has(item.attempt)) throw new FlowValidationError('Ogiltigt bildförsök.');
    seen.add(item.attempt);
    if (typeof item.base64 !== 'string' || item.base64.length > 682_668 || !/^[A-Za-z0-9+/]+={0,2}$/.test(item.base64)) throw new FlowValidationError('Ogiltig skärmbild.');
    let bytes: Uint8Array;
    try { bytes = Uint8Array.from(atob(item.base64), c => c.charCodeAt(0)); } catch { throw new FlowValidationError('Ogiltig skärmbild.'); }
    if (bytes.length < 4 || bytes.length > 512_000 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) throw new FlowValidationError('Skärmbilden måste vara JPEG och högst 500 KB.');
    return { attempt: item.attempt, bytes };
  });
}

// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { allowedUrl, evaluate, checkWebsite, incidentState } from '../../supabase/functions/website-guardian/check';
describe('Website Guardian', () => {
  it('only permits explicitly configured HTTPS origins', () => {
    expect(allowedUrl('https://example.se/kontakt#form', ['https://example.se']).href).toBe('https://example.se/kontakt');
    for (const url of ['https://example.se.evil.test', 'http://example.se', 'https://user:pass@example.se', 'https://127.0.0.1']) expect(() => allowedUrl(url, ['https://example.se'])).toThrow();
  });
  it('checks content, header/meta noindex and status without fabricating uptime', () => {
    expect(evaluate(200, 'Kontakt', 'kontakt', 50).status).toBe('healthy');
    expect(evaluate(200, '<meta content="noindex,follow" name="robots">', '', 50).issues).toContain('Sidan anger noindex.');
    expect(evaluate(200, 'Hej', 'Kontakt', 6000, 'noindex').issues).toHaveLength(3);
    expect(evaluate(503, '', '', 50).status).toBe('down');
    expect(evaluate(302, '', '', 50).status).toBe('degraded');
  });
  it('does not follow redirects and marks network failures as failed checks', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 302 }));
    await checkWebsite(new URL('https://example.se'), '', fetcher);
    expect(fetcher.mock.calls[0][1].redirect).toBe('manual');
    expect((await checkWebsite(new URL('https://example.se'), '', vi.fn().mockRejectedValue(new Error('timeout')))).status).toBe('down');
  });
  it('requires repeat failures and distinguishes recovery and unknown', () => {
    expect(incidentState(undefined, undefined)).toBe('Okänt');
    expect(incidentState('down', 'healthy')).toBe('Kontrollera igen');
    expect(incidentState('down', 'degraded')).toBe('Incident');
    expect(incidentState('healthy', 'down')).toBe('Återställd');
    expect(incidentState('running', 'down')).toBe('Okänt');
  });
});

export type CheckResult = { status: 'healthy' | 'degraded' | 'down'; issues: string[]; httpStatus: number | null; durationMs: number; checkedAt: string };
export function allowedUrl(raw: string, origins: string[]): URL {
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !origins.includes(url.origin)) throw new Error('Adressen måste finnas i serverns godkända domänlista.');
  url.hash = '';
  return url;
}
export function evaluate(status: number, html: string, expected: string, durationMs: number, robots = ''): CheckResult {
  const issues: string[] = [];
  if (status < 200 || status >= 300) issues.push(`HTTP ${status}${status >= 300 && status < 400 ? ': ange den slutliga adressen efter omdirigeringen' : ''}`);
  if (status >= 200 && status < 300) {
    if (expected && !html.toLocaleLowerCase('sv').includes(expected.toLocaleLowerCase('sv'))) issues.push('Förväntad text saknas i HTML-svaret.');
    if (/noindex/i.test(robots) || /<meta\b(?=[^>]*\bname\s*=\s*["'](?:robots|googlebot)["'])(?=[^>]*\bcontent\s*=\s*["'][^"']*noindex)[^>]*>/i.test(html)) issues.push('Sidan anger noindex.');
    if (durationMs > 5000) issues.push('Svarstiden översteg 5 sekunder.');
  }
  return { status: status < 200 || status >= 400 ? 'down' : issues.length ? 'degraded' : 'healthy', issues, httpStatus: status, durationMs, checkedAt: new Date().toISOString() };
}
export async function checkWebsite(url: URL, expected: string, fetcher: typeof fetch = fetch): Promise<CheckResult> {
  const start = Date.now();
  try {
    const response = await fetcher(url, { redirect: 'manual', signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Aurora-Website-Guardian/1.0', Accept: 'text/html' } });
    const reader = response.body?.getReader();
    let text = ''; let bytes = 0;
    const decoder = new TextDecoder();
    if (reader) {
      try {
        while (true) {
          const chunk = await reader.read(); if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > 1000000) throw new Error('Response too large');
          text += decoder.decode(chunk.value, { stream: true });
        }
        text += decoder.decode();
      } finally { await reader.cancel().catch(() => {}); }
    }
    return evaluate(response.status, text, expected, Date.now() - start, response.headers.get('x-robots-tag') ?? '');
  } catch {
    return { status: 'down', issues: ['Kontrollen kunde inte slutföras: nätverk, TLS, timeout eller för stort svar.'], httpStatus: null, durationMs: Date.now() - start, checkedAt: new Date().toISOString() };
  }
}
export function incidentState(latest: string | undefined, previous: string | undefined) {
  if (!latest || latest === 'running') return 'Okänt';
  if (latest === 'healthy') return previous && previous !== 'healthy' && previous !== 'running' ? 'Återställd' : 'OK';
  return previous && previous !== 'healthy' && previous !== 'running' ? 'Incident' : 'Kontrollera igen';
}

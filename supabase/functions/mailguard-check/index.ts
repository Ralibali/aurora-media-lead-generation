// Aurora MailGuard – read-only DNS-diagnos av MX/SPF/DMARC/DKIM.
// Nätverk: endast DNS-over-HTTPS till en fast resolver (ingen användarstyrd URL => ingen SSRF).
// Inget crawlande, ingen lagring av domäner, ingen e-post skickas.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { analyzeAll, normalizeDomain, normalizeSelectors, type DnsInput } from './analyze.ts';

const RESOLVER = 'https://cloudflare-dns.com/dns-query';
const TIMEOUT_MS = 4000;
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function allow(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) { hits.set(ip, list); return false; }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return true;
}

async function query(name: string, type: 'TXT' | 'MX'): Promise<{ data: string }[] | null> {
  try {
    const url = new URL(RESOLVER);
    url.searchParams.set('name', name);
    url.searchParams.set('type', type);
    const res = await fetch(url, { headers: { Accept: 'application/dns-json' }, redirect: 'error', signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    const body = await res.json() as { Status: number; Answer?: { type: number; data: string }[] };
    if (body.Status === 3) return []; // NXDOMAIN
    if (body.Status !== 0) return null;
    const want = type === 'TXT' ? 16 : 15;
    return (body.Answer ?? []).filter((a) => a.type === want).slice(0, 50);
  } catch { return null; }
}

const txt = (rows: { data: string }[] | null) => rows === null ? null : rows.map((r) => (r.data.match(/"((?:[^"\\]|\\.)*)"/g) ?? [r.data]).map((p) => p.replace(/^"|"$/g, '')).join(''));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Metoden stöds inte.' }, 405);
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return json({ error: 'För många kontroller. Vänta några minuter och försök igen.' }, 429);
  let body: { domain?: unknown; selectors?: unknown };
  try { body = await req.json(); } catch { return json({ error: 'Ogiltig förfrågan.' }, 400); }
  let domain: string; let selectors: string[];
  try { domain = normalizeDomain(body.domain); selectors = normalizeSelectors(body.selectors); }
  catch (e) { return json({ error: (e as Error).message }, 400); }

  const [mxRows, rootRows, dmarcRows, ...dkimRows] = await Promise.all([
    query(domain, 'MX'), query(domain, 'TXT'), query(`_dmarc.${domain}`, 'TXT'),
    ...selectors.map((s) => query(`${s}._domainkey.${domain}`, 'TXT')),
  ]);
  const dns: DnsInput = {
    mx: mxRows === null ? null : mxRows.map((r) => { const [p, h] = r.data.split(/\s+/); return { priority: Number(p) || 0, host: h ?? '' }; }),
    rootTxt: txt(rootRows),
    dmarcTxt: txt(dmarcRows),
    dkim: Object.fromEntries(selectors.map((s, i) => [s, txt(dkimRows[i])])),
  };
  return json(analyzeAll(domain, dns));
});

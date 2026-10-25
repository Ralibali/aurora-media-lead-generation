// Aurora MailGuard – ren analyslogik (ingen nätverkstrafik). Delas av edge-funktionen och testerna.
export type Level = 'kritisk' | 'varning' | 'ok' | 'okänd' | 'info';
export type Finding = { area: 'MX' | 'SPF' | 'DMARC' | 'DKIM'; level: Level; title: string; detail: string; action?: string };

const BLOCKED_SUFFIXES = ['.local', '.localhost', '.internal', '.lan', '.home', '.arpa', '.invalid', '.test', '.example', '.onion'];

export function normalizeDomain(raw: unknown): string {
  if (typeof raw !== 'string') throw new Error('Ange en domän.');
  let v = raw.trim().toLowerCase();
  if (!v || v.length > 300) throw new Error('Ange en domän.');
  v = v.replace(/^https?:\/\//, '').replace(/^[^@]*@/, '').split(/[/?#:]/)[0].replace(/\.$/, '');
  let host: string;
  try { host = new URL(`http://${v}`).hostname; } catch { throw new Error('Ogiltig domän.'); }
  if (host.length > 253 || !host.includes('.')) throw new Error('Ange en fullständig domän, t.ex. foretag.se.');
  if (/^[\d.]+$/.test(host) || host.includes(':')) throw new Error('IP-adresser stöds inte – ange en domän.');
  if (!host.split('.').every((l) => /^(?!-)[a-z0-9-]{1,63}(?<!-)$/.test(l))) throw new Error('Ogiltig domän.');
  if (host === 'localhost' || BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) throw new Error('Domänen kan inte kontrolleras.');
  return host;
}

export function normalizeSelectors(raw: unknown): string[] {
  if (raw == null || raw === '') return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(/[\s,]+/);
  const out = [...new Set(list.map((s) => String(s).trim().toLowerCase()).filter(Boolean))];
  if (out.length > 5) throw new Error('Max 5 DKIM-selektorer.');
  for (const s of out) if (!/^[a-z0-9](?:[a-z0-9_-]{0,62})(?:\.[a-z0-9_-]{1,63}){0,2}$/.test(s)) throw new Error(`Ogiltig selektor: ${s.slice(0, 40)}`);
  return out;
}

export type DnsInput = {
  mx: { priority: number; host: string }[] | null; // null = uppslag misslyckades
  rootTxt: string[] | null;
  dmarcTxt: string[] | null;
  dkim: Record<string, string[] | null>;
};

function tags(record: string) {
  const m = new Map<string, string>();
  for (const part of record.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) m.set(part.slice(0, i).trim().toLowerCase(), part.slice(i + 1).trim());
  }
  return m;
}

export function analyzeMx(mx: DnsInput['mx']): Finding[] {
  if (mx === null) return [{ area: 'MX', level: 'okänd', title: 'MX kunde inte läsas', detail: 'DNS-uppslaget svarade inte inom tidsgränsen.', action: 'Försök igen senare.' }];
  if (mx.length === 0) return [{ area: 'MX', level: 'info', title: 'Ingen MX-post', detail: 'Domänen anger ingen e-postserver. Om domänen inte ska skicka eller ta emot e-post är det normalt.', action: 'Skickar domänen ingen e-post: publicera "v=spf1 -all" och DMARC med p=reject så att den inte kan förfalskas.' }];
  if (mx.length === 1 && (mx[0].host === '' || mx[0].host === '.')) return [{ area: 'MX', level: 'info', title: 'Null MX (RFC 7505)', detail: 'Domänen deklarerar uttryckligen att den inte tar emot e-post.' }];
  const hosts = mx.slice().sort((a, b) => a.priority - b.priority).map((m) => m.host.replace(/\.$/, ''));
  const provider = hosts.some((h) => /google(mail)?\.com$/.test(h)) ? 'Google Workspace' : hosts.some((h) => /outlook\.com$/.test(h)) ? 'Microsoft 365' : null;
  return [{ area: 'MX', level: 'ok', title: `${hosts.length} MX-post${hosts.length > 1 ? 'er' : ''} hittade`, detail: `${hosts.slice(0, 5).join(', ')}${provider ? ` (ser ut som ${provider})` : ''}.` }];
}

const SPF_LOOKUP = /^[+\-~?]?(include:|a\b|a:|a\/|mx\b|mx:|mx\/|ptr|exists:|redirect=)/i;

export function analyzeSpf(txt: DnsInput['rootTxt']): Finding[] {
  if (txt === null) return [{ area: 'SPF', level: 'okänd', title: 'SPF kunde inte läsas', detail: 'DNS-uppslaget svarade inte inom tidsgränsen.' }];
  const spf = txt.filter((t) => /^v=spf1(\s|$)/i.test(t.trim()));
  if (spf.length === 0) return [{ area: 'SPF', level: 'kritisk', title: 'SPF saknas', detail: 'Mottagare kan inte kontrollera vilka servrar som får skicka e-post för domänen.', action: 'Publicera en TXT-post som börjar med "v=spf1", listar era faktiska avsändare (t.ex. include för er e-postleverantör) och avslutas med ~all eller -all.' }];
  if (spf.length > 1) return [{ area: 'SPF', level: 'kritisk', title: 'Flera SPF-poster', detail: 'Mer än en v=spf1-post ger ett permanent fel (permerror) och SPF ignoreras.', action: 'Slå ihop posterna till en enda SPF-post.' }];
  const rec = spf[0].trim();
  const terms = rec.split(/\s+/).slice(1);
  const out: Finding[] = [];
  const all = terms.find((t) => /^[+\-~?]?all$/i.test(t));
  const lookups = terms.filter((t) => SPF_LOOKUP.test(t)).length;
  if (!all && !terms.some((t) => /^redirect=/i.test(t))) out.push({ area: 'SPF', level: 'varning', title: 'SPF saknar avslutande all', detail: 'Utan "all" blir resultatet neutralt för okända avsändare.', action: 'Avsluta posten med ~all (under övergång) eller -all.' });
  else if (all && /^\+?all$/i.test(all)) out.push({ area: 'SPF', level: 'kritisk', title: 'SPF tillåter alla avsändare (+all)', detail: 'Vem som helst godkänns som avsändare för domänen.', action: 'Byt till ~all eller -all efter att ni listat era riktiga avsändare.' });
  else if (all?.startsWith('?')) out.push({ area: 'SPF', level: 'varning', title: 'SPF är neutral (?all)', detail: 'Okända avsändare varken godkänns eller underkänns.', action: 'Byt till ~all eller -all.' });
  else if (all?.startsWith('~')) out.push({ area: 'SPF', level: 'ok', title: 'SPF finns (~all)', detail: 'Okända avsändare markeras som softfail. Tillsammans med DMARC är detta vanligt och fungerande.' });
  else if (all?.startsWith('-')) out.push({ area: 'SPF', level: 'ok', title: 'SPF finns (-all)', detail: 'Okända avsändare underkänns.' });
  else out.push({ area: 'SPF', level: 'ok', title: 'SPF finns (redirect)', detail: 'Policyn hämtas från en annan domän via redirect.' });
  if (terms.some((t) => /^[+\-~?]?ptr/i.test(t))) out.push({ area: 'SPF', level: 'varning', title: 'SPF använder ptr', detail: 'ptr är avrådd i RFC 7208 och kan ignoreras av mottagare.', action: 'Ersätt ptr med ip4/ip6 eller include.' });
  if (lookups > 10) out.push({ area: 'SPF', level: 'kritisk', title: `För många DNS-uppslag (${lookups} på första nivån)`, detail: 'SPF tillåter max 10 uppslag; fler ger permerror.', action: 'Minska antalet include eller platta ut posten.' });
  else if (lookups >= 8) out.push({ area: 'SPF', level: 'varning', title: `Nära gränsen för DNS-uppslag (${lookups} på första nivån)`, detail: 'Nästlade include räknas också mot gränsen 10 och har inte räknats här.', action: 'Kontrollera totalen innan ni lägger till fler tjänster.' });
  return out;
}

export function analyzeDmarc(txt: DnsInput['dmarcTxt']): Finding[] {
  if (txt === null) return [{ area: 'DMARC', level: 'okänd', title: 'DMARC kunde inte läsas', detail: 'DNS-uppslaget svarade inte inom tidsgränsen.' }];
  const recs = txt.filter((t) => /^v=DMARC1(\s|;|$)/i.test(t.trim()));
  if (recs.length === 0) return [{ area: 'DMARC', level: 'kritisk', title: 'DMARC saknas', detail: 'Mottagare får ingen instruktion om vad som ska hända med e-post som misslyckas med SPF/DKIM, och ni får inga rapporter.', action: 'Börja med _dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@er-doman.se", läs rapporterna och skärp sedan till quarantine och reject.' }];
  if (recs.length > 1) return [{ area: 'DMARC', level: 'kritisk', title: 'Flera DMARC-poster', detail: 'Mottagare ignorerar DMARC när det finns fler än en post.', action: 'Behåll en enda post på _dmarc.' }];
  const t = tags(recs[0]);
  const p = (t.get('p') ?? '').toLowerCase();
  const out: Finding[] = [];
  if (p === 'reject') out.push({ area: 'DMARC', level: 'ok', title: 'DMARC p=reject', detail: 'Förfalskad e-post som misslyckas avvisas av mottagare som följer DMARC.' });
  else if (p === 'quarantine') out.push({ area: 'DMARC', level: 'ok', title: 'DMARC p=quarantine', detail: 'Misslyckad e-post hamnar normalt i skräppost.', action: 'När rapporterna visar att alla legitima avsändare passerar kan ni gå till p=reject.' });
  else if (p === 'none') out.push({ area: 'DMARC', level: 'varning', title: 'DMARC p=none (endast övervakning)', detail: 'Policyn skyddar inte mot förfalskning; den samlar bara in rapporter.', action: 'Analysera rapporterna och gå stegvis till p=quarantine och sedan p=reject.' });
  else out.push({ area: 'DMARC', level: 'kritisk', title: 'DMARC saknar giltig p-tagg', detail: `Värdet "${p || 'tomt'}" är ogiltigt.`, action: 'Ange p=none, p=quarantine eller p=reject.' });
  const pct = t.get('pct');
  if (pct && Number(pct) < 100 && p !== 'none') out.push({ area: 'DMARC', level: 'varning', title: `Policyn gäller ${Number(pct)} % av e-posten`, detail: 'Resten behandlas som en lägre nivå.', action: 'Höj till pct=100 när ni är redo.' });
  if (!t.get('rua')) out.push({ area: 'DMARC', level: 'varning', title: 'Inga DMARC-rapporter (rua saknas)', detail: 'Utan rapporter syns inte vem som skickar e-post i ert namn.', action: 'Lägg till rua=mailto:adress som ni eller er leverantör läser.' });
  const sp = t.get('sp')?.toLowerCase();
  if (sp === 'none' && p !== 'none') out.push({ area: 'DMARC', level: 'varning', title: 'Subdomäner har sp=none', detail: 'Subdomäner kan förfalskas trots policyn för huvuddomänen.', action: 'Ta bort sp eller sätt sp=quarantine/reject.' });
  return out;
}

export function analyzeDkim(dkim: DnsInput['dkim']): Finding[] {
  const sels = Object.keys(dkim);
  if (sels.length === 0) return [{ area: 'DKIM', level: 'okänd', title: 'DKIM ej kontrollerad', detail: 'DKIM-nycklar ligger under en selektor som inte går att lista från DNS. Utan selektor kan vi inte avgöra om DKIM är på.', action: 'Ange selektorn (finns i e-postleverantörens admin eller i DKIM-Signature: s= i ett skickat mail), t.ex. google eller selector1.' }];
  return sels.map((s) => {
    const txt = dkim[s];
    if (txt === null) return { area: 'DKIM' as const, level: 'okänd' as const, title: `Selektor ${s}: kunde inte läsas`, detail: 'DNS svarade inte inom tidsgränsen.' };
    const rec = txt.join('');
    if (!rec) return { area: 'DKIM' as const, level: 'varning' as const, title: `Selektor ${s}: ingen post`, detail: `Ingen TXT-post på ${s}._domainkey.`, action: 'Kontrollera selektorn eller aktivera DKIM hos er e-postleverantör.' };
    const t = tags(rec);
    if (t.has('p') && t.get('p') === '') return { area: 'DKIM' as const, level: 'varning' as const, title: `Selektor ${s}: nyckeln är återkallad`, detail: 'p= är tom, vilket betyder att nyckeln inte ska användas.' };
    if (!t.get('p')) return { area: 'DKIM' as const, level: 'varning' as const, title: `Selektor ${s}: ogiltig post`, detail: 'Ingen publik nyckel (p=) hittades.' };
    const bits = Math.round((t.get('p')!.replace(/\s/g, '').length * 6) / 8 * 8 / 1.0);
    const weak = (t.get('k') ?? 'rsa').toLowerCase() === 'rsa' && bits < 1300; // ~1024-bit RSA i base64 ≈ 216 tecken
    return weak
      ? { area: 'DKIM' as const, level: 'varning' as const, title: `Selektor ${s}: kort RSA-nyckel`, detail: 'Nyckeln ser ut att vara 1024 bitar eller kortare.', action: 'Rotera till en 2048-bitars nyckel hos e-postleverantören.' }
      : { area: 'DKIM' as const, level: 'ok' as const, title: `Selektor ${s}: publik nyckel publicerad`, detail: 'Nyckeln finns i DNS. Att e-posten faktiskt signeras verifieras först i ett skickat meddelande.' };
  });
}

export function analyzeAll(domain: string, dns: DnsInput) {
  const findings = [...analyzeMx(dns.mx), ...analyzeSpf(dns.rootTxt), ...analyzeDmarc(dns.dmarcTxt), ...analyzeDkim(dns.dkim)];
  const summary = { kritisk: 0, varning: 0, ok: 0, okänd: 0, info: 0 } as Record<Level, number>;
  for (const f of findings) summary[f.level]++;
  return { domain, checkedAt: new Date().toISOString(), findings, summary, disclaimer: 'Ögonblicksbild av publika DNS-poster. Den bevisar inte att all e-post levereras eller att domänen är skyddad mot alla attacker.' };
}

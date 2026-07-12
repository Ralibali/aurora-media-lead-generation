// Pure helpers for firecrawl-prospect-search — extracted for unit tests.
// Deterministic scoring, no PII extraction, all signals must have evidence.

export const DIRECTORY_HOSTS = new Set<string>([
  "linkedin.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "tiktok.com",
  "pinterest.com",
  "reddit.com",
  "wikipedia.org",
  "hitta.se",
  "eniro.se",
  "allabolag.se",
  "ratsit.se",
  "bolagsfakta.se",
  "reco.se",
  "merinfo.se",
  "proff.se",
  "bing.com",
  "duckduckgo.com",
  "yelp.com",
  "trustpilot.com",
]);

// Prefix labels that match any TLD/subdomain (e.g. google.*, yahoo.*).
const DIRECTORY_LABEL_PREFIXES = ["google", "yahoo"];

const NEED_TERMS: Record<string, string> = {
  webb: '("hemsida" OR "webbplats" OR "webbdesign")',
  ehandel: '("e-handel" OR "webshop" OR "onlinebutik")',
  ai: '("automation" OR "AI" OR "manuellt arbete")',
  valfritt: "",
};

export type NeedType = "webb" | "ehandel" | "ai" | "valfritt";

export function buildSearchQuery(input: {
  freeText: string;
  needType: NeedType;
  industry?: string | null;
  location?: string | null;
}): string {
  const parts: string[] = [];
  const free = input.freeText.trim();
  if (free) parts.push(free);
  const need = NEED_TERMS[input.needType] ?? "";
  if (need) parts.push(need);
  if (input.industry && input.industry.trim()) parts.push(`"${input.industry.trim()}"`);
  if (input.location && input.location.trim()) parts.push(input.location.trim());
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
// Back-compat alias.
export const buildQuery = buildSearchQuery;

export function normalizeDomain(input: string): string | null {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  // Reject obviously non-http schemes early.
  if (/^(mailto:|tel:|javascript:|#)/i.test(trimmed)) return null;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    if (!host.includes(".")) return null;
    if (/\s/.test(host)) return null;
    return host;
  } catch {
    return null;
  }
}

export function isBlockedDomain(domain: string): boolean {
  if (!domain) return true;
  const d = domain.toLowerCase();
  for (const bad of DIRECTORY_HOSTS) {
    if (d === bad || d.endsWith(`.${bad}`)) return true;
  }
  // Match google.*, www.google.*, yahoo.co.uk etc. dynamically.
  const labels = d.split(".");
  for (const prefix of DIRECTORY_LABEL_PREFIXES) {
    const idx = labels.indexOf(prefix);
    // must be a real label (not at end) and followed by at least one TLD label
    if (idx !== -1 && idx < labels.length - 1) return true;
  }
  return false;
}
// Back-compat alias.
export const isDirectoryDomain = isBlockedDomain;

export type FirecrawlLink = string | { url?: string; href?: string; text?: string };

const CONTACT_HINTS: { hint: string; weight: number }[] = [
  { hint: "kontakt", weight: 3 },
  { hint: "kontakta", weight: 3 },
  { hint: "contact", weight: 3 },
  { hint: "contact-us", weight: 3 },
  { hint: "kundtjanst", weight: 2 },
  { hint: "kundtjänst", weight: 2 },
  { hint: "support", weight: 2 },
  { hint: "om-oss", weight: 2 },
  { hint: "about", weight: 2 },
];

export function chooseContactPage(
  baseDomain: string,
  links: FirecrawlLink[] | undefined | null,
): string | null {
  if (!Array.isArray(links)) return null;
  const candidates: { url: string; score: number }[] = [];
  for (const raw of links) {
    const href = typeof raw === "string" ? raw : (raw?.url ?? raw?.href ?? "");
    if (!href || typeof href !== "string") continue;
    const trimmed = href.trim();
    if (!trimmed) continue;
    // Explicitly ignore non-navigational schemes and pure fragments.
    if (/^(mailto:|tel:|javascript:|#)/i.test(trimmed)) continue;
    const domain = normalizeDomain(trimmed);
    if (!domain) continue;
    // Reject external domains.
    if (domain !== baseDomain) continue;
    const lower = trimmed.toLowerCase();
    let score = 0;
    for (const { hint, weight } of CONTACT_HINTS) {
      if (lower.includes(hint)) score += weight;
    }
    if (score > 0) candidates.push({ url: trimmed.split("#")[0], score });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].url;
}
// Back-compat alias.
export const pickContactPage = chooseContactPage;

export type ObservedSignal = {
  signal: string;
  evidence: string;
  points: number;
};

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/**
 * Deterministic fit score. Score = clamp(sum(points), 0, 100).
 * Every signal must carry concrete evidence observed in the scraped content.
 * No signal expresses an assumed need as fact.
 */
export function calculateFitScore(input: {
  needType: NeedType;
  industry?: string | null;
  location?: string | null;
  markdown?: string | null;
  contactUrl?: string | null;
  domain: string;
}): { score: number; signals: ObservedSignal[] } {
  const signals: ObservedSignal[] = [];
  const md = (input.markdown ?? "").toString();
  const mdLower = md.toLowerCase();

  if (input.contactUrl) {
    signals.push({
      signal: "has_contact_page",
      evidence: `Publik kontaktsida på samma domän: ${input.contactUrl}`,
      points: 12,
    });
  }

  if (input.industry && input.industry.trim()) {
    const ind = input.industry.trim();
    if (mdLower.includes(ind.toLowerCase())) {
      signals.push({
        signal: "industry_match",
        evidence: `Sidtexten nämner branschordet "${ind}"`,
        points: 15,
      });
    }
  }

  if (input.location && input.location.trim()) {
    const loc = input.location.trim();
    if (mdLower.includes(loc.toLowerCase())) {
      signals.push({
        signal: "location_match",
        evidence: `Sidtexten nämner orten/regionen "${loc}"`,
        points: 12,
      });
    }
  }

  // Old copyright year — must be at least 2 years behind current year.
  const years: number[] = [];
  const yearRe = /(?:©|copyright)\s*(20\d{2})/gi;
  let m: RegExpExecArray | null;
  while ((m = yearRe.exec(md)) !== null) {
    const y = Number(m[1]);
    if (Number.isFinite(y)) years.push(y);
  }
  if (years.length) {
    const newest = Math.max(...years);
    const currentYear = new Date().getUTCFullYear();
    if (currentYear - newest >= 2) {
      signals.push({
        signal: "old_copyright",
        evidence: `Copyright-år ${newest} hittat i sidtexten (aktuellt år ${currentYear})`,
        points: 18,
      });
    }
  }

  if (/(under\s+ombyggnad|under\s+construction|coming\s+soon|tillfällig\s+sida|placeholder)/i.test(md)) {
    signals.push({
      signal: "placeholder_site",
      evidence: 'Sidan innehåller uttrycklig text om "ombyggnad/tillfällig sida/placeholder"',
      points: 25,
    });
  }

  if (md.length >= 200) {
    const ctaWords = ["kontakta oss", "boka", "offert", "kom igång", "get started", "get a quote"];
    const hasCta = ctaWords.some((w) => mdLower.includes(w));
    if (!hasCta) {
      signals.push({
        signal: "no_clear_cta",
        evidence: "Ingen tydlig CTA-fras (kontakta/boka/offert/kom igång) hittad i skannat huvudinnehåll",
        points: 8,
      });
    }
  }

  if (input.needType === "ehandel" && md.length >= 200) {
    if (!/\b(kassa|varukorg|checkout|cart|köp\s+nu)\b/i.test(md)) {
      signals.push({
        signal: "no_shop_signal",
        evidence: "Ingen e-handelsindikator (kassa/varukorg/checkout) hittad i skannat innehåll",
        points: 8,
      });
    }
  }

  const rawScore = signals.reduce((sum, s) => sum + (Number.isFinite(s.points) ? s.points : 0), 0);
  const score = clamp(rawScore, 0, 100);
  return { score, signals };
}
// Back-compat alias with old return signal shape adapted.
export const scoreFit = calculateFitScore;

export type Signal = ObservedSignal;

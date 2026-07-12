// Pure helpers for firecrawl-prospect-search — extracted for unit tests.

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
  "google.com",
  "google.se",
  "bing.com",
  "duckduckgo.com",
  "yelp.com",
  "trustpilot.com",
]);

const NEED_TERMS: Record<string, string> = {
  webb: '("hemsida" OR "webbplats" OR "webbdesign")',
  ehandel: '("e-handel" OR "webshop" OR "onlinebutik")',
  ai: '("automation" OR "AI" OR "manuellt arbete")',
  valfritt: "",
};

export type NeedType = "webb" | "ehandel" | "ai" | "valfritt";

export function buildQuery(input: {
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

export function normalizeDomain(input: string): string | null {
  if (!input) return null;
  try {
    const withProto = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const u = new URL(withProto);
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    if (!host.includes(".")) return null;
    return host;
  } catch {
    return null;
  }
}

export function isDirectoryDomain(domain: string): boolean {
  if (!domain) return true;
  const d = domain.toLowerCase();
  for (const bad of DIRECTORY_HOSTS) {
    if (d === bad || d.endsWith(`.${bad}`)) return true;
  }
  return false;
}

export type FirecrawlLink = string | { url?: string; href?: string; text?: string };

const CONTACT_HINTS = [
  "kontakt",
  "kontakta",
  "contact",
  "contact-us",
  "kundtjanst",
  "kundtjänst",
  "support",
  "om-oss",
  "about",
];

export function pickContactPage(baseDomain: string, links: FirecrawlLink[] | undefined | null): string | null {
  if (!Array.isArray(links)) return null;
  const candidates: { url: string; score: number }[] = [];
  for (const raw of links) {
    const href = typeof raw === "string" ? raw : (raw?.url ?? raw?.href ?? "");
    if (!href) continue;
    const domain = normalizeDomain(href);
    if (!domain || domain !== baseDomain) continue;
    const lower = href.toLowerCase();
    let score = 0;
    for (const hint of CONTACT_HINTS) {
      if (lower.includes(hint)) score += hint === "kontakt" || hint === "contact" ? 3 : 2;
    }
    if (score > 0) candidates.push({ url: href.split("#")[0], score });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].url;
}

export type Signal = { code: string; label: string };

export function scoreFit(input: {
  needType: NeedType;
  industry?: string | null;
  location?: string | null;
  markdown?: string | null;
  contactUrl?: string | null;
  domain: string;
}): { score: number; signals: Signal[] } {
  const signals: Signal[] = [];
  const md = (input.markdown ?? "").toLowerCase();
  let score = 40; // baseline for a real, non-directory hit

  if (input.contactUrl) {
    score += 8;
    signals.push({ code: "has_contact_page", label: "Har publik kontaktsida" });
  } else {
    signals.push({ code: "no_contact_page", label: "Ingen tydlig kontaktsida hittad" });
  }

  if (input.industry && input.industry.trim()) {
    const ind = input.industry.trim().toLowerCase();
    if (md.includes(ind)) {
      score += 10;
      signals.push({ code: "industry_match", label: `Matchar bransch: ${input.industry}` });
    }
  }
  if (input.location && input.location.trim()) {
    const loc = input.location.trim().toLowerCase();
    if (loc && md.includes(loc)) {
      score += 8;
      signals.push({ code: "location_match", label: `Matchar ort/region: ${input.location}` });
    }
  }

  // Old copyright year
  const years = Array.from(md.matchAll(/©\s*(20\d{2})|copyright\s*(20\d{2})/g))
    .map((m) => Number(m[1] ?? m[2]))
    .filter((y) => Number.isFinite(y));
  if (years.length) {
    const newest = Math.max(...years);
    const currentYear = new Date().getUTCFullYear();
    if (currentYear - newest >= 2) {
      score += 10;
      signals.push({ code: "old_copyright", label: `Gammalt copyright-år (${newest})` });
    }
  }

  if (/(under\s+ombyggnad|under\s+construction|coming\s+soon|tillfällig\s+sida|placeholder)/.test(md)) {
    score += 15;
    signals.push({ code: "placeholder_site", label: "Uttrycklig text om ombyggnad/tillfällig sida" });
  }

  const ctaWords = ["kontakta oss", "boka", "offert", "kom igång", "get started", "get a quote"];
  const hasCta = ctaWords.some((w) => md.includes(w));
  if (!hasCta && md.length > 200) {
    score += 6;
    signals.push({ code: "no_clear_cta", label: "Ingen tydlig CTA på skannad sida" });
  }

  if (input.needType === "ehandel" && !/\b(kassa|varukorg|checkout|cart|köp\s+nu)\b/.test(md)) {
    score += 4;
    signals.push({ code: "no_shop_signal", label: "Ingen tydlig e-handelsindikator" });
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;
  return { score, signals };
}

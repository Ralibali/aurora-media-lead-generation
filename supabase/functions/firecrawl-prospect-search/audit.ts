import { calculateFitScore, type FirecrawlLink, type NeedType, type ObservedSignal } from "./lib.ts";

export type FirecrawlAuditMetadata = {
  title?: string | null;
  description?: string | null;
  robots?: string | null;
  sourceURL?: string | null;
  statusCode?: number | null;
  contentType?: string | null;
};

export type WebsiteAuditInput = {
  companyName: string;
  domain: string;
  needType: NeedType;
  industry?: string | null;
  location?: string | null;
  markdown?: string | null;
  rawHtml?: string | null;
  links?: FirecrawlLink[] | null;
  screenshotUrl?: string | null;
  metadata?: FirecrawlAuditMetadata | null;
};

export type OpportunityAudit = {
  opportunityScore: number;
  signals: ObservedSignal[];
  summary: string;
  pitchDraft: string;
  demoBrief: string[];
  pageTitle: string | null;
  metaDescription: string | null;
  robots: string | null;
  httpStatus: number | null;
  screenshotUrl: string | null;
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

function hasMetaDescription(html: string) {
  return /<meta\b(?=[^>]*\bname\s*=\s*["']description["'])(?=[^>]*\bcontent\s*=\s*["'][^"']{12,}["'])[^>]*>/i.test(html);
}

function hasViewport(html: string) {
  return /<meta\b(?=[^>]*\bname\s*=\s*["']viewport["'])[^>]*>/i.test(html);
}

function hasCanonical(html: string) {
  return /<link\b(?=[^>]*\brel\s*=\s*["'][^"']*canonical[^"']*["'])(?=[^>]*\bhref\s*=\s*["']https?:\/\/[^"']+["'])[^>]*>/i.test(html);
}

function titleFromHtml(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]{1,300}?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() || null;
}

function isProblemSignal(signal: ObservedSignal) {
  return !["has_contact_page", "industry_match", "location_match"].includes(signal.signal);
}

export function buildOpportunityAudit(input: WebsiteAuditInput): OpportunityAudit {
  const markdown = String(input.markdown ?? "");
  const html = String(input.rawHtml ?? "");
  const metadata = input.metadata ?? {};
  const pageTitle = (metadata.title ?? titleFromHtml(html) ?? "").trim() || null;
  const metaDescription = (metadata.description ?? "").trim() || null;
  const robots = (metadata.robots ?? "").trim() || null;
  const httpStatus = Number.isFinite(Number(metadata.statusCode)) ? Number(metadata.statusCode) : null;

  const contactUrl = (() => {
    const { chooseContactPage } = {
      chooseContactPage: (domain: string, links: FirecrawlLink[] | null | undefined) => {
        if (!Array.isArray(links)) return null;
        const hints = ["kontakt", "kontakta", "contact", "support", "om-oss", "about"];
        for (const link of links) {
          const href = typeof link === "string" ? link : link?.url ?? link?.href ?? "";
          if (!href) continue;
          try {
            const url = new URL(href, `https://${domain}`);
            if (url.hostname.replace(/^www\./, "") !== domain) continue;
            if (hints.some((hint) => url.pathname.toLowerCase().includes(hint))) return url.href;
          } catch {
            // Ignore malformed links.
          }
        }
        return null;
      },
    };
    return chooseContactPage(input.domain, input.links);
  })();

  const base = calculateFitScore({
    needType: input.needType,
    industry: input.industry,
    location: input.location,
    markdown,
    contactUrl,
    domain: input.domain,
  });

  const signals: ObservedSignal[] = [...base.signals];

  if (httpStatus != null && (httpStatus < 200 || httpStatus >= 400)) {
    signals.push({
      signal: "http_problem",
      evidence: `Firecrawl rapporterade HTTP ${httpStatus} för startsidan.`,
      points: 35,
    });
  }

  if (/noindex/i.test(robots ?? "") || /<meta\b(?=[^>]*\bname\s*=\s*["'](?:robots|googlebot)["'])(?=[^>]*\bcontent\s*=\s*["'][^"']*noindex)[^>]*>/i.test(html)) {
    signals.push({
      signal: "noindex",
      evidence: "Sidan anger noindex i robots-metadata.",
      points: 30,
    });
  }

  if (html.length >= 300 && !hasViewport(html)) {
    signals.push({
      signal: "missing_viewport",
      evidence: "Ingen viewport-meta hittades i sidans rå-HTML.",
      points: 15,
    });
  }

  if (!pageTitle) {
    signals.push({
      signal: "missing_title",
      evidence: "Ingen sidtitel kunde verifieras i metadata eller HTML.",
      points: 10,
    });
  }

  if (html.length >= 300 && !metaDescription && !hasMetaDescription(html)) {
    signals.push({
      signal: "missing_meta_description",
      evidence: "Ingen meta description kunde verifieras.",
      points: 8,
    });
  }

  if (html.length >= 300 && !hasCanonical(html)) {
    signals.push({
      signal: "missing_canonical",
      evidence: "Ingen canonical-länk kunde verifieras i sidans rå-HTML.",
      points: 4,
    });
  }

  const problemSignals = signals.filter(isProblemSignal);
  const reachabilityBonus = signals.some((s) => s.signal === "has_contact_page") ? 8 : 0;
  const relevanceBonus =
    (signals.some((s) => s.signal === "industry_match") ? 6 : 0) +
    (signals.some((s) => s.signal === "location_match") ? 6 : 0);
  const opportunityScore = clamp(
    problemSignals.reduce((sum, signal) => sum + signal.points, 0) + reachabilityBonus + relevanceBonus,
  );

  const strongest = [...problemSignals].sort((a, b) => b.points - a.points).slice(0, 3);
  const summary = strongest.length
    ? `Verifierade möjligheter: ${strongest.map((s) => s.evidence.replace(/\.$/, "")).join("; ")}.`
    : "Inga tydliga webbproblem verifierades automatiskt på startsidan. Gör en manuell granskning innan kontakt.";

  const evidenceSentence = strongest.length
    ? strongest.map((s) => s.evidence.replace(/\.$/, "")).join(", ")
    : "jag hittade inga tydliga tekniska problem som bör användas som säljpåstående";

  const pitchDraft =
    `UTKAST – GRANSKA FÖRE KONTAKT\n\nHej! Jag tittade på ${input.companyName}s webbplats. I den automatiska kontrollen såg jag att ${evidenceSentence}. ` +
    "Om det är relevant kan vi visa ett konkret förbättringsförslag med tydligare konverteringsflöde och modernare struktur. Ingen åtgärd eller kontakt skickas automatiskt.";

  const demoBrief: string[] = [];
  const has = (name: string) => problemSignals.some((s) => s.signal === name);
  if (has("placeholder_site") || has("http_problem")) demoBrief.push("Ny, stabil startsida med tydligt erbjudande och kontaktväg.");
  if (has("no_clear_cta")) demoBrief.push("En primär CTA för offert, bokning eller kontakt ovanför folden.");
  if (has("missing_title") || has("missing_meta_description") || has("missing_canonical") || has("noindex")) {
    demoBrief.push("Teknisk SEO-bas: title, meta description, canonical och indexeringskontroll.");
  }
  if (has("missing_viewport")) demoBrief.push("Responsiv mobilstruktur och verifierad viewport.");
  if (has("old_copyright")) demoBrief.push("Uppdatera daterat innehåll/footer och visuella förtroendesignaler.");
  if (input.needType === "ehandel" && has("no_shop_signal")) demoBrief.push("Tydligt produkt-/köpflöde för den e-handelsmöjlighet som kampanjen söker.");
  if (!demoBrief.length) demoBrief.push("Manuell före/efter-demo först efter att ett verkligt förbättringsområde har verifierats.");

  return {
    opportunityScore,
    signals,
    summary,
    pitchDraft,
    demoBrief,
    pageTitle,
    metaDescription,
    robots,
    httpStatus,
    screenshotUrl: input.screenshotUrl ?? null,
  };
}

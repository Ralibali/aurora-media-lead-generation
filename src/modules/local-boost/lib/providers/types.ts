/**
 * Leverantörsgränssnitt (adapters).
 *
 * Ingen betalleverantör är hårdkodad. Varje gränssnitt har minst två
 * implementationer: en demoimplementation (allt märkt DEMO) och en
 * "ej konfigurerad"-implementation som aldrig hittar på data.
 */

export type ProviderMode = "demo" | "not_configured" | "live";

export type ProviderInfo = {
  key: string;
  name: string;
  mode: ProviderMode;
};

/** Alla leverantörsanrop returnerar detta kuvert. Aldrig naken data. */
export type ProviderResult<T> =
  | { ok: true; provider: ProviderInfo; isDemo: boolean; data: T }
  | { ok: false; provider: ProviderInfo; reason: "not_configured" | "error"; message: string };

export type RankingPoint = {
  keyword: string;
  geo: string | null;
  position: number | null;
  localPackPosition: number | null;
  capturedAt: string;
};

export type CitationRecord = {
  directory: string;
  url: string | null;
  status: "ok" | "mismatch" | "missing" | "unknown";
  foundName: string | null;
  foundPhone: string | null;
  checkedAt: string | null;
};

export type CompetitorRecord = {
  name: string;
  rating: number | null;
  reviewCount: number | null;
  notes: string | null;
};

export type GbpProfile = {
  name: string;
  verified: boolean;
  categories: string[];
  rating: number | null;
  reviewCount: number | null;
};

export type GbpReview = {
  externalId: string;
  authorName: string;
  rating: number;
  body: string;
  reviewDate: string;
};

export type PublishResult = { publishedAt: string; externalId: string };

export type AiVisibilityPoint = {
  engine: string;
  prompt: string;
  mentioned: boolean;
  rankInAnswer: number | null;
  capturedAt: string;
};

export type LocationRef = {
  id: string;
  name: string;
  city: string | null;
  phone: string | null;
};

export interface LocalDataProvider {
  info: ProviderInfo;
  getRankings(location: LocationRef, keywords: string[]): Promise<ProviderResult<RankingPoint[]>>;
  getCitations(location: LocationRef): Promise<ProviderResult<CitationRecord[]>>;
  getCompetitors(location: LocationRef): Promise<ProviderResult<CompetitorRecord[]>>;
}

export interface GBPProvider {
  info: ProviderInfo;
  getProfile(location: LocationRef): Promise<ProviderResult<GbpProfile>>;
  listReviews(location: LocationRef): Promise<ProviderResult<GbpReview[]>>;
  /** Får bara anropas efter godkännande. */
  publishReviewReply(
    location: LocationRef,
    reviewExternalId: string,
    text: string,
  ): Promise<ProviderResult<PublishResult>>;
}

export interface AuroraSightProvider {
  info: ProviderInfo;
  getAiVisibility(
    location: LocationRef,
    prompts: string[],
  ): Promise<ProviderResult<AiVisibilityPoint[]>>;
}

export const NOT_CONFIGURED_MESSAGE = "Ej konfigurerad. Ingen data hämtas och inget publiceras.";

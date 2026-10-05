import {
  NOT_CONFIGURED_MESSAGE,
  type AuroraSightProvider,
  type GBPProvider,
  type LocalDataProvider,
  type ProviderInfo,
  type ProviderResult,
} from "./types.ts";

function fail<T>(provider: ProviderInfo): ProviderResult<T> {
  return { ok: false, provider, reason: "not_configured", message: NOT_CONFIGURED_MESSAGE };
}

export function createNotConfiguredLocalData(key: string, name: string): LocalDataProvider {
  const info: ProviderInfo = { key, name, mode: "not_configured" };
  return {
    info,
    getRankings: async () => fail(info),
    getCitations: async () => fail(info),
    getCompetitors: async () => fail(info),
  };
}

export function createNotConfiguredGbp(key: string, name: string): GBPProvider {
  const info: ProviderInfo = { key, name, mode: "not_configured" };
  return {
    info,
    getProfile: async () => fail(info),
    listReviews: async () => fail(info),
    publishReviewReply: async () => fail(info),
  };
}

export function createNotConfiguredAuroraSight(key: string, name: string): AuroraSightProvider {
  const info: ProviderInfo = { key, name, mode: "not_configured" };
  return {
    info,
    getAiVisibility: async () => fail(info),
  };
}

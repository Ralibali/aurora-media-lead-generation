import { createDemoAuroraSight, createDemoGbp, createDemoLocalData } from "./demo.ts";
import {
  createNotConfiguredAuroraSight,
  createNotConfiguredGbp,
  createNotConfiguredLocalData,
} from "./not-configured.ts";
import type { AuroraSightProvider, GBPProvider, LocalDataProvider } from "./types.ts";

export * from "./types.ts";
export { createDemoAuroraSight, createDemoGbp, createDemoLocalData };
export {
  createNotConfiguredAuroraSight,
  createNotConfiguredGbp,
  createNotConfiguredLocalData,
};

export type ProviderEnv = Record<string, string | undefined>;

/**
 * Väljer leverantör utifrån miljövariabler. Saknas nycklar blir svaret
 * "ej konfigurerad" — aldrig påhittad data, aldrig tyst fallback till demo
 * utom när demoläget uttryckligen är påslaget.
 */
export function resolveLocalDataProvider(env: ProviderEnv): LocalDataProvider {
  if (env['BRIGHTLOCAL_API_KEY']) {
    return createNotConfiguredLocalData("brightlocal", "BrightLocal");
  }
  if (env['DATAFORSEO_LOGIN'] && env['DATAFORSEO_PASSWORD']) {
    return createNotConfiguredLocalData("dataforseo", "DataForSEO");
  }
  if (env['LOCAL_FALCON_API_KEY']) {
    return createNotConfiguredLocalData("local_falcon", "Local Falcon");
  }
  if (env['AURORA_DEMO_MODE'] === "true") {
    return createDemoLocalData();
  }
  return createNotConfiguredLocalData("local_data", "Lokal dataleverantör");
}

export function resolveGbpProvider(env: ProviderEnv): GBPProvider {
  if (env['GBP_OAUTH_CLIENT_ID'] && env['GBP_OAUTH_CLIENT_SECRET'] && env['GBP_REFRESH_TOKEN']) {
    return createNotConfiguredGbp("gbp_api", "Google Business Profile API");
  }
  if (env['AURORA_DEMO_MODE'] === "true") {
    return createDemoGbp();
  }
  return createNotConfiguredGbp("gbp_api", "Google Business Profile API");
}

export function resolveAuroraSightProvider(env: ProviderEnv): AuroraSightProvider {
  if (env['AURORA_SIGHT_BASE_URL'] && env['AURORA_SIGHT_API_KEY']) {
    return createNotConfiguredAuroraSight("aurora_sight", "Aurora Sight");
  }
  if (env['AURORA_DEMO_MODE'] === "true") {
    return createDemoAuroraSight();
  }
  return createNotConfiguredAuroraSight("aurora_sight", "Aurora Sight");
}

import { createDemoProvider } from "./demo-provider.ts";
import { createDograhProvider, readDograhConfig } from "./dograh-provider.ts";
import type { VoiceProvider } from "./types.ts";

/**
 * Resolve the active voice provider. Call this only from server code, so the
 * upstream credentials are read at request time and never reach the browser.
 */
export function resolveVoiceProvider(env: Record<string, string | undefined>): VoiceProvider {
  const dograh = readDograhConfig(env);
  if (dograh) return createDograhProvider(dograh);
  return createDemoProvider();
}

export * from "./types.ts";
export { createDemoProvider } from "./demo-provider.ts";
export { createDograhProvider, readDograhConfig, mapUpstreamCall } from "./dograh-provider.ts";

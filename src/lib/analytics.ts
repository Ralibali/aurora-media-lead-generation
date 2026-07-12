// Lightweight analytics wrapper. Safe to call even if no analytics provider is loaded.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

function plausibleProps(params?: Record<string, unknown>): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;

  const props = Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
      .map(([key, value]) => [key, value as string | number | boolean]),
  );

  return Object.keys(props).length > 0 ? props : undefined;
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  try {
    if (typeof window === "undefined") return;

    // Plausible is the primary analytics provider on auroramedia.se.
    if (typeof window.plausible === "function") {
      window.plausible(name, { props: plausibleProps(params) });
    }

    // Keep GA4 support for environments where a real measurement ID is configured.
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params ?? {});
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...(params ?? {}) });
    }
  } catch {
    /* Analytics must never break the user flow. */
  }
}

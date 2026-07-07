// Lightweight GA4 event wrapper. Safe to call even if gtag isn't loaded (dev/SSR).
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  try {
    if (typeof window === "undefined") return;
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params ?? {});
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...(params ?? {}) });
    }
  } catch {
    /* ignore */
  }
}

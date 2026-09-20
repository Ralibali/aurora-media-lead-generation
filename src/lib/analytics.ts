import { sendAnalyticsEvent } from './ga4Runtime';
/** Consent-gated GA4 dispatch; never sends form values or customer identifiers. */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  sendAnalyticsEvent(name, { props: params });
}

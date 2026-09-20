import { cleanAnalyticsUrl } from './ga4Runtime';
export const ADS_CONSENT_KEY = 'auroramedia_ads_consent_v1';
type AdsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; gtag_report_conversion?: () => boolean };
let granted = false;
let configured = false;
export function setAdsConsent(accepted: boolean) {
  granted = accepted;
  const w = window as AdsWindow;
  w.dataLayer ||= [];
  w.gtag ||= (...args) => { w.dataLayer!.push(args); };
  w.gtag('consent', 'update', { ad_storage: accepted ? 'granted' : 'denied', ad_user_data: accepted ? 'granted' : 'denied', ad_personalization: accepted ? 'granted' : 'denied' });
  if (accepted && !configured) {
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      const script = document.createElement('script'); script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-10941540384';
      document.head.appendChild(script);
    }
    w.gtag('js', new Date());
    w.gtag('config', 'AW-10941540384', { send_page_view: false, page_location: cleanAnalyticsUrl(location.href) || location.origin + '/internal' });
    configured = true;
  }
}
export function restoreAdsConsent() {
  try { setAdsConsent(localStorage.getItem(ADS_CONSENT_KEY) === 'accepted'); } catch { setAdsConsent(false); }
  (window as AdsWindow).gtag_report_conversion = () => {
    if (granted) (window as AdsWindow).gtag?.('event', 'conversion', { send_to: 'AW-10941540384/J-6HCLb0q90cEKDQquEo', page_location: cleanAnalyticsUrl(location.href) || location.origin + '/internal' });
    return false;
  };
}

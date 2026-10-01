import { COOKIE_CONSENT_KEY, parseCookieConsent } from './cookieConsent';
import { cleanAnalyticsUrl } from './ga4Runtime';
export const ADS_CONSENT_KEY = COOKIE_CONSENT_KEY;
type AdsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; gtag_report_conversion?: () => boolean };
let granted = false;
let configured = false;
export function setAdsConsent(accepted: boolean) {
  granted = accepted;
  const w = window as AdsWindow;
  w.dataLayer ||= [];
  // eslint-disable-next-line prefer-rest-params
  w.gtag ||= function () { w.dataLayer!.push(arguments); };
  w.gtag('consent', 'update', { ad_storage: accepted ? 'granted' : 'denied', ad_user_data: accepted ? 'granted' : 'denied', ad_personalization: accepted ? 'granted' : 'denied' });
  if (!accepted) {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_gcl_|^_gac_/.test(name)) continue;
      for (const domain of ['', location.hostname, '.auroramedia.se']) document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}; SameSite=Lax`;
    }
  }
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
  try { setAdsConsent(parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))?.marketing === true); } catch { setAdsConsent(false); }
  (window as AdsWindow).gtag_report_conversion = () => {
    if (granted) (window as AdsWindow).gtag?.('event', 'conversion', { send_to: 'AW-10941540384/J-6HCLb0q90cEKDQquEo', page_location: cleanAnalyticsUrl(location.href) || location.origin + '/internal' });
    return false;
  };
}

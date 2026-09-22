import { initGa4 } from './ga4Runtime';
import { restoreAdsConsent } from './adsConsent';
(window as unknown as Record<string, unknown>)['ga-disable-G-C0XMZG0KDQ'] = true;
initGa4({
  "measurementId": "G-YBH1YE5XEN",
  "hosts": [
    "auroramedia.se",
    "www.auroramedia.se"
  ],
  "excluded": [
    "/admin",
    "/portal",
    "/dashboard"
  ],
  "consentKey": "auroramedia_ga4_consent_v1"
});
restoreAdsConsent();

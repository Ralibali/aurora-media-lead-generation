import { setAdsConsent } from '@/lib/adsConsent';
import { useEffect, useState } from 'react';
import { setAnalyticsConsent } from '@/lib/ga4Runtime';
import { COOKIE_CONSENT_KEY, createConsentState, parseCookieConsent } from '@/lib/cookieConsent';

export default function AnalyticsConsent() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const restore = () => {
      let state = null;
      try {
        localStorage.removeItem('auroramedia_ga4_consent_v1');
        localStorage.removeItem('auroramedia_ads_consent_v1');
        state = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
        if (!state) localStorage.removeItem(COOKIE_CONSENT_KEY);
      } catch { /* Missing storage requires a new choice. */ }
      setAnalytics(state?.analytics ?? false); setMarketing(state?.marketing ?? false);
      setAnalyticsConsent(state?.analytics ?? false); setAdsConsent(state?.marketing ?? false);
      if (!state) setOpen(true);
    };
    restore();
    const sync = (event: StorageEvent) => { if (event.key === COOKIE_CONSENT_KEY || event.key === null) restore(); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const choose = (statistics: boolean, ads: boolean) => {
    try { localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(createConsentState(statistics, ads))); } catch { /* Choice applies on this page. */ }
    setAnalytics(statistics); setMarketing(ads); setAnalyticsConsent(statistics); setAdsConsent(ads); setOpen(false);
  };
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="fixed bottom-2 left-2 z-40 rounded border bg-background px-2 py-1 text-xs">Cookieinställningar</button>;
  return <section role="dialog" aria-labelledby="analytics-consent-title" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border bg-background p-4 text-foreground shadow-lg">
    <h2 id="analytics-consent-title" className="font-semibold">Dina cookieinställningar</h2>
    <p className="my-2 text-sm">Välj valfri statistik och marknadsföring separat. Du kan ändra ditt val via Cookieinställningar. Nödvändig lagring används för tjänsten och ditt val.</p>
    <p className="my-2 text-sm"><a className="underline" href="/integritetspolicy">Läs integritetspolicyn</a></p>
    <label className="my-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} /> Statistik (Google Analytics 4)</label>
    <label className="my-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={marketing} onChange={event => setMarketing(event.target.checked)} /> Marknadsföringsmätning (Google Ads)</label>
    <div className="flex flex-wrap gap-3">
      <button type="button" className="rounded border px-3 py-2" onClick={() => choose(false, false)}>Endast nödvändiga</button>
      <button type="button" className="rounded border px-3 py-2" onClick={() => choose(true, true)}>Acceptera alla</button>
      <button type="button" className="rounded border px-3 py-2" onClick={() => choose(analytics, marketing)}>Spara mina val</button>
    </div>
  </section>;
}

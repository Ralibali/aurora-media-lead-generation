import { ADS_CONSENT_KEY, setAdsConsent } from '@/lib/adsConsent';
import { useEffect, useState } from 'react';
import { setAnalyticsConsent } from '@/lib/ga4Runtime';
const KEY = 'auroramedia_ga4_consent_v1';
export default function AnalyticsConsent() {
  const [marketing, setMarketing] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { try { setOpen(!localStorage.getItem(KEY)); setMarketing(localStorage.getItem(ADS_CONSENT_KEY) === 'accepted'); } catch { setOpen(true); } }, []);
  const choose = (accepted: boolean) => {
    try { localStorage.setItem(KEY, accepted ? 'accepted' : 'declined'); } catch { /* session choice remains valid */ }
    try { localStorage.setItem(ADS_CONSENT_KEY, accepted && marketing ? 'accepted' : 'declined'); } catch { /* session choice */ }
    setAdsConsent(accepted && marketing);
    setAnalyticsConsent(accepted); setOpen(false);
  };
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="fixed bottom-2 left-2 z-40 rounded border bg-background px-2 py-1 text-xs">Cookieinställningar</button>;
  return <section role="dialog" aria-labelledby="analytics-consent-title" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border bg-background p-4 text-foreground shadow-lg">
    <h2 id="analytics-consent-title" className="font-semibold">Valfri statistik</h2>
    <p className="my-2 text-sm">Med ditt samtycke använder vi Google Analytics 4 och statistikcookies för att förstå hur webbplatsen används. Du kan ändra ditt val via Cookieinställningar.</p>
    <p className="my-2 text-sm"><a className="underline" href="/integritetspolicy">Läs integritetspolicyn</a></p>
    <label className="my-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={marketing} onChange={event => setMarketing(event.target.checked)} /> Tillåt även Google Ads för marknadsföringsmätning</label>
    <div className="flex gap-3"><button type="button" className="rounded border px-3 py-2" onClick={() => choose(false)}>Endast nödvändiga</button><button type="button" className="rounded border px-3 py-2" onClick={() => choose(true)}>Acceptera statistik</button></div>
  </section>;
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AnalyticsConsent from './AnalyticsConsent';
import { COOKIE_CONSENT_KEY, createConsentState, parseCookieConsent } from '@/lib/cookieConsent';
import { setAnalyticsConsent } from '@/lib/ga4Runtime';
import { setAdsConsent } from '@/lib/adsConsent';
vi.mock('@/lib/ga4Runtime', () => ({ setAnalyticsConsent: vi.fn() }));
vi.mock('@/lib/adsConsent', () => ({ setAdsConsent: vi.fn() }));
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
afterEach(cleanup);
describe('separate consent categories', () => {
  it('starts denied, then allows marketing independently of statistics', () => {
    render(<AnalyticsConsent />);
    expect(setAnalyticsConsent).toHaveBeenLastCalledWith(false);
    expect(setAdsConsent).toHaveBeenLastCalledWith(false);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Marknadsföringsmätning (Google Ads)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Spara mina val' }));
    expect(parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY))).toMatchObject({ analytics: false, marketing: true });
    expect(setAnalyticsConsent).toHaveBeenLastCalledWith(false);
    expect(setAdsConsent).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Cookieinställningar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Endast nödvändiga' }));
    expect(setAdsConsent).toHaveBeenLastCalledWith(false);
  });
  it('asks again for expired or old undated approval', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(createConsentState(true, true, '2020-01-01')));
    localStorage.setItem('auroramedia_ga4_consent_v1', 'accepted');
    render(<AnalyticsConsent />);
    expect(screen.getByRole('button', { name: 'Spara mina val' })).toBeInTheDocument();
    expect(setAnalyticsConsent).toHaveBeenLastCalledWith(false);
    expect(localStorage.getItem('auroramedia_ga4_consent_v1')).toBeNull();
  });
  it('withdraws consent in this page when another tab removes its choice', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(createConsentState(true, true)));
    render(<AnalyticsConsent />);
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    fireEvent(window, new StorageEvent('storage', { key: COOKIE_CONSENT_KEY, newValue: null }));
    expect(setAnalyticsConsent).toHaveBeenLastCalledWith(false);
    expect(setAdsConsent).toHaveBeenLastCalledWith(false);
  });
});

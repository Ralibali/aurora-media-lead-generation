import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminFetch } from '@/lib/adminClient';
import type { PortfolioResponse } from '@/lib/portfolioDashboard';
import PortfolioDashboard from './PortfolioDashboard';

vi.mock('@/lib/adminClient', () => ({ adminFetch: vi.fn() }));
const fetchMock = vi.mocked(adminFetch);
const initial = (): PortfolioResponse => ({
  projects: Array.from({ length: 36 }, (_, index) => ({ id: `project-${index}`, name: `Projekt ${String(index + 1).padStart(2, '0')}`, url: null, kind: index === 35 ? 'Äldre projekt' : 'Produkt', stage: index === 0 ? 'live' : 'internal' })),
  snapshots: [], checks: [], sourceStates: [], generatedAt: '2026-10-01T12:00:00Z', connections: { ga4: false, gsc: false },
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('daily portfolio dashboard', { timeout: 45_000 }, () => {
  it('shows the complete inventory including internal and legacy projects', async () => {
    fetchMock.mockResolvedValue(initial());
    render(<PortfolioDashboard />);
    expect(await screen.findByText('Projekt 36')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(36);
    expect(screen.getByText('Visar 36 av 36 projekt')).toBeInTheDocument();
    expect(screen.getByText('Anslut Google för löpande statistik')).toBeInTheDocument();
    expect(screen.getByText('Inga färska kontroller. Okänd status räknas aldrig som fungerande.')).toBeInTheDocument();
  });
  it('searches all projects and supports a live-only filter', async () => {
    fetchMock.mockResolvedValue(initial());
    render(<PortfolioDashboard />);
    await screen.findByText('Projekt 36');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Sök projekt' }), { target: { value: 'Projekt 36' } });
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Visar 1 av 36 projekt')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Sök projekt' }), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Publicerade 1/ }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Projekt 01')).toBeInTheDocument();
  });
  it('opens a project with clear disconnected-source states and semantic expanded state', async () => {
    fetchMock.mockResolvedValue(initial());
    render(<PortfolioDashboard />);
    const name = await screen.findByText('Projekt 01');
    const article = name.closest('article')!;
    const button = within(article).getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(within(article).getByRole('heading', { name: 'Google Analytics' })).toBeInTheDocument();
    expect(within(article).getByRole('button', { name: 'Uppdatera GA4' })).toBeDisabled();
    expect(within(article).getAllByText('Behöver anslutas för automatisk uppdatering')).toHaveLength(2);
  });
  it('counts HTTP200 source errors as failed refreshes, keeps the inventory and does not loop', async () => {
    const first = initial();
    first.projects = [{ ...first.projects[0], url: 'https://example.se' }];
    const failed: PortfolioResponse = { ...first, sourceStates: [{ projectId: first.projects[0].id, source: 'health', rangeDays: 0, attemptedAt: new Date().toISOString(), succeededAt: null, error: 'Servern svarade inte' }] };
    fetchMock.mockImplementation(async (_path, init) => {
      const request = JSON.parse(String(init?.body));
      if (request.action === 'refresh') return failed;
      return fetchMock.mock.calls.length > 2 ? failed : first;
    });
    render(<PortfolioDashboard />);
    expect(await screen.findByText('0 av 1 källor uppdaterades. 1 kunde inte uppdateras; sparat underlag visas.')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3), { timeout: 10_000 });
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Tillgänglighetskontrollen kunde inte uppdateras', { exact: false })).toBeInTheDocument();
  });
});

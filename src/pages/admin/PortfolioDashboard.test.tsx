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
  it('prioritizes published projects in management mode and saves a private project plan', async () => {
    let current = initial();
    current.projects[0].github = { fullName: 'example/project', url: 'https://github.com/example/project', isPrivate: true };
    fetchMock.mockImplementation(async (path, init) => {
      if (path === 'admin-support') return { cases: [], sources: [], projects: current.projects, counts: { scope: 'all_matching_filters' }, project_counts: { 'project-0': { open: 4, total: 6 } } };
      const body = JSON.parse(String(init?.body));
      if (body.action === 'manage') current = { ...current, projects: current.projects.map(project => project.id === body.projectId ? { ...project, management: { ...body.management, version: 1 } } : project) };
      return current;
    });
    render(<PortfolioDashboard managementMode />);
    const name = await screen.findByText('Projekt 01');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.queryByText('Anslut Google för löpande statistik')).not.toBeInTheDocument();
    fireEvent.click(within(name.closest('article')!).getByRole('button'));
    expect(await screen.findByRole('link', { name: /4 öppna inlästa/ })).toHaveAttribute('href', '/admin/arenden?project=project-0');
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/example/project');
    fireEvent.change(screen.getByLabelText('Nästa åtgärd'), { target: { value: 'Följ upp ny support' } });
    fireEvent.change(screen.getByLabelText('Privat projektnotering'), { target: { value: 'Kontrollera inloggningen före nästa release.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spara projektplan' }));
    expect(await screen.findByText('Projektets plan är sparad.')).toBeInTheDocument();
    const request = fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body))).find(body => body.action === 'manage');
    expect(request).toMatchObject({ projectId: 'project-0', expectedVersion: 0, management: { note: 'Kontrollera inloggningen före nästa release.', nextAction: 'Följ upp ny support', followupDate: null } });
  });
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

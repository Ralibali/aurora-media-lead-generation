import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WatchFlow, WatchRun } from '@/lib/auroraWatch';
import WatchFlows from './WatchFlows';

const run: WatchRun = { id: 'run-1', flow_id: 'flow-1', status: 'passed', incident_state: 'healthy', attempts: 1, duration_ms: 1000, created_at: new Date().toISOString(), completed_at: new Date().toISOString(), details: {} };
const flow: WatchFlow = { id: 'flow-1', site_id: 'site-1', name: 'Kontaktsidan', active: true, check_interval_minutes: 60, next_run_at: new Date().toISOString(), last_run_at: null, runs: [], steps: [{ type: 'navigate', url: 'https://example.se' }, { type: 'assert_visible', selector: 'form' }] };
const site = { id: 'site-1', name: 'Exempel', url: 'https://example.se', active: true, flows: [flow] };
afterEach(cleanup);

describe('Aurora Watch flow administration', () => {
  it('creates an explicit browser assertion using the existing site and API contract', async () => {
    const request = vi.fn().mockResolvedValue(true);
    render(<WatchFlows site={{ ...site, flows: [] }} busy={false} request={request} />);
    expect(screen.getByText(/En godkänd sidkontroll ovan betyder inte/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Nytt kundflöde' }));
    fireEvent.change(screen.getByLabelText('Flödets namn'), { target: { value: 'Kontakt nås' } });
    fireEvent.change(screen.getByLabelText('Text som måste vara synlig'), { target: { value: 'Kontakta oss' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spara flöde' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith({ action: 'create_flow', site_id: site.id, name: 'Kontakt nås', check_interval_minutes: 1440, steps: [{ type: 'navigate', url: site.url }, { type: 'assert_text', selector: 'body', text: 'Kontakta oss' }] }));
    await waitFor(() => expect(screen.queryByLabelText('Flödets namn')).not.toBeInTheDocument());
  });

  it('prevents a navigation-only flow from being saved as a meaningful check', () => {
    render(<WatchFlows site={site} busy={false} request={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nytt kundflöde' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ta bort steg 2' }));
    expect(screen.getByRole('button', { name: 'Spara flöde' })).toBeDisabled();
    expect(screen.getByText(/Lägg till minst en kontroll/)).toBeInTheDocument();
  });

  it('queues a request without declaring a successful check and retains unsaved edits on failure', async () => {
    const request = vi.fn().mockResolvedValueOnce(true).mockResolvedValue(false);
    render(<WatchFlows site={site} busy={false} request={request} />);
    fireEvent.click(screen.getByRole('button', { name: 'Köa kontroll' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith({ action: 'queue_flow', id: flow.id }));
    expect(await screen.findByText(/En extra kontroll har begärts/)).toBeInTheDocument();
    expect(screen.getByText('Inte testat')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Redigera flöde' }));
    fireEvent.change(screen.getByLabelText('Flödets namn'), { target: { value: 'Ny benämning' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spara flöde' }));
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ action: 'update_flow', id: flow.id, name: 'Ny benämning' })));
    expect(screen.getByLabelText('Flödets namn')).toHaveValue('Ny benämning');
  });

  it('disables queueing on paused sites and while a browser run is in progress', () => {
    const { rerender } = render(<WatchFlows site={{ ...site, active: false }} busy={false} request={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Köa kontroll' })).toBeDisabled();
    rerender(<WatchFlows site={{ ...site, flows: [{ ...flow, runs: [{ ...run, status: 'running' }] }] }} busy={false} request={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Köa kontroll' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Redigera flöde' })).toBeDisabled();
  });

  it('preserves first-attempt evidence on flaky results and renders only private signed screenshots', () => {
    const url = 'https://cyymcdqkpvcvwjoqxbco.supabase.co/storage/v1/object/sign/aurora-watch-evidence/run-1/attempt-1.png?token=signed';
    render(<WatchFlows site={{ ...site, flows: [{ ...flow, runs: [{ ...run, status: 'flaky', attempts: 2, details: {
      attempts_detail: [{ attempt: 1, status: 'failed', duration_ms: 100, error: 'Kontaktlänken saknades', steps: [] }, { attempt: 2, status: 'passed', duration_ms: 100, steps: [] }],
      screenshots: [{ attempt: 1, url, expires_at: new Date(Date.now() + 600_000).toISOString() }, { attempt: 2, url, expires_at: '2020-01-01T00:00:00Z' }],
    } }] }] }} busy={false} request={vi.fn()} />);
    fireEvent.click(screen.getByText('Resultat och underlag (1)'));
    expect(screen.getByText('Kontaktlänken saknades')).toBeInTheDocument();
    expect(screen.getByText('Försök 2: Godkänt')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privat skärmbild · försök 1' })).toHaveAttribute('href', url);
    expect(screen.getByText(/Bildlänken har gått ut/)).toBeInTheDocument();
  });
});

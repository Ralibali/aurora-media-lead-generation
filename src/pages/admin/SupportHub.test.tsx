import type { ReactNode } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminFetch } from '@/lib/adminClient';
import type { SupportCase, SupportListResponse } from '@/lib/supportHub';
import SupportHub from './SupportHub';

vi.mock('@/lib/adminClient', () => ({ adminFetch: vi.fn() }));
vi.mock('./AdminShell', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('./SupportMailbox', () => ({ default: ({ onSynced }: { onSynced: () => void }) => <button onClick={onSynced}>Simulera slutförd mejlhämtning</button> }));
const fetchMock = vi.mocked(adminFetch);
const item = (patch: Partial<SupportCase> = {}): SupportCase => ({
  id: 'case-1', source_id: 'source-1', project_id: 'project-1', source_key: 'support', source_label: 'Kundsupport', source_record_id: 'original-1', source_revision: 'rev-1',
  kind: 'support', title: 'Kan inte öppna bokningen', body: 'Bokningssidan fastnar efter inloggning.', requester_name: 'Exempelkund', requester_email: 'kund@example.test', requester_ref: null,
  source_status: 'open', source_priority: 'medium', source_reply: null, source_created_at: '2026-10-04T10:00:00Z', source_updated_at: null, source_deleted_at: null,
  owner_status: 'new', owner_priority: 'normal', assigned_to: null, followup_at: null, private_notes: '', reply_draft: '', version: 2, received_at: '2026-10-05T10:00:00Z', updated_at: '2026-10-05T10:00:00Z', ...patch,
});
const response = (items = [item()]): SupportListResponse => ({
  cases: items, next_cursor: null,
  sources: [{ id: 'source-1', project_id: 'project-1', source_key: 'support', label: 'Kundsupport', active: true, connection_state: 'connected', sync_received_at: '2026-10-05T10:00:00Z', last_error: null, original_url: 'https://example.test/admin' }, { id: 'source-2', project_id: 'project-2', source_key: 'feedback', label: 'Produktfeedback', active: true, connection_state: 'pending', sync_received_at: null, last_error: null, original_url: null }],
  projects: [{ id: 'project-1', name: 'Aurora Exempel', url: 'https://example.test', kind: 'Produkt', stage: 'live' }, { id: 'project-2', name: 'Andra projektet', url: null, kind: 'Produkt', stage: 'live' }],
  counts: { scope: 'all_matching_filters', total: items.length, new: items.length, in_progress: 0, waiting: 0, resolved: 0, overdue: 0 }, project_counts: {}, generated_at: '2026-10-05T10:00:00Z',
});
const show = (url = '/admin/arenden') => render(<MemoryRouter initialEntries={[url]}><SupportHub /></MemoryRouter>);
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('central support workspace', () => {
  it('keeps missing source coverage visible when no cases have been imported', async () => {
    fetchMock.mockResolvedValue(response([])); show();
    expect(await screen.findByText('Inga inlästa ärenden i urvalet')).toBeInTheDocument();
    expect(screen.getByText('1 av 2 källor anslutna')).toBeInTheDocument();
    fireEvent.click(screen.getByText('1 av 2 källor anslutna'));
    expect(screen.getByText('Väntar på anslutning')).toBeInTheDocument();
    expect(screen.getByText(/En tom lista betyder inte att ett projekt/)).toBeInTheDocument();
  });

  it('sends project, type, status and search to the server instead of filtering one loaded page', async () => {
    fetchMock.mockResolvedValue(response()); show('/admin/arenden?project=project-1&kind=feedback&status=waiting');
    await screen.findByText('Kan inte öppna bokningen');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({ action: 'list', project_id: 'project-1', kind: 'feedback', owner_status: 'waiting', limit: 30 });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'bokningen' } });
    fireEvent.click(screen.getByRole('button', { name: /^Sök$/ }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => JSON.parse(String(init?.body)).query === 'bokningen')).toBe(true));
  });

  it('saves private handling with the original version and leaves source content untouched', async () => {
    let current = item();
    let finishSave!: () => void;
    const saving = new Promise<void>(resolve => { finishSave = resolve; });
    fetchMock.mockImplementation(async (_path, init) => {
      const body = JSON.parse(String(init?.body));
      if (body.action === 'detail') return { case: current };
      if (body.action === 'update') { await saving; current = { ...current, ...body.patch, version: current.version + 1 }; return { case: current }; }
      return response([current]);
    });
    show('/admin/arenden?case=case-1');
    const note = await screen.findByLabelText('Privat notering');
    fireEvent.change(note, { target: { value: 'Kontrollera bokningslänken i morgon.' } });
    fireEvent.change(screen.getByLabelText('Arbetsstatus'), { target: { value: 'in_progress' } });
    fireEvent.change(screen.getByLabelText('Ansvarig'), { target: { value: 'Christoffer' } });
    fireEvent.change(screen.getByLabelText('Svarsutkast'), { target: { value: 'Vi undersöker din bokning.' } });
    expect(screen.getByRole('button', { name: /^Uppdatera$/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Spara handläggning' }));
    expect(screen.getByLabelText('Privat notering')).toBeDisabled();
    expect(screen.getByLabelText('Arbetsstatus')).toBeDisabled();
    await act(async () => finishSave());
    expect(await screen.findByText('Handläggningen är sparad. Inget meddelande har skickats.')).toBeInTheDocument();
    const update = fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body))).find(body => body.action === 'update');
    expect(update).toMatchObject({ id: 'case-1', expected_version: 2, patch: { owner_status: 'in_progress', assigned_to: 'Christoffer', private_notes: 'Kontrollera bokningslänken i morgon.', reply_draft: 'Vi undersöker din bokning.' } });
    expect(update.patch).not.toHaveProperty('body');
    expect(update.patch).not.toHaveProperty('source_status');
    expect(fetchMock.mock.calls.every(([path]) => path === 'admin-support')).toBe(true);
  });

  it('preserves unsaved notes after a version conflict and never claims a successful save', async () => {
    fetchMock.mockImplementation(async (_path, init) => {
      const body = JSON.parse(String(init?.body));
      if (body.action === 'detail') return { case: item() };
      if (body.action === 'update') throw Object.assign(new Error('conflict'), { status: 409 });
      return response();
    });
    show('/admin/arenden?case=case-1');
    fireEvent.change(await screen.findByLabelText('Privat notering'), { target: { value: 'Behåll den här anteckningen.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spara handläggning' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ärendet har ändrats sedan du öppnade det');
    expect(screen.getByLabelText('Privat notering')).toHaveValue('Behåll den här anteckningen.');
    expect(screen.queryByText('Handläggningen är sparad. Inget meddelande har skickats.')).not.toBeInTheDocument();
  });

  it('preserves a dirty case editor when mailbox import finishes', async () => {
    fetchMock.mockImplementation(async (_path, init) => JSON.parse(String(init?.body)).action === 'detail' ? { case: item() } : response());
    show('/admin/arenden?case=case-1');
    fireEvent.change(await screen.findByLabelText('Privat notering'), { target: { value: 'Det här är fortfarande ett osparat utkast.' } });
    fireEvent.click(screen.getByText('Mejlanslutning · info@auroramedia.se'));
    fireEvent.click(screen.getByRole('button', { name: 'Simulera slutförd mejlhämtning' }));
    expect(screen.getByLabelText('Privat notering')).toHaveValue('Det här är fortfarande ett osparat utkast.');
    expect(screen.getByText('Mejlen är hämtade. Spara handläggningen och uppdatera listan för att visa de nya ärendena.')).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([, init]) => JSON.parse(String(init?.body)).action === 'detail')).toHaveLength(1);
  });

  it('lets an email be assigned to an existing project and treats message HTML as text', async () => {
    const email = item({ kind: 'email', body: '<img src=x onerror=alert(1)>', title: 'Fråga till info' });
    fetchMock.mockImplementation(async (_path, init) => {
      const body = JSON.parse(String(init?.body));
      if (body.action === 'detail') return { case: email };
      if (body.action === 'update') return { case: { ...email, ...body.patch, version: 3 } };
      const result = response([email]); result.sources[0].original_url = 'javascript:alert(1)'; return result;
    });
    show('/admin/arenden?case=case-1');
    const project = await screen.findByLabelText('Tillhör projekt');
    await waitFor(() => expect(within(project).getAllByRole('option')).toHaveLength(2));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Öppna originalsystem/ })).not.toBeInTheDocument();
    fireEvent.change(project, { target: { value: 'project-2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Spara handläggning' }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => { const body = JSON.parse(String(init?.body)); return body.action === 'update' && body.patch.project_id === 'project-2'; })).toBe(true));
  });

  it('loads the next server page without duplicating existing cases', async () => {
    fetchMock.mockImplementation(async (_path, init) => {
      const body = JSON.parse(String(init?.body));
      if (body.cursor) return response([item(), item({ id: 'case-2', title: 'Feedback om nya menyn' })]);
      return { ...response(), next_cursor: { id: 'case-1', updated_at: '2026-10-05T10:00:00Z' } };
    });
    show(); fireEvent.click(await screen.findByRole('button', { name: 'Visa fler ärenden' }));
    expect(await screen.findByText('Feedback om nya menyn')).toBeInTheDocument();
    expect(screen.getAllByText('Kan inte öppna bokningen')).toHaveLength(1);
  });
});

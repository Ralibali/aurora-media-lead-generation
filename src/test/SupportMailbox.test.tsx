import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SupportMailbox from '@/pages/admin/SupportMailbox';
import { adminFetch } from '@/lib/adminClient';
vi.mock('@/lib/adminClient', () => ({ adminFetch: vi.fn() }));
const state = { address: 'info@auroramedia.se', configured: false, enabled: false, syncing: false, last_attempt_at: null, last_success_at: null, last_error: null, last_imported_count: 0, more_pending: false };
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('AbortSignal', { timeout: () => new AbortController().signal }); vi.mocked(adminFetch).mockResolvedValue({ mailbox: state }); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('Private mailbox connection', () => {
  it('uses a masked, empty field and clears the submitted password without browser persistence', async () => {
    const storage = vi.spyOn(Storage.prototype, 'setItem');
    render(<SupportMailbox />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Anslut mejlen' })).toBeDisabled());
    const input = screen.getByLabelText('Lösenord för info@auroramedia.se');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.change(input, { target: { value: 'fixture-only-password' } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Anslut mejlen' })).toBeEnabled());
    vi.mocked(adminFetch).mockResolvedValueOnce({ mailbox: { ...state, configured: true, enabled: true } });
    fireEvent.click(screen.getByRole('button', { name: 'Anslut mejlen' }));
    await waitFor(() => expect(adminFetch).toHaveBeenCalledWith('admin-support-mailbox', expect.objectContaining({ body: JSON.stringify({ action: 'configure', password: 'fixture-only-password' }) })));
    expect(input).toHaveValue('');
    expect(storage).not.toHaveBeenCalled(); storage.mockRestore();
    expect(screen.queryByText('fixture-only-password')).not.toBeInTheDocument();
  });
  it('refreshes cases only after a confirmed sync and shows pending batches', async () => {
    vi.mocked(adminFetch).mockResolvedValueOnce({ mailbox: { ...state, configured: true, enabled: true } });
    const synced = vi.fn(); render(<SupportMailbox onSynced={synced} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Hämta mejl nu' })).toBeEnabled());
    vi.mocked(adminFetch).mockResolvedValueOnce({ mailbox: { ...state, configured: true, enabled: true, more_pending: true }, imported: 20, message: '20 nya mejl har hämtats.' });
    fireEvent.click(screen.getByRole('button', { name: 'Hämta mejl nu' }));
    await waitFor(() => expect(synced).toHaveBeenCalledOnce());
    expect(screen.getByText(/Fler mejl väntar/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('20 nya mejl har hämtats.');
  });
  it('preserves a paused state and does not imply an unconfigured mailbox has been imported', async () => {
    render(<SupportMailbox />);
    expect(await screen.findByText('Inte ansluten')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hämta mejl nu' })).toBeDisabled();
    expect(screen.getByText(/högst de senaste 100 mejlen/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Öppna webbmejlen' })).toHaveAttribute('href', 'https://app.titan.email/');
  });
});

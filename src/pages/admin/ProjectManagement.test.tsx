import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PortfolioProject } from '@/lib/portfolioDashboard';
import ProjectManagement, { ProjectLinks } from './ProjectManagement';

const project: PortfolioProject = { id: 'project-1', name: 'Exempel', kind: 'Produkt', stage: 'live', url: 'https://example.test', management: { note: 'Befintlig notering', nextAction: 'Nästa steg', followupDate: null, version: 3 } };
afterEach(cleanup);
describe('private project management', () => {
  it('keeps a dirty draft and its original version when a background refresh brings a newer plan', async () => {
    let finishSave!: () => void;
    const saving = new Promise<void>(resolve => { finishSave = resolve; });
    const onSave = vi.fn().mockImplementation(async () => { await saving; throw Object.assign(new Error('conflict'), { status: 409 }); });
    const { rerender } = render(<ProjectManagement project={project} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText('Privat projektnotering'), { target: { value: 'Min nya notering' } });
    rerender(<ProjectManagement project={{ ...project, management: { ...project.management!, note: 'En annan ändring', version: 4 } }} onSave={onSave} />);
    expect(screen.getByLabelText('Privat projektnotering')).toHaveValue('Min nya notering');
    fireEvent.click(screen.getByRole('button', { name: 'Spara projektplan' }));
    expect(screen.getByLabelText('Privat projektnotering')).toBeDisabled();
    expect(screen.getByLabelText('Nästa åtgärd')).toBeDisabled();
    await act(async () => finishSave());
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('project-1', 3, expect.objectContaining({ note: 'Min nya notering' })));
    expect(await screen.findByRole('alert')).toHaveTextContent('Projektet har ändrats i en annan vy');
    expect(screen.getByLabelText('Privat projektnotering')).toHaveValue('Min nya notering');
    expect(screen.getByLabelText('Privat projektnotering')).not.toBeDisabled();
  });
  it('only exposes safe registry links and never invents a zero case count', () => {
    render(<ProjectLinks project={{ ...project, github: { fullName: 'Owner/Repo', url: 'https://github.com/Owner/Repo', isPrivate: true }, adminUrl: 'javascript:alert(1)', hostingUrl: 'https://user:secret@example.test/' }} />);
    expect(screen.getByRole('link', { name: 'GitHub · privat ↗' })).toHaveAttribute('href', 'https://github.com/Owner/Repo');
    expect(screen.getByRole('link', { name: 'Ärenden →' })).toHaveAttribute('href', '/admin/arenden?project=project-1');
    expect(screen.queryByText(/0 öppna/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Projektets admin/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Drift/ })).not.toBeInTheDocument();
  });
});

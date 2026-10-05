import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import type { PortfolioProject } from '@/lib/portfolioDashboard';
import { safeExternalUrl, timeLabel } from '@/lib/portfolioPresentation';
import '@/styles/support-hub.css';

export type ProjectManagementValue = { note: string; nextAction: string; followupDate: string | null; version: number };
export type ManageProject = (id: string, expectedVersion: number, value: Omit<ProjectManagementValue, 'version'>) => Promise<ProjectManagementValue>;
const blank = { note: '', nextAction: '', followupDate: null, version: 0 };

export function ProjectLinks({ project, supportCount }: { project: PortfolioProject; supportCount?: number }) {
  const github = project.github && safeExternalUrl(project.github.url);
  const githubUrl = github && new URL(github).hostname === 'github.com' ? github : null;
  const admin = safeExternalUrl(project.adminUrl);
  const hosting = safeExternalUrl(project.hostingUrl);
  return <>
    {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer">GitHub{project.github?.isPrivate ? ' · privat' : ''} ↗</a>}
    {admin && <a href={admin} target="_blank" rel="noopener noreferrer">Projektets admin ↗</a>}
    {hosting && <a href={hosting} target="_blank" rel="noopener noreferrer">Drift / hosting ↗</a>}
    <a href={`/admin/arenden?project=${encodeURIComponent(project.id)}`}>Ärenden{supportCount === undefined ? '' : ` · ${supportCount} öppna inlästa`} →</a>
  </>;
}

export default function ProjectManagement({ project, onSave }: { project: PortfolioProject; onSave: ManageProject }) {
  const [value, setValue] = useState<ProjectManagementValue>(project.management ?? blank);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (!dirty) setValue(project.management ?? blank); }, [project.management, dirty]);
  const change = (patch: Partial<ProjectManagementValue>) => { setValue(current => ({ ...current, ...patch })); setDirty(true); setMessage(''); };
  return <form className="pf-management" onSubmit={async event => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const saved = await onSave(project.id, value.version, { note: value.note, nextAction: value.nextAction, followupDate: value.followupDate });
      setValue(saved); setDirty(false); setMessage('Projektets plan är sparad.');
    } catch (cause) {
      const conflict = !!cause && typeof cause === 'object' && 'status' in cause && cause.status === 409;
      setError(conflict ? 'Projektet har ändrats i en annan vy. Din text finns kvar. Öppna projektet på nytt för att jämföra med senaste versionen.' : cause instanceof Error ? cause.message : 'Planen kunde inte sparas. Din text finns kvar.');
    } finally { setSaving(false); }
  }}>
    <div className="pf-section-heading"><div><h3>Projektets nästa steg</h3><p>Privat arbetsplan för Aurora Media.</p></div>{project.inventoryCheckedAt && <small className="pf-muted">Projektuppgifter kontrollerade {timeLabel(project.inventoryCheckedAt)}</small>}</div>
    <div className="pf-management-grid">
      <label>Nästa åtgärd<input disabled={saving} value={value.nextAction} maxLength={500} placeholder="Vad behöver göras härnäst?" onChange={event => change({ nextAction: event.target.value })} /></label>
      <label>Följ upp<input disabled={saving} type="date" value={value.followupDate ?? ''} onChange={event => change({ followupDate: event.target.value || null })} /></label>
    </div>
    <label>Privat projektnotering<textarea disabled={saving} value={value.note} rows={3} maxLength={2000} placeholder="Beslut, sammanhang och sådant du vill komma ihåg." onChange={event => change({ note: event.target.value })} /></label>
    {error && <p role="alert" className="pf-text-danger">{error}</p>}
    {message && <p role="status" className="pf-text-good">{message}</p>}
    <button className="pf-button pf-button-primary" disabled={saving || !dirty}><Save size={15} />{saving ? 'Sparar…' : 'Spara projektplan'}</button>
  </form>;
}

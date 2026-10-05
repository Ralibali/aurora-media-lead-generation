import { useEffect, useState } from 'react';
import { adminFetch } from './adminClient';
import type { SupportCase, SupportListResponse, SupportPriority, SupportSource, SupportStatus } from '../../supabase/functions/_shared/support-types';
export type { SupportCase, SupportCursor, SupportFilters, SupportListResponse, SupportPatch, SupportSource } from '../../supabase/functions/_shared/support-types';

export const supportStatusLabels: Record<SupportStatus, string> = { new: 'Nytt', in_progress: 'Pågår', waiting: 'Väntar', resolved: 'Klart' };
export const supportPriorityLabels: Record<SupportPriority, string> = { low: 'Låg', normal: 'Normal', high: 'Hög', urgent: 'Brådskande' };
export const supportKindLabels = { support: 'Support', feedback: 'Feedback', email: 'E-post' };
export const sourceStateLabels: Record<SupportSource['connection_state'], string> = { pending: 'Väntar på anslutning', connected: 'Ansluten', error: 'Behöver åtgärdas', paused: 'Pausad' };
export const supportDate = (value: string | null | undefined): string => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString('sv-SE', { dateStyle: 'medium', timeStyle: 'short' }) : 'Inte registrerat';
export const supportOverdue = (item: SupportCase, now = Date.now()) => item.owner_status !== 'resolved' && !!item.followup_at && Date.parse(item.followup_at) < now;
export function localDateTime(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
export function isSupportResponse(value: SupportListResponse): boolean {
  return !!value && Array.isArray(value.cases) && Array.isArray(value.sources) && Array.isArray(value.projects) && !!value.counts && value.counts.scope === 'all_matching_filters';
}
export function useSupportOverview(enabled = true) {
  const [data, setData] = useState<SupportListResponse | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    adminFetch('admin-support', { method: 'POST', body: JSON.stringify({ action: 'list', limit: 1 }), signal: controller.signal })
      .then((response: SupportListResponse) => { if (!isSupportResponse(response)) throw new Error('Ärenden gav ett oväntat svar.'); if (!controller.signal.aborted) setData(response); })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Ärenden kunde inte hämtas.'); });
    return () => controller.abort();
  }, [enabled]);
  return { data, error };
}

import type { PortfolioProject } from './portfolio-types.ts';

export type SupportKind = 'support' | 'feedback' | 'email';
export type SupportStatus = 'new' | 'in_progress' | 'waiting' | 'resolved';
export type SupportPriority = 'low' | 'normal' | 'high' | 'urgent';
export type SupportCursor = { updated_at: string; id: string };
export type SupportSource = {
  id: string; project_id: string; source_key: string; label: string; active: boolean;
  connection_state: 'pending' | 'connected' | 'error' | 'paused';
  sync_received_at: string | null; last_error: string | null; original_url: string | null;
};
export type SupportCase = {
  id: string; source_id: string; project_id: string; source_key: string; source_label: string;
  source_record_id: string; source_revision: string; kind: SupportKind; title: string; body: string;
  requester_name: string | null; requester_email: string | null; requester_ref: string | null;
  source_status: string | null; source_priority: string | null; source_reply: string | null;
  source_created_at: string; source_updated_at: string | null; source_deleted_at: string | null;
  owner_status: SupportStatus; owner_priority: SupportPriority; assigned_to: string | null;
  followup_at: string | null; private_notes: string; reply_draft: string; version: number;
  received_at: string; updated_at: string;
};
export type SupportPatch = Partial<Pick<SupportCase, 'project_id' | 'owner_status' | 'owner_priority' | 'assigned_to' | 'followup_at' | 'private_notes' | 'reply_draft'>>;
export type SupportFilters = {
  project_id?: string; source_id?: string; owner_status?: SupportStatus; kind?: SupportKind;
  query?: string; cursor?: SupportCursor; limit?: number;
};
export type SupportListResponse = {
  cases: SupportCase[]; next_cursor: SupportCursor | null; sources: SupportSource[]; projects: PortfolioProject[];
  counts: { scope: 'all_matching_filters'; total: number; new: number; in_progress: number; waiting: number; resolved: number; overdue: number };
  project_counts: Record<string, { open: number; total: number }>;
  generated_at: string;
};
export type SupportRecord = {
  kind: SupportKind; title: string; body: string; requester_name?: string | null;
  requester_email?: string | null; requester_ref?: string | null; source_status?: string | null;
  source_priority?: string | null; source_reply?: string | null; created_at: string; updated_at?: string | null;
};
export type SupportIngestEvent = { event_id: string; record_id: string; revision: string; event_type: 'upsert' | 'deleted'; record?: SupportRecord };
export type SupportHeartbeat = { pending_count?: number; failed_count?: number; last_error?: string | null };
export type SupportIngestBody = { events: SupportIngestEvent[]; heartbeat?: SupportHeartbeat };
export type SupportIngestResponse = {
  ok: true; source_id: string; received_at: string;
  acknowledged: { event_id: string; record_id: string; revision: string; outcome: 'created' | 'updated' | 'duplicate' | 'stale' }[];
};

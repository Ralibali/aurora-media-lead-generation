import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.104.0';
import { flowId, flowName, flowInterval, validateFlowSteps, validateFlowResult, validateScreenshots, FlowValidationError, type FlowStep } from './flows.ts';
import { equalSecret } from './auth.ts';

const bucket = 'aurora-watch-evidence';
export const flowActions = ['create_flow','update_flow','toggle_flow','queue_flow','claim_due','complete_flow'];
type ClaimedJob = { run_id: string; lease_token: string; lease_expires_at: string; flow_id: string; name: string; site_id: string; site_url: string; steps: FlowStep[] };

export class FlowConflictError extends Error {}

async function expireEvidence(db: SupabaseClient) {
  // Each run has at most these two deterministic object names. Deriving them from
  // every old reservation also collects uploads orphaned by a lost/expired result.
  const { data: runs, error } = await db.from('guardian_flow_runs').select('id,details')
    .lt('created_at', new Date(Date.now() - 7 * 86400_000).toISOString())
    .is('details->>evidence_purged_at', null).order('created_at').limit(50);
  if (error) throw error;
  for (const run of runs ?? []) {
    const { error } = await db.storage.from(bucket).remove([`${run.id}/1.jpg`,`${run.id}/2.jpg`]);
    if (error) throw error;
    const { screenshots: _screenshots, ...details } = run.details;
    const { error: writeError } = await db.from('guardian_flow_runs').update({ details: { ...details, evidence_purged_at: new Date().toISOString() } }).eq('id', run.id);
    if (writeError) throw writeError;
  }
  const { error: pruneError } = await db.from('guardian_flow_runs').delete()
    .lt('created_at', new Date(Date.now() - 90 * 86400_000).toISOString()).not('details->>evidence_purged_at','is',null);
  if (pruneError) throw pruneError;
}

async function edit(db: SupabaseClient, id: string, changes: Record<string, unknown>) {
  const { error } = await db.rpc('guardian_edit_flow', { p_id: id, p_changes: changes });
  if (error) {
    if (/GUARDIAN_FLOW_(BUSY|PAUSED|NOT_FOUND)/.test(error.message)) throw new FlowConflictError('Flödet är pausat, saknas eller håller redan på att köras. Uppdatera historiken.');
    throw error;
  }
}

export async function handleFlowAction(db: SupabaseClient, body: Record<string, unknown>, origins: string[]) {
  const action = body.action;
  if (action === 'create_flow' || action === 'update_flow') {
    const name = flowName(body.name);
    const interval = flowInterval(body.check_interval_minutes);
    let siteId: string;
    if (action === 'create_flow') siteId = flowId(body.site_id);
    else {
      const { data, error } = await db.from('guardian_flows').select('site_id').eq('id', flowId(body.id)).single();
      if (error || !data) throw new FlowValidationError('Flödet kunde inte hittas.');
      siteId = data.site_id;
    }
    const { data: site, error } = await db.from('guardian_sites').select('url').eq('id', siteId).single();
    if (error || !site) throw new FlowValidationError('Webbplatsen kunde inte hittas.');
    const steps = validateFlowSteps(body.steps, site.url, origins);
    if (action === 'create_flow') {
      const { error } = await db.from('guardian_flows').insert({ name, site_id: siteId, check_interval_minutes: interval, steps });
      if (error) throw error;
    } else await edit(db, flowId(body.id), { name, check_interval_minutes: interval, steps });
    return null;
  }
  if (action === 'toggle_flow') {
    if (typeof body.active !== 'boolean') throw new FlowValidationError('Ogiltigt läge.');
    await edit(db, flowId(body.id), { active: body.active });
    return null;
  }
  if (action === 'queue_flow') {
    await edit(db, flowId(body.id), { queue: true });
    return null;
  }
  if (action === 'claim_due') {
    const limit = body.limit ?? 1;
    if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 5) throw new FlowValidationError('Ogiltigt antal jobb.');
    try { await expireEvidence(db); } catch (error) { console.error('[aurora-watch] evidence cleanup failed', error); }
    const { data, error } = await db.rpc('guardian_claim_flows', { p_limit: limit, p_origins: origins });
    if (error) throw error;
    return { jobs: (data ?? []).map((job: ClaimedJob) => ({ ...job, allowed_origin: new URL(job.site_url).origin })) };
  }
  if (action === 'complete_flow') {
    const id = flowId(body.run_id);
    const lease = flowId(body.lease_token);
    const { data: run, error } = await db.from('guardian_flow_runs').select('id,flow_id,lease_token,lease_expires_at,status,steps_snapshot,details').eq('id', id).single();
    if (error || !run || !equalSecret(run.lease_token, lease)) throw new FlowConflictError('Körningen saknas eller reservationen är ogiltig.');
    // A delivery retry must not upload new files or rewrite a completed result.
    if (['passed','failed','flaky'].includes(run.status) || (run.status === 'inconclusive' && run.details?.reported === true)) return { ok: true, idempotent: true };
    if (run.status !== 'running' || Date.parse(run.lease_expires_at) <= Date.now()) throw new FlowConflictError('Reservationen har gått ut.');
    const result = validateFlowResult(body.result, run.steps_snapshot as FlowStep[]);
    const screenshots = validateScreenshots(body.screenshots, result.attempts);
    const refs: { attempt: number; path: string }[] = [];
    for (const screenshot of screenshots) {
      const path = `${id}/${screenshot.attempt}.jpg`;
      const { error } = await db.storage.from(bucket).upload(path, screenshot.bytes, { contentType: 'image/jpeg', upsert: false });
      // A transport retry may encounter an already uploaded immutable screenshot.
      if (error && String(error.statusCode) !== '409' && !/already exists|duplicate/i.test(error.message)) throw error;
      refs.push({ attempt: screenshot.attempt, path });
    }
    const { data, error: completeError } = await db.rpc('guardian_complete_flow', {
      p_run_id: id, p_lease_token: lease, p_result: { ...result, screenshots: refs },
    });
    if (completeError) {
      if (/GUARDIAN_(LEASE|RUN)/.test(completeError.message)) throw new FlowConflictError('Reservationen har gått ut eller är ogiltig.');
      throw completeError;
    }
    return data;
  }
  throw new FlowValidationError('Okänd flödesåtgärd.');
}

export async function listSiteFlows(db: SupabaseClient, siteId: string) {
  const { data: flows, error } = await db.from('guardian_flows').select('*').eq('site_id', siteId).order('created_at');
  if (error) throw error;
  return await Promise.all((flows ?? []).map(async flow => {
    const { data: runs, error } = await db.from('guardian_flow_runs')
      .select('id,flow_id,status,incident_state,attempts,duration_ms,details,created_at,completed_at,lease_expires_at')
      .eq('flow_id', flow.id).order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    return { ...flow, runs: await Promise.all((runs ?? []).map(async run => {
      // A stopped runner is inconclusive, never a stale green or an endless running state.
      if (run.status === 'running' && Date.parse(run.lease_expires_at) <= Date.now()) return {
        ...run, status: 'inconclusive', completed_at: run.lease_expires_at,
        details: { error: 'Köraren slutförde inte kontrollen inom tio minuter.' },
      };
      const refs = Date.parse(run.created_at) > Date.now() - 7 * 86400_000 && Array.isArray(run.details?.screenshots) ? run.details.screenshots : [];
      const screenshots = await Promise.all(refs.map(async (ref: { attempt: number; path: string }) => {
        // Stored paths are never returned and cannot be used to sign other objects.
        if (!/^[1-2]$/.test(String(ref.attempt)) || ref.path !== `${run.id}/${ref.attempt}.jpg`) return null;
        const { data, error } = await db.storage.from(bucket).createSignedUrl(ref.path, 600);
        return !error && data ? { attempt: ref.attempt, url: data.signedUrl, expires_at: new Date(Date.now() + 600_000).toISOString() } : null;
      }));
      return { ...run, details: { ...run.details, screenshots: screenshots.filter(Boolean) } };
    })) };
  }));
}

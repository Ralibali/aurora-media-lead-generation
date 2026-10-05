import type { SupportFilters, SupportHeartbeat, SupportIngestBody, SupportIngestEvent, SupportPatch, SupportRecord, SupportSource } from './support-types.ts';
export class SupportValidationError extends Error {}
const kinds = ['support','feedback','email'];
const statuses = ['new','in_progress','waiting','resolved'];
const priorities = ['low','normal','high','urgent'];
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SupportValidationError('Ogiltigt format.');
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some(key => !allowed.includes(key))) throw new SupportValidationError('Begäran innehåller otillåtna fält.');
}
function text(value: unknown, max: number, nullable = false): string | null {
  if (nullable && (value === null || value === undefined || value === '')) return null;
  if (typeof value !== 'string' || !value.trim() || value.length > max || value.includes('\0')) throw new SupportValidationError('Text saknas eller är för lång.');
  return value.trim();
}
export function supportId(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) throw new SupportValidationError('Ogiltigt ID.');
  return value;
}
function iso(value: unknown, nullable = false): string | null {
  if (nullable && (value === null || value === undefined || value === '')) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\d(?:T.*)?$/.test(value) || value.length > 40 || !Number.isFinite(Date.parse(value))) throw new SupportValidationError('Ogiltigt datum.');
  const result = new Date(value).toISOString();
  if (result < '1970-' || result > '2200-') throw new SupportValidationError('Datumet är utanför tillåtet intervall.');
  return result;
}
export function validateFilters(value: Record<string, unknown>): SupportFilters {
  keys(value,['action','project_id','source_id','owner_status','kind','query','cursor','limit']);
  const result: SupportFilters = { limit: 30 };
  if (value.project_id !== undefined) result.project_id = text(value.project_id,200)!;
  if (value.source_id !== undefined) result.source_id = supportId(value.source_id);
  if (value.owner_status !== undefined) {
    if (!statuses.includes(String(value.owner_status))) throw new SupportValidationError('Ogiltig arbetsstatus.');
    result.owner_status = value.owner_status as SupportFilters['owner_status'];
  }
  if (value.kind !== undefined) {
    if (!kinds.includes(String(value.kind))) throw new SupportValidationError('Ogiltig ärendetyp.');
    result.kind = value.kind as SupportFilters['kind'];
  }
  if (value.query !== undefined && value.query !== '') result.query = text(value.query,200)!;
  if (value.limit !== undefined) {
    if (typeof value.limit !== 'number' || !Number.isInteger(value.limit) || value.limit < 1 || value.limit > 50) throw new SupportValidationError('Ogiltig sidstorlek.');
    result.limit = value.limit;
  }
  if (value.cursor !== undefined && value.cursor !== null) {
    const cursor=object(value.cursor); keys(cursor,['updated_at','id']);
    result.cursor={updated_at:iso(cursor.updated_at)!,id:supportId(cursor.id)};
  }
  return result;
}
export function validateUpdate(value: Record<string, unknown>): { id: string; expected_version: number; patch: SupportPatch } {
  keys(value,['action','id','expected_version','patch']);
  const id=supportId(value.id);
  if (typeof value.expected_version !== 'number' || !Number.isSafeInteger(value.expected_version) || value.expected_version < 1) throw new SupportValidationError('Uppdatera ärendet innan du sparar.');
  const raw=object(value.patch);
  keys(raw,['project_id','owner_status','owner_priority','assigned_to','followup_at','private_notes','reply_draft']);
  if (!Object.keys(raw).length) throw new SupportValidationError('Ingen ändring angiven.');
  const patch: SupportPatch={};
  if (raw.project_id !== undefined) patch.project_id=text(raw.project_id,200)!;
  if (raw.owner_status !== undefined) {
    if (!statuses.includes(String(raw.owner_status))) throw new SupportValidationError('Ogiltig arbetsstatus.');
    patch.owner_status=raw.owner_status as SupportPatch['owner_status'];
  }
  if (raw.owner_priority !== undefined) {
    if (!priorities.includes(String(raw.owner_priority))) throw new SupportValidationError('Ogiltig prioritet.');
    patch.owner_priority=raw.owner_priority as SupportPatch['owner_priority'];
  }
  if (raw.assigned_to !== undefined) patch.assigned_to=text(raw.assigned_to,120,true);
  if (raw.followup_at !== undefined) patch.followup_at=iso(raw.followup_at,true);
  for (const key of ['private_notes','reply_draft'] as const) {
    if (raw[key] !== undefined) patch[key]=text(raw[key],20000,true) ?? '';
  }
  return {id,expected_version:value.expected_version,patch};
}
export function validateIngest(value: unknown): SupportIngestBody {
  const raw=object(value); keys(raw,['events','heartbeat']);
  if (!Array.isArray(raw.events) || raw.events.length > 50) throw new SupportValidationError('Skicka högst 50 händelser.');
  const seen=new Set<string>();
  const events: SupportIngestEvent[]=raw.events.map(value=>{
    const event=object(value); keys(event,['event_id','record_id','revision','event_type','record']);
    const eventId=supportId(event.event_id);
    if (seen.has(eventId)) throw new SupportValidationError('Händelse-ID måste vara unikt inom leveransen.');
    seen.add(eventId);
    if (typeof event.revision !== 'string' || !/^[1-9]\d{0,18}$/.test(event.revision) || BigInt(event.revision)>9223372036854775807n) throw new SupportValidationError('Ogiltig källversion.');
    if (event.event_type !== 'upsert' && event.event_type !== 'deleted') throw new SupportValidationError('Ogiltig händelse.');
    const result: SupportIngestEvent={event_id:eventId,record_id:text(event.record_id,200)!,revision:event.revision,event_type:event.event_type};
    if (event.event_type==='deleted') {
      if (event.record !== undefined) throw new SupportValidationError('Raderingshändelser får inte innehålla personuppgifter.');
      return result;
    }
    const record=object(event.record);
    keys(record,['kind','title','body','requester_name','requester_email','requester_ref','source_status','source_priority','source_reply','created_at','updated_at']);
    if (!kinds.includes(String(record.kind))) throw new SupportValidationError('Ogiltig ärendetyp.');
    if(typeof record.body!=='string'||record.body.length>20000||record.body.includes('\0'))throw new SupportValidationError('Ogiltig meddelandetext.');
    const parsed: SupportRecord={kind:record.kind as SupportRecord['kind'],title:text(record.title,200)!,body:record.body,created_at:iso(record.created_at)!};
    for (const [key,max] of [['requester_name',160],['requester_email',320],['requester_ref',200],['source_status',100],['source_priority',100],['source_reply',20000]] as const) parsed[key]=text(record[key],max,true);
    if (parsed.requester_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.requester_email)) throw new SupportValidationError('Ogiltig e-postadress.');
    parsed.updated_at=iso(record.updated_at,true); result.record=parsed;
    return result;
  });
  let heartbeat: SupportHeartbeat | undefined;
  if (raw.heartbeat !== undefined) {
    const value=object(raw.heartbeat); keys(value,['pending_count','failed_count','last_error']); heartbeat={};
    for (const key of ['pending_count','failed_count'] as const) {
      if (value[key]!==undefined) {
        if(typeof value[key]!=='number'||!Number.isSafeInteger(value[key])||Number(value[key])<0||Number(value[key])>1000000) throw new SupportValidationError('Ogiltig synkstatus.');
        heartbeat[key]=value[key] as number;
      }
    }
    heartbeat.last_error=text(value.last_error,500,true);
  }
  return {events,...(heartbeat?{heartbeat}:{})};
}
export function sourceTokenParts(value: string): { id: string; token: string } | null {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.[a-f0-9]{64}$/.test(value)) return null;
  return {id:value.slice(0,36),token:value};
}
export async function sha256(value: string): Promise<string> {
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
}
export function presentSupportSource(source: SupportSource, now=Date.now()): SupportSource {
  if(!source.active)return {...source,connection_state:'paused'};
  if(source.sync_received_at&&(!Number.isFinite(Date.parse(source.sync_received_at))||now-Date.parse(source.sync_received_at)>30*60_000)) {
    return {...source,connection_state:'error',last_error:'Ingen uppdatering har tagits emot på över 30 minuter. Kontrollera anslutningen.'};
  }
  return source;
}

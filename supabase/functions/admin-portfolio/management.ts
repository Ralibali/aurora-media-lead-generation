export type ManagementInput = { note: string; nextAction: string; followupDate: string | null };

export function managementInput(value: unknown, version: unknown): { management: ManagementInput; version: number } {
  if (!Number.isSafeInteger(version) || (version as number) < 0) throw new Error('Ogiltig version. Ladda om projektet.');
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Projektplanen saknas.');
  const data = value as Record<string, unknown>;
  if (Object.keys(data).some(key => !['note', 'nextAction', 'followupDate'].includes(key))) throw new Error('Okänt fält i projektplanen.');
  if (typeof data.note !== 'string' || data.note.length > 2000 || typeof data.nextAction !== 'string' || data.nextAction.length > 500) throw new Error('Anteckningen eller nästa steg är för långt.');
  const date = data.followupDate;
  if (date !== null && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date)) throw new Error('Välj ett giltigt uppföljningsdatum.');
  return { management: { note: data.note.trim(), nextAction: data.nextAction.trim(), followupDate: date as string | null }, version: version as number };
}

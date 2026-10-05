import type { SupportIngestEvent } from '../_shared/support-types.ts';

export const MAILBOX = { address: 'info@auroramedia.se', host: 'imap.titan.email', port: 993, folder: 'INBOX' } as const;
export const INITIAL_MESSAGES = 100;
export const BATCH_MESSAGES = 20;
export const BODY_BYTES = 64 * 1024;
export const UID_WINDOW = 500;
export type MailboxCursor = { uid_validity: string | null; last_uid: number; initial_since: string | null; initial_through_uid: number | null };
export type MessagePart = {
  part?: string; type?: string; disposition?: string; size?: number;
  parameters?: Record<string, string>; dispositionParameters?: Record<string, string>;
  childNodes?: MessagePart[];
};
export type MailMetadata = { uid: number; internalDate?: Date | string; envelope?: {
  subject?: string; date?: Date | string; from?: { name?: string; address?: string }[]; messageId?: string;
}; bodyStructure?: MessagePart };

export function cleanText(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.split('\0').join('').replace(/\r\n/g, '\n').slice(0, limit) : '';
}

/** Only inline text bodies are fetched. Attached text files and forwarded emails stay metadata. */
export function messageParts(root?: MessagePart) {
  const attachments: { name: string; type: string; size: number }[] = [];
  let plain: string | null = null, html: string | null = null;
  let inspected = 0;
  const visit = (node: MessagePart, depth = 0) => {
    if (++inspected > 100 || depth > 20) return;
    const type = (node.type ?? '').toLowerCase();
    const name = node.dispositionParameters?.filename ?? node.parameters?.name;
    if (node.disposition?.toLowerCase() === 'attachment' || name || (!type.startsWith('text/') && !type.startsWith('multipart/'))) {
      if (attachments.length < 20) attachments.push({ name: cleanText(name || 'Namnlös bilaga', 160), type: cleanText(type, 80), size: Math.max(0, node.size ?? 0) });
      return;
    }
    if (type === 'text/plain' && !plain) plain = node.part || '1';
    if (type === 'text/html' && !html) html = node.part || '1';
    for (const child of node.childNodes ?? []) visit(child, depth + 1);
  };
  if (root) visit(root);
  return { textPart: plain ?? html, isHtml: !plain && !!html, attachments };
}

export function initialCandidates(messages: MailMetadata[], now: Date): MailMetadata[] {
  const since = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  return messages.filter(message => new Date(message.internalDate ?? 0).getTime() >= since)
    .sort((a, b) => a.uid - b.uid).slice(-INITIAL_MESSAGES);
}

export function uidWindow(cursor: number, uidNext: number) {
  const last = Math.max(0, uidNext - 1);
  if (cursor >= last) return null;
  return { start: cursor + 1, end: Math.min(last, cursor + UID_WINDOW) };
}

export function mailEvent(message: MailMetadata, uidValidity: string, text: string, now: Date, truncated: boolean): SupportIngestEvent {
  if (!/^\d{1,10}$/.test(uidValidity) || !Number.isInteger(message.uid) || message.uid < 1 || message.uid > 4294967295) throw new Error('invalid_mailbox_identity');
  const parts = messageParts(message.bodyStructure);
  const sender = message.envelope?.from?.[0];
  const address = cleanText(sender?.address, 320);
  const internal = new Date(message.internalDate ?? now);
  const stamp = Number.isFinite(internal.getTime()) && internal.getUTCFullYear() >= 1970 && internal.getUTCFullYear() < 2200 ? internal : now;
  const notes = parts.attachments.map(part => `• ${part.name} (${part.type || 'fil'}, ${Math.ceil(part.size / 1024)} kB)`);
  const suffix = [truncated ? '[Meddelandet är förkortat. Hela mejlet finns i webbmejlen.]' : '', notes.length ? `Bilagor – endast information:\n${notes.join('\n')}` : ''].filter(Boolean).join('\n\n');
  const body = cleanText(text.trim() || 'Mejlet har ingen läsbar meddelandetext. Öppna originalet i webbmejlen.', 17_000);
  return {
    event_id: crypto.randomUUID(), record_id: `imap:${uidValidity}:${message.uid}`, revision: '1', event_type: 'upsert',
    record: {
      kind: 'email', title: cleanText(message.envelope?.subject, 200).trim() || '(Utan ämne)',
      body: cleanText([body, suffix].filter(Boolean).join('\n\n'), 20_000),
      requester_name: cleanText(sender?.name, 160) || null,
      requester_email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? address : null,
      requester_ref: cleanText(message.envelope?.messageId, 200) || null,
      source_status: 'Mottaget via e-post', created_at: stamp.toISOString(), updated_at: null,
    },
  };
}

export function safeMailboxError(error: unknown): 'auth' | 'timeout' | 'connection' {
  if (error && typeof error === 'object' && 'authenticationFailed' in error && error.authenticationFailed === true) return 'auth';
  if (error && typeof error === 'object' && 'code' in error && ['ETIMEDOUT', 'ETIMEOUT', 'MAILBOX_TIMEOUT'].includes(String(error.code))) return 'timeout';
  return 'connection';
}

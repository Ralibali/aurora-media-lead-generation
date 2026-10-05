import { ImapFlow } from 'npm:imapflow@2.2.5';
// @deno-types="npm:@types/html-to-text@9.0.4"
import { compile } from 'npm:html-to-text@10.0.1';
import { BATCH_MESSAGES, BODY_BYTES, INITIAL_MESSAGES, MAILBOX, initialCandidates, mailEvent, messageParts, uidWindow, type MailboxCursor } from './mailbox.ts';
import type { SupportIngestEvent } from '../_shared/support-types.ts';

const htmlToText = compile({ wordwrap: false, selectors: [{ selector: 'img', format: 'skip' }, { selector: 'a', options: { ignoreHref: true } }], limits: { maxInputLength: BODY_BYTES, maxDepth: 20, maxChildNodes: 1000 } });

/** Fixed destination and strict TLS: no request field can choose a host, user, port or mailbox. */
export function titanClient(password: string) {
  return new ImapFlow({
    host: MAILBOX.host, port: MAILBOX.port, secure: true,
    auth: { user: MAILBOX.address, pass: password },
    tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    logger: false, emitLogs: false, logRaw: false,
    disableAutoIdle: true, disableCompression: true,
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
    maxLineLength: 128 * 1024, maxLiteralSize: 128 * 1024, maxResponseSize: 512 * 1024,
  });
}

export async function readMailbox(password: string, cursor: MailboxCursor, now = new Date(), makeClient = titanClient) {
  const client = makeClient(password);
  // Avoid EventEmitter's unhandled 'error' output; awaited commands still reject.
  client.on('error', () => {});
  let timedOut = false;
  const deadline = Date.now() + 45_000;
  const timer = setTimeout(() => { timedOut = true; client.close(); }, 60_000);
  const events: SupportIngestEvent[] = [];
  try {
    await client.connect();
    const box = await client.mailboxOpen(MAILBOX.folder, { readOnly: true });
    if (!box.readOnly || !box.uidValidity || !Number.isInteger(box.uidNext)) throw new Error('invalid_mailbox');
    const validity = box.uidValidity.toString();
    let lastUid = cursor.uid_validity === validity ? cursor.last_uid : 0;
    let initialSince = cursor.initial_since, initialThrough = cursor.initial_through_uid;
    let candidates: Awaited<ReturnType<typeof client.fetchAll>> = [];
    let rangeEnd = Math.max(0, box.uidNext - 1);
    if (!box.exists) return { events, uid_validity: validity, last_uid: rangeEnd, initial_since: null, initial_through_uid: null, more: false };
    if (cursor.uid_validity !== validity) {
      const recent = await client.fetchAll(`${Math.max(1, box.exists - INITIAL_MESSAGES + 1)}:${box.exists}`, { uid: true, internalDate: true });
      candidates = initialCandidates(recent, now) as typeof recent;
      lastUid = candidates.length ? candidates[0].uid - 1 : rangeEnd;
      initialSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      initialThrough = rangeEnd;
    } else {
      const window = uidWindow(lastUid, box.uidNext);
      if (!window) return { events, uid_validity: validity, last_uid: lastUid, initial_since: null, initial_through_uid: null, more: false };
      rangeEnd = window.end;
      candidates = (await client.fetchAll(`${window.start}:${window.end}`, { uid: true, internalDate: true }, { uid: true }))
        .filter(message => message.uid >= window.start && message.uid <= window.end).sort((a, b) => a.uid - b.uid);
    }
    let completed = 0;
    for (const candidate of candidates.slice(0, BATCH_MESSAGES)) {
      if (Date.now() >= deadline) break;
      if (initialThrough !== null && initialSince && candidate.uid <= initialThrough && new Date(candidate.internalDate ?? 0).getTime() < new Date(initialSince).getTime()) {
        lastUid = candidate.uid; completed++; continue;
      }
      const message = await client.fetchOne(candidate.uid, { uid: true, envelope: true, internalDate: true, bodyStructure: true }, { uid: true });
      if (message) {
        if (message.uid !== candidate.uid) throw new Error('mailbox_uid_mismatch');
        const parts = messageParts(message.bodyStructure);
        let text = '', truncated = false;
        if (parts.textPart) {
          const { content } = await client.download(candidate.uid, parts.textPart, { uid: true, maxBytes: BODY_BYTES, chunkSize: 16 * 1024 });
          if (content) {
            const chunks: Uint8Array[] = []; let size = 0;
            for await (const chunk of content) {
              const bytes = new Uint8Array(chunk);
              size += bytes.byteLength;
              if (size > BODY_BYTES) throw new Error('mailbox_body_limit');
              chunks.push(bytes);
            }
            const joined = new Uint8Array(size); let offset = 0;
            for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
            text = new TextDecoder().decode(joined); // ImapFlow decodes transfer encoding and charset to UTF-8.
            if (parts.isHtml) text = htmlToText(text);
            truncated = size >= BODY_BYTES || text.length > 17_000;
          }
        }
        events.push(mailEvent(message, validity, text, now, truncated));
      }
      lastUid = candidate.uid; completed++;
    }
    if (completed === candidates.length) lastUid = rangeEnd;
    if (initialThrough !== null && lastUid >= initialThrough) { initialThrough = null; initialSince = null; }
    return { events, uid_validity: validity, last_uid: lastUid, initial_since: initialSince, initial_through_uid: initialThrough, more: lastUid < box.uidNext - 1 };
  } catch (error) {
    if (timedOut) throw Object.assign(new Error('mailbox_timeout'), { code: 'MAILBOX_TIMEOUT' });
    throw error;
  } finally {
    clearTimeout(timer);
    client.close(); // Never CLOSE/EXPUNGE/STORE; discard the read-only connection.
  }
}

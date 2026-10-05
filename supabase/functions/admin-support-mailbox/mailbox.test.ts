import assert from 'node:assert/strict';
import { createServer, type Socket } from 'node:net';
import { ImapFlow } from 'npm:imapflow@2.2.5';
import { readMailbox, titanClient } from './imap.ts';
import { initialCandidates, mailEvent, messageParts, safeMailboxError, uidWindow, type MailMetadata } from './mailbox.ts';

const now = new Date('2026-10-05T12:00:00Z');
const cursor = { uid_validity: null, last_uid: 0, initial_since: null, initial_through_uid: null };

Deno.test('MIME traversal skips attached messages, text attachments and inline images', () => {
  const parts = messageParts({ type: 'multipart/mixed', childNodes: [
    { part: '1', type: 'text/plain', disposition: 'attachment', dispositionParameters: { filename: 'private.txt' }, size: 9 },
    { part: '2', type: 'message/rfc822', childNodes: [{ part: '2.1', type: 'text/plain' }] },
    { part: '3', type: 'multipart/alternative', childNodes: [{ part: '3.1', type: 'text/html' }, { part: '3.2', type: 'text/plain' }] },
    { part: '4', type: 'image/png', parameters: { name: 'pixel.png' }, size: 50 },
  ] });
  assert.equal(parts.textPart, '3.2'); assert.equal(parts.isHtml, false); assert.equal(parts.attachments.length, 3);
});

Deno.test('UID windows never request reversed IMAP ranges, and initial import has count/date limits', () => {
  assert.equal(uidWindow(99, 100), null);
  assert.deepEqual(uidWindow(100, 2000), { start: 101, end: 600 });
  const recent = Array.from({ length: 105 }, (_, i) => ({ uid: i + 1, internalDate: now }));
  const old: MailMetadata = { uid: 110, internalDate: '2025-01-01T00:00:00Z' };
  const result = initialCandidates([...recent, old], now);
  assert.equal(result.length, 100); assert.equal(result[0].uid, 6);
});

Deno.test('Repeated reads share identity while UIDVALIDITY changes cannot overwrite other messages', () => {
  const metadata: MailMetadata = { uid: 10, internalDate: now, envelope: { subject: 'Hej\0!', from: [{ address: 'bad address' }], messageId: 'message-1' } };
  const first = mailEvent(metadata, '42', 'Text', now, false), retry = mailEvent(metadata, '42', 'Text', now, false);
  assert.equal(first.record_id, retry.record_id); assert.notEqual(first.event_id, retry.event_id);
  assert.notEqual(first.record_id, mailEvent(metadata, '43', 'Text', now, false).record_id);
  assert.equal(first.record?.requester_email, null); assert.equal(first.record?.title, 'Hej!');
  assert.equal(first.revision, '1');
  assert.equal((mailEvent(metadata, '42', 'A'.repeat(30000), now, true).record?.body?.length ?? 0) <= 20000, true);
  assert.equal(safeMailboxError({ authenticationFailed: true, message: 'password=NEVER_RETURN' }), 'auth');
  assert.equal(safeMailboxError(new Error('secret mail body')), 'connection');
});

Deno.test('Production destination, TLS certificate verification and provider logging are fixed', () => {
  const client = titanClient('fixture-password');
  assert.equal(client.options.host, 'imap.titan.email'); assert.equal(client.options.port, 993);
  assert.equal(client.options.secure, true); assert.equal(client.options.tls?.rejectUnauthorized, true);
  assert.equal(client.options.auth?.user, 'info@auroramedia.se');
  assert.equal(client.options.logger, false); assert.equal(client.options.logRaw, false);
  client.close();
});

/** A local IMAP protocol fixture exercises the real pinned parser and stream implementation.
 * It advertises no SMTP or provider features, and uses only synthetic message text. */
async function fixture(html = false) {
  const commands: string[] = [];
  const sockets = new Set<Socket>();
  const text = html ? '<p>Hej &amp; tack</p><script>hiddenScript()</script><img src="https://tracker.invalid/pixel"><p>Hjälp med bokningen.</p>' : 'Hej! Hjälp med bokningen.';
  const contentType = html ? 'HTML' : 'PLAIN';
  const headers = `Content-Type: text/${html ? 'html' : 'plain'}; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n`;
  const structure = `(("TEXT" "${contentType}" ("CHARSET" "UTF-8") NIL NIL "8BIT" ${Buffer.byteLength(text)} 1)("APPLICATION" "PDF" ("NAME" "invoice.pdf") NIL NIL "BASE64" 999999 NIL ("ATTACHMENT" ("FILENAME" "invoice.pdf"))) "MIXED")`;
  const envelope = '("Mon, 5 Oct 2026 12:00:00 +0000" "Fixture question" (("Guest" NIL "guest" "example.test")) NIL NIL ((NIL NIL "info" "auroramedia.se")) NIL NIL NIL "<fixture-1@example.test>")';
  const server = createServer(socket => {
    sockets.add(socket); socket.on('close', () => sockets.delete(socket));
    socket.write('* OK local fixture ready\r\n');
    let input = '';
    socket.on('data', bytes => {
      input += bytes.toString();
      for (let boundary; (boundary = input.indexOf('\r\n')) >= 0;) {
        const command = input.slice(0, boundary); input = input.slice(boundary + 2);
        commands.push(command);
        const tag = command.split(' ')[0];
        if (/ CAPABILITY$/i.test(command)) socket.write(`* CAPABILITY IMAP4rev1\r\n${tag} OK complete\r\n`);
        else if (/ LOGIN /i.test(command)) socket.write(`${tag} OK login\r\n`);
        else if (/ LIST /i.test(command)) socket.write(`* LIST () "/" "INBOX"\r\n${tag} OK list\r\n`);
        else if (/ EXAMINE /i.test(command)) socket.write(`* 1 EXISTS\r\n* OK [UIDVALIDITY 42] valid\r\n* OK [UIDNEXT 11] next\r\n${tag} OK [READ-ONLY] examined\r\n`);
        else if (/ FETCH /i.test(command)) {
          let response = '* 1 FETCH (UID 10 INTERNALDATE "05-Oct-2026 12:00:00 +0000"';
          if (/BODYSTRUCTURE/i.test(command)) response += ` BODYSTRUCTURE ${structure}`;
          if (/ENVELOPE/i.test(command)) response += ` ENVELOPE ${envelope}`;
          for (const part of command.matchAll(/BODY\.PEEK\[([^\]]*)\](?:<(\d+)\.(\d+)>)?/gi)) {
            const isMime = /MIME|HEADER/i.test(part[1]);
            assert.ok(isMime || part[1] === '1', 'Only text part may be downloaded');
            const original = Buffer.from(isMime ? headers : text);
            const start = Number(part[2] ?? 0), length = Number(part[3] ?? original.length);
            const slice = original.subarray(start, start + length);
            response += ` BODY[${part[1]}]${part[2] ? `<${start}>` : ''} {${slice.length}}\r\n${slice.toString()}`;
          }
          socket.write(`${response})\r\n${tag} OK fetched\r\n`);
        } else socket.write(`${tag} BAD unsupported fixture command\r\n`);
      }
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  return {
    commands,
    makeClient: (_password: string) => new ImapFlow({ host: '127.0.0.1', port: address.port, secure: false, doSTARTTLS: false, auth: { user: 'fixture', pass: 'fixture' }, logger: false, disableAutoIdle: true, disableCompression: true, socketTimeout: 1000 }),
    close: async () => { for (const socket of sockets) socket.destroy(); await new Promise<void>(resolve => server.close(() => resolve())); },
  };
}

Deno.test('Real IMAP reader uses EXAMINE/BODY.PEEK, imports text and attachment metadata, then deduplicates cursor', async () => {
  const imap = await fixture();
  try {
    const batch = await readMailbox('fixture', cursor, now, imap.makeClient);
    assert.equal(batch.events.length, 1); assert.equal(batch.last_uid, 10); assert.equal(batch.uid_validity, '42');
    assert.ok(batch.events[0].record?.body.includes('Hej! Hjälp med bokningen.'));
    assert.ok(batch.events[0].record?.body.includes('invoice.pdf'));
    assert.ok(imap.commands.some(command => / EXAMINE /i.test(command)));
    assert.ok(imap.commands.some(command => /BODY\.PEEK\[1\]/i.test(command)));
    assert.ok(!imap.commands.some(command => /\b(SELECT|STORE|EXPUNGE|APPEND|MOVE|COPY)\b/i.test(command)));
    const next = await readMailbox('fixture', batch, now, imap.makeClient);
    assert.equal(next.events.length, 0);
  } finally { await imap.close(); }
});

Deno.test('HTML-only mail is converted to plain text without rendering, fetching pixels or script text', async () => {
  const imap = await fixture(true);
  try {
    const batch = await readMailbox('fixture', cursor, now, imap.makeClient);
    const body = batch.events[0].record?.body ?? '';
    assert.ok(body.includes('Hej & tack')); assert.ok(body.includes('Hjälp med bokningen.'));
    assert.ok(!body.includes('<p>')); assert.ok(!body.includes('hiddenScript')); assert.ok(!body.includes('tracker.invalid'));
  } finally { await imap.close(); }
});

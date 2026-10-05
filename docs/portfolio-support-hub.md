# Portfolio and support administration

The existing admin now has `/admin/projekt` for project plans and verified links,
and `/admin/arenden` for support, feedback and incoming email. Both reuse the
existing admin authentication boundary. Project records stay in the private
`portfolio_projects` registry; private repository inventory is never bundled
with the website. An inventory timestamp describes when links were verified.

## Handling cases

Source content and the owner's handling are separate. Source updates refresh the
message and original status; they cannot overwrite private notes, assignment,
priority, follow-up, reply drafts or an owner's email-to-project assignment.
Saves require the last observed version and return HTTP 409 on a conflict.
Replies are drafts, with a link to the original system for sending. This feature
does not send customer messages or copy private customer-to-customer chats.

Only explicitly connected sources contribute cases. Empty sources send a
heartbeat; a connection older than 30 minutes is shown as requiring attention.
Missing connections are not interpreted as zero outstanding cases.

## Source installation

`scripts/support-source-relay.sql` is the reviewed database relay template.
Each participating repository tracks its own additive migration with only its
approved support-table triggers. No source credential or private inventory is
committed. Provisioning uses the following sequence:

1. Create an inactive central `support_sources` row bound to an existing project.
   Generate an independent 32-byte secret, with bearer format `source_uuid.secret`.
   Store only the SHA-256 hash of that entire bearer in the central row.
2. Apply the source repository's migration. Browser roles must have no access to
   `support_hub_private`, Vault decrypted secrets, or the pg_net request queue.
3. Put the bearer in the source project's Vault and configure the private source
   mapping to its UUID and approved table. Copy only the selected contact and
   support fields. Demo rows are excluded.
4. Activate the source after the central ingest endpoint is deployed. Backfill
   through `support_hub_private.enqueue(table_name,to_jsonb(row))`, then schedule
   `support_hub_private.flush()` every minute with pg_cron.
5. Verify actual acknowledgements, central case counts and empty-source
   heartbeats. A pg_net request ID is not delivery evidence.

Customer writes enqueue locally without making an HTTP request. Retries coalesce
per source record, revisions increase monotonically, and the central transaction
accepts each revision at most once. Acknowledgements must match the event, record
and revision. Delivered queue entries erase their duplicate message body.
Source deletions redact the imported source content; private owner notes remain.
To pause a connection, disable its private source configuration and central row.

## Email

The mailbox form in `/admin/arenden` connects only `info@auroramedia.se` to Titan
over verified TLS on port 993. The owner enters the password in the masked form;
it is stored in Vault and never returned by the status API. The fixed host,
account and INBOX cannot be selected by a request. The worker only reads messages
and attachment metadata; it never sends, moves, deletes or marks email as read.

The first import covers at most the latest 100 INBOX messages within 30 days.
Subsequent five-minute runs import in batches of 20 using UIDVALIDITY and UID
checkpoints. A lease prevents simultaneous runs; failed persistence leaves the
cursor unchanged so retries deduplicate already imported messages. Long bodies
are explicitly marked as shortened. Attachments stay in the original mailbox.

The connection is disabled until the owner saves a credential. Code deployment
and protocol-fixture tests do not prove that a real Titan account has connected.
Read back a successful import and its checkpoint after owner configuration.

## Verification

CI runs frontend/API tests, edge type checks, RLS and conflict tests, relay
acknowledgement/retry tests, a local IMAP protocol fixture and production build.
Local browser fixtures verify desktop/mobile layout and save/readback behavior;
these are separate from live authenticated verification. After deployment,
verify the real edge endpoints boot, reject anonymous access and accept only
their scoped source credentials before enabling source delivery.

# Aurora Watch — 2026-10-05

Extends the existing SiteWatch service; no additional app, account system or payment system.

## Product

`/aurora-watch` presents managed packages (299/699/1490 SEK per month excluding VAT) and opens the existing contact modal with the selected package and editable context. `/sitewatch` remains compatible with the Watch canonical. Orders still require a scoped quote; no subscription or charge is created by visiting or enquiring.

`/admin/website-guardian` retains HTTP monitors and adds saved browser journeys, pause/edit/queue, per-step results, two-attempt evidence, signed screenshots and a seven-day report from the latest 20 runs. It explicitly labels that sample rather than pretending to calculate complete uptime. Existing shared admin authentication and service-only database boundary are preserved.

## Execution and limitations

The Playwright runner opens approved public HTTPS pages, follows same-origin links, and asserts visible elements/text. Up to eight steps per flow; intervals 60,360,1440 minutes. No arbitrary JavaScript, entered credentials, form submission, payments or bookings. Network guard blocks non-GET/HEAD, cross-origin traffic, websockets and known state-changing URLs. DNS destinations must be public and are pinned for the browser. A generic text assertion proves only that text; use final-app selectors to detect broken app startup.

Each failure receives one fresh-context retry. A retry success is **flaky**, not healthy. Infrastructure failure and expired leases are **inconclusive**, not customer-flow failures. Screenshots are JPEG viewport images stored only in a private Supabase bucket, available via admin-authorized links that expire after ten minutes. Evidence is cleaned after seven days by the runner's claim endpoint. Screenshots are never uploaded to the public GitHub repository or Actions artifacts. Existing SiteWatch email configuration is preserved; new browser flows do not send emails.

The hourly GitHub schedule is a planned frequency, not an SLA. A workflow drains up to20 due flows within a23-minute admission budget; queue delay is visible. A scoped GitHub OIDC JWT is checked for issuer, audience, numeric repo/owner, main ref, workflow path and allowed event. No new long-lived runner secret is required. OIDC runner access is restricted to claim/complete; it cannot list or change customer settings. DB locks, immutable run snapshots, leases and idempotent completion prevent overlapping executions and stale writes.

## Deploy

1. **Already applied in production:** Lovable Cloud project `cyymcdqkpvcvwjoqxbco` received the equivalent schema on 2026-10-05. Do not rerun `supabase/migrations/20261005151557_aurora_watch_browser_flows.sql` there. Keep that canonical Supabase migration for fresh environments and local tests; it adds service-only RLS tables, restricted invoker RPCs and the private evidence bucket. See the deployment record below before future migration reconciliation.
2. Deploy `website-guardian` including all relative modules. Existing `verify_jwt=false` is required because the function validates both existing admin secrets and scoped GitHub OIDC itself. Keep `GUARDIAN_ALLOWED_ORIGINS`; no wildcard/default origins.
3. Publish synced `main` on existing Lovable project `2327e44d-6ed4-4f0f-bc14-f8f5fabd7c91` and verify `https://auroramedia.se/aurora-watch` assets, not only publish status.
4. Create agreed real flows on existing registered sites; first run must remain unverified until completed.
5. Manually dispatch `.github/workflows/aurora-watch.yml`, verify persisted run and private screenshot. Then set repository variable `AURORA_WATCH_ENABLED=true` to enable hourly dispatch.

Rollback: disable `AURORA_WATCH_ENABLED` and pause flows. Existing HTTP monitoring remains. Retain additive tables/history; do not drop production data.

## Applied migration record

PR #92 merged the canonical implementation at `012e8ca0393c08b00a4160809f879c0d67540267`. Lovable subsequently applied the browser-flow schema and deployed `website-guardian`, with repository state recorded in `ab25a58d1912f3c32fb5e41b03789bb84fab293d`. The deployment temporarily introduced a second migration toolchain; the application continues to use its existing Supabase architecture.

The deployed SQL is preserved for audit at [`migrations/2026-10-05-aurora-watch-applied.sql`](migrations/2026-10-05-aurora-watch-applied.sql). It is an audit copy, **not an executable migration entry point**. The private `aurora-watch-evidence` bucket was created separately through Lovable's storage tool; the applied SQL therefore omits the canonical migration's bucket insert. Production bucket configuration must remain private with a 512000-byte limit and `image/jpeg` MIME restriction. On 2026-10-05, the deployment verification confirmed live migration objects, RLS and RPC permissions; it also corrected the bucket's MIME allowlist to `array['image/jpeg']` through Lovable's database tool.

Lovable recorded an initial `0000_aurora_watch_browser_flows` placeholder containing only `-- placeholder check`, followed by the real `0001_aurora_watch_browser_flows` migration. Those existing live history entries must be preserved. Repository cleanup removes only the temporary Drizzle configuration, empty generated schema, journal/snapshots and unused dependencies; it does not remove or rerun any live migration. Updated Supabase generated types and the independent `previewAuthStorage` correction are retained.

Before a future automated migration push, reconcile the canonical Supabase migration identifier with the already-applied production state using the existing deployment process. Do not resolve differing history identifiers by replaying the table, function, policy or bucket creation statements.

The first production journey definition is `f95017f7-bea1-4ac3-b5b0-dc9d035e8e48`: Aurora Media home page, footer contact link, then the contact page heading. Creating that definition and verifying the public offer page do not prove a completed persisted browser run; verify the runner result separately after dependency consistency is restored.

## Verification

Run lint, typecheck, Vitest, `node --test scripts/aurora-watch-runner.test.mjs`, `npm run test:guardian-db`, Deno check of website-guardian and production build. DB tests cover browser-role denial, runner-only RPCs, overlapping claims, expired and wrong leases, idempotency and edit guards. Public UI tests cover existing offer enquiry, editor persistence, queue states and signed evidence URL boundaries.

KPI: qualified Watch enquiries and accepted paid scopes. Test counts and publication do not prove demand or revenue.

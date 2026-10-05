# Aurora Watch — deployment readiness (read-only check, completed)

## Verified live state (read-only, no changes made)

- **Tables:** `public.guardian_sites` (2 rows) and `public.guardian_checks` (433 rows) both exist with **RLS enabled** and **0 policies** (fail-closed, service-role-only access — intentional design).
- **Function:** `website-guardian` is deployed live; unauthenticated POST returns `401 unauthorized` (not 404), meaning it is up and enforcing auth.
- **Cron active:** 98 checks in the last 24 hours, latest at 2026-10-05 15:00 UTC — the every-15-minutes schedule is running.
- **Monitored sites:** `https://auroramedia.se/` and `https://auroratransport.se/`, both last status `healthy`, 49 checks each in the last 24h.
- **Backend health:** Lovable Cloud is up and responding normally; additive migrations and function deploys can be applied.
- **Secrets:** not read; no values shown. No emails sent.

## Readiness verdict

READY — the live backend matches the feat/aurora-watch-commercial baseline. Once the PR is merged to main:

1. Apply the forthcoming **additive** migration (new columns/tables only; no destructive changes to `guardian_sites` / `guardian_checks`).
2. Deploy `website-guardian` (with `check.ts`) from main.
3. Smoke-test with an unauthenticated probe (expect 401, not 404) and, if configured, a credentialed `action=list` call.
4. Confirm the cron job still fires (check `guardian_checks` grows after deploy).

No code, data, secrets, or schedules will be changed before the PR merge.

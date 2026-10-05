# Papers inside Aurora Media

## Provenance and placement

- Original existing Lovable project: `104ab2b3-896b-4e23-ab38-e2312966f6f3` (Aurora Papers; product UI named Aurora Receipt).
- Source commit: `bea7e59e89a0177cea2fa8371f3ce92d6b7921ef`, completed 2026-10-05. The original project remains unpublished.
- Native Aurora Media module: `src/modules/papers/PapersModule.tsx`, mounted at `/portal/papers/*`.
- Original private database and Storage are retained at project `mqizbxeifqqibluujlfy`. No customer data was migrated.
- The Papers account remains separate from Aurora Media administration; its session uses the dedicated `aurora-media-papers-auth` storage key. The module clears its isolated query cache on account changes and sign-out.

## Server boundary

`aurora-product-api` authenticates the supplied Papers JWT against the original Papers Auth service, creates a user-scoped client and passes the verified user id to `handlePapersOperation`. The handler does not use a service-role key. All table and Storage operations retain existing tenant RLS.

Supported operations are `processDocument`, `exportApproved`, and `recoverExport`. File hashing and MIME/signature checks run on the server. No OCR/AI provider is configured. CSV recovery is idempotent and rebuilds a missing CSV from the export's existing locked documents; it does not create another export.

## Database source and corrections

`original/drizzle/` preserves the original schema and three source migrations. These describe the **separate Papers backend**, not the Aurora Media database. Do not place them in the host's migration queue.

The following corrections were applied to the existing Papers backend on 2026-10-05 and are preserved under `security/`:

1. `2026-10-05-auth-and-storage.sql`: invitations use canonical, confirmed email from `auth.users`, never user-editable metadata; original uploads limited to PDF/JPEG/PNG.
2. `2026-10-05-document-and-export-integrity.sql`: approved currency is immutable, authenticated export updates are limited to `csv`, and exported original files cannot be deleted through the Storage policy.
3. `rollback-security-tests.sql`: twelve assertions against actual database roles and policies, with all synthetic application fixtures rolled back. No Auth users or passwords are created by this test.

## Verification and limits

VERIFIED FACT: all twelve rollback assertions passed. The original database had zero organisations, memberships, documents, exports, audit rows and stored files after cleanup. The bucket is private with a 20 MiB limit and PDF/JPEG/PNG allowlist.

VERIFIED FACT: the port's CSV and Edge-handler regression tests passed; they cover CSV escaping, formula neutralisation, file signatures, required verified identity, invalid identifiers and completed-export recovery. Scoped lint passed.

SOURCE-REPORTED EVIDENCE: the original Lovable build reported 25 passing tests and a browser flow through sign-in, upload, review, CSV download and audit. That report does not prove the newly integrated Aurora Media deployment.

Host typecheck, full build, gateway deployment and deployed browser verification are coordinated with the Aurora Media integration. Production must not be claimed from local code or the original source report alone.

VERIFIED CONFIGURATION: Papers Auth allows email registration and requires email confirmation (`disable_signup=false`, `mailer_autoconfirm=false`). The exact callback `https://auroramedia.se/portal/papers/auth` was added through the existing Lovable Cloud Auth settings and read back after reopening the settings: seven allowed URLs, including the new exact callback. The original Site URL and existing entries were preserved. The frontend requests that exact path; its Papers client consumes URL sessions only within `/portal/papers` and other modules are isolated the same way. No account was created and no confirmation email was sent as part of this verification, so a real registration/confirmation remains untested.

Still unavailable: automatic OCR, Stripe payments, invitation email, Bokio/Fortnox/Spiris integrations, plan limits and shared sign-on. Original document fields are inline in `documents`, not a separate `document_fields` table.

---
title: AI-KONTORET Purchase Ready - Plan
type: feat
date: 2026-08-27
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
target_repo: Ralibali/aurora-media-lead-generation
---

# AI-KONTORET Purchase Ready - Plan

## Goal Capsule

- Objective: A Swedish consumer can buy AI-KONTORET on `/grok-bot` at 199 / 199 / 349 SEK including VAT, receive only the paid private PDFs through expiring signed links and a delivery email that also confirms the digital-content agreement, and never see a live buy button unless every launch guard is green.
- Means: Harden the existing server-side Stripe Checkout stack; do not rebuild the product page or checkout architecture (KD1).
- Authority: Product Contract Key Decisions, then KTDs, then unit Approach.
- Stop: Remain `PRODUCT_STATUS = "prelaunch"` if any launch guard fails, if assets are missing or placeholder, if `LEGAL_OWNER_CONFIRMED` is still false, or if the documented test-mode purchase is incomplete (R16, R17).
- Do not claim legal approval. Keep `LEGAL_OWNER_CONFIRMED = false` until the owner approves the final wording (KD2).

## Product Contract

### Summary

Complete the existing AI-KONTORET purchase path so it can go live after one real Stripe test-mode purchase. Prices stay 199 / 199 / 349 SEK including VAT. VAT is classified per SKU. Shop/checkout terms and digital-content consent get a focused cleanup. The customer must actively check an unchecked box and later receive a copy of that agreement. Live sales flip only after the documented E2E chain passes.

### Problem Frame

The purchase stack already exists and is the right architecture. It is not production-ready: the private asset bucket is never created, `/villkor` covers only AI-kartan, delivery email omits the agreement copy, VAT is unconfigured, there are no purchase tests, and `PRODUCT_STATUS` is still `prelaunch`. Selling now would either fail delivery or sell without the required consent and tax gates.

### Key Decisions

- KD1. Use the existing `/grok-bot` purchase stack. Do not rebuild the product page, checkout architecture, or unrelated Aurora Media surfaces. Governs R1, R12.
  `(session-settled: user-directed — chosen over rebuild: scope is already defined)`
- KD2. Focused shop/checkout legal cleanup only. Keep the unchecked consent checkbox. Customer receives a confirmation/copy of the agreement. `LEGAL_OWNER_CONFIRMED = false` until the owner approves wording. Do not claim legal approval. Governs R6, R7, R8, R9.
  `(session-settled: user-directed — chosen over full policy rewrite: only shop/checkout terms are in scope)`
- KD3. Go live is in scope. Flip `PRODUCT_STATUS` to `live` only after a real Stripe test-mode E2E. Any failed launch guard keeps prelaunch. Governs R16, R17.
  `(session-settled: user-directed — chosen over stop-at-ready-for-owner: owner asked for the live flip as the last gated step)`
- KD4. Display prices 199 / 199 / 349 SEK are final and include VAT. Do not add VAT on top. Governs R2, R3.
  `(session-settled: user-directed — chosen over exclusive-plus-VAT: consumer-facing prices are inclusive)`
- KD5. Do not apply one VAT rate to all three SKUs. Guide is a 6% candidate only if it qualifies as an electronic publication. Prompt Vault must not be assumed to qualify. Bundle must not inherit the Guide rate. A VAT-classification gate blocks live. Governs R4, R5, R15.
  `(session-settled: user-directed — chosen over one-rate-for-all: Swedish reduced-rate rules are SKU-specific)`
- KD6. Preserve server-side Checkout, verified-session/webhook truth, private storage, and expiring signed URLs. No query parameter may prove a purchase. No fake or placeholder asset may satisfy launch readiness. Use the real v1.0 PDFs. Governs R10, R11, R12, R13, R14.
  `(session-settled: user-directed — chosen over client-side payment proof: existing security model stays)`

### Requirements

- R1. Change only AI-KONTORET purchase, launch, shop/checkout terms, delivery, and tests. Leave unrelated Aurora Media pages and AI-karta policy text alone.
- R2. Consumer-facing prices remain Guide 199 SEK, Prompt Vault 199 SEK, Bundle 349 SEK, including VAT.
- R3. Server catalog remains 19900 / 19900 / 34900 ore. The client never sends an amount.
- R4. Each SKU has its own VAT classification. Guide may use 6% only when classified as an electronic publication comparable to a printed publication. Vault defaults to the general 25% electronically supplied service class unless a later owner decision reclassifies it. Bundle has its own class and must not copy the Guide class.
- R5. `launchReadiness` fails until every SKU has an explicit VAT class and a VAT-configuration confirmation flag is true.
- R6. Checkout keeps an explicit digital-delivery consent checkbox. It must not be pre-checked. Create-checkout rejects `legal_ack !== true`.
- R7. Konsumentverket / DAL: withdrawal right for digital content ceases only after an active consent action plus information that the right is lost. Wording stays draft until the owner sets `LEGAL_OWNER_CONFIRMED = true`.
- R8. The customer receives a durable confirmation/copy of the agreement and consent (delivery email). The website is not that durable form.
- R9. Add a focused AI-KONTORET shop/checkout section on `/villkor`. Do not rewrite AI-karta terms or other site policies.
- R10. Create-checkout remains server-side Stripe Checkout. Catalog is the price authority. Omit `payment_method_types` so Stripe can present its current methods.
- R11. Webhook `ai-kontoret-deliver` verifies signature, re-fetches the session, rejects wrong SKU/amount/currency, and is idempotent on `event_id` and `stripe_session_id`.
- R12. Success UI calls `ai-kontoret-verify-session`. A query parameter never proves payment. Unverified return shows the existing non-confirmation copy.
- R13. Assets live only in private bucket `ai-kontoret-assets` at `ai-kontoret/v1.0/AI-KONTORET_Guide_v1.0.pdf` and `ai-kontoret/v1.0/AI-KONTORET_Prompt_Vault_v1.0.pdf`. Delivery uses expiring signed URLs (3 days).
- R14. Launch readiness requires the real named PDFs to exist in that private bucket. A missing object, empty object, or placeholder does not count.
- R15. Checkout uses inclusive tax behavior and per-SKU Stripe tax codes that match the classified VAT class. Display totals stay 199 / 199 / 349.
- R16. Automated tests cover spoofed return, wrong SKU/amount/currency, idempotent webhook handling, bundle asset mapping, private asset access, and launch-guard failure.
- R17. `PRODUCT_STATUS` flips to `live` only after a documented test-mode purchase proves: Checkout → verified session/webhook → purchase row → correct private assets → signed links → delivery email (with agreement copy) → verified success UI. Otherwise remain `prelaunch`.

### Actors

- A1. Customer — buys on `/grok-bot`, consents, pays on Stripe, receives email and success UI.
- A2. Owner — uploads real PDFs, confirms legal wording, confirms VAT classes, reviews E2E evidence, then allows the live flip.
- A3. Stripe — Checkout Session, tax, `checkout.session.completed`.
- A4. Deliver function — signature, idempotency, purchase row, signed URLs, Resend.
- A5. Launch gate — `PRODUCT_STATUS` plus `launchReadiness` booleans.

### Key Flows

- F1. Buy (live + ready). Customer opens checkout, leaves consent unchecked until they check it, submits email, server creates Checkout Session, Stripe charges inclusive catalog amount, return hits verify-session, webhook writes purchase and emails signed links plus agreement copy. Covers R2, R6, R8, R10, R11, R12, R13.
- F2. Spoofed return. Customer (or attacker) opens `/grok-bot?checkout=return&session_id=…` with a forged or unpaid id. Verify-session returns unpaid. UI does not claim a purchase. Covers R12.
- F3. Prelaunch / failed guard. Buy buttons stay hidden. Waitlist stays. Create-checkout returns not-ready. Covers R14, R17.
- F4. Bundle delivery. Paid bundle maps to both private PDFs. Guide-only and vault-only map to one file each. Covers R13.

### Acceptance Examples

- AE1. When the customer opens checkout, the consent box is unchecked. When they try to pay without checking it, the client blocks and the server returns `legal_ack_required`. Covers R6.
- AE2. When a return URL has `session_id=cs_test_fake`, verify-session returns `paid: false` and the UI shows the unverified copy. Covers R12.
- AE3. When a webhook payload has a valid signature but `amount_total` is 1 ore off, no purchase row is delivered and the event is marked rejected. Covers R11.
- AE4. When the same `checkout.session.completed` `event_id` arrives twice, the second response is duplicate and only one delivery email is sent. Covers R11, R16.
- AE5. When Guide VAT class is still unset, or Vault is set to the Guide publication class without its own decision, or Bundle copies Guide, `vat_classified` is false and create-checkout returns 409. Covers R4, R5.
- AE6. When `LEGAL_OWNER_CONFIRMED` is false, `launchReadiness.ready` is false even if the admin DB `legal_confirmed` flag is true. Covers R7.
- AE7. When the private bucket is missing or a required PDF is absent, asset checks are false and live buy stays closed. Covers R13, R14.

### Success Criteria

- One documented test-mode purchase file lists session id, purchase row, asset keys, signed-link TTL, Resend message id, and success-UI verify result.
- `npm test` covers every R16 case.
- After a failed guard, `/grok-bot` still shows waitlist, not dead buy buttons.
- Implementer never writes that legal text is approved while `LEGAL_OWNER_CONFIRMED` is false.

### Scope Boundaries

In scope: AI-KONTORET catalog, checkout, webhook, verify-session, launch gate, private bucket, shop/checkout terms section, consent email copy, purchase tests, documented E2E, gated live flip.

Out of scope: product-page redesign, Payment Links, new auth, AI-karta rewrite, Integritetspolicy rewrite, other Aurora Media products, live-mode Stripe keys in this change, claiming legal approval.

Deferred to follow-up (not required to ship this plan): owner approval of final legal wording (`LEGAL_OWNER_CONFIRMED = true`); live Stripe keys after test-mode evidence; later reclassification of Vault if a tax advisor later qualifies it.

### Dependencies

- Stripe test-mode secret and webhook secret for `ai-kontoret-deliver`.
- Resend API key and `christoffer@auroramedia.se` sending domain.
- Real files `AI-KONTORET_Guide_v1.0.pdf` and `AI-KONTORET_Prompt_Vault_v1.0.pdf` uploaded through Admin → AI-KONTORET.
- Stripe Tax enabled for Sweden if automatic tax is used (KTD3).

## Planning Contract

### Key Technical Decisions

- KTD1. Dual legal gate: code `LEGAL_OWNER_CONFIRMED` (starts false) AND existing admin `legal_confirmed`. Both must be true for `legal_confirmed` in `launchReadiness`. Instantiates KD2. Cites R7.
  `(session-settled: user-directed — chosen over admin-flag-only: a DB click must not outrun owner wording approval)`
- KTD2. Add an explicit per-SKU VAT class on the server catalog, plus `VAT_CLASSIFICATION_CONFIRMED`. Launch check `vat_classified` is true only when every SKU has a class, Vault is not silently treated as a publication, Bundle class is not `inherit_guide`, and the confirmation flag is true. Instantiates KD5. Cites R4, R5.
- KTD3. Use Stripe Tax with `automatic_tax` enabled and `tax_behavior=inclusive` on each Checkout line. Attach a Stripe tax code per line from the SKU class. Display and catalog amounts stay inclusive. Instantiates KD4, KD5. Cites R15.
- KTD4. Bundle Checkout is one inclusive 34900-ore line with the Bundle's own tax class (default general ESS / 25% until the owner records a different class). Do not emit the Guide publication tax code on the Bundle line. Instantiates KD5. Cites R4.
- KTD5. Create the private `ai-kontoret-assets` bucket in a new Supabase migration: `public = false`, no anon/authenticated object policies, service-role only. Instantiates KD6. Cites R13, R14.
- KTD6. Persist consent on the purchase: store ack text, timestamp, and product on `ai_kontoret_purchases` (or metadata) from session metadata, and reprint that text in the delivery email. Instantiates KD2. Cites R8.
- KTD7. Omit `payment_method_types` on Checkout Session create. Instantiates KD1. Cites R10.
- KTD8. Extract pure purchase helpers (catalog validation, session validation, idempotency decision, bundle asset map, launch-check composition, consent default) into a testable module used by edge functions and Deno/Vitest tests. Instantiates KD6. Cites R16.
- KTD9. `PRODUCT_STATUS = "live"` is U7 only. It runs after U6 evidence exists. If any guard is false, revert or leave `prelaunch`. Instantiates KD3. Cites R17.

### High-Level Technical Design

Component topology:

```text
/grok-bot (consent UI, verify UI)
    | POST product+email+legal_ack
    v
create-checkout --> Stripe Checkout (inclusive line + tax code)
    | success_url session_id (not proof)
    v
verify-session --> Stripe session OR purchase row --> success UI
    |
    v
Stripe webhook --> deliver (sig + refetch + validate)
    |--> purchases row + consent copy
    |--> signed URLs (private bucket)
    +--> Resend (files + agreement copy)

launch-status <-- launchReadiness(checks..., LEGAL_OWNER_CONFIRMED, vat_classified, assets)
```

Purchase protocol:

```text
1. Client: consent unchecked; user checks; POST legal_ack=true
2. Server: reject if !ready or !legal_ack; create session from CATALOG
3. Stripe: charge inclusive amount
4. Return: verify-session; UI paid only if Stripe/DB says paid
5. Webhook: verify sig; insert event_id; refetch session; validate sku/amount/currency
6. Deliver: map assets; sign URLs; email links + agreement; mark delivered
7. Replay: same event_id or session_id => no second email
```

Launch-gate states:

```text
prelaunch + any check false     -> waitlist
prelaunch + all checks true     -> waitlist (U7 not done)
live + any check false          -> waitlist (do not sell)
live + all checks true          -> buy buttons
```

VAT classification (before live):

```text
Guide  -> unset | electronic_publication_6 | ess_25
Vault  -> unset | ess_25   (publication_6 not assumed)
Bundle -> unset | ess_25 | mixed_explicit
         inherit_guide is invalid and fails the gate
VAT_CLASSIFICATION_CONFIRMED must be true
```

Delivery data flow:

```text
session.metadata {sku, product, legal_ack, legal_ack_text}
  -> validate against CATALOG
  -> purchase row (amount, currency, consent fields)
  -> CATALOG[product].assets -> storage_path
  -> signed URL TTL 3 days
  -> email (downloads + agreement copy + /villkor shop section)
```

### Assumptions

- Owner can upload the two real PDFs through the existing admin uploader after the bucket exists.
- Stripe test-mode Tax can be enabled for SE so inclusive `amount_total` still equals catalog ore.
- Resend already sends from `christoffer@auroramedia.se`.
- If Stripe Tax cannot be enabled in test mode, remain prelaunch and record that as a failed VAT/launch guard rather than shipping exclusive amounts.

### Implementation Constraints

- Target repo is `Ralibali/aurora-media-lead-generation`, not this Compound Engineering workspace.
- Do not restyle `/grok-bot` beyond consent/legal copy needed for R6–R9.
- Do not add a second payments SDK.
- Do not put secrets in the client.
- Do not treat admin `legal_confirmed` as owner legal approval while `LEGAL_OWNER_CONFIRMED` is false.
- Swedish copy for customer-facing legal and email. Code comments may stay Swedish where the file already is.

### Sequencing

U1 bucket → U2 VAT config/gate → U3 checkout hardening (needs VAT classes) → U4 terms + consent email + `LEGAL_OWNER_CONFIRMED` → U5 tests (needs U1–U4 behavior) → U6 documented test-mode purchase → U7 live flip.

U4 can start after U1 in parallel with U2–U3 if copy does not depend on tax-code strings.

### Research

- `supabase/functions/_shared/aiKontoret.ts` — CATALOG, `launchReadiness` (7 checks), signed URLs, Stripe REST helpers. No tax fields. No `LEGAL_OWNER_CONFIRMED`.
- `supabase/functions/ai-kontoret-create-checkout/index.ts` — sets `payment_method_types[0]=card`; no `automatic_tax`; no tax code.
- `supabase/functions/ai-kontoret-deliver/index.ts` — `validateSession` (sku/amount/currency/paid); event_id + session_id idempotency; email lacks agreement copy.
- `supabase/functions/ai-kontoret-verify-session/index.ts` — query param is a lookup key only.
- `supabase/migrations/20260825160234_5a4ba10c-a68d-423e-bdce-cec634e669a1.sql` — purchases/assets/launch/webhook tables, RLS fail-closed. Does not create `ai-kontoret-assets`.
- `src/config/aiKontoret.ts` — `PRODUCT_STATUS = "prelaunch"`; `LEGAL_ACK_OWNER_CONFIRMATION_REQUIRED = true`; draft `LEGAL_ACK_TEXT`.
- `src/pages/GrokBot.tsx` — `coAck` defaults false and is reset on open; client blocks unpaid checkbox; success UI depends on verify-session.
- `src/pages/Villkor.tsx` — AI-karta consent only.
- `src/test/example.test.ts` — placeholder only. Deno tests exist for `firecrawl-prospect-search/lib.ts`.
- Stripe Checkout: omit `payment_method_types`; use inclusive `tax_behavior` with Tax; hosted Checkout has no merchant checkbox field, so on-site consent stays.
- Skatteverket / reduced rate: 6% for electronic products comparable to printed publications; general ESS 25%. HFD 2022:27: a mixed supply does not inherit the reduced rate.
- Konsumentverket: active consent required if withdrawal right for digital content is to cease; consumer must get confirmation of the contract.

## Implementation Units

### U1. Private asset bucket

- Goal: Product PDFs can be stored privately and signed; missing bucket cannot look ready.
- Requirements: R13, R14
- Files: `supabase/migrations/*_ai_kontoret_assets_bucket.sql`; `supabase/functions/_shared/aiKontoret.ts`; `docs/ai-kontoret-launch.md`
- Approach: Add a migration that inserts bucket `ai-kontoret-assets` with `public = false` and no public/anon read policies. Keep service-role upload/sign. `assetExists` already lists the private bucket; launch checks stay false until the two named objects exist. Do not seed PDF bytes in git.
- Dependencies: none
- Test scenarios:
  - Happy: after migration, bucket exists and is non-public; upload-asset can write the catalog paths.
  - Edge: listing a missing object returns not-exists; launch `asset_guide` / `asset_vault` stay false.
  - Error: anon/authenticated SELECT on the bucket fails.
  - Integration: `createSignedUrl` returns a storage signed path only for an existing object.
- Verification: migration applied in the target project; launch-status asset checks false until real files are uploaded.

### U2. VAT classification gate

- Goal: Live checkout cannot start until each SKU has an explicit VAT class and confirmation flag.
- Requirements: R4, R5, R15
- Files: `supabase/functions/_shared/aiKontoret.ts`; `src/config/aiKontoret.ts`; `src/pages/admin/AiKontoret.tsx`; `docs/ai-kontoret-launch.md`
- Approach: Add per-SKU `vat_class` on CATALOG (`electronic_publication_6` | `ess_25` | `unset`). Guide may be `electronic_publication_6` only as an explicit setting. Vault must not default to `electronic_publication_6`. Bundle must be `ess_25` or another explicit non-`inherit_guide` class (KTD4). Add `VAT_CLASSIFICATION_CONFIRMED` (starts false until the owner records the three classes). `launchReadiness.checks.vat_classified` is true only when no SKU is `unset`, Bundle is not inherit-guide, Vault is not silently publication, and the confirmation flag is true. Map classes to Stripe tax codes in one catalog field. Display prices unchanged.
- Dependencies: none
- Test scenarios:
  - Happy: all three classes set, confirmation true, `vat_classified` true.
  - Edge: Guide `electronic_publication_6`, Vault `ess_25`, Bundle `ess_25` → gate can pass.
  - Error: Bundle class copies Guide publication class → `vat_classified` false.
  - Error: confirmation flag false → create-checkout 409 even if classes look filled.
  - Integration: launch-status exposes the boolean, never tax secrets.
- Verification: admin launch list shows the VAT check; create-checkout blocked until the gate is true.

### U3. Checkout and webhook hardening

- Goal: Checkout charges inclusive catalog amounts with per-SKU tax codes; webhook still treats Stripe/DB as truth.
- Requirements: R2, R3, R10, R11, R15
- Files: `supabase/functions/ai-kontoret-create-checkout/index.ts`; `supabase/functions/ai-kontoret-deliver/index.ts`; `supabase/functions/_shared/aiKontoret.ts`
- Approach: Build Checkout from CATALOG only. Drop `payment_method_types` (KTD7). Set inclusive tax behavior and the SKU tax code (KTD3). Keep `amount_total` validation against catalog ore. Persist `legal_ack` and ack text on session metadata for U4. Do not accept client amounts. If Stripe Tax would change the charged total away from 19900 / 19900 / 34900, fail closed and stay prelaunch rather than overcharging.
- Dependencies: U2
- Test scenarios:
  - Happy: guide session uses 19900 SEK inclusive and the Guide tax code.
  - Happy: bundle session uses 34900 SEK inclusive and the Bundle tax code, not the Guide publication code.
  - Error: client-supplied amount is ignored; catalog wins.
  - Error: webhook with wrong currency or SKU does not deliver.
  - Integration: create-checkout still returns 409 when launch readiness is false.
- Verification: Stripe test session shows inclusive 199.00 / 349.00 SEK; webhook `validateSession` still matches ore.

### U4. Shop terms, consent copy, legal code gate

- Goal: Customer sees shop terms, actively consents, and later receives that agreement in email. Code still says legal is unapproved.
- Requirements: R6, R7, R8, R9
- Files: `src/config/aiKontoret.ts`; `src/pages/Villkor.tsx`; `src/pages/GrokBot.tsx`; `supabase/functions/ai-kontoret-deliver/index.ts`; `supabase/functions/_shared/aiKontoret.ts`; `src/pages/admin/AiKontoret.tsx`; `docs/ai-kontoret-launch.md`
- Approach: Add an AI-KONTORET shop/checkout section on `/villkor` (digital product, inclusive prices, immediate delivery, active consent, withdrawal-right consequence, durable confirmation). Keep AI-karta sections. Add `LEGAL_OWNER_CONFIRMED = false`. Wire KTD1 so admin confirm cannot make `ready` true alone. Keep checkbox default false and reset on open. Put the ack text, time, product, and inclusive amount in the delivery email (HTML + text). Store the same on the purchase row (KTD6). Do not present the draft as approved.
- Dependencies: U1 (email must not ship if assets missing)
- Test scenarios:
  - Happy: email body contains the ack text and a `/villkor` shop-section link.
  - Happy: checkbox initial state is false; opening checkout resets it.
  - Edge: `/villkor` still states AI-karta rules in the original sections.
  - Error: `LEGAL_OWNER_CONFIRMED` false → launch not ready.
  - Integration: purchase metadata/columns retain the consent text after webhook.
- Verification: render `/villkor` shop section; inspect email fixture; launch check stays red.

### U5. Automated purchase tests

- Goal: The R16 cases fail the build if someone regresses payment truth or launch guards.
- Requirements: R16
- Files: `supabase/functions/_shared/aiKontoret.ts` (extract helpers); `supabase/functions/_shared/aiKontoret_test.ts` or `src/lib/aiKontoretPurchase.test.ts`; `src/test/example.test.ts` (replace or ignore); `src/config/aiKontoret.ts`
- Approach: Extract pure helpers (KTD8): `validateSession`, catalog lookup, bundle asset map, launch-check reduction, consent default, VAT gate predicate. Test with the repo's existing Deno (`index_test.ts` pattern) and/or Vitest. Do not call live Stripe in unit tests. Cover AE2–AE7 as tests.
- Dependencies: U2, U3, U4
- Test scenarios:
  - Spoofing: invalid or unpaid session_id → `paid: false`.
  - Wrong SKU / amount / currency → reject, no delivery decision.
  - Idempotent webhook: second `event_id` → duplicate, no second send.
  - Bundle mapping: bundle → `[guide, vault]`; guide → `[guide]`; vault → `[vault]`.
  - Private asset access: public/unsigned path is not a success condition; missing object fails readiness.
  - Launch-guard failure: any false check ⇒ `ready` false; create-checkout would 409.
- Verification: `npm test` and any `deno test` for the new module are green.

### U6. Documented test-mode purchase

- Goal: One real test-mode purchase proves the full delivery chain.
- Requirements: R17
- Files: `docs/ai-kontoret-e2e-test-mode.md` (or a section in `docs/ai-kontoret-launch.md`)
- Approach: Public create-checkout stays behind `launchReadiness`. Do not add a public bypass. If `LEGAL_OWNER_CONFIRMED` or `VAT_CLASSIFICATION_CONFIRMED` is still false, record that blocker in the evidence file and do not flip live. After the owner approves wording and VAT classes, run one Stripe test-mode bundle purchase and record session id, event id, purchase id, asset keys, signed URL host/path (not a durable secret), Resend id, and verify-session JSON. No placeholder PDF.
- Dependencies: U1, U2, U3, U4, U5
- Test scenarios:
  - Happy: bundle test card → paid session → purchase row → two signed PDFs → email with links and agreement → success UI paid.
  - Error: if any step fails, document the failure and do not proceed to U7.
- Verification: evidence file committed or stored in the launch handbook with redacted secrets.

### U7. Gated live flip

- Goal: Public `/grok-bot` sells only after U6 passed and every launch guard is green.
- Requirements: R17
- Files: `src/config/aiKontoret.ts`; `docs/ai-kontoret-launch.md`
- Approach: Set `PRODUCT_STATUS = "live"` only after U6 evidence. If `LEGAL_OWNER_CONFIRMED` is still false, skip this unit and remain prelaunch. If VAT confirmation is false, skip. If assets are missing, skip. After flip, confirm launch-status `ready: true` and that buy buttons appear only then.
- Dependencies: U6
- Test scenarios:
  - Happy: all guards true + evidence present → live + buy buttons.
  - Error: any guard false → file remains `prelaunch` or is reverted.
- Verification: production build still waitlists when any server check is false.

## Verification Contract

Repo commands (aurora-media-lead-generation):

```text
npm test
npm run typecheck
npm run lint
```

Add Deno tests for extracted helpers if they live under `supabase/functions/`:

```text
deno test supabase/functions/_shared/aiKontoret_test.ts
```

Quality gates:

- Every R16 case has an automated test.
- `LEGAL_OWNER_CONFIRMED` is false in the shipped tree unless the owner has approved wording in this engagement.
- No test uses a fake PDF as a passing launch-ready fixture.
- U7 is not done without U6 evidence.
- `npm run check` should stay green if the change is in the same package scripts.

## Definition of Done

Global:

- `/grok-bot` still waitlists unless both `PRODUCT_STATUS === "live"` and `launchReadiness.ready`.
- Inclusive prices 199 / 199 / 349 unchanged.
- Private bucket exists; only the two real v1.0 PDFs satisfy asset checks.
- VAT gate and dual legal gate are enforced server-side.
- Delivery email includes signed links and the agreement/consent copy.
- Automated R16 tests pass.
- One documented test-mode purchase exists, or the tree stays prelaunch with the blocker named.
- Abandoned experiment code is removed.
- This plan's implementer does not claim legal approval.

Per unit:

- U1. Bucket migration exists; public read is impossible; launch asset checks depend on real objects.
- U2. `vat_classified` check exists; invalid inherit-guide cannot be ready.
- U3. Checkout has inclusive tax + per-SKU tax codes; `payment_method_types` gone; webhook validation unchanged in strictness.
- U4. Shop section on `/villkor`; checkbox unchecked; email carries agreement; `LEGAL_OWNER_CONFIRMED = false` until owner says otherwise.
- U5. Named automated cases exist and pass.
- U6. Evidence document names every delivery step.
- U7. Live only if U6 and all guards passed; otherwise prelaunch.

## Appendix

### Stripe tax-code orientation (implementer must confirm current Stripe catalog)

- Electronic publication / e-book style codes are the only candidates for Guide 6%.
- General electronically supplied services / digital content codes are the default for Vault and for Bundle under KTD4.
- Do not copy a Guide publication code onto Bundle to “keep 6%”.

### Legal posture

Draft ack already in `LEGAL_ACK_TEXT`. U4 may tighten it for active consent + immediate delivery + withdrawal consequence. The implementer ships it as draft. Only the owner flips `LEGAL_OWNER_CONFIRMED`.

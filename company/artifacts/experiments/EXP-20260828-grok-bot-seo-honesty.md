# EXP-20260828 — /grok-bot first-byte SEO honesty

- company/objective: Aurora Media AB — waitlist-honest first-byte on `/grok-bot`
- relevant state/evidence:
  - VERIFIED FACT (2026-08-28): live first-byte title was `AI-KONTORET – Bygg ett AI-drivet företag med Grok Bot | Guide 199 kr | Aurora Media AB`.
  - VERIFIED FACT: live Product schema Offers had `price: "199"` and `price: "349"` with `PreOrder`.
  - VERIFIED FACT: `PRODUCT_STATUS = "prelaunch"`; checkout stays gated.
  - HYPOTHESIS: a lying price in the snippet wastes trust.
- exact task: Change first-byte title/Offer/schema to waitlist truth. Do not open checkout. Do not add SKUs. Candidate PR, do not merge.
- skill/version: site-revenue-experiment / 1.0
- authority: PREPARE
- definition of done: First-byte matches waitlist reality; checkout unchanged; candidate PR.
- artifact path: `company/artifacts/experiments/EXP-20260828-grok-bot-seo-honesty.md`

## Change

When `PRODUCT_STATUS` is `prelaunch`:

- Title: `AI-KONTORET – Svensk Grok Bot-guide | Väntelista`
- Description: waitlist, no 199 kr, no buy-now
- Product Offer: unpriced waitlist Offer to `/grok-bot#kop` (no SKU, no price)
- First-byte body price block: waitlist, not “kostar 199 kr” / “leverans direkt efter köp”

Live-mode copy is retained behind `PRODUCT_STATUS === "live"` only.

## Guardrails kept

- `PRODUCT_STATUS` remains `prelaunch`
- No checkout functions, SKUs, or launch-status changes
- No merge

## Verification (local first-byte after `npm run build`)

- VERIFIED FACT: `dist/grok-bot/index.html` title is `AI-KONTORET – Svensk Grok Bot-guide | Väntelista | Aurora Media AB`.
- VERIFIED FACT: first-byte Product Offer is unpriced waitlist (`Väntelista – lanseringsbesked`, no `price`, no `199`/`349`).
- VERIFIED FACT: first-byte HTML contains zero `199`, zero `Köp`, and waitlist CTAs only.
- VERIFIED FACT: `npm test` (5 passed), `npm run typecheck`, eslint on touched files, and `npm run build` succeeded.

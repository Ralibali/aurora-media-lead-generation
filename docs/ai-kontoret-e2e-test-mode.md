# AI-KONTORET – testläge-köp (bevis)

Status: **blocked**. `PRODUCT_STATUS` är `prelaunch`.
`LEGAL_OWNER_CONFIRMED = false`. `VAT_CLASSIFICATION_CONFIRMED = false`.
Ingen publik checkout får öppnas förrän båda flaggorna är true, Stripe-nyckeln finns, och lanseringsspärren är grön.

Detta är **inte** ett genomfört testköp. Cellerna nedan är faktiska prover från 2026-08-27, inte en avprickad runbook.

Verifiering mot deployad projekt `cyymcdqkpvcvwjoqxbco`. Branch-tip `353cb5f`.

## Förutsättningar

- [x] Filer i privat bucket `ai-kontoret-assets` på exakta sökvägar (se asset-rad)
- [ ] Stripe **secret key** i edge-funktionerna (`checks.stripe = false` 2026-08-27)
- [x] `STRIPE_WEBHOOK_SECRET` satt (`checks.webhook_secret = true`); osignerad POST → 400 `invalid_signature`
- [x] `RESEND_API_KEY` satt (`checks.email = true`); `auroramedia.se` sending-DNS verifierad (DKIM/SPF). Inbound MX pending (påverkar inte utskick)
- [ ] Ägaren har godkänt slutlig samtyckestext → `LEGAL_OWNER_CONFIRMED = true`
- [ ] Ägaren har godkänt momsklasser (Guide 6 %-kandidat / Vault 25 % / Bundle **ej antagen**) → `VAT_CLASSIFICATION_CONFIRMED = true`
- [ ] `ai-kontoret-launch-status` svarar `ready: true` (2026-08-27: `ready: false`)

## Fail-closed prover 2026-08-27 (UTC 15:37)

```
POST /ai-kontoret-launch-status → 200
{"ready":false,"checks":{"stripe":false,"webhook_secret":true,"service_role":true,"email":true,"asset_guide":true,"asset_vault":true,"legal_confirmed":false},"version":"1.0","prices":{"guide":199,"vault":199,"bundle":349}}

OBS: deployade funktioner returnerade inte `vat_classified`.
Branch-koden inkluderar den checken. Funktionerna måste deployas om från denna branch.

POST /ai-kontoret-create-checkout
  {product:bundle, email, legal_ack:true} → 409 {"error":"not_ready",...}
  {product:bundle, email}                 → 400 {"error":"legal_ack_required"}

POST /ai-kontoret-verify-session
  {session_id:"cs_test_spoofed_not_a_real_session"} → 200 {"paid":false,"reason":"stripe_not_configured"}

POST /ai-kontoret-deliver (utan stripe-signature) → 400 {"error":"invalid_signature"}

GET public object URL guide/vault → 400/404, ingen fil
Anon GET object → 400 NoSuchKey, ingen fil
storage.buckets.ai-kontoret-assets.public = false
Inga storage.objects-policies för denna bucket (fail-closed)
ai_kontoret_purchases = 0
ai_kontoret_webhook_events = 0
```

## Körning (bundle)

Ej körbar. `create-checkout` är 409 medan launch gate är false. Inget Stripe testköp har skapats.

## Bevislogg

| Steg | Förväntat | Resultat | Id / anteckning |
| --- | --- | --- | --- |
| Checkout Session skapad | 34900 öre SEK inkl. moms, korrekt tax treatment | **ej kört** – 409 `not_ready` | session: — |
| Webhook `checkout.session.completed` | signatur ok, inte rejected | **ej kört** | event: — |
| Rad i `ai_kontoret_purchases` | product=bundle, amount=34900, consent-text sparad | **ej kört** (0 rader) | purchase: — |
| Privata filer | båda v1.0-PDF:erna, inga placeholders | **present i bucket + register** | guide `ai-kontoret/v1.0/AI-KONTORET_Guide_v1.0.pdf` 647710 B, uploaded 2026-08-26T14:49:58Z; vault `ai-kontoret/v1.0/AI-KONTORET_Prompt_Vault_v1.0.pdf` 388740 B, uploaded 2026-08-26T14:50:03Z. Innehåll inte öppnat här – ägaren måste bekräfta att det är produktionsfilerna. |
| Signerade länkar | `/object/sign/`, TTL 3 dygn | **ej kört** | |
| Leveransmejl | länkar + avtalskopia + `/villkor#ai-kontoret` | **ej kört** | Resend: inget AI-KONTORET-köpmejl. Konto skickar i övrigt (senaste levererade 2026-08-27). |
| Success-UI | `ai-kontoret-verify-session` → paid:true | **ej kört** | spoof `cs_test_spoofed_not_a_real_session` → `paid:false` |
| Spoof-kontroll | query-param är inte köpbevis | **pass (negativt)** | `paid:false`; UI visar paid endast efter server `paid===true` |

## Beslut

Live-flip är **inte** tillåten. Lämna `PRODUCT_STATUS = "prelaunch"`.
`LEGAL_OWNER_CONFIRMED` och `VAT_CLASSIFICATION_CONFIRMED` lämnas `false`.

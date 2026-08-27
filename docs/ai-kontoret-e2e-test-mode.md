# AI-KONTORET – testläge-köp (bevis)

Status: **blocked**. `PRODUCT_STATUS` är `prelaunch`.
`LEGAL_OWNER_CONFIRMED = false`. `VAT_CLASSIFICATION_CONFIRMED = false`.
Ingen publik checkout får öppnas förrän båda flaggorna är true och lanseringsspärren är grön.

Detta dokument är runbooken för det enda köp som får släppa live-spärren. Fyll i efter att ägaren godkänt villkorstext och momsklasser.

## Förutsättningar

- [ ] Riktiga filer `AI-KONTORET_Guide_v1.0.pdf` och `AI-KONTORET_Prompt_Vault_v1.0.pdf` i privat bucket `ai-kontoret-assets`
- [ ] Stripe test-nyckel och webhook mot `ai-kontoret-deliver`
- [ ] Resend kan skicka från `christoffer@auroramedia.se`
- [ ] Ägaren har godkänt slutlig samtyckestext → `LEGAL_OWNER_CONFIRMED = true`
- [ ] Ägaren har godkänt momsklasser (Guide 6 %-kandidat, Vault 25 %, Bundle 25 % – inte ärvd) → `VAT_CLASSIFICATION_CONFIRMED = true`
- [ ] `ai-kontoret-launch-status` svarar `ready: true`

## Körning (bundle)

1. Öppna `/grok-bot` med `PRODUCT_STATUS = "live"` endast i en tillfällig testbranch om kassan ska provas före produktionsflip. Alternativ: vänta tills U7.
2. Bekräfta att samtyckesrutan **inte** är ikryssad.
3. Kryssa i, ange test-e-post, fortsätt till Stripe Checkout.
4. Betala med Stripe testkort `4242 4242 4242 4242`.
5. Verifiera varje steg nedan.

## Bevislogg

| Steg | Förväntat | Resultat | Id / anteckning |
| --- | --- | --- | --- |
| Checkout Session skapad | 34900 öre SEK inkl. moms, Bundle tax code | *ej kört* | session: |
| Webhook `checkout.session.completed` | signatur ok, inte rejected | *ej kört* | event: |
| Rad i `ai_kontoret_purchases` | product=bundle, amount=34900, consent-text sparad | *ej kört* | purchase: |
| Privata filer | båda v1.0-PDF:erna, inga placeholders | *ej kört* | assets: |
| Signerade länkar | `/object/sign/`, TTL 3 dygn | *ej kört* | |
| Leveransmejl | länkar + avtalskopia + `/villkor#ai-kontoret` | *ej kört* | Resend: |
| Success-UI | `ai-kontoret-verify-session` → paid:true | *ej kört* | |
| Spoof-kontroll | `?checkout=return&session_id=cs_test_fake` → inte betald | *ej kört* | |

## Beslut

Live-flip (U7) är **inte** tillåten med denna fil i blocked-läge.
Om något steg misslyckas: lämna `PRODUCT_STATUS = "prelaunch"`.

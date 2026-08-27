# AI-KONTORET – lanseringshandbok (ägare)

Status i koden: `PRODUCT_STATUS = "prelaunch"` i `src/config/aiKontoret.ts`.
Priser (får inte ändras, inklusive moms): Guide 199 kr · Prompt Vault 199 kr · Bundle 349 kr.

Kodflaggor som också måste vara true innan kassan kan bli `ready`:

- `LEGAL_OWNER_CONFIRMED` – false tills du godkänt den slutliga samtyckestexten. Admin-krysset räcker inte. Ingen agent får påstå att texten är juridiskt godkänd.
- `VAT_CLASSIFICATION_CONFIRMED` – false tills du godkänt momsklasserna.

Köpknapparna på `/grok-bot` öppnas **bara** när båda gäller:

1. `PRODUCT_STATUS = "live"` i koden, och
2. lanseringsspärren `ai-kontoret-launch-status` svarar `ready: true`.

Annars visas väntelistan – aldrig döda köpknappar.

## 1. Ladda upp de riktiga PDF:erna

Gå till **Admin → AI-KONTORET** (`/admin/ai-kontoret`) och ladda upp:

| Fil | Sökväg (privat lagring, bucket `ai-kontoret-assets`) |
| --- | --- |
| `AI-KONTORET_Guide_v1.0.pdf` | `ai-kontoret/v1.0/AI-KONTORET_Guide_v1.0.pdf` |
| `AI-KONTORET_Prompt_Vault_v1.0.pdf` | `ai-kontoret/v1.0/AI-KONTORET_Prompt_Vault_v1.0.pdf` |

Bucketen skapas av migrationen `20260827121000_ai_kontoret_private_assets.sql`. Den är **privat**. Ingen publik läsning, inga gissningsbara url:er.
Kunden får korta signerade länkar (3 dygn) efter verifierad betalning.

En tom fil eller placeholder räknas inte. Verifiering: klicka **Uppdatera**. Raderna
“Guide-PDF uppladdad” och “Prompt Vault-PDF uppladdad” blir gröna först när
filerna faktiskt ligger på sökvägarna ovan.

## 2. Betalning

Lägg in i Project Settings → Secrets:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Webhook: `ai-kontoret-deliver`, event `checkout.session.completed`.

Sessioner skapas server-side. Klienten kan bara välja produkt. `payment_method_types` sätts inte.
Priset är inklusive moms (`tax_behavior=inclusive`). Stripe Tax ska vara påslaget för Sverige.

## 3. Moms (två tillhandahållanden i bundlet)

| SKU / rad | Klass | Stripe tax code (orientering) | Belopp inkl. moms |
| --- | --- | --- | --- |
| Guide ensam | `electronic_publication_6` (kandidat för 6 %) | `txcd_10301100` | 199,00 kr |
| Prompt Vault ensam | `ess_25` (kandidat 25 %) | `txcd_10701800` | 199,00 kr |
| Bundle rad 1: AI-KONTORET Guide | `electronic_publication_6` | `txcd_10301100` | 174,50 kr |
| Bundle rad 2: Prompt Vault | `ess_25` | `txcd_10701800` | 174,50 kr |
| Bundle totalt | `split_two_supplies` | två koder, ingen tredje rad | **349,00 kr** |

Bundlerabatten 49 kr fördelas lika mot fristående 199+199. Hela bundlet klassas **inte** som 6 %.
`VAT_CLASSIFICATION_CONFIRMED` förblir false tills du godkänt klasserna.

Bekräfta och sätt `VAT_CLASSIFICATION_CONFIRMED = true` i
`src/config/aiKontoret.ts` och `supabase/functions/_shared/aiKontoretPurchase.ts`.
Displaypriserna förblir 199 / 199 / 349.

## 4. Juridik

Kryssrutetexten på `/grok-bot` är ett **utkast**. Kunden måste kryssa i den själv.
Efter köp skickas samma text i leveransmejlet tillsammans med belopp, momsfördelning
och länk till `/villkor#ai-kontoret` samt `/angra-kop`.

Elektronisk ångerfunktion (DAL 2 kap. 10 a §): `/angra-kop`. Den sparar begäran och
skickar ett mottagningsbevis. Inget automatiskt juridiskt beslut.

Sätt `LEGAL_OWNER_CONFIRMED = true` först när du står bakom formuleringen.
Det är inte ett juridiskt godkännande från någon agent.

## 5. Gå live

1. Alla launch-checks gröna, inklusive `vat_classified` och dual legal gate.
2. Ett dokumenterat Stripe testläge-köp enligt `docs/ai-kontoret-e2e-test-mode.md`.
3. Först därefter: `PRODUCT_STATUS = "live"`.

Om någon spärr faller: lämna eller återställ `prelaunch`.

## Flöde

```text
/grok-bot köpknapp
  -> kassa med e-post + uttryckligt samtycke (inte förifyllt)
  -> ai-kontoret-create-checkout (server sätter pris, SKU, tax code)
  -> Stripe Checkout
  -> success: /grok-bot?checkout=return&session_id=cs_...
       -> ai-kontoret-verify-session (server avgör om betalt)
  -> Stripe webhook checkout.session.completed
       -> ai-kontoret-deliver: signatur, idempotens,
          belopp/valuta/SKU, rad i ai_kontoret_purchases,
          signerade länkar, leveransmejl med avtalskopia
```

Support: `info@auroramedia.se`.

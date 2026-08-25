# AI-KONTORET – lanseringshandbok (ägare)

Status i koden: `PRODUCT_STATUS = "prelaunch"` i `src/config/aiKontoret.ts`.
Priser (får inte ändras): Guide 199 kr · Prompt Vault 199 kr · Bundle 349 kr.

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

Bucketen är **privat**. Ingen publik läsning, inga gissningsbara url:er.
Kunden får korta signerade länkar (3 dygn) efter verifierad betalning; nya länkar
kan alltid skickas om från samma adminsida.

Verifiering: klicka **Uppdatera** i lanseringsspärren. Raderna
“Guide-PDF uppladdad” och “Prompt Vault-PDF uppladdad” blir gröna först när
filerna faktiskt ligger på sökvägarna ovan.

## 2. Betalning (kräver ägarens åtgärd)

Lägg in i Project Settings → Secrets:

- `STRIPE_SECRET_KEY` – Stripes hemliga nyckel (live eller test).
- `STRIPE_WEBHOOK_SECRET` – signeringshemligheten för webhooken.

Skapa webhooken i Stripe mot edge-funktionen `ai-kontoret-deliver`
(`<projekt-url>/functions/v1/ai-kontoret-deliver`) med enbart eventet
`checkout.session.completed`.

Inga Payment Links behövs: sessionerna skapas server-side i
`ai-kontoret-create-checkout` med belopp och SKU från serverns katalog
(`supabase/functions/_shared/aiKontoret.ts`). Klienten kan bara välja produkt.

## 3. Juridiskt godkännande (owner gate)

I Admin → AI-KONTORET finns kryssrutetexten som kunden måste godkänna före
betalning. Den är ett **utkast** och inte juridiskt granskad. Bekräfta först när
du står bakom formuleringen samt `/villkor` och `/integritetspolicy`
(momshantering för digitalt innehåll, ångerrätt och köpbekräftelse).

## 4. Gå live

När alla sju kontroller är gröna: sätt `PRODUCT_STATUS = "live"` i
`src/config/aiKontoret.ts` och publicera. Kör ett riktigt testköp först
(Stripe test-läge) och kontrollera att leveransmejlet med båda filerna kommer
fram för bundle.

## Flöde i korthet

```text
/grok-bot köpknapp
  -> kassa med e-post + uttryckligt samtycke
  -> ai-kontoret-create-checkout (server sätter pris + SKU)
  -> Stripe Checkout
  -> success: /grok-bot?checkout=return&session_id=cs_...
       -> ai-kontoret-verify-session (server avgör om betalt)
  -> Stripe webhook checkout.session.completed
       -> ai-kontoret-deliver: signaturkontroll, idempotens,
          belopp/valuta/SKU-kontroll, rad i ai_kontoret_purchases,
          signerade länkar, leveransmejl (Resend)
```

Support i mejlen: `info@auroramedia.se`.

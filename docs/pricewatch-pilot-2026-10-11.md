# Aurora PriceWatch — avgränsad intern pilot (2026-10-11)

## Syfte och framgångskriterium
Återanvänd Aurora Media Commerce Ops och changedetection.io i stället för att skapa ett eget scraping-system. Testa 5–10 konkurrerande produktadresser för en enda befintlig e-handelskund under två veckor.

Föreslaget beslutskriterium för vidare BUILD: minst 90 % relevanta detekterade pris-/lagerförändringar efter manuell kontroll, inga kvarvarande blockerande fel och en kund som uttryckligen accepterar betalning för fortsatta bevakningar. Detta är **hypoteser och mål**, inte konstaterad efterfrågan.

## Releaseordning
1. Granska att `public.commerce_ops_stores` finns i den Aurora Media-databas som hör till projektet.
2. Driftsätt endast `supabase/migrations/20261011154000_commerce_pricewatch_pilot.sql`. Kontrollera RLS och att `anon`/`authenticated` saknar tabellåtkomst.
3. Kör en isolerad, uppdaterad changedetection.io-instans med `restock_diff` och begränsad egress. Upprätta säker TLS-publicering för instansen; exponera aldrig API-nyckeln i Vite-miljövariabler.
4. Spara `AURORA_PRICEWATCH_API_BASE=https://<din-instans>` (bara origin) och `AURORA_PRICEWATCH_API_KEY` som Supabase/Lovable Edge secrets.
5. Deploya `admin-commerce-ops`, därefter frontend. Gå till Admin → Commerce Ops, välj butik, lägg till en offentlig produktsida, synka status och avsluta bevakning.
6. Kontrollera att instansen skapat en watch med `processor=restock_diff`, två schemalagda kontroller och korrekt senast-ändrat. Vid fel ska adminvyn visa att tjänsten inte är konfigurerad eller att körningen misslyckats.

## Begränsningar
- Prisvärdena är **inte** produktmatchade eller granskade; endast providerens status visas. Ta inte automatiska prisbeslut.
- Upstream notifications är `notification_muted`, eftersom e-post/SMS kräver separata kundgodkännanden. Aurora-kunder får **inga** automatiska varningar förrän detta byggts och aktiverats.
- Administratören kan lägga till och ta bort adresser. Backend begränsar 30 adresser per butik. Använd endast offentliga produktsidor som det är tillåtet att hämta.
- För alla externa URL-skrapare krävs nätverkskontroller mot SSRF, privat DNS och redirect attacker i själva **changedetection.io-driftsmiljön**; Aurora Edges enkla URL-filter ersätter inte skyddet.
- Inget kundabonnemang eller produktionstrafik har aktiverats.

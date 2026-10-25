# Aurora PriceRadar — avgränsad pilot

## Funktion
En read-only analysmotor som jämför egna aktiva produkter med färska, uttryckligen tillåtna prisobservationer. Samma SKU och valutan SEK är förutsättningar. Funktionen `analyzePriceRadar(own, competitorObservations, options)` hittar konkurrenter med lägre pris samt konkurrenter som saknar lager. Endast färska observationer ger resultat.

## Vad som INTE görs
Ingen scraping av webbplatser, ingen insamling av login/API-nycklar, ingen gissad produktmatchning, inga automatiska prisändringar eller annonser. Därmed finns inga påståenden om att Aurora bevakar levande konkurrentpriser förrän en säker dataförsörjning faktiskt avtalats.

## Affärsvalidering
Pilot med två e-handlare som lämnar egna produktlistor och lagligen insamlade konkurrentsiffror. Mät matchningsgrad, felaktiga prisvarningar, hur många rekommendationer som är användbara samt betalningsvilja innan hosting/billing/Shopify-integration byggs.

## Test
`bun run test -- src/lib/priceRadar.test.ts`

## Nästa steg
En kontrollerad CSV-import med explicit SKU-mappning och validering av pris, valuta, lager och tid. Ingen automatisk omprissättning utan separata riskkontroller och godkännande.

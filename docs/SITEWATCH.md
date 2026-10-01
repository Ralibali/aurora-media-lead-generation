# Aurora SiteWatch

Aurora SiteWatch är den kommersiella produkten ovanpå Aurora Medias befintliga Website Guardian.

## Vad som fungerar

- HTTPS/statuskontroll med 10 sekunders timeout
- max 1 MB HTML per kontroll
- svarstid
- noindex via meta robots/googlebot eller X-Robots-Tag
- valfri text som måste finnas i HTML
- 15 min, 60 min, 6 h eller 24 h kontrollintervall
- två avvikelser i följd krävs för Incident
- incident- och återställningsmail kan skickas en gång per state-övergång
- 90 dagars kontrollhistorik
- serverstyrd allowlist för vilka origins som får kontrolleras

## Secrets / miljö

- `ADMIN_SECRET` eller befintlig adminhemlighet för admin-UI
- `GUARDIAN_CRON_SECRET` för schemalagd `run_due`
- `GUARDIAN_ALLOWED_ORIGINS` kommaseparerade exakta origins, t.ex. `https://auroramedia.se,https://honsgarden.se`
- `RESEND_API_KEY` krävs om e-post ska skickas
- `SITEWATCH_FROM_EMAIL` krävs tillsammans med Resend och ska vara en verifierad avsändare

Om Resend eller avsändare saknas fortsätter kontrollerna utan att låtsas att mail har skickats.

## Scheduler

Anropa edge-funktionen `website-guardian` med bearer `GUARDIAN_CRON_SECRET` och body:

```json
{ "action": "run_due" }
```

Scheduler kan köras var 15:e minut. Funktionen väljer själv bara monitorer vars individuella intervall har löpt ut.

## Medveten avgränsning

V1 gör server/HTML-kontroller. Den bevisar inte att formulär, inloggning eller checkout fungerar i en riktig webbläsare. Browser journeys ska läggas till som en separat runner när varje flöde kan definieras deterministiskt utan att lagra kundlösenord i databasen.

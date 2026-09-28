# Website Guardian – leverans 2026-09-28

VERIFIED FACT (koden): `/admin/website-guardian` är integrerad i befintlig AdminShell och lösenordsprotokoll. Lägg till kund/adress/förväntad HTML-text, kör kontroll, pausa, granska historik och hämta JSON-rapport. HTTP-status, hög svarstid (>5 s), noindex (HTML/HTTP-header) och saknad förväntad text ger avvikelse. Två avvikande kontroller i följd ger Incident; godkänt svar efter avvikelse ger Återställd. Ingen procentsats för uptime fabriceras. Tid för senaste kontroll syns; `running` betyder ej slutförd/okänd. Detta är HTTP/HTML-övervakning, inte webbläsartest av formulär, betalning, JS-renderat innehåll eller inloggning.

## Drift (ej utförd)

1. Applicera endast `20260928065604_website_guardian.sql` i Aurora Medias befintliga backend.
2. Deploya Edge Function `website-guardian`. `verify_jwt=false` krävs eftersom befintlig admin använder separat hemlighet; handlern verifierar alltid ADMIN_SECRET/FAQ_ANALYTICS_PASSWORD eller separat schedulersecret innan dataåtkomst. Inga nya direkta klientbehörigheter: tabellerna har RLS, endast service_role kan läsa/skriva.
3. Sätt `GUARDIAN_ALLOWED_ORIGINS`, t.ex. `https://auroramedia.se,https://updro.se`. Bara dessa exakta HTTPS-origins tillåts, utan credentials/port. Godkänn endast webbplatser ni äger eller har övervakningsmandat för, med betrodd publik DNS. Omdirigeringar följs aldrig; registrera slutlig URL. Varje svar begränsas till 1 MB och 10 sekunder. Servern behöver befintliga `SUPABASE_URL` och `SUPABASE_SERVICE_ROLE_KEY`.
4. Publicera frontend och lägg till webbplatser. Kör en manuell kontroll och granska utfallet. Ingen riktig kundwebbplats har kontrollerats från den nya tjänsten under utvecklingen.
5. Valfri schemaläggning: sätt Edge-secret `GUARDIAN_CRON_SECRET`, samma värde i GitHub Actions secret, repository variable `GUARDIAN_FUNCTION_URL` till funktionens HTTPS-adress och `GUARDIAN_SCHEDULE_ENABLED=true`. Workflow `Website Guardian` kör då var femte minut efter merge till default branch. Testa först med workflow_dispatch. Hemligheten skrivs aldrig i repo eller logg. Scheduler får endast `run_due`, inte läsa kunder eller ändra konfiguration.

En körning behandlar högst fem aktiva webbplatser som inte kontrollerats senaste timmen; en minutreservation förhindrar dubbla samtidiga kontroller per webbplats. Planera kapacitet för högst 60 webbplatser/timme med femminutsschemat; Actions kan fördröjas, detta är inget SLA. Historik äldre än 90 dagar rensas vid körning. Ingen kundmejl-/Slack-avisering skickas; incidenterna visas internt. Workflowfel syns i GitHub Actions.

Rollback: sätt `GUARDIAN_SCHEDULE_ENABLED=false`, pausa webbplatser och återställ frontend/funktion vid behov. Behåll historiktabellerna.

## Kontroller och licens

`npm ci`; `npm run check` (lint, typecheck, unit/API-tester, nya `test:guardian-db`, build). Deno: `deno check --node-modules-dir=none --no-lock supabase/functions/website-guardian/index.ts`.

RLS/grants och samtidighetsreservation körs i lokal PostgreSQL (PGlite). Test av riktiga handlern med mockade beroenden verifierar att scheduler inte kan läsa/kundadministrera och att ogodkända adresser avvisas. HTTP-tester täcker status, noindex, innehåll, omdirigering och nätverksfel. Desktop/mobil testade med simulerad backend: skapa → kontroll → incident → paus → export, utan sidledes overflow eller JavaScriptfel.

Ny kod är egen implementation. Inga AGPL-komponenter, ingen ny runtime-dependency. Enda nya testberoendet är PGlite 0.5.8 (Apache-2.0). Pris och intäkter är UNKNOWN. HYPOTHESIS: samma interna funktion kan ingå i löpande kundförvaltning; mät upptäckta relevanta incidenter, falsklarm och tid till åtgärd innan kommersiellt SLA/pris sätts.

## Samspel med öppna PR:er

[Aurora Media PR #65](https://github.com/Ralibali/aurora-media-lead-generation/pull/65) bygger vidare på Accessibility Care och WCAG-/axe-fynd. Guardian är HTTP-/innehållsövervakning och ersätter inte det flödet. [PR #64](https://github.com/Ralibali/aurora-media-lead-generation/pull/64) är Aurora Sight-kundlagret för AI-observationer; ingen ny kopia skapas här. Guardian utgår från main och kräver inte #64/#65, men gemensamma CI-/navigationsfiler måste behålla båda tilläggen om PR:erna mergas efter varandra. Ingen av de befintliga PR:erna har ändrats eller mergats i denna uppgift.

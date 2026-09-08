# Aurora – nästa förbättring av kontakt och uppföljning

Datum: 2026-09-08. Arbetsorder: WP-20260908-funnel-followthrough.

## Verifierade brister

- Kontaktformuläret validerade det medskickade projektunderlaget till högst 500 tecken. Verktyg kunde skapa längre underlag; felet gällde ett dolt fält och kunden kunde inte rätta det i formuläret. Servern kapade dessutom underlaget vid 500 tecken.
- Prissidan, paketkomponenten och app-prisräknaren hade olika leveransintervall. Prisräknaren lade på egna schablonavgifter och valde paket efter totalbelopp, samtidigt som dess text sade att den byggde på de fasta paketen.
- Admin skickade anteckningar efter en timer, kunde överlappa skrivningar och uppdaterade visningen före serverns kvitto. Servern bekräftade även uppdateringar som inte träffade någon post.

## Ändring

1. Samma gräns på 5 000 tecken för projektunderlag i formulär och server. Underlaget visas för kunden och skickas med. Beskrivningen från prisguiden följer med till meddelandefältet.
2. Gemensam katalog för de redan publicerade paketnamnen, startpriserna och planeringsintervallen. Prissidan, paketkomponenten, tjänstesidan och prisguiden använder denna källa. Inga publicerade paketpriser har höjts eller nya tilläggspriser införts.
3. Prisguiden visar paketets startpris och samlar önskade funktioner inför offert. Mobilapp får en separat offertväg. PDF och kopierat underlag beskriver vad som fortfarande behöver avgränsas.
4. Admin sparar skrivningar till samma post i ordning. Listan ändras först när servern bekräftar den sparade posten. Felaktig källa, orimliga datum och för långa anteckningar avvisas på servern.
5. Anteckningar sparas med en tydlig knapp. Misslyckat sparande behåller utkastet; stängning med osparad text visar valen spara, fortsätt redigera eller kasta. Snabba detaljbyten visar inte svar från föregående förfrågan.
6. Händelser för öppnat kontaktformulär, inskickningsförsök, valideringsfel och serverfel kompletterar befintligt mottagningskvitto i den redan installerade analysintegrationen. Inga namn, kontaktuppgifter eller fritext läggs i dessa händelser.

## Verifiering

- 35 automatiska tester: typiska serverfel, fullständigt projektunderlag, validering av admins skrivningar, saknad post och köade ändringar efter både framgång och fel.
- Lint utan fel, faktisk TypeScript-kontroll och produktionsbygge passerar. Befintliga lintvarningar återstår.
- Webbläsartestet `scripts/verify-funnel-followthrough.mjs` kontrollerar prisreferenser, PDF, långt underlag, förifylld beskrivning, mottagningskvitto, osparade anteckningar, misslyckade sparningar, ordning och omladdning. Alla backendanrop är simulerade.
- 12 godkända sidkontroller på sex påverkade adresser vid 1440 px och 390 px, utan horisontell överströmning eller JavaScript-fel. Prisguiden och admin är även visuellt granskade. PDF-underlaget har renderats och granskats. Ingen skarp kundkontakt eller mejlsändning görs i testerna.

## Affärsuppföljning och distribution

Hypotes: färre giltiga förfrågningar stoppas mellan verktyg och kontakt, och färre uppföljningar tappas genom osparade eller överskrivna anteckningar. Detta är ännu inte ett uppmätt försäljningsresultat. Befintlig baslinje finns i `20260908-customer-journey.md`.

Följ mottagna förfrågningar i förhållande till inskickningsförsök, validerings-/serverfel och övergång från ny förfrågan till kontakt, möte och offert. Händelserna behöver kontrolleras i den skarpa analysmiljön efter publicering innan de används som baslinje.

Frontend och `send-contact-email`/`list-leads`, inklusive `_shared/contactLimits.ts` och `_shared/leadValidation.ts`, ska distribueras som samma version. Admin kräver det nya kvittot med sparad post. Att koden finns på main bevisar inte att dessa Edge Functions är distribuerade. Produktionsdatabasen har inte ändrats under arbetet.

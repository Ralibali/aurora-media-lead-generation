# Aurora Receipt (Aurora Media AB)

Neutral dokumentinkorg för kvitton och leverantörsfakturor för svenska småföretag och mindre redovisningsbyråer.
Projektet är **inte publicerat**.

## Verifierat fungerande (2026-10-05)

Verifierat med automatiska tester mot den riktiga backenden (25 tester, alla gröna) och ett webbläsartest av hela flödet.

- **Konto**: registrering och inloggning med e-post/lösenord. E-postbekräftelse krävs (standard i auth).
- **Organisationer och roller**: skapa organisation (du blir owner). Roller: owner (hanterar roller), admin (regler, export,
  inbjudningar, borttagning), reviewer (laddar upp, granskar, godkänner). Det måste alltid finnas minst en owner.
- **Inbjudningar utan e-post**: owner/admin sparar en inbjudan; den aktiveras när personen loggar in med en bekräftad
  e-postadress som matchar. Inga mejl skickas.
- **Organisations-RLS**: alla tabeller och filer är låsta per organisation. Testat: en annan organisation kan inte läsa,
  skapa, ändra eller ladda ner något; ingen kan lägga till sig själv i en annan organisation.
- **Privata originalfiler**: PDF/JPG/PNG (max 20 MB) i privat bucket `originals/<org_id>/…`. Visas bara via
  tidsbegränsade länkar (5 minuter). Testat att utomstående inte får länk och att publik URL inte fungerar.
- **Granskningskö**: `new -> needs_review -> approved -> exported`, plus återöppning `approved -> needs_review`. Reglerna
  upprätthålls i databasen: hoppa över steg nekas, godkännande kräver leverantör, datum och brutto, godkända fält är låsta,
  exporterade dokument kan inte ändras eller tas bort, `exported` kan bara sättas av exporten.
- **Tolkning (extraction-adapter)**: körs på servern, hashar originalfilen (SHA-256) och flyttar dokumentet till
  `needs_review`. Ingen tolkningstjänst är konfigurerad, så inga fält fylls i automatiskt – allt fylls i manuellt.
- **Dubblettvarning**: samma filhash, eller samma leverantör + fakturanummer (skiftlägesokänsligt), inom samma organisation.
- **Leverantörsregler**: om filnamnet innehåller regelns text fylls leverantören i när dokumentet skapas.
- **Audit log**: skrivs automatiskt av databasen för dokument, medlemskap, inbjudningar, regler och exporter. Läsbar för
  medlemmar och går inte att redigera.
- **CSV-export**: semikolonseparerad, UTF-8 med BOM, CRLF, decimalkomma. Citattecken och radbrytningar hanteras korrekt,
  och formler neutraliseras (`=`, `+`, `-`, `@` får ett inledande `'`). Exporten sparas och kan laddas ner igen.
- **DEMO-läge**: separat organisation märkt DEMO med fyra påhittade dokument (en avsiktlig dubblett). Inga filer, inga
  riktiga kunder. Uppladdning är avstängd i demo-organisationer.
- **Billing**: tabellen `billing_state` finns med status `not_activated`. Priserna 249 / 899 / 1 990 kr/mån exkl. moms
  visas; köpknapparna är avstängda.

## Inte färdigt / begränsningar

- Ingen automatisk fälttolkning (ingen provider). Gränssnittet `ExtractionProvider` finns i `src/lib/extraction.server.ts`.
- Ingen betalning (Stripe ej kopplat), inga inbjudningsmejl, ingen Google-inloggning.
- Bokio/Fortnox/Spiris är inte byggda.
- Fälten ligger direkt i `documents` (ingen separat `document_fields`-tabell); historik över ändringar finns i audit log.
- Planbegränsningar (antal företag per plan) upprätthålls inte än.
- Medlemmar kan sätta `file_hash` själva första gången (servern sätter den normalt). Den är låst därefter.

## Tester

- `bun test ./tests/csv.test.ts` – CSV-escaping (enhetstest).
- `bun test ./tests/integration.test.ts` – tenant isolation, roller, privat fillagring, statusövergångar, dubbletter,
  leverantörsregler, demo. Skapar syntetiska användare `aurora-test-*@example.invalid` och tar bort allt efteråt.
  Kräver `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

## Miljövariabler

Klient: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
Server: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (servern behöver inte service role i appen; endast testerna).
Valfritt, framtida: `EXTRACTION_PROVIDER` + nyckel för vald tolkningstjänst, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
(läggs i Secrets, aldrig i klienten).

## Nästa produktionssteg

1. Koppla en tolkningstjänst via `ExtractionProvider` (markera fält som tolkade, kräv fortfarande granskning).
2. Stripe Checkout + webhook under `/api/public/` som uppdaterar `billing_state`; upprätthåll planbegränsningar.
3. Inbjudningsmejl via verifierad e-postdomän.
4. Integrationer mot Bokio, Fortnox, Spiris.


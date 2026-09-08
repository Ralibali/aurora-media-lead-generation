# Aurora Media – kundresan, AI-kartan och admin

Datum: 2026-09-08. Arbetsorder: WP-20260908-customer-journey.

## Nuläge och underlag

- **Verifierat:** GitHub-repot `Ralibali/aurora-media-lead-generation`, utgångsläge `2bc6a025112f13601734993873bac36b1e382f1f`, är kopplat till Lovable-projektet `2327e44d-6ed4-4f0f-bc14-f8f5fabd7c91` (Aurora Media Lead Generation).
- **Verifierat:** Lovable Analytics visar 90 besökare, 160 sidvisningar och 68 % avvisningsfrekvens för 2026-08-09–2026-09-08, slutdatum exkluderat. 33 besökare registreras som mobil och 57 som dator. 36 är geografiskt klassificerade som Sverige. Verktygets legacy-listor är inte en validerad försäljningstratt.
- **Verifierat:** Databasen innehåller 4 kontaktförfrågningar (2 nya, 2 kontaktade), 9 AI-kartor (8 nya, 1 förlorad) och inga genomlysningsförfrågningar. Ingen post har status kund. En kontaktförfrågan skapades under de senaste 30 dagarna.
- **Okänt:** Vilka poster som är testdata respektive kvalificerade affärsmöjligheter, faktiskt vunna kunder, intäkter och kanalernas konverteringsgrad. Besöksdata kan innehålla botar och egna besök.
- **Verifierat:** Samtliga 9 AI-kartor har processrader; 6 saknar den valfria AI-textanalysen. RLS är påslaget för de fyra kundformulärtabellerna. Detta är en avgränsad kontroll, ingen fullständig säkerhetscertifiering.
- **Underlag:** Repots företagskontrakt och arbetsflöden, åtkomliga Aurora-relaterade samtal om erbjudandet och marknadsföringen, tidigare portfolio- och redaktionsarbete, publicerad webbplats och aktuell kod. Oåtkomlig historik har inte antagits vara läst.

## Affärshypotes

Ett tydligare erbjudande, verkliga arbetsflöden i portfolion, fungerande mobilnavigering och tillförlitliga formulär bör göra det enklare för rätt besökare att ta kontakt. En adminvy som börjar med obesvarade förfrågningar och förfallna uppföljningar bör minska tappade kontakter. Effekten på försäljningen är ännu inte mätt.

## Genomförda ändringar

**Publika kundresan**

- Ny startsida med tre konkreta behov: administration, kundkontakt och egen produkt. Valet följer med till kontaktformuläret.
- Verkliga projekt visas som egna verksamheter/produkter med länkar till befintligt underlag. Inga nya kundomdömen eller mätresultat har hittats på.
- Gemensam mobilmeny, synlig tangentbordsfokus, innehållslänk och kompaktare mobilfooter.
- Kontakt utan valt paket fungerar. Serverns mottagningskvitto kräver sparad förfrågan. Fel hos mejlleverantören gör inte en redan sparad förfrågan till ett formulärfel. Bekräftelsesidan påstår inte att ett mejl säkert har skickats.
- Tydligare kontakt- och om-sida. Ogrundade generella leveranslöften, produktantal och datalagringsgarantier har tagits bort från de ändrade huvudflödena.
- Stadsadressernas felaktiga partiella route-parametrar har ersatts. Befintliga stadsidor kan nu nås via sina länkar. 404-sidan har läsbar text, huvudrubrik och återväg.
- Startsidan laddar inte rapport- och PDF-koden. Huvudfilen minskar från 1 214 kB till cirka 696 kB före komprimering, från 383 till 216 kB med gzip. Det är en byggmätning, inte ett uppmätt Core Web Vitals-resultat.

**AI-kartan**

- Utkast valideras och återställs innan autosparandet får skriva över dem. Samtycke återställs inte automatiskt.
- Branschförslag och exempel fyller inte längre i påhittad arbetstid eller förvalda problemområden.
- Alla steg kontrolleras vid inskick. Dubbla inskick blockeras medan ett anrop pågår. Anrop har tidsgränser, synliga fel och resultatet kan överlämnas även när webbläsarlagringen inte fungerar.
- Servern validerar processernas struktur och värden. En process bedöms utifrån sitt eget innehåll; ett globalt kundserviceval förvandlar inte rapportering till en supportassistent.
- Valfri betald AI-analys körs först efter lagring och den befintliga databasbegränsningen. Vid fel används den regelbaserade rapporten. Ofullständiga nya inskick kompenseras om processlagringen misslyckas.
- Resultat, förhandsberäkning och PDF använder 46 arbetsveckor och 600 kr/timme konsekvent. Möjlig frigjord tid och schablonmässigt tidsvärde skiljs från faktisk besparing, kostnad och offert.
- En hög poäng innebär inte automatiskt ett dyrare paket. Poäng visas mot 16, inte relativt den högsta processen. Pris kräver avgränsning.
- Äldre kartor utan valfri AI-analys fungerar utan den tidigare obegränsade omgenereringen. Felaktiga delningssvar och trasig lokal resultatdata hanteras synligt.

**Admin**

- Gemensam serverkontrollerad inloggning före montering av administrationssidor. Inloggning fungerar utan sidladdning. Utgången behörighet rensar sessionen.
- Översikten börjar med obesvarade förfrågningar, dagens uppföljningar, offerter och kunder. Länkar öppnar rätt filter eller kundpost.
- Leadlistan, FAQ-rapporten och textverktyget använder samma administrationsram och felhantering.
- Mötesförfrågningar räknas inte som bokade möten. Möten och kunder baseras på sparad status.
- CSV-export neutraliserar formelsträngar från inkommande formulär.

## Verifiering

- `npm run check`: lint utan fel, faktisk TypeScript-kontroll av app och verktyg, regressionstester, redaktionskontroll och produktionsbygge. Befintliga varningar för Fast Refresh/hooks och stora kodfiler återstår.
- 29 automatiska tester, inklusive verkliga serverhandlers med en utbytt databasadapter och blockerade nätverksanrop. Tester täcker mottagningskvitton, mejlfel, processvalidering, sparad rapport, ofullständig lagring, utkast, schabloner, försäljningsstatus och CSV.
- `scripts/verify-customer-journey.mjs` testar kontaktformuläret, mobilmenyn, hela AI-kartan inklusive omladdning/PDF, nio skyddade adminadresser, fel/rätt lösenord, uppföljning och utgången session. Backend är simulerad i dessa webbläsartester; inga skarpa förfrågningar eller mejl skickas.
- 242 godkända sidkontroller över 121 adresser på 1440 px och 390 px mot produktionsbygget: samtliga webbplatskarteadresser, omdirigeringar och en saknad adress. Inga JavaScript-fel, trasiga bilder eller horisontell överströmning upptäcktes. Huvudsidor, mobilflöden, admin och PDF har även granskats visuellt.
- PDF med tre exempelprocesser: fem sidor renderade och visuellt granskade, inklusive rubriker, tabeller, antaganden, prisexempel och kontaktlänkar.

## Release och uppföljning

Ändringarna är förberedda i en separat gren. Publicering kräver att samma kodversion förs till Lovable och att även dessa funktioner distribueras: `send-contact-email`, `submit-ai-map`, `get-ai-map-result`, `list-leads`, inklusive `_shared/aiMapScoring.ts`.

Lovables databas är åtkomlig för läsning via projektanslutningen. Den separata Supabase-anslutningen saknar behörighet att administrera just Aurora-projektets Edge Functions. Ingen backenddistribution har därför påståtts vara verifierad. Inga befintliga produktionsposter har ändrats, inga kundmejl skickats och inga betalda AI-genereringar beställts under arbetet.

Efter godkänd publicering: kontrollera liveversion, admin och funktionsversioner, gör ett uttryckligen godkänt skarpt kontaktprov och följ upp nya relevanta förfrågningar, första svarstid, bokade möten, offerter och vunna affärer. Jämför mot denna baslinje; dra inga säkra konverteringsslutsatser från det nuvarande lilla urvalet.

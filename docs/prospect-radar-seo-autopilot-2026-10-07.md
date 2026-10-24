# Prospect Radar + SEO Autopilot – 2026-10-07

## Varför

Aurora Media-repot hade redan flera kommersiella lager: Website Guardian/Aurora Watch, Firecrawl-baserad prospektering, Search Console, rank tracking, Aurora Local Boost och AI-synlighet. Därför bygger den här releasen ovanpå befintliga ytor i stället för att skapa nya parallella verktyg.

## Byggt

### Prospect Radar

- Ny deterministic scoring-helper i `src/lib/prospectRadar.ts`.
- Klassar prospekt som `hot`, `warm`, `nurture` eller `ignore`.
- Kombinerar befintlig `fit_score`, audit-status, `opportunity_score` och verifierade audit-signaler.
- Rekommenderar erbjudande: hemsida, lokal SEO, SEO Autopilot, AI automation eller manuell granskning.
- Ger nästa säljåtgärd utan att automatiskt kontakta någon.

### SEO Autopilot

- Ny åtgärdsplanerare i `src/lib/seoAutopilot.ts`.
- Gör Search Console-rader till prioriterade åtgärder:
  - quick wins nära topp 3,
  - låg CTR trots hög synlighet,
  - content gaps nära sida två.
- Alla åtgärder kräver mänskligt godkännande före publicering.
- Timingen passar befintlig adminvy `/admin/seo` och Aurora Local Boost.

### Publik import

- Produkterna är importerade på hemsidans produktlista via `src/data/products.ts`.
- De är även synliga i Aurora-portalförteckningen via `src/data/auroraProducts.ts` med länkar till befintliga adminytor:
  - Prospect Radar → `/admin/prospektering`
  - SEO Autopilot → `/admin/seo`

## Begränsningar

- Ingen ny extern scrapingmotor eller e-postmotor har lagts till.
- Inga automatiska utskick görs.
- Inga SEO-ändringar publiceras automatiskt.
- Inga databasmigrationer krävs i första releasen.

## Nästa byggsteg

1. Importera Prospect Radar-helpern i `Prospektering.tsx` och visa topp 10 direkt i adminpanelen.
2. Importera SEO Autopilot-helpern i `Seo.tsx` och visa åtgärdskön under Search Console-tabellerna.
3. När användningen är bevisad: skapa en RLS-skyddad tabell för godkända SEO-åtgärder och historik.

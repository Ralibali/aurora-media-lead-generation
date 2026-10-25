# MailGuard, Merchant Rescue och AppLaunch (2026-10-25)

## Återanvänt, inte duplicerat
- SiteGuard = befintliga Aurora Watch / SiteWatch / website-guardian. Inget nytt byggt.
- LeadRecovery = befintliga FollowupQueue / leadPipeline. Inget nytt byggt.
- Alla tre nya tjänster använder befintlig `OfferPage` (ny valfri `tool`-prop), befintligt kontaktformulär/leads (`paket` = tjänstens namn) och befintlig `trackEvent`.
- Ingen ny billing, inga priser hittade på: alla nivåer är "Offert".

## Byggt
| Modul | Var | Nätverk | Lagring |
|---|---|---|---|
| Aurora MailGuard | `/mailguard`, edge-funktion `mailguard-check`, logik i `supabase/functions/mailguard-check/analyze.ts` | Endast DNS-over-HTTPS mot fast resolver (cloudflare-dns.com), 4 s timeout, `redirect: error` | Ingen |
| Aurora Merchant Rescue | `/merchant-rescue`, `src/lib/merchantRescue.ts`, CLI `bun scripts/merchant-rescue-scan.ts <dir> [--json]` | Ingen (lokalt i webbläsare/CLI) | Ingen |
| Aurora AppLaunch | `/app-release`, `src/lib/appLaunch.ts`, CLI `bun scripts/applaunch-check.ts <dir> [--json]` | Ingen | Ingen |

### Säkerhet
- MailGuard: domänvalidering (inga IP, localhost, .local/.internal m.fl.), max 5 DKIM-selektorer med strikt mönster, max 10 kontroller/IP/10 min (in-memory, best effort per instans – plattformen saknar standard för rate limiting), krav på bekräftelse att användaren ansvarar för domänen. Ingen användarstyrd URL hämtas => ingen SSRF.
- DKIM markeras aldrig "ok" utan selektor; misslyckade DNS-uppslag blir "okänd", aldrig "ok". Ingen text säger "säker".
- Merchant Rescue maskerar privata nycklar, client_secret/refresh_token/API-nycklar i utdrag; status är aldrig "migrerad".
- AppLaunch flaggar lösenord i build.gradle/Fastfile; innehåller alltid mänsklig QA och Apple 4.2-risk (server.url, inga native-plugins).

## Inte byggt (och varför)
- DMARC-rapportmottagning (rua-inkorg): kräver e-postinfrastruktur och avtal; ingen efterfrågan verifierad.
- OAuth mot Merchant Center/live-migrering: kräver kundens behörighet per uppdrag.
- Persistent rate limiting i databasen: befintlig `try_contact_rate_limit` räknar leads, passar inte.
- Inga "Prisma"-delar finns i repot; inget att återanvända.

## Testplan
- Automatiskt: `src/test/mailguard.test.ts`, `src/lib/merchantRescue.test.ts`, `src/lib/appLaunch.test.ts` (vitest).
- Live: POST `mailguard-check` `{"domain":"auroramedia.se","selectors":"resend"}` → 200 med verkliga fynd; `{"domain":"169.254.169.254"}` → 400.
- Manuellt: öppna `/mailguard`, `/merchant-rescue`, `/app-release`, kör verktyget, klicka offert-CTA och kontrollera att lead får rätt `paket`.

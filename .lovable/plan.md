## Mål

Hela auroramedia.se ska kännas som startsidan: mörk "Nordic Noir"-estetik med JetBrains Mono + Fraunces, moss-grön accent, breda sektioner, mono-eyebrows, kursiva display-rubriker. Samma navbar, footer, knappar, kontaktmodal överallt.

## Strategi

Istället för att skriva om 30+ sidor från scratch (~9 500 rader, hög risk) extraherar jag designsystemet från `Index.tsx` till delade byggstenar och refaktorerar sidor mot dem. Då får alla sidor samma UX, men vi behåller funktionalitet (formulär, AI-karta, blogg-routing osv.).

## Arkitektur — nya delade filer

```text
src/components/nordic/
  NordicLayout.tsx     ← <html shell> med .aur tokens, header, footer, scroll-progress
  NordicHero.tsx       ← Hero med eyebrow + display-rubrik + CTA (med/utan bild)
  NordicSection.tsx    ← Sektion m. nummer (01/02), eyebrow, titel, lead
  NordicCard.tsx       ← Bezel-kort (för tjänster/paket/case)
  NordicCTA.tsx        ← Final CTA-bandet
  tokens.css           ← Flyttar TOKENS-strängen från Index.tsx hit
```

Header/Footer (`SiteHeader`, `SiteFooter`) byggs om så de matchar Nordic-navet i Index. Det gör att alla sidor som redan använder dem (tjänster, priser, om, kontakt m.fl.) automatiskt får rätt chrome.

## Faser

**Fas 1 — Designsystem (grund, måste komma först)**
- Extrahera `TOKENS` från `Index.tsx` till `src/components/nordic/tokens.css`.
- Skapa `NordicLayout`, `NordicHero`, `NordicSection`, `NordicCard`, `NordicCTA`.
- Bygg om `SiteHeader` + `SiteFooter` i Nordic Noir-stil (samma nav som Index, sticky scroll-progress, moss-accenter).
- Refaktorera `Index.tsx` till att använda primitiverna (sanity check att inget visuellt regredierar).

**Fas 2 — Huvudsidor (störst trafikvärde)**
- `Tjanster.tsx`, `Priser.tsx`, `Om.tsx`, `Kontakt.tsx`, `Process.tsx`, `Produkter.tsx`, `Metodik.tsx`
- Behåll allt textinnehåll och funktionalitet. Byt endast wrapper, sektioner, knappar, typografi.

**Fas 3 — SEO-landningssidor & undersidor**
- `WebbyraLinkoping.tsx`, `AiKonsultSverige.tsx`, `AiAutomationForetag.tsx`
- `CityPage.tsx` (mall för städer) + alla `tjanster/*.tsx` via befintliga `ServicePageTemplate`. Mallen byggs om en gång → alla 9 tjänste-undersidor uppdateras.

**Fas 4 — Innehållsdrivna sidor (mest försiktigt)**
- `Blog.tsx`, `BlogPost.tsx`, `Arbete.tsx`, `CasePage.tsx`
- `Integritetspolicy.tsx`, `RedaktionellPolicy.tsx`, `NotFound.tsx`
- `AiKarta*.tsx` (3 sidor med tung formulärlogik) — bara wrapper + typografi byts, formulärflödet rörs ej.
- `en/Index.tsx` får samma Nordic-shell.

## Vad som INTE ändras

- Kontaktmodalens flöde (redan förenklad i förra steget).
- AI-kartans formulärlogik, validering, edge functions.
- Datamodeller (`portfolio.ts`, `articles*.ts`, `cityContent.ts`).
- Routing, SEO-meta, JSON-LD, sitemaps.

## Risker & motåtgärder

- **Risk:** AI-karta och blogg har stylade element som krockar med dark theme.
  **Motåtgärd:** Fas 4 sist, en sida i taget, manuell QA i preview innan vi går vidare.
- **Risk:** En global TOKENS-CSS kan läcka in på sidor som ännu inte är konverterade.
  **Motåtgärd:** Allt scopeas under `.aur`-klassen (precis som idag).
- **Risk:** Stor diff är svår att granska.
  **Motåtgärd:** En fas per användarmeddelande. Du får titta på preview mellan faserna och godkänna nästa steg.

## Leverans i den här tråden

Jag kör **Fas 1 + Fas 2** nu (grundsystem + 7 huvudsidor). Sedan stannar jag, du tittar i preview, och säger "kör vidare" innan jag tar Fas 3 och Fas 4. Det håller varje leverans granskbar och ger dig möjlighet att justera riktning innan vi rör resten.

OK att köra på enligt detta?

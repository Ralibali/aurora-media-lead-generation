# Aurora Accessibility Guard

Det här är den operativa delen bakom erbjudandet på `/tillganglighet`.

## Vad den gör

- kör axe-core mot prioriterade publika sidor
- testar WCAG 2 A/AA, WCAG 2.1 AA och WCAG 2.2 AA
- sparar kritiska, allvarliga, måttliga och mindre fynd med selector, HTML-utdrag och fixbeskrivning
- körs schemalagt varje måndag via GitHub Actions
- kan köras manuellt mot en valfri publik URL
- skapar både JSON och en kort Markdown-rapport som GitHub Actions-summary

## Konfiguration

Sajterna finns i `config/accessibility-sites.json`. Lägg bara till sidor som Aurora har uppdrag att övervaka. Begränsa listan till representativa sidtyper; axe är inte en crawler.

## Köra lokalt

```bash
npm ci
npx playwright install chromium
npm run a11y:guard
```

För en engångsscan:

```bash
A11Y_URL=https://example.se npm run a11y:guard
```

Rapporter hamnar i `artifacts/accessibility/<timestamp>/`.

## Viktig begränsning

Automatiska tester hittar inte alla tillgänglighetsproblem. Resultatet ska användas för teknisk regression och prioritering och kompletteras med manuell kontroll av bland annat tangentbord, fokusordning, skärmläsarflöden, begriplighet och innehåll.

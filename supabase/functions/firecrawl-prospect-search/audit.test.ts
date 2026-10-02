import { assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildOpportunityAudit } from "./audit.ts";

Deno.test("Opportunity Engine scores only observed evidence", () => {
  const audit = buildOpportunityAudit({
    companyName: "Testbolaget",
    domain: "testbolaget.se",
    needType: "webb",
    industry: "byggföretag",
    location: "Linköping",
    markdown: "Byggföretag i Linköping. © 2022. Välkommen till vår webbplats.",
    rawHtml: "<html><head><title>Testbolaget</title></head><body>Byggföretag i Linköping</body></html>",
    links: ["https://testbolaget.se/kontakt"],
    metadata: { title: "Testbolaget", statusCode: 200, robots: "index,follow" },
  });

  assertEquals(audit.httpStatus, 200);
  assertEquals(audit.signals.some((s) => s.signal === "old_copyright"), true);
  assertEquals(audit.signals.some((s) => s.signal === "missing_viewport"), true);
  assertEquals(audit.signals.some((s) => s.signal === "missing_meta_description"), true);
  assertEquals(audit.opportunityScore > 0, true);
  assertMatch(audit.pitchDraft, /UTKAST – GRANSKA FÖRE KONTAKT/);
});

Deno.test("Opportunity Engine does not invent problems on clean evidence", () => {
  const audit = buildOpportunityAudit({
    companyName: "Bra Sajten",
    domain: "brasajten.se",
    needType: "webb",
    markdown: "Kontakta oss för offert. © 2026.",
    rawHtml: '<html><head><title>Bra Sajten</title><meta name="viewport" content="width=device-width"><meta name="description" content="Bra beskrivning för kunder"><link rel="canonical" href="https://brasajten.se/"></head><body>Kontakta oss</body></html>',
    links: ["https://brasajten.se/kontakt"],
    metadata: { title: "Bra Sajten", description: "Bra beskrivning för kunder", statusCode: 200, robots: "index,follow" },
  });

  assertEquals(audit.signals.some((s) => ["missing_viewport","missing_title","missing_meta_description","missing_canonical","noindex","http_problem"].includes(s.signal)), false);
  assertMatch(audit.summary, /Inga tydliga webbproblem/);
});

// Aurora Merchant Rescue – statisk migrationsgranskning Content API for Shopping -> Merchant API.
// Körs helt lokalt (webbläsare eller CLI). Ingen kod skickas någonstans. Bevisar aldrig att en migration är klar.

export type MerchantFinding = {
  ruleId: string;
  severity: "måste-åtgärdas" | "kontrollera" | "info";
  title: string;
  merchantApi: string;
  action: string;
  file: string;
  line: number;
  excerpt: string;
};

type Rule = { id: string; re: RegExp; severity: MerchantFinding["severity"]; title: string; merchantApi: string; action: string };

// Mappningar enligt Googles migrationsguide för Merchant API. Verifiera alltid mot aktuell dokumentation.
export const MERCHANT_RULES: Rule[] = [
  { id: "endpoint-host", re: /shoppingcontent\.googleapis\.com/i, severity: "måste-åtgärdas", title: "Anrop mot Content API-värden", merchantApi: "merchantapi.googleapis.com", action: "Byt bas-URL och anropa respektive Merchant API-delAPI (accounts, products, datasources, reports m.fl.)." },
  { id: "content-v2", re: /content\/v2(\.1)?\b|\bcontent_v2(_1)?\b|['"]content['"]\s*,\s*['"]v2(\.1)?['"]/i, severity: "måste-åtgärdas", title: "Content API v2/v2.1 refereras", merchantApi: "Merchant API (v1)", action: "Ersätt klient/discovery för content v2.1 med Merchant API-klientbibliotek för berört delAPI." },
  { id: "client-lib", re: /google\.shopping\.content|ShoppingContent(Service)?\b|google-api-services-content|Google\.Apis\.ShoppingContent|@googleapis\/content|googleapis\.content\(/, severity: "måste-åtgärdas", title: "Content API-klientbibliotek", merchantApi: "google-shopping-merchant-* bibliotek", action: "Byt beroende till Merchant API-biblioteken (t.ex. google-shopping-merchant-products, -accounts, -datasources)." },
  { id: "products-insert", re: /products\s*\.\s*(insert|update|delete|custombatch)\b|\/products\/batch|productsCustombatch/i, severity: "måste-åtgärdas", title: "Produktskrivning (products.insert/update/custombatch)", merchantApi: "Products API: productInputs.insert / patch / delete (kräver datakälla)", action: "Skapa eller välj en API-datakälla och skriv via productInputs. custombatch finns inte – använd parallella anrop eller batch i klientbiblioteket." },
  { id: "products-read", re: /products\s*\.\s*(get|list)\b/i, severity: "kontrollera", title: "Produktläsning", merchantApi: "Products API: products.get / list (bearbetad produkt)", action: "Läs bearbetade produkter via products; notera nya resursnamn accounts/{account}/products/{product}." },
  { id: "productstatuses", re: /productstatuses/i, severity: "måste-åtgärdas", title: "productstatuses", merchantApi: "Products API (productStatus i Product) / Reports API", action: "Läs status från product.productStatus eller via Reports API i stället för productstatuses." },
  { id: "datafeeds", re: /datafeeds?(statuses)?\b/i, severity: "måste-åtgärdas", title: "Datafeeds", merchantApi: "Data Sources API", action: "Migrera flöden till dataSources och fileUploads." },
  { id: "accounts", re: /\baccounts\s*\.\s*(get|list|insert|update|delete|authinfo|claimwebsite|link|custombatch)\b|accountstatuses|accounttax/i, severity: "måste-åtgärdas", title: "Konto-resurser", merchantApi: "Accounts API (accounts, homepage, businessInfo, users, accountIssues …)", action: "Mappa varje kontoanrop till motsvarande Accounts API-resurs; flera fält har flyttat till egna resurser." },
  { id: "shippingsettings", re: /shippingsettings/i, severity: "måste-åtgärdas", title: "Fraktinställningar", merchantApi: "Accounts API: shippingSettings", action: "Använd accounts/{account}/shippingSettings." },
  { id: "inventory", re: /\b(localinventory|regionalinventory|pos)\s*\./i, severity: "måste-åtgärdas", title: "Lokalt/regionalt lager eller POS", merchantApi: "Inventories API", action: "Skriv lokalt och regionalt lager via Inventories API." },
  { id: "reports", re: /\breports\s*\.\s*search\b|MerchantPerformanceView|SELECT\s+[^;]*FROM\s+(MerchantPerformanceView|product_view)/i, severity: "kontrollera", title: "Rapportfrågor", merchantApi: "Reports API", action: "Kontrollera vy- och fältnamn i Reports API-frågespråket (t.ex. product_performance_view)." },
  { id: "orders", re: /\borders\s*\.\s*(list|get|acknowledge|shiplineitems|refund)|orderreturns|orderinvoices|returnaddress|returnpolicy\b/i, severity: "måste-åtgärdas", title: "Order/retur-resurser", merchantApi: "Ingen direkt motsvarighet – kontrollera Googles vägledning", action: "Inventera behovet och följ Googles aktuella rekommendation för order och returer innan migrering." },
  { id: "liasettings", re: /liasettings|pubsubnotificationsettings/i, severity: "kontrollera", title: "LIA- eller notifieringsinställningar", merchantApi: "Accounts API / Notifications API", action: "Mappa mot Notifications API respektive kontoinställningar." },
  { id: "merchant-id", re: /merchantId\b|merchant_id\b/, severity: "info", title: "merchantId i anrop", merchantApi: "Resursnamn accounts/{account}", action: "Merchant API använder resursnamn i stället för separata merchantId-parametrar." },
  { id: "scope", re: /auth\/content\b/, severity: "info", title: "OAuth-scope för Content", merchantApi: "Samma scope används av Merchant API enligt Googles dokumentation", action: "Behåll scope men verifiera att GCP-projektet är registrerat för Merchant API och att Merchant API är aktiverat." },
];

const SECRET_PATTERNS: [RegExp, string][] = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[PRIVAT NYCKEL BORTTAGEN]"],
  [/("?(private_key|client_secret|refresh_token|access_token|api[_-]?key|password|secret)"?\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;]+)/gi, "$1[BORTTAGET]"],
  [/AIza[0-9A-Za-z_-]{30,}/g, "[API-NYCKEL BORTTAGEN]"],
  [/ya29\.[0-9A-Za-z_.-]{20,}/g, "[TOKEN BORTTAGEN]"],
  [/1\/\/[0-9A-Za-z_-]{30,}/g, "[TOKEN BORTTAGEN]"],
];

export function redact(text: string): { text: string; redactions: number } {
  let n = 0;
  let out = text;
  for (const [re, rep] of SECRET_PATTERNS) out = out.replace(re, (...m) => { n++; return rep.replace("$1", String(m[1] ?? "")); });
  return { text: out, redactions: n };
}

export const MAX_SCAN_BYTES = 2_000_000;

export function scanMerchantSource(files: { path: string; content: string }[]) {
  const findings: MerchantFinding[] = [];
  let redactions = 0;
  let bytes = 0;
  for (const f of files) {
    bytes += f.content.length;
    if (bytes > MAX_SCAN_BYTES) throw new Error("För mycket text – max 2 MB per granskning.");
    const r = redact(f.content);
    redactions += r.redactions;
    r.text.split(/\r?\n/).forEach((line, i) => {
      for (const rule of MERCHANT_RULES) if (rule.re.test(line)) findings.push({ ruleId: rule.id, severity: rule.severity, title: rule.title, merchantApi: rule.merchantApi, action: rule.action, file: f.path, line: i + 1, excerpt: line.trim().slice(0, 160) });
    });
  }
  const byRule = new Map<string, { rule: Rule; count: number; locations: string[] }>();
  for (const f of findings) {
    const rule = MERCHANT_RULES.find((r) => r.id === f.ruleId)!;
    const e = byRule.get(f.ruleId) ?? { rule, count: 0, locations: [] };
    e.count++; if (e.locations.length < 10) e.locations.push(`${f.file}:${f.line}`);
    byRule.set(f.ruleId, e);
  }
  const mustFix = findings.filter((f) => f.severity === "måste-åtgärdas").length;
  return {
    findings,
    checklist: [...byRule.values()],
    redactions,
    status: findings.length === 0 ? "inga-kända-mönster" as const : mustFix ? "migrering-krävs" as const : "kontrollera" as const,
    nextSteps: [
      "Registrera GCP-projektet för Merchant API och aktivera API:et i Google Cloud.",
      "Skapa eller identifiera API-datakälla innan produkter skrivs via productInputs.",
      "Migrera ett delAPI i taget bakom en flagga och jämför resultat mot Content API så länge det svarar.",
      "Verifiera live med OAuth mot ert Merchant Center-konto: läs produkter, status och kontoproblem efter bytet.",
    ],
    disclaimer: "Statisk textgranskning. Den kan missa dynamiska anrop och bevisar inte att en migration är genomförd – det kräver OAuth-åtkomst och live-verifiering mot Merchant Center.",
  };
}
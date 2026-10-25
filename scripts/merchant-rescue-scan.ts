#!/usr/bin/env bun
// Aurora Merchant Rescue CLI: bun scripts/merchant-rescue-scan.ts <repo-dir> [--json]
// Läser endast lokala textfiler, hoppar över beroenden/byggutdata och skriver aldrig hemligheter (maskeras).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { scanMerchantSource } from "../src/lib/merchantRescue";

const root = process.argv[2];
if (!root) { console.error("Användning: bun scripts/merchant-rescue-scan.ts <katalog> [--json]"); process.exit(2); }
const SKIP = new Set(["node_modules", ".git", "dist", "build", "vendor", ".next", "coverage", "__pycache__", ".venv"]);
const EXT = new Set([".py", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".java", ".kt", ".cs", ".php", ".rb", ".go", ".json", ".yml", ".yaml", ".xml", ".properties", ".gradle"]);
const files: { path: string; content: string }[] = [];
let total = 0;
(function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || files.length >= 5000) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (EXT.has(extname(name)) && st.size < 500_000 && total + st.size < 2_000_000) { total += st.size; files.push({ path: relative(root, full), content: readFileSync(full, "utf8") }); }
  }
})(root);
const r = scanMerchantSource(files);
if (process.argv.includes("--json")) console.log(JSON.stringify({ status: r.status, redactions: r.redactions, checklist: r.checklist.map((c) => ({ id: c.rule.id, severity: c.rule.severity, title: c.rule.title, merchantApi: c.rule.merchantApi, action: c.rule.action, count: c.count, locations: c.locations })), nextSteps: r.nextSteps, disclaimer: r.disclaimer }, null, 2));
else {
  console.log(`Granskade ${files.length} filer. Status: ${r.status}`);
  if (r.redactions) console.log(`⚠ ${r.redactions} möjliga hemligheter maskerades – rotera dem om de ligger i repot.`);
  for (const c of r.checklist) console.log(`\n[${c.rule.severity}] ${c.rule.title} (${c.count}×)\n  → ${c.rule.merchantApi}\n  ${c.rule.action}\n  ${c.locations.join(", ")}`);
  console.log(`\nNästa steg:\n${r.nextSteps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\n\n${r.disclaimer}`);
}
process.exit(r.status === "migrering-krävs" ? 1 : 0);
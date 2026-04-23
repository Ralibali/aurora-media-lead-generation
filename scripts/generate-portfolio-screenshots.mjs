#!/usr/bin/env node
/**
 * Portfolio screenshot generator.
 *
 * For every PORTFOLIO item, loads item.url with Playwright and writes a
 * 1280×800 webp screenshot to /public/portfolio/{slug}.webp.
 *
 * Idempotent: skips items that already have a screenshot file on disk.
 *
 * Usage:
 *   npm install -D playwright
 *   npx playwright install chromium
 *   node scripts/generate-portfolio-screenshots.mjs
 */

import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outDir = resolve(projectRoot, "public/portfolio");

// Lazy-import so the script can give a friendly error if Playwright isn't installed.
let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (err) {
  console.error(
    "[screenshots] Playwright is not installed. Run:\n  npm install -D playwright\n  npx playwright install chromium\n",
  );
  process.exit(1);
}

// Load the portfolio module via tsx-less workaround: read TS source as text and
// rely on a pre-built JSON if present, otherwise dynamically transpile via tsx.
// The simplest portable path: dynamically import the .ts file with tsx if available.
async function loadPortfolio() {
  const tsPath = resolve(projectRoot, "src/data/portfolio.ts");
  try {
    // Prefer tsx (works without a build step)
    const tsx = await import("tsx/esm/api").catch(() => null);
    if (tsx && tsx.tsImport) {
      const mod = await tsx.tsImport(tsPath, import.meta.url);
      return mod.PORTFOLIO;
    }
  } catch {
    /* fall through */
  }
  // Fallback: try a naive regex-based extraction of slugs and urls.
  const fs = await import("node:fs/promises");
  const src = await fs.readFile(tsPath, "utf-8");
  const items = [];
  const re =
    /slug:\s*"([^"]+)"[\s\S]*?url:\s*"(https?:\/\/[^"]+)"/g;
  let m;
  while ((m = re.exec(src))) {
    items.push({ slug: m[1], url: m[2] });
  }
  return items;
}

const portfolio = await loadPortfolio();
if (!portfolio?.length) {
  console.error("[screenshots] No portfolio items found.");
  process.exit(1);
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 AuroraMedia-PortfolioBot",
});

const results = [];

for (const item of portfolio) {
  const outFile = resolve(outDir, `${item.slug}.webp`);
  if (existsSync(outFile)) {
    results.push({ slug: item.slug, status: "skipped" });
    console.log(`[skip]  ${item.slug} (already exists)`);
    continue;
  }
  if (!item.url) {
    results.push({ slug: item.slug, status: "no-url" });
    console.log(`[warn]  ${item.slug} (no url)`);
    continue;
  }
  const page = await ctx.newPage();
  try {
    await page.goto(item.url, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForTimeout(1500); // let webfonts/animations settle
    await page.screenshot({
      path: outFile,
      type: "webp",
      quality: 85,
      fullPage: false,
    });
    results.push({ slug: item.slug, status: "ok" });
    console.log(`[ok]    ${item.slug} → public/portfolio/${item.slug}.webp`);
  } catch (err) {
    results.push({ slug: item.slug, status: "error", error: String(err) });
    console.log(`[error] ${item.slug}: ${err?.message ?? err}`);
  } finally {
    await page.close();
  }
}

await ctx.close();
await browser.close();

const ok = results.filter((r) => r.status === "ok").length;
const skipped = results.filter((r) => r.status === "skipped").length;
const failed = results.filter((r) => r.status === "error").length;
console.log(`\n[done] ok=${ok} skipped=${skipped} failed=${failed}`);

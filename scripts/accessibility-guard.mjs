import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "config", "accessibility-sites.json");
const OUT_ROOT = path.join(ROOT, "artifacts", "accessibility");
const AXE_URL = "https://cdn.jsdelivr.net/npm/axe-core@4.13.0/axe.min.js";
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
const MAX_PAGES_PER_SITE = 8;
const MAX_NODES_PER_VIOLATION = 8;

function safeId(value) {
  return String(value || "site").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "site";
}

function validatePublicUrl(raw) {
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http/https URLs are supported.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host === "::1" || host.endsWith(".local") || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) {
    throw new Error("Private/local targets are not allowed.");
  }
  return url;
}

async function loadTargets() {
  const manual = process.env.A11Y_URL?.trim();
  if (manual) {
    const parsed = validatePublicUrl(manual);
    return [{
      id: "manual",
      name: `Manual scan: ${parsed.hostname}`,
      baseUrl: parsed.origin,
      paths: [`${parsed.pathname}${parsed.search}` || "/"],
    }];
  }
  const raw = await fs.readFile(CONFIG_PATH, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("config/accessibility-sites.json must contain an array.");
  return parsed;
}

async function fetchAxeSource() {
  const response = await fetch(AXE_URL);
  if (!response.ok) throw new Error(`Could not load axe-core (${response.status}).`);
  return response.text();
}

function summarizeViolation(violation) {
  return {
    id: violation.id,
    impact: violation.impact || "unknown",
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    tags: violation.tags,
    nodes: (violation.nodes || []).slice(0, MAX_NODES_PER_VIOLATION).map((node) => ({
      target: node.target,
      html: node.html,
      failureSummary: node.failureSummary,
    })),
    nodeCount: (violation.nodes || []).length,
  };
}

function countImpacts(violations) {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0, unknown: 0 };
  for (const violation of violations) {
    const impact = violation.impact && Object.hasOwn(counts, violation.impact) ? violation.impact : "unknown";
    counts[impact] += (violation.nodes || []).length || 1;
  }
  return counts;
}

async function scanPage(browser, axeSource, url) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const startedAt = new Date().toISOString();
  try {
    await page.addInitScript({ content: axeSource });
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(750);
    const result = await page.evaluate(async (tags) => {
      if (!window.axe) throw new Error("axe-core was not injected.");
      return window.axe.run(document, { runOnly: { type: "tag", values: tags } });
    }, TAGS);
    const violations = result.violations || [];
    return {
      url,
      startedAt,
      status: response?.status() ?? null,
      title: await page.title(),
      counts: countImpacts(violations),
      violationCount: violations.length,
      incompleteCount: (result.incomplete || []).length,
      passesCount: (result.passes || []).length,
      violations: violations.map(summarizeViolation),
    };
  } catch (error) {
    return {
      url,
      startedAt,
      status: null,
      title: null,
      counts: { critical: 0, serious: 0, moderate: 0, minor: 0, unknown: 0 },
      violationCount: 0,
      incompleteCount: 0,
      passesCount: 0,
      violations: [],
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await page.close();
  }
}

function markdownReport(report) {
  const lines = [
    "# Aurora Accessibility Guard",
    "",
    `Körd: ${report.generatedAt}`,
    `WCAG-taggar: ${report.tags.join(", ")}`,
    "",
  ];
  for (const site of report.sites) {
    lines.push(`## ${site.name}`, "");
    lines.push("| Sida | Kritiska | Allvarliga | Måttliga | Mindre | Status |");
    lines.push("| --- | ---: | ---: | ---: | ---: | --- |");
    for (const page of site.pages) {
      lines.push(`| ${page.url} | ${page.counts.critical} | ${page.counts.serious} | ${page.counts.moderate} | ${page.counts.minor} | ${page.error ? "FEL" : page.status ?? "—"} |`);
    }
    lines.push("");
    const critical = site.pages.reduce((sum, page) => sum + page.counts.critical, 0);
    const serious = site.pages.reduce((sum, page) => sum + page.counts.serious, 0);
    lines.push(`**Prioritet:** ${critical} kritiska och ${serious} allvarliga nodfynd. Automatisk scanning ersätter inte manuell WCAG-granskning.`, "");
  }
  return lines.join("\n");
}

const targets = await loadTargets();
const axeSource = await fetchAxeSource();
const browser = await chromium.launch({ headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  axeVersion: "4.13.0",
  tags: TAGS,
  sites: [],
};

try {
  for (const target of targets) {
    const base = validatePublicUrl(target.baseUrl);
    const paths = Array.isArray(target.paths) && target.paths.length ? target.paths.slice(0, MAX_PAGES_PER_SITE) : ["/"];
    const pages = [];
    for (const entry of paths) {
      const url = new URL(entry, base).toString();
      process.stdout.write(`Scanning ${url} ...\n`);
      pages.push(await scanPage(browser, axeSource, url));
    }
    report.sites.push({
      id: safeId(target.id || target.name || base.hostname),
      name: target.name || base.hostname,
      baseUrl: base.toString(),
      pages,
    });
  }
} finally {
  await browser.close();
}

const stamp = report.generatedAt.replace(/[:.]/g, "-");
const outDir = path.join(OUT_ROOT, stamp);
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2) + "\n");
await fs.writeFile(path.join(outDir, "summary.md"), markdownReport(report) + "\n");

const totals = report.sites.flatMap((site) => site.pages).reduce(
  (acc, page) => {
    acc.critical += page.counts.critical;
    acc.serious += page.counts.serious;
    acc.errors += page.error ? 1 : 0;
    return acc;
  },
  { critical: 0, serious: 0, errors: 0 },
);

process.stdout.write(`Accessibility Guard complete: ${totals.critical} critical, ${totals.serious} serious, ${totals.errors} scan errors.\n`);
process.stdout.write(`Report: ${path.relative(ROOT, outDir)}\n`);

if (process.env.GITHUB_STEP_SUMMARY) {
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, markdownReport(report) + "\n");
}
if (totals.errors > 0) {
  process.stderr.write(`Accessibility Guard failed to scan ${totals.errors} page(s).\n`);
  process.exitCode = 1;
}
if (process.env.A11Y_FAIL_ON_CRITICAL === "true" && totals.critical > 0) {
  process.exitCode = 1;
}

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const reportPath = process.argv[2];
if (!repo || !token || !reportPath) throw new Error("Missing GitHub context or report path.");

const report = JSON.parse(await fs.readFile(path.resolve(reportPath), "utf8"));
const api = "https://api.github.com";
const headers = { Accept: "application/vnd.github+json", Authorization: "Bearer " + token, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "aurora-accessibility-guard" };

async function request(url, init = {}) {
  const response = await fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  if (!response.ok) throw new Error("GitHub API " + response.status + ": " + await response.text());
  return response.status === 204 ? null : response.json();
}
async function ensureLabel(name, color, description) {
  const response = await fetch(api + "/repos/" + repo + "/labels/" + encodeURIComponent(name), { headers });
  if (response.ok) return;
  if (response.status !== 404) throw new Error("Could not inspect label " + name);
  await request(api + "/repos/" + repo + "/labels", { method: "POST", body: JSON.stringify({ name, color, description }), headers: { "Content-Type": "application/json" } });
}

const managedLabel = "accessibility-guard";
const impactLabels = { critical: "a11y:critical", serious: "a11y:serious", moderate: "a11y:moderate", minor: "a11y:minor", unknown: "a11y:unknown" };
await ensureLabel(managedLabel, "5319E7", "Managed by Aurora Accessibility Guard");
await ensureLabel("aurora-care", "0E8A16", "Aurora Care remediation queue");
await ensureLabel("a11y:critical", "B60205", "Critical accessibility finding");
await ensureLabel("a11y:serious", "D93F0B", "Serious accessibility finding");
await ensureLabel("a11y:moderate", "FBCA04", "Moderate accessibility finding");
await ensureLabel("a11y:minor", "C5DEF5", "Minor accessibility finding");
await ensureLabel("a11y:unknown", "D4C5F9", "Accessibility finding without impact classification");

const existing = await request(api + "/repos/" + repo + "/issues?state=open&labels=" + encodeURIComponent(managedLabel) + "&per_page=100");
const byKey = new Map();
for (const issue of existing) {
  const match = issue.body && issue.body.match(/<!-- a11y-key:([^>]+) -->/);
  if (match) byKey.set(match[1], issue);
}

const activeKeys = new Set();
const findings = [];
for (const site of report.sites || []) for (const page of site.pages || []) for (const violation of page.violations || []) {
  const impact = violation.impact || "unknown";
  const key = site.id + "|" + page.url + "|" + violation.id;
  activeKeys.add(key);
  findings.push({ site, page, violation, impact, key });
}

for (const item of findings) {
  const { site, page, violation, impact, key } = item;
  const title = ("[A11Y][" + impact.toUpperCase() + "] " + site.name + ": " + violation.help).slice(0, 240);
  const examples = (violation.nodes || []).map((node, index) => {
    const selector = Array.isArray(node.target) ? node.target.join(" ") : String(node.target || "—");
    return "### Exempel " + (index + 1) + "\n- Selector: `" + selector.replaceAll("`", "'") + "`\n- Problem: " + (node.failureSummary || "Se axe-fynd") + "\n- HTML: ```html\n" + String(node.html || "").slice(0, 1000) + "\n```";
  }).join("\n\n");
  const body = [
    "<!-- a11y-key:" + key + " -->", "## Aurora Care · Accessibility", "",
    "**Kund/sajt:** " + site.name, "**Sida:** " + page.url, "**Prioritet:** " + impact,
    "**Regel:** " + violation.id, "**Berörda noder:** " + violation.nodeCount, "",
    violation.description || "", "", "Åtgärdsguide: " + (violation.helpUrl || "saknas"), "",
    examples, "", "Senast verifierad av Guard: " + report.generatedAt, "",
    "_Automatiskt fynd. Verifiera manuellt före och efter åtgärd._"
  ].join("\n");
  const labels = [managedLabel, "aurora-care", impactLabels[impact] || impactLabels.unknown];
  const current = byKey.get(key);
  const endpoint = current ? api + "/repos/" + repo + "/issues/" + current.number : api + "/repos/" + repo + "/issues";
  await request(endpoint, { method: current ? "PATCH" : "POST", body: JSON.stringify({ title, body, labels }), headers: { "Content-Type": "application/json" } });
}

for (const [key, issue] of byKey) if (!activeKeys.has(key)) {
  await request(api + "/repos/" + repo + "/issues/" + issue.number, { method: "PATCH", body: JSON.stringify({ state: "closed", state_reason: "completed" }), headers: { "Content-Type": "application/json" } });
}
process.stdout.write("Aurora Care queue synced: " + findings.length + " active violation groups.\n");

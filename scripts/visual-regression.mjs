#!/usr/bin/env node
/**
 * Visual regression / token drift check.
 *
 * Scannar en lista av rutter i mobil och desktop och flaggar element som
 * använder färger utanför verkstad-paletten:
 *   - Mint-eyebrows (ljust mintgrönt utanför tillåtna --gran / --gran-soft / caret)
 *   - Créme/beige text på ljus bakgrund (låg kontrast)
 *
 * Skapar screenshots + rapport i .visual-regression/.
 *
 * Kör:  node scripts/visual-regression.mjs
 * Env:  BASE_URL (default http://localhost:8080)
 */
import { chromium } from "playwright";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:8080";
const OUT = path.resolve(".visual-regression");

const ROUTES = [
  "/",
  "/priser",
  "/tjanster",
  "/tjanster/webbdesign",
  "/tjanster/seo",
  "/tjanster/ai-automation",
  "/ai-karta",
  "/arbete",
  "/om",
  "/kontakt",
  "/integritetspolicy",
  "/redaktionell-policy",
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 1800 },
];

// Tillåtna färger (verkstad-tokens). Alla annan grön/beige på ljus bg flaggas.
const ALLOWED = new Set([
  "#f6f5f1", "#ebe9e3", "#14171a", "#4a5058", "#0f5132", "#e4eee8",
  "#e8500a", "#c64308", "#d8d5cc", "#3e444b", "#7fe3b0", "#0f1215",
  "#edece5", "#ffffff", "#000000",
]);

function rgbToHex(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  const [r, g, b] = [+m[1], +m[2], +m[3]];
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

function rgbParts(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? [+m[1], +m[2], +m[3]] : null;
}

function relLum([r, g, b]) {
  const s = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
}
function contrast(a, b) {
  const [la, lb] = [relLum(a), relLum(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Klassar en färg som "mint" om den är ljus/mättad grön utanför allowed.
function isMint([r, g, b]) {
  if (g <= Math.max(r, b) + 15) return false;   // måste luta grönt
  if (g < 150) return false;                     // ljust
  if (Math.min(r, g, b) < 80 && r < 120 && b < 180) return true; // #7FE3B0 t.ex.
  // Klassiska tailwind mint: #A7F3D0, #6EE7B7, #86EFAC, #34D399, #10B981, #4ADE80, #BBF7D0
  if (r >= 100 && r <= 220 && g >= 200 && b >= 130 && b <= 230) return true;
  if (r < 80 && g > 180 && b > 100 && b < 200) return true;
  return false;
}

// Klassar en färg som beige/cream (ljus, gulaktig).
function isCream([r, g, b]) {
  if (r < 220 || g < 210) return false;
  if (b > g) return false;                        // varmt
  if (b > 220) return false;                      // inte vit
  return (r - b) >= 15;
}

function isLightBg([r, g, b]) {
  return (r + g + b) / 3 > 220;
}

async function auditPage(page) {
  return page.evaluate(() => {
    const findings = [];
    const nodes = document.querySelectorAll(
      "body, body *:not(script):not(style):not(svg):not(path)"
    );
    // Effektiv bakgrund: gå uppåt tills icke-transparent
    const effectiveBg = (el) => {
      let cur = el;
      while (cur && cur !== document.documentElement) {
        const bg = getComputedStyle(cur).backgroundColor;
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
        if (m) {
          const a = m[4] === undefined ? 1 : parseFloat(m[4]);
          if (a > 0.5) return bg;
        }
        cur = cur.parentElement;
      }
      return "rgb(255,255,255)";
    };
    for (const el of nodes) {
      const text = (el.textContent || "").trim();
      if (!text || text.length > 400) continue;
      // Endast noder med egen text-node (bladlika för text)
      const hasOwnText = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 0
      );
      if (!hasOwnText) continue;
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 0.1) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) continue;
      const color = cs.color;
      const bg = effectiveBg(el);
      const cls = el.className && typeof el.className === "string" ? el.className : "";
      findings.push({
        tag: el.tagName.toLowerCase(),
        cls: cls.slice(0, 120),
        text: text.slice(0, 60),
        color,
        bg,
        y: Math.round(rect.top + window.scrollY),
      });
    }
    return findings;
  });
}

async function run() {
  if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const launchOpts = {};
  if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launchOpts);
  const report = [];
  let totalFindings = 0;

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      const url = BASE + route;
      const routeSlug = (route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, ""));
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(1500);
        const shotPath = path.join(OUT, `${routeSlug}.${vp.name}.png`);
        await page.screenshot({ path: shotPath, fullPage: true });
        const nodes = await auditPage(page);
        const flags = [];
        for (const n of nodes) {
          const c = rgbParts(n.color);
          const b = rgbParts(n.bg);
          if (!c || !b) continue;
          const hex = "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
          if (ALLOWED.has(hex)) {
            // fortfarande kolla kontrast om det är gråmuted på beige
          }
          const lightBg = isLightBg(b);
          const cr = contrast(c, b);
          const reasons = [];
          if (isMint(c) && !ALLOWED.has(hex)) reasons.push("mint-color");
          if (lightBg && isCream(c)) reasons.push("cream-on-light");
          if (lightBg && cr < 4.5 && n.text.length > 1) reasons.push(`low-contrast(${cr.toFixed(2)})`);
          if (reasons.length) {
            flags.push({ ...n, hex, contrast: +cr.toFixed(2), reasons });
          }
        }
        totalFindings += flags.length;
        report.push({ route, viewport: vp.name, screenshot: path.relative(process.cwd(), shotPath), flags });
        const tag = flags.length ? `FLAG(${flags.length})` : "ok";
        console.log(`[${vp.name}] ${route.padEnd(32)} ${tag}`);
      } catch (err) {
        console.log(`[${vp.name}] ${route} ERROR ${err.message}`);
        report.push({ route, viewport: vp.name, error: err.message });
      }
    }
    await ctx.close();
  }
  await browser.close();

  const jsonPath = path.join(OUT, "report.json");
  await writeFile(jsonPath, JSON.stringify(report, null, 2));

  const md = ["# Visual regression – token drift", "", `Base: ${BASE}`, ""];
  for (const r of report) {
    if (r.error) { md.push(`- **${r.viewport}** ${r.route} — ERROR ${r.error}`); continue; }
    if (!r.flags.length) { md.push(`- **${r.viewport}** ${r.route} — ok`); continue; }
    md.push(`- **${r.viewport}** ${r.route} — ${r.flags.length} avvikelser`);
    for (const f of r.flags.slice(0, 12)) {
      md.push(`  - \`${f.tag}.${f.cls.split(/\s+/)[0] || ""}\` ${f.hex} (${f.reasons.join(", ")}) – "${f.text}"`);
    }
  }
  await writeFile(path.join(OUT, "report.md"), md.join("\n"));
  console.log(`\nTotalt ${totalFindings} avvikelser. Rapport: ${jsonPath}`);
  if (totalFindings > 0 && process.env.CI) process.exit(1);
}

run().catch((e) => { console.error(e); process.exit(2); });

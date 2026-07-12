#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");

async function findHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await findHtmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(fullPath);
  }

  return files;
}

function replaceHiddenFallback(html) {
  const marker = '<div id="seo-content"';
  const root = '<div id="root"></div>';
  const start = html.indexOf(marker);
  const rootStart = html.indexOf(root, start);

  if (start === -1 || rootStart === -1) return { html, changed: false };

  const openEnd = html.indexOf(">", start);
  const closeStart = html.lastIndexOf("</div>", rootStart);
  if (openEnd === -1 || closeStart === -1 || closeStart < openEnd) {
    throw new Error("Kunde inte tolka seo-content-blocket i genererad HTML.");
  }

  const content = html.slice(openEnd + 1, closeStart).trim();
  const replacement = `    <noscript id="seo-content">\n      ${content}\n    </noscript>\n    ${root}`;
  const afterRoot = rootStart + root.length;

  return {
    html: `${html.slice(0, start)}${replacement}${html.slice(afterRoot)}`,
    changed: true,
  };
}

async function main() {
  const files = await findHtmlFiles(DIST_DIR);
  let changed = 0;

  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    const result = replaceHiddenFallback(source);
    if (!result.changed) continue;
    await fs.writeFile(file, result.html, "utf8");
    changed += 1;
  }

  console.log(`Converted ${changed} hidden SEO fallbacks to noscript fallbacks.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

#!/usr/bin/env bun
// Aurora AppLaunch CLI: bun scripts/applaunch-check.ts <capacitor-projekt> [--json]
// Läser endast kända konfigfiler (inget crawlande). Exit 1 om blockerare finns.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { checkAppLaunch, type LaunchFiles } from "../src/lib/appLaunch";

const root = process.argv[2];
if (!root) { console.error("Användning: bun scripts/applaunch-check.ts <projektkatalog> [--json]"); process.exit(2); }
const read = (...cands: string[]) => { for (const c of cands) { const p = join(root, c); if (existsSync(p)) return readFileSync(p, "utf8"); } return undefined; };
const shotDirs = ["fastlane/screenshots", "fastlane/metadata/android", "ios/App/fastlane/screenshots"].map((d) => join(root, d));
const files: LaunchFiles = {
  capacitorConfig: read("capacitor.config.ts", "capacitor.config.json", "capacitor.config.js"),
  packageJson: read("package.json"),
  buildGradle: read("android/app/build.gradle", "android/app/build.gradle.kts"),
  infoPlist: read("ios/App/App/Info.plist"),
  privacyManifest: read("ios/App/App/PrivacyInfo.xcprivacy"),
  fastfile: read("fastlane/Fastfile", "ios/App/fastlane/Fastfile"),
  appfile: read("fastlane/Appfile", "ios/App/fastlane/Appfile"),
  hasScreenshots: shotDirs.some((d) => existsSync(d) && readdirSync(d).length > 0),
};
const items = checkAppLaunch(files);
if (process.argv.includes("--json")) console.log(JSON.stringify(items, null, 2));
else for (const i of items) console.log(`[${i.level}] ${i.area}: ${i.title}\n  ${i.detail}`);
process.exit(items.some((i) => i.level === "blockerare") ? 1 : 0);

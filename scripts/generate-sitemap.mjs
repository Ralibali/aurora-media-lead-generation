#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC_DIR = resolve(ROOT, "public");
const SITE_URL = "https://auroramedia.se";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/ai-byra-linkoping", changefreq: "weekly", priority: "0.95" },
  { path: "/ai-konsult-sverige", changefreq: "weekly", priority: "0.95" },
  { path: "/ai-automation-foretag", changefreq: "weekly", priority: "0.95" },
  { path: "/ai-karta", changefreq: "weekly", priority: "0.9" },
  { path: "/grok-bot", changefreq: "weekly", priority: "0.9" },
  { path: "/ai-snabbanalys", changefreq: "monthly", priority: "0.7" },
  { path: "/tjanster", changefreq: "weekly", priority: "0.9" },
  { path: "/tjanster/hemsidor", changefreq: "monthly", priority: "0.85" },
  { path: "/tjanster/ehandel", changefreq: "monthly", priority: "0.85" },
  { path: "/tjanster/mobilapp", changefreq: "monthly", priority: "0.85" },
  { path: "/tjanster/seo", changefreq: "monthly", priority: "0.85" },
  { path: "/tjanster/google-ads", changefreq: "monthly", priority: "0.8" },
  { path: "/tjanster/meta-ads", changefreq: "monthly", priority: "0.8" },
  { path: "/tjanster/content", changefreq: "monthly", priority: "0.8" },
  { path: "/tjanster/grafisk-profil", changefreq: "monthly", priority: "0.75" },
  { path: "/tjanster/fotografering", changefreq: "monthly", priority: "0.75" },
  { path: "/arbete", changefreq: "monthly", priority: "0.85" },
  { path: "/oppna-siffror", changefreq: "monthly", priority: "0.7" },
  { path: "/produkter", changefreq: "monthly", priority: "0.8" },
  { path: "/process", changefreq: "monthly", priority: "0.8" },
  { path: "/priser", changefreq: "monthly", priority: "0.85" },
  { path: "/om", changefreq: "monthly", priority: "0.75" },
  { path: "/kontakt", changefreq: "monthly", priority: "0.8" },
  { path: "/blogg", changefreq: "weekly", priority: "0.9" },
  { path: "/verktyg", changefreq: "monthly", priority: "0.85" },
  { path: "/verktyg/ai-roi-kalkylator", changefreq: "monthly", priority: "0.8" },
  { path: "/verktyg/app-prisraknare", changefreq: "monthly", priority: "0.8" },
  { path: "/verktyg/seo-kalkylator", changefreq: "monthly", priority: "0.8" },
  { path: "/verktyg/ai-mognadsanalys", changefreq: "monthly", priority: "0.8" },
  { path: "/verktyg/personalkostnad-vs-ai", changefreq: "monthly", priority: "0.8" },
  { path: "/verktyg/prompt-generator", changefreq: "monthly", priority: "0.8" },
  { path: "/metodik", changefreq: "monthly", priority: "0.75" },
  { path: "/webbyra-linkoping", changefreq: "monthly", priority: "0.9" },
  { path: "/digital-marknadsforing-linkoping", changefreq: "weekly", priority: "0.9" },
  { path: "/seo-byra-linkoping", changefreq: "weekly", priority: "0.9" },
  { path: "/ai-automation-linkoping", changefreq: "weekly", priority: "0.9" },
  { path: "/ai-konsult-linkoping", changefreq: "weekly", priority: "0.9" },
  { path: "/google-ads-linkoping", changefreq: "weekly", priority: "0.9" },
  { path: "/apputveckling-linkoping", changefreq: "weekly", priority: "0.9" },
  { path: "/en", changefreq: "monthly", priority: "0.65" },
  { path: "/redaktionell-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/integritetspolicy", changefreq: "yearly", priority: "0.3" },
  { path: "/villkor", changefreq: "yearly", priority: "0.4" },
  { path: "/angra-kop", changefreq: "yearly", priority: "0.5" },
];

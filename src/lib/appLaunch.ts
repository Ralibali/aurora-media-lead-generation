// Aurora AppLaunch – release-readiness för Capacitor/Fastlane-projekt.
// Läser bara angivna konfigfiler (webbläsare eller CLI). Ersätter inte mänsklig QA eller App Review.

export type LaunchLevel = "blockerare" | "risk" | "ok" | "manuell";
export type LaunchItem = { id: string; area: string; level: LaunchLevel; title: string; detail: string };
export type LaunchFiles = Partial<Record<"capacitorConfig" | "packageJson" | "buildGradle" | "infoPlist" | "fastfile" | "appfile" | "privacyManifest", string>> & { hasScreenshots?: boolean };

const NATIVE_PLUGIN = /^@capacitor\/(camera|geolocation|push-notifications|local-notifications|haptics|filesystem|share|barcode-scanner|preferences|app|network|motion|device)|^@capacitor-community\/|^@capawesome\//;
const PLUGIN_USAGE: Record<string, string[]> = {
  "@capacitor/camera": ["NSCameraUsageDescription", "NSPhotoLibraryUsageDescription"],
  "@capacitor/geolocation": ["NSLocationWhenInUseUsageDescription"],
  "@capacitor-community/barcode-scanner": ["NSCameraUsageDescription"],
};

function pick(src: string | undefined, re: RegExp) { return src?.match(re)?.[1]?.trim(); }

export function checkAppLaunch(files: LaunchFiles): LaunchItem[] {
  const out: LaunchItem[] = [];
  const add = (i: LaunchItem) => out.push(i);
  const cap = files.capacitorConfig;
  const appId = pick(cap, /appId['"]?\s*[:=]\s*['"]([^'"]+)['"]/);
  if (!cap) add({ id: "cap-missing", area: "App-ID", level: "blockerare", title: "capacitor.config saknas", detail: "Klistra in capacitor.config.ts/json för att kontrollera app-ID och webbinnehåll." });
  else if (!appId) add({ id: "appid-missing", area: "App-ID", level: "blockerare", title: "appId saknas", detail: "Ange ett unikt reverse-DNS-ID, t.ex. se.foretag.app." });
  else if (/^(com\.example|io\.ionic\.starter|com\.capacitorjs)/.test(appId) || !/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(appId)) add({ id: "appid-placeholder", area: "App-ID", level: "blockerare", title: `appId "${appId}" är exempel eller ogiltigt`, detail: "App-ID kan inte ändras efter första publicering. Välj ett ID under en domän ni äger." });
  else add({ id: "appid-ok", area: "App-ID", level: "ok", title: `appId ${appId}`, detail: "Formatet ser giltigt ut. Kontrollera att samma ID är registrerat i App Store Connect och Play Console." });

  const serverUrl = pick(cap, /server\s*[:=]\s*\{[^}]*url['"]?\s*[:=]\s*['"]([^'"]+)['"]/s);
  if (serverUrl) add({ id: "remote-url", area: "Apple 4.2", level: "blockerare", title: "Appen laddar en fjärrwebbplats (server.url)", detail: `server.url = ${serverUrl}. En app som främst visar en webbplats riskerar avslag enligt App Store Review Guideline 4.2 (minimal funktionalitet). Bygg in webbtillgångarna och ta bort server.url i release.` });
  if (/cleartext['"]?\s*[:=]\s*true/.test(cap ?? "")) add({ id: "cleartext", area: "Säkerhet", level: "risk", title: "cleartext: true", detail: "Okrypterad HTTP tillåts. Stäng av i releasebygget." });

  let deps: string[] = [];
  if (files.packageJson) {
    try { const p = JSON.parse(files.packageJson); deps = Object.keys({ ...(p.dependencies ?? {}), ...(p.devDependencies ?? {}) }); }
    catch { add({ id: "pkg-invalid", area: "Beroenden", level: "risk", title: "package.json kunde inte läsas", detail: "Kontrollera att hela filen klistrats in." }); }
  }
  if (files.packageJson && deps.length) {
    const native = deps.filter((d) => NATIVE_PLUGIN.test(d));
    if (!deps.includes("@capacitor/core")) add({ id: "no-capacitor", area: "Beroenden", level: "risk", title: "@capacitor/core saknas", detail: "Projektet verkar inte vara ett Capacitor-projekt." });
    if (native.length === 0) add({ id: "low-native", area: "Apple 4.2", level: "risk", title: "Inga native-plugins hittades", detail: "Appen använder inga enhetsfunktioner. Visa tydligt app-specifikt värde (offline, notiser, kamera, widgets eller liknande) för att minska risken för avslag enligt 4.2." });
    else add({ id: "native-ok", area: "Apple 4.2", level: "ok", title: `${native.length} native-plugin(s)`, detail: native.join(", ") + ". Kontrollera att funktionerna faktiskt används i appens kärnflöde." });
    for (const [plugin, keys] of Object.entries(PLUGIN_USAGE)) if (deps.includes(plugin)) for (const key of keys) {
      if (files.infoPlist && !files.infoPlist.includes(key)) add({ id: `usage-${key}`, area: "Behörigheter", level: "blockerare", title: `${key} saknas`, detail: `${plugin} kräver en användartext i Info.plist som förklarar varför behörigheten behövs.` });
    }
  }

  const g = files.buildGradle;
  if (g) {
    const appIdGradle = pick(g, /applicationId\s*[=\s]\s*["']([^"']+)["']/);
    if (appId && appIdGradle && appIdGradle !== appId) add({ id: "android-id-mismatch", area: "App-ID", level: "risk", title: "applicationId skiljer sig från appId", detail: `Android: ${appIdGradle}, Capacitor: ${appId}.` });
    const target = Number(pick(g, /targetSdk(?:Version)?\s*[=\s]\s*(\d+)/));
    if (target && target < 35) add({ id: "target-sdk", area: "Google Play", level: "blockerare", title: `targetSdk ${target}`, detail: "Google Play kräver en aktuell target API-nivå för nya appar och uppdateringar (35 eller högre vid granskningstillfället). Kontrollera Play Consoles aktuella krav." });
    else if (!target) add({ id: "target-sdk-var", area: "Google Play", level: "manuell", title: "targetSdk sätts via variabel", detail: "Kontrollera värdet i variables.gradle mot Play Consoles krav." });
    if (!/signingConfigs[\s\S]*release/.test(g)) add({ id: "android-signing", area: "Signering", level: "risk", title: "Ingen release-signering i build.gradle", detail: "Kontrollera att uppladdningsnyckel och Play App Signing är konfigurerade." });
    if (/(storePassword|keyPassword)\s*[=\s]\s*["'][^"'$]+["']/.test(g)) add({ id: "android-secret", area: "Säkerhet", level: "blockerare", title: "Signeringslösenord i klartext", detail: "Flytta lösenord till miljövariabler eller CI-secrets och rotera dem om de har committats." });
  }

  const plist = files.infoPlist;
  if (plist) {
    if (!/ITSAppUsesNonExemptEncryption/.test(plist)) add({ id: "export-compliance", area: "App Store Connect", level: "manuell", title: "ITSAppUsesNonExemptEncryption saknas", detail: "Utan nyckeln får ni besvara exportfrågan vid varje uppladdning." });
    if (/NSAllowsArbitraryLoads<\/key>\s*<true\/>/.test(plist)) add({ id: "ats", area: "Säkerhet", level: "risk", title: "NSAllowsArbitraryLoads = true", detail: "Apple kräver motivering för undantag från App Transport Security." });
  }
  if (files.infoPlist !== undefined && !files.privacyManifest) add({ id: "privacy-manifest", area: "Integritet", level: "risk", title: "PrivacyInfo.xcprivacy ej angiven", detail: "Apple kräver integritetsmanifest för appar och vissa SDK:er som använder s.k. required reason API:er." });

  const ff = files.fastfile;
  if (ff) {
    if (/(password|api_key|key_content)\s*[:(]\s*["'][^"'#{]{8,}["']/.test(ff)) add({ id: "fastlane-secret", area: "Säkerhet", level: "blockerare", title: "Hemlighet i Fastfile", detail: "Använd App Store Connect API-nyckel via miljövariabel/CI-secret, aldrig i repot." });
    if (!/(upload_to_testflight|pilot|upload_to_play_store|supply)/.test(ff)) add({ id: "fastlane-upload", area: "Distribution", level: "manuell", title: "Ingen uppladdningslane hittad", detail: "Lägg till en lane för TestFlight/internt test innan produktion." });
    if (!/(match|sync_code_signing|get_certificates|cert\b)/.test(ff)) add({ id: "fastlane-signing", area: "Signering", level: "manuell", title: "iOS-signering hanteras inte i Fastfile", detail: "Kontrollera certifikat och provisioneringsprofiler (t.ex. match)." });
  }
  const appfileId = pick(files.appfile, /app_identifier\s*\(?\s*["']([^"']+)["']/);
  if (appId && appfileId && appfileId !== appId) add({ id: "appfile-mismatch", area: "App-ID", level: "risk", title: "Appfile app_identifier skiljer sig", detail: `Appfile: ${appfileId}, Capacitor: ${appId}.` });
  if (files.hasScreenshots === false) add({ id: "screenshots", area: "Butikssida", level: "manuell", title: "Inga butiksskärmbilder hittade", detail: "Skärmbilder i de storlekar butikerna kräver måste tas från riktiga byggen, inte mockups av en webbplats." });

  for (const [id, title, detail] of [
    ["qa-device", "Testa på riktiga enheter", "Minst en äldre och en ny iPhone samt en Android-enhet, inklusive offline och dåligt nät."],
    ["qa-review-account", "Demokonto till granskarna", "Om appen kräver inloggning: ange fungerande demokonto i App Review-informationen."],
    ["qa-privacy", "Integritetsetiketter och dataskydd", "App Privacy (Apple) och Data safety (Google) måste stämma med faktisk datainsamling, inklusive SDK:er."],
    ["qa-account-delete", "Radera konto i appen", "Appar med kontoskapande måste erbjuda kontoradering i appen."],
    ["qa-human", "Mänsklig slutgranskning", "En person går igenom kärnflödet, texterna och butiksmaterialet före inskick. Checklistan garanterar inte godkännande."],
  ] as const) add({ id, area: "Mänsklig QA", level: "manuell", title, detail });
  return out;
}

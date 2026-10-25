import { describe, expect, it } from "vitest";
import { checkAppLaunch } from "./appLaunch";

const ids = (r: ReturnType<typeof checkAppLaunch>, level: string) => r.filter((i) => i.level === level).map((i) => i.id);

describe("AppLaunch", () => {
  it("exempel-appId och server.url är blockerare (4.2)", () => {
    const r = checkAppLaunch({ capacitorConfig: "const c = { appId: 'com.example.app', server: { url: 'https://foretag.se' } }" });
    expect(ids(r, "blockerare")).toEqual(expect.arrayContaining(["appid-placeholder", "remote-url"]));
  });
  it("inga native-plugins ger 4.2-risk", () => {
    const r = checkAppLaunch({ capacitorConfig: "{ appId: 'se.foretag.app' }", packageJson: JSON.stringify({ dependencies: { "@capacitor/core": "6" } }) });
    expect(ids(r, "risk")).toContain("low-native");
  });
  it("kamera utan NSCameraUsageDescription blockerar", () => {
    const r = checkAppLaunch({ capacitorConfig: "{ appId: 'se.foretag.app' }", packageJson: JSON.stringify({ dependencies: { "@capacitor/core": "6", "@capacitor/camera": "6" } }), infoPlist: "<plist></plist>" });
    expect(ids(r, "blockerare")).toContain("usage-NSCameraUsageDescription");
  });
  it("gammal targetSdk och lösenord i klartext blockerar", () => {
    const r = checkAppLaunch({ capacitorConfig: "{ appId: 'se.foretag.app' }", buildGradle: 'targetSdkVersion 33\nsigningConfigs { release { storePassword "hemligt" } }' });
    expect(ids(r, "blockerare")).toEqual(expect.arrayContaining(["target-sdk", "android-secret"]));
  });
  it("innehåller alltid mänsklig QA", () => {
    expect(ids(checkAppLaunch({}), "manuell")).toContain("qa-human");
  });
});
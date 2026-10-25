import { useState } from "react";
import { checkAppLaunch, type LaunchFiles, type LaunchItem } from "@/lib/appLaunch";
import { trackEvent } from "@/lib/analytics";

const FIELDS: { key: keyof Omit<LaunchFiles, "hasScreenshots">; label: string }[] = [
  { key: "capacitorConfig", label: "capacitor.config.ts / .json" },
  { key: "packageJson", label: "package.json" },
  { key: "buildGradle", label: "android/app/build.gradle (valfritt)" },
  { key: "infoPlist", label: "ios/App/App/Info.plist (valfritt)" },
  { key: "fastfile", label: "fastlane/Fastfile (valfritt)" },
];
const COLOR: Record<LaunchItem["level"], string> = { blockerare: "#B4531A", risk: "#9A6B00", ok: "var(--gran)", manuell: "var(--granbark-mut)" };

export default function AppLaunchChecker() {
  const [files, setFiles] = useState<LaunchFiles>({});
  const [items, setItems] = useState<LaunchItem[] | null>(null);
  return (
    <div className="vk-panel" style={{ display: "grid", gap: 12 }}>
      {FIELDS.map((f) => (
        <label key={f.key} className="vk-field">
          <span className="vk-field-label">{f.label}</span>
          <textarea className="vk-textarea" rows={3} spellCheck={false} value={files[f.key] ?? ""} onChange={(e) => setFiles({ ...files, [f.key]: e.target.value || undefined })} />
        </label>
      ))}
      <p className="vk-field-hint" style={{ margin: 0 }}>Körs lokalt i webbläsaren. Klistra inte in nycklar eller lösenord – hittas sådana flaggas de.</p>
      <button type="button" className="vk-btn vk-btn-primary" style={{ minHeight: 44, justifySelf: "start" }} onClick={() => { const r = checkAppLaunch(files); setItems(r); trackEvent("applaunch_check", { blockers: r.filter((i) => i.level === "blockerare").length }); }}>Kontrollera release</button>
      {items && (
        <div aria-live="polite" style={{ display: "grid", gap: 8 }}>
          {items.map((i) => (
            <div key={i.id} style={{ borderLeft: `3px solid ${COLOR[i.level]}`, padding: "6px 12px" }}>
              <p style={{ margin: 0, fontWeight: 600 }}><span className="vk-mono" style={{ color: COLOR[i.level], marginRight: 8 }}>{i.area} · {i.level}</span>{i.title}</p>
              <p style={{ margin: "4px 0 0", fontSize: 14 }}>{i.detail}</p>
            </div>
          ))}
          <p className="vk-field-hint" style={{ margin: 0 }}>Checklistan minskar risken för avslag men garanterar inte godkännande i App Store eller Google Play.</p>
        </div>
      )}
    </div>
  );
}

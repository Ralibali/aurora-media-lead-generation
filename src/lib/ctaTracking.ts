import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "cta_session_id";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (crypto.randomUUID && crypto.randomUUID()) ||
        `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

export type CtaButton =
  | "lead_cta_wide"
  | "lead_cta_compact"
  | "lead_cta_mailto"
  | "contact_modal_submit";

export async function trackCtaClick(
  button: CtaButton,
  extra: { location?: string; lead_label?: string } = {}
): Promise<void> {
  try {
    await supabase.from("cta_clicks").insert({
      button,
      location: extra.location ?? null,
      lead_label: extra.lead_label ?? null,
      session_id: getSessionId(),
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    });
  } catch (err) {
    console.warn("[ctaTracking] failed", err);
  }
}

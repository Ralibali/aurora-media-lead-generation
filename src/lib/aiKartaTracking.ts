import { getSupabase } from "@/lib/getSupabase";

const SESSION_KEY = "aikarta_session_id";

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

export type AiKartaButton =
  | "landing_view"
  | "landing_primary_cta"
  | "landing_mid_cta"
  | "landing_final_cta"
  | "nav_cta"
  | "mobile_nav_cta"
  | "funnel_view"
  | "funnel_step_1_complete"
  | "funnel_step_2_complete"
  | "funnel_submit"
  | "funnel_success"
  | "funnel_error"
  | "hero_cta"
  | "pdf_direct"
  | "result_view"
  | "result_pdf_download"
  | "result_print_dialog_opened"
  | "result_resend_email"
  | "booking_open"
  | "booking_submit";

export async function trackAiKartaClick(button: AiKartaButton): Promise<void> {
  try {
    const supabase = await getSupabase();
    const pagePath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`.slice(0, 500)
        : null;

    await supabase.from("ai_karta_clicks").insert({
      button,
      session_id: getSessionId(),
      page_path: pagePath,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    });
  } catch (err) {
    console.warn("[aiKartaTracking] failed", err);
  }
}

export function getAiKartaSessionId(): string {
  return getSessionId();
}

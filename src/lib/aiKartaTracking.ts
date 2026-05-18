import { getSupabase } from "@/lib/getSupabase";

const SESSION_KEY = "aikarta_session_id";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

export type AiKartaButton =
  | "hero_cta"
  | "pdf_direct"
  | "result_pdf_download"
  | "result_print_dialog_opened"
  | "result_resend_email"
  | "booking_open"
  | "booking_submit";

export async function trackAiKartaClick(button: AiKartaButton): Promise<void> {
  try {
    const supabase = await getSupabase();
    await supabase.from("ai_karta_clicks").insert({
      button,
      session_id: getSessionId(),
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    });
  } catch (err) {
    console.warn("[aiKartaTracking] failed", err);
  }
}

export function getAiKartaSessionId(): string {
  return getSessionId();
}

import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "faq_session_id";

/** Anonym session-ID som lever under fliken (sessionStorage). */
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

type SearchEvent = {
  query: string;
  resultCount: number;
  openedQuestion?: string | null;
};

/**
 * Logga en FAQ-sökhändelse. Tyst fail — får aldrig krascha UI.
 */
export async function trackFaqSearch({ query, resultCount, openedQuestion }: SearchEvent) {
  if (!query.trim()) return;

  try {
    const payload = {
      query: query.trim().slice(0, 200),
      result_count: resultCount,
      opened_question: openedQuestion ?? null,
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      session_id: getSessionId(),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    };

    const { error } = await supabase.from("faq_search_events").insert(payload);
    if (error) {
      // Tyst i prod, synligt i dev
      if (import.meta.env.DEV) console.warn("[faqTracking] insert failed:", error);
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[faqTracking] unexpected error:", err);
  }
}

export type FaqCtaSource = "faq_footer" | "faq_search_result" | "faq_empty_state";

type CtaClickEvent = {
  source: FaqCtaSource;
  paket?: string | null;
  ctaLabel?: string | null;
  query?: string | null;
  category?: string | null;
  openedQuestion?: string | null;
};

/**
 * Logga ett klick på en FAQ-CTA-knapp. Tyst fail — får aldrig krascha UI.
 * Används för att analysera vilka servicesidor som driver flest leads från FAQ.
 */
export async function trackFaqCtaClick({
  source,
  paket,
  ctaLabel,
  query,
  category,
  openedQuestion,
}: CtaClickEvent) {
  try {
    const payload = {
      cta_source: source,
      paket: paket ?? null,
      cta_label: ctaLabel?.slice(0, 100) ?? null,
      query: query?.trim().slice(0, 200) || null,
      category: category ?? null,
      opened_question: openedQuestion?.slice(0, 300) ?? null,
      page_path: typeof window !== "undefined" ? window.location.pathname : null,
      session_id: getSessionId(),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
    };

    const { error } = await supabase.from("faq_cta_clicks").insert(payload);
    if (error && import.meta.env.DEV) {
      console.warn("[faqTracking] cta insert failed:", error);
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[faqTracking] cta unexpected error:", err);
  }
}

export async function getSupabase() {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    return supabase;
  } catch (err) {
    console.error("[backend] Supabase client could not be loaded", err);
    throw new Error("Backenden är inte korrekt konfigurerad i den publicerade miljön.");
  }
}
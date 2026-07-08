const FALLBACK_FUNCTIONS_ORIGIN = "https://cyymcdqkpvcvwjoqxbco.functions.supabase.co";

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export const getFunctionUrl = (functionName: string) => {
  const configuredProjectId = clean(import.meta.env.VITE_SUPABASE_PROJECT_ID);
  if (configuredProjectId) return `https://${configuredProjectId}.functions.supabase.co/${functionName}`;

  const configuredUrl = clean(import.meta.env.VITE_SUPABASE_URL);
  if (configuredUrl) {
    try {
      const host = new URL(configuredUrl).hostname;
      const projectId = host.split(".")[0];
      if (projectId) return `https://${projectId}.functions.supabase.co/${functionName}`;
    } catch {
      // Fall through to the known production backend origin.
    }
  }

  return `${FALLBACK_FUNCTIONS_ORIGIN}/${functionName}`;
};
export type AuthClientOwner = "host" | "care" | "sight" | "connect" | "local-boost" | "papers";

/** Keep callback tokens out of unrelated Supabase clients on the shared origin. */
export function ownsAuthCallbackPath(pathname: string, owner: AuthClientOwner): boolean {
  const base = owner === "host" ? "/portal" : `/portal/${owner}`;
  const matches = pathname === base || pathname.startsWith(`${base}/`);
  return owner === "host" ? !matches : matches;
}

export function detectAuthSessionFor(owner: AuthClientOwner): boolean {
  return typeof window !== "undefined" && ownsAuthCallbackPath(window.location.pathname, owner);
}

import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { RouteContextProvider } from "@/modules/shared/router";
import { supabase } from "./client";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

export function PapersAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const previousId = useRef<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let active = true;
    let authRevision = 0;
    const update = (next: User | null) => {
      if (!active) return;
      if (previousId.current !== (next?.id ?? null)) queryClient.clear();
      previousId.current = next?.id ?? null;
      setUser(next);
      setLoading(false);
    };
    supabase.auth.getUser().then(({ data, error }) => {
      if (authRevision === 0) update(error ? null : data.user);
    }).catch(() => { if (authRevision === 0) update(null); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // The initial local session is checked by getUser above before showing private screens.
      if (event === "INITIAL_SESSION") return;
      authRevision += 1;
      update(session?.user ?? null);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [queryClient]);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function PapersAuthGate() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <p role="status" className="p-8 text-sm text-muted-foreground">Öppnar dokumentinkorgen…</p>;
  if (!user) return <Navigate to="/portal/papers/auth" replace />;
  return <RouteContextProvider value={{ user }}><Outlet /></RouteContextProvider>;
}

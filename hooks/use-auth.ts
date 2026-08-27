import { useCallback, useEffect, useMemo, useState } from "react";

import * as Api from "@/lib/_core/api";
import type { User } from "@/lib/_core/auth";
import { mapSupabaseUser, supabase } from "@/lib/supabase";

export function useAuth(options?: { autoFetch?: boolean }) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!data.session?.user) {
        setUser(null);
        return;
      }

      const fallbackUser = mapSupabaseUser(data.session.user);
      try {
        const apiUser = await Api.getMe();
        if (apiUser) {
          setUser({
            id: apiUser.id,
            openId: apiUser.openId,
            name: apiUser.name,
            email: apiUser.email,
            loginMethod: apiUser.loginMethod,
            lastSignedIn: new Date(apiUser.lastSignedIn),
          });
          return;
        }
      } catch (apiError) {
        console.warn("[Supabase Auth] Usuário autenticado, mas não foi possível sincronizar o perfil local:", apiError);
      }
      setUser(fallbackUser);
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error("Não foi possível carregar a sessão.");
      setError(nextError);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    setUser(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);
      return;
    }

    void fetchUser();
    const { data } = supabase.auth.onAuthStateChange(() => {
      void fetchUser();
    });
    return () => data.subscription.unsubscribe();
  }, [autoFetch, fetchUser]);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);
  return { user, loading, error, isAuthenticated, refresh: fetchUser, logout };
}

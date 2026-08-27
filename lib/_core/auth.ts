import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase, mapSupabaseUser } from "@/lib/supabase";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("[Supabase Auth] Falha ao recuperar sessão:", error);
    return null;
  }
  return data.session;
}

export async function getSessionToken(): Promise<string | null> {
  return (await getSession())?.access_token ?? null;
}

export async function setSession(session: Session): Promise<void> {
  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (error) throw error;
}

export async function setSessionToken(_token: string): Promise<void> {
  console.warn("[Supabase Auth] setSessionToken foi mantido apenas por compatibilidade; use setSession.");
}

export async function removeSessionToken(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSupabaseUser(): Promise<SupabaseUser | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function getUserInfo(): Promise<User | null> {
  const user = await getSupabaseUser();
  return user ? mapSupabaseUser(user) : null;
}

export async function setUserInfo(_user: User): Promise<void> {
  // O Supabase Auth é a fonte de verdade da sessão e do usuário.
}

export async function clearUserInfo(): Promise<void> {
  // A limpeza é feita por supabase.auth.signOut().
}

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseServer = createClient(url || "https://placeholder.supabase.co", key || "placeholder-key", {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function getSupabaseUserFromAccessToken(accessToken: string) {
  const { data, error } = await supabaseServer.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

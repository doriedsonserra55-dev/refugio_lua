import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("[Supabase] EXPO_PUBLIC_SUPABASE_URL/PUBLISHABLE_KEY não configuradas.");
}

export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder-key", {
  auth: {
    ...(Platform.OS === "web" ? {} : { storage: AsyncStorage }),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
    flowType: "pkce",
  },
});

export function getSupabaseRedirectUrl(path = "/conta") {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }

  const scheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? "manusrefugioapp";
  return `${scheme}://${path.replace(/^\//, "")}`;
}

export function mapSupabaseUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null }) {
  const metadata = user.user_metadata ?? {};
  const name = typeof metadata.name === "string" ? metadata.name : typeof metadata.full_name === "string" ? metadata.full_name : null;

  return {
    id: 0,
    openId: user.id,
    name,
    email: user.email ?? null,
    loginMethod: typeof metadata.provider === "string" ? metadata.provider : "supabase",
    lastSignedIn: new Date(),
  };
}

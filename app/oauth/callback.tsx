import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error_description?: string; access_token?: string; refresh_token?: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const finish = async () => {
      try {
        if (params.error_description) throw new Error(params.error_description);
        let code = params.code;
        let url: string | null = null;
        if (!code && (!params.access_token || !params.refresh_token)) url = await Linking.getInitialURL();
        if (url) {
          const parsed = new URL(url);
          code = parsed.searchParams.get("code") ?? undefined;
          const hash = new URLSearchParams(parsed.hash.replace(/^#/, ""));
          const accessToken = hash.get("access_token");
          const refreshToken = hash.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            if (sessionError) throw sessionError;
          }
        }
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (params.access_token && params.refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({ access_token: params.access_token, refresh_token: params.refresh_token });
          if (sessionError) throw sessionError;
        }
        if (active) router.replace("/(tabs)/inicio" as never);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Não foi possível concluir o login.");
      }
    };
    void finish();
    return () => { active = false; };
  }, [params.code, params.error_description, params.access_token, params.refresh_token, router]);

  return <View style={styles.container}>{error ? <><Text style={styles.title}>Não foi possível entrar</Text><Text style={styles.error}>{error}</Text></> : <><ActivityIndicator size="large" color="#2F6F8F" /><Text style={styles.title}>Concluindo seu acesso…</Text></>}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#FBF7EF", gap: 14 },
  title: { color: "#163041", fontSize: 18, fontWeight: "700", textAlign: "center" },
  error: { color: "#A65D62", textAlign: "center", lineHeight: 20 },
});

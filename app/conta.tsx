import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton, SoftCard, Wordmark } from "@/components/refugio-ui";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { haptic } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";

type Mode = "signin" | "signup";

export default function ContaScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const signIn = trpc.passwordAuth.signIn.useMutation();
  const signUp = trpc.passwordAuth.signUp.useMutation();
  const loading = signIn.isPending || signUp.isPending;

  const completeSession = async (result: { token: string; user: { id: number; openId: string; name: string | null; email: string | null; loginMethod: string | null; lastSignedIn: Date } }) => {
    if (Platform.OS === "web") {
      const established = await Api.establishSession(result.token);
      if (!established) throw new Error("Não foi possível preparar sua sessão neste dispositivo.");
    } else {
      await Auth.setSessionToken(result.token);
    }
    await Auth.setUserInfo({ ...result.user, lastSignedIn: new Date(result.user.lastSignedIn) });
  };

  const submit = async () => {
    setError("");
    try {
      const result = mode === "signin"
        ? await signIn.mutateAsync({ email, password })
        : await signUp.mutateAsync({ name, email, password });
      await completeSession(result);
      haptic.success();
      router.replace("/(tabs)/jardim" as never);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível concluir agora.";
      setError(message);
      haptic.warning();
    }
  };

  return <View style={styles.screen}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Pressable onPress={() => router.back()} style={styles.back}><MaterialCommunityIcons name="arrow-left" size={22} color="#2F6F8F" /><Text style={styles.backText}>Voltar</Text></Pressable><Wordmark /><Text style={styles.title}>{mode === "signin" ? "Bom te ver por aqui." : "Guarde seu Jardim."}</Text><Text style={styles.subtitle}>{mode === "signin" ? "Entre para restaurar seu progresso privado." : "Crie uma conta com e-mail e senha para sincronizar seu Refúgio."}</Text><View style={styles.switcher}><Pressable onPress={() => { setMode("signin"); setError(""); }} style={[styles.switch, mode === "signin" && styles.switchActive]}><Text style={[styles.switchText, mode === "signin" && styles.switchTextActive]}>Entrar</Text></Pressable><Pressable onPress={() => { setMode("signup"); setError(""); }} style={[styles.switch, mode === "signup" && styles.switchActive]}><Text style={[styles.switchText, mode === "signup" && styles.switchTextActive]}>Criar conta</Text></Pressable></View><SoftCard style={styles.formCard}>{mode === "signup" && <><Text style={styles.label}>Como podemos chamar você?</Text><TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#95A29E" style={styles.input} maxLength={40} /></>}<Text style={styles.label}>E-mail</Text><TextInput value={email} onChangeText={setEmail} placeholder="voce@email.com" placeholderTextColor="#95A29E" style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} /><Text style={styles.label}>Senha</Text><TextInput value={password} onChangeText={setPassword} placeholder="Pelo menos 8 caracteres" placeholderTextColor="#95A29E" style={styles.input} secureTextEntry autoCapitalize="none" /><Text style={styles.security}><MaterialCommunityIcons name="lock-outline" size={14} color="#607B72" /> Sua senha é protegida e não aparece no seu perfil.</Text>{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton label={loading ? "Aguarde…" : mode === "signin" ? "Entrar no Refúgio" : "Criar minha conta"} onPress={() => { void submit(); }} icon="leaf" subdued={loading} />{loading && <ActivityIndicator color="#2F6F8F" />}</SoftCard><Text style={styles.note}>A conta é opcional. Você pode continuar anônimo e entrar quando quiser para sincronizar seu Jardim.</Text></ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" }, content: { padding: 22, paddingTop: 28, paddingBottom: 48, gap: 15 }, back: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 4 }, backText: { color: "#2F6F8F", fontWeight: "700", fontSize: 14 }, title: { color: "#163041", fontSize: 30, lineHeight: 36, fontWeight: "700", letterSpacing: -1, marginTop: 10 }, subtitle: { color: "#58736F", fontSize: 15, lineHeight: 22 }, switcher: { flexDirection: "row", padding: 4, backgroundColor: "#EEEFE9", borderRadius: 18, marginTop: 4 }, switch: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 14 }, switchActive: { backgroundColor: "#FFFDF8" }, switchText: { color: "#7A8E88", fontSize: 13, fontWeight: "700" }, switchTextActive: { color: "#2F6F8F" }, formCard: { gap: 9, marginTop: 2 }, label: { color: "#4E665E", fontSize: 13, fontWeight: "700", marginTop: 4 }, input: { minHeight: 50, borderRadius: 16, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E2D9CC", paddingHorizontal: 14, color: "#163041", fontSize: 15 }, security: { color: "#607B72", fontSize: 12, lineHeight: 18, marginVertical: 4 }, error: { color: "#A65D62", fontSize: 13, lineHeight: 18 }, note: { color: "#778780", textAlign: "center", fontSize: 12, lineHeight: 18, paddingHorizontal: 18 },
});

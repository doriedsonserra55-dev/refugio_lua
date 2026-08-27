import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { startOAuthLogin } from "@/constants/oauth";
import { PrimaryButton, SoftCard, Wordmark } from "@/components/refugio-ui";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { haptic } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";

type Mode = "signin" | "signup" | "forgot" | "reset";

type AuthUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

export default function ContaScreen() {
  const params = useLocalSearchParams<{ resetToken?: string | string[] }>();
  const resetToken = typeof params.resetToken === "string" ? params.resetToken : undefined;
  const [mode, setMode] = useState<Mode>(() => (resetToken ? "reset" : "signin"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const signIn = trpc.passwordAuth.signIn.useMutation();
  const signUp = trpc.passwordAuth.signUp.useMutation();
  const requestReset = trpc.passwordAuth.requestReset.useMutation();
  const resetPassword = trpc.passwordAuth.resetPassword.useMutation();
  const loading = signIn.isPending || signUp.isPending || requestReset.isPending || resetPassword.isPending;

  const clearMessages = () => {
    setError("");
    setFeedback("");
  };

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setPassword("");
    setConfirmation("");
    setShowPassword(false);
    setShowConfirmation(false);
    clearMessages();
  };

  const completeSession = async (result: { token: string; user: AuthUser }) => {
    if (Platform.OS === "web") {
      const established = await Api.establishSession(result.token);
      if (!established) throw new Error("Não foi possível preparar sua sessão neste dispositivo.");
    } else {
      await Auth.setSessionToken(result.token);
    }
    await Auth.setUserInfo({ ...result.user, lastSignedIn: new Date(result.user.lastSignedIn) });
  };

  const submit = async () => {
    clearMessages();
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "forgot") {
      if (!normalizedEmail) {
        setError("Digite seu e-mail para receber o link de recuperação.");
        return;
      }
      try {
        await requestReset.mutateAsync({ email: normalizedEmail });
        setFeedback("Se existir uma conta com este e-mail, enviaremos um link de recuperação em alguns instantes. Confira também a caixa de spam.");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Não foi possível iniciar a recuperação agora.");
        haptic.warning();
      }
      return;
    }

    if (mode === "reset") {
      if (!resetToken) {
        setError("O link de recuperação está incompleto. Solicite um novo link.");
        return;
      }
      if (password !== confirmation) {
        setError("As senhas precisam ser iguais.");
        return;
      }
      try {
        await resetPassword.mutateAsync({ token: resetToken, password });
        setFeedback("Sua senha foi redefinida. Agora você já pode entrar no Refúgio.");
        setMode("signin");
        setPassword("");
        setConfirmation("");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Não foi possível redefinir sua senha agora.");
        haptic.warning();
      }
      return;
    }

    try {
      const result = mode === "signin"
        ? await signIn.mutateAsync({ email: normalizedEmail, password })
        : await signUp.mutateAsync({ name: name.trim(), email: normalizedEmail, password });
      await completeSession(result);
      haptic.success();
      router.replace("/(tabs)/jardim" as never);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível concluir agora.";
      setError(message);
      haptic.warning();
    }
  };

  const continueWithGoogle = async () => {
    clearMessages();
    try {
      await startOAuthLogin();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível abrir o login do Google agora.");
      haptic.warning();
    }
  };

  const isReset = mode === "reset";
  const isForgot = mode === "forgot";
  const isFormMode = mode === "signin" || mode === "signup";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar">
          <MaterialCommunityIcons name="arrow-left" size={22} color="#2F6F8F" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Wordmark />
        <Text style={styles.title}>
          {isReset ? "Crie uma nova senha." : isForgot ? "Vamos recuperar seu acesso." : mode === "signin" ? "Bom te ver por aqui." : "Guarde seu Jardim."}
        </Text>
        <Text style={styles.subtitle}>
          {isReset
            ? "Escolha uma senha nova para voltar ao seu Refúgio."
            : isForgot
              ? "Digite seu e-mail e enviaremos um link seguro para redefinir sua senha."
              : mode === "signin"
                ? "Entre para restaurar seu progresso privado."
                : "Crie uma conta com e-mail e senha ou continue com sua conta Google."}
        </Text>

        {isFormMode && (
          <View style={styles.switcher}>
            <Pressable onPress={() => changeMode("signin")} style={[styles.switch, mode === "signin" && styles.switchActive]} accessibilityRole="tab" accessibilityState={{ selected: mode === "signin" }}>
              <Text style={[styles.switchText, mode === "signin" && styles.switchTextActive]}>Entrar</Text>
            </Pressable>
            <Pressable onPress={() => changeMode("signup")} style={[styles.switch, mode === "signup" && styles.switchActive]} accessibilityRole="tab" accessibilityState={{ selected: mode === "signup" }}>
              <Text style={[styles.switchText, mode === "signup" && styles.switchTextActive]}>Criar conta</Text>
            </Pressable>
          </View>
        )}

        {isFormMode && (
          <>
            <Pressable onPress={() => { void continueWithGoogle(); }} style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]} accessibilityRole="button">
              <MaterialCommunityIcons name="google" size={19} color="#2F6F8F" />
              <Text style={styles.googleButtonText}>{mode === "signup" ? "Criar conta com Google" : "Continuar com Google"}</Text>
            </Pressable>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou use seu e-mail</Text>
              <View style={styles.divider} />
            </View>
          </>
        )}

        <SoftCard style={styles.formCard}>
          {mode === "signup" && (
            <>
              <Text style={styles.label}>Como podemos chamar você?</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#95A29E" style={styles.input} maxLength={40} autoCapitalize="words" />
            </>
          )}

          {!isReset && (
            <>
              <Text style={styles.label}>E-mail</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="voce@email.com" placeholderTextColor="#95A29E" style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </>
          )}

          {!isForgot && (
            <>
              <Text style={styles.label}>{isReset ? "Nova senha" : "Senha"}</Text>
              <View style={styles.passwordField}>
                <TextInput value={password} onChangeText={setPassword} placeholder="Pelo menos 8 caracteres" placeholderTextColor="#95A29E" style={[styles.input, styles.passwordInput]} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} />
                <Pressable onPress={() => setShowPassword((visible) => !visible)} style={styles.eyeButton} accessibilityRole="button" accessibilityLabel={showPassword ? "Ocultar senha" : "Visualizar senha"}>
                  <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color="#607B72" />
                </Pressable>
              </View>
              {isReset && (
                <>
                  <Text style={styles.label}>Confirme a nova senha</Text>
                  <View style={styles.passwordField}>
                    <TextInput value={confirmation} onChangeText={setConfirmation} placeholder="Digite a senha novamente" placeholderTextColor="#95A29E" style={[styles.input, styles.passwordInput]} secureTextEntry={!showConfirmation} autoCapitalize="none" autoCorrect={false} />
                    <Pressable onPress={() => setShowConfirmation((visible) => !visible)} style={styles.eyeButton} accessibilityRole="button" accessibilityLabel={showConfirmation ? "Ocultar confirmação de senha" : "Visualizar confirmação de senha"}>
                      <MaterialCommunityIcons name={showConfirmation ? "eye-off-outline" : "eye-outline"} size={21} color="#607B72" />
                    </Pressable>
                  </View>
                </>
              )}
            </>
          )}

          {mode === "signin" && (
            <Pressable onPress={() => changeMode("forgot")} style={styles.forgotLink} accessibilityRole="button">
              <Text style={styles.forgotLinkText}>Esqueci minha senha</Text>
            </Pressable>
          )}
          <Text style={styles.security}>
            <MaterialCommunityIcons name="lock-outline" size={14} color="#607B72" /> {isForgot ? "Seu e-mail será usado apenas para localizar sua conta." : "Sua senha é protegida e não aparece no seu perfil."}
          </Text>
          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label={loading ? "Aguarde…" : isReset ? "Salvar nova senha" : isForgot ? "Enviar link de recuperação" : mode === "signin" ? "Entrar no Refúgio" : "Criar minha conta"} onPress={() => { void submit(); }} icon={isForgot ? "email-outline" : isReset ? "check" : "leaf"} subdued={loading} />
          {loading && <ActivityIndicator color="#2F6F8F" />}
        </SoftCard>

        {isForgot || isReset ? (
          <Pressable onPress={() => changeMode("signin")} style={styles.secondaryLink} accessibilityRole="button">
            <MaterialCommunityIcons name="arrow-left" size={16} color="#2F6F8F" />
            <Text style={styles.forgotLinkText}>Voltar para entrar</Text>
          </Pressable>
        ) : (
          <Text style={styles.note}>A conta é opcional. Você pode continuar anônimo e entrar quando quiser para sincronizar seu Jardim.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" },
  content: { padding: 22, paddingTop: 28, paddingBottom: 48, gap: 15 },
  back: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 4 },
  backText: { color: "#2F6F8F", fontWeight: "700", fontSize: 14 },
  title: { color: "#163041", fontSize: 30, lineHeight: 36, fontWeight: "700", letterSpacing: -1, marginTop: 10 },
  subtitle: { color: "#58736F", fontSize: 15, lineHeight: 22 },
  switcher: { flexDirection: "row", padding: 4, backgroundColor: "#EEEFE9", borderRadius: 18, marginTop: 4 },
  switch: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 14 },
  switchActive: { backgroundColor: "#FFFDF8" },
  switchText: { color: "#7A8E88", fontSize: 13, fontWeight: "700" },
  switchTextActive: { color: "#2F6F8F" },
  googleButton: { minHeight: 50, borderRadius: 25, flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#C9D8D1" },
  googleButtonText: { color: "#2F6F8F", fontSize: 15, fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  divider: { flex: 1, height: 1, backgroundColor: "#E2D9CC" },
  dividerText: { color: "#8A9993", fontSize: 12 },
  formCard: { gap: 9, marginTop: 2 },
  label: { color: "#4E665E", fontSize: 13, fontWeight: "700", marginTop: 4 },
  input: { minHeight: 50, borderRadius: 16, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E2D9CC", paddingHorizontal: 14, color: "#163041", fontSize: 15 },
  passwordField: { position: "relative", justifyContent: "center" },
  passwordInput: { paddingRight: 52 },
  eyeButton: { position: "absolute", right: 5, width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  forgotLink: { alignSelf: "flex-end", paddingVertical: 4, paddingHorizontal: 2 },
  forgotLinkText: { color: "#2F6F8F", fontSize: 13, fontWeight: "700" },
  security: { color: "#607B72", fontSize: 12, lineHeight: 18, marginVertical: 4 },
  feedback: { color: "#315B4D", backgroundColor: "#EAF1EC", borderRadius: 12, padding: 11, fontSize: 13, lineHeight: 19 },
  error: { color: "#A65D62", fontSize: 13, lineHeight: 18 },
  secondaryLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 4 },
  note: { color: "#778780", textAlign: "center", fontSize: 12, lineHeight: 18, paddingHorizontal: 18 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});

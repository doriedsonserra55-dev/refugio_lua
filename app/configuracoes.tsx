import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton, Wordmark } from "@/components/refugio-ui";
import { useAuth } from "@/hooks/use-auth";
import { haptic } from "@/lib/haptics";
import { useRefugio } from "@/lib/refugio-store";

const avatars = ["🌻", "🍵", "🦋", "🪴", "🌌", "🕯️", "🌊", "📖"];

export default function SettingsScreen() {
  const { profile, setProfile } = useRefugio();
  const { logout } = useAuth();
  const [pseudonym, setPseudonym] = useState(profile?.pseudonym ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar ?? "🌻");
  const [message, setMessage] = useState("");

  if (!profile) return <View style={styles.empty}><Text style={styles.emptyText}>Entre no Refúgio para acessar suas configurações.</Text><PrimaryButton label="Entrar" onPress={() => router.replace("/conta" as never)} /></View>;

  const saveIdentity = () => {
    const cleanName = pseudonym.trim();
    if (cleanName.length < 2) { setMessage("Escolha um pseudônimo com pelo menos duas letras."); return; }
    setProfile({ ...profile, pseudonym: cleanName, avatar });
    setMessage("Sua identidade foi atualizada.");
    haptic.success();
  };

  const signOut = async () => {
    await logout();
    haptic.success();
    router.replace("/inicio" as never);
  };

  return <View style={styles.screen}><ScrollView contentContainerStyle={styles.content}><View style={styles.topbar}><Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel="Voltar"><MaterialCommunityIcons name="arrow-left" size={22} color="#2F6F8F" /></Pressable><Wordmark compact /><View style={{ width: 42 }} /></View><Text style={styles.title}>Configurações</Text><Text style={styles.subtitle}>Você decide como quer aparecer e o que deseja preservar.</Text><View style={styles.field}><Text style={styles.label}>Pseudônimo público</Text><TextInput value={pseudonym} onChangeText={setPseudonym} style={styles.input} maxLength={40} /></View><Text style={styles.label}>Avatar público</Text><View style={styles.avatarGrid}>{avatars.map((item) => <Pressable key={item} onPress={() => setAvatar(item)} style={[styles.avatarPick, avatar === item && styles.avatarActive]}><Text style={styles.avatarText}>{item}</Text></Pressable>)}</View>{message ? <Text style={styles.message}>{message}</Text> : null}<PrimaryButton label="Salvar identidade" onPress={saveIdentity} icon="content-save-outline" /><View style={styles.divider} /><Pressable onPress={() => { void signOut(); }} style={styles.logout}><MaterialCommunityIcons name="logout" size={18} color="#A65D62" /><Text style={styles.logoutText}>Sair da conta</Text></Pressable><Text style={styles.note}>Seu e-mail não é exibido no perfil público. A exclusão da conta e dos dados sincronizados pode ser feita pelo Jardim.</Text></ScrollView></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" }, content: { padding: 20, paddingBottom: 45, gap: 16 }, topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#E6F0F3" }, title: { color: "#163041", fontSize: 30, fontWeight: "700" }, subtitle: { color: "#5B6E69", fontSize: 15, lineHeight: 22 }, field: { gap: 8 }, label: { color: "#4E665E", fontSize: 13, fontWeight: "700" }, input: { minHeight: 50, borderRadius: 16, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E2D9CC", paddingHorizontal: 14, color: "#163041", fontSize: 15 }, avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 }, avatarPick: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#F5EFE5", borderWidth: 1, borderColor: "transparent" }, avatarActive: { backgroundColor: "#E6F0F3", borderColor: "#2F6F8F" }, avatarText: { fontSize: 25 }, message: { color: "#3B7E61", fontSize: 13 }, divider: { height: 1, backgroundColor: "#E2D9CC", marginVertical: 4 }, logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, padding: 12 }, logoutText: { color: "#A65D62", fontSize: 14, fontWeight: "700" }, note: { color: "#87958F", fontSize: 11, lineHeight: 17, textAlign: "center" }, empty: { flex: 1, justifyContent: "center", padding: 24, gap: 18, backgroundColor: "#FBF7EF" }, emptyText: { color: "#5B6E69", fontSize: 16, textAlign: "center" },
});
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton, SoftCard, Wordmark } from "@/components/refugio-ui";
import { useRefugio } from "@/lib/refugio-store";

export default function ProfileScreen() {
  const { profile, letters } = useRefugio();

  if (!profile) {
    return <View style={styles.empty}><Text style={styles.emptyText}>Complete seu perfil para cuidar da sua identidade no Refúgio.</Text><PrimaryButton label="Ir para o Mural" onPress={() => router.replace("/mural" as never)} /></View>;
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topbar}><Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel="Voltar"><MaterialCommunityIcons name="arrow-left" size={22} color="#2F6F8F" /></Pressable><Wordmark compact /><View style={{ width: 42 }} /></View>
        <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{profile.avatar}</Text></View><Text style={styles.name}>{profile.pseudonym}</Text><Text style={styles.caption}>Sua identidade pública usa apenas este pseudônimo.</Text></View>
        <SoftCard style={styles.stats}><Text style={styles.sectionTitle}>Seu Refúgio</Text><View style={styles.statRow}><Text style={styles.statLabel}>Cartas publicadas</Text><Text style={styles.statValue}>{letters.filter((letter) => letter.own).length}</Text></View><View style={styles.statRow}><Text style={styles.statLabel}>Temas escolhidos</Text><Text style={styles.statValue}>{profile.interests.length}</Text></View></SoftCard>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Seus temas</Text><MaterialCommunityIcons name="tag-heart-outline" size={20} color="#2F6F8F" /></View><View style={styles.tags}>{profile.interests.map((interest) => <View key={interest} style={styles.tag}><Text style={styles.tagText}>{interest}</Text></View>)}</View>
        <PrimaryButton label="Editar identidade" onPress={() => router.push("/configuracoes" as never)} icon="account-edit-outline" subdued />
        <PrimaryButton label="Abrir configurações" onPress={() => router.push("/configuracoes" as never)} icon="cog-outline" subdued />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" }, content: { padding: 20, paddingBottom: 40, gap: 17 }, topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#E6F0F3" }, identity: { alignItems: "center", gap: 7, paddingVertical: 18 }, avatar: { width: 88, height: 88, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: "#F3EEDF" }, avatarText: { fontSize: 47 }, name: { color: "#163041", fontSize: 25, fontWeight: "700" }, caption: { color: "#70827B", fontSize: 12, textAlign: "center" }, stats: { gap: 12 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, sectionTitle: { color: "#163041", fontSize: 18, fontWeight: "700" }, statRow: { flexDirection: "row", justifyContent: "space-between" }, statLabel: { color: "#5B716A", fontSize: 14 }, statValue: { color: "#2F6F8F", fontWeight: "700" }, tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, tag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: "#EAF2EA" }, tagText: { color: "#46685A", fontSize: 12, fontWeight: "700" }, empty: { flex: 1, justifyContent: "center", padding: 24, gap: 18, backgroundColor: "#FBF7EF" }, emptyText: { color: "#5B6E69", fontSize: 16, textAlign: "center", lineHeight: 23 },
});
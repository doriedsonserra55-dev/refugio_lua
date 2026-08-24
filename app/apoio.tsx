import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton, SoftCard, Wordmark } from "@/components/refugio-ui";
import { haptic } from "@/lib/haptics";

export default function SupportScreen() {
  const [status, setStatus] = useState("");
  const callCvv = async () => {
    try {
      await Linking.openURL("tel:188");
    } catch {
      setStatus("Não foi possível iniciar a ligação neste dispositivo. Ligue para 188 por outro telefone ou procure um serviço de emergência local agora.");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.glowOne} /><View style={styles.glowTwo} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}><Wordmark compact /><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.close, pressed && styles.pressed]}><MaterialCommunityIcons name="close" size={22} color="#2F6F8F" /></Pressable></View>
        <View style={styles.iconCircle}><MaterialCommunityIcons name="heart-plus-outline" size={38} color="#2F6F8F" /></View>
        <Text style={styles.title}>Você não precisa passar por isso sozinho.</Text>
        <Text style={styles.subtitle}>Parece que sua mensagem pode carregar um sofrimento muito intenso. Por enquanto, ela não será publicada. O mais importante agora é ter apoio humano imediato.</Text>
        <SoftCard style={styles.cvvCard}><View style={styles.cvvTop}><View style={styles.phoneCircle}><MaterialCommunityIcons name="phone" size={21} color="#FBF7EF" /></View><View><Text style={styles.cvvTitle}>CVV — 188</Text><Text style={styles.cvvText}>Atendimento gratuito, 24 horas.</Text></View></View><PrimaryButton label="Ligar para o CVV" onPress={() => { haptic.warning(); void callCvv(); }} icon="phone" /></SoftCard>
        <View style={styles.emergency}><MaterialCommunityIcons name="alert-circle-outline" size={22} color="#A65D62" /><View style={{ flex: 1 }}><Text style={styles.emergencyTitle}>Se houver risco imediato</Text><Text style={styles.emergencyText}>Procure um pronto atendimento, ligue para o serviço de emergência da sua região ou peça para alguém de confiança ficar com você agora.</Text></View></View>
        {status ? <Text style={styles.status}>{status}</Text> : null}
        <Pressable onPress={() => router.replace("/")} style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}><Text style={styles.backLinkText}>Voltar ao Refúgio quando eu me sentir pronto</Text></Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" }, content: { padding: 22, paddingTop: 28, paddingBottom: 42, gap: 18 }, topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, close: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#E6F0F3" }, glowOne: { position: "absolute", top: 150, right: -80, width: 210, height: 210, borderRadius: 105, backgroundColor: "#E6F0F3" }, glowTwo: { position: "absolute", bottom: -70, left: -70, width: 200, height: 200, borderRadius: 100, backgroundColor: "#EAF2EA" }, iconCircle: { width: 82, height: 82, borderRadius: 31, backgroundColor: "#EAF2EA", alignItems: "center", justifyContent: "center", marginTop: 15 }, title: { color: "#163041", fontSize: 30, lineHeight: 37, letterSpacing: -1, fontWeight: "700" }, subtitle: { color: "#566B65", fontSize: 16, lineHeight: 24 }, cvvCard: { gap: 16, backgroundColor: "#FFFDF8" }, cvvTop: { flexDirection: "row", gap: 12, alignItems: "center" }, phoneCircle: { width: 46, height: 46, borderRadius: 17, backgroundColor: "#2F6F8F", alignItems: "center", justifyContent: "center" }, cvvTitle: { color: "#163041", fontSize: 18, fontWeight: "700" }, cvvText: { color: "#60736E", fontSize: 13, marginTop: 3 }, emergency: { flexDirection: "row", gap: 12, backgroundColor: "#FBEDEE", padding: 15, borderRadius: 20, alignItems: "flex-start" }, emergencyTitle: { color: "#8F4D52", fontSize: 14, fontWeight: "700" }, emergencyText: { color: "#875D60", fontSize: 13, lineHeight: 19, marginTop: 4 }, status: { color: "#875D60", backgroundColor: "#FFF0F1", padding: 12, borderRadius: 15, fontSize: 13, lineHeight: 19 }, backLink: { alignSelf: "center", padding: 9 }, backLinkText: { color: "#2F6F8F", fontSize: 13, fontWeight: "700", textAlign: "center" }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});

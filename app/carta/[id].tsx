import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Pill, PrimaryButton, SoftCard } from "@/components/refugio-ui";
import { haptic } from "@/lib/haptics";
import { type EnergyType, useRefugio } from "@/lib/refugio-store";

const energies: { label: EnergyType; emoji: string }[] = [
  { label: "Abraço", emoji: "🤍" }, { label: "Força", emoji: "🌷" }, { label: "Esperança", emoji: "☀️" }, { label: "Paz", emoji: "🕊️" }, { label: "Você não está sozinho", emoji: "✨" },
];

export default function LetterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { letters, sendEnergy, addAdvice, markHelped } = useRefugio();
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyType | null>(null);
  const [advice, setAdvice] = useState("");
  const [message, setMessage] = useState("");
  const letter = useMemo(() => letters.find((item) => item.id === id), [id, letters]);

  if (!letter) return <View style={styles.missing}><Text style={styles.missingText}>Esta carta não está mais disponível.</Text><PrimaryButton label="Voltar ao Mural" onPress={() => router.replace("/")} /></View>;

  const chooseEnergy = (energy: EnergyType) => {
    setSelectedEnergy(energy);
    sendEnergy(letter.id, energy);
    haptic.success();
    setMessage("Sua energia chegou como um gesto silencioso de presença.");
  };
  const sendAdvice = () => {
    if (advice.trim().length < 8) { setMessage("Um conselho acolhedor pode começar com poucas palavras, mas precisa ter pelo menos uma frase."); return; }
    addAdvice(letter.id, advice.trim());
    haptic.success();
    setAdvice("");
    setMessage("Seu acolhimento foi enviado com cuidado.");
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}><Pressable onPress={() => router.replace("/(tabs)/index" as never)} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><MaterialCommunityIcons name="arrow-left" size={22} color="#2F6F8F" /></Pressable><Text style={styles.topTitle}>Leitura com cuidado</Text><View style={{ width: 42 }} /></View>
        <View style={styles.authorRow}><View style={styles.avatarBubble}><Text style={styles.avatar}>{letter.avatar}</Text></View><View style={{ flex: 1 }}><Text style={styles.author}>{letter.author}</Text><Text style={styles.time}>{letter.createdLabel}</Text></View><Pill label={letter.category} /></View>
        <View style={styles.letterPaper}><Text style={styles.letterTitle}>{letter.title}</Text><View style={styles.paperLine} /><Text style={styles.letterBody}>{letter.body}</Text></View>
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Envie uma energia</Text><Text style={styles.sectionHint}>sem números públicos</Text></View>
        <View style={styles.energyGrid}>{energies.map((energy) => <Pressable key={energy.label} onPress={() => chooseEnergy(energy.label)} style={({ pressed }) => [styles.energyButton, selectedEnergy === energy.label && styles.energySelected, pressed && styles.pressed]}><Text style={styles.energyEmoji}>{energy.emoji}</Text><Text style={styles.energyLabel}>{energy.label}</Text></Pressable>)}</View>
        {message ? <View style={styles.message}><MaterialCommunityIcons name="heart-outline" size={18} color="#2F6F8F" /><Text style={styles.messageText}>{message}</Text></View> : null}
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Conselhos que acolhem</Text><Text style={styles.sectionHint}>{letter.comments.length ? "presença antes de solução" : "seja a primeira presença"}</Text></View>
        {letter.comments.map((comment) => <SoftCard key={comment.id} style={styles.commentCard}><View style={styles.commentTop}><Text style={styles.commentAuthor}>{comment.author}</Text>{comment.helped && <View style={styles.helped}><MaterialCommunityIcons name="heart" size={12} color="#3B7E61" /><Text style={styles.helpedText}>Isso ajudou</Text></View>}</View><Text style={styles.commentText}>{comment.text}</Text>{letter.own && !comment.helped && <Pressable onPress={() => { markHelped(letter.id, comment.id); haptic.success(); }} style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}><MaterialCommunityIcons name="heart-outline" size={16} color="#3B7E61" /><Text style={styles.helpButtonText}>Isso me ajudou</Text></Pressable>}</SoftCard>)}
        <View style={styles.adviceBox}><Text style={styles.adviceLabel}>Deixe uma mensagem de apoio</Text><TextInput value={advice} onChangeText={setAdvice} placeholder="Tente acolher antes de aconselhar…" placeholderTextColor="#9AA49E" multiline style={styles.adviceInput} textAlignVertical="top" /><PrimaryButton label="Enviar conselho" onPress={sendAdvice} icon="send-outline" subdued /></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" }, content: { padding: 20, paddingBottom: 38, gap: 17 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#E6F0F3" }, topTitle: { color: "#365B69", fontSize: 14, fontWeight: "700" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 2 }, avatarBubble: { width: 43, height: 43, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#F3EEDF" }, avatar: { fontSize: 22 }, author: { color: "#35544D", fontSize: 14, fontWeight: "700" }, time: { color: "#87958F", fontSize: 11, marginTop: 3 },
  letterPaper: { padding: 20, borderRadius: 27, backgroundColor: "#FFFCF6", borderWidth: 1, borderColor: "#E9DECC", gap: 15 }, letterTitle: { color: "#163041", fontSize: 25, lineHeight: 31, fontWeight: "700", letterSpacing: -0.7 }, paperLine: { height: 1, backgroundColor: "#EDE4D6" }, letterBody: { color: "#435B54", fontSize: 16, lineHeight: 27 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }, sectionTitle: { color: "#163041", fontSize: 19, fontWeight: "700", letterSpacing: -0.4 }, sectionHint: { color: "#83928C", fontSize: 11 },
  energyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, energyButton: { minHeight: 68, width: "31.9%", borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E7DECF", padding: 7, gap: 3 }, energySelected: { backgroundColor: "#EAF2EA", borderColor: "#8EAA95" }, energyEmoji: { fontSize: 19 }, energyLabel: { color: "#587069", textAlign: "center", fontSize: 9, lineHeight: 12, fontWeight: "700" },
  message: { backgroundColor: "#E6F0F3", borderRadius: 16, padding: 12, flexDirection: "row", gap: 8, alignItems: "flex-start" }, messageText: { flex: 1, color: "#426473", fontSize: 12, lineHeight: 18 },
  commentCard: { gap: 8 }, commentTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, commentAuthor: { color: "#3E5F56", fontSize: 13, fontWeight: "700" }, commentText: { color: "#526963", fontSize: 14, lineHeight: 21 }, helped: { flexDirection: "row", gap: 4, backgroundColor: "#EAF2EA", borderRadius: 12, paddingHorizontal: 7, paddingVertical: 4, alignItems: "center" }, helpedText: { color: "#3B7E61", fontSize: 10, fontWeight: "700" }, helpButton: { flexDirection: "row", gap: 6, alignItems: "center", alignSelf: "flex-start", marginTop: 3 }, helpButtonText: { color: "#3B7E61", fontSize: 12, fontWeight: "700" },
  adviceBox: { backgroundColor: "#EDF5EC", borderRadius: 25, padding: 16, gap: 11 }, adviceLabel: { color: "#46685A", fontSize: 13, fontWeight: "700" }, adviceInput: { minHeight: 95, backgroundColor: "#FFFDF8", borderRadius: 17, padding: 13, color: "#405A54", fontSize: 14, lineHeight: 20 },
  missing: { flex: 1, backgroundColor: "#FBF7EF", padding: 24, justifyContent: "center", gap: 18 }, missingText: { color: "#5B6E69", fontSize: 16, textAlign: "center" }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});

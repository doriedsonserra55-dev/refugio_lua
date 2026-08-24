import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Pill, PrimaryButton, Wordmark } from "@/components/refugio-ui";
import { haptic } from "@/lib/haptics";
import { useRefugio } from "@/lib/refugio-store";
import { needsImmediateSupport } from "@/lib/safety";

const categories = ["Terapia", "Burnout", "Faculdade", "Relacionamento", "Fim de ciclo", "Autocuidado", "Vitórias pequenas"];

export default function WriteScreen() {
  const { profile, publishLetter } = useRefugio();
  const [category, setCategory] = useState("Autocuidado");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile) router.replace("/");
  }, [profile]);

  const reviewAndPublish = () => {
    const fullText = `${title} ${body}`.trim();
    if (fullText.length < 12) {
      haptic.warning();
      setMessage("Escreva um pouco mais antes de enviar. Você não precisa acertar as palavras — só ser gentil com você.");
      return;
    }
    if (needsImmediateSupport(fullText)) {
      haptic.warning();
      router.push("/apoio" as never);
      return;
    }
    publishLetter({ category, title: title.trim() || "Um desabafo sem título", body: body.trim() });
    haptic.success();
    setTitle("");
    setBody("");
    setMessage("Sua carta foi recebida com cuidado. Ela agora aparece no seu Mural local.");
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}><Wordmark compact /><View style={styles.draftPill}><MaterialCommunityIcons name="lock-outline" size={15} color="#56736A" /><Text style={styles.draftText}>Seu rascunho é seu</Text></View></View>
        <View><Text style={styles.eyebrow}>NOVA CARTA</Text><Text style={styles.title}>O que você gostaria de colocar para fora?</Text><Text style={styles.subtitle}>Escreva como vier. A revisão só existe para cuidar de você e de quem lê.</Text></View>
        <View style={styles.paper}>
          <Text style={styles.label}>Escolha um tema</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>{categories.map((item) => <Pill key={item} label={item} active={item === category} onPress={() => setCategory(item)} />)}</ScrollView>
          <TextInput value={title} onChangeText={setTitle} maxLength={72} placeholder="Uma frase para começar…" placeholderTextColor="#99A49E" style={styles.titleInput} returnKeyType="next" />
          <TextInput value={body} onChangeText={setBody} maxLength={1200} placeholder="Você não precisa organizar tudo agora. Conte o que está pesando ou o que trouxe um pouco de alívio." placeholderTextColor="#99A49E" style={styles.bodyInput} multiline textAlignVertical="top" />
          <View style={styles.wordsRow}><Text style={styles.wordsText}>{body.length ? "Sua voz merece espaço." : "Quando quiser, estamos aqui."}</Text><Text style={styles.wordsText}>{body.length}/1200</Text></View>
        </View>
        <View style={styles.safeNote}><MaterialCommunityIcons name="shield-check-outline" size={20} color="#2F6F8F" /><Text style={styles.safeNoteText}>Antes de publicar, fazemos uma checagem preventiva. Em situação de risco, sua carta não será exposta e vamos priorizar ajuda imediata.</Text></View>
        {message ? <View style={styles.message}><MaterialCommunityIcons name="heart-outline" size={18} color="#2F6F8F" /><Text style={styles.messageText}>{message}</Text></View> : null}
        <PrimaryButton label="Revisar e enviar com cuidado" onPress={reviewAndPublish} icon="send-outline" />
        <Pressable onPress={() => { setTitle(""); setBody(""); setMessage("Rascunho limpo. Você pode começar de novo quando quiser."); }} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}><Text style={styles.clearText}>Limpar rascunho</Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" },
  content: { padding: 20, paddingBottom: 36, gap: 18 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  draftPill: { flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: "#EAF2EA", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  draftText: { color: "#56736A", fontSize: 11, fontWeight: "700" },
  eyebrow: { color: "#667C78", fontWeight: "800", fontSize: 11, letterSpacing: 1.2, marginBottom: 7 },
  title: { color: "#163041", fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.9 },
  subtitle: { color: "#5D706A", fontSize: 15, lineHeight: 22, marginTop: 7 },
  paper: { backgroundColor: "#FFFCF6", borderRadius: 28, padding: 17, borderWidth: 1, borderColor: "#E7DECF", gap: 14 },
  label: { color: "#5E746E", fontSize: 13, fontWeight: "700" },
  categoryList: { gap: 8, paddingRight: 12 },
  titleInput: { color: "#163041", fontSize: 20, lineHeight: 27, fontWeight: "700", borderBottomWidth: 1, borderBottomColor: "#E8E0D4", paddingVertical: 11 },
  bodyInput: { minHeight: 220, color: "#405A54", fontSize: 16, lineHeight: 25, paddingTop: 6 },
  wordsRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F0E8DC", paddingTop: 10 },
  wordsText: { color: "#82918C", fontSize: 11 },
  safeNote: { flexDirection: "row", gap: 10, backgroundColor: "#E6F0F3", borderRadius: 20, padding: 14, alignItems: "flex-start" },
  safeNoteText: { flex: 1, color: "#426473", fontSize: 12, lineHeight: 18 },
  message: { flexDirection: "row", gap: 9, borderRadius: 18, padding: 13, backgroundColor: "#F0F7F0", alignItems: "flex-start" },
  messageText: { flex: 1, color: "#46685A", fontSize: 13, lineHeight: 19 },
  clearButton: { alignSelf: "center", padding: 10 },
  clearText: { color: "#788A84", fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.7 },
});

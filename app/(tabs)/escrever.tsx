import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Pill, PrimaryButton, Wordmark } from "@/components/refugio-ui";
import { haptic } from "@/lib/haptics";
import { useRefugio } from "@/lib/refugio-store";
import { needsImmediateSupport } from "@/lib/safety";
import { useAuth } from "@/hooks/use-auth";

const categories = ["Terapia", "Burnout", "Faculdade", "Relacionamento", "Fim de ciclo", "Autocuidado", "Vitórias pequenas"];

export default function WriteScreen() {
  const { profile, publishLetter, addJournal } = useRefugio();
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState("Autocuidado");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [privacy, setPrivacy] = useState<"journal" | "mural">("mural");
  const [message, setMessage] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    // Visitantes podem escrever um rascunho; a conta só é necessária para sincronizar ou publicar.
  }, []);

  const saveToJournal = () => {
    const fullText = `${title} ${body}`.trim();
    if (fullText.length < 12) {
      haptic.warning();
      setMessage("Escreva um pouco mais antes de guardar. Você não precisa acertar as palavras.");
      return;
    }
    addJournal(title.trim() ? `${title.trim()}\n${body.trim()}` : body.trim());
    haptic.success();
    setTitle("");
    setBody("");
    setPublished(true);
    setMessage("Seu desabafo foi guardado no seu Diário privado.");
  };

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
    if (privacy === "journal") {
      saveToJournal();
      return;
    }
    if (!isAuthenticated) {
      haptic.warning();
      setMessage("Entre ou crie uma conta para publicar no Mural e sincronizar este desabafo.");
      return;
    }
    publishLetter({ category, title: title.trim() || "Um desabafo sem título", body: body.trim() });
    haptic.success();
    setTitle("");
    setBody("");
    setPublished(true);
    setMessage("Sua carta chegou ao Refúgio e foi publicada com cuidado.");
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
        <View style={styles.identityNote}><MaterialCommunityIcons name="account-heart-outline" size={20} color="#2F6F8F" /><Text style={styles.identityText}>Será exibido apenas {profile?.pseudonym ?? "seu pseudônimo"} e seu avatar. Seu e-mail e seu nome real nunca aparecem na carta.</Text></View>
        <View style={styles.privacyBox}><Text style={styles.privacyLabel}>Onde você quer guardar isso?</Text><View style={styles.privacyChoices}><Pressable onPress={() => setPrivacy("journal")} style={[styles.privacyChoice, privacy === "journal" && styles.privacyChoiceActive]}><MaterialCommunityIcons name="lock-outline" size={18} color={privacy === "journal" ? "#2F6F8F" : "#7A8E88"} /><View style={styles.privacyCopy}><Text style={styles.privacyTitle}>Guardar no Diário privado</Text><Text style={styles.privacyText}>Só você poderá ler.</Text></View></Pressable><Pressable onPress={() => setPrivacy("mural")} style={[styles.privacyChoice, privacy === "mural" && styles.privacyChoiceActive]}><MaterialCommunityIcons name="account-group-outline" size={18} color={privacy === "mural" ? "#2F6F8F" : "#7A8E88"} /><View style={styles.privacyCopy}><Text style={styles.privacyTitle}>Publicar no Mural</Text><Text style={styles.privacyText}>A comunidade poderá acolher.</Text></View></Pressable></View></View>
        <View style={styles.safeNote}><MaterialCommunityIcons name="shield-check-outline" size={20} color="#2F6F8F" /><Text style={styles.safeNoteText}>A comunidade oferece apoio, mas não substitui atendimento profissional. Em situação de risco, sua carta não será exposta e vamos priorizar ajuda imediata.</Text></View>
        {message ? <View style={styles.message}><MaterialCommunityIcons name="heart-outline" size={18} color="#2F6F8F" /><Text style={styles.messageText}>{message}</Text></View> : null}
        {published ? <View style={styles.confirmation}><MaterialCommunityIcons name="check-circle-outline" size={25} color="#3B7E61" /><Text style={styles.confirmationTitle}>{privacy === "journal" ? "Seu momento está guardado." : "Sua carta chegou ao Refúgio."}</Text><View style={styles.confirmationActions}><PrimaryButton label="Voltar ao Mural" onPress={() => router.replace("/mural" as never)} icon="newspaper-variant-outline" subdued /><PrimaryButton label="Ver meu Jardim" onPress={() => router.replace("/(tabs)/jardim" as never)} icon="tree-outline" subdued /></View></View> : <PrimaryButton label={privacy === "journal" ? "Guardar no diário privado" : "Publicar com cuidado"} onPress={reviewAndPublish} icon={privacy === "journal" ? "lock-outline" : "send-outline"} />}
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
  identityNote: { flexDirection: "row", gap: 10, backgroundColor: "#EEF5EB", borderRadius: 20, padding: 14, alignItems: "flex-start" },
  identityText: { flex: 1, color: "#46685A", fontSize: 12, lineHeight: 18 },
  privacyBox: { gap: 10 }, privacyLabel: { color: "#4E665E", fontSize: 13, fontWeight: "700" }, privacyChoices: { gap: 8 }, privacyChoice: { flexDirection: "row", gap: 10, alignItems: "center", padding: 13, borderRadius: 18, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E2D9CC" }, privacyChoiceActive: { borderColor: "#8EAA95", backgroundColor: "#F0F7F0" }, privacyCopy: { flex: 1 }, privacyTitle: { color: "#35544D", fontSize: 13, fontWeight: "700" }, privacyText: { color: "#7A8E88", fontSize: 11, marginTop: 2 },
  confirmation: { gap: 10, alignItems: "center", backgroundColor: "#EEF5EB", borderRadius: 22, padding: 16 }, confirmationTitle: { color: "#315B4D", fontSize: 16, fontWeight: "700", textAlign: "center" }, confirmationActions: { width: "100%", gap: 8 },
  message: { flexDirection: "row", gap: 9, borderRadius: 18, padding: 13, backgroundColor: "#F0F7F0", alignItems: "flex-start" },
  messageText: { flex: 1, color: "#46685A", fontSize: 13, lineHeight: 19 },
  clearButton: { alignSelf: "center", padding: 10 },
  clearText: { color: "#788A84", fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.7 },
});

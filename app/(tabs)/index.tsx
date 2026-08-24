import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Pill, PrimaryButton, SoftCard, Wordmark } from "@/components/refugio-ui";
import { haptic } from "@/lib/haptics";
import { useRefugio, type RefugioProfile } from "@/lib/refugio-store";

const avatars = ["🍄", "🌻", "🍵", "🐢", "🦊", "🐨", "🌈", "🫖", "📖", "🕯️", "🌌", "🪴", "🐺", "🦋", "🌊", "⛰️"];
const interests = ["Terapia", "Burnout", "TDAH", "Faculdade", "Luto de pet", "Amizade", "Autocuidado", "Vitórias pequenas"];
const filters = ["Para você", "Burnout", "Relacionamentos", "Vitórias pequenas"];

export default function MuralScreen() {
  const { isReady, profile, letters } = useRefugio();
  const [filter, setFilter] = useState("Para você");

  const visibleLetters = useMemo(() => {
    if (filter === "Para você") return letters;
    if (filter === "Relacionamentos") return letters.filter((letter) => letter.category.includes("ciclo") || letter.category.includes("Relacionamento"));
    return letters.filter((letter) => letter.category === filter);
  }, [filter, letters]);

  if (!isReady) {
    return <View style={styles.loading}><ActivityIndicator color="#2F6F8F" /></View>;
  }

  if (!profile) return <WelcomeFlow />;

  return (
    <View style={styles.screen}>
      <View style={styles.cloudOne} />
      <View style={styles.cloudTwo} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <Wordmark compact />
          <Pressable onPress={() => router.push("/(tabs)/jardim")} style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}>
            <Text style={styles.profileAvatar}>{profile.avatar}</Text>
          </Pressable>
        </View>

        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>SEU ESPAÇO DE PAZ</Text>
            <Text style={styles.greeting}>Olá, {profile.pseudonym}.</Text>
            <Text style={styles.subGreeting}>Que bom ter você por aqui. Vá no seu ritmo.</Text>
          </View>
          <View style={styles.sunBadge}><MaterialCommunityIcons name="white-balance-sunny" size={24} color="#B8934C" /></View>
        </View>

        <SoftCard style={styles.promptCard}>
          <View style={styles.promptIcon}><MaterialCommunityIcons name="feather" size={20} color="#2F6F8F" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promptTitle}>Tem algo ocupando espaço aí dentro?</Text>
            <Text style={styles.promptText}>Uma carta pode ser só o começo de um respiro.</Text>
          </View>
        </SoftCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cartas para acolher</Text>
          <Text style={styles.sectionHint}>sem pressa</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {filters.map((item) => <Pill key={item} label={item} active={item === filter} onPress={() => setFilter(item)} />)}
        </ScrollView>

        <View style={styles.lettersList}>
          {visibleLetters.map((letter) => (
            <Pressable
              key={letter.id}
              onPress={() => router.push(`/carta/${letter.id}` as never)}
              style={({ pressed }) => [styles.letterCard, pressed && styles.pressed]}
            >
              <View style={styles.letterTopline}>
                <View style={styles.authorBlock}>
                  <View style={styles.avatarBubble}><Text style={styles.avatarEmoji}>{letter.avatar}</Text></View>
                  <View>
                    <Text style={styles.authorName}>{letter.author}</Text>
                    <Text style={styles.timeLabel}>{letter.createdLabel}</Text>
                  </View>
                </View>
                <Pill label={letter.category} />
              </View>
              <Text style={styles.letterTitle}>{letter.title}</Text>
              <Text numberOfLines={3} style={styles.letterBody}>{letter.body}</Text>
              <View style={styles.letterFooter}>
                <View style={styles.energySummary}><MaterialCommunityIcons name="heart-outline" size={17} color="#B46D72" /><Text style={styles.energyText}>{letter.energies > 0 ? "alguém enviou energia" : "envie uma energia"}</Text></View>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#2F6F8F" />
              </View>
            </Pressable>
          ))}
          {!visibleLetters.length && <SoftCard><Text style={styles.emptyText}>Ainda não há cartas nesta trilha. Você pode ser o primeiro respiro aqui.</Text></SoftCard>}
        </View>
      </ScrollView>
    </View>
  );
}

function WelcomeFlow() {
  const { setProfile } = useRefugio();
  const [step, setStep] = useState(0);
  const [pseudonym, setPseudonym] = useState("");
  const [avatar, setAvatar] = useState("🌻");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Autocuidado"]);
  const [pactAccepted, setPactAccepted] = useState(false);

  const toggleInterest = (interest: string) => {
    haptic.light();
    setSelectedInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]);
  };
  const complete = () => {
    const nextProfile: RefugioProfile = {
      pseudonym: pseudonym.trim() || "Girassol sereno",
      avatar,
      interests: selectedInterests,
      pactAccepted: true,
    };
    haptic.success();
    setProfile(nextProfile);
  };

  return (
    <View style={styles.welcomeScreen}>
      <View style={styles.welcomeCloudOne} /><View style={styles.welcomeCloudTwo} />
      <ScrollView contentContainerStyle={styles.welcomeContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Wordmark />
        <View style={styles.stepper}>{[0, 1, 2].map((item) => <View key={item} style={[styles.stepDot, item <= step && styles.stepDotActive]} />)}</View>
        {step === 0 && <>
          <View style={styles.heroIllustration}><Text style={styles.heroEmoji}>🌿</Text><View style={styles.heroSun} /><View style={styles.heroGround} /></View>
          <Text style={styles.welcomeTitle}>Seu ponto de paz no barulho da internet.</Text>
          <Text style={styles.welcomeText}>Aqui, você pode desabafar, acolher e crescer sem precisar se explicar demais.</Text>
          <PrimaryButton label="Conhecer o Refúgio" onPress={() => setStep(1)} />
        </>}
        {step === 1 && <>
          <View style={styles.pactIcon}><MaterialCommunityIcons name="hand-heart" size={33} color="#2F6F8F" /></View>
          <Text style={styles.welcomeTitle}>Nosso Pacto de Empatia</Text>
          <SoftCard><Text style={styles.pactText}>Eu escolho falar com respeito, não diminuir a dor de ninguém e oferecer presença antes de qualquer conselho.</Text></SoftCard>
          <Pressable onPress={() => { haptic.light(); setPactAccepted(!pactAccepted); }} style={({ pressed }) => [styles.pactChoice, pactAccepted && styles.pactChoiceActive, pressed && styles.pressed]}>
            <View style={[styles.choiceCheck, pactAccepted && styles.choiceCheckActive]}>{pactAccepted && <MaterialCommunityIcons name="check" size={16} color="#FBF7EF" />}</View>
            <Text style={styles.pactChoiceText}>Eu aceito construir um espaço seguro.</Text>
          </Pressable>
          <PrimaryButton label="Continuar" onPress={() => pactAccepted && setStep(2)} icon="arrow-right" subdued={!pactAccepted} />
        </>}
        {step === 2 && <>
          <Text style={styles.welcomeTitle}>Como você quer ser lembrado aqui?</Text>
          <Text style={styles.welcomeText}>Você controla sua identidade. Use algo leve e só seu.</Text>
          <TextInput value={pseudonym} onChangeText={setPseudonym} placeholder="Escolha um pseudônimo" placeholderTextColor="#95A29E" style={styles.nameInput} maxLength={28} returnKeyType="done" />
          <Text style={styles.fieldLabel}>Escolha seu avatar</Text>
          <View style={styles.avatarGrid}>{avatars.map((item) => <Pressable key={item} onPress={() => { haptic.light(); setAvatar(item); }} style={({ pressed }) => [styles.avatarPick, avatar === item && styles.avatarPickActive, pressed && styles.pressed]}><Text style={styles.avatarEmoji}>{item}</Text></Pressable>)}</View>
          <Text style={styles.fieldLabel}>O que você quer encontrar por aqui?</Text>
          <View style={styles.interestGrid}>{interests.map((item) => <Pill key={item} label={item} active={selectedInterests.includes(item)} onPress={() => toggleInterest(item)} />)}</View>
          <PrimaryButton label="Entrar no Mural" onPress={complete} icon="door-open" />
        </>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FBF7EF" },
  content: { padding: 20, paddingBottom: 32, gap: 18 },
  cloudOne: { position: "absolute", top: 24, right: -32, width: 144, height: 144, borderRadius: 72, backgroundColor: "#E6F0F3" },
  cloudTwo: { position: "absolute", top: 170, left: -64, width: 125, height: 125, borderRadius: 63, backgroundColor: "#EAF2EA" },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  profileButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFDF8", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5DDD0" },
  profileAvatar: { fontSize: 22 },
  greetingRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginTop: 4 },
  eyebrow: { fontSize: 11, letterSpacing: 1.3, color: "#667C78", fontWeight: "800", marginBottom: 6 },
  greeting: { fontSize: 29, lineHeight: 34, letterSpacing: -1.1, color: "#163041", fontWeight: "700" },
  subGreeting: { color: "#60736E", fontSize: 15, lineHeight: 22, marginTop: 5 },
  sunBadge: { width: 49, height: 49, borderRadius: 18, backgroundColor: "#FAEFD9", alignItems: "center", justifyContent: "center" },
  promptCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#EAF2EA" },
  promptIcon: { width: 38, height: 38, borderRadius: 16, backgroundColor: "#FFFDF8", alignItems: "center", justifyContent: "center" },
  promptTitle: { color: "#315B4D", fontWeight: "700", fontSize: 15, lineHeight: 21 },
  promptText: { color: "#5F766E", fontSize: 13, lineHeight: 19, marginTop: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 7 },
  sectionTitle: { color: "#163041", fontWeight: "700", fontSize: 20, letterSpacing: -0.4 },
  sectionHint: { color: "#8B9B94", fontSize: 12 },
  filterList: { gap: 8, paddingRight: 18 },
  lettersList: { gap: 12 },
  letterCard: { backgroundColor: "#FFFCF6", padding: 17, borderRadius: 26, borderWidth: 1, borderColor: "#EAE1D4", gap: 12 },
  letterTopline: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "center" },
  authorBlock: { flexDirection: "row", gap: 9, alignItems: "center", flex: 1 },
  avatarBubble: { width: 37, height: 37, borderRadius: 14, backgroundColor: "#F6F0E4", alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 20 },
  authorName: { color: "#35544D", fontSize: 13, fontWeight: "700" },
  timeLabel: { color: "#889690", fontSize: 11, marginTop: 2 },
  letterTitle: { color: "#163041", fontSize: 18, lineHeight: 23, fontWeight: "700", letterSpacing: -0.25 },
  letterBody: { color: "#566B65", fontSize: 14, lineHeight: 21 },
  letterFooter: { borderTopWidth: 1, borderTopColor: "#F0E8DC", paddingTop: 11, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  energySummary: { flexDirection: "row", alignItems: "center", gap: 6 },
  energyText: { color: "#7C8884", fontSize: 12 },
  emptyText: { color: "#60736E", fontSize: 14, lineHeight: 21 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  welcomeScreen: { flex: 1, backgroundColor: "#FBF7EF" },
  welcomeContent: { padding: 24, paddingTop: 34, paddingBottom: 48, gap: 18 },
  welcomeCloudOne: { position: "absolute", top: 82, left: -85, width: 190, height: 190, borderRadius: 95, backgroundColor: "#EAF2EA" },
  welcomeCloudTwo: { position: "absolute", top: 300, right: -96, width: 200, height: 200, borderRadius: 100, backgroundColor: "#E6F0F3" },
  stepper: { flexDirection: "row", gap: 6, marginTop: 16 },
  stepDot: { height: 5, width: 26, borderRadius: 5, backgroundColor: "#DFE4DC" },
  stepDotActive: { backgroundColor: "#8EAA95" },
  heroIllustration: { height: 180, borderRadius: 36, backgroundColor: "#E6F0F3", overflow: "hidden", justifyContent: "flex-end", alignItems: "center", marginTop: 2 },
  heroEmoji: { fontSize: 92, zIndex: 2, marginBottom: -8 },
  heroSun: { position: "absolute", height: 94, width: 94, borderRadius: 47, backgroundColor: "#F7DFAE", top: 23, right: 45 },
  heroGround: { position: "absolute", height: 58, width: 360, borderRadius: 180, backgroundColor: "#B7D2BD", bottom: -32 },
  welcomeTitle: { color: "#163041", fontSize: 30, lineHeight: 36, letterSpacing: -1.1, fontWeight: "700", marginTop: 7 },
  welcomeText: { color: "#5B6E69", fontSize: 16, lineHeight: 24 },
  pactIcon: { width: 68, height: 68, borderRadius: 26, backgroundColor: "#E6F0F3", alignItems: "center", justifyContent: "center", marginTop: 10 },
  pactText: { color: "#405A54", fontSize: 16, lineHeight: 24, fontWeight: "500" },
  pactChoice: { backgroundColor: "#FFFDF8", borderRadius: 20, padding: 15, borderWidth: 1, borderColor: "#E5DDD0", flexDirection: "row", alignItems: "center", gap: 11 },
  pactChoiceActive: { borderColor: "#8EAA95", backgroundColor: "#F0F7F0" },
  choiceCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: "#A6B3AD", alignItems: "center", justifyContent: "center" },
  choiceCheckActive: { borderColor: "#2F6F8F", backgroundColor: "#2F6F8F" },
  pactChoiceText: { flex: 1, color: "#35544D", fontWeight: "600", fontSize: 14, lineHeight: 20 },
  nameInput: { minHeight: 52, borderRadius: 18, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E1D8C9", paddingHorizontal: 16, color: "#163041", fontSize: 16 },
  fieldLabel: { color: "#5E746E", fontSize: 13, fontWeight: "700", marginTop: 3 },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  avatarPick: { width: 42, height: 42, borderRadius: 15, backgroundColor: "#F5EFE5", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  avatarPickActive: { borderColor: "#2F6F8F", backgroundColor: "#E6F0F3" },
  interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});

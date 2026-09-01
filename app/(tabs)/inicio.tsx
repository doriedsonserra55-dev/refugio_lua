import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { SoftCard, Wordmark } from "@/components/refugio-ui";
import { haptic } from "@/lib/haptics";
import { useRefugio } from "@/lib/refugio-store";
import { useAuth } from "@/hooks/use-auth";

const WELCOME_IMAGE = require("@/assets/images/welcome-community.png");

export default function InicioScreen() {
  const { profile, letters } = useRefugio();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const effectiveProfile = profile ?? (isAuthenticated ? {
    pseudonym: user?.name?.trim().split(/\s+/)[0] || "Amigo do Refúgio",
    avatar: "🌻",
    interests: [],
  } : null);
  const openDesabafar = () => { haptic.light(); router.push("/(tabs)/escrever" as never); };
  const openAconselhar = () => { haptic.light(); router.push(letters[0] ? `/carta/${letters[0].id}` as never : "/(tabs)/index" as never); };

  // A sessão Supabase, e não o perfil anônimo persistido, define se o convite de login aparece.
  if (authLoading || !effectiveProfile) return <WelcomeLanding />;

  return (
    <View style={styles.screen}>
      <View style={styles.circleOne} /><View style={styles.circleTwo} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Wordmark compact />
        <Text style={styles.eyebrow}>BEM-VINDO AO SEU REFÚGIO</Text>
        <Text style={styles.title}>Olá, {effectiveProfile.pseudonym}.</Text>
        <Text style={styles.subtitle}>Aqui você pode colocar a dor em palavras ou oferecer presença a alguém.</Text>
        <Pressable accessibilityRole="button" onPress={openDesabafar} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
          <View style={styles.actionIcon}><MaterialCommunityIcons name="feather" size={27} color="#FFFDF8" /></View>
          <View style={styles.actionCopy}><Text style={styles.actionTitle}>Desabafar</Text><Text style={styles.actionText}>Escreva com calma, sem precisar se explicar demais.</Text></View>
          <MaterialCommunityIcons name="arrow-right" size={23} color="#FFFDF8" />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={openAconselhar} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
          <View style={styles.secondaryIcon}><MaterialCommunityIcons name="hand-heart-outline" size={25} color="#2F6F8F" /></View>
          <View style={styles.actionCopy}><Text style={styles.secondaryTitle}>Aconselhar</Text><Text style={styles.secondaryText}>Leia uma carta e ofereça cuidado em suas palavras.</Text></View>
          <MaterialCommunityIcons name="arrow-right" size={23} color="#2F6F8F" />
        </Pressable>
        <SoftCard style={styles.noteCard}>
          <MaterialCommunityIcons name="head-heart-outline" size={22} color="#587C6D" />
          <Text style={styles.noteText}>O Pacto de Empatia vem antes de qualquer conselho. Não há pressa para sentir nem obrigação de responder.</Text>
        </SoftCard>
        <View style={styles.muralHint}><Text style={styles.hintTitle}>Cartas esperando cuidado</Text><Text style={styles.hintText}>Explore o Mural quando quiser encontrar outras histórias.</Text><Pressable onPress={() => router.push("/(tabs)" as never)}><Text style={styles.link}>Abrir o Mural</Text></Pressable></View>
      </ScrollView>
    </View>
  );
}

function WelcomeLanding() {
  const openAccount = () => { haptic.light(); router.push("/conta" as never); };
  const continueAnonymous = () => { haptic.light(); router.push("/(tabs)/index" as never); };

  return (
    <View style={styles.screen}>
      <View style={styles.circleOne} /><View style={styles.circleTwo} />
      <ScrollView contentContainerStyle={styles.landingContent} showsVerticalScrollIndicator={false}>
        <View style={styles.landingTopbar}><Wordmark /></View>
        <View style={styles.heroCard}>
          <Image accessibilityLabel="Três pessoas conversando com acolhimento em uma sala iluminada" source={WELCOME_IMAGE} contentFit="cover" style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>UM ESPAÇO DE PAZ</Text>
            <Text style={styles.heroTitle}>Você não precisa carregar tudo sozinho.</Text>
            <Text style={styles.heroText}>No Refúgio da Lua, sentimentos cabem em palavras, silêncios e pequenos gestos de cuidado.</Text>
          </View>
        </View>
        <Text style={styles.landingIntroTitle}>Por que fazer parte?</Text>
        <Text style={styles.landingIntroText}>Porque ser ouvido muda o peso de um dia. E oferecer presença também pode transformar a história de alguém.</Text>
        <View style={styles.benefitGrid}>
          <Benefit icon="incognito" title="Privacidade" text="Use um pseudônimo e escolha o que deseja compartilhar." />
          <Benefit icon="feather" title="Desabafo" text="Escreva no seu tempo, sem julgamento e sem cobrança." />
          <Benefit icon="hand-heart-outline" title="Presença" text="Encontre cartas e responda com empatia, quando quiser." />
        </View>
        <SoftCard style={styles.trustCard}>
          <View style={styles.trustIcon}><MaterialCommunityIcons name="book-heart-outline" size={22} color="#2F6F8F" /></View>
          <View style={styles.trustCopy}><Text style={styles.trustTitle}>Um lugar para chegar como você está</Text><Text style={styles.trustText}>Sua conta ajuda a guardar o seu Jardim e sincronizar seu progresso. Você decide o que fica visível.</Text></View>
        </SoftCard>
        <Pressable accessibilityRole="button" accessibilityLabel="Entrar ou criar uma conta no Refúgio da Lua" onPress={openAccount} style={({ pressed }) => [styles.loginAction, pressed && styles.pressed]}>
          <View style={styles.loginActionCopy}><Text style={styles.loginActionTitle}>Entrar no Refúgio</Text><Text style={styles.loginActionText}>Acesse ou crie sua conta gratuitamente</Text></View>
          <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFDF8" />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={continueAnonymous} style={({ pressed }) => [styles.anonymousAction, pressed && styles.pressed]}>
          <Text style={styles.anonymousActionText}>Quero conhecer sem criar conta agora</Text>
          <MaterialCommunityIcons name="arrow-down" size={17} color="#2F6F8F" />
        </Pressable>
        <Text style={styles.safetyNote}>O Refúgio é um espaço de apoio entre pessoas e não substitui atendimento profissional. Em uma emergência, procure os serviços de urgência da sua região.</Text>
      </ScrollView>
    </View>
  );
}

function Benefit({ icon, title, text }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; text: string }) {
  return <View style={styles.benefit}><View style={styles.benefitIcon}><MaterialCommunityIcons name={icon} size={20} color="#2F6F8F" /></View><Text style={styles.benefitTitle}>{title}</Text><Text style={styles.benefitText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" }, content: { padding: 20, paddingBottom: 32, gap: 18 }, landingContent: { padding: 20, paddingTop: 24, paddingBottom: 40, gap: 18 },
  circleOne: { position: "absolute", width: 210, height: 210, borderRadius: 105, backgroundColor: "#E6F0F3", right: -105, top: 66 }, circleTwo: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#EAF2EA", left: -100, top: 300 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, landingTopbar: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start" },
  eyebrow: { marginTop: 20, color: "#667C78", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }, title: { color: "#163041", fontSize: 31, fontWeight: "700", letterSpacing: -1, marginTop: -7 }, subtitle: { color: "#58736F", fontSize: 16, lineHeight: 24, marginBottom: 3 },
  heroCard: { minHeight: 360, borderRadius: 30, overflow: "hidden", backgroundColor: "#DCE8DE", justifyContent: "flex-end", position: "relative" }, heroImage: { ...StyleSheet.absoluteFillObject }, heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(22,48,65,0.28)" }, heroCopy: { padding: 24, gap: 8, maxWidth: 390 }, heroEyebrow: { color: "#FAEFD9", fontSize: 11, fontWeight: "800", letterSpacing: 1.4 }, heroTitle: { color: "#FFFDF8", fontSize: 30, lineHeight: 35, letterSpacing: -1, fontWeight: "700" }, heroText: { color: "#F5F3EA", fontSize: 15, lineHeight: 22 },
  landingIntroTitle: { color: "#163041", fontSize: 25, lineHeight: 30, letterSpacing: -0.6, fontWeight: "700", marginTop: 2 }, landingIntroText: { color: "#58736F", fontSize: 16, lineHeight: 24, marginTop: -8 }, benefitGrid: { gap: 10 }, benefit: { backgroundColor: "#FFFDF8", borderRadius: 22, padding: 15, borderWidth: 1, borderColor: "#EAE1D4" }, benefitIcon: { width: 38, height: 38, borderRadius: 15, backgroundColor: "#E6F0F3", alignItems: "center", justifyContent: "center", marginBottom: 9 }, benefitTitle: { color: "#163041", fontSize: 16, fontWeight: "700" }, benefitText: { color: "#637770", fontSize: 13, lineHeight: 19, marginTop: 3 },
  trustCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#EEF5EB" }, trustIcon: { width: 40, height: 40, borderRadius: 15, backgroundColor: "#FFFDF8", alignItems: "center", justifyContent: "center" }, trustCopy: { flex: 1, gap: 3 }, trustTitle: { color: "#315B4D", fontSize: 15, fontWeight: "700" }, trustText: { color: "#5C7169", fontSize: 13, lineHeight: 19 },
  loginAction: { backgroundColor: "#2F6F8F", borderRadius: 27, minHeight: 68, paddingHorizontal: 20, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: "#2F6F8F", shadowOpacity: 0.16, shadowRadius: 14, elevation: 3 }, loginActionCopy: { flex: 1, gap: 2 }, loginActionTitle: { color: "#FFFDF8", fontSize: 18, fontWeight: "700" }, loginActionText: { color: "#E6F0F3", fontSize: 12, lineHeight: 17 }, anonymousAction: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 4 }, anonymousActionText: { color: "#2F6F8F", fontSize: 13, fontWeight: "700" }, safetyNote: { color: "#87958F", fontSize: 11, lineHeight: 16, textAlign: "center", paddingHorizontal: 12 },
  primaryAction: { backgroundColor: "#2F6F8F", borderRadius: 28, padding: 18, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#2F6F8F", shadowOpacity: 0.15, shadowRadius: 14, elevation: 3 }, secondaryAction: { backgroundColor: "#FFFDF8", borderRadius: 28, padding: 18, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#DCE8DE" }, actionIcon: { height: 48, width: 48, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" }, secondaryIcon: { height: 48, width: 48, borderRadius: 18, backgroundColor: "#E6F0F3", alignItems: "center", justifyContent: "center" }, actionCopy: { flex: 1 }, actionTitle: { color: "#FFFDF8", fontSize: 18, fontWeight: "700" }, actionText: { color: "#E6F0F3", fontSize: 12, lineHeight: 18, marginTop: 2 }, secondaryTitle: { color: "#163041", fontSize: 18, fontWeight: "700" }, secondaryText: { color: "#58736F", fontSize: 12, lineHeight: 18, marginTop: 2 }, noteCard: { flexDirection: "row", gap: 10, backgroundColor: "#EEF5EB", alignItems: "flex-start" }, noteText: { flex: 1, color: "#4D6960", fontSize: 13, lineHeight: 19 }, muralHint: { padding: 18, borderRadius: 25, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#EBE1D5", gap: 6 }, hintTitle: { color: "#163041", fontSize: 17, fontWeight: "700" }, hintText: { color: "#6B8079", fontSize: 13, lineHeight: 19 }, link: { color: "#2F6F8F", fontSize: 13, fontWeight: "700", marginTop: 4 }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});

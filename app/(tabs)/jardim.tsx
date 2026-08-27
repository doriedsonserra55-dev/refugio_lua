import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton, SoftCard, Wordmark } from "@/components/refugio-ui";
import { useAuth } from "@/hooks/use-auth";
import { haptic } from "@/lib/haptics";
import { useRefugio } from "@/lib/refugio-store";
import { trpc } from "@/lib/trpc";

export default function GardenScreen() {
  const { isReady, profile, energyCount, adviceCount, helpedCount, journal, addJournal, getGardenSnapshot, restoreGardenSnapshot, clearLocalData } = useRefugio();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [accountActionError, setAccountActionError] = useState("");
  const [syncState, setSyncState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const latestGarden = useRef(getGardenSnapshot());
  const restoredAccountId = useRef<number | null>(null);
  const snapshotQuery = trpc.garden.snapshot.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const saveSnapshot = trpc.garden.save.useMutation();
  const deleteAccount = trpc.auth.deleteAccount.useMutation();
  const planQuery = trpc.plans.current.useQuery(undefined, { enabled: isAuthenticated, retry: false });

  useEffect(() => { if (isReady && !profile) router.replace("/"); }, [isReady, profile]);
  useEffect(() => { latestGarden.current = getGardenSnapshot(); }, [profile, journal, energyCount, adviceCount, helpedCount, getGardenSnapshot]);

  useEffect(() => {
    if (!isAuthenticated || !user || snapshotQuery.isPending || restoredAccountId.current === user.id) return;
    if (snapshotQuery.data) restoreGardenSnapshot(snapshotQuery.data);
    restoredAccountId.current = user.id;
    setSyncState(snapshotQuery.data ? "saved" : "idle");
  }, [isAuthenticated, restoreGardenSnapshot, snapshotQuery.data, snapshotQuery.isPending, user]);

  const syncGarden = useCallback(async () => {
    if (!isAuthenticated) return;
    setSyncState("saving");
    try {
      await saveSnapshot.mutateAsync(latestGarden.current);
      setSyncState("saved");
    } catch {
      setSyncState("error");
    }
  }, [isAuthenticated, saveSnapshot]);

  useEffect(() => {
    if (!isAuthenticated || restoredAccountId.current !== user?.id) return;
    const timer = setTimeout(() => { void syncGarden(); }, 900);
    return () => clearTimeout(timer);
  }, [profile, journal, energyCount, adviceCount, helpedCount, isAuthenticated, snapshotQuery.isPending, syncGarden, user?.id]);

  const level = useMemo(() => {
    if (energyCount >= 100 && adviceCount >= 10) return { name: "Árvore frondosa", symbol: "🌳", next: "Você se tornou uma presença acolhedora por aqui." };
    if (energyCount >= 30 && adviceCount >= 5) return { name: "Ramo em crescimento", symbol: "🌿", next: "Continue oferecendo presença para cultivar sua árvore." };
    return { name: "Seu primeiro brotinho", symbol: "🌱", next: "Cada gesto de cuidado ajuda suas raízes a crescer." };
  }, [energyCount, adviceCount]);

  const saveJournal = () => {
    if (!note.trim()) return;
    haptic.success();
    addJournal(note);
    setNote("");
  };

  const isVip = planQuery.data?.plan === "vip_monthly" || planQuery.data?.plan === "vip_annual";

  const leaveAccount = async () => {
    setAccountActionError("");
    await logout();
    restoredAccountId.current = null;
    setSyncState("idle");
    haptic.success();
  };

  const permanentlyDeleteAccount = async () => {
    setAccountActionError("");
    try {
      await deleteAccount.mutateAsync();
      await logout();
      await clearLocalData();
      haptic.success();
      router.replace("/inicio" as never);
    } catch (cause) {
      setAccountActionError(cause instanceof Error ? cause.message : "Não foi possível excluir o cadastro agora.");
      haptic.warning();
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.backgroundCircle} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}><Wordmark compact /><View style={styles.userBadge}><Text style={styles.userAvatar}>{profile?.avatar ?? "🌻"}</Text><Text style={styles.userName}>{profile?.pseudonym ?? "Seu jardim"}</Text></View></View>
        <Text style={styles.eyebrow}>SEU JARDIM PRIVADO</Text>
        <Text style={styles.title}>A empatia também deixa raízes.</Text>
        <SoftCard style={styles.treeCard}>
          <View style={styles.treeIllustration}><View style={styles.treeHalo} /><Text style={styles.treeEmoji}>{level.symbol}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.treeLevel}>{level.name}</Text><Text style={styles.treeCopy}>{level.next}</Text></View>
        </SoftCard>
        <SoftCard style={styles.accountCard}>
          <View style={styles.accountHeading}>
            <View style={styles.accountIcon}><MaterialCommunityIcons name={isAuthenticated ? "cloud-check-outline" : "cloud-outline"} size={20} color="#2F6F8F" /></View>
            <View style={styles.accountCopyWrap}>
              <Text style={styles.accountTitle}>{isAuthenticated ? "Seu Jardim está na sua conta" : "Leve seu Jardim com você"}</Text>
              <Text style={styles.accountCopy}>{isAuthenticated ? `Conectado como ${user?.name ?? "sua conta"}.` : "Entre para salvar seu progresso e retomá-lo em outro dispositivo."}</Text>
            </View>
          </View>
          {authLoading ? <Text style={styles.syncHint}>Verificando sua conta…</Text> : isAuthenticated ? (
            <>
              <Text style={[styles.syncHint, syncState === "error" && styles.syncError]}>{syncState === "saving" ? "Sincronizando mudanças…" : syncState === "error" ? "Não foi possível sincronizar agora. Tente novamente." : "Progresso salvo com segurança."}</Text>
              <PrimaryButton label={syncState === "saving" ? "Sincronizando…" : "Sincronizar agora"} onPress={() => { void syncGarden(); }} icon="cloud-upload-outline" subdued />
              <Pressable accessibilityRole="button" onPress={() => { void leaveAccount(); }} style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}><Text style={styles.signOutText}>Sair da conta neste dispositivo</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => { setAccountActionError(""); setConfirmDelete(true); }} style={({ pressed }) => [styles.deleteAccount, pressed && styles.pressed]}><Text style={styles.deleteAccountText}>Excluir meu cadastro</Text></Pressable>
              {confirmDelete ? <View style={styles.deleteConfirm}><Text style={styles.deleteTitle}>Excluir cadastro definitivamente?</Text><Text style={styles.deleteCopy}>Seu login, Jardim sincronizado e dados privados desta conta serão removidos. Esta ação não pode ser desfeita.</Text>{accountActionError ? <Text style={styles.deleteError}>{accountActionError}</Text> : null}<View style={styles.deleteActions}><Pressable accessibilityRole="button" onPress={() => setConfirmDelete(false)} style={styles.cancelDelete}><Text style={styles.cancelDeleteText}>Cancelar</Text></Pressable><Pressable accessibilityRole="button" disabled={deleteAccount.isPending} onPress={() => { void permanentlyDeleteAccount(); }} style={styles.confirmDelete}><Text style={styles.confirmDeleteText}>{deleteAccount.isPending ? "Excluindo…" : "Sim, excluir"}</Text></Pressable></View></View> : null}
            </>
          ) : <PrimaryButton label="Entrar ou criar conta" onPress={() => router.push("/conta" as never)} icon="account-circle-outline" />}
        </SoftCard>
        <SoftCard style={styles.progressCard}><Text style={styles.progressTitle}>Seu cuidado em movimento</Text><ProgressRow label="Energias enviadas" value={energyCount} /><ProgressRow label="Conselhos dados" value={adviceCount} /><ProgressRow label="“Isso me ajudou” recebidos" value={helpedCount} /><View style={styles.progressLine}><View style={[styles.progressFill, { width: `${Math.min(100, ((energyCount + adviceCount * 6) / 60) * 100)}%` }]} /></View><Text style={styles.progressHint}>Próximo: 30 energias + 5 conselhos</Text></SoftCard>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Selos que você cultiva</Text><Text style={styles.sectionHint}>com carinho</Text></View>
        <View style={styles.badgesRow}>
          <Badge emoji="🫂" name="Abraço Virtual" active={energyCount >= 30} />
          <Badge emoji="🌙" name="Ouvinte da Madrugada" active={adviceCount >= 3} />
          <Badge emoji="🕯️" name="Noite Acolhida" active={adviceCount >= 10} />
        </View>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Diário Emocional (privado)</Text><MaterialCommunityIcons name="lock-outline" size={17} color="#7B8C86" /></View>
        <SoftCard style={styles.journalCard}>
          <TextInput value={note} onChangeText={setNote} multiline placeholder="Anote aqui sentimentos que não precisa compartilhar…" placeholderTextColor="#9AA49E" style={styles.journalInput} textAlignVertical="top" />
          <PrimaryButton label="Guardar no diário privado" onPress={saveJournal} icon="leaf" subdued />
        </SoftCard>
        {journal.slice(0, 2).map((entry, index) => <View key={`${entry}-${index}`} style={styles.journalEntry}><MaterialCommunityIcons name="leaf" size={15} color="#8EAA95" /><Text style={styles.journalText}>{entry}</Text></View>)}
        <VipFeature title="📦 Caixa da Memória" label="VIP Anual" text="Guarde conselhos que tocaram você e revisite-os quando precisar." onPress={() => router.push("/planos" as never)} />
        <VipFeature title="🎧 Sons de Paz" label="VIP Anual" text={isVip ? "Escolha um som para acompanhar este momento." : "Chuva, floresta e lareira disponíveis no plano Anual."} onPress={() => router.push("/planos" as never)} soundOptions />
        <Pressable onPress={() => router.push("/planos" as never)} style={({ pressed }) => [styles.vipBanner, pressed && styles.pressed]}><Text style={styles.vipTitle}>Refúgio VIP</Text><Text style={styles.vipText}>Cartas ilimitadas · Diário com senha · Árvore especial e muito mais</Text><Text style={styles.vipLink}>Ver planos e benefícios</Text></Pressable>
        <Pressable onPress={() => { haptic.light(); router.push("/apoio" as never); }} style={({ pressed }) => [styles.supportLink, pressed && styles.pressed]}><MaterialCommunityIcons name="lifebuoy" size={18} color="#2F6F8F" /><Text style={styles.supportText}>Precisa de apoio agora?</Text><MaterialCommunityIcons name="chevron-right" size={18} color="#2F6F8F" /></Pressable>
      </ScrollView>
    </View>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return <View style={styles.progressRow}><Text style={styles.progressLabel}>{label}</Text><Text style={styles.progressValue}>{value}</Text></View>;
}

function Badge({ emoji, name, active }: { emoji: string; name: string; active: boolean }) {
  return <View style={[styles.badge, active && styles.badgeActive]}><Text style={styles.badgeEmoji}>{emoji}</Text><Text style={styles.badgeName}>{name}</Text>{!active && <Text style={styles.badgeLock}>em cultivo</Text>}</View>;
}

function VipFeature({ title, label, text, onPress, soundOptions = false }: { title: string; label: string; text: string; onPress: () => void; soundOptions?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.vipFeature, pressed && styles.pressed]}><View style={styles.vipFeatureHead}><Text style={styles.vipFeatureTitle}>{title}</Text><Text style={styles.vipTag}>{label}</Text></View><Text style={styles.vipFeatureText}>{text}</Text>{soundOptions ? <View style={styles.soundRow}>{["🌧️\nChuva", "🌲\nFloresta", "🔥\nLareira"].map((sound) => <View key={sound} style={styles.soundOption}><Text style={styles.soundText}>{sound}</Text></View>)}</View> : null}</Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" },
  backgroundCircle: { position: "absolute", height: 230, width: 230, borderRadius: 115, right: -110, top: 80, backgroundColor: "#EAF2EA" },
  content: { padding: 20, paddingBottom: 35, gap: 17 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFDF8", borderRadius: 18, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: "#E6DDCF" },
  userAvatar: { fontSize: 17 }, userName: { color: "#56736A", fontSize: 11, fontWeight: "700", maxWidth: 104 },
  eyebrow: { color: "#667C78", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginTop: 7 },
  title: { color: "#163041", fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.9 },
  treeCard: { backgroundColor: "#EDF5EC", flexDirection: "row", alignItems: "center", gap: 13 },
  treeIllustration: { width: 78, height: 78, alignItems: "center", justifyContent: "center" },
  treeHalo: { position: "absolute", height: 72, width: 72, borderRadius: 36, backgroundColor: "#D8EAD5" },
  treeEmoji: { fontSize: 43 }, treeLevel: { color: "#315B4D", fontSize: 17, fontWeight: "700" },
  treeCopy: { color: "#5A746B", fontSize: 13, lineHeight: 19, marginTop: 4 },
  accountCard: { gap: 13, backgroundColor: "#F2F7F8" }, accountHeading: { flexDirection: "row", gap: 11, alignItems: "flex-start" }, accountIcon: { width: 37, height: 37, borderRadius: 18.5, backgroundColor: "#DCECF0", alignItems: "center", justifyContent: "center" }, accountCopyWrap: { flex: 1 }, accountTitle: { color: "#163041", fontSize: 15, lineHeight: 20, fontWeight: "700" }, accountCopy: { color: "#58736F", fontSize: 12, lineHeight: 18, marginTop: 3 }, syncHint: { color: "#58736F", fontSize: 12, lineHeight: 17 }, syncError: { color: "#A65D62" }, signOut: { alignSelf: "center", paddingVertical: 4 }, signOutText: { color: "#55716A", fontSize: 12, fontWeight: "700", textDecorationLine: "underline" }, deleteAccount: { alignSelf: "center", paddingVertical: 4 }, deleteAccountText: { color: "#A65D62", fontSize: 12, fontWeight: "700", textDecorationLine: "underline" }, deleteConfirm: { gap: 9, padding: 14, borderRadius: 18, backgroundColor: "#FFF4F3", borderWidth: 1, borderColor: "#EBCDCF" }, deleteTitle: { color: "#8F4D52", fontSize: 14, fontWeight: "800" }, deleteCopy: { color: "#875D60", fontSize: 12, lineHeight: 18 }, deleteError: { color: "#A65D62", fontSize: 12, lineHeight: 17 }, deleteActions: { flexDirection: "row", gap: 9, justifyContent: "flex-end" }, cancelDelete: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 16, backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E2D9CC" }, cancelDeleteText: { color: "#5A746B", fontSize: 12, fontWeight: "700" }, confirmDelete: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 16, backgroundColor: "#A65D62" }, confirmDeleteText: { color: "#FFFDF8", fontSize: 12, fontWeight: "800" },
  progressCard: { gap: 10, backgroundColor: "#FFFDF8" }, progressTitle: { color: "#163041", fontSize: 18, fontWeight: "700" }, progressRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, progressLabel: { color: "#5B716A", fontSize: 14 }, progressValue: { color: "#587C6D", fontSize: 15, fontWeight: "700" }, progressLine: { height: 8, backgroundColor: "#E2ECDE", borderRadius: 4, overflow: "hidden", marginTop: 4 }, progressFill: { height: "100%", backgroundColor: "#8EAA95", borderRadius: 4 }, progressHint: { color: "#899790", textAlign: "center", fontSize: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  sectionTitle: { color: "#163041", fontSize: 19, fontWeight: "700", letterSpacing: -0.3 }, sectionHint: { color: "#8A9993", fontSize: 11 },
  badgesRow: { flexDirection: "row", gap: 8 },
  badge: { flex: 1, minHeight: 124, borderRadius: 20, backgroundColor: "#F1EEE6", padding: 11, alignItems: "center", justifyContent: "center", gap: 5, opacity: 0.68 }, badgeActive: { backgroundColor: "#FFF8E7", opacity: 1, borderWidth: 1, borderColor: "#E5CF98" }, badgeEmoji: { fontSize: 28 }, badgeName: { color: "#4E665E", textAlign: "center", fontSize: 11, lineHeight: 15, fontWeight: "700" }, badgeLock: { color: "#87958F", fontSize: 9 },
  journalCard: { gap: 12 }, journalInput: { minHeight: 88, color: "#405A54", fontSize: 15, lineHeight: 22 },
  journalEntry: { flexDirection: "row", gap: 9, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FFFDF8", borderRadius: 16, alignItems: "flex-start" }, journalText: { flex: 1, color: "#5C716A", fontSize: 13, lineHeight: 19 },
  vipFeature: { gap: 9, backgroundColor: "#FFFDF8", borderRadius: 25, padding: 17, borderWidth: 1, borderColor: "#E7DED0" }, vipFeatureHead: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "center" }, vipFeatureTitle: { color: "#263D45", fontSize: 18, fontWeight: "700" }, vipTag: { color: "#B8934C", fontSize: 12, fontWeight: "700" }, vipFeatureText: { color: "#728078", fontSize: 13, lineHeight: 19 }, soundRow: { flexDirection: "row", gap: 8 }, soundOption: { flex: 1, minHeight: 72, borderRadius: 18, backgroundColor: "#F0F5EE", alignItems: "center", justifyContent: "center" }, soundText: { textAlign: "center", color: "#3C5750", fontSize: 13, lineHeight: 20 }, vipBanner: { alignItems: "center", gap: 7, padding: 20, borderRadius: 28, backgroundColor: "#EAF1F1" }, vipTitle: { color: "#2F6F8F", fontSize: 22, fontWeight: "700" }, vipText: { color: "#536E65", textAlign: "center", fontSize: 14, lineHeight: 20 }, vipLink: { color: "#FFFDF8", fontSize: 14, fontWeight: "700", backgroundColor: "#B8934C", paddingHorizontal: 20, paddingVertical: 11, borderRadius: 22, marginTop: 4 },
  supportLink: { flexDirection: "row", gap: 8, alignItems: "center", padding: 15, backgroundColor: "#E6F0F3", borderRadius: 20 }, supportText: { flex: 1, color: "#2F6F8F", fontSize: 14, fontWeight: "700" }, pressed: { opacity: 0.72 },
});

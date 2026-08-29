import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

import { haptic } from "@/lib/haptics";

const REFUGIO_LOGO = require("@/assets/images/Logo_RefugiodaLua_00.png");
const PHRASE_BACKGROUND = require("@/assets/images/brand-peace-background.png");

export function Wordmark({ compact = false, showPhrase = true }: { compact?: boolean; showPhrase?: boolean }) {
  const entrance = useRef(new Animated.Value(0)).current;
  const [fontsLoaded] = useFonts({ Montserrat_600SemiBold });
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    entrance.setValue(reduceMotion ? 1 : 0);
    if (!reduceMotion) {
      Animated.timing(entrance, {
        toValue: 1,
        duration: 850,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [entrance, reduceMotion]);

  const animatedStyle = {
    opacity: entrance,
    transform: [
      { perspective: 900 },
      { rotateY: entrance.interpolate({ inputRange: [0, 1], outputRange: ["18deg", "0deg"] }) },
      { rotateX: entrance.interpolate({ inputRange: [0, 1], outputRange: ["10deg", "0deg"] }) },
      { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
      { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
    ],
  };

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel="O Refúgio — um espaço de paz — Seu lugar de paz"
      style={[styles.wordmark, compact ? styles.wordmarkCompact : styles.wordmarkFull, animatedStyle]}
    >
      <Image source={REFUGIO_LOGO} contentFit="contain" transition={120} style={[styles.wordmarkImage, compact ? styles.wordmarkImageCompact : styles.wordmarkImageFull]} />
      {showPhrase ? (
        <View accessible accessibilityRole="text" accessibilityLabel="Seu lugar de paz" style={[styles.phraseArt, compact && styles.phraseArtCompact]}>
          <Image accessibilityIgnoresInvertColors source={PHRASE_BACKGROUND} contentFit="fill" style={styles.phraseBackground} />
          <View pointerEvents="none" style={styles.phraseVeil} />
          <View pointerEvents="none" style={[styles.phraseFrame, compact && styles.phraseFrameCompact]} />
          <View pointerEvents="none" style={[styles.phraseOrb, compact && styles.phraseOrbCompact]} />
          <Text numberOfLines={2} style={[styles.wordmarkPhrase, fontsLoaded && styles.wordmarkPhraseFont, compact && styles.wordmarkPhraseCompact]}>Seu lugar de paz</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptic.light();
        onPress?.();
      }}
      style={({ pressed }) => [styles.pill, active && styles.pillActive, pressed && styles.pressed]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress, icon = "arrow-right", subdued = false }: { label: string; onPress: () => void; icon?: keyof typeof MaterialCommunityIcons.glyphMap; subdued?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [styles.primaryButton, subdued && styles.primaryButtonSubdued, pressed && styles.pressed]}
    >
      <Text style={[styles.primaryButtonText, subdued && styles.primaryButtonTextSubdued]}>{label}</Text>
      <MaterialCommunityIcons name={icon} size={19} color={subdued ? "#2F6F8F" : "#FBF7EF"} />
    </Pressable>
  );
}

export function SoftCard({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  wordmark: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 14, zIndex: 2 },
  wordmarkFull: { minHeight: 124 },
  wordmarkCompact: { minHeight: 88, flexShrink: 1 },
  wordmarkImage: { width: 142, height: 124 },
  wordmarkImageFull: { width: 142, height: 124 },
  wordmarkImageCompact: { width: 100, height: 88 },
  phraseArt: { position: "relative", flex: 1, minWidth: 0, height: 124, justifyContent: "center", alignItems: "center", paddingHorizontal: 22, paddingVertical: 16, borderRadius: 24, backgroundColor: "#EAF1EC", borderWidth: 1, borderColor: "#A8C2B5", overflow: "hidden", shadowColor: "#24493F", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 5 },
  phraseArtCompact: { height: 86, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  phraseBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.72 },
  phraseVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: "#F8F2E7", opacity: 0.24 },
  phraseFrame: { ...StyleSheet.absoluteFillObject, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.68)" },
  phraseFrameCompact: { borderRadius: 18 },
  phraseOrb: { position: "absolute", width: 22, height: 22, borderRadius: 11, right: 18, top: 10, backgroundColor: "rgba(225, 239, 231, 0.8)", borderWidth: 1, borderColor: "#9DBAAC", shadowColor: "#52796C", shadowOpacity: 0.22, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  phraseOrbCompact: { width: 14, height: 14, borderRadius: 7, right: 11, top: 7 },
  wordmarkPhrase: { zIndex: 2, maxWidth: "92%", textAlign: "center", color: "#244D41", fontSize: 30, fontWeight: "700", lineHeight: 34, letterSpacing: 0.8, textShadowColor: "rgba(255, 255, 255, 0.85)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  wordmarkPhraseFont: { fontFamily: "Montserrat_600SemiBold" },
  wordmarkPhraseCompact: { maxWidth: "92%", fontSize: 17, lineHeight: 21, letterSpacing: 0.25 },
  pill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: "#F2EEE5", borderWidth: 1, borderColor: "#E5DDD0" },
  pillActive: { backgroundColor: "#DCEAE2", borderColor: "#8EAA95" },
  pillText: { color: "#596B66", fontSize: 13, fontWeight: "600" },
  pillTextActive: { color: "#315B4D" },
  primaryButton: { minHeight: 52, borderRadius: 26, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#2F6F8F" },
  primaryButtonSubdued: { backgroundColor: "#E6F0F3" },
  primaryButtonText: { color: "#FBF7EF", fontSize: 16, fontWeight: "700" },
  primaryButtonTextSubdued: { color: "#2F6F8F" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  card: { backgroundColor: "#FFFCF6", borderRadius: 26, padding: 18, borderWidth: 1, borderColor: "#EAE1D4", shadowColor: "#163041", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
});

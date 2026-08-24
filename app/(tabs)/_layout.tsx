import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 10);

  return (
    <Tabs
      initialRouteName="inicio"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2F6F8F",
        tabBarInactiveTintColor: "#7A8E88",
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: {
          height: 62 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          backgroundColor: colors.background,
          borderTopColor: "#E7DED0",
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: "Início", tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={23} color={color} /> }} />
      <Tabs.Screen name="index" options={{ title: "Mural", tabBarIcon: ({ color }) => <IconSymbol name="newspaper.fill" size={23} color={color} /> }} />
      <Tabs.Screen name="escrever" options={{ title: "Desabafar", tabBarIcon: ({ color }) => <IconSymbol name="envelope.fill" size={24} color={color} /> }} />
      <Tabs.Screen name="jardim" options={{ title: "Jardim", tabBarIcon: ({ color }) => <IconSymbol name="tree.fill" size={23} color={color} /> }} />
    </Tabs>
  );
}

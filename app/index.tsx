import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/hooks/use-auth";

export default function RootIndex() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FBF7EF" }}><ActivityIndicator color="#2F6F8F" /></View>;
  return <Redirect href={(isAuthenticated ? "/mural" : "/inicio") as never} />;
}

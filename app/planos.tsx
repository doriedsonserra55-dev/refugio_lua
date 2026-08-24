import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton, SoftCard, Wordmark } from "@/components/refugio-ui";

const monthlyBenefits = ["Cartas ilimitadas", "Diário privado com trava de tela", "Avatares e molduras especiais", "Árvore com aura iluminada"];
const annualBenefits = ["Tudo do VIP Mensal", "Caixa da Memória para guardar conselhos", "Sons de Paz: chuva, floresta e lareira", "Biblioteca completa de papéis e selos", "Filtros avançados e prioridade no Mural"];

export default function PlanosScreen() {
  return <View style={styles.screen}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><MaterialCommunityIcons name="arrow-left" size={22} color="#2F6F8F" /></Pressable><Wordmark compact /></View><Text style={styles.title}>Planos do Refúgio</Text><Text style={styles.subtitle}>Mais recursos para personalizar o seu espaço, sempre sem mudar o cuidado da comunidade.</Text><PlanCard title="VIP Mensal" price="R$ 19,90/mês" benefits={monthlyBenefits} /><PlanCard title="VIP Anual" price="R$ 99,90/ano" bestValue benefits={annualBenefits} /><SoftCard style={styles.safety}><MaterialCommunityIcons name="shield-check-outline" size={22} color="#2F6F8F" /><Text style={styles.safetyText}>Os recursos essenciais de acolhimento seguem disponíveis no plano gratuito. A contratação será habilitada quando o pagamento seguro estiver conectado.</Text></SoftCard></ScrollView></View>;
}

function PlanCard({ title, price, benefits, bestValue = false }: { title: string; price: string; benefits: string[]; bestValue?: boolean }) {
  return <View style={[styles.plan, bestValue && styles.planFeatured]}>{bestValue ? <View style={styles.badge}><Text style={styles.badgeText}>MELHOR VALOR</Text></View> : null}<Text style={styles.planTitle}>{title}</Text><Text style={styles.price}>{price}</Text>{benefits.map((benefit) => <View key={benefit} style={styles.benefit}><MaterialCommunityIcons name="check-circle-outline" size={19} color="#587C6D" /><Text style={styles.benefitText}>{benefit}</Text></View>)}<PrimaryButton label="Em breve" onPress={() => undefined} icon="clock-outline" subdued /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" }, content: { padding: 20, paddingTop: 28, paddingBottom: 42, gap: 16 }, header: { flexDirection: "row", alignItems: "center", gap: 12 }, back: { height: 38, width: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFDF8", borderWidth: 1, borderColor: "#E8DED0" }, title: { color: "#2F6F8F", fontSize: 29, fontWeight: "700", letterSpacing: -0.8, marginTop: 12 }, subtitle: { color: "#5D746D", fontSize: 15, lineHeight: 22 }, plan: { position: "relative", overflow: "hidden", backgroundColor: "#FFFDF8", borderRadius: 28, padding: 20, gap: 12, borderWidth: 1, borderColor: "#E6DDCF" }, planFeatured: { borderColor: "#89B1BF", backgroundColor: "#F5FAFB" }, badge: { position: "absolute", right: 14, top: 14, backgroundColor: "#2F6F8F", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 }, badgeText: { color: "#FFFDF8", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 }, planTitle: { color: "#163041", fontSize: 22, fontWeight: "700" }, price: { color: "#B8934C", fontSize: 17, fontWeight: "700", marginTop: -6 }, benefit: { flexDirection: "row", gap: 9, alignItems: "flex-start" }, benefitText: { flex: 1, color: "#4F6760", fontSize: 14, lineHeight: 20 }, safety: { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: "#EAF2EA" }, safetyText: { flex: 1, color: "#536E65", fontSize: 12, lineHeight: 18 },
});

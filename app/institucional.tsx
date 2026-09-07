import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const sections = [
  {
    icon: "information-outline" as const,
    title: "Sobre o Aplicativo",
    body: "O Refúgio da Lua é um espaço digital de acolhimento, escuta e presença. Seu objetivo é oferecer um ambiente seguro para escrever desabafos, ler cartas de outras pessoas e enviar mensagens de apoio sem exposição do nome real.\n\nVocê pode usar um pseudônimo, escolher um avatar e decidir se um texto ficará no seu Diário privado ou será publicado no Mural. O Jardim reúne seu progresso de cuidado, registros privados e ações de acolhimento. O aplicativo não substitui psicoterapia, atendimento médico ou serviços de emergência.",
  },
  {
    icon: "compass-outline" as const,
    title: "Como funciona",
    body: "Conheça o Refúgio, aceite o Pacto de Empatia e configure sua identidade. No Mural, você pode ler cartas e enviar energias de Abraço, Força, Esperança, Paz ou Você não está sozinho. Em Desabafar, escreva no seu ritmo e escolha entre guardar no Diário ou publicar com cuidado. O Jardim mostra suas ações de cuidado e o que está sincronizado com sua conta.",
  },
  {
    icon: "shield-lock-outline" as const,
    title: "Política de Privacidade",
    body: "Esta Política explica como o Refúgio da Lua trata dados pessoais, em atenção à Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).\n\n1. Dados tratados: podemos tratar e-mail de acesso, dados de autenticação, pseudônimo, avatar, temas escolhidos, cartas, conselhos, energias, registros do Diário e informações técnicas necessárias à segurança. O nome real e o e-mail não são exibidos publicamente.\n\n2. Finalidades: usamos esses dados para criar e proteger a conta, permitir o funcionamento do Mural e do Jardim, salvar preferências, prevenir abusos, moderar conteúdo e melhorar a segurança do serviço. Não vendemos dados pessoais.\n\n3. Conteúdo privado e público: registros marcados como Diário privado devem permanecer acessíveis apenas à pessoa usuária, ressalvadas obrigações legais e medidas necessárias para segurança. Publicações no Mural podem ser vistas por outras pessoas e devem usar apenas o pseudônimo.\n\n4. Direitos da pessoa titular: você pode solicitar confirmação e acesso, correção, informação sobre uso e compartilhamento, portabilidade quando aplicável, eliminação de dados, revogação de consentimento e revisão de decisões automatizadas, observadas as hipóteses legais de conservação. Esses pedidos podem ser feitos pelos canais de contato do aplicativo.\n\n5. Segurança e retenção: aplicamos medidas técnicas e administrativas razoáveis. Conservamos dados pelo tempo necessário às finalidades informadas ou para cumprir obrigações legais; depois, eliminamos ou anonimizamos quando possível.\n\n6. Atualizações: esta política pode ser atualizada para refletir melhorias do serviço ou mudanças legais. A versão vigente será disponibilizada nesta tela. Para dúvidas ou solicitações relacionadas a dados pessoais, use o contato informado abaixo.",
  },
  {
    icon: "file-document-outline" as const,
    title: "Termos de Uso",
    body: "Ao usar o Refúgio da Lua, você concorda com estes Termos. O aplicativo oferece ferramentas de escrita, leitura e apoio comunitário; não fornece diagnóstico, tratamento psicológico, aconselhamento médico ou garantia de resposta profissional.\n\nVocê se compromete a usar o serviço com respeito, não publicar ameaças, discriminação, assédio, dados pessoais de terceiros, conteúdo ilegal ou mensagens que incentivem dano. Não é permitido tentar identificar ou expor outras pessoas.\n\nVocê mantém os direitos sobre seus textos, mas autoriza o tratamento técnico necessário para armazenar, exibir e moderar o conteúdo conforme a opção de privacidade escolhida. Conteúdos podem ser removidos ou encaminhados para moderação quando violarem estes Termos ou representarem risco à comunidade.\n\nO serviço pode sofrer indisponibilidades, alterações ou limites de uso. A conta pode ser encerrada em caso de abuso, sempre que necessário para proteger pessoas e a integridade do Refúgio. Em uma situação urgente ou de risco imediato, não use o aplicativo como único recurso: procure o serviço de emergência da sua região e uma pessoa de confiança.",
  },
  {
    icon: "heart-settings-outline" as const,
    title: "Diretrizes de empatia",
    body: "Leia com presença. Responda ao que foi compartilhado, sem tentar consertar a vida de ninguém. Evite julgamentos, diagnósticos, cobranças e promessas. Não transforme a carta em debate. Se não souber o que dizer, uma energia de apoio já é uma forma de presença. Respeite limites, anonimato e o tempo de cada pessoa.",
  },
  {
    icon: "lifebuoy" as const,
    title: "Apoio e emergência",
    body: "O Refúgio é uma rede de apoio entre pessoas, não um serviço de emergência. Se houver risco imediato, procure os serviços de urgência da sua região, vá a um pronto atendimento ou peça ajuda a alguém próximo. Em sofrimento intenso, considere buscar um profissional de saúde mental. Se uma carta indicar risco, use a opção Apoio agora e priorize ajuda presencial e segura.",
  },
  {
    icon: "email-outline" as const,
    title: "Contato",
    body: "Para dúvidas sobre o aplicativo, privacidade, segurança ou exercício dos direitos previstos na LGPD, use o canal de contato disponibilizado na versão oficial do Refúgio da Lua. Ao escrever, descreva o pedido sem enviar senhas ou informações sensíveis desnecessárias.",
  },
];

export default function InstitutionalScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Voltar">
          <MaterialCommunityIcons name="arrow-left" size={21} color="#2F6F8F" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.eyebrow}>INSTITUCIONAL</Text>
        <Text style={styles.title}>Transparência para você chegar com calma.</Text>
        <Text style={styles.subtitle}>Conheça o propósito do Refúgio, seus cuidados de privacidade e as regras que protegem a comunidade.</Text>
        <View style={styles.notice}>
          <MaterialCommunityIcons name="leaf-circle-outline" size={23} color="#2F6F8F" />
          <Text style={styles.noticeText}>Você pode consultar estas informações sem criar uma conta.</Text>
        </View>
        {sections.map((section) => (
          <View key={section.title} style={styles.card}>
            <View style={styles.cardHeading}>
              <View style={styles.icon}><MaterialCommunityIcons name={section.icon} size={22} color="#2F6F8F" /></View>
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}
        <Text style={styles.footer}>Refúgio da Lua · um espaço de presença, cuidado e respeito.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FBF7EF" },
  content: { padding: 22, paddingTop: 28, paddingBottom: 44, gap: 16 },
  back: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 4 },
  backText: { color: "#2F6F8F", fontSize: 14, fontWeight: "700" },
  eyebrow: { color: "#667C78", fontSize: 11, fontWeight: "800", letterSpacing: 1.3, marginTop: 10 },
  title: { color: "#163041", fontSize: 30, lineHeight: 36, fontWeight: "700", letterSpacing: -1 },
  subtitle: { color: "#58736F", fontSize: 15, lineHeight: 22 },
  notice: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 18, backgroundColor: "#E6F0F3" },
  noticeText: { flex: 1, color: "#426473", fontSize: 13, lineHeight: 19 },
  card: { backgroundColor: "#FFFDF8", borderRadius: 24, borderWidth: 1, borderColor: "#EAE1D4", padding: 17, gap: 12 },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 15, backgroundColor: "#EAF2EA", alignItems: "center", justifyContent: "center" },
  cardTitle: { flex: 1, color: "#163041", fontSize: 18, fontWeight: "700" },
  cardBody: { color: "#536A63", fontSize: 14, lineHeight: 22 },
  footer: { textAlign: "center", color: "#87958F", fontSize: 12, lineHeight: 18, paddingHorizontal: 20, marginTop: 4 },
});

# Atualização tipográfica da frase

A frase “Seu lugar de paz” foi aproximada visualmente do lettering da logomarca com a família Montserrat, usando a variante `Montserrat_600SemiBold`. A escolha preserva as características geométricas, arredondadas e limpas observadas no texto da marca, sem depender de fonte instalada no sistema.

A família foi adicionada ao projeto por `@expo-google-fonts/montserrat`, carregada com `useFonts` e aplicada somente quando disponível, mantendo fallback seguro durante o carregamento.

O tratamento visual existente foi preservado: background ilustrado translúcido, frase centralizada, tamanho ampliado, sombra clara, borda sutil e animação de entrada.

## Validação

| Verificação | Resultado |
|---|---|
| TypeScript | Aprovado |
| Lint | Aprovado |
| Testes | Aprovado |
| Build web/PWA | Aprovado |
| Smoke test PWA | 7 artefatos conferidos |
| Landing `/inicio` | Montserrat semibold aplicada e legível |

Os arquivos `components/refugio-ui.tsx`, `package.json` e `pnpm-lock.yaml` foram sincronizados para `C:\Projetos\Refugio_Lua`.

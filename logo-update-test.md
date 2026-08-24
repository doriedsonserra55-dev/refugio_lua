# Atualização de logomarca

A imagem `Logo_ORefugio2.png`, fornecida na raiz do projeto, substituiu a logomarca anterior. O arquivo original foi preservado na raiz e foram geradas variantes recortadas para o cabeçalho, favicon, splash screen e instalação do PWA.

A frase lateral do componente compartilhado foi alterada de `seu ritmo, suas regras` para **`Seu lugar de paz`**. O cabeçalho foi ajustado para a nova proporção vertical da arte: a marca completa usa uma área de 142 x 132 no modo principal e 100 x 92 no modo compacto, com frase lateral responsiva.

Foram atualizados o componente `components/refugio-ui.tsx`, `app.config.ts`, `app/+html.tsx`, `public/index.html`, o manifesto, os assets públicos e o smoke test do PWA.

## Validação

| Verificação | Resultado |
|---|---|
| TypeScript (`pnpm check`) | Aprovado |
| Lint (`pnpm lint`) | Aprovado |
| Testes (`pnpm test`) | Aprovado |
| Build web (`pnpm build:web`) | Aprovado |
| Smoke test PWA | 7 artefatos e metadados conferidos |
| Landing `/inicio` | Nova logo e `Seu lugar de paz` visíveis e alinhados |
| Tela com perfil `/inicio` | Nova logo e frase lateral visíveis no cabeçalho compacto |

A prévia foi inspecionada no navegador e os arquivos foram sincronizados para `C:\Projetos\Refugio_Lua`.

# Auditoria e correção do Refúgio da Lua

## Resultado executivo

O projeto foi revisado integralmente na cópia de trabalho, corrigido e sincronizado de volta para `C:\Projetos\Refugio_Lua`. A aplicação agora possui um pipeline web reproduzível para PWA, com manifesto instalável, ícones, HTML raiz em português brasileiro, service worker gerado a partir do build, cache offline do shell e fallback de rotas para hospedagem compatível.

A exportação web foi alterada para o modo `single`, pois o Refúgio usa rotas client-side e cartas que podem ser criadas localmente. Essa escolha evita que uma atualização direta em uma rota dinâmica dependa de uma página HTML pré-gerada. O arquivo `public/_redirects` complementa o deploy em hosts como Netlify; em outros provedores, é necessário configurar a regra equivalente para encaminhar rotas desconhecidas para `index.html`.

## Correções aplicadas

| Área | Situação encontrada | Correção aplicada |
| --- | --- | --- |
| Metro e NativeWind | O export web falhava ao calcular o SHA-1 de `react-native-css-interop/.cache/web.css` quando o Metro forçava a escrita do CSS no filesystem. | Removido `forceWriteFileSystem` da configuração do Metro; `pnpm export --platform web` passou a concluir normalmente. |
| Exportação web | A configuração usava `web.output: "static"`, o que poderia causar 404 em rotas dinâmicas ao recarregar a página. | Alterado para `web.output: "single"` e adicionado fallback de hospedagem em `public/_redirects`. |
| PWA | Não havia manifesto, registro de service worker, ícones web nem metadados completos. | Criados `public/manifest.json`, `public/index.html`, `public/favicon.png`, `public/logo-192.png`, `public/logo-512.png` e registro seguro do service worker. |
| Offline | Não existia uma estratégia de cache para o shell web. | Criado `scripts/generate-pwa-sw.mjs`, que gera `dist/sw.js` após o export, pré-cacheia os arquivos estáticos e usa network-first para navegação. Rotas `/api/` e `/trpc/` ficam fora do cache. |
| Qualidade do build | Não havia uma validação automatizada dos artefatos PWA. | Criado `scripts/validate-pwa.mjs` e incluído no script `build:web`. |
| Persistência local | O store gravava estado dentro de callbacks de atualização e podia duplicar cartas iniciais, perder atualizações por closures antigas ou quebrar com JSON inválido. | Reestruturado `lib/refugio-store.tsx` com hidratação protegida, parsing seguro, merge por ID, persistência centralizada após hidratação e atualizações funcionais de estatísticas. |
| Safe area web | A inicialização aplicava insets mínimos de aparelho móvel também no navegador. | A versão web passa a usar insets reais/zero; os mínimos continuam apenas nas plataformas nativas. |
| Ferramentas | O lint emitia aviso de módulo por causa do flat config em `eslint.config.js`. | Renomeado para `eslint.config.mjs`, mantendo a configuração moderna sem transformar os demais arquivos CommonJS em ESM. |

## Arquivos principais adicionados ou alterados

| Arquivo | Finalidade |
| --- | --- |
| `app.config.ts` | Modo de saída web `single`. |
| `app/_layout.tsx` | Safe area e formatação do layout raiz. |
| `app/+html.tsx` | Metadados HTML para os modos estático/server, caso sejam retomados. |
| `lib/refugio-store.tsx` | Persistência e hidratação local mais robustas. |
| `metro.config.js` | Configuração NativeWind compatível com export web. |
| `public/index.html` | HTML raiz do PWA single. |
| `public/manifest.json` | Manifesto instalável. |
| `public/_redirects` | Fallback de rotas para Netlify e hosts compatíveis. |
| `scripts/generate-pwa-sw.mjs` | Geração do service worker pós-build. |
| `scripts/validate-pwa.mjs` | Smoke test dos artefatos PWA. |
| `package.json` | Scripts `build:web`, `validate:pwa` e `dev:metro` previsíveis. |
| `eslint.config.mjs` | Configuração de lint sem aviso de módulo. |

## Validações executadas

| Comando ou validação | Resultado |
| --- | --- |
| `pnpm check` | Aprovado: TypeScript sem erros. |
| `pnpm lint` | Aprovado: lint sem erros e sem o aviso anterior de módulo. |
| `pnpm test` | Aprovado: 3 arquivos de teste passaram; 7 testes passaram e 1 teste de logout permaneceu marcado como ignorado pelo próprio projeto. |
| `pnpm build:web` | Aprovado: exportação web no modo single concluída. |
| `node scripts/generate-pwa-sw.mjs` | Aprovado: service worker gerado com 47 arquivos pré-cacheados no build final. |
| `node scripts/validate-pwa.mjs` | Aprovado: 6 artefatos e metadados essenciais conferidos. |
| Navegador em servidor local | Aprovado: onboarding, aceite do pacto, identidade anônima, entrada no Mural, rota `/carta/carta-1`, envio de conselho e atualização visual foram validados. |
| Manifesto e service worker no navegador | Aprovado: `manifest.json` retornou HTTP 200 e o service worker ficou `activated` no escopo raiz. |

## Como executar

Depois de instalar as dependências com o gerenciador fixado no projeto, use:

```bash
pnpm check
pnpm lint
pnpm test
pnpm build:web
```

O resultado de produção ficará em `dist/`. Para desenvolvimento web, use `pnpm dev:metro`. O PWA deve ser servido por HTTPS em produção, ou por `localhost` durante o desenvolvimento, porque service workers não são ativados em origens inseguras comuns.

## Observações pendentes

O teste `tests/auth.logout.test.ts` continua ignorado conforme a configuração original e depende da integração OAuth. Os avisos de configuração de `OAUTH_SERVER_URL` observados nos testes são mensagens do módulo de autenticação durante o ambiente local; não impediram os testes funcionais disponíveis.

A aplicação continua sendo principalmente local-first: cartas, perfil, diário e estatísticas são persistidos no dispositivo por AsyncStorage. A sincronização entre dispositivos depende da integração de autenticação e backend já prevista no projeto e não foi simulada sem credenciais reais.

## Atualização de identidade visual

A imagem `logo_refugio_da_lua.png` foi localizada na raiz e preservada como fonte original. Ela contém o símbolo circular com lua, folhas e figura meditativa, além do wordmark “REFÚGIO DA LUA” e do subtítulo “UM ESPAÇO DE PAZ”. Foram preparados uma versão completa para cabeçalho/metadados e versões quadradas para favicon e ícones instaláveis, mantendo a composição original e sem gerar uma nova marca.

A prévia web foi reconstruída e aberta no navegador. O cabeçalho exibiu a logomarca fornecida, o título do documento passou a ser “Refúgio da Lua” e a inspeção do DOM confirmou o asset `logo_refugio_da_lua` no bundle, além de `/manifest.json` e `/favicon.png` ativos.

## Nova tela inicial de convite ao login

Foi criada uma experiência de entrada na aba `Início` com hero visual original de acolhimento entre pares, mensagem de propósito, benefícios de participar, aviso de privacidade, CTA de login/criação de conta e continuidade anônima. A tela mantém a paleta creme, azul-petróleo, verde sálvia e dourado do Refúgio.

A rota inicial das abas foi explicitamente definida como `inicio`, de modo que visitantes vejam a landing ao abrir o PWA. O fluxo autenticado/perfil já existente continua preservado: usuários com perfil local veem as ações de desabafo e aconselhamento.

Arquivo visual: `assets/images/welcome-community.png`.

Referências de conteúdo e tom: Mapa do Acolhimento e Togetherall, registradas em `research-welcome-login.md`. A imagem usada é original e foi gerada para o projeto, evitando dependência de licença de imagens externas.

Validação final desta etapa: `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build:web` e `scripts/validate-pwa.mjs`, todos concluídos com sucesso.

## Validação da landing de login

A raiz do PWA agora redireciona para `/inicio`, onde visitantes sem perfil veem a nova landing. A inspeção visual confirmou a imagem `welcome-community.png`, o título “Você não precisa carregar tudo sozinho.”, os três benefícios, o CTA “Entrar no Refúgio” e a alternativa anônima. O CTA principal foi acionado e abriu `/conta` corretamente.

## Referências de inspiração

[1] [Mapa do Acolhimento](https://www.mapadoacolhimento.org/) — referência brasileira de acolhimento e linguagem de segurança.

[2] [Togetherall](https://togetherall.com/en-us/) — referência internacional de comunidade anônima, pertencimento e entrada orientada a benefícios.

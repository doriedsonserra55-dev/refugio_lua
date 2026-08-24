# Design de Interface — Refúgio

## Direção de produto

O Refúgio será um espaço móvel de acolhimento anônimo, projetado para uso em **orientação vertical 9:16**, com foco em leitura confortável, escrita sem pressão e interações de uma mão. A interface deve transmitir calma e dignidade, sem contadores competitivos, estímulos agressivos ou promessas terapêuticas. O produto facilita trocas empáticas; em situações de sofrimento intenso, o fluxo prioriza segurança e acesso imediato a apoio profissional.

## Lista de telas

| Tela | Conteúdo principal | Funções principais |
| --- | --- | --- |
| Boas-vindas e Pacto de Empatia | Mensagem de acolhimento, princípios da comunidade e aceite explícito | Avançar apenas após confirmar o pacto de respeito e cuidado |
| Identidade anônima | Escolha de avatar, pseudônimo e temas de conexão | Configurar uma presença privada para participar da comunidade |
| Mural | Cartas em cartões suaves, filtros por tema e acesso de escrita | Ler cartas, aplicar filtros e iniciar um novo desabafo |
| Escrever carta | Papel de carta decorado, tema, campo de texto e limite visual sereno | Salvar rascunho, revisar antes de enviar e ativar a proteção de conteúdo |
| Leitura da carta | Carta em tela calma, energias, conselhos e ação “Isso me ajudou” | Enviar energia, escrever conselho e reconhecer acolhimentos úteis |
| Jardim | Árvore da Empatia, energias distribuídas, selos e diário privado | Acompanhar a evolução, revisar registros pessoais e abrir configurações |
| Apoio imediato | Conteúdo acolhedor, ação para ligar 188 e orientação para procurar emergência local | Interromper a publicação em caso de texto crítico e priorizar ajuda humana |

## Layout e interação

O aplicativo usa uma barra inferior com três destinos: **Mural**, **Escrever** e **Jardim**. A ação de escrever fica centralizada e elevada para facilitar o alcance pelo polegar. No Mural, as cartas aparecem em cartões de bordas amplamente arredondadas, com avatar, pseudônimo, tema e uma prévia limitada de conteúdo. O toque em uma carta abre uma leitura dedicada, com ações de energia grandes, legíveis e sem placares públicos.

Na tela de escrita, o campo de texto ocupa a maior parte do espaço útil, preservando respiro acima do teclado. O botão de revisão permanece acessível no rodapé seguro. A tela de apoio imediato não utiliza tom de julgamento: ela reduz as opções, apresenta uma mensagem curta de cuidado e oferece acesso direto ao **CVV — 188** e à emergência local.

## Fluxos principais

| Fluxo | Etapas |
| --- | --- |
| Entrada segura | Boas-vindas → Pacto de Empatia → Avatar e pseudônimo → Temas de conexão → Mural |
| Publicar uma carta | Mural → Escrever → Selecionar tema → Redigir → Revisar proteção → Publicar ou salvar rascunho |
| Acolher alguém | Mural → Abrir carta → Escolher energia → Escrever conselho → Autor pode marcar “Isso me ajudou” |
| Evoluir no Jardim | Distribuir energias e conselhos → Atualização da árvore e dos selos → Consultar histórico privado |
| Situação crítica | Escrever → Detecção preventiva de termos e contexto de alto risco → Carta não é publicada → Tela de apoio imediato com CVV 188 e emergência |

## Escolhas de cor

| Token | Cor | Uso |
| --- | --- | --- |
| Azul sereno | `#2F6F8F` | Ações principais, foco e elementos de navegação |
| Verde-sálvia | `#8EAA95` | Crescimento da Árvore da Empatia e estados acolhedores |
| Creme de papel | `#FBF7EF` | Fundo dominante, com sensação de carta e leveza |
| Marinho profundo | `#163041` | Texto principal e contraste de leitura |
| Dourado discreto | `#B8934C` | Selos, detalhes de conquista e ênfases pontuais |
| Rosa de apoio | `#B46D72` | Alertas humanos, sem o caráter visual agressivo do vermelho puro |

Os contrastes serão mantidos em nível confortável para leitura e os significados nunca dependerão somente de cor. As transições devem ser discretas, com duração curta, sem efeitos bruscos.

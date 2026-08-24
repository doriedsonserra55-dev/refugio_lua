# Logout e exclusão de cadastro

Foram adicionados dois controles na área autenticada do Jardim. **Sair da conta neste dispositivo** encerra a sessão, limpa o usuário autenticado no cliente e preserva o perfil local anônimo, permitindo que o usuário continue usando o Refúgio sem sincronização. **Excluir meu cadastro** abre uma confirmação visual explícita e informa que o login, o Jardim sincronizado e os dados privados da conta serão removidos sem possibilidade de desfazer.

A exclusão usa um procedimento protegido no servidor. Ele remove primeiro o plano da conta e o snapshot do Jardim e, em seguida, exclui o usuário. Depois, o cookie de sessão é limpo. No cliente, as chaves locais de perfil, cartas próprias, diário e estatísticas são removidas, o store volta ao estado inicial e a navegação retorna para `/inicio`.

Também foi corrigida a proteção da rota `/jardim`: o redirecionamento agora aguarda a hidratação do armazenamento local, evitando tela vazia ou redirecionamento prematuro durante a abertura direta da rota.

## Validações

| Verificação | Resultado |
|---|---|
| TypeScript (`pnpm check`) | Aprovado |
| Lint (`pnpm lint`) | Aprovado |
| Testes (`pnpm test`) | 7 aprovados; 1 já ignorado pela suíte existente |
| Build PWA (`pnpm build:web`) | Aprovado |
| Smoke test PWA | 6 artefatos e metadados conferidos |
| Área autenticada sintética | Renderização do Jardim validada sem credenciais reais |
| Confirmação de exclusão | Componente e textos de confirmação presentes no bundle |

A sincronização final foi feita para `C:\Projetos\Refugio_Lua`.

# Guia Customizado de Deploy & Distribuição (GitHub + Supabase + Vercel)

Este guia orienta o passo a passo completo configurado especificamente para as suas contas e perfis criados no **GitHub**, **Supabase** e **Vercel**.

---

## Perfis da Infraestrutura

| Serviço | Identificação / URL do Perfil / Projeto |
| --- | --- |
| **GitHub** | [`doriedsonserra55-dev/refugio_lua`](https://github.com/doriedsonserra55-dev/refugio_lua) |
| **Supabase** | Projeto ID: `rrxrbvsplgcytnsszhzj` ([Dashboard Supabase](https://supabase.com/dashboard/project/rrxrbvsplgcytnsszhzj)) |
| **Vercel** | Conta: `ds-dev2` ([Dashboard Vercel](https://vercel.com/ds-dev2)) |

---

## 1. Conexão com o Supabase (Banco de Dados)

O seu projeto Supabase já possui a ID `rrxrbvsplgcytnsszhzj`.

1. Acesse as configurações de banco de dados do seu projeto no Supabase:
   [https://supabase.com/dashboard/project/rrxrbvsplgcytnsszhzj/settings/database](https://supabase.com/dashboard/project/rrxrbvsplgcytnsszhzj/settings/database)
2. Em **Connection String**, selecione a guia **URI**:
   - **Para a Vercel (Pooler)**:
     `postgresql://postgres.rrxrbvsplgcytnsszhzj:[SUA_SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Para uso direto/migração**:
     `postgresql://postgres:[SUA_SENHA]@db.rrxrbvsplgcytnsszhzj.supabase.co:5432/postgres`

---

## 2. Executar Migração do Banco de Dados

Substitua a sua senha real na URL acima e coloque no arquivo `.env` local na variável `DATABASE_URL`. Em seguida, rode:

```bash
npx pnpm db:push
```

Isso criará automaticamente todas as tabelas do **Refúgio da Lua** (`users`, `garden_snapshots`, `account_plans` e enums) no Supabase.

---

## 3. Enviar o Código para o Seu GitHub

No terminal da pasta do projeto, execute os comandos para vincular ao seu repositório oficial:

```bash
git init
git add .
git commit -m "feat: configuracao de producao refugio_lua"
git remote add origin https://github.com/doriedsonserra55-dev/refugio_lua.git
git branch -M main
git push -u origin main
```

Após o `push`, o GitHub Actions [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml) executará os testes e a validação do build PWA automaticamente no GitHub.

---

## 4. Publicar na Vercel (Conta `ds-dev2`)

1. Acesse o painel da Vercel na sua conta [`ds-dev2`](https://vercel.com/ds-dev2).
2. Clique em **Add New...** > **Project**.
3. Importe o repositório `doriedsonserra55-dev/refugio_lua`.
4. Configure as Variáveis de Ambiente na Vercel:

   | Variável | Valor |
   | --- | --- |
   | `DATABASE_URL` | String de Conexão do Supabase (Pooler) |
   | `JWT_SECRET` | Uma senha secreta forte (ex: `refugio_secret_token_2026_prod`) |
   | `NODE_ENV` | `production` |
   | `EXPO_PUBLIC_APP_ID` | `refugio-da-lua` |

5. Clique em **Deploy**.

---

## 5. Distribuição & PWA

- **Link Web**: O app ficará disponível instantaneamente no domínio fornecido pela Vercel.
- **PWA Instalável**: Usuários em Android, iOS, Windows e Mac poderão clicar em "Adicionar à Tela de Início" ou "Instalar Aplicativo" pelo navegador para usar como app nativo offline-first.

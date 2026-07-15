# Guia de Deploy Final — Passo a Passo para o Fundador

Este guia assume **zero conhecimento técnico**. Siga os passos na ordem. Cada passo diz exatamente onde clicar. Tempo estimado total: 30–45 minutos.

Se você já tiver um projeto Supabase configurado das sprints anteriores, pode pular direto para o **Passo 3** (mas ainda vale revisar o Passo 2 rapidamente, como confirmação).

---

## Antes de começar — o que você vai precisar

- [ ] Uma conta no [GitHub](https://github.com) (o código já está em `github.com/AlexandreJonathan/atlas`).
- [ ] Uma conta no [Supabase](https://supabase.com) (gratuita) — o "banco de dados" da Atlas.
- [ ] Uma conta na [Vercel](https://vercel.com) (gratuita) — onde o site vai ficar publicado.
- [ ] 30–45 minutos sem interrupções.

Não é necessário saber programar para nenhum dos passos abaixo.

---

## Passo 1 — Criar (ou confirmar) o projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e faça login.
2. Se ainda não existir um projeto para a Atlas, clique em **"New Project"**, dê um nome (ex: `atlas-producao`), defina uma senha de banco de dados (guarde-a em um lugar seguro) e escolha uma região próxima dos seus usuários (ex: São Paulo/`sa-east-1`).
3. Aguarde o projeto ficar pronto (leva 1–2 minutos).

## Passo 2 — Aplicar as migrações (criar as tabelas)

A Atlas guarda os dados em 6 "tabelas" (cadastro de usuários já vem pronto do Supabase; as outras 6 precisam ser criadas manualmente uma única vez).

1. No menu à esquerda do seu projeto Supabase, clique em **"SQL Editor"**.
2. Clique em **"New query"**.
3. No repositório do GitHub, abra a pasta `supabase/migrations/` — você verá 6 arquivos `.sql`, com nomes começando em `20260712...` até `20260714...`.
4. **Na ordem dos nomes** (do mais antigo para o mais novo), para cada arquivo:
   - Abra o arquivo no GitHub, copie todo o conteúdo.
   - Cole no SQL Editor do Supabase.
   - Clique em **"Run"** (ou `Ctrl+Enter`).
   - Confirme que apareceu "Success" antes de passar para o próximo arquivo.
5. Ordem exata dos arquivos:
   1. `20260712210000_create_transactions_table.sql`
   2. `20260712220000_create_bills_table.sql`
   3. `20260712220100_create_goals_table.sql`
   4. `20260714000000_create_financial_profiles_table.sql`
   5. `20260714000100_create_fixed_expenses_table.sql`
   6. `20260714100000_create_onboarding_status_table.sql`
6. Para confirmar que funcionou: clique em **"Table Editor"** no menu à esquerda — você deve ver 6 tabelas: `transactions`, `bills`, `goals`, `financial_profiles`, `fixed_expenses`, `onboarding_status`. Cada uma deve ter um pequeno **ícone de cadeado** 🔒 ao lado do nome (significa que a proteção de dados — "RLS" — está ativa, garantindo que cada usuário só vê os próprios dados).

## Passo 3 — Configurar o login (Authentication)

1. No menu à esquerda, clique em **"Authentication"** → **"URL Configuration"**.
2. Em **"Site URL"**, por enquanto deixe como está (você vai voltar aqui **depois** de publicar na Vercel, no Passo 7, para colocar o endereço final).
3. Em **"Redirect URLs"**, clique em **"Add URL"** e adicione (você vai adicionar a URL final depois de publicar, no Passo 7 — por enquanto pode pular este item e voltar depois).
4. Ainda em Authentication, clique em **"Providers"** → **"Email"**. Aqui você decide:
   - **"Confirm email" LIGADO** (recomendado): todo novo usuário precisa clicar em um link no e-mail antes de conseguir entrar. Mais seguro.
   - **"Confirm email" DESLIGADO**: usuário entra direto após o cadastro, sem confirmar e-mail. Mais rápido para testes internos, menos seguro para o público.
   - A Atlas funciona corretamente nos dois casos — não é necessário escolher agora com pressa, mas escolha uma opção antes de convidar os primeiros usuários.
5. Copie duas informações que você vai usar no Passo 6:
   - Vá em **"Project Settings"** (ícone de engrenagem) → **"API"**.
   - Copie o valor de **"Project URL"** (algo como `https://xxxxx.supabase.co`).
   - Copie o valor de **"anon public"** em "Project API keys" (uma chave longa).
   - ⚠️ **Nunca copie a chave "service_role"** — essa é secreta e nunca deve ser usada no site.

## Passo 4 — Criar conta na Vercel e conectar o GitHub

1. Acesse [vercel.com](https://vercel.com) e clique em **"Sign Up"**.
2. Escolha **"Continue with GitHub"** e autorize o acesso.
3. Na tela inicial, clique em **"Add New..."** → **"Project"**.
4. Encontre o repositório **`atlas`** (de `AlexandreJonathan`) na lista e clique em **"Import"**.

## Passo 5 — Configurar o projeto na Vercel

Na tela de configuração que aparece antes de publicar:

1. Em **"Root Directory"**, clique em **"Edit"** e selecione a pasta **`apps/web`** (muito importante — sem isso o site não funciona, porque o código real fica dentro dessa pasta).
2. O "Framework Preset" deve ser detectado automaticamente como **"Vite"**. Se não for, selecione manualmente.
3. Abra a seção **"Environment Variables"** e adicione as duas variáveis do Passo 3:
   - Nome: `VITE_SUPABASE_URL` → Valor: (o "Project URL" que você copiou)
   - Nome: `VITE_SUPABASE_ANON_KEY` → Valor: (a chave "anon public" que você copiou)
4. Clique em **"Deploy"**.
5. Aguarde 1–2 minutos. A Vercel vai mostrar "Congratulations!" com um link do tipo `https://atlas-xxxx.vercel.app`.

## Passo 6 — Voltar ao Supabase e informar o endereço final

Agora que você tem o endereço público (ex: `https://atlas-xxxx.vercel.app`), volte ao Supabase:

1. **Authentication** → **"URL Configuration"**.
2. Em **"Site URL"**, cole o endereço da Vercel (ex: `https://atlas-xxxx.vercel.app`).
3. Em **"Redirect URLs"**, clique em **"Add URL"** e adicione: `https://atlas-xxxx.vercel.app/redefinir-senha` (troque pelo seu endereço real). Esse passo é **obrigatório** — sem ele, o link de "esqueci minha senha" não funciona em produção.
4. Se quiser continuar testando localmente também, adicione outra Redirect URL: `http://localhost:5173/redefinir-senha`.
5. Clique em **"Save"**.

## Passo 7 — Testar tudo em produção

Abra o endereço da Vercel num navegador (de preferência também no celular) e teste, nesta ordem:

- [ ] Criar uma conta nova (cadastro).
- [ ] Se "Confirm email" estiver ligado: verificar se o e-mail de confirmação chegou (olhar também a caixa de spam) e clicar no link.
- [ ] Fazer login.
- [ ] Passar pelo onboarding (renda, reserva, despesa fixa, meta).
- [ ] Registrar uma receita e uma despesa.
- [ ] Cadastrar uma conta a pagar.
- [ ] Clicar em "Esqueci minha senha", verificar se o e-mail chega, e redefinir a senha pelo link.
- [ ] Sair (logout) e entrar novamente.
- [ ] Recarregar a página estando em `/inicio` (não deve dar erro nem tela em branco).
- [ ] Testar tudo isso pelo celular também.

Se tudo funcionar, a Atlas está publicada e pronta para uso real. 🎉

---

## Se algo der errado (problemas comuns)

| Sintoma | Causa provável | Solução |
|---|---|---|
| Site abre mas mostra aviso "Supabase não está configurado" | Variáveis de ambiente erradas ou não salvas na Vercel | Vercel → seu projeto → "Settings" → "Environment Variables" → confirmar os dois valores → "Redeploy" |
| Link de "esqueci minha senha" não funciona (dá erro ou volta ao login) | Redirect URL não configurada no Supabase | Repetir o Passo 6 com o endereço exato (sem erro de digitação, incluindo `/redefinir-senha`) |
| Recarregar a página em `/inicio` mostra erro 404 | Configuração de rewrite não aplicada | Confirmar que o arquivo `apps/web/vercel.json` existe no repositório e que "Root Directory" está configurado como `apps/web` (Passo 5) |
| Cadastro funciona mas login diz "e-mail não confirmado" e o e-mail nunca chega | Provedor de e-mail do Supabase (modo gratuito tem limite de envios) | Em "Confirm email", pode desligar temporariamente para os primeiros testes, ou configurar um provedor de e-mail próprio (SMTP) nas configurações avançadas de Authentication |

---

## Depois do primeiro deploy (não bloqueante, mas recomendado)

- Configurar um domínio próprio (ex: `app.atlas.com`) em Vercel → "Settings" → "Domains", e depois repetir o Passo 6 com o novo endereço.
- Considerar um serviço de monitoramento de erros (ex: Sentry) — ainda não configurado no código.
- Revisar `roadmap/backlog.md` para as próximas melhorias planejadas.

Este guia complementa (não substitui) o checklist técnico em `docs/deploy.md`.

# Guia e Checklist de Deploy — Atlas

Este documento descreve como preparar e publicar o Atlas (front-end `apps/web`) em um ambiente acessível fora da máquina de desenvolvimento. Ele complementa `roadmap/arquitetura.md` (arquitetura) e `roadmap/backlog.md` (dívidas técnicas conhecidas).

> **Procurando um passo a passo sem jargão técnico?** Ver [`docs/guia-deploy-fundador.md`](./guia-deploy-fundador.md) — mesmo processo, explicado para quem não programa. Este documento (`deploy.md`) é a referência técnica; o outro é o guia operacional.

## 1. Visão Geral

O Atlas é hoje um front-end estático (SPA Vite + React) que fala diretamente com o Supabase (Auth + Postgres + RLS) pelo navegador do usuário — não há backend próprio. Isso simplifica o deploy: basta hospedar os arquivos estáticos gerados por `npm run build` em qualquer provedor de hosting estático/CDN (Vercel, Netlify, Cloudflare Pages, etc.) e apontar as variáveis de ambiente para o projeto Supabase correto.

## 2. Pré-requisitos no Supabase

### 2.1 Aplicar todas as migrações

Todas as migrações em `supabase/migrations/` precisam existir no projeto Supabase de destino (staging/produção), na ordem cronológica dos nomes de arquivo:

1. `20260712210000_create_transactions_table.sql`
2. `20260712220000_create_bills_table.sql`
3. `20260712220100_create_goals_table.sql`
4. `20260714000000_create_financial_profiles_table.sql`
5. `20260714000100_create_fixed_expenses_table.sql`
6. `20260714100000_create_onboarding_status_table.sql`
7. `20260716220000_create_ai_chat_rate_buckets.sql` (rate limit da Edge `atlas-ai-chat`; sem policies para anon/auth — só service role)
8. `20260716230000_create_pluggy_connections.sql` (itens Pluggy ↔ usuário; só service role na Edge)

Como aplicar:

- **Manual**: Supabase Dashboard → SQL Editor → colar o conteúdo de cada arquivo (na ordem acima) → Executar.
- **CLI**: com o projeto linkado (`supabase link`), executar `supabase db push`.

Após aplicar, confirmar no Dashboard (Table Editor) que as tabelas de produto existem e que **Row Level Security está habilitado** (Authentication → Policies, ou o ícone de cadeado ao lado do nome da tabela no Table Editor). A tabela `ai_chat_rate_buckets` não deve ter policies para `anon`/`authenticated`.

### 2.1.1 Storage

O Atlas **não utiliza Supabase Storage** — nenhuma funcionalidade do produto envolve upload/armazenamento de arquivos (confirmado por revisão de código: nenhuma chamada a `storage.from()`/`upload()`/`getPublicUrl()` em todo o front-end). Nenhum bucket ou policy de Storage precisa ser criado para este deploy. Caso uma funcionalidade futura passe a exigir isso (ex: foto de perfil, anexo de comprovante), este documento deve ser atualizado.

### 2.2 Configuração de autenticação (Auth)

No Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: definir para a URL pública de produção do Atlas (ex: `https://app.atlas.com`). É para essa URL que os links de confirmação de e-mail e de redefinição de senha apontam por padrão.
- **Redirect URLs**: adicionar explicitamente `https://<seu-dominio>/redefinir-senha` (usada por `resetPasswordForEmail`). Sem isso, o Supabase rejeita o redirecionamento e o link de redefinição de senha não funciona.
- Se o ambiente de desenvolvimento local (`http://localhost:5173`) também precisar continuar funcionando, adicione-o também como uma Redirect URL adicional (não remova ao configurar produção).

No Supabase Dashboard → Authentication → Providers → Email:

- Decidir explicitamente se **"Confirm email" fica habilitado** para o Alpha. Se habilitado (recomendado para produção), o fluxo de "Confirme seu e-mail" implementado em `Register.tsx`/`Login.tsx` (Sprint 6) é utilizado. Se desabilitado, o cadastro loga o usuário imediatamente (a aplicação já trata os dois casos).
- Revisar os templates de e-mail (confirmação de cadastro e redefinição de senha) em Authentication → Email Templates — os padrões do Supabase funcionam, mas idealmente devem mencionar "Atlas" para não confundir os primeiros usuários.

### 2.3 Chaves e variáveis de ambiente

- Nunca commitar `.env`/`.env.local` (já ignorado via `.gitignore`; confirmar antes do deploy).
- A chave usada pelo front-end é sempre a **anon public key** (nunca a `service_role`, que tem acesso total ao banco e nunca deve ir para o navegador).

## 3. Variáveis de Ambiente

Copiar `apps/web/.env.example` para `.env` (local) ou configurar como variáveis de ambiente na plataforma de deploy (produção):

| Variável | Onde encontrar | Observação |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Pública, mas específica do projeto |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public | Pública por design (protegida pelo RLS), mas ainda assim deve vir de variável de ambiente, nunca hardcoded |
| `VITE_FF_OPENAI` | Definir `true` no front (Vite/Vercel) para ativar o chat OpenAI | Opcional; default `false` (mock). **Não** é a chave da OpenAI |
| `VITE_SENTRY_DSN` | Projeto Sentry → Client Keys (DSN) | Opcional; sem valor o SDK não carrega |
| `VITE_FINANCIAL_DATA_PROVIDER` | `mock` (default) ou `pluggy` | Financial Data Layer; `pluggy` = Edge `pluggy-proxy` |
| `VITE_OF_PROVIDER` | `mock` (default) ou `pluggy` | Hub `/contas`; use `pluggy` junto com a FDL para connect real |

### 3.1 OpenAI (Sprint 17/19) — segredo só no Supabase

A `OPENAI_API_KEY` **nunca** vai no front-end nem nas env vars da Vercel do app Vite.

1. Criar chave em https://platform.openai.com/api-keys  
2. No projeto Supabase (CLI linkado):

```bash
supabase secrets set OPENAI_API_KEY=sk-...
# opcional:
supabase secrets set OPENAI_MODEL=gpt-4.1-mini
# CORS (recomendado em produção — origem do front, CSV):
supabase secrets set ALLOWED_ORIGINS=https://seu-dominio.vercel.app
# Rate limit (defaults: 20/user/h, 40/IP/h):
# supabase secrets set AI_RATE_LIMIT_USER=20
# supabase secrets set AI_RATE_LIMIT_IP=40
# supabase secrets set AI_RATE_WINDOW_MS=3600000
supabase functions deploy atlas-ai-chat
```

3. No front (local/Vercel): `VITE_FF_OPENAI=true` além de `VITE_SUPABASE_*`.

Sem a Edge Function / secret, o `OpenAIProvider` faz fallback automático para **modo limitado** (resposta local rotulada — não parece chat online).

A Edge **ignora** qualquer `context` enviado pelo cliente e monta o contexto financeiro via RLS.

### 3.2 Pluggy (Sprint 21) — segredo só no Supabase

`PLUGGY_CLIENT_ID` / `PLUGGY_CLIENT_SECRET` **nunca** vão no front-end.

1. Criar app em https://dashboard.pluggy.ai  
2. Aplicar migração `20260716230000_create_pluggy_connections.sql`  
3. No projeto Supabase (CLI linkado):

```bash
supabase secrets set PLUGGY_CLIENT_ID=...
supabase secrets set PLUGGY_CLIENT_SECRET=...
# opcional (default true):
# supabase secrets set PLUGGY_INCLUDE_SANDBOX=true
supabase functions deploy pluggy-proxy
```

4. No front: `VITE_FINANCIAL_DATA_PROVIDER=pluggy` e, para o hub de contas, `VITE_OF_PROVIDER=pluggy`.

Sem secrets, a Edge responde `503` e os providers Pluggy fazem fallback seguro (ledger-only / catálogo vazio) sem quebrar a UI.

Sem essas duas variáveis `VITE_SUPABASE_*` configuradas no ambiente de build/produção, o Supabase Client não é instanciado (`lib/supabase.ts`) e a aplicação inteira exibe o aviso "Supabase não está configurado" em qualquer tela que dependa dele.

## 4. Build de Produção

```bash
cd apps/web
npm install
npm run build
```

- `npm run build` executa `tsc -b && vite build` — qualquer erro de tipo interrompe o build (comportamento desejado).
- O resultado fica em `apps/web/dist/` — é esse diretório que deve ser publicado/hospedado.
- A partir da Sprint 19 o Vite usa `manualChunks` + lazy de auth/páginas; revalidar o aviso de 500 kB no log do build após cada release.

## 5. Hospedagem Recomendada

Qualquer provedor de hosting estático/CDN com suporte a SPA (fallback de todas as rotas para `index.html`) funciona. Exemplos:

- **Vercel** (recomendada — guia operacional completo em `docs/guia-deploy-fundador.md`) **ou Netlify**: apontar para o repositório, configurar:
  - Root directory: `apps/web`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Ambos já fazem fallback de SPA automaticamente para projetos Vite/React detectados; `apps/web/vercel.json` torna esse comportamento explícito (regra de rewrite `/(.*) → /index.html`, necessária para rotas como `/inicio` ou `/perfil` funcionarem em um recarregamento direto do navegador, já que o roteamento é 100% client-side via `react-router-dom`) e define `Cache-Control` de longa duração e imutável para `/assets/*` (arquivos com hash no nome gerados pelo Vite a cada build — seguro cachear "para sempre") e `no-cache`/`must-revalidate` para `index.html` (garante que o usuário sempre recebe a referência aos arquivos da versão mais recente após um novo deploy, evitando servir um `index.html` antigo apontando para assets que não existem mais).
- **HTTPS obrigatório**: tanto Vercel quanto Netlify fornecem TLS automático; qualquer outra hospedagem deve garantir HTTPS antes de convidar usuários reais (formulários de login/senha nunca devem tramitar em HTTP puro).

## 5.1 Performance do Build (Sprint 19)

- Code-splitting: rotas autenticadas e auth em `React.lazy`; `manualChunks` separa `react-vendor`, `supabase`, `icons`, `forms`, `sentry`.
- Sentry só é baixado quando `VITE_SENTRY_DSN` está definido (`import()` dinâmico em `initSentry`).
- Modais / Onboarding ainda são candidatos a lazy adicional se o aviso de chunk voltar a aparecer.
- **Cache**: `vercel.json` (seção 5) já cobre `/assets/*` com cache imutável de longa duração.

## 6. Checklist de Deploy

- [ ] Migrações SQL aplicadas no projeto Supabase de produção/staging (seção 2.1), incluindo `ai_chat_rate_buckets` e `pluggy_connections`.
- [ ] Row Level Security confirmado habilitado nas tabelas de produto; Edges `atlas-ai-chat` e `pluggy-proxy` deployadas quando forem usadas.
- [ ] "Site URL" e "Redirect URLs" configurados no Supabase Auth (seção 2.2), incluindo `/redefinir-senha`.
- [ ] Decisão tomada e configurada sobre exigir confirmação de e-mail ou não.
- [ ] Variáveis `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` configuradas no ambiente de build de produção (nunca a `service_role`).
- [ ] "Root Directory" do projeto na plataforma de hospedagem configurado como `apps/web` (o repositório não tem `package.json` na raiz — é `apps/web` que contém a aplicação real).
- [ ] `npm run lint` e `npm run build` executados sem erros a partir de uma checkout limpa (não só localmente).
- [ ] Deploy publicado com HTTPS e fallback de SPA funcionando (`apps/web/vercel.json` já define a regra de rewrite `/(.*) → /index.html` para Vercel) — testar recarregar a página em `/inicio` (e em `/perfil`) diretamente pela URL.
- [ ] Teste manual completo em produção: cadastro → (confirmação de e-mail, se habilitada) → login → esqueci minha senha → redefinição → onboarding guiado → transações/contas/metas/planejamento → logout.
- [ ] Teste manual em pelo menos um dispositivo mobile real (não apenas emulação) para os fluxos de login/cadastro/onboarding.
- [ ] Canal definido para os alpha testers reportarem bugs/feedback (ex: formulário, e-mail dedicado, ou canal de chat).
- [ ] (Recomendado) `VITE_SENTRY_DSN` configurado no ambiente de build antes de convidar os primeiros usuários.

## 7. Limitações Conhecidas Pós-Deploy

- Sem testes automatizados (unitários/E2E) — todo o checklist acima depende de verificação manual.
- Monitoramento de erros depende de configurar `VITE_SENTRY_DSN` no deploy (integração pronta na Sprint 19).
- Sem paginação nas listagens (transações/contas/metas/despesas fixas) — aceitável para o volume inicial de um Alpha privado, mas deve ser revisitado antes de uma abertura mais ampla (ver `roadmap/backlog.md`, seção 8).

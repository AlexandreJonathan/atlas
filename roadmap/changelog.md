# Changelog — Atlas

Todas as alterações relevantes do projeto são documentadas neste arquivo, em ordem cronológica inversa (mais recente primeiro).

Formato inspirado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [Sprint 24] — Atlas AI Trust Boundary (Missão 24)

Fecha a trust boundary do agente: tools, schemas e resultados financeiros só no servidor. Versão `0.9.5`.

### Adicionado
- Edge: allowlist `SERVER_TOOL_DEFINITIONS`, loop do agente e execução RLS (`agentTrust` / `agentTools` / `agentLoop`).
- Cliente: `agentTrustBoundary` + `buildSafeAgentPayload` (somente user/assistant).
- Testes Vitest de injection (`npm run test`).
- `roadmap/sprint-24.md`.

### Alterado
- `mode=agent` deixa de aceitar `tools`, `toolChoice`, `context`, `role=tool` e `system` do cliente.
- Rate limit fail-closed; CORS sem `*`.
- `AtlasToolRegistry` permanece local (legado/testes) — não alimenta o LLM em produção.

### Validado
- `npm run lint`, `npm run test` e `npm run build` sem erros.

---

## [Sprint 22] — Atlas AI Tool Calling (Missão 22)

Agente Atlas IA com tools tipadas sobre `FinancialDataService`. UX e contrato da FDL preservados. Versão `0.9.4`.

### Adicionado
- `AtlasToolRegistry` + schemas (`getFinancialSnapshot`, `getAccounts`, `getTransactions`, `getInvestments`, `getGoals`).
- Loop `runAtlasToolAgent` (timeout/retry/logs/analytics).
- Edge `atlas-ai-chat` modo `agent` (tool calling) + legado.
- Eventos `atlas_ai_tool_*` / `atlas_ai_agent_*`.
- `roadmap/sprint-22.md`.

### Alterado
- `OpenAIProvider` passa a orquestrar o agente antes do fallback legado/mock.

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 21] — Pluggy Integration (Missão 21)

Integração real com a Pluggy via Edge Function. Contrato da FDL e UX preservados. Versão `0.9.3`.

### Adicionado
- Edge Function `pluggy-proxy` (API Key server-side, Connect Token, register/sync, snapshot, connectors).
- Migração `pluggy_connections`.
- Módulo `src/modules/pluggy/` (client com timeout/retry, mapper, overlay Connect).
- Analytics `pluggy_connect_*` / `pluggy_sync_*`.
- `roadmap/sprint-21.md`.

### Alterado
- `PluggyOpenFinanceProvider` e `PluggyFinancialDataProvider` deixam de ser stubs.
- Docs de deploy (secrets Pluggy).

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 20] — Financial Data Layer (Missão 20)

Camada única de dados financeiros antes da Pluggy real. Sem mudança de UX. Versão `0.9.2`.

### Adicionado
- Módulo `src/modules/financial-data/` (`FinancialDataService`, `FinancialDataProvider`, Mock + stub Pluggy).
- Cache em memória, `sync` / `invalidate`, loading/syncing, mutações otimistas e `financialDataEvents`.
- `useFinancialData` como porta React da Home, Atlas IA, AppShell e Investimentos.
- `roadmap/sprint-20.md`.

### Alterado
- `useAtlasIntelligence` passa a receber `FinancialSnapshot` (sem `MOCK_INVESTMENTS` direto).
- `AppConfig.providers.financialData` (`mock` \| `pluggy` via `VITE_FINANCIAL_DATA_PROVIDER`).

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 19] — Alpha Hardening (Missão 19)

Endurecimento de produção para Alpha privado. Sem Tool Calling, sem Pluggy HTTP, sem novas features de produto. Versão `0.9.1`.

### Adicionado
- Migração `ai_chat_rate_buckets` + rate limit na Edge `atlas-ai-chat` (usuário + IP).
- Contexto financeiro confiável montado no servidor (RLS); cliente não envia saldo/metas ao LLM.
- Modo limitado na Atlas IA (`ChatReplyResult`, banner, analytics `atlas_ai_rate_limited`).
- Integração Sentry opcional (`VITE_SENTRY_DSN`, import dinâmico).
- `roadmap/sprint-19.md`.

### Alterado
- Open Finance: `BankId` string + factory drop-in para `PluggyOpenFinanceProvider` (stub leitura vazia).
- Vite `manualChunks` + lazy das rotas de auth.
- Docs de deploy / arquitetura / backlog.

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 17] — Atlas AI Integration (Missão 17)

Primeiro LLM real (OpenAI) no chat da Atlas IA, via Edge Function. Sem chave no front; Insights/Home intactos; fallback mock.

### Adicionado
- Edge Function `supabase/functions/atlas-ai-chat` (proxy OpenAI, JWT obrigatório).
- `OpenAIProvider` + `openaiEdgeClient` (timeout, retry, logs, analytics).
- Eventos `atlas_ai_chat_success` / `atlas_ai_chat_fallback`.
- `roadmap/sprint-17.md`; versão app `0.9.0`.

### Alterado
- Factory do `AtlasIntelligenceService` seleciona OpenAI quando `VITE_FF_OPENAI=true`.
- Docs de deploy / `atlas-intelligence.md` / arquitetura.

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 16] — Observability & Quality Foundation (Missão 16)

Infraestrutura de qualidade para crescer com segurança. Sem novas funcionalidades de produto, sem OpenAI/Pluggy, sem mudanças de UX/negócio/DB/auth.

### Adicionado
- `ErrorBoundary` global com fallback elegante e retorno à Home.
- `src/lib/logging` — logger com níveis debug/info/warning/error e sink preparado para Sentry.
- `src/config` — `AppConfig`, `FeatureFlagService` (openai, openFinance, investments, notifications).
- `src/lib/analytics` — `AnalyticsService` com eventos tipados (sem envio externo).
- `roadmap/sprint-16.md` e seção 11.1 em `arquitetura.md`.

### Alterado
- Wiring mínimo de `analytics.track` em login, cadastro, onboarding, Home, Conectar banco e Atlas IA.
- Services Open Finance / Intelligence leem `AppConfig` para provider pretendido (runtime permanece mock).

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 15] — Atlas Perfection (UI/UX 10.0)

Refinamento premium exclusivo de UI/UX sobre a RC v0.8. Sem novas funcionalidades nem mudanças de negócio/DB/auth/arquitetura.

### Adicionado
- Shell `.atlas-page-shell`, eyebrow `.atlas-page-eyebrow`, padding `.atlas-surface-pad`
- Tokens de layout (`--atlas-page-max-*`, `--atlas-icon-xl`, `--atlas-touch-min`, `--z-nav`)
- `@keyframes atlas-rise` compartilhado
- `roadmap/sprint-15.md`

### Alterado
- Versão `0.8.1`
- Focus/a11y em nav, links, quick actions, perfil, toasts; contraste tertiary
- Auth feedback (erro/sucesso), Home skeletons, empty states, toasts semânticos
- Cards/surfaces/hover e motion unificados nas abas

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 14] — Atlas v0.8 Release Candidate (Missão 15)

Primeira Release Candidate apresentável. Somente qualidade (visual, consistência DS, UX, performance leve). Sem novas funcionalidades, sem mudanças de negócio/DB/auth.

### Adicionado
- `roadmap/release-v0.8.md` — inventário da versão e critérios da RC.
- `roadmap/sprint-14.md`.
- Utilitários globais `.atlas-surface` e `.atlas-link`.
- Tokens `--atlas-focus-ring`, `--atlas-icon-md` / `--atlas-icon-lg` (além do já existente `--atlas-bottom-nav-height`).
- Code-split das abas autenticadas via `React.lazy` + `Suspense` em `App.tsx`.

### Alterado
- Versão do app: `0.8.0`.
- Home / Insights / Feed / Auth / shell: radius, shadows, tipografia e links alinhados ao Design System.
- Inputs (focus/disabled), StatCard e Bottom Nav; overflow horizontal do `body` contido.
- Hub Open Finance: loading curto; botão de sync desabilitado durante sync em andamento.

### Validado
- `npm run lint` e `npm run build` sem erros.
- Deploy Vercel a partir de `main`.

---

## [Sprint 13] — Atlas Polish + UX Review 1.0

Polish de UX/UI baseado em `roadmap/ux-review-1.0.md`. Sem novas funcionalidades de negócio.

### Adicionado
- Relatório `roadmap/ux-review-1.0.md` (Missão 14).
- CTA compacto Home → Atlas IA; token `--atlas-bottom-nav-height`.

### Alterado
- Home: ordem “quanto tenho / o que fazer / o que aconteceu”; removidos Panel e Feed da Home.
- Investimentos e Perfil: mesma coluna visual da Home/Contas; eyebrows; disclaimer mais suave.
- Atlas IA: chat-first; feed em “Atividade”; composer com `Input` do DS.
- Bottom nav: labels curtas (Investir / IA); Auth links em brand.

### Removido
- Toggles “Em breve” no Perfil (notificações/configurações placeholder).

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 12] — Atlas Intelligence 1.0 (Missão 13)

Arquitetura do cérebro da Atlas: insights automáticos, feed inteligente e contrato Adapter/Provider para IA futura. **Sem OpenAI/LLM** nesta sprint.

### Adicionado
- Módulo `src/modules/atlas-intelligence/` (engine, providers Mock + stub OpenAI, service, hooks, prompts, AtlasInsights, IntelligenceFeed).
- `roadmap/atlas-intelligence.md` e `roadmap/sprint-12.md`.

### Alterado
- Home: bloco Atlas Insights (top 3) + Feed inteligente; eventos de receita/despesa/conta/meta narrados no feed.
- Atlas IA: respostas via `MockAtlasAIProvider` com contexto financeiro.

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 11] — Microinterações Premium (Missão 12)

Camada de feedback visual/sonoro desacoplada em `src/lib/microinteractions`. Sem alteração de regras de negócio, Supabase, Pluggy ou rotas.

### Adicionado
- Implementação real de `triggerMicrointeraction` (som Web Audio, money rain, glow, sync, haptic).
- Toasts modernos (`ToastHost` no `AppShell`) — success / error / warning / info.
- `AnimatedNumber` (contador 60fps sem re-render por frame).
- Bridge Open Finance → Pix recebido dispara `money_in`.
- `roadmap/sprint-11.md`.

### Alterado
- Home, WealthHero, Hub Contas, Conectar bancos, Atlas Intelligence, Bills Timeline passam a usar a camada.
- Backlog: item de microinterações no-op marcado como concluído.

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 10] — Open Finance Foundation (Missão 11)

Fundação de Open Finance com Adapter/Provider. Provedor-alvo do MVP: **Pluggy**. Sem integração HTTP/SDK nesta sprint — apenas mock + stub.

### Adicionado
- Módulo `src/modules/open-finance/`: types, `OpenFinanceProvider`, `MockOpenFinanceProvider`, stub `PluggyOpenFinanceProvider`, `OpenFinanceService`, catálogo, snapshot mock, aggregator, event bus, `useOpenFinance`.
- Telas: Hub financeiro (`/contas`), Conectar bancos (`/contas/conectar`), Contas conectadas (`/contas/conectadas`).
- `roadmap/sprint-10.md`.

### Alterado
- Aba Contas passa a renderizar o hub Open Finance (em vez do mock estático antigo).
- Perfil → Open Finance navega para `/contas`.
- Bottom Nav mantém Contas ativa em rotas aninhadas `/contas/*`.

### Removido
- `src/data/mockOpenFinance.ts` (substituído pelo módulo).

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 9] — Atlas Premium Home (UX First)

Redesenho completo da Home mobile-first: Hero premium, Atlas Pulse, Intelligence conversacional, seções de síntese. Sem alteração de banco/auth/engines. UX aprovada em `roadmap/ux-home-premium.md`.

### Adicionado
- `src/components/home/`: `HomeHeader`, `WealthHero`, `AtlasPulse`, `QuickActions`, `BillsTimeline`, `GoalsFocus`, `InvestmentsTeaser`, `PlanningSnapshot`, `TransactionsPreview`.
- `src/lib/atlasPulse.ts`: seleção de uma mensagem inteligente por heurística local.
- `roadmap/sprint-09.md`, proposta UX em `roadmap/ux-home-premium.md`.

### Alterado
- `HomePage.tsx`: nova composição e hierarquia; despesas fixas só dentro de Planejamento.
- `AtlasIntelligencePanel`: layout conversacional (bolhas) + link para `/atlas-ia`.
- Contas / Investimentos / Atlas IA: removidos badges/hints de “dados simulados”.

### Validado
- `npm run lint` e `npm run build` sem erros.

---

## [Sprint 8] — Atlas Experience 2.0 (Nova Arquitetura do Aplicativo)

Missão de navegação/UX: a Atlas deixa de ser uma página única e passa a funcionar como app com Bottom Navigation e 5 abas. Sem Open Finance real, sem IA real, sem alteração de banco ou autenticação. Detalhes em `roadmap/sprint-08.md`.

### Adicionado
- `src/components/layout/AppShell.tsx` + `BottomNavigation.tsx` (shell autenticado + nav inferior fixa).
- Páginas: `src/pages/HomePage.tsx`, `AccountsPage.tsx`, `InvestmentsPage.tsx`, `AtlasAIPage.tsx`, `ProfilePage.tsx`.
- Mocks tipados: `src/data/mockOpenFinance.ts`, `mockInvestments.ts`, `mockAtlasAiChat.ts`.
- `src/lib/microinteractions/` — API no-op para animações/sons/vibração futuras.
- Rotas `/inicio`, `/contas`, `/investimentos`, `/atlas-ia`, `/perfil`; redirects de `/` e `/dashboard` → `/inicio`.

### Alterado
- `App.tsx`: rotas aninhadas sob `ProtectedRoute` + `AppShell`.
- Login/Cadastro/Redefinir senha navegam para `/inicio`.
- `saudacaoPorHorario` exportada de `atlasIntelligenceCopy.ts` para a saudação da Home.
- Onboarding permanece no `AppShell` (substitui o app até concluir/adiar).

### Removido
- `Dashboard.tsx` / `Dashboard.css` — substituídos por `HomePage` + shell.

### Validado
- `npm run lint` e `npm run build` sem erros.

### Documentação
- `roadmap/sprint-08.md` criado; `arquitetura.md`, `backlog.md`, `docs/deploy.md` atualizados.

---

## [Sprint 7] — Atlas Premium Experience (Design System + Dashboard 2.0)

Missão exclusivamente visual/UX (Fases 1 a 5 do plano da missão): criação do Design System oficial da Atlas e redesenho completo de Auth, Onboarding, Dashboard e da nova identidade "Atlas Intelligence" — nenhuma alteração de regra de negócio, banco de dados, RLS ou autenticação. Detalhes completos em `roadmap/sprint-07.md` e `roadmap/design-system.md`.

### Adicionado
- `src/styles/tokens.css`: tokens de cor, tipografia (`Inter Variable`), espaçamento, radius, sombra e motion — importado uma única vez em `main.tsx`.
- Dependências `lucide-react` (ícones) e `@fontsource-variable/inter` (fonte self-hosted).
- `src/components/ui/`: `Button`, `Card`, `Input`, `Modal`, `Badge`, `ProgressRing`, `MiniBarChart`, `StatCard`, `AtlasLogo` (novos) + `ProgressBar` (migrado de `components/`).
- `roadmap/design-system.md`: documentação completa do Design System.
- `src/components/AuthLayout.tsx`/`.css`: shell compartilhado de Login/Cadastro/Recuperação de senha.
- `src/components/Panels.css`: estilos compartilhados dos painéis e listas do Dashboard.
- `src/components/AtlasIntelligencePanel.tsx`/`.css` (renomeado de `RecommendationsPanel.tsx`) e `src/lib/atlasIntelligenceCopy.ts` (função pura de saudação + resumo conversacional a partir das recomendações já calculadas).

### Alterado
- `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`: migrados para `AuthLayout` + `Input`/`Button` do Design System, com ícones; lógica de formulário/validação/Supabase Auth inalterada.
- `OnboardingWizard.tsx` + os 6 passos: migrados para `Card`/`Button`/`Input`/`ProgressBar` do Design System, com um ícone por passo no lugar de emoji; lógica de navegação/persistência/guard inalterada.
- `Dashboard.tsx`: reorganizado com cabeçalho (logo + saudação personalizada + prévia da Atlas Intelligence) e hierarquia clara de seções; `Dashboard.css` reduzido de ~570 para ~110 linhas.
- `FinancialSummaryCards.tsx`: cards simples substituídos por `StatCard` + `MiniBarChart` (receitas x despesas do mês).
- `PlanningPanel.tsx`: ganhou um `ProgressRing` de saúde financeira do mês (mesmo dado que já define o `risco` calculado por `planningEngine.ts`).
- `PlanningPanel.tsx`, `UpcomingBillsPanel.tsx`, `GoalsPanel.tsx`, `FixedExpensesPanel.tsx`, `TransactionsList.tsx`, `BillsList.tsx`, `GoalsList.tsx`, `FixedExpensesList.tsx`: migrados para `Card`/`Button`/ícones, com hover state e entrada em stagger sutil nas listas.
- `TransactionModal.tsx`, `BillModal.tsx`, `GoalModal.tsx`, `FinancialProfileModal.tsx`, `FixedExpenseModal.tsx`: migrados para o `Modal` compartilhado (`components/ui/Modal.tsx`) + `Input`/`Button`.
- `SeverityBadge.tsx`: passou a ser um wrapper fino sobre `Badge` (ícones `lucide-react` no lugar de emoji), mesma API pública.
- `AsyncStateView.tsx`: mesma API pública, loading agora com skeleton shimmer.
- `index.html`: `<title>` genérico do template ("web") substituído por "Atlas — Organização financeira pessoal".

### Removido
- `App.css`: removido por completo (bloco de landing page morto identificado na FAT + classes ainda em uso migradas para `AuthLayout.css` antes da remoção).
- `public/icons.svg`: nunca referenciado por nenhum componente (identificado na FAT).
- Todos os emojis usados como "ícone" (~15 ocorrências) substituídos por ícones `lucide-react`.

### Decisões de arquitetura
- "Sparkline" do plano original foi implementado como `MiniBarChart` (comparação de valores agregados): os dados disponíveis (`receitasDoMes`/`despesasDoMes`) são agregados mensais, não uma série temporal diária — um gráfico de barras comparativo reflete os dados reais sem inventar histórico.
- Todas as classes CSS de `components/ui/` usam o prefixo `atlas-`, separando claramente o Design System novo de qualquer classe legada durante a migração.
- Tema 100% escuro nesta sprint (evolução da paleta navy já existente) — alternância clara/escura fica no backlog.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso (aviso de bundle >500 kB já existente antes desta sprint, não agravado de forma relevante).

### Documentação
- `roadmap/sprint-07.md` e `roadmap/design-system.md` criados.
- `roadmap/backlog.md` e `roadmap/arquitetura.md` atualizados.

---

## [Sprint 6] — Alpha Readiness

Sprint focada em remover os bloqueadores identificados na Auditoria de Produto (ver seção abaixo) para o primeiro Alpha privado: recuperação de senha, confirmação de e-mail, responsividade completa, onboarding guiado e preparação de deploy.

### Adicionado
- Recuperação de senha completa via Supabase Auth: `src/components/ForgotPassword.tsx` (`/esqueci-senha`) e `src/components/ResetPassword.tsx` (`/redefinir-senha`), com `src/validations/forgotPasswordSchema.ts` e `src/validations/resetPasswordSchema.ts`.
- Fluxo de confirmação de e-mail tratado em todos os estados: `Register.tsx` diferencia sessão imediata (confirmação desabilitada) de cadastro pendente (mostra tela dedicada com reenvio); `Login.tsx` oferece reenvio quando o erro é especificamente "e-mail não confirmado".
- `MENSAGEM_EMAIL_NAO_CONFIRMADO` e novas mensagens amigáveis em `src/lib/authErrors.ts` (senha igual à anterior, link expirado/inválido, limite de tentativas, sessão ausente).
- Onboarding guiado de primeiro acesso: tabela `onboarding_status` no Supabase com RLS (`supabase/migrations/20260714100000_create_onboarding_status_table.sql`), `src/services/onboardingService.ts`, `src/hooks/useOnboarding.ts` (com estratégia de backfill para usuários que já tinham dados configurados antes desta sprint) e `src/components/onboarding/` (`OnboardingWizard` + 6 passos: `WelcomeStep`, `IncomeStep`, `ReserveStep`, `FixedExpensesStep`, `FirstGoalStep`, `FinishStep`).
- `monthlyIncomeSchema`/`minimumReserveSchema` em `src/validations/financialProfileSchema.ts` (derivados via `.pick()` do schema completo, reaproveitados pelos passos 2 e 3 do onboarding).
- `docs/deploy.md`: guia e checklist completo de deploy (migrações, configuração de Auth no Supabase, variáveis de ambiente, build, hospedagem).

### Alterado
- `Dashboard.tsx`: passou a chamar `useOnboarding` e a decidir entre exibir o wizard de onboarding ou o Dashboard completo, com um estado de carregamento explícito antes dessa decisão.
- `App.css`: `.login-card` deixou de ter largura fixa (420px) e passou a ser responsiva (`width: min(420px, 92vw)`), usada por Login, Cadastro e as duas novas telas de senha; novas classes `.login-links`, `.mensagem-sucesso`, `.link-botao`.
- `Dashboard.css`: novo bloco de media queries (≤600px e ≤480px) revisando padding, largura de cards, modais/painéis e empilhamento de ações em telas estreitas, garantindo uso entre 320px e 1920px.
- `App.tsx`: novas rotas públicas `/esqueci-senha` e `/redefinir-senha`.

### Decisões de arquitetura
- Progresso do onboarding persistido no Supabase (não em `localStorage`), consistente entre dispositivos e sobrevivendo a recarregamentos — mesmo padrão de perfil financeiro/despesas fixas.
- Renda mensal e reserva mínima ficam em estado local do wizard até o passo 3 ser confirmado, quando são salvas juntas em uma única chamada a `financial_profiles` (evita salvar um perfil parcialmente inválido).
- "Pular por agora" no onboarding é um estado local de sessão (não persistido) — o wizard volta a aparecer no próximo acesso até ser efetivamente concluído.
- Redefinição de senha não revela se um e-mail está ou não cadastrado (mesma mensagem de sucesso em ambos os casos), mitigando enumeração de usuários.

### Corrigido
- `react-hooks/set-state-in-effect` em `ResetPassword.tsx`, usando o mesmo padrão (`Promise.resolve().then(...)`) já estabelecido em outros hooks do projeto.

### Documentação
- `roadmap/sprint-06.md` criado.
- `roadmap/backlog.md` e `roadmap/arquitetura.md` atualizados com os novos domínios, rotas, componentes e dívidas técnicas identificadas.
- `docs/deploy.md` criado.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso.

---

## [Migrations Aplicadas em Produção] — Banco real do Supabase sincronizado

Após o primeiro deploy na Vercel, o onboarding falhava com `PGRST205` (`relation "public.onboarding_status" does not exist`). Investigação encontrou que **nenhuma das 6 migrations havia sido aplicada** ao projeto Supabase real (o banco estava vazio — só existiam os 2 usuários já cadastrados via Auth, sem nenhuma tabela do domínio da aplicação).

### Ações realizadas
- As 6 migrations de `supabase/migrations/` foram aplicadas, em ordem, diretamente no banco de produção via conexão Postgres (Session/Transaction pooler, já que a conexão direta IPv6 não era alcançável na rede utilizada).
- Confirmado no próprio banco: as 6 tabelas existem, com Row Level Security **ON** e as 4 policies esperadas (`SELECT`/`INSERT`/`UPDATE`/`DELETE`, todas restritas a `auth.uid() = user_id`) em cada uma — total de 24 policies.
- Validação end-to-end de escrita: simulada uma gravação real em `onboarding_status` como um dos usuários já cadastrados, com o role `authenticated` e o claim JWT (`auth.uid()`) configurados exatamente como o Supabase faz em produção — `INSERT`/`UPSERT`, `SELECT` e `UPDATE` funcionaram corretamente respeitando o RLS. A transação foi revertida (`ROLLBACK`) ao final, sem deixar dados de teste.
- Nenhuma alteração de código nesta entrada — puramente operacional (infraestrutura do banco de produção).

### Nota para o fundador
Nenhuma migration precisa ser reaplicada manualmente — o banco de produção já reflete o schema completo esperado pela aplicação. Se novas migrations forem criadas no futuro, seguir o mesmo processo documentado em `docs/deploy.md`/`docs/guia-deploy-fundador.md`.

---

## [Primeiro Deploy Oficial] — Preparação de publicação (Vercel)

Missão exclusivamente de preparação de deploy (DevOps/Release), sem novas funcionalidades: revisão de toda a configuração de produção, criação da configuração explícita para Vercel e de um guia de deploy não-técnico para o fundador.

### Adicionado
- `apps/web/vercel.json`: rewrite `/(.*) → /index.html` (fallback de SPA explícito, para as rotas do `react-router-dom` funcionarem em recarregamentos diretos) e `headers` de cache (`/assets/*` com `Cache-Control: public, max-age=31536000, immutable` — seguro porque o Vite gera nomes de arquivo com hash a cada build; `/index.html` com `no-cache, must-revalidate`, para nunca servir uma referência antiga a assets que não existem mais após um novo deploy).
- `docs/guia-deploy-fundador.md`: guia passo a passo sem jargão técnico, cobrindo criação/configuração do projeto Supabase (migrações, Authentication), criação de conta e projeto na Vercel, configuração de variáveis de ambiente, publicação, teste em produção e uma tabela de problemas comuns com solução.

### Alterado
- `docs/deploy.md`: nova seção "5.1 Performance do Build" documentando (sem otimizar) o tamanho atual do bundle (587 kB JS / ~165 kB gzip) e os candidatos a code-splitting (modais e `OnboardingWizard`, via `React.lazy`); checklist de deploy (seção 6) atualizado com o item "Root Directory = apps/web" e referência ao `vercel.json`; link para o novo guia do fundador adicionado no topo.
- `roadmap/arquitetura.md`: árvore de diretórios atualizada com `vercel.json` e `docs/guia-deploy-fundador.md`.

### Verificado (sem alterações necessárias)
- **Vite/build**: `vite.config.ts` minimalista e correto (sem `base` customizado, adequado para deploy na raiz de um domínio); build de produção gera `dist/` corretamente; nenhuma configuração insegura encontrada.
- **`.env.example`**: contém apenas placeholders vazios (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), nenhuma credencial real; `.gitignore` confirmado ignorando `.env`/`.env.*` e `dist/` (verificado com `git check-ignore`).
- **`console.*` em produção**: apenas dois pontos no código, ambos intencionais e apropriados para produção — `lib/supabase.ts` (`console.warn` quando as variáveis de ambiente não estão configuradas) e `lib/errorMessages.ts` (`console.error` para depuração de erros reais, sempre acompanhado de uma mensagem amigável na UI). Nenhum `console.log` de debug esquecido.
- **Supabase Storage**: não utilizado por nenhuma funcionalidade do produto — nenhuma configuração de bucket/política de Storage necessária para este deploy.
- **RLS**: reconfirmado habilitado e correto nas 6 tabelas (checklist detalhado em `docs/deploy.md`, seção 2.1).

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso (mesmo aviso de bundle >500 kB já documentado, não bloqueante).

### Veredito
A Atlas está pronta para o primeiro deploy público. As pendências restantes são 100% operacionais e de responsabilidade exclusiva do fundador (criar os projetos Supabase/Vercel, aplicar migrações, configurar variáveis e URLs) — nenhuma pendência de código.

---

## [FAT — Founder Acceptance Test] — Validação de qualidade pré-uso real

Missão exclusivamente de validação (QA/arquitetura/segurança/produto), sem novas funcionalidades: revisão completa de todos os fluxos, UX, responsividade (320px–1920px), performance, segurança e arquitetura, respondendo à pergunta "um usuário comum consegue usar a Atlas por 30 dias sem dificuldades?". Três problemas reais foram encontrados e corrigidos.

### Corrigido
- `src/index.css`: arquivo ainda era o boilerplate original do template Vite/React (nunca adaptado ao layout real da Atlas) — o seletor `#root` tinha `width: 1126px` (com `max-width: 100%`) e `border-inline: 1px solid`, o que **limitava visivelmente toda a aplicação a uma coluna de 1126px com bordas verticais visíveis em qualquer tela mais larga que isso** (ex: 1920px), deixando uma área morta nas laterais em vez do layout ocupar a tela inteira — problema direto para o critério de responsividade "até 1920px". Também continha variáveis de tema, modo escuro e seletores (`.counter`, `#social`) nunca usados por nenhum componente real. Arquivo reduzido a um reset mínimo (`box-sizing`, `margin` do `body`); o bundle de CSS caiu de 13.72 kB para 11.97 kB, confirmando que o código morto estava sendo enviado para produção.
- `components/onboarding/OnboardingWizard.tsx`: recarregar a página exatamente no passo 3 (reserva mínima) perdia a renda mensal informada no passo 2 (mantida apenas em estado local até a confirmação do passo 3), fazendo a confirmação da reserva salvar `monthlyIncome: 0` — valor que viola a constraint do banco (`monthly_income > 0`) — e exibir um erro genérico sem explicação, sem indicar ao usuário que precisava voltar e reinformar a renda. Adicionado um guard que detecta esse estado (`passo === 3` sem `rendaMensal` local) e retorna automaticamente ao passo 2.
- `hooks/useTransactions.ts`: `receitas`/`despesas`/`receitasDoMes`/`despesasDoMes` eram recalculados (filter+reduce sobre a lista inteira) em todo re-render, em vez de memoizados como o padrão já usado em `useBills`/`useGoals`/`useFixedExpenses`. Envolvidos em `useMemo`, por consistência e para evitar recomputo em renders não relacionados a `transactions`.

### Verificado (sem alterações necessárias)
- Todos os fluxos (cadastro, login, logout, recuperação de senha, confirmação de e-mail, onboarding, transações, contas, metas, planejamento, recomendações) percorridos manualmente ponta a ponta sem outros bugs funcionais encontrados.
- RLS, variáveis de ambiente e ausência de credenciais no código confirmados novamente sem regressões.
- Responsividade das telas de negócio (Login/Cadastro/Dashboard/painéis/modais/listas) confirmada consistente entre 320px e 1920px após a correção do `#root`.
- Arquitetura (organização de pastas, separação de responsabilidades, nomenclatura) seguindo consistentemente o padrão estabelecido nas sprints anteriores; nenhuma duplicação problemática além de convenções intencionais já documentadas.

### Observações registradas no backlog (não corrigidas nesta missão, sem impacto no uso real)
- `App.css` mantém um bloco de classes de uma landing page antiga (`.hero`, `.header`, `nav`, `.btn-primary`, etc.) não utilizado por nenhum componente atual — código morto inofensivo (já sobrescrito onde colide), candidato a limpeza futura.
- `public/icons.svg` não é referenciado por nenhum componente.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso.

### Veredito
Nenhum problema encontrado impede o uso real pelo fundador. Ver `roadmap/backlog.md` para os itens de infraestrutura (migrações em produção, monitoramento de erros) que continuam pendentes antes de convidar usuários externos além do fundador.

---

## [Sprint 6 — Auto Code Review] — Ajustes técnicos pós-implementação

Revisão técnica completa do código da Sprint 6 (Missão "Alpha Ready"): duplicação, RLS, segurança, acessibilidade, performance, tipagem, responsividade e aderência ao padrão das sprints anteriores. Todo o escopo funcional (recuperação de senha, confirmação de e-mail, responsividade, onboarding guiado, preparação de deploy) já estava implementado; a revisão focou em validar a corretude e fechar lacunas pontuais.

### Corrigido
- `components/Login.tsx` e `components/Register.tsx`: campos de e-mail/senha/nome não tinham `aria-label` (dependiam só do `placeholder`, que desaparece durante a digitação e não é lido de forma consistente por todos os leitores de tela) — único ponto da aplicação ainda sem esse padrão, já adotado por `ForgotPassword.tsx`, `ResetPassword.tsx` e todos os modais/formulários das sprints anteriores. Adicionado `aria-label` em todos os campos dos dois formulários.

### Verificado (sem alterações necessárias)
- RLS habilitado e correto nas 6 tabelas (`transactions`, `bills`, `goals`, `financial_profiles`, `fixed_expenses`, `onboarding_status`), com políticas de `select`/`insert`/`update`/`delete` restritas a `auth.uid() = user_id`; updates/deletes também filtram por `user_id` na query (defesa em profundidade).
- Nenhuma credencial ou segredo exposto no código; `.env`/`.env.*` corretamente ignorados pelo Git (exceto `.env.example`).
- Fluxo de recuperação de senha (`ForgotPassword`/`ResetPassword`) não permite enumeração de e-mails cadastrados (mesma mensagem de sucesso em qualquer caso) e trata link inválido/expirado com uma tela dedicada.
- Responsividade revisada em todas as telas listadas no escopo (Login, Cadastro, recuperação de senha, onboarding, Dashboard, painéis, listas, modais) entre 320px e 1920px — sem overflow horizontal identificado nas larguras testadas.
- Onboarding (`useOnboarding`) trata corretamente o backfill de usuários com perfil financeiro pré-existente e persiste o progresso no Supabase (não em `localStorage`), sobrevivendo a recarregamentos.
- Tipagem estrita em todo o código novo, sem uso de `any`; formulários usam `z.infer` dos schemas correspondentes.
- Sem duplicação problemática: o padrão repetido entre `services/*.ts` (mapeamento de linha, `getSupabaseClient()`) é uma convenção intencional do projeto, não uma duplicação acidental.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso.

---

## [Auditoria de Produto] — Avaliação de prontidão para Alpha privado

Análise estratégica (Product Manager/Software Architect) do estado atual da Atlas, sem nenhuma alteração de código, entregue como relatório de chat. Identificou os itens que se tornaram o escopo obrigatório da Sprint 6 (Alpha Readiness): ausência de recuperação de senha, fluxo de confirmação de e-mail sem feedback, responsividade incompleta (`.login-card` com largura fixa quebrando em mobile), ausência de onboarding guiado, e falta de preparação/checklist de deploy. Também mapeou itens não bloqueantes (paginação, monitoramento de erros, testes automatizados) que permanecem no backlog.

---

## [Sprint 4] — Dashboard Inteligente

Sprint reagendada: o conteúdo original planejado para "Sprint 4" (testes automatizados e CI) foi movido para o backlog; este número de sprint passou a cobrir a transformação do Dashboard em uma central de inteligência financeira.

### Adicionado
- Tabelas `bills` (contas a pagar/receber) e `goals` (metas financeiras) no Supabase, com Row Level Security por usuário (`supabase/migrations/20260712220000_create_bills_table.sql`, `20260712220100_create_goals_table.sql`).
- `src/services/billsService.ts` e `src/services/goalsService.ts` — camadas de acesso a dados para os novos domínios, seguindo o padrão de `transactionsService.ts`.
- `src/hooks/useBills.ts` e `src/hooks/useGoals.ts` — estado, ações (criar, marcar como paga/registrar aporte, remover) e listas derivadas (contas vencidas/vencendo em breve).
- `src/hooks/useFinancialSummary.ts` — deriva "quanto posso gastar" (saldo menos contas a pagar pendentes) a partir de `useTransactions` + `useBills`.
- `src/hooks/useRecommendations.ts` e `src/lib/recommendationEngine.ts` — motor de recomendações baseado em regras (saldo negativo, contas vencidas/próximas, gastos do mês acima da renda, metas quase concluídas), com o contrato `RecommendationProvider` já preparado para uma futura substituição por IA real.
- `src/lib/dateUtils.ts` — utilitários mínimos de data (sem dependência externa) para cálculo de vencimentos.
- Novos componentes: `RecommendationsPanel`, `FinancialSummaryCards`, `UpcomingBillsPanel`, `BillsList`, `BillModal`, `GoalsPanel`, `GoalsList`, `GoalModal`.
- Componentes reutilizáveis: `AsyncStateView` (padrão carregando/erro/vazio), `ProgressBar` (acessível, `role="progressbar"`) e `SeverityBadge` (severidade sempre com ícone + texto, nunca só cor).
- `src/types/bill.ts`, `src/types/goal.ts`, `src/types/recommendation.ts` e `src/validations/billSchema.ts`, `src/validations/goalSchema.ts`.

### Alterado
- `Dashboard.tsx`: deixou de ter qualquer lógica de negócio própria; agora só orquestra os widgets (`useTransactions`, `useBills` e `useGoals` são chamados uma única vez aqui e repassados como props, evitando requisições duplicadas dos mesmos dados).
- `TransactionsList.tsx`: refatorado para reutilizar `AsyncStateView`, eliminando a duplicação que surgiria ao criar `BillsList`/`GoalsList` com o mesmo padrão de carregando/erro/vazio.
- `useTransactions.ts`: adicionados `receitasDoMes`/`despesasDoMes` (derivados, sem novo estado), usados pela recomendação de gastos do mês acima da renda.
- `Dashboard.css`: novos estilos para os painéis (`Contas a vencer`, `Metas`, `Recomendações`), badges de severidade e barra de progresso.

### Decisões de arquitetura
- Cada widget (`RecommendationsPanel`, `FinancialSummaryCards`, `UpcomingBillsPanel`, `GoalsPanel`, `TransactionsList`) renderiza seu próprio estado de carregamento/erro/vazio de forma independente — a falha ou lentidão de uma fonte de dados não esconde nem trava as demais seções.
- `useTransactions`, `useBills` e `useGoals` são chamados uma única vez em `Dashboard.tsx`; os hooks agregadores (`useFinancialSummary`, `useRecommendations`) recebem os retornos já obtidos como parâmetros em vez de rechamar os hooks de domínio, evitando buscas duplicadas do mesmo dado.
- Registro de aporte em metas implementado como formulário inline (um único campo) em `GoalsList`, em vez de um modal dedicado — simplificação consciente para uma ação de um único campo.

### Documentação
- `roadmap/sprint-04.md` reescrito para refletir o "Dashboard Inteligente" (o escopo original de testes/CI foi movido para o backlog).
- `roadmap/backlog.md` e `roadmap/arquitetura.md` atualizados com os novos domínios, componentes e dívidas técnicas identificadas.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso.

---

## [Sprint 5] — Planejamento Financeiro Inteligente

Sprint reagendada: o conteúdo original planejado para "Sprint 5" (experiência do usuário, responsividade e deploy) foi movido para o backlog; este número de sprint passou a cobrir o planejamento financeiro inteligente (renda, despesas fixas, reserva mínima e cálculos automáticos), mesmo precedente da Sprint 4.

### Adicionado
- Tabelas `financial_profiles` (renda mensal + reserva mínima, uma linha por usuário) e `fixed_expenses` (despesas fixas recorrentes) no Supabase, com Row Level Security por usuário (`supabase/migrations/20260714000000_create_financial_profiles_table.sql`, `20260714000100_create_fixed_expenses_table.sql`).
- `src/services/financialProfileService.ts` (`getProfile`/`upsertProfile`) e `src/services/fixedExpensesService.ts` — camadas de acesso a dados para os novos domínios, seguindo o padrão de `billsService.ts`/`goalsService.ts` (filtro explícito por `user_id` em update/delete).
- `src/hooks/useFinancialProfile.ts` e `src/hooks/useFixedExpenses.ts` — estado, ações (salvar perfil; criar/remover despesa fixa) e `totalDespesasFixas` derivado.
- `src/hooks/usePlanning.ts` — compõe perfil + despesas fixas + `useFinancialSummary`/`useBills`/`useGoals` num `PlanningSnapshot`, mantendo "hoje" atualizado a cada 5 minutos (`setInterval`) para o cálculo de dias restantes no mês não ficar parado.
- `src/lib/planningEngine.ts` (`calcularPlanejamento` + `ruleBasedPlanningProvider`) — motor de regras síncrono e sem I/O que calcula quanto pode gastar hoje, quanto precisa guardar este mês, saldo previsto até o fim do mês e risco financeiro (baixo/médio/alto), com o contrato `PlanningProvider` já preparado para uma futura substituição por IA real.
- `getDiasRestantesNoMes` e `getMesesRestantes` em `src/lib/dateUtils.ts`.
- Novos componentes: `PlanningPanel` (+ `FinancialProfileModal`), `FixedExpensesPanel` (+ `FixedExpensesList`, `FixedExpenseModal`).
- `src/types/financialProfile.ts`, `src/types/fixedExpense.ts`, `src/types/planning.ts` e `src/validations/financialProfileSchema.ts`, `src/validations/fixedExpenseSchema.ts`.

### Alterado
- `Dashboard.tsx`: passou a buscar também `useFinancialProfile`/`useFixedExpenses` (uma única vez, como os demais domínios) e a renderizar `PlanningPanel` (logo após "Situação financeira hoje") e `FixedExpensesPanel` (na grade de painéis, agora com 3 colunas em telas largas).
- `lib/recommendationEngine.ts`/`DashboardSnapshot`: novo campo opcional `risco`; quando o planejamento calcula risco financeiro "alto", uma recomendação crítica adicional é gerada. `useRecommendations` passou a receber também o resultado de `usePlanning` — sem bloquear a geração das demais recomendações enquanto o planejamento ainda carrega.
- `Dashboard.css`: `paineis-grid` passou a acomodar 3 colunas (2 e depois 1 em telas menores); novos estilos para `PlanningPanel` e itens de despesa fixa.

### Decisões de arquitetura
- Perfil financeiro (`financial_profiles`) usa `user_id` como chave primária (relação 1:1), permitindo salvar sempre via `upsert` sem distinguir criação de atualização no service/hook.
- Despesas fixas não têm "dia de vencimento": são recorrentes mensais por definição, e o valor total é sempre considerado "a ocorrer" no cálculo do mês — vencimento pontual com status pago/pendente já existe no domínio `bills`.
- Metas sem `targetDate` ficam fora do cálculo de "quanto precisa guardar" (não há ritmo mensal calculável sem prazo).
- `usePlanning` não bloqueia `useRecommendations`: a integração entre os dois módulos é por composição de dados (campo opcional `risco`), não por dependência rígida de carregamento.

### Documentação
- `roadmap/sprint-05.md` reescrito para o "Planejamento Financeiro Inteligente" (o escopo original de UX/responsividade/deploy foi movido para o backlog).
- `roadmap/backlog.md` e `roadmap/arquitetura.md` atualizados com os novos domínios, componentes, fórmulas do motor de planejamento e dívidas técnicas identificadas.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso.

---

## [Sprint 4 — Auto Code Review] — Ajustes técnicos pós-implementação

Revisão técnica completa do código da Sprint 4 (bugs, duplicação, arquitetura, RLS, segredos, acessibilidade, performance, tipagem e aderência ao padrão das sprints anteriores). Melhorias identificadas foram corrigidas sem alterar o escopo funcional da sprint.

### Corrigido
- `services/billsService.ts`, `services/goalsService.ts`, `services/transactionsService.ts`: `markBillAsPaid`, `deleteBill`, `updateGoalProgress`, `deleteGoal` e `deleteTransaction` passaram a filtrar também por `user_id` (além do `id`), em defesa de profundidade — o RLS já impedia qualquer leitura/escrita cruzada entre usuários, mas a query explícita evita depender de uma única camada de segurança e deixa a intenção clara no código. `useBills`, `useGoals` e `useTransactions` foram ajustados para passar o `userId` autenticado nessas chamadas.
- `components/GoalsList.tsx`: o aporte inline não tinha nenhum indicador de carregamento nem validação visível — um valor inválido (vazio, zero ou não numérico) falhava silenciosamente, e cliques repetidos antes da resposta do servidor podiam gerar uma corrida (o segundo aporte calculado a partir de um `currentAmount` ainda não atualizado). Corrigido com um estado de "salvando" por meta (desabilita input/botão durante a requisição, eliminando a corrida) e validação usando o schema `goalContributionSchema` (que já existia em `validations/goalSchema.ts`, mas nunca era usado — a lista usava uma checagem manual `!valor || valor <= 0`), exibindo a mesma mensagem de erro padrão usada nos demais formulários.

### Refatorado
- `lib/supabase.ts`: extraída a função `getSupabaseClient()` (antes replicada de forma idêntica em `billsService.ts`, `goalsService.ts` e `transactionsService.ts`), eliminando a triplicação da checagem "Supabase configurado?" introduzida por esta sprint.

### Verificado (sem alterações necessárias)
- Todas as consultas de leitura (`listBills`, `listGoals`, `listTransactions`) já filtravam por `user_id` e todas as tabelas (`bills`, `goals`, `transactions`) têm Row Level Security habilitado com políticas de `select`/`insert`/`update`/`delete` restritas a `auth.uid() = user_id`.
- Nenhuma credencial, chave ou segredo exposto no código-fonte novo; `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` seguem vindo exclusivamente de variáveis de ambiente não versionadas.
- Hooks de domínio (`useBills`, `useGoals`, `useFinancialSummary`, `useRecommendations`) seguem o padrão de `error`/`actionError` e memoização já estabelecido, sem loops de efeito nem requisições duplicadas.
- Acessibilidade dos novos componentes (`role="dialog"`/`aria-modal` nos modais, `role="progressbar"` com `aria-value*` na barra de progresso, severidade sempre com ícone + texto) já atendia ao padrão da Sprint 3.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso.

---

## [Sprint 3] — Persistência Real de Movimentações Financeiras

### Adicionado
- Tabela `transactions` no Supabase (`supabase/migrations/20260712210000_create_transactions_table.sql`), com Row Level Security garantindo isolamento por usuário.
- Camada de serviços `src/services/transactionsService.ts` (`listTransactions`, `createTransaction`, `deleteTransaction`).
- Hook `src/hooks/useTransactions.ts`: centraliza busca, criação, remoção e cálculo derivado de receitas/despesas/saldo.
- Componente `src/components/TransactionModal.tsx`: modal único e reutilizável para registrar receita ou despesa, validado com `react-hook-form` + `zod`.
- `src/validations/transactionSchema.ts` e `src/types/transaction.ts`: schema e tipos das movimentações.
- `src/lib/errorMessages.ts`: utilitário genérico para mensagens de erro amigáveis (não expõe erros técnicos de banco/rede ao usuário).
- Estados de carregamento, erro (com nova tentativa) e lista vazia na listagem de movimentações do `Dashboard.tsx`.
- Botão de exclusão de movimentações.

### Alterado
- `Dashboard.tsx`: removido totalmente o estado financeiro local (`useState` de receitas/despesas/movimentações); agora consome dados reais via `useTransactions`. O botão "Nova Despesa" deixou de usar `alert()` e passou a abrir o mesmo modal usado para receitas.
- `Dashboard.css`: novos estilos para modal, lista de movimentações e estados de carregamento/erro/vazio (antes inexistentes/sem estilo).

### Corrigido
- Erro de lint `react-hooks/set-state-in-effect` durante o desenvolvimento do `useTransactions`, resolvido movendo as atualizações de estado para dentro de callbacks assíncronos (`.then()`), em vez de chamadas diretas no corpo do efeito.

### Documentação
- `roadmap/sprint-03.md` atualizado com status, escopo real implementado e itens adiados.
- `roadmap/backlog.md` atualizado, removendo itens concluídos e mantendo edição/categorização como pendências futuras.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso.

---

## [Sprint 3 — Auto Code Review] — Ajustes técnicos pós-implementação

Revisão técnica completa do código da Sprint 3 (duplicação, arquitetura, responsabilidades, tamanho de componentes, performance, segurança, acessibilidade, tipagem, tratamento de erros, nomenclatura e aderência ao `CLAUDE.md`). Melhorias identificadas foram corrigidas sem alterar o escopo funcional da sprint.

### Corrigido
- `validations/transactionSchema.ts`: adicionado `.trim()` na validação de `description`, eliminando uma inconsistência em que uma descrição composta majoritariamente por espaços passava a validação do formulário mas era rejeitada pela constraint do banco (`char_length(trim(description)) >= 3`), gerando um erro genérico confuso para o usuário.
- `hooks/useTransactions.ts`: erro de exclusão (`remover`) deixou de sobrescrever o estado `error` (usado para falha de carregamento da lista). Antes, uma falha ao remover uma movimentação escondia a lista inteira por trás da tela de erro/"Tentar novamente"; agora usa um estado dedicado `actionError`, exibido sem ocultar os dados já carregados.
- `components/Dashboard.tsx`: `handleLogout` agora usa `try/finally`, garantindo o redirecionamento para `/login` mesmo se `signOut()` falhar (ex: erro de rede).

### Refatorado
- `hooks/useTransactions.ts`: eliminada duplicação entre o carregamento inicial (`useEffect`) e `recarregar`, extraindo a lógica comum para `buscarTransacoes` (via `useCallback`), mantendo a conformidade com `react-hooks/set-state-in-effect`.
- `components/Dashboard.tsx`: extraída a renderização da lista de movimentações (estados de carregando/erro/vazio/itens) para um novo componente `components/TransactionsList.tsx`, reduzindo o tamanho e as responsabilidades misturadas do `Dashboard`.
- `lib/authErrors.ts` / `lib/errorMessages.ts`: removida duplicação da constante de mensagem padrão de erro; `authErrors.ts` agora reutiliza `MENSAGEM_PADRAO` exportada por `errorMessages.ts`.
- `services/transactionsService.ts`: adicionado comentário explicando os casts manuais para `TransactionRow` (ausência de tipos gerados do schema do Supabase); item registrado no backlog.

### Acessibilidade
- `components/TransactionModal.tsx`: adicionados `role="dialog"`, `aria-modal="true"` e `aria-labelledby` no contêiner do modal; fechamento via tecla `Esc`; foco automático no primeiro campo; `aria-label` nos inputs (além do `placeholder`); emojis decorativos na lista de movimentações marcados com `aria-hidden="true"`.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso.

---

## [Sprint 1] — Roteamento e Navegação

### Adicionado
- Dependência `react-router-dom` (^7.18.1).
- `ProtectedRoute.tsx`: componente de guarda de rota, redireciona usuários não autenticados para `/login`.
- `BrowserRouter` configurado em `main.tsx`, envolvendo `<App />`.
- Rotas declarativas em `App.tsx`: `/`, `/login`, `/cadastro`, `/dashboard`.
- Mecanismo simples de autenticação via `localStorage` (chave `atlas_auth`), usado por `Login.tsx` e `ProtectedRoute.tsx`.

### Alterado
- `App.tsx`: removida totalmente a navegação baseada em `useState` (variável `tela` / `setTela`); substituída por `<Routes>`/`<Route>`.
- `Login.tsx`: removidas as props `irParaCadastro` e `entrar`; navegação agora feita via `useNavigate()` e `<Link to="/cadastro">`.
- `Register.tsx`: removida a prop `voltarLogin`; navegação agora feita via `<Link to="/login">`.
- `Dashboard.tsx`: correção de lint (`setDespesas` não utilizado removido do destructuring do `useState`), sem alteração de comportamento funcional.

### Corrigido
- Erro de lint `@typescript-eslint/no-unused-vars` em `Dashboard.tsx`.

### Documentação
- Criada a pasta `/roadmap` na raiz do projeto, com os arquivos `arquitetura.md`, `backlog.md`, `changelog.md` e `sprint-01.md` a `sprint-05.md`.

### Validado
- `npm run lint` — sem erros.
- `npm run build` — build de produção concluído com sucesso.

---

## [Inicial] — Primeiro commit do Atlas

### Adicionado
- Estrutura inicial do projeto (Vite + React + TypeScript) em `apps/web`.
- Componentes iniciais: `Login`, `Register`, `Dashboard`.
- Navegação inicial entre telas via `useState` em `App.tsx` (posteriormente substituída na Sprint 1).
- Estilos base (`App.css`, `index.css`, `Dashboard.css`).

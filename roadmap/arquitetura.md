# Arquitetura — Atlas

## 1. Visão Geral

O Atlas é uma aplicação web de organização financeira pessoal, composta por um front-end SPA (Single Page Application) construído com React, TypeScript e Vite, e por um backend gerenciado via Supabase (autenticação e banco de dados Postgres). O projeto está estruturado como um monorepo, com o front-end residindo em `apps/web`.

Desde a Sprint 4, o Dashboard funciona como uma central de inteligência financeira: além de registrar receitas/despesas, o sistema acompanha contas a pagar/receber, metas financeiras e gera recomendações automáticas a partir de regras sobre os dados do próprio usuário. Na Sprint 5, o Dashboard ganhou um módulo de planejamento financeiro: a partir de renda mensal, despesas fixas recorrentes e reserva mínima configuradas pelo usuário, o sistema calcula automaticamente quanto pode gastar hoje, quanto precisa guardar, o saldo previsto até o fim do mês e o risco financeiro (baixo/médio/alto). Na Sprint 6 ("Alpha Readiness"), o produto ganhou os últimos itens bloqueantes para um primeiro Alpha privado: recuperação de senha, fluxo de confirmação de e-mail tratado em todos os estados, responsividade completa (320px–1920px), um onboarding guiado no primeiro acesso e um checklist de deploy documentado (`docs/deploy.md`). Na Sprint 7 ("Atlas Premium Experience"), a aplicação recebeu um Design System oficial (`roadmap/design-system.md`) e um redesenho visual completo (Auth, Onboarding, Dashboard e a nova identidade "Atlas Intelligence") — puramente de UX/UI, sem alterar nenhuma regra de negócio ou dado. Na Sprint 8 ("Atlas Experience 2.0"), a Atlas deixou de ser uma página única: passou a um `AppShell` com Bottom Navigation e cinco abas (Início, Contas, Investimentos, Atlas IA, Perfil), com dados de preparação para Open Finance, investimentos e chat de IA — sem integrações reais ainda. Na Sprint 9 ("Atlas Premium Home"), a Home foi redesenhada mobile-first com WealthHero, Atlas Pulse, Intelligence conversacional e seções de síntese (`src/components/home/`). Na Sprint 10 ("Open Finance Foundation" / Missão 11), a Atlas ganhou o módulo `src/modules/open-finance/` com padrão Adapter/Provider (`OpenFinanceService` → `OpenFinanceProvider`), mock ativo, stub Pluggy (provedor-alvo do MVP, sem HTTP), hub financeiro e telas de conectar/contas conectadas. Na Sprint 11 ("Microinterações Premium" / Missão 12), a API no-op de `src/lib/microinteractions` passou a ter implementação real (som, money rain, toasts, contador animado, glow, sync) sem alterar regras de negócio. Na Sprint 12 ("Atlas Intelligence 1.0" / Missão 13), nasceu o módulo `src/modules/atlas-intelligence/` com Insight Engine, feed inteligente e `AtlasAIProvider` (Mock ativo, OpenAI stub) — sem LLM real. Na Sprint 13 ("Atlas Polish"), a Home e o shell foram simplificados (chat-first em Atlas IA; feed sob demanda). Na Sprint 14 ("v0.8 Release Candidate" / Missão 15), a Atlas consolidou consistência do Design System, lazy-loading das abas autenticadas e documentação de release (`roadmap/release-v0.8.md`) — sem novas funcionalidades nem integrações reais de OpenAI/Pluggy. Na Sprint 15 ("Atlas Perfection"), o shell de página, focus rings, motion compartilhado e estados async/empty foram refinados para demo premium (`0.8.1`), ainda sem alterar regras de negócio ou arquitetura de módulos. Na Sprint 16 ("Observability & Quality Foundation"), a Atlas ganhou Error Boundary global, logging centralizado, Feature Flags, Analytics desacoplado e `AppConfig` — infraestrutura de qualidade sem novas funcionalidades de produto nem integrações OpenAI/Pluggy.

## 2. Stack Tecnológica

| Camada              | Tecnologia            | Versão   |
|---------------------|------------------------|----------|
| Linguagem           | TypeScript             | ~6.0.2   |
| Framework UI        | React                  | ^19.2.7  |
| Bundler / Dev Server| Vite                   | ^8.1.1   |
| Roteamento          | react-router-dom       | ^7.18.1  |
| Formulários/validação | react-hook-form + zod | ^7.81.0 / ^4.4.3 |
| Backend / Auth / Dados | Supabase (`@supabase/supabase-js`) | ^2.110.2 |
| Lint                | ESLint + typescript-eslint | ^10.6.0 / ^8.62.0 |
| Estilo              | CSS puro (arquivos `.css` por componente) + Design System próprio (`src/styles/tokens.css` + `src/components/ui/`) | — |
| Ícones              | `lucide-react` (tree-shakeable, Sprint 7) | ^1.24.0 |
| Fonte               | `@fontsource-variable/inter` (self-hosted, Sprint 7) | ^5.2.8 |

Nenhuma biblioteca de datas (`date-fns`/`dayjs`) foi adicionada — cálculos de vencimento usam utilitários próprios (`src/lib/dateUtils.ts`) sobre `Date` nativo, suficiente para o volume e a complexidade atuais. Gráficos do Dashboard (`ProgressRing`, `MiniBarChart`) são SVG/CSS puro, sem biblioteca de gráficos (decisão da Sprint 7, para não agravar o tamanho do bundle).

## 3. Estrutura de Diretórios

```
atlas/
├── CLAUDE.md
├── apps/
│   └── web/
│       ├── public/
│       │   └── favicon.svg
│       ├── src/
│       │   ├── styles/
│       │   │   └── tokens.css
│       │   ├── config/
│       │   │   ├── AppConfig.ts          # env, versão, flags, providers
│       │   │   ├── FeatureFlagService.ts
│       │   │   ├── types.ts
│       │   │   └── index.ts
│       │   ├── components/
│       │   │   ├── ErrorBoundary.tsx / .css
│       │   │   ├── ui/
│       │   │   │   ├── Button.tsx / .css
│       │   │   │   ├── Card.tsx / .css
│       │   │   │   ├── Input.tsx / .css
│       │   │   │   ├── Modal.tsx / .css
│       │   │   │   ├── Badge.tsx / .css
│       │   │   │   ├── ProgressBar.tsx / .css
│       │   │   │   ├── ProgressRing.tsx / .css
│       │   │   │   ├── MiniBarChart.tsx / .css
│       │   │   │   ├── StatCard.tsx / .css
│       │   │   │   ├── AtlasLogo.tsx / .css
│       │   │   │   └── index.ts
│       │   │   ├── layout/
│       │   │   │   ├── AppShell.tsx / .css
│       │   │   │   └── BottomNavigation.tsx / .css
│       │   │   ├── home/
│       │   │   │   ├── HomeHeader.tsx / .css
│       │   │   │   ├── WealthHero.tsx / .css
│       │   │   │   ├── AtlasPulse.tsx / .css
│       │   │   │   ├── QuickActions.tsx / .css
│       │   │   │   ├── BillsTimeline.tsx / .css
│       │   │   │   ├── GoalsFocus.tsx / .css
│       │   │   │   ├── InvestmentsTeaser.tsx / .css
│       │   │   │   ├── PlanningSnapshot.tsx / .css
│       │   │   │   └── TransactionsPreview.tsx / .css
│       │   │   ├── Login.tsx
│       │   │   ├── Register.tsx
│       │   │   ├── ForgotPassword.tsx
│       │   │   ├── ResetPassword.tsx
│       │   │   ├── AuthLayout.tsx / .css
│       │   │   ├── ProtectedRoute.tsx
│       │   │   ├── TransactionModal.tsx
│       │   │   ├── TransactionsList.tsx
│       │   │   ├── FinancialSummaryCards.tsx / .css
│       │   │   ├── AtlasIntelligencePanel.tsx / .css
│       │   │   ├── UpcomingBillsPanel.tsx
│       │   │   ├── BillsList.tsx
│       │   │   ├── BillModal.tsx
│       │   │   ├── GoalsPanel.tsx
│       │   │   ├── GoalsList.tsx
│       │   │   ├── GoalModal.tsx
│       │   │   ├── AsyncStateView.tsx / .css
│       │   │   ├── Panels.css
│       │   │   ├── SeverityBadge.tsx
│       │   │   ├── PlanningPanel.tsx
│       │   │   ├── FinancialProfileModal.tsx
│       │   │   ├── FixedExpensesPanel.tsx
│       │   │   ├── FixedExpensesList.tsx
│       │   │   ├── FixedExpenseModal.tsx
│       │   │   └── onboarding/
│       │   │       ├── OnboardingWizard.tsx
│       │   │       ├── OnboardingWizard.css
│       │   │       ├── WelcomeStep.tsx
│       │   │       ├── IncomeStep.tsx
│       │   │       ├── ReserveStep.tsx
│       │   │       ├── FixedExpensesStep.tsx
│       │   │       ├── FirstGoalStep.tsx
│       │   │       └── FinishStep.tsx
│       │   ├── pages/
│       │   │   ├── HomePage.tsx / .css
│       │   │   ├── AccountsPage.tsx / .css
│       │   │   ├── ConnectBanksPage.tsx
│       │   │   ├── ConnectedAccountsPage.tsx
│       │   │   ├── InvestmentsPage.tsx / .css
│       │   │   ├── AtlasAIPage.tsx / .css
│       │   │   └── ProfilePage.tsx / .css
│       │   ├── modules/
│       │   │   ├── open-finance/
│       │   │   │       ├── types/
│       │   │   │       ├── providers/   # interface + Mock + stub Pluggy
│       │   │   │       ├── services/    # OpenFinanceService
│       │   │   │       ├── mocks/
│       │   │   │       ├── utils/
│       │   │   │       ├── hooks/
│       │   │   │       ├── components/
│       │   │   │       └── index.ts
│       │   │   └── atlas-intelligence/
│       │   │       ├── types/
│       │   │       ├── engine/         # Insight Engine
│       │   │       ├── providers/      # AtlasAIProvider + Mock + stub OpenAI
│       │   │       ├── services/
│       │   │       ├── hooks/
│       │   │       ├── prompts/
│       │   │       ├── components/     # AtlasInsights, IntelligenceFeed
│       │   │       ├── utils/
│       │   │       └── index.ts
│       │   ├── data/
│       │   │   ├── mockInvestments.ts
│       │   │   └── mockAtlasAiChat.ts
│       │   ├── contexts/
│       │   │   └── AuthContext.tsx
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useTransactions.ts
│       │   │   ├── useBills.ts
│       │   │   ├── useGoals.ts
│       │   │   ├── useFinancialSummary.ts
│       │   │   ├── useRecommendations.ts
│       │   │   ├── useFinancialProfile.ts
│       │   │   ├── useFixedExpenses.ts
│       │   │   ├── usePlanning.ts
│       │   │   └── useOnboarding.ts
│       │   ├── lib/
│       │   │   ├── supabase.ts
│       │   │   ├── authErrors.ts
│       │   │   ├── errorMessages.ts
│       │   │   ├── dateUtils.ts
│       │   │   ├── recommendationEngine.ts
│       │   │   ├── planningEngine.ts
│       │   │   ├── atlasIntelligenceCopy.ts
│       │   │   ├── atlasPulse.ts
│       │   │   ├── logging/             # logger + sinks (Sentry futuro)
│       │   │   ├── analytics/           # AnalyticsService (sem envio externo)
│       │   │   └── microinteractions/
│       │   │       ├── index.ts          # API pública
│       │   │       ├── dispatch.ts       # triggerMicrointeraction
│       │   │       ├── types.ts
│       │   │       ├── sound.ts / moneyRain.ts / glow.ts / haptic.ts
│       │   │       ├── AnimatedNumber.tsx
│       │   │       ├── effects.css
│       │   │       ├── openFinanceBridge.ts
│       │   │       └── toast/            # ToastHost + store
│       │   ├── services/
│       │   │   ├── transactionsService.ts
│       │   │   ├── billsService.ts
│       │   │   ├── goalsService.ts
│       │   │   ├── financialProfileService.ts
│       │   │   ├── fixedExpensesService.ts
│       │   │   └── onboardingService.ts
│       │   ├── types/
│       │   │   ├── auth.ts
│       │   │   ├── transaction.ts
│       │   │   ├── bill.ts
│       │   │   ├── goal.ts
│       │   │   ├── recommendation.ts
│       │   │   ├── financialProfile.ts
│       │   │   ├── fixedExpense.ts
│       │   │   ├── planning.ts
│       │   │   └── onboarding.ts
│       │   ├── validations/
│       │   │   ├── loginSchema.ts
│       │   │   ├── registerSchema.ts
│       │   │   ├── forgotPasswordSchema.ts
│       │   │   ├── resetPasswordSchema.ts
│       │   │   ├── transactionSchema.ts
│       │   │   ├── billSchema.ts
│       │   │   ├── goalSchema.ts
│       │   │   ├── financialProfileSchema.ts
│       │   │   └── fixedExpenseSchema.ts
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── index.css
│       │   └── vite-env.d.ts
│       ├── index.html
│       ├── package.json
│       ├── .env.example
│       ├── vite.config.ts
│       ├── vercel.json
│       ├── tsconfig.json
│       ├── tsconfig.app.json
│       ├── tsconfig.node.json
│       └── eslint.config.js
├── supabase/
│   └── migrations/
│       ├── 20260712210000_create_transactions_table.sql
│       ├── 20260712220000_create_bills_table.sql
│       ├── 20260712220100_create_goals_table.sql
│       ├── 20260714000000_create_financial_profiles_table.sql
│       ├── 20260714000100_create_fixed_expenses_table.sql
│       └── 20260714100000_create_onboarding_status_table.sql
├── docs/
│   ├── deploy.md
│   └── guia-deploy-fundador.md
├── packages/
└── roadmap/
    ├── arquitetura.md
    ├── backlog.md
    ├── changelog.md
    ├── design-system.md
    ├── release-v0.8.md
    ├── ux-review-1.0.md
    └── sprint-0X.md
```

## 4. Roteamento

O roteamento é gerenciado pelo `react-router-dom` v7, utilizando `BrowserRouter`. A configuração ocorre em duas camadas:

- **`main.tsx`**: envolve a aplicação com `<AuthProvider>` e `<BrowserRouter>`, definindo o contexto de autenticação e o ponto único de entrada para o roteamento.
- **`App.tsx`**: define as rotas via `<Routes>` / `<Route>`, sem qualquer lógica de navegação baseada em estado local (`useState`). Páginas autenticadas (Home, Contas, Connect, Connected, Investimentos, Atlas IA, Perfil) são carregadas com `React.lazy` + `Suspense` (Sprint 14); rotas de auth permanecem eager.

### Mapa de rotas atual

| Rota               | Componente        | Acesso     |
|--------------------|--------------------|------------|
| `/`                | Redirect → `/inicio` | Público |
| `/login`           | `Login`            | Público    |
| `/cadastro`        | `Register`         | Público    |
| `/esqueci-senha`   | `ForgotPassword`   | Público |
| `/redefinir-senha` | `ResetPassword`    | Público (sessão de recuperação) |
| `/inicio`          | `HomePage`         | Protegido (`AppShell`) |
| `/contas`          | Hub Open Finance   | Protegido |
| `/contas/conectar` | Conectar bancos    | Protegido (Sprint 10) |
| `/contas/conectadas` | Contas conectadas | Protegido (Sprint 10) |
| `/investimentos`   | `InvestmentsPage`  | Protegido |
| `/atlas-ia`        | `AtlasAIPage`      | Protegido |
| `/perfil`          | `ProfilePage`      | Protegido |
| `/dashboard`       | Redirect → `/inicio` | Compatibilidade |

### Open Finance (Sprint 10)

Fluxo obrigatório: **UI → `OpenFinanceService` → `OpenFinanceProvider`**. Implementações: `MockOpenFinanceProvider` (ativo) e `PluggyOpenFinanceProvider` (stub). Nenhuma tela chama Pluggy diretamente.

## 5. Autenticação

A autenticação é real, via **Supabase Auth**:

- `Login.tsx` chama `supabase.auth.signInWithPassword`.
- `Register.tsx` chama `supabase.auth.signUp`, armazenando o nome informado em `user_metadata`.
- A sessão é gerenciada globalmente por `AuthContext`/`useAuth` (`src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts`), que escuta `supabase.auth.onAuthStateChange` e expõe `user`, `session`, `loading` e `signOut`.
- `ProtectedRoute.tsx` consome `useAuth()` e redireciona para `/login` quando não há sessão ativa (após o carregamento inicial ser resolvido).
- Logout real disponível no `Dashboard.tsx` (botão "Sair"), via `signOut()`, com `try/finally` garantindo o redirecionamento mesmo se a chamada falhar.
- Não há mais nenhum uso de `localStorage` para controle de autenticação — a persistência de sessão entre recarregamentos é feita pelo próprio SDK do Supabase (comportamento padrão da biblioteca).
- Erros de autenticação são traduzidos para mensagens amigáveis via `src/lib/authErrors.ts`.
- **Recuperação de senha (Sprint 6)**: `ForgotPassword.tsx` chama `supabase.auth.resetPasswordForEmail(email, { redirectTo })`, sempre exibindo a mesma mensagem de sucesso (evita revelar quais e-mails estão cadastrados). `ResetPassword.tsx` aguarda o evento `PASSWORD_RECOVERY` de `onAuthStateChange` (com fallback via `getSession()` e timeout de 4s para tratar link inválido/expirado) antes de permitir `supabase.auth.updateUser({ password })`. Exige configurar a "Redirect URL" correspondente no projeto Supabase (ver `docs/deploy.md`).
- **Confirmação de e-mail (Sprint 6)**: `Register.tsx` verifica se `signUp` retornou uma sessão imediata; se não (confirmação exigida pelo projeto), mostra uma tela dedicada com o e-mail cadastrado e permite reenviar a confirmação (`supabase.auth.resend`). `Login.tsx` oferece o mesmo reenvio quando o erro de login é especificamente "e-mail não confirmado" (`MENSAGEM_EMAIL_NAO_CONFIRMADO`, exportada por `authErrors.ts`).

## 6. Componentes Principais

### 6.1 Design System (`src/components/ui/`, Sprint 7)

Biblioteca de componentes reutilizáveis que sustenta toda a UI a partir da Sprint 7 — documentação completa (API, exemplos) em `roadmap/design-system.md`:

- **`Button`**, **`Card`**, **`Input`**, **`Modal`**, **`Badge`**, **`ProgressBar`**, **`ProgressRing`**, **`MiniBarChart`**, **`StatCard`**, **`AtlasLogo`**.
- Todas as classes CSS usam o prefixo `atlas-`. `Input` é compatível com `register()` do `react-hook-form` (encaminha `ref` via `forwardRef`).

### 6.2 Shell e páginas (Sprint 8)

- **`AppShell.tsx`**: layout autenticado com Bottom Navigation + `<Outlet />`; decide onboarding vs. app.
- **`BottomNavigation.tsx`**: abas Início / Contas / Investimentos / Atlas IA / Perfil.
- **`HomePage.tsx`**: Home premium mobile-first (Sprint 9); orquestra hooks financeiros e componentes de `src/components/home/` (Hero, Pulse, Quick Actions, Timeline, Metas, Investimentos, Planejamento, Recentes).
- **`src/components/home/`** (Sprint 9): `HomeHeader`, `WealthHero`, `AtlasPulse`, `QuickActions`, `BillsTimeline`, `GoalsFocus`, `InvestmentsTeaser`, `PlanningSnapshot` (inclui despesas fixas expansíveis), `TransactionsPreview`.
- **`src/lib/atlasPulse.ts`** (Sprint 9): escolhe uma mensagem inteligente para o Pulse (heurística local; futuro: IA).
- **`AccountsPage.tsx`**, **`InvestmentsPage.tsx`**, **`AtlasAIPage.tsx`**, **`ProfilePage.tsx`**: abas preparatórias (mocks em `src/data/`).

### 6.3 Componentes de domínio

- **`AuthLayout.tsx`** (Sprint 7): shell compartilhado por `Login`/`Register`/`ForgotPassword`/`ResetPassword` (logo, título, subtítulo, formulário, rodapé).
- **`Login.tsx`** / **`Register.tsx`**: formulários de autenticação (`react-hook-form` + `zod`); tratam também os estados de e-mail não confirmado e cadastro pendente de confirmação (Sprint 6); migrados para `AuthLayout`/`Input`/`Button` na Sprint 7. Após sucesso, navegam para `/inicio`.
- **`ForgotPassword.tsx`** / **`ResetPassword.tsx`** (Sprint 6): fluxo de recuperação de senha via Supabase Auth.
- **`onboarding/OnboardingWizard.tsx`** (+ `WelcomeStep`, `IncomeStep`, `ReserveStep`, `FixedExpensesStep`, `FirstGoalStep`, `FinishStep`) (Sprint 6, Design System na Sprint 7): wizard de primeiro acesso, renderizado pelo `AppShell` enquanto o onboarding não é concluído.
- **`AtlasIntelligencePanel.tsx`** (Sprint 7; antes `RecommendationsPanel.tsx`): exibe as recomendações geradas por `useRecommendations`, cada uma com severidade (`SeverityBadge`) e mensagem, precedidas por uma saudação + resumo conversacional gerado por `src/lib/atlasIntelligenceCopy.ts`.
- **`FinancialSummaryCards.tsx`**: `StatCard`s + `MiniBarChart` (ainda disponível; a Home Sprint 8 usa `StatCard`/`MiniBarChart` diretamente na nova hierarquia).
- **`PlanningPanel.tsx`** (+ `FinancialProfileModal.tsx`): planejamento financeiro do mês (Sprint 5), com `ProgressRing` (Sprint 7).
- **`FixedExpensesPanel.tsx`** (+ `FixedExpensesList.tsx`, `FixedExpenseModal.tsx`): despesas fixas recorrentes.
- **`UpcomingBillsPanel.tsx`** (+ `BillsList.tsx`, `BillModal.tsx`): contas a pagar/receber vencidas ou vencendo em breve.
- **`GoalsPanel.tsx`** (+ `GoalsList.tsx`, `GoalModal.tsx`): metas financeiras com barra de progresso e aporte inline.
- **`TransactionsList.tsx`**: lista de movimentações recentes.
- **`TransactionModal.tsx`** / **`BillModal.tsx`** / **`GoalModal.tsx`** / **`FinancialProfileModal.tsx`** / **`FixedExpenseModal.tsx`**: modais sobre o `Modal` do Design System.
- **`Panels.css`** (Sprint 7): estilos compartilhados de painéis e listas.
- **`AsyncStateView.tsx`**: padrão loading/erro/vazio/conteúdo.
- **`SeverityBadge.tsx`**: wrapper sobre `Badge`.
- **`ProtectedRoute.tsx`**: guarda de rota via `useAuth`.
- **`src/lib/microinteractions/`** (Sprint 8 contrato; Sprint 11 implementação): `triggerMicrointeraction`, toasts, money rain, som sintético, `AnimatedNumber`, glow/sync.
## 7. Persistência de Dados Financeiros

- **Tabela `transactions`**: `id`, `user_id`, `type` (`receita`/`despesa`), `description`, `amount`, `created_at`.
- **Tabela `bills`** (Sprint 4): `id`, `user_id`, `type` (`a_pagar`/`a_receber`), `description`, `amount`, `due_date`, `status` (`pendente`/`pago`), `paid_at`, `created_at`.
- **Tabela `goals`** (Sprint 4): `id`, `user_id`, `title`, `target_amount`, `current_amount`, `target_date`, `created_at`. Progresso (%) e "concluída" são derivados no front-end (`current_amount / target_amount`), não armazenados.
- **Tabela `financial_profiles`** (Sprint 5): `user_id` (chave primária, 1:1 com `auth.users`), `monthly_income`, `minimum_reserve`, `updated_at`. Salva via `upsert` (sem distinguir criação de atualização).
- **Tabela `fixed_expenses`** (Sprint 5): `id`, `user_id`, `description`, `amount`, `created_at`. Sem coluna de vencimento — despesa mensal recorrente por definição; o valor total é sempre considerado "a ocorrer" no cálculo do mês.
- **Tabela `onboarding_status`** (Sprint 6): `user_id` (chave primária, 1:1 com `auth.users`), `current_step` (1 a 6), `completed_at` (nulo até a conclusão), `updated_at`. Salva via `upsert`, mesmo padrão de `financial_profiles`.
- **Segurança**: Row Level Security habilitada em todas as seis tabelas; cada usuário só acessa suas próprias linhas (`auth.uid() = user_id`). Migrações versionadas em `supabase/migrations/`. Operações de update/delete também filtram explicitamente por `user_id` na query (defesa em profundidade além do RLS, adotada na revisão da Sprint 4).
- **Camadas de serviço**: `transactionsService.ts`, `billsService.ts`, `goalsService.ts`, `financialProfileService.ts`, `fixedExpensesService.ts`, `onboardingService.ts` — cada uma isola todo o acesso direto ao client do Supabase para seu domínio (`list*`, `create*`, `delete*`, além de `markBillAsPaid`/`updateGoalProgress`/`getProfile`/`upsertProfile`/`getStatus`/`upsertStatus`). Todas usam o helper único `getSupabaseClient()` (`lib/supabase.ts`).
- **Sem dados mockados**: nenhuma movimentação, conta, meta, perfil ou despesa fixa é simulada; tudo é lido/escrito no Supabase.
- **Limitações atuais**: edição (update) de movimentações e despesas fixas ainda não implementada na UI; contas pagas não geram automaticamente uma movimentação; metas não têm histórico individual de aportes (só o valor acumulado).

## 8. Inteligência do Dashboard (Sprint 4)

- **`useFinancialSummary.ts`**: compõe os retornos já obtidos de `useTransactions` e `useBills` (recebidos como parâmetros, não rechamados) para derivar `quantoPossoGastar = saldo - totalPendenteAPagar`.
- **`useRecommendations.ts`**: compõe `useFinancialSummary` + `useBills` + `useGoals` num `DashboardSnapshot` e delega a geração das recomendações a um `RecommendationProvider`.
- **`src/lib/recommendationEngine.ts`**: motor de regras síncrono e sem I/O (`gerarRecomendacoes`), cobrindo saldo negativo, contas vencidas/vencendo em breve, gastos do mês acima da renda do mês e metas quase concluídas/concluídas. Sempre retorna ao menos uma recomendação (fallback "tudo certo" ou "sem dados suficientes").
- **Estratégia de IA futura**: `RecommendationProvider = (snapshot) => Promise<Recommendation[]>` é o contrato estável consumido por `useRecommendations`. Hoje `ruleBasedRecommendationProvider` só empacota o motor síncrono numa Promise; uma futura `aiRecommendationProvider` (Supabase Edge Function, mantendo a chave de IA no servidor) pode substituí-la sem qualquer mudança nos componentes de UI.
- **Degradação de erros**: se `useBills` ou `useGoals` estiverem em estado de erro, `useRecommendations` exclui essa fonte do snapshot em vez de falhar por completo — as recomendações continuam sendo geradas com as fontes disponíveis.

## 9. Planejamento Financeiro (Sprint 5)

- **`useFinancialProfile.ts`**: busca o perfil do usuário (renda mensal + reserva mínima); `profile` pode ser `null` quando ainda não configurado — tratado como estado vazio, não como erro. `salvar()` faz o `upsert` via `financialProfileService.ts`.
- **`useFixedExpenses.ts`**: lista as despesas fixas recorrentes do usuário e deriva `totalDespesasFixas` (soma), com o mesmo padrão `error`/`actionError` dos demais hooks de domínio.
- **`usePlanning.ts`**: compõe `useFinancialProfile` + `useFixedExpenses` + fatias de `useFinancialSummary`/`useBills`/`useGoals` num `PlanningSnapshot` e delega ao `PlanningProvider`. Mantém um `hojeISO` em estado, atualizado a cada 5 minutos via `setInterval`, para que "dias restantes no mês" não fique parado enquanto a aba fica aberta sem nenhum dado mudar.
- **`src/lib/planningEngine.ts`**: motor de regras síncrono e sem I/O (`calcularPlanejamento`), que deriva:
  - **Saldo previsto até o fim do mês** = saldo atual + renda ainda a receber no mês − despesas fixas − contas a pagar pendentes.
  - **Quanto pode gastar hoje** = max(0, saldo previsto − reserva mínima) ÷ dias restantes no mês.
  - **Quanto precisa guardar este mês** = reserva faltante (se a reserva mínima ainda não foi atingida) + aporte mensal necessário para as metas com prazo (`targetDate`) definido.
  - **Risco financeiro** (`baixo`/`medio`/`alto`): comparação do saldo previsto com a reserva mínima (abaixo de 50% da reserva ou negativo = `alto`; entre 50% e 100% = `medio`; igual ou acima = `baixo`).
- **Estratégia de IA futura**: `PlanningProvider = (snapshot) => Promise<PlanningResult>` é o contrato estável consumido por `usePlanning` — mesmo espírito do `RecommendationProvider`. Hoje `ruleBasedPlanningProvider` só empacota o motor síncrono numa Promise; uma futura `aiPlanningProvider` (Supabase Edge Function usando o histórico real de transações para prever gastos variáveis) pode substituí-la sem qualquer mudança na UI.
- **Integração com recomendações**: `DashboardSnapshot` (recommendationEngine.ts) ganhou o campo opcional `risco`; quando `usePlanning` calcula risco `alto`, uma recomendação crítica adicional é gerada. Essa integração não bloqueia a geração das demais recomendações enquanto o planejamento ainda carrega — o snapshot memoizado é recalculado automaticamente quando o resultado do planejamento chega.

## 9.1 Onboarding Guiado (Sprint 6)

- **`useOnboarding.ts`**: busca o progresso do usuário (`onboarding_status`); se não existir nenhum registro **e** o usuário já tiver um perfil financeiro configurado (usuário anterior à Sprint 6), grava automaticamente um status "concluído" (backfill) em vez de exibir o wizard do zero. Expõe `passoAtual`, `completo`, `avancarPara(step)` e `concluir()`.
- **`components/onboarding/OnboardingWizard.tsx`**: renderizado por `Dashboard.tsx` no lugar do conteúdo normal enquanto `!onboarding.completo`. Recebe os hooks `useFinancialProfile`/`useFixedExpenses`/`useGoals` já carregados pelo `Dashboard.tsx` (sem refetch) e orquestra 6 passos (`WelcomeStep` → `IncomeStep` → `ReserveStep` → `FixedExpensesStep` → `FirstGoalStep` → `FinishStep`).
- Renda mensal e reserva mínima ficam em estado local do wizard (`rendaMensal`/`reservaMinima`) durante os passos 2 e 3, e só são persistidas em `financial_profiles` numa única chamada a `perfil.salvar(...)` ao confirmar o passo 3 — evita gravar um perfil parcial/inválido.
- O passo atual é persistido a cada avanço (`onboarding.avancarPara`), permitindo retomar exatamente de onde o usuário parou numa sessão futura. O botão "Pular por agora" é um estado **local** do `Dashboard.tsx` (não persistido): o onboarding volta a aparecer no próximo acesso até ser efetivamente concluído.
- `Dashboard.tsx` exibe um estado de carregamento explícito enquanto `onboarding.loading` (que também espera `useFinancialProfile` resolver) — evita mostrar o Dashboard completo "piscando" por trás do wizard.

## 10. Estado da Aplicação

O estado de autenticação é gerenciado globalmente via `AuthContext`/`useAuth`. Cada domínio financeiro tem seu próprio hook dedicado (`useTransactions`, `useBills`, `useGoals`, `useFinancialProfile`, `useFixedExpenses`), todos seguindo o mesmo padrão: `loading`/`error` (falha ao carregar a lista) separado de `actionError` (falha numa ação como remover/pagar/aportar), evitando que uma falha de ação esconda dados já carregados.

`Dashboard.tsx` é o único ponto que chama os cinco hooks de domínio (mais `useOnboarding`, que depende do resultado de `useFinancialProfile`); os hooks agregadores (`useFinancialSummary`, `useRecommendations`, `usePlanning`) recebem os dados já carregados como parâmetros, e cada widget (`RecommendationsPanel`, `FinancialSummaryCards`, `PlanningPanel`, `UpcomingBillsPanel`, `GoalsPanel`, `FixedExpensesPanel`, `TransactionsList`) renderiza seu próprio estado de carregamento/erro/vazio — a falha ou lentidão de uma fonte não trava nem esconde as demais seções. A única exceção deliberada é o "gate" do onboarding (seção 9.1): antes de decidir entre wizard e Dashboard completo, um carregamento bloqueante é exibido, para evitar uma alternância visual entre os dois.

Não há, ainda, um gerenciador de estado global genérico (Redux, Zustand) — a combinação de Context API (auth) + hooks dedicados por domínio tem sido suficiente até este estágio do projeto, embora repassar os hooks como props a partir do Dashboard já sinalize que uma camada de cache/contexto (React Query, etc.) passa a valer a pena se mais widgets independentes compartilharem os mesmos dados.

## 11. Build e Qualidade

- **Build**: `tsc -b && vite build` — checagem de tipos seguida de build de produção via Vite.
- **Lint**: ESLint com regras recomendadas de TypeScript, React Hooks (incluindo `set-state-in-effect`) e React Refresh (`eslint.config.js`).
- **Dev server**: `vite` com HMR (Hot Module Replacement).

## 11.1 Observability & Quality Foundation (Sprint 16)

Camada transversal — **não altera UX, regras de negócio, auth, schema nem adapters reais**.

### Error Boundary
- `ErrorBoundary` envolve `<App />` em `main.tsx` (dentro de `BrowserRouter`).
- Exceções de render não tratadas mostram fallback elegante (DS) com “Voltar para a Home” (`/inicio`) e “Tentar novamente”.
- `componentDidCatch` registra via `logger.error` (preparado para sink Sentry).

### Logging (`src/lib/logging`)
- API: `logger.debug` / `info` / `warning` / `error`.
- Development: nível mínimo `debug` (console detalhado).
- Production: nível mínimo `info` + `FutureErrorReporterSink` no-op (ponto de encaixe para Sentry).
- O logger nunca propaga falha de sink para a UI.

### Feature Flags (`src/config/FeatureFlagService`)
- Flags: `openai`, `openFinance`, `investments`, `notifications`.
- Defaults = comportamento atual da RC; overrides opcionais `VITE_FF_*` (ver `.env.example`).
- Telas **não** consultam flags diretamente — serviços podem expor `isModuleEnabled()` / `isOpenAiEnabled()`.
- Desligar uma flag **não** remove UI nesta sprint (evita mudar UX); a API existe para gate futuro seguro.

### Analytics (`src/lib/analytics`)
- `analytics.track(name, properties?)` com eventos tipados (`login`, `sign_up`, `onboarding_completed`, `home_opened`, `connect_bank_clicked`, `atlas_ai_opened`).
- Sink padrão no-op (nenhum dado externo); buffer em memória + `logger.debug` em dev.
- Call sites mínimos nos fluxos existentes — sem mudança visual.

### AppConfig (`src/config/AppConfig.ts`)
- Centraliza: `env`, `version`, `featureFlags`, `providers` (`openFinance`: mock|pluggy, `atlasAi`: mock|openai).
- Providers reais ainda não entram em runtime: stubs continuam mock para preservar UX até Missões de integração.

## 12. Limitações Conhecidas da Arquitetura Atual

- Edição (update) de movimentações financeiras e despesas fixas ainda não implementada na UI.
- Não há categorização de receitas/despesas nem orçamento mensal por categoria.
- Contas pagas (`bills`) não geram automaticamente uma movimentação (`transactions`) — domínios desacoplados por decisão de escopo.
- Metas não têm histórico individual de aportes, apenas o valor acumulado (`current_amount`).
- Metas sem `targetDate` não entram no cálculo de "quanto precisa guardar" do planejamento financeiro (sem ritmo mensal calculável).
- Despesas fixas não têm "dia de vencimento" — o valor total é sempre considerado "a ocorrer" no mês, sem distinguir o que já foi pago.
- Recomendações e planejamento financeiro são gerados por regras fixas (heurísticas); não há IA real integrada ainda em nenhum dos dois (contratos `RecommendationProvider`/`PlanningProvider` prontos, implementação pendente).
- Não há testes automatizados (unitários, integração ou E2E) — o checklist de deploy (`docs/deploy.md`) depende de verificação manual.
- Monitoramento de erros em produção: fundação pronta (Error Boundary + logger + sink futuro); integração Sentry ainda não ligada.
- Não há paginação nas listagens (transações, contas, metas, despesas fixas) — toda a lista é carregada de uma vez; aceitável para o volume inicial de um Alpha privado, mas deve ser revisitado com o crescimento do histórico.
- Não há gerenciamento de estado global genérico nem camada de cache/dados (React Query, etc.).
- Design System (Sprint 7) é 100% tema escuro — não há alternância clara/escura nem auditoria formal de contraste WCAG AA com a nova paleta.
- Não há tabela de perfis (`profiles`) própria — dados adicionais de usuário (como nome) ficam apenas em `user_metadata` do Supabase Auth.
- Não há um link direto para revisitar o wizard de onboarding após concluído (os mesmos dados podem ser editados pelos painéis normais do Dashboard).

## 13. Próximos Passos Arquiteturais

Ver `backlog.md` para o roadmap de evolução (IA real nas recomendações e no planejamento financeiro, histórico de aportes, edição de movimentações/despesas fixas, categorização, testes automatizados, monitoramento de erros, paginação, design system, deploy automatizado). O checklist de deploy manual para o primeiro Alpha privado está em `docs/deploy.md`.

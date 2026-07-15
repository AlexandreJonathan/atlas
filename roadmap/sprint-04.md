# Sprint 04 — Dashboard Inteligente

## Status: ✅ Concluída

## 1. Objetivo

Transformar o Dashboard na central de inteligência financeira do Atlas, respondendo imediatamente a cinco perguntas do usuário:

1. Como está minha situação financeira hoje?
2. Quanto posso gastar?
3. Quais contas vencem em breve?
4. Como estão minhas metas?
5. O que o Atlas recomenda fazer agora?

> **Nota de reagendamento**: esta sprint originalmente tratava de "Qualidade: Testes Automatizados e CI". Esse escopo foi reagendado para uma sprint futura (ver `roadmap/backlog.md`, seção 4) e o número da Sprint 4 foi redirecionado para o "Dashboard Inteligente", conforme solicitado.

## 2. Escopo Implementado

- **Novo modelo de dados**: tabelas `bills` (contas a pagar/receber) e `goals` (metas financeiras) no Supabase, com Row Level Security por usuário (`supabase/migrations/20260712220000_create_bills_table.sql` e `20260712220100_create_goals_table.sql`).
- **Camadas de serviço**: `src/services/billsService.ts` e `src/services/goalsService.ts`, seguindo o mesmo padrão de `transactionsService.ts`.
- **Hooks de domínio**: `useBills` (contas pendentes/vencidas/vencendo em breve) e `useGoals` (metas e aportes), com o mesmo padrão de `error`/`actionError` de `useTransactions`.
- **Hooks agregadores**: `useFinancialSummary` (compõe transações + contas em "quanto posso gastar") e `useRecommendations` (compõe os três domínios num `DashboardSnapshot` e aciona o motor de regras).
- **Motor de recomendações**: `src/lib/recommendationEngine.ts`, síncrono e sem I/O, com o contrato `RecommendationProvider` já pensado para uma futura implementação com IA real.
- **Novos componentes**: `RecommendationsPanel`, `FinancialSummaryCards`, `UpcomingBillsPanel` (+ `BillsList`, `BillModal`), `GoalsPanel` (+ `GoalsList`, `GoalModal`), e os reutilizáveis `AsyncStateView`, `ProgressBar` e `SeverityBadge`.
- **`Dashboard.tsx`** refatorado para ser só o orquestrador/layout — cada widget renderiza seu próprio loading/erro/vazio de forma independente.
- **`TransactionsList.tsx`** refatorado para reutilizar `AsyncStateView`, eliminando a duplicação que surgiria com `BillsList`/`GoalsList`.

## 3. Critérios de Aceite

- [x] O Dashboard exibe a situação financeira atual (saldo, receitas, despesas) e "quanto posso gastar" (saldo menos contas a pagar pendentes).
- [x] O Dashboard lista contas a vencer (vencidas e vencendo nos próximos 7 dias), com ação para marcar como paga.
- [x] O Dashboard lista metas financeiras com progresso visual e permite registrar aportes.
- [x] O Dashboard exibe recomendações geradas a partir de regras reais sobre os dados do usuário (não é um placeholder estático).
- [x] Cada seção do Dashboard tem estados de carregamento, erro (com nova tentativa) e vazio independentes — a falha de uma fonte não esconde as demais.
- [x] Nenhum dado mockado; todas as novas entidades (`bills`, `goals`) são persistidas no Supabase com Row Level Security.
- [x] A arquitetura do motor de recomendações permite substituição futura por IA real sem alterar a UI (`RecommendationProvider`).
- [x] `npm run lint` e `npm run build` executam sem erros.
- [x] Não há regressão nas funcionalidades de autenticação, roteamento e movimentações financeiras das sprints anteriores.

## 4. Como Aplicar as Migrações

As migrações SQL (`20260712220000_create_bills_table.sql` e `20260712220100_create_goals_table.sql`) precisam ser aplicadas manualmente pelo responsável pelo projeto Supabase, seguindo o mesmo processo da Sprint 3:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor.
2. Cole o conteúdo de cada arquivo de migração (na ordem: `bills`, depois `goals`) e execute.
3. Alternativamente, com o Supabase CLI configurado e o projeto linkado: `supabase db push`.

## 5. Revisão Técnica Pós-Implementação

Após a implementação inicial, foi realizada uma revisão técnica completa do código desta sprint (bugs, duplicação, arquitetura, RLS, segredos, acessibilidade, performance, tipagem e aderência ao padrão das sprints anteriores). Detalhe completo em `roadmap/changelog.md`, seção "[Sprint 4 — Auto Code Review]". Resumo:

- **Segurança (RLS)**: confirmado que as tabelas `bills` e `goals` têm Row Level Security habilitado com políticas para todas as operações (`select`/`insert`/`update`/`delete`), restritas a `auth.uid() = user_id` — igual ao padrão de `transactions`. Como reforço (defesa em profundidade), as operações de update/delete dos três domínios passaram a filtrar explicitamente por `user_id` na própria query, além de já serem protegidas pelo RLS.
- **Segredos**: nenhuma credencial exposta no código novo; confirmado que `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` só existem via `.env` (não versionado).
- **Duplicação**: extraído `getSupabaseClient()` para `lib/supabase.ts`, eliminando a repetição da mesma função em `billsService.ts`, `goalsService.ts` e `transactionsService.ts`.
- **Bug/UX**: corrigido o aporte inline em `GoalsList` — faltava feedback de carregamento (risco de duplo clique/corrida) e validação visível (schema `goalContributionSchema` existia mas nunca era usado).
- `npm run lint` e `npm run build` reexecutados com sucesso após as correções.

## 6. Itens Adiados

- **IA real** nas recomendações — apenas o contrato/estratégia (`RecommendationProvider`) foi implementado; a implementação com um modelo real (via Supabase Edge Function) fica para uma sprint futura.
- **Histórico de aportes de metas** (`goal_contributions`) — hoje só o valor acumulado (`current_amount`) é armazenado, sem trilha de auditoria por aporte individual.
- **Conversão automática de conta paga em movimentação** — os domínios `bills` e `transactions` permanecem desacoplados por ora.
- **Testes automatizados e CI** — conteúdo original desta sprint, reagendado (ver seção 1).

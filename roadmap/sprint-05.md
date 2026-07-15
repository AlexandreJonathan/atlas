# Sprint 05 — Planejamento Financeiro Inteligente

## Status: ✅ Concluída

## 1. Objetivo

Permitir que o usuário configure renda mensal, despesas fixas recorrentes e reserva mínima, e receba automaticamente:

1. Quanto pode gastar hoje.
2. Quanto precisa guardar este mês.
3. Saldo previsto até o fim do mês.
4. Risco financeiro (baixo, médio, alto).

> **Nota de reagendamento**: esta sprint originalmente cobria "Experiência do Usuário, Responsividade e Deploy". Esse escopo foi reagendado para uma sprint futura (ver `roadmap/backlog.md`, seção 6) e o número da Sprint 5 foi redirecionado para o "Planejamento Financeiro Inteligente", conforme solicitado — mesmo precedente da Sprint 4.

## 2. Escopo Implementado

- **Novo modelo de dados**: tabela `financial_profiles` (renda mensal + reserva mínima, uma linha por usuário) e `fixed_expenses` (despesas fixas recorrentes), ambas no Supabase com Row Level Security (`supabase/migrations/20260714000000_create_financial_profiles_table.sql` e `20260714000100_create_fixed_expenses_table.sql`).
- **Camadas de serviço**: `src/services/financialProfileService.ts` (busca + `upsert`) e `src/services/fixedExpensesService.ts`, seguindo o mesmo padrão de `billsService.ts`/`goalsService.ts` (incluindo o filtro explícito por `user_id` em updates/deletes, adotado na revisão da Sprint 4).
- **Hooks de domínio**: `useFinancialProfile` (perfil, pode ser `null` se não configurado — não é erro) e `useFixedExpenses` (lista + `totalDespesasFixas` derivado).
- **Hook agregador `usePlanning`**: compõe perfil + despesas fixas + `useFinancialSummary` + `useBills` + `useGoals` num `PlanningSnapshot` e delega ao motor de regras. Mantém "hoje" atualizado a cada 5 minutos (`setInterval`) para que "dias restantes no mês" não fique parado enquanto a aba ficar aberta.
- **Motor de planejamento**: `src/lib/planningEngine.ts` (`calcularPlanejamento`), síncrono e sem I/O, com o contrato `PlanningProvider` já pensado para uma futura implementação com IA real — mesmo espírito de `recommendationEngine.ts`.
- **Novos utilitários de data**: `getDiasRestantesNoMes` e `getMesesRestantes` em `src/lib/dateUtils.ts`.
- **Novos componentes**: `PlanningPanel` (cards de "posso gastar hoje" / "preciso guardar" / "saldo previsto" + selo de risco, com estado "não configurado" chamando para ação), `FinancialProfileModal` (formulário de renda/reserva, pré-preenchido em edições), `FixedExpensesPanel` (+ `FixedExpensesList`, `FixedExpenseModal`).
- **Integração com recomendações**: `recommendationEngine.ts`/`DashboardSnapshot` ganhou o campo opcional `risco`; quando o risco calculado é "alto", uma recomendação crítica adicional é gerada.
- **`Dashboard.tsx`** atualizado para buscar `useFinancialProfile`/`useFixedExpenses` uma única vez e renderizar `PlanningPanel` e `FixedExpensesPanel`, mantendo o padrão de cada widget cuidar do seu próprio loading/erro/vazio.

## 3. Fórmulas do Motor de Planejamento

- **Saldo previsto até o fim do mês** = saldo atual + renda ainda a receber no mês − despesas fixas − contas a pagar pendentes.
- **Quanto pode gastar hoje** = max(0, saldo previsto − reserva mínima) ÷ dias restantes no mês.
- **Quanto precisa guardar este mês** = (reserva mínima − saldo, se positivo) + soma do aporte mensal necessário para as metas com prazo definido.
- **Risco financeiro**: `alto` se o saldo previsto for negativo ou menor que 50% da reserva mínima; `médio` se estiver entre 50% e 100% da reserva; `baixo` caso atinja ou supere a reserva mínima.

## 4. Critérios de Aceite

- [x] O usuário pode configurar renda mensal e reserva mínima (`FinancialProfileModal`).
- [x] O usuário pode cadastrar e remover despesas fixas recorrentes (`FixedExpensesPanel`).
- [x] O Dashboard calcula e exibe automaticamente quanto pode gastar hoje, quanto precisa guardar, saldo previsto até o fim do mês e risco financeiro.
- [x] O cálculo é recalculado automaticamente sempre que perfil, despesas fixas, contas, metas ou transações mudam, sem requisições duplicadas.
- [x] Enquanto o perfil não é configurado, o painel mostra uma chamada para ação em vez de números incorretos ou erro.
- [x] Todas as novas tabelas (`financial_profiles`, `fixed_expenses`) têm Row Level Security habilitado.
- [x] A arquitetura do motor de planejamento permite substituição futura por IA real sem alterar a UI (`PlanningProvider`).
- [x] `npm run lint` e `npm run build` executam sem erros.
- [x] Não há regressão nas funcionalidades das sprints anteriores.

## 5. Como Aplicar as Migrações

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor.
2. Cole o conteúdo de cada arquivo de migração (na ordem: `financial_profiles`, depois `fixed_expenses`) e execute.
3. Alternativamente, com o Supabase CLI configurado e o projeto linkado: `supabase db push`.

## 6. Itens Adiados

- **IA real** no planejamento — apenas o contrato/estratégia (`PlanningProvider`) foi implementado; a implementação com um modelo real (via Supabase Edge Function usando o histórico de transações) fica para uma sprint futura.
- **Edição de despesas fixas** — hoje só criar/remover (mesma limitação aceita para `bills`/`goals`).
- **Dia de vencimento nas despesas fixas** — decisão de simplicidade; o valor total é sempre considerado "a ocorrer" no mês.
- **Metas sem prazo (`targetDate`)** não entram no cálculo de "quanto precisa guardar" (sem ritmo mensal calculável).
- **Experiência do Usuário, Responsividade e Deploy** — conteúdo original desta sprint, reagendado (ver seção 1 e `roadmap/backlog.md`).

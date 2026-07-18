# Budget Planner — Atlas v1.0 (Módulo 2)

**Status:** Implementado  
**Rota:** `/orcamento`  
**Flag:** `VITE_FF_BUDGET_PLANNER` (default `true`)  
**Versão:** `1.0.1`

## Visão

Orçamento mensal por categoria: limites, gasto derivado das despesas, restante, percentual e alertas.  
Recomendações automáticas da Atlas IA ficam para **v1.1** (hooks em `intelligence/hooks.ts`).

## Arquitetura

```
UI (BudgetPlannerPage / BudgetSummaryCard)
        ↓
useBudgetPlanner  ←── transactions (FDL)
        ↓
BudgetPlannerService
        ↓
budgetsService (Supabase Repository)
        ↓
public.budgets + public.budget_categories
```

Gasto **não é persistido** — é recalculado a partir de `transactions` (tipo `despesa` + `category` + mês).

Integração Smart Goals: ponte de capacidade residual (`budgetCapacityForGoals`) + link na tela; serialização conjunta preparada para a IA.

## Schema

### `public.transactions`
- Coluna `category` (nullable; check nas categorias de despesa)

### `public.budgets`
| Campo | Notas |
|---|---|
| `year` / `month` | Período (unique por usuário) |
| `status` | active \| archived |
| `notes` | Opcional |
| `updated_at` | Trigger |

### `public.budget_categories`
| Campo | Notas |
|---|---|
| `category` | housing, food, transport, … |
| `limit_amount` | Teto mensal |
| unique `(budget_id, category)` |

Migração: `supabase/migrations/20260718020000_budget_planner.sql`

## UI

- `/orcamento` — resumo mensal, lista de categorias, Novo limite, empty/loading/error
- Home — `BudgetSummaryCard` (categorias, limite, gasto, restante, alertas)
- `TransactionModal` — categoria obrigatória em despesas

## Alertas

| Nível | Regra |
|---|---|
| ok | uso &lt; 80% |
| warning | ≥ 80% e &lt; 100% |
| exceeded | ≥ 100% |

## Analytics

`budget_planner_opened`, `budget_month_ensured`, `budget_category_limit_set`, `budget_category_limit_removed`

## Testes

`modules/budget-planner/utils/budgetMath.test.ts`

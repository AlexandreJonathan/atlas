# Financial Planner — Atlas v1.0 (Módulo 3)

**Status:** Implementado  
**Rota:** `/planejamento`  
**Flag:** `VITE_FF_FINANCIAL_PLANNER` (default `true`)  
**Versão:** `1.0.2`

## Visão

Transforma dados financeiros em um **plano de ação**: sobra mensal, capacidade de aporte/investimento, previsão de metas e evolução projetada.  
Recomendações automáticas da Atlas IA ficam para **v1.1** (`intelligence/hooks.ts`).

## Arquitetura

```
UI (FinancialPlannerPage / SummaryCard)
        ↓
useFinancialPlanner
        ↓
FinancialPlannerService
        ↓
FinancialPlannerRepository (compõe PlanningSnapshot)
        ↓
calcularPlanejamento (planningEngine)  ←── não duplicado
        + Budget (budgetCapacityForGoals)
        + Smart Goals (goals da FDL)
```

`FinancialPlan` e `MonthlyProjection` são **entidades de domínio derivadas** — sem tabela própria na v1.0. Persistência de preferências do plano (horizonte, cenários) fica para v1.1.

## Entidades

### FinancialPlan
Renda, despesas, sobra, capacidade de aporte, capacidade de investimento, saldo projetado, ritmo de poupança (`quantoPrecisaGuardar`), risco, previsões de metas, projeções mensais.

### MonthlyProjection
Saldo/renda/despesas/sobra/aporte projetados por mês (horizonte default: 6).

## Integrações

| Fonte | Uso |
|---|---|
| FDL | perfil, saldo, receitas/despesas do mês, fixas, contas, metas |
| `planningEngine` | saldo previsto, gastar/dia, guardar/mês, risco |
| Budget Planner | limita capacidade de aporte ao restante do orçamento |
| Smart Goals | previsões on-track / fora do ritmo |

## UI

- `/planejamento` — resumo, metas, evolução (MiniBarChart), empty/loading/error
- Home — `FinancialPlannerSummaryCard`

## Analytics

`financial_planner_opened`

## Testes

`modules/financial-planner/utils/planMath.test.ts`

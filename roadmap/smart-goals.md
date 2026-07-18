# Smart Goals — Atlas v1.0 (Módulo 1)

**Status:** Implementado  
**Rota:** `/metas`  
**Flag:** `VITE_FF_SMART_GOALS` (default `true`)

## Visão

Metas financeiras inteligentes: criar objetivos, acompanhar progresso, resumo no Início.  
Sugestões automáticas da Atlas IA ficam para **v1.1** (hooks preparados em `intelligence/hooks.ts`).

## Arquitetura

```
UI (SmartGoalsPage / SummaryCard)
        ↓
useSmartGoals
        ↓
SmartGoalsService
        ↓
goalsService (Supabase Repository)
        ↓
public.goals (+ invalidate FDL)
```

Integração futura IA: `serializeGoalsForIntelligence` / `suggestGoalInsights` (stub).

## Schema (`public.goals`)

Campos originais + Sprint Smart Goals:

| Campo | Notas |
|---|---|
| `target_date` | Deadline |
| `description` | Opcional |
| `category` | emergency, travel, purchase, debt, education, investment, other |
| `status` | active, completed, paused, cancelled |
| `updated_at` | Trigger on UPDATE |

Migração: `supabase/migrations/20260718010000_smart_goals_columns.sql`

## UI

- `/metas` — lista, progresso, tempo restante, Nova Meta
- Home — card resumo (qtd, concluídas, mais próxima, progresso geral)
- Home GoalsFocus — atalho “Ver todas”

## Analytics

`smart_goals_opened`, `smart_goal_created`, `smart_goal_contribution`, `smart_goal_updated`, `smart_goal_deleted`

## Testes

`modules/smart-goals/utils/goalMath.test.ts`

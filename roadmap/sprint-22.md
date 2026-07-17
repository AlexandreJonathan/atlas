# Sprint 22 — Atlas AI Tool Calling (Missão 22)

**Versão:** `0.9.4`  
**Objetivo:** transformar a Atlas IA em agente que consulta a plataforma via tools → `FinancialDataService`.

## Fora de escopo

- Mudanças de UX
- Alteração do contrato da Financial Data Layer / `FinancialDataProvider`
- Chamadas Pluggy diretas a partir das tools

## Fluxo

```
Usuário → OpenAIProvider → Edge atlas-ai-chat (mode=agent)
        → tool_calls → AtlasToolRegistry → FinancialDataService
        → tool results → Edge → resposta final
```

No 1º turno: `tool_choice=required` (não responde números sem tool).  
Fallback: legado RLS na Edge → mock limitado.

## Tools

| Tool | Fonte |
|---|---|
| `getFinancialSnapshot` | FDS snapshot (saldo, patrimônio, mês) |
| `getAccounts` | contas OF + bills |
| `getTransactions` | ledger transactions |
| `getInvestments` | investimentos OF + preview estudo |
| `getGoals` | metas |

## Critérios

- [x] lint / build
- [x] documentação
- [x] commits + push

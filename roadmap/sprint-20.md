# Sprint 20 — Financial Data Layer (Missão 20)

**Versão:** `0.9.2`  
**Objetivo:** criar uma camada única de acesso a dados financeiros antes da integração Pluggy real.

## Fora de escopo

- Integração HTTP/SDK Pluggy
- Mudanças de UX / regras numéricas da Home
- Tool Calling / novas features de produto

## Entregas

| Peça | Descrição |
|---|---|
| `FinancialDataProvider` | Contrato de leitura do snapshot unificado |
| `MockFinancialDataProvider` | Ledger Supabase + OF mock + investimentos de estudo |
| `PluggyFinancialDataProvider` | Stub: ledger Supabase + `PluggyOpenFinanceProvider` |
| `FinancialDataService` | Cache, sync, invalidação, mutações otimistas, eventos |
| `useFinancialData` | Hook único para Home, Atlas IA, AppShell, Investimentos |

## Consumidores

- Home / Atlas IA / AppShell / Investimentos → `useFinancialData`
- Atlas Intelligence → contexto montado a partir de `FinancialSnapshot`
- Open Finance hub (`/contas`) permanece em `openFinanceService` (conexão/sync de bancos)

## Critérios

- [x] lint / build
- [x] documentação
- [x] commits pequenos + push

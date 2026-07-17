# Sprint 21 — Pluggy Integration (Missão 21)

**Versão:** `0.9.3`  
**Objetivo:** substituir o stub Pluggy por integração real via Edge Functions, sem alterar UX nem o contrato da Financial Data Layer.

## Pesquisa (docs oficiais)

- Auth: `POST https://api.pluggy.ai/auth` com `clientId`/`clientSecret` → API Key (~2h).
- Connect Token: `POST /connect_token` (30 min) — uso no widget; **não** recupera produtos detalhados.
- Widget: `react-pluggy-connect` no front; token vindo só do backend.
- Dados: `GET /accounts`, `GET /transactions`, `GET /investments` com API Key no servidor.
- Referência: https://docs.pluggy.ai/docs/authentication

## Entregas

| Peça | Papel |
|---|---|
| Edge `pluggy-proxy` | Auth Pluggy, connect token, register/sync item, snapshot, connectors |
| Tabela `pluggy_connections` | Vínculo `user_id` ↔ `item_id` (service role) |
| `modules/pluggy/` | Client Edge (timeout/retry), mapper, overlay Connect |
| `PluggyOpenFinanceProvider` | Catálogo + connect/sync reais |
| `PluggyFinancialDataProvider` | Snapshot FDL com OF Pluggy + ledger Atlas |

## Flags (sem mudar telas)

- `VITE_FINANCIAL_DATA_PROVIDER=pluggy` — FDL usa Pluggy
- `VITE_OF_PROVIDER=pluggy` — hub `/contas` usa o mesmo adapter

Secrets Supabase: `PLUGGY_CLIENT_ID`, `PLUGGY_CLIENT_SECRET` (nunca no Vite).

## Critérios

- [x] lint / build
- [x] documentação
- [x] commits pequenos + push

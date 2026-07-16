# Sprint 10 — Open Finance Foundation (Missão 11)

## Status: ✅ Concluída

## 1. Objetivo

Criar a fundação de Open Finance da Atlas com padrão **Adapter/Provider**, catálogo de bancos, hub financeiro e telas premium de conexão — **sem integração real com a Pluggy** nesta sprint. Provedor-alvo do MVP: **Pluggy**.

## 2. Decisão arquitetural

```
UI
 ↓
OpenFinanceService
 ↓
OpenFinanceProvider (interface)
 ├── MockOpenFinanceProvider   ← ativo nesta sprint
 └── PluggyOpenFinanceProvider ← stub (sem HTTP/SDK)
```

- A UI e os hooks falam **somente** com `OpenFinanceService`.
- Trocar Pluggy por outro provedor no futuro não exige alterar telas.

## 3. Escopo implementado

### 3.1 Módulo `src/modules/open-finance/`

| Pasta | Conteúdo |
|---|---|
| `types/` | `Bank`, `BankAccount`, `CreditCard`, `Investment`, `Balance`, `Pix`, `Loan`, `OpenFinanceSnapshot`, `FinancialHubTotals` |
| `providers/` | Interface + Mock + stub Pluggy |
| `services/` | `OpenFinanceService` + singleton `openFinanceService` |
| `mocks/` | Catálogo (11 instituições) + snapshot inicial |
| `utils/` | Aggregator de patrimônio + event bus local |
| `hooks/` | `useOpenFinance` |
| `components/` | Hub, Conectar Bancos, Contas Conectadas, `BankLogo` |

### 3.2 Catálogo de bancos

Nubank, Inter, C6, Itaú, Santander, Bradesco, Banco do Brasil, Caixa, PagBank, Mercado Pago, Wise.

### 3.3 Telas e rotas

| Rota | Tela |
|---|---|
| `/contas` | Hub financeiro (patrimônio, saldos, cartões, investimentos, bancos conectados) |
| `/contas/conectar` | Catálogo + conectar (mock) |
| `/contas/conectadas` | Detalhe de contas/cartões por banco |

Perfil → Open Finance navega para `/contas`.

### 3.4 Eventos locais (preparados para webhooks/IA)

`onBankConnected`, `onBankDisconnected`, `onBalanceUpdated`, `onPixReceived`, `onInvestmentChanged`, `onSnapshotRefreshed`.

## 4. Fora de escopo (explícito)

- Chamadas reais à API Pluggy / SDK
- Persistência de conexões no Supabase
- Alteração de auth, RLS, engines de negócio
- Home / Investimentos consumindo Open Finance real

## 5. Critérios de aceite

- [x] Interface `OpenFinanceProvider` cobrindo operações necessárias
- [x] `MockOpenFinanceProvider` funcional em memória
- [x] `PluggyOpenFinanceProvider` apenas stub
- [x] UI → `OpenFinanceService` → provider (sem acoplamento Pluggy)
- [x] Hub + conectar + contas conectadas
- [x] `npm run lint` e `npm run build` sem erros

## 6. Próximos passos

- Implementar `PluggyOpenFinanceProvider` com Connect Widget / API
- Persistência de `item_id` / consentimentos
- Sincronização periódica e webhooks
- Alimentar Home / Investimentos a partir do snapshot agregado

# Status da Plataforma Atlas — v1.2.1

**Documento oficial de baseline** para a próxima fase de desenvolvimento (Release Candidate **v1.3**).  
**Não descreve trabalho futuro detalhado** — apenas o estado atual, riscos e pendências.

| Campo | Valor |
|---|---|
| Versão do produto | **1.2.1** |
| Codinome da entrega | Atlas Experience (Fase 3.1) + Installment Intelligence (Fase 3) |
| Status | **Concluída** · lint / test / build verdes |
| App | `apps/web` (`package.json` + `APP_VERSION`) |
| Data de referência | 2026-07-18 |
| Branch de referência | `main` |

---

## 1. Módulos implementados

| Módulo | Versão / marco | Rotas / superfície | Flag |
|---|---|---|---|
| Financial Data Layer | Missão FDL | Snapshot unificado (ledger + OF stub) | providers `mock` / `pluggy` |
| Auth + Onboarding | Sprints 1–6 | `/login`, `/cadastro`, wizard | — |
| Home / Dashboard | UX Home Premium | `/inicio` | — |
| Smart Goals | v1.0.0 | `/metas` + card Home | `smartGoals` |
| Budget Planner | v1.0.1 | `/orcamento` + card Home | `budgetPlanner` |
| Financial Planner | v1.0.2 | `/planejamento` + card Home | `financialPlanner` |
| Atlas Intelligence | v2.0 + UX 1.2.1 | `/atlas-ia` + card Home | `atlasIntelligenceV2` (+ `openai` chat) |
| Installment Intelligence | v1.2.0 + pay-cycle 1.2.1 | `/parcelas` + card Home | `installments` |
| Agenda de contas | Experience 1.2.1 | `/contas-a-pagar` | — (usa FDL `bills`) |
| Open Finance (Pluggy) | Sprint 10+ | `/contas`, conectar/conectadas | `openFinance` |
| Investimentos (teaser) | stub | `/investimentos` | `investments` |

### Capacidade entregue em 1.2.x (resumo)

- Parcelas: plano + cronograma; marcar paga cria/vincula `transactions` (`transaction_id`); impacto em Budget/Planner/Intelligence.
- Home: menos double-fetch (FDL para parcelas; `budgetMonthStore` para orçamento).
- Intelligence: dismiss, feedback Útil/Não útil, histórico local (`insightPreferencesStore`).
- Contas: listagem completa com filtros status/período.

---

## 2. Arquitetura atual

```
UI (pages / module components)
        ↓
Hooks (useFinancialData, useBudgetPlanner, useInstallments, useFinancialPlanner, useAtlasIntelligence)
        ↓
Domain Services (modules/*/services)
        ↓
Repositories (apps/web/src/services/*)  →  Supabase (RLS)
        ↓
Financial Data Layer (snapshot cache + invalidate/sync)
        ↓
Budget / Planner / Intelligence (derivados — sem duplicar regras de negócio)
```

**Princípios em vigor**

- Monorepo; front React 19 + TypeScript + Vite em `apps/web`.
- Modules → Services → Repository → Hooks.
- Feature Flags + Analytics (buffer local) + Logging JSON + Trust Boundary (Edge agent).
- FDL é a fonte de verdade do ledger; módulos de produto consomem o snapshot.
- Parcelas pending sem `transaction_id` = compromisso; após pagar = caixa + vínculo.

Fonte detalhada: [`arquitetura.md`](./arquitetura.md).

---

## 3. Feature flags existentes

Definidas em `apps/web/src/config/types.ts` / `AppConfig.ts`.

| Key | Env | Default | Papel |
|---|---|---|---|
| `openai` | `VITE_FF_OPENAI` | `false` | Chat Atlas via Edge OpenAI |
| `openFinance` | `VITE_FF_OPEN_FINANCE` | `true` | UI/fluxo Open Finance |
| `investments` | `VITE_FF_INVESTMENTS` | `true` | Superfície investimentos |
| `notifications` | `VITE_FF_NOTIFICATIONS` | `false` | Reservada |
| `smartGoals` | `VITE_FF_SMART_GOALS` | `true` | Smart Goals |
| `budgetPlanner` | `VITE_FF_BUDGET_PLANNER` | `true` | Budget Planner |
| `financialPlanner` | `VITE_FF_FINANCIAL_PLANNER` | `true` | Financial Planner |
| `atlasIntelligenceV2` | `VITE_FF_ATLAS_INTELLIGENCE_V2` | `true` | RecommendationEngine local |
| `installments` | `VITE_FF_INSTALLMENTS` | `true` | Installment Intelligence |

Providers relacionados: `VITE_OF_PROVIDER`, `VITE_FINANCIAL_DATA_PROVIDER`, `VITE_SENTRY_DSN` (ver `.env.example` e `docs/deploy.md`).

---

## 4. Pendências para Release Candidate (RC v1.3)

Prioridade sugerida para a próxima fase (sem compromisso de escopo fechado):

1. **Personalização de insights** — usar `getFeedbackSignals()` no RecommendationEngine.
2. **Installments v1.3** — vínculo cartão Open Finance; quitação/antecipação; entrada na Bottom Nav.
3. **Bills → ledger** — ao pagar conta (`bills`), criar/vincular `transactions` (mesmo padrão das parcelas).
4. **Edição** de transações, categoria em lançamentos antigos e despesas fixas.
5. **Planner what-if** / persistência de horizonte (Financial Planner v1.1).
6. **E2E crítico** (login → home → parcela paga → orçamento) + paginação de listagens.
7. **Analytics sink real** (hoje Noop) e política de senha mais robusta antes de abertura ampla.
8. Tabela `profiles` / confirmação de rate-limit Auth no Supabase (Alpha → RC).

Detalhamento vivo: [`backlog.md`](./backlog.md).

---

## 5. Riscos técnicos conhecidos

| Risco | Severidade | Nota |
|---|---|---|
| Migração `installment_*` não aplicada no projeto Supabase remoto | Alta | Exige `supabase db push` / SQL antes do uso em produção |
| Chat OpenAI depende de secrets Edge + `ALLOWED_ORIGINS` | Alta | Sem isso, modo limitado (esperado) |
| Pluggy/OF em produção sem credenciais | Média | Fallback ledger-only; UX degradada |
| Preferências de insight só em `localStorage` | Média | Perdem-se entre dispositivos; ok para prep de personalização |
| Sem E2E | Média | Regressões de fluxo multi-módulo |
| Listagens sem paginação | Média | Alpha ok; risco de latência com histórico grande |
| Domínio `bills` ainda desacoplado de `transactions` | Média | Inconsistência de caixa vs agenda |
| Tema só escuro; contraste WCAG não auditado | Baixa–Média | Débito de acessibilidade visual |
| Analytics sem sink externo | Baixa | Eventos só locais |

---

## 6. Dívida técnica restante

- Hooks/UI de módulos com cobertura ~0% (lógica pura coberta; integração não).
- `loadLedger` / serviços de domínio pouco cobertos por testes de integração.
- Casts manuais de rows Supabase (gerar types oficiais).
- Sem React Query / cache genérico além do FDL + `budgetMonthStore`.
- `UpcomingBillsPanel` legado não usado (Home usa `BillsTimeline` + `/contas-a-pagar`).
- `AtlasToolRegistry` no client é legado para produção (tools na Edge).
- Design system: tokens presentes; inconsistências pontuais de estados vazios/loading entre telas.
- Onboarding sem atalho para revisitação pós-conclusão.

---

## 7. Cobertura de testes por módulo

Suite atual: **61 testes** · Vitest · escopo de coverage em `vitest.config.ts`.  
Medição: `npm run test:coverage` (linhas / statements aproximados por pasta).

| Módulo / área | Cobertura (linhas, aprox.) | Observação |
|---|---|---|
| `installments/utils` (`installmentMath`) | ~92% | Forte |
| `installments/services` | ~70% | `markPaid` coberto |
| `installments/hooks` + UI | ~0% | Dívida |
| `budget-planner/utils` (`budgetMath`) | ~92% | Forte |
| `budget-planner/utils` (`budgetMonthStore`) | ~67% | Dedupe coberto |
| `budget-planner/hooks` + services | ~0% | Dívida |
| `financial-planner/utils` (`planMath`) | ~85% | Forte |
| `financial-planner/hooks` + services | ~0% | Dívida |
| `smart-goals/utils` (`goalMath`) | ~86% | Forte |
| `smart-goals/hooks` + services | ~0% | Dívida |
| `financial-data` (providers + service + utils) | ~50–75% misto | `buildSnapshot`/`aggregate` altos; `loadLedger` baixo |
| `atlas-intelligence` security | ~84% | Trust boundary |
| `atlas-intelligence` RecommendationEngine + rules | misto (~40% pasta rules; Installment rule 100% no teste dedicado) | |
| `atlas-intelligence` `insightPreferencesStore` | ~81% | Experience 1.2.1 |
| `atlas-intelligence` hooks / UI / chat providers | baixo / parcial | OpenAIProvider com testes de caminho crítico |
| **Global (include Vitest)** | ~41% statements | Aceitável para Alpha; insuficiente para RC sem E2E |

---

## 8. Checklist de produção (baseline RC)

Complementa [`docs/alpha-production-checklist.md`](../docs/alpha-production-checklist.md) e [`docs/deploy.md`](../docs/deploy.md).

### Infra & dados

- [ ] Projeto Supabase linkado; Auth Site URL + redirect `/redefinir-senha`
- [ ] Migrações aplicadas **incluindo** `20260718030000_installment_intelligence.sql`
- [ ] RLS validado para `installment_plans` / `installment_payments`
- [ ] Backups / PITR confirmados

### Edge & secrets

- [ ] `atlas-ai-chat` e `pluggy-proxy` deployadas (se usadas no RC)
- [ ] `ALLOWED_ORIGINS`, `OPENAI_API_KEY`, credenciais Pluggy conforme escopo
- [ ] Front: `VITE_SUPABASE_*`, flags alinhadas, `VITE_SENTRY_DSN` em produção

### Qualidade

- [ ] `npm run lint` / `test` / `build` verdes na tag/commit de release
- [ ] Smoke: login → Home → criar parcela → marcar paga → ver despesa + orçamento
- [ ] Smoke: dismiss/feedback de insight; `/contas-a-pagar` filtros
- [ ] Smoke: Budget + Planner refletem parcelas pending

### Go / No-Go RC v1.3

- [ ] **GO** — itens críticos acima + pendências de produto do §4 aceitas ou entregues
- [ ] **NO-GO** — migração de parcelas ausente, secrets Edge quebrados, ou regressão de FDL

Operador: _______________ Data: _______________

---

## 9. Referências

- Changelog: [`changelog.md`](./changelog.md) · seção `[v1.2.1]`
- Arquitetura: [`arquitetura.md`](./arquitetura.md)
- Backlog: [`backlog.md`](./backlog.md)
- Installments: [`installments.md`](./installments.md)
- Intelligence: [`atlas-intelligence.md`](./atlas-intelligence.md)
- Deploy: [`docs/deploy.md`](../docs/deploy.md)

---

> Qualquer nova fase (RC v1.3+) deve partir deste documento e atualizar versão, changelog e este status (ou sucessor `status-plataforma-v1.3.md`).

# Atlas v0.9.0 — Production Readiness Audit (Missão 18)

**Tipo:** diagnóstico técnico only — sem implementação  
**Data:** 2026-07-16  
**Escopo:** Alpha privado readiness (antes de Tool Calling / Pluggy / IA avançada)

Relatório visual: canvas `atlas-alpha-audit-v09` no Cursor.

---

## Veredito

| Destino | Pronto? | Condição |
|---|---|---|
| **Alpha privado** (5–20 usuários, OF mock, IA com flag) | **Condicional** | Hardening P0 da Edge AI + checklist deploy + transparência do mock OF |
| **Beta** | **Não** | Pluggy real ou OF desligado; rate limit; Sentry; testes/CI; flags efetivas |
| **Produção** | **Não** | Tudo acima + contexto AI server-side, webhooks OF, orçamento LLM, a11y modal |

**Nota média (7 categorias): ~5.4 / 10**

---

## Notas por categoria

| # | Categoria | Nota | Resumo |
|---|---|---:|---|
| 1 | Arquitetura | **6.5** | Adapter/Service claro; factory OF mente sobre Pluggy; flags pouco efetivas |
| 2 | Performance | **4.5** | Lazy ok; double-fetch; deps instáveis no Intelligence; sem React Query |
| 3 | Segurança | **6.0** | Key OpenAI só na Edge; RLS ok; sem rate limit / getUser in-function |
| 4 | IA | **6.0** | Chat usável; fallback/timeout/retry ok; contexto client-trusted; sem budget |
| 5 | Open Finance | **2.5** | Mock demo; Pluggy não é drop-in |
| 6 | UX | **6.5** | Home async bom; hero loading / modal a11y / fallback IA fracos |
| 7 | Código | **5.5** | Órfãos Dashboard 2.0; hooks duplicados |

---

## 1. Arquitetura (6.5)

### Pontos fortes
- Fluxo UI → Hook → Service → Provider em Open Finance e Atlas Intelligence.
- OpenAI: factory respeita `VITE_FF_OPENAI` e usa `OpenAIProvider`.
- `AppConfig` / FeatureFlagService / logging / analytics desacoplados (Sprint 16).

### Riscos
| Risco | Prioridade | Impacto | Esforço |
|---|---|---|---|
| `createOpenFinanceProvider()` sempre retorna Mock mesmo com `pluggy` | P0 | Alto (falsa confiança) | S (corrigir mensagem/config) |
| Flags `investments` / `notifications` / `isModuleEnabled` sem gate de UI | P2 | Médio | M |
| Singletons no import (difícil testar/injetar) | P2 | Baixo | M |
| Barrel exporta providers concretos | P3 | Baixo | S |

---

## 2. Performance (4.5)

### Pontos fortes
- `React.lazy` nas abas autenticadas (`App.tsx`).
- Sem dependências de UI pesadas além de Inter + lucide.

### Riscos
| Risco | Prioridade | Impacto | Esforço |
|---|---|---|---|
| `useAtlasIntelligence` depende de objetos de hook inteiros → re-gera insights | P1 | Médio | S |
| Double-fetch AppShell ↔ Home ↔ Atlas IA | P2 | Médio | M–L (React Query ou context) |
| Bundle main &gt; 500kb (warn Vite); Inter no boot | P2 | Médio | S–M |
| Sem memo em folhas da Home | P3 | Baixo | S (após estabilizar props) |

**React Query:** não obrigatório para Alpha; recomendado antes de Beta se o uso diário crescer.

---

## 3. Segurança (6.0)

### Pontos fortes
- `OPENAI_API_KEY` nunca no Vite; documentado em `docs/deploy.md`.
- RLS `auth.uid() = user_id` nas 6 tabelas.
- Edge `verify_jwt = true` (`supabase/config.toml`).
- Auth via Supabase session + `ProtectedRoute`.

### Riscos
| Risco | Prioridade | Impacto | Esforço |
|---|---|---|---|
| Sem rate limiting / budget na Edge `atlas-ai-chat` | P0 | Alto (custo) | M |
| Sem `auth.getUser()` dentro da function | P1 | Alto se JWT for desligado | S |
| CORS `*` na Edge | P2 | Médio | S |
| Detalhe de erro OpenAI retornado ao client (502) | P2 | Baixo–Médio | S |
| Rate limit login (Supabase project) — confirmar manualmente | P2 | Médio | S (ops) |

---

## 4. IA (6.0)

### Pontos fortes
- Chat-only (Home Insights = engine local) — escopo correto da Sprint 17.
- Timeout 20s, até 3 retries, fallback mock, logs + analytics.
- Caps: history 12, max_tokens 450, listas de contexto limitadas.
- System prompt exige usar só o contexto Atlas.

### Riscos
| Risco | Prioridade | Impacto | Esforço |
|---|---|---|---|
| Contexto financeiro 100% do body do cliente (spoof) | P0 | Alto (integridade) | M–L |
| Fallback mock silencioso (UX engana) | P1 | Médio | S |
| Prompt injection via chat + descriptions no system | P2 | Médio | M |
| Timeout client não aborta request OpenAI (custo órfão) | P2 | Baixo–Médio | M |
| Sem cota por usuário/dia | P0 (com abuso) | Alto | M |

### Custo estimado (ordem de grandeza)
- Modelo alvo: `gpt-4.1-mini`, ~1–2k tokens in + ≤450 out por mensagem.
- Alpha 10 usuários × 20 msgs/dia ≈ dezenas de milhares de tokens/dia → **baixo** se houver rate limit.
- Sem rate limit, um JWT abusado escala custo rapidamente (retries ×3 amplificam).

---

## 5. Open Finance (2.5)

### Preparado para swap Pluggy sem refatoração?
**Não.** O Adapter Pattern está no lugar certo, mas o **domínio e a infra** não.

| Gap | Status |
|---|---|
| Factory carrega Pluggy | Não (sempre Mock) |
| Stub Pluggy implementado | Não (throws) |
| Connect token + widget | Não |
| Persistência `item_id` | Não |
| Webhooks | Não (bus local; Pix bridge nunca emitido pelo service) |
| `BankId` aberto / IDs Pluggy | Não (union fechada + logos CSS) |
| Edge/proxy para secrets Pluggy | Não |

**Conclusão:** tratar Pluggy como **nova fatia vertical**, não como “ligar o stub”.

---

## 6. UX (6.5)

### Pontos fortes
- Home com `AsyncStateView` em timeline/metas/recentes.
- Design System / shell unificados (Sprints 14–15).
- Focus-visible global; reduced motion.

### Riscos
| Risco | Prioridade | Impacto | Esforço |
|---|---|---|---|
| WealthHero / Pulse sem loading → R$ 0,00 enganoso | P1 | Médio | S |
| Modal sem focus trap / restore focus | P2 | Médio (a11y) | M |
| OF loading/erro fora do padrão AsyncStateView | P2 | Baixo | S |
| Fallback IA sem badge “modo local” | P1 | Médio | S |

---

## 7. Código (5.5)

### Órfãos (safe delete — não usados em rotas vivas)
- `AtlasIntelligencePanel` (+ CSS)
- `PlanningPanel`, `GoalsPanel` → `GoalsList`, `UpcomingBillsPanel` → `BillsList`
- `FinancialSummaryCards`, `TransactionsList`
- `useRecommendations` + `recommendationEngine` (cadeia morta)
- Parte de `atlasIntelligenceCopy` (`gerarAtlasIntelligenceCopy`)

### Smells
- Boilerplate repetido nos hooks CRUD.
- `formatarMoeda` local vs `formatMoneyBRL`.
- `HomePage` orquestra muitos hooks/modais (aceitável no Alpha; extrair depois).

---

## 8. Produção — o que falta

### Para Alpha privado ✅ (mínimo)
1. Deploy Vercel + Supabase (migrations, Redirect URLs, Confirm email) — checklist `docs/deploy.md`.
2. `OPENAI_API_KEY` + `atlas-ai-chat` deployed **ou** `VITE_FF_OPENAI=false`.
3. **Rate limit** na Edge (ou manter IA desligada).
4. Copy/disclaimer: Contas = demonstração (mock), não Open Finance real.
5. Smoke manual: login → onboarding → home → chat → logout.
6. (Recomendado) Sentry no `FutureErrorReporterSink`.

### Para Beta
- Tudo do Alpha +
- Rate limit + getUser + contexto AI validado/server-side
- Sentry + alertas
- CI (lint/build) + smoke E2E
- Flags efetivas / OF real **ou** rota Contas claramente “preview”
- Cache de dados (React Query) se tráfego crescer

### Para Produção
- Tudo do Beta +
- Pluggy (tokens, widget, persistência, webhooks) **ou** remoção do hub mock
- Budget LLM + monitoramento de custo
- Testes de engines + políticas RLS
- A11y modal / contraste formal
- Paginação / limites de listagem

---

## Roadmap recomendado

### Próxima Sprint: **18 — Alpha Hardening** (indicada)
Escopo qualidade/segurança/ops — **sem** Tool Calling, **sem** Pluggy:

| Item | Esforço |
|---|---|
| Rate limit + `getUser` na Edge `atlas-ai-chat` | M |
| UI: badge quando chat cair no mock | S |
| Fix deps `useAtlasIntelligence` | S |
| Ligar Sentry | S |
| Remover órfãos Dashboard 2.0 | S |
| Checklist deploy + smoke Alpha | S |

### Depois
- **19 — Data layer & UX polish** (cache, WealthHero loading, modal focus, flags)
- **20 — Pluggy Foundation** *ou* **Tool Calling** (escolher um)

---

## Próxima Sprint

**Sprint 18 — Atlas Alpha Hardening**

Não iniciar Tool Calling nem Pluggy até os P0 de IA/custo e a honestidade operacional do Alpha estarem fechados.

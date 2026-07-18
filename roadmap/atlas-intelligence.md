# Atlas Intelligence — Arquitetura

**Status:** v2.0 (app 1.1.0) — RecommendationEngine proativo + chat OpenAI (trust boundary)  
**Flag v2:** `VITE_FF_ATLAS_INTELLIGENCE_V2` (default `true`)

---

## 0. Atlas Intelligence v2.0

Assistente **proativo**: analisa FDL + Budget + Smart Goals + Financial Planner e gera recomendações locais.

### Princípios
- Proativa, contextual, explicável (`sourceRule`), não invasiva, confiável
- **Nunca inventa dados** — regra omite o insight se faltar evidência
- **Sem OpenAI** para recomendações (chat permanece separado)

### RecommendationEngine

```
FDL + Budget + Planner + Goals
        ↓
buildRecommendationContext
        ↓
RecommendationEngine (regras modulares)
 ├── BillRecommendationRule
 ├── BudgetRecommendationRule
 ├── ExpenseRecommendationRule
 ├── GoalRecommendationRule
 ├── InvestmentRecommendationRule
 ├── PlannerRecommendationRule
 └── EconomyRecommendationRule
        ↓
Top 1–3 → Home (Atlas Intelligence card)
```

Cada `Recommendation`: `title`, `description`, `priority`, `category`, `suggestedAction`, `tone`, `sourceRule`.

Chat futuro: `serializeRecommendationsForChat` — **não** enviar como `context` na Edge.

---

## 1. Visão

A Atlas Intelligence é o módulo responsável por:

1. Analisar o contexto financeiro do usuário (somente leitura).
2. Gerar **insights/recomendações** automáticos por regras (v2: RecommendationEngine).
3. Narrar **eventos** em um feed inteligente (evento → saldo → recomendação).
4. Chat via OpenAI (Edge) com trust boundary — sem gerar recomendações proativas no LLM.

O restante do sistema **não é substituído** — a Intelligence consome FDL e módulos de domínio.

---

## 2. Fluxo obrigatório

```
UI (Home / Atlas IA)
        ↓
useAtlasIntelligence (+ enrichment Budget/Planner)
        ↓
RecommendationEngine (v2, local) ──→ card Atlas Intelligence
        ↓
AtlasIntelligenceService
        ↓
AtlasAIProvider (interface)
 ├── MockAtlasAIProvider     ← chat limitado / narrate
 └── OpenAIProvider          ← flag openai on
        │   chat → Edge atlas-ai-chat (agent loop + tools RLS)
        │   insights legado → insightEngine (flag v2 off)
```

Telas **nunca** importam `OpenAIProvider` diretamente.  
`OPENAI_API_KEY` **nunca** fica no front — só no secret da Edge Function.

---

## 3. Estrutura de pastas

```
apps/web/src/modules/atlas-intelligence/
├── types/           # Insight, Recommendation, IntelligenceContext…
├── engine/
│   ├── insightEngine.ts              # legado (flag v2 off)
│   └── recommendations/              # RecommendationEngine v2 + rules
├── intelligence/    # serializeRecommendationsForChat
├── providers/       # AtlasAIProvider, Mock, OpenAI
├── services/        # AtlasIntelligenceService
├── hooks/           # useAtlasIntelligence
├── prompts/         # templates
├── tools/           # schemas + registry local (legado; LLM usa Edge)
├── security/        # agentTrustBoundary
├── components/      # AtlasInsights, IntelligenceFeed
├── utils/           # rankInsights, feedStore, format
└── index.ts
```

### Trust boundary (Sprint 24)

- Cliente: só `user`/`assistant` via `buildSafeAgentPayload`.
- Edge: allowlist, system prompt, `tool_choice`, execução RLS e resultados das tools.
- Qualquer `tools` / `role=tool` / `context` do cliente → `trust_violation`.


---

## 4. Insight Engine

Entrada: `IntelligenceContext` (saldo, patrimônio, receitas/despesas do mês, contas, metas, investimentos, risco, transações recentes).

Regras (exemplos):

| Insight | Quando |
|---|---|
| Contas em atraso | `contasVencidas.length > 0` |
| Próxima conta amanhã | dueDate = amanhã |
| Economizou mais que o mês passado | se houver histórico comparativo |
| Economia do mês | receitas − despesas > 0 |
| Maior despesa recente | max amount em despesas |
| Progresso de meta | % entre 25 e 100 |
| Patrimônio em movimento | entradas recentes + patrimônio > 0 |
| Risco alto | `risco === "alto"` |

Saída: lista de `Insight` ranqueada por `priority` (1 = mais importante). A Home exibe os **top 3** via `AtlasInsights`.

---

## 5. Feed inteligente

`FinancialEvent` → `provider.narrateEvent` → sequência de `FeedItem` publicada no `feedStore` em memória.

Cascata típica (Pix / receita):

1. Evento (Pix recebido / Receita registrada)  
2. Saldo atualizado  
3. Nova recomendação  

Persistência do feed: **sessão (memória)** nesta missão — sem tabela Supabase.

---

## 6. Provider OpenAI (Sprint 17 + 22 + 24)

Arquivo: `providers/OpenAIProvider.ts` + `openaiEdgeClient.ts` + `security/agentTrustBoundary.ts`.

- Chat agente: `invokeAtlasAiAgent` — timeout ~55s, até 3 tentativas; payload só user/assistant.
- Edge: loop + allowlist + tools via RLS; legado ainda monta contexto no system prompt.
- Fallback: agente → legado → mock limitado (flag off / rate limit / erro).
- Analytics: `atlas_ai_chat_success` / `atlas_ai_chat_fallback` / `atlas_ai_agent_*`.
- Ativação: `VITE_FF_OPENAI=true` + secret `OPENAI_API_KEY` + `ALLOWED_ORIGINS` em produção.

Prompts / serialização: `prompts/templates.ts` (`serializeContextForChat`, etc.).

---

## 7. O que NÃO muda nesta missão

- `recommendationEngine.ts` / `useRecommendations` (permanecem)
- `planningEngine.ts`
- Módulo Open Finance
- Schema Supabase / Auth / rotas principais

---

## 8. Integração UI

| Superfície | Uso |
|---|---|
| Home `/inicio` | `AtlasInsights` (top 3) + `IntelligenceFeed` compacto; eventos em saves |
| Atlas IA `/atlas-ia` | Chat via `OpenAIProvider` (ou mock) + feed completo |

---

## 9. Critérios de aceite

- [x] Módulo `src/modules/atlas-intelligence/`
- [x] Engine de insights
- [x] Sistema de Insights + top 3 na Home
- [x] Feed inteligente
- [x] `AtlasAIProvider` + Mock + stub OpenAI
- [x] Documentação (`roadmap/atlas-intelligence.md` + sprint)
- [x] lint / build

# Atlas Intelligence 1.0 — Arquitetura

**Status:** Implementado (Sprint 12) + chat OpenAI (17) + Tool Calling (22) + Trust Boundary (24)  
**Escopo:** cérebro da Atlas com Adapter/Provider. Chat real via OpenAI (Edge Function, tools no servidor); Insights/feed locais.

---

## 1. Visão

A Atlas Intelligence é o módulo responsável por:

1. Analisar o contexto financeiro do usuário (somente leitura).
2. Gerar **insights** automáticos por regras.
3. Narrar **eventos** em um feed inteligente (evento → saldo → recomendação).
4. Preparar o caminho para um provider de LLM (`OpenAIProvider` stub).

O restante do sistema (Home, Contas, engines de planejamento/recomendação Sprint 4/5) **não é substituído** — a Intelligence consome dados já agregados pelos hooks existentes.

---

## 2. Fluxo obrigatório

```
UI (Home / Atlas IA)
        ↓
useAtlasIntelligence / AtlasAIPage
        ↓
AtlasIntelligenceService
        ↓
AtlasAIProvider (interface)
 ├── MockAtlasAIProvider     ← flag openai off / fallback
 └── OpenAIProvider          ← flag openai on
        │   chat → Edge atlas-ai-chat (agent loop + tools RLS)
        │   insights / narrate → delega ao mock (Sprint 17)
        ↓
Insight Engine (regras puras) — Home
```

Telas **nunca** importam `OpenAIProvider` diretamente.  
`OPENAI_API_KEY` **nunca** fica no front — só no secret da Edge Function.

---

## 3. Estrutura de pastas

```
apps/web/src/modules/atlas-intelligence/
├── types/           # Insight, FeedItem, IntelligenceContext, FinancialEvent…
├── engine/          # insightEngine.ts (gerarInsights)
├── providers/       # AtlasAIProvider, Mock, OpenAI stub
├── services/        # AtlasIntelligenceService
├── hooks/           # useAtlasIntelligence
├── prompts/         # templates
├── tools/           # schemas + registry local (legado; LLM usa Edge)
├── security/        # agentTrustBoundary (payload seguro do cliente)
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

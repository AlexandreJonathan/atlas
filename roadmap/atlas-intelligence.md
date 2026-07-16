# Atlas Intelligence 1.0 — Arquitetura

**Status:** Implementado (Sprint 12 / Missão 13)  
**Escopo:** arquitetura do cérebro da Atlas — **sem OpenAI, sem LLM, sem alteração de banco/auth/Open Finance**.

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
useAtlasIntelligence
        ↓
AtlasIntelligenceService
        ↓
AtlasAIProvider (interface)
 ├── MockAtlasAIProvider   ← ativo
 └── OpenAIProvider        ← stub (sem HTTP)
        ↓
Insight Engine (regras puras)
```

Telas **nunca** importam `OpenAIProvider` diretamente.

---

## 3. Estrutura de pastas

```
apps/web/src/modules/atlas-intelligence/
├── types/           # Insight, FeedItem, IntelligenceContext, FinancialEvent…
├── engine/          # insightEngine.ts (gerarInsights)
├── providers/       # AtlasAIProvider, Mock, OpenAI stub
├── services/        # AtlasIntelligenceService
├── hooks/           # useAtlasIntelligence
├── prompts/         # templates para futura OpenAI
├── components/      # AtlasInsights, IntelligenceFeed
├── utils/           # rankInsights, feedStore, format
└── index.ts
```

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

## 6. Provider OpenAI (futuro)

Arquivo: `providers/OpenAIProvider.ts` — stub que lança erro explicativo.

Prompts já preparados em `prompts/templates.ts`:

- `ATLAS_SYSTEM_PROMPT`
- `buildInsightPrompt`
- `buildChatPrompt`
- `buildEventNarrationPrompt`

Quando a integração real for feita:

1. Implementar HTTP/Edge Function só em `OpenAIProvider`.
2. Trocar a instância injetada em `atlasIntelligenceService`.
3. UI e Service permanecem intactos.

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
| Atlas IA `/atlas-ia` | Chat via `MockAtlasAIProvider` + feed completo |

---

## 9. Critérios de aceite

- [x] Módulo `src/modules/atlas-intelligence/`
- [x] Engine de insights
- [x] Sistema de Insights + top 3 na Home
- [x] Feed inteligente
- [x] `AtlasAIProvider` + Mock + stub OpenAI
- [x] Documentação (`roadmap/atlas-intelligence.md` + sprint)
- [x] lint / build

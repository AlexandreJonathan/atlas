# Sprint 12 — Atlas Intelligence 1.0 (Missão 13)

## Status: ✅ Concluída

## 1. Objetivo

Construir o **cérebro** da Atlas: módulo desacoplado de insights, feed inteligente e contrato `AtlasAIProvider` — **sem OpenAI/LLM, sem alteração de banco, auth ou Open Finance**.

Documento de arquitetura: `roadmap/atlas-intelligence.md`.

## 2. Escopo implementado

### Módulo `src/modules/atlas-intelligence/`

- `types`, `engine`, `providers`, `services`, `hooks`, `prompts`, `components`, `utils`
- `MockAtlasAIProvider` ativo; `OpenAIProvider` stub
- `AtlasIntelligenceService` como única porta de entrada

### Insights

Motor `gerarInsights` analisa receitas, despesas, patrimônio, metas, contas e investimentos e gera insights ranqueados.

### UI

- `AtlasInsights` na Home (top 3)
- `IntelligenceFeed` na Home (compacto) e em `/atlas-ia`
- Chat da Atlas IA passa a responder via Mock provider (heurísticas + contexto)

## 3. Fora de escopo

- Chamadas OpenAI / Edge Functions
- Persistência de insights/feed no Supabase
- Mudanças em `recommendationEngine` / Open Finance / Auth

## 4. Validação

- [x] `npm run lint`
- [x] `npm run build`

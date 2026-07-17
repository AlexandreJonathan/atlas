# Sprint 17 — Atlas AI Integration (Missão 17)

## Status: ✅ Concluída

## 1. Objetivo

Integrar o primeiro LLM real (OpenAI) **somente no chat** da Atlas IA, preservando Adapter/Provider e sem colocar segredos no front-end.

## 2. Arquitetura

```
UI (AtlasAIPage)
  → AtlasIntelligenceService
    → AtlasAIProvider
      → OpenAIProvider          (flag openai)
           → supabase.functions.invoke("atlas-ai-chat")
             → Supabase Edge Function
               → OpenAI Chat Completions
      → MockAtlasAIProvider     (flag off / fallback)
```

## 3. Escopo

### Feito
- Edge Function `supabase/functions/atlas-ai-chat`
- `OpenAIProvider` chama **apenas** a Edge Function
- Timeout (20s) + retry (até 3) + logs + analytics
- Fallback automático para mock (erro, timeout, flag off)
- System prompt: usar só o contexto financeiro Atlas; não inventar números
- Insights da Home e feed: continuam no mock/engine local

### Fora de escopo
- LLM em Insights / narração de eventos
- Pluggy
- Chave OpenAI no Vite / Vercel front

## 4. Operação

```bash
# Segredo (servidor)
supabase secrets set OPENAI_API_KEY=sk-...
# Opcional
supabase secrets set OPENAI_MODEL=gpt-4.1-mini

# Deploy da function
supabase functions deploy atlas-ai-chat

# Front
VITE_FF_OPENAI=true
```

## 5. Validação
- [x] `npm run lint`
- [x] `npm run build`
- [x] Push `main` → Vercel

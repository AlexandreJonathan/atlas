# Sprint 19 — Alpha Hardening (Missão 19)

**Versão:** `0.9.1`  
**Objetivo:** eliminar bloqueadores de Alpha privado sem novas funcionalidades de produto.

## Fora de escopo (explícito)

- Tool Calling / function calling no LLM
- Integração HTTP/SDK Pluggy
- Mudanças de UX além de feedback de segurança e modo limitado da IA

## Entregas

| Área | O que mudou |
|---|---|
| Rate limiting | Tabela `ai_chat_rate_buckets` + Edge `atlas-ai-chat` (user + IP hash), HTTP 429, logs |
| Contexto financeiro | Edge ignora `body.context`; monta snapshot via RLS (transactions/bills/goals/profile) |
| Open Finance | `BankId` = string; factory instancia `PluggyOpenFinanceProvider` de verdade; stub leitura vazia |
| IA fallback | `ChatReplyResult.mode`; banner “modo limitado”; analytics `atlas_ai_rate_limited` |
| Observabilidade | `@sentry/react` com import dinâmico quando `VITE_SENTRY_DSN` |
| Performance | `manualChunks` no Vite + lazy das rotas de auth |

## Critérios de aceite

- [x] `npm run lint` / `npm run build`
- [x] Documentação (`changelog`, este sprint, `deploy.md`, `arquitetura.md`)
- [x] Commits pequenos + push `main`

## Operação pós-merge

1. Aplicar migração `20260716220000_create_ai_chat_rate_buckets.sql`
2. Redeploy da Edge `atlas-ai-chat`
3. Secrets opcionais: `ALLOWED_ORIGINS`, `AI_RATE_LIMIT_*`
4. Front: `VITE_FF_OPENAI=true` (se IA online) e opcional `VITE_SENTRY_DSN`

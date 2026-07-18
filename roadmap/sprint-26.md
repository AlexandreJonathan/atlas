# Sprint 26 — Production Readiness P0 (Missão 26)

**Versão:** `0.9.6`  
**Objetivo:** fechar os itens P0 da Mission 25 (CI, testes críticos, correlação, checklist de produção).

## Fora de escopo

- Novas features / UX / regras de negócio
- Rate limit Pluggy / CORS fail-closed Pluggy (P1)
- E2E Playwright (P2)

## Entregas

### 1. CI
- `.github/workflows/ci.yml` — `npm run lint` → `test` → `build` em `apps/web`
- Falha em qualquer etapa bloqueia merge (PR + push `main`)

### 2. Testes críticos (Vitest)
| Área | Arquivo |
|---|---|
| FinancialDataService | `financial-data/services/FinancialDataService.test.ts` |
| AtlasToolRegistry | `atlas-intelligence/tools/AtlasToolRegistry.test.ts` |
| OpenAIProvider | `atlas-intelligence/providers/OpenAIProvider.test.ts` |
| PluggyProvider | `PluggyFinancialDataProvider.test.ts` + `mapPluggySnapshot.test.ts` |
| Edge Trust Boundary | `edgeTrustBoundary.test.ts` (+ trust boundary existente) |
| requestId | `lib/observability/requestId.test.ts` |

### 3. Observabilidade
- `x-request-id` em `openaiEdgeClient` e `pluggyEdgeClient`
- Echo + body `requestId` nas Edges `atlas-ai-chat` e `pluggy-proxy`
- Logs estruturados JSON no client; tag Sentry `request_id`

### 4. Produção
- Checklist atualizado em `docs/deploy.md` (seção 6 + 6.1 Edge)
- Variáveis/secrets documentados

## Cobertura (aprox., Vitest v8 — escopo módulos críticos)

| Métrica | Valor |
|---|---|
| Statements (FDL + IA + Pluggy + obs/logging) | **~37%** |
| Branches | **~67%** |
| Funções | **~60%** |
| Caminhos P0 exercitados | cache/sync FDL, trust boundary, OpenAI fallbacks, Pluggy OK/fallback, requestId |

Não é cobertura global do monorepo — foco em caminhos críticos.

## Critérios
- [x] lint / test / build
- [x] documentação
- [x] commits + push
- [ ] Deploy Edges no projeto Supabase (manual — requer `supabase login`)

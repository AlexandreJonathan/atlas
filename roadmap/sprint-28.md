# Sprint 28 — Alpha Deployment Preparation (Missão 28)

**Versão:** `0.9.6` (sem bump — só operação/docs)  
**Objetivo:** tornar o deploy Alpha simples e reproduzível. Sem novas features / sem mudança de regras.

## Entregas

| Artefato | Caminho |
|---|---|
| Guia completo de deploy | `docs/alpha-deploy.md` |
| Checklist final □ | `docs/alpha-production-checklist.md` |
| Validador de ambiente | `scripts/validate-alpha-env.mjs` |
| `.env.example` Alpha | `apps/web/.env.example` |
| Ponteiros | `docs/deploy.md` |

## Uso rápido

```bash
node scripts/validate-alpha-env.mjs
node scripts/validate-alpha-env.mjs --strict
```

Seguir `docs/alpha-deploy.md` na ordem: login → link → secrets → Edges → front → smoke → checklist.

## Critérios

- [x] Guia com pré-requisitos, login, link, Edges, secrets, front, smoke, rollback
- [x] Script que lista exatamente o que falta
- [x] Checklist final
- [x] Smoke test guide documentado
- [x] Sem alteração de regras de negócio / arquitetura de produto

# Sprint 24 — Atlas AI Trust Boundary (Missão 24)

**Versão:** `0.9.5`  
**Objetivo:** eliminar Tool Injection, Schema Injection e confiança indevida no cliente no fluxo do agente Atlas IA.

## Fora de escopo

- Novas funcionalidades de produto
- Mudanças de UX
- Alteração da Financial Data Layer / `FinancialDataProvider`

## Trust boundary

```
Cliente → Edge atlas-ai-chat (mode=agent)
       → allowlist SERVER_TOOL_DEFINITIONS
       → loop OpenAI + execução RLS no servidor
       → reply + toolsUsed
```

O cliente envia **apenas** `{ mode: "agent", messages: user|assistant }`.

### Rejeitado com `trust_violation` (400)

| Tentativa | Código |
|---|---|
| `tools` no body | `client_tools_forbidden` |
| `toolChoice` no body | `client_tool_choice_forbidden` |
| `context` financeiro | `client_context_forbidden` |
| `role: system` | `client_system_forbidden` |
| `role: tool` | `client_tool_role_forbidden` |
| `assistant.tool_calls` | `client_assistant_tool_calls_forbidden` |

### Segurança adicional

- Rate limit **fail-closed** (erro de bucket → 429)
- CORS sem wildcard (`*` removido); sem `ALLOWED_ORIGINS` só `localhost`/`127.0.0.1`
- Tools desconhecidas rejeitadas na allowlist do servidor
- Args de tool não-vazios rejeitados (`invalid_tool_args`)

## Testes

`npm run test` em `apps/web` — `agentTrustBoundary.test.ts` cobre injection, role=tool, contexto adulterado, tool inexistente e payload seguro.

## Critérios

- [x] lint / build / test
- [x] documentação
- [x] commits + push
- [ ] deploy Edge `atlas-ai-chat` — ver checklist Missão 26 em `docs/deploy.md` §6.2

# Sprint 27 — Alpha Deployment & Validation (Missão 27)

**Versão alvo:** `0.9.6`  
**Objetivo:** validar deploy, ambiente, smoke e observabilidade — sem novas features.  
**Data da auditoria:** 2026-07-17 (ambiente local do desenvolvedor).

## Decisão final

### ❌ A Atlas **NÃO** está pronta para um Alpha privado neste momento.

O código e o CI estão em estado Adequado para Alpha, mas **o ambiente remoto não pôde ser validado**: o host Supabase configurado em `.env.local` **não resolve DNS**, não há `SUPABASE_ACCESS_TOKEN` / `supabase login`, e secrets/Edges não puderam ser listados nem deployados desta sessão.

---

## 1. Deploy Edge Functions

| Função | Código no repo | Deploy validado | Notas |
|---|---|---|---|
| `atlas-ai-chat` | ✅ | ❌ | Deploy/list bloqueados (sem auth CLI). Host do projeto inacessível. |
| `pluggy-proxy` | ✅ | ❌ | Idem. |

**Ação necessária (operador):**
```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF_VÁLIDO>
npx supabase functions deploy atlas-ai-chat
npx supabase functions deploy pluggy-proxy
```

---

## 2. Ambiente / variáveis

### Front (`.env.local` inspecionado — só nomes, sem valores)

| Variável | Presente | Status |
|---|---|---|
| `VITE_SUPABASE_URL` | Sim | ❌ Host **não resolve DNS** |
| `VITE_SUPABASE_ANON_KEY` | Sim | ⚠️ Formato publishable; não exercitado (host down) |
| `VITE_SENTRY_DSN` | **Não** | ❌ Reprovado para Alpha qualidade |
| `VITE_FF_OPENAI` | **Não** | ❌ Default `false` → IA limitada local |
| `VITE_FINANCIAL_DATA_PROVIDER` | **Não** | ⚠️ Default `mock` |
| `VITE_OF_PROVIDER` | **Não** | ⚠️ Default `mock` |

### Secrets Supabase (não listáveis sem login)

| Secret | Validado | Status |
|---|---|---|
| `ALLOWED_ORIGINS` | Não | ❌ Desconhecido |
| `OPENAI_API_KEY` | Não | ❌ Desconhecido |
| `PLUGGY_CLIENT_ID` | Não | ❌ Desconhecido |
| `PLUGGY_CLIENT_SECRET` | Não | ❌ Desconhecido |
| Sentry no front = `VITE_SENTRY_DSN` | Não no `.env.local` | ❌ |

---

## 3. Smoke tests

| Item | Resultado | Evidência |
|---|---|---|
| Login | ❌ Não executado | Backend inacessível |
| Dashboard / Financial Data | ❌ Não executado | Idem |
| Open Finance / Pluggy | ❌ Não executado | Idem + secrets desconhecidos |
| Atlas AI / Tool Calling | ❌ Não executado | Idem + flag off |
| Edge Functions (HTTP) | ❌ Falhou | DNS NXDOMAIN no projeto |
| Trust violation live | ❌ Não executado | Edge não alcançável |
| Logs / request IDs live | ❌ Não executado | Sem tráfego real |
| CI lint/test/build | ✅ | [Run #29622435724](https://github.com/AlexandreJonathan/atlas/actions/runs/29622435724) `success` |
| Testes unitários locais | ✅ | 38 testes passando |
| Código request_id nas Edges | ✅ | Presente em `atlas-ai-chat` e `pluggy-proxy` |

---

## 4. Observabilidade

| Check | Status |
|---|---|
| Instrumentação no código (JSON logs + `x-request-id`) | ✅ |
| Logs chegando em produção | ❌ Não verificado |
| `request_id` em respostas Edge live | ❌ Não verificado |
| Erros no Sentry | ❌ DSN ausente localmente |
| Correlação Client → Edge live | ❌ Não verificado |

---

## 5. Itens aprovados vs reprovados

### Aprovados
- Código Edge + trust boundary + request_id no `main` (`0.9.6`)
- CI GitHub Actions verde
- Suite Vitest crítica local
- Checklist de produção documentado (`docs/deploy.md` §6)

### Reprovados / bloqueadores
1. Projeto Supabase configurado **inexistente ou URL inválida** (DNS)
2. Edges **não confirmadas** como deployadas
3. Secrets Alpha **não confirmados**
4. `VITE_SENTRY_DSN` ausente
5. Smoke funcional **não executado**

---

## 6. Riscos restantes

| Risco | Pri |
|---|---|
| Convidar usuários com URL Supabase inválida | P0 |
| IA/Pluggy em prod sem secrets → 500/503 ou modo limitado | P0 |
| Sem Sentry → cegueira de erros no Alpha | P1 |
| CORS/`ALLOWED_ORIGINS` errado → chat bloqueado no browser | P0 |
| Pluggy CORS ainda default `*` se env vazio (débito P1) | P1 |

---

## 7. Critério para virar ✅ GO

1. Corrigir `VITE_SUPABASE_URL` para um projeto real e acessível  
2. Deploy + smoke das duas Edges  
3. Secrets: `OPENAI_API_KEY`, `ALLOWED_ORIGINS`, Pluggy se usado  
4. Front: `VITE_FF_OPENAI=true`, `VITE_SENTRY_DSN=...`  
5. Smoke manual: login → Home → chat IA com `requestId` → (opcional) Connect  
6. Confirmar evento no Sentry (erro de teste) e log Edge com mesmo `requestId`

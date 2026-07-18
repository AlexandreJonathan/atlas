# Atlas — Guia de Deploy Alpha (Missão 28)

Guia **reproduzível** para colocar a Atlas `0.9.6+` em Alpha privado.  
Não descreve features novas — apenas operação.

| Documento | Uso |
|---|---|
| Este arquivo | Procedimento completo (CLI, secrets, smoke, rollback) |
| [`deploy.md`](./deploy.md) | Referência técnica de hospedagem / migrações / Vercel |
| [`alpha-production-checklist.md`](./alpha-production-checklist.md) | Checklist final (marcar □) |
| [`guia-deploy-fundador.md`](./guia-deploy-fundador.md) | Versão sem jargão |
| `node scripts/validate-alpha-env.mjs` | Validação automática pré-deploy |

---

## 1. Pré-requisitos

### Contas e ferramentas
- [ ] Conta [Supabase](https://supabase.com) com projeto **real** (URL resolve DNS)
- [ ] Node.js 22+ e npm
- [ ] Git (branch `main` atualizado)
- [ ] CLI Supabase via `npx supabase` (não precisa instalar global)
- [ ] Hospedagem front (Vercel recomendada) **ou** `npm run preview` só para smoke local
- [ ] (Alpha IA) chave OpenAI
- [ ] (Alpha Pluggy) app em [dashboard.pluggy.ai](https://dashboard.pluggy.ai)
- [ ] (Alpha qualidade) projeto Sentry + DSN

### Código
```bash
git clone <repo>   # ou git pull origin main
cd atlas
cd apps/web && npm ci && cd ../..
node scripts/validate-alpha-env.mjs
```

O validador deve listar o que falta **antes** de você gastar tempo no Dashboard.

---

## 2. Login Supabase

```bash
npx supabase login
```

Abre o browser para autorizar a CLI. Alternativa CI/local:

```bash
# PowerShell
$env:SUPABASE_ACCESS_TOKEN = "sbp_...."
# bash
export SUPABASE_ACCESS_TOKEN=sbp_....
```

Token: Supabase Dashboard → Account → Access Tokens.

Confirme:

```bash
npx supabase projects list
```

---

## 3. Link do projeto

1. Dashboard → Settings → General → **Reference ID** (`PROJECT_REF`)
2. Settings → API → **Project URL** e **anon / publishable key**

```bash
npx supabase link --project-ref <PROJECT_REF>
```

Aplique migrações (obrigatório na primeira vez):

```bash
npx supabase db push
```

Ou SQL manual na ordem listada em [`deploy.md`](./deploy.md) §2.1.

Auth (Dashboard → Authentication → URL Configuration):
- **Site URL** = URL do front (ex: `https://seu-app.vercel.app`)
- **Redirect URLs** += `https://seu-app.vercel.app/redefinir-senha` e, se útil, `http://localhost:5173/redefinir-senha`

---

## 4. Deploy das Edge Functions

```bash
npx supabase functions deploy atlas-ai-chat
npx supabase functions deploy pluggy-proxy
```

Confirme no Dashboard → Edge Functions que ambas aparecem com JWT verification habilitado (config do repo: `verify_jwt = true`).

**Smoke HTTP rápido (após secrets):** ver §7.

---

## 5. Configuração dos secrets (Supabase)

Nunca coloque estes valores no front / Vercel Vite.

### Obrigatórios para Alpha com IA

```bash
npx supabase secrets set OPENAI_API_KEY=sk-...
npx supabase secrets set ALLOWED_ORIGINS=https://seu-app.vercel.app,http://localhost:5173
```

Opcional:

```bash
npx supabase secrets set OPENAI_MODEL=gpt-4.1-mini
# nxp supabase secrets set AI_RATE_LIMIT_USER=20
# npx supabase secrets set AI_RATE_LIMIT_IP=40
```

> Sem `ALLOWED_ORIGINS`, `atlas-ai-chat` só aceita origem `localhost` / `127.0.0.1` (CORS fail-closed — Sprint 24).

### Obrigatórios se Pluggy / OF real

```bash
npx supabase secrets set PLUGGY_CLIENT_ID=...
npx supabase secrets set PLUGGY_CLIENT_SECRET=...
# opcional:
# npx supabase secrets set PLUGGY_INCLUDE_SANDBOX=true
```

Listar (nomes apenas — a CLI não imprime valores):

```bash
npx supabase secrets list
```

---

## 6. Configuração do Frontend

### Local (`apps/web/.env.local`)

```env
VITE_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_ou_publishable>

# Alpha com IA
VITE_FF_OPENAI=true
VITE_SENTRY_DSN=https://...@....ingest.sentry.io/...

# Alpha com Open Finance real (opcional; senão deixe mock)
# VITE_FINANCIAL_DATA_PROVIDER=pluggy
# VITE_OF_PROVIDER=pluggy
```

Modelo: `apps/web/.env.example`.

### Produção (Vercel)

- Root Directory: `apps/web`
- Build: `npm run build`
- Output: `dist`
- Mesmas `VITE_*` do `.env.local` (nunca `service_role`, nunca `OPENAI_API_KEY`, nunca `PLUGGY_CLIENT_*`)

```bash
cd apps/web
npm run lint
npm run test
npm run build
```

Revalide:

```bash
node scripts/validate-alpha-env.mjs --strict
```

---

## 7. Smoke Test

Guia detalhado: § **Smoke Test Guide** abaixo. Resumo mínimo pós-deploy:

1. Login com usuário Alpha  
2. Home carrega saldo / cards (Financial Data)  
3. Atlas IA responde online (não só “modo limitado”)  
4. DevTools → Network → `atlas-ai-chat`: body/header com `requestId` / `x-request-id`  
5. (Se Pluggy) Connect não retorna 503  
6. Sentry: gerar erro de teste e ver evento com tag `request_id` (se aplicável)

---

## 8. Rollback

### Front (Vercel)
- Deployments → Promote deployment anterior estável  
- Ou `git revert` + push (CI rebuild)

### Edge Functions
```bash
# Redeploy da versão anterior do código (checkout do commit estável)
git checkout <commit-estavel> -- supabase/functions
npx supabase functions deploy atlas-ai-chat
npx supabase functions deploy pluggy-proxy
git checkout main -- supabase/functions   # restaurar working tree
```

### Secrets
- Dashboard → Edge Functions → Secrets: restaurar valores anteriores  
- Ou `npx supabase secrets set KEY=valor_anterior`

### Feature flags (mitigação rápida sem redeploy Edge)
- `VITE_FF_OPENAI=false` → chat cai para modo limitado (sem OpenAI)  
- `VITE_FINANCIAL_DATA_PROVIDER=mock` + `VITE_OF_PROVIDER=mock` → desliga Pluggy no front  

### Banco
- Não há down-migration automática. Em emergência: restore PITR/backup Supabase (Dashboard → Database → Backups). Documente o ponto de restore **antes** do Alpha.

---

## Smoke Test Guide (passo a passo)

Execute após §4–§6. Marque em [`alpha-production-checklist.md`](./alpha-production-checklist.md).

### A. Login
1. Abra a URL do Alpha (ou `npm run dev` em `apps/web`).  
2. Cadastre / entre com e-mail de teste.  
3. **OK:** chega em `/inicio` (ou onboarding se primeiro acesso).  
4. **Falha comum:** Redirect URL Auth não inclui o domínio.

### B. Dashboard / Financial Data
1. Em `/inicio`, confirme cards de saldo / resumo.  
2. Crie uma receita pequena e veja o saldo atualizar.  
3. **OK:** dados do ledger via FDL (provider `mock` ou `pluggy`).  
4. **Falha comum:** `VITE_SUPABASE_*` errado → tela “Supabase não configurado”.

### C. Open Finance
**Modo mock:** hub `/contas` mostra catálogo mock — suficiente para Alpha sem Pluggy.  
**Modo pluggy:**  
1. `VITE_OF_PROVIDER=pluggy` + `VITE_FINANCIAL_DATA_PROVIDER=pluggy`  
2. Secrets Pluggy na Edge  
3. Connect → autorizar instituição sandbox  
4. **OK:** contas aparecem após sync; sem `503 Pluggy not configured`.

### D. Atlas AI + Tool Calling + Edge
1. `VITE_FF_OPENAI=true` + `OPENAI_API_KEY` + Edge `atlas-ai-chat` deployada.  
2. Aba `/atlas-ia` → pergunte “Qual meu saldo?”.  
3. **OK:** resposta coerente **sem** prefixo de “modo limitado”.  
4. DevTools → request `atlas-ai-chat`:  
   - Request header `x-request-id`  
   - Response header `x-request-id` e/ou JSON `requestId`  
5. (Avançado) Com JWT, POST malicioso com `"tools":[...]` deve retornar `trust_violation` (Sprint 24).

### E. Logs
1. Supabase Dashboard → Edge Functions → `atlas-ai-chat` → Logs.  
2. Dispare um chat.  
3. **OK:** linha com `requestId` (ou campo equivalente no JSON de log).

### F. Sentry
1. `VITE_SENTRY_DSN` no build.  
2. Dispare um erro controlado (ex.: temporário em consola `throw` só em staging) ou use Issue do ErrorBoundary.  
3. **OK:** evento no Sentry; preferível com tag `request_id` se o erro ocorreu dentro de um invoke com correlação.

---

## Comandos “dia do deploy” (cola rápida)

```bash
# 0) Validar ambiente local
node scripts/validate-alpha-env.mjs --strict

# 1) Auth + link
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push

# 2) Secrets
npx supabase secrets set OPENAI_API_KEY=sk-...
npx supabase secrets set ALLOWED_ORIGINS=https://SEU_DOMINIO,http://localhost:5173
# se Pluggy:
# npx supabase secrets set PLUGGY_CLIENT_ID=... PLUGGY_CLIENT_SECRET=...

# 3) Edges
npx supabase functions deploy atlas-ai-chat
npx supabase functions deploy pluggy-proxy

# 4) Front
cd apps/web
# configure .env.local / Vercel env
npm run lint && npm run test && npm run build
```

Depois: smoke §Smoke Test Guide + checklist final.

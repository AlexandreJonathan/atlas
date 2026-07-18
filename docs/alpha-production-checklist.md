# Atlas — Checklist final de produção (Alpha)

Versão alvo: `0.9.6+` · Use junto com [`alpha-deploy.md`](./alpha-deploy.md).  
Marque cada item só após evidência (comando, screenshot ou log).

## Infra & Supabase

- [ ] Supabase conectado (`npx supabase projects list` + `link` OK; URL resolve DNS)
- [ ] Migrações aplicadas (`db push` ou SQL §2.1 de `deploy.md`)
- [ ] Auth Site URL + Redirect `/redefinir-senha` configurados
- [ ] Backups / PITR confirmados no Dashboard

## Edge Functions

- [ ] Edge `atlas-ai-chat` deployada
- [ ] Edge `pluggy-proxy` deployada
- [ ] `ALLOWED_ORIGINS` configurado (secret Supabase)
- [ ] `OPENAI_API_KEY` configurada (secret Supabase)
- [ ] Pluggy configurado (`PLUGGY_CLIENT_ID` + `PLUGGY_CLIENT_SECRET`) — ou explicitamente fora do Alpha (mock)

## Frontend

- [ ] `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` corretos
- [ ] Sentry configurado (`VITE_SENTRY_DSN`)
- [ ] Feature Flags corretas (`VITE_FF_OPENAI=true` se IA no Alpha; providers alinhados)
- [ ] Root Directory hospedagem = `apps/web`

## Qualidade

- [ ] Build OK (`cd apps/web && npm run build`)
- [ ] Tests OK (`cd apps/web && npm run test`)
- [ ] Lint OK (`cd apps/web && npm run lint`)
- [ ] Validador OK (`node scripts/validate-alpha-env.mjs --strict`)

## Smoke & observabilidade

- [ ] Smoke Test OK (login → dashboard → FDL → IA → opcional OF)
- [ ] Logs chegando (Dashboard Edge Functions)
- [ ] `request-id` funcionando (header/body Client ↔ Edge)
- [ ] Evento de teste visível no Sentry

## Go / No-Go

- [ ] **GO** — todos os itens acima marcados (Pluggy só se o Alpha incluir OF real)
- [ ] **NO-GO** — qualquer □ crítico aberto; não convidar usuários

Operador: _______________ Data: _______________

# Sprint 14 — Atlas v0.8 Release Candidate (Missão 15)

## Status: ✅ Concluída

## 1. Objetivo

Elevar a Atlas à primeira **Release Candidate apresentável** (`v0.8.0`), sem novas funcionalidades, sem alterar regras de negócio, banco ou autenticação.

Documento de release: [`roadmap/release-v0.8.md`](./release-v0.8.md).

## 2. Escopo implementado

### Consistência visual (DS)
- Utilitários `.atlas-surface` e `.atlas-link` em `index.css`
- Tokens de shell / focus / ícones em `tokens.css`
- Painéis da Home, Insights e Feed alinhados a radius, borda e shadow do Card
- StatCard, Input (disabled/focus), Bottom Nav com altura por token
- Títulos e WealthHero com escala tipográfica do DS
- Auth: links unificados na cor brand

### UX / microinterações
- Loading copy mais curta e consistente no hub Open Finance e Insights
- Sync do hub desabilitado enquanto outra sync está em andamento
- Sem alteração de regras de negócio nem de contratos Mock/stub

### Performance
- `React.lazy` + `Suspense` para páginas autenticadas (Home, Contas, Connect, Connected, Investimentos, Atlas IA, Perfil)
- Auth permanece eager (primeiro paint do login)

### Documentação
- `roadmap/release-v0.8.md`
- Changelog + arquitetura atualizados
- Versão `0.8.0` em `apps/web/package.json`

## 3. Fora de escopo
- OpenAI / Pluggy HTTP
- Schema Supabase / auth
- Novos produtos ou telas

## 4. Validação
- [x] `npm run lint`
- [x] `npm run build`
- [x] Push `main` → deploy Vercel

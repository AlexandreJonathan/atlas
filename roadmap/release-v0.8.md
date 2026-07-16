# Atlas v0.8 — Release Candidate

**Status:** Release Candidate (primeira versão apresentável)  
**Versão do app:** `0.8.1` (patch Perfection sobre RC `0.8.0`)  
**Data de corte:** 2026-07-16 (RC); polish 2026-07-16 (Sprint 15)  
**Missão:** 15 (RC) + Sprint 15 Perfection  

## 1. O que é esta RC

A Atlas v0.8 é o consolidado de produto **antes** de OpenAI real e Open Finance real (Pluggy HTTP). Não introduz funcionalidades novas de negócio: fecha qualidade visual, consistência de Design System, UX, microinterações, performance leve e documentação.

É a primeira versão considerada **apresentável** para demos, Alpha privado e validação de narrativa de produto.

## 2. O que entrou na versão (acumulado)

| Bloco | Sprint / Missão | Entrega |
|---|---|---|
| Auth + Alpha | Sprints 1–6 | Login, cadastro, recuperação de senha, onboarding, dados financeiros no Supabase |
| Design System | Sprint 7 | Tokens, `ui/`, identidade premium |
| Experience Engine / shell | Sprint 8 | AppShell + Bottom Nav (5 abas) |
| Home Premium | Sprint 9 | WealthHero, Pulse, sínteses mobile-first |
| Open Finance Foundation | Sprint 10 / M11 | Adapter/Provider, mock + stub Pluggy, hub `/contas` |
| Microinterações Premium | Sprint 11 / M12 | Som, money rain, toasts, AnimatedNumber, glow, sync |
| Atlas Intelligence 1.0 | Sprint 12 / M13 | Insight Engine, feed, Mock AI + stub OpenAI |
| UX Review | Missão 14 | `roadmap/ux-review-1.0.md` |
| Atlas Polish | Sprint 13 | Home simplificada, shell unificado, Atlas IA chat-first |
| Release Candidate | Sprint 14 / M15 | Consistência DS, lazy routes, polish final, este documento |
| Atlas Perfection | Sprint 15 | UI/UX 10.0 — shell, focus, motion, skeletons, a11y (sem features) |

## 3. Escopo da Missão 15 (somente qualidade)

### Feito
- Superfície padrão `.atlas-surface` e links `.atlas-link` alinhados ao DS
- Tokens de shell (`--atlas-bottom-nav-height`, focus ring, ícones)
- Cards/painéis da Home com radius/shadow/borda unificados
- Tipografia de títulos e hero alinhada aos tokens
- Inputs/StatCard/Bottom Nav com estados e sombras do DS
- Auth links na cor brand
- Copy de loading padronizada onde fazia atrito
- `React.lazy` + `Suspense` nas abas autenticadas (code-split por rota)
- Versão npm `0.8.0`
- Lint + build verdes

### Explicitamente fora
- Novas funcionalidades
- Mudança de regras de negócio
- Schema / migrations Supabase
- Autenticação
- Pluggy HTTP / OpenAI LLM reais

## 4. Superfícies do produto na RC

| Fluxo | Rota(s) | Estado na RC |
|---|---|---|
| Login / Cadastro / Recuperação | `/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha` | Pronto (Supabase Auth) |
| Onboarding | via `AppShell` | Pronto |
| Home | `/inicio` | Pronto (hierarquia Polish) |
| Contas / Open Finance | `/contas`, `/contas/conectar`, `/contas/conectadas` | Fundação mock |
| Investimentos | `/investimentos` | Mock apresentável |
| Atlas IA | `/atlas-ia` | Chat-first + Mock AI; feed sob demanda |
| Perfil | `/perfil` | Shell unificado |

## 5. Arquitetura (lembrete)

- **Open Finance:** UI → `OpenFinanceService` → `OpenFinanceProvider` (Mock ativo; Pluggy stub)
- **Intelligence:** UI → `AtlasIntelligenceService` → `AtlasAIProvider` (Mock ativo; OpenAI stub)
- **Microinterações:** `src/lib/microinteractions` (dispatch único)
- **UI:** tokens em `src/styles/tokens.css` + `src/components/ui/`

## 6. Validação

- [x] `npm run lint` (`apps/web`)
- [x] `npm run build` (`apps/web`)
- [x] Deploy Vercel a partir de `main` (pós-push desta RC)

## 7. Próximos passos (pós-RC)

Ordem sugerida — não fazem parte desta RC:

1. OpenAI real atrás do `AtlasAIProvider` (mesmo contrato)
2. Pluggy real atrás do `OpenFinanceProvider` (mesmo contrato)
3. Itens de produção do `roadmap/backlog.md` (segurança, tipagem gerada, etc.)

## 8. Referências

- [`changelog.md`](./changelog.md)
- [`arquitetura.md`](./arquitetura.md)
- [`ux-review-1.0.md`](./ux-review-1.0.md)
- [`sprint-13.md`](./sprint-13.md) (Polish)
- [`sprint-14.md`](./sprint-14.md) (esta RC)

# Sprint 13 — Atlas Polish (implementação da UX Review)

## Status: ✅ Concluída

## 1. Objetivo

Elevar a experiência da Atlas antes de OpenAI e Open Finance reais — **somente UX/UI**, sem novas funcionalidades.

Base: [`roadmap/ux-review-1.0.md`](./ux-review-1.0.md) (Missão 14 — revisão).

## 2. Escopo implementado

### Home simplificada
Ordem mental clara:
1. **Quanto tenho** — WealthHero + Pulse  
2. **O que preciso fazer** — QuickActions + BillsTimeline  
3. **O que aconteceu** — TransactionsPreview  
4. Insights (um único bloco) + metas/planejamento/teaser  
5. CTA leve para Atlas IA  

Removidos da Home: `AtlasIntelligencePanel` e `IntelligenceFeed` (feed fica só em `/atlas-ia`).

### Shell unificado
- Investimentos e Perfil usam a mesma coluna mobile (480 → 560 → 720) e eyebrow de página.
- Token `--atlas-bottom-nav-height`.
- Títulos de seção da Home em `lg`.
- Labels da nav: Investir / IA (cabem melhor).
- Perfil: removidos toggles “Em breve” que pareciam quebrados.
- Auth: links em cor brand (única).

### Atlas IA conversa-first
- Thread + composer com `Input` do Design System.
- Feed de atividade atrás do botão **Atividade** (não compete no primeiro viewport).
- Max-width alinhado à Home; altura com token da nav.

## 3. Fora de escopo
- OpenAI, Pluggy, schema, auth rules, novos produtos.

## 4. Validação
- [x] `npm run lint`
- [x] `npm run build`

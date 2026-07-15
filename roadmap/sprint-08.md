# Sprint 08 — Atlas Experience 2.0 (Nova Arquitetura do Aplicativo)

## Status: ✅ Concluída

## 1. Objetivo

Transformar a Atlas de uma página única (Dashboard monolítico) em um aplicativo com navegação por abas (Bottom Navigation), preparando a experiência para Open Finance, investimentos e IA real — **sem implementar** essas integrações nesta sprint. Escopo de navegação/UX/estrutura; nenhuma alteração de banco, RLS, autenticação ou regras de negócio dos hooks/engines existentes.

## 2. Escopo Implementado

### 2.1 Shell e navegação

- `src/components/layout/AppShell.tsx` + CSS: layout autenticado com `<Outlet />` e padding para a nav fixa; onboarding continua substituindo o app inteiro até concluir/adiar (mesma regra que vivia no `Dashboard`).
- `src/components/layout/BottomNavigation.tsx` + CSS: 5 abas oficiais — Início, Contas, Investimentos, Atlas IA, Perfil — com `NavLink`, ícones Lucide e `safe-area-inset-bottom`.
- Rotas em `App.tsx`: `/inicio`, `/contas`, `/investimentos`, `/atlas-ia`, `/perfil` (protegidas). `/` e `/dashboard` redirecionam para `/inicio`. Login/Cadastro/Redefinir senha passam a navegar para `/inicio`.

### 2.2 Home (`/inicio`)

- `src/pages/HomePage.tsx` substitui `Dashboard.tsx` (removido).
- Ordem: saudação personalizada (`saudacaoPorHorario` exportada de `atlasIntelligenceCopy.ts`) → patrimônio total (saldo real + investimentos mock) → saldo disponível → atalhos (Receita/Despesa/Conta/Metas) → Atlas Intelligence → próximas contas → metas → últimas movimentações → evolução financeira (`MiniBarChart` do mês) → planejamento + despesas fixas (acesso preservado).
- Logout movido para a aba Perfil.

### 2.3 Contas, Investimentos, Atlas IA, Perfil

- `AccountsPage` + `src/data/mockOpenFinance.ts` — bancos, cartões, contas e saldo consolidado simulados; badge "Open Finance em breve".
- `InvestmentsPage` + `src/data/mockInvestments.ts` — patrimônio, distribuição, rendimento, "Oportunidades para estudar"; disclaimer fixo **"A Atlas não vende investimentos."**
- `AtlasAIPage` + `src/data/mockAtlasAiChat.ts` — chat premium com mensagens simuladas e resposta mock ao enviar; sem LLM.
- `ProfilePage` — avatar (iniciais), nome, e-mail, plano Atlas Free, Segurança, Notificações/Configurações/Open Finance (em breve), Sair.

### 2.4 Microinterações (arquitetura apenas)

- `src/lib/microinteractions/`: tipos + `triggerMicrointeraction()` no-op. Sem sons, vibração ou animações nesta sprint.

## 3. Critérios de Aceite

- [x] Bottom Navigation com as 5 abas oficiais, cada uma com página própria.
- [x] Home redesenhada na ordem pedida; lógica financeira existente preservada.
- [x] Contas / Investimentos / Atlas IA / Perfil preparados com mocks e avisos claros.
- [x] Arquitetura de microinterações criada (no-op).
- [x] Sem alteração de banco, auth, Open Finance real ou IA real.
- [x] `npm run lint` e `npm run build` sem erros.
- [x] Documentação atualizada (`sprint-08`, arquitetura, changelog, backlog).

## 4. Validado

- `npm run lint`: ok.
- `npm run build`: ok (bundle ~613 kB JS minificado — aviso >500 kB pré-existente).

## 5. Itens Adiados

- Open Finance real, IA real, compra de investimentos.
- Implementação de `triggerMicrointeraction` (animação/som/haptic).
- Unificar hooks financeiros (hoje AppShell e HomePage podem buscar perfil/metas/despesas fixas em paralelo no primeiro load da Home) — candidato a Context/React Query.
- Code-splitting das páginas das abas via `React.lazy`.

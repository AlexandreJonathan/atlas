# Backlog — Atlas

Este documento lista funcionalidades e melhorias futuras planejadas para o Atlas, organizadas por área e priorização. Itens podem ser reorganizados entre sprints conforme necessidade do produto.

## Legenda de Prioridade

- 🔴 Alta — bloqueante para produção ou uso real
- 🟡 Média — importante, mas não bloqueante
- 🟢 Baixa — desejável, pode ser adiado

## 1. Autenticação e Segurança

- ✅ ~~Implementar backend de autenticação real~~ — concluído via Supabase Auth (substituiu o `localStorage` simulado da Sprint 1)
- ✅ ~~Substituir verificação via `localStorage` por tokens JWT com expiração~~ — sessão gerenciada pelo SDK do Supabase (`AuthContext`/`useAuth`)
- ✅ ~~Implementar hash de senha no backend~~ — gerenciado pelo Supabase Auth
- ✅ ~~Implementar refresh token e renovação automática de sessão~~ — gerenciado automaticamente pelo SDK do Supabase
- ✅ ~~Adicionar logout funcional~~ — botão "Sair" no Dashboard, via `signOut()`
- ✅ ~~Validação de formulário (e-mail válido, senha forte)~~ — `loginSchema`/`registerSchema` (zod)
- ✅ ~~Recuperação de senha ("Esqueci minha senha")~~ — concluído na Sprint 6 (`ForgotPassword.tsx`/`ResetPassword.tsx`, via Supabase Auth)
- ✅ ~~Fluxo de confirmação de e-mail com feedback claro~~ — concluído na Sprint 6 (`Register.tsx`/`Login.tsx`, com reenvio via `supabase.auth.resend`)
- 🟡 Política de senha mínima mais robusta (hoje apenas 6 caracteres, sem exigência de complexidade) — aceitável para Alpha privado/controlado, revisar antes de uma abertura mais ampla
- 🟡 Rate limiting/proteção contra brute-force no login — depende de configuração do projeto Supabase (fora do código da aplicação); confirmar manualmente antes do Alpha (ver `docs/deploy.md`)
- 🟢 Autenticação social (Google/GitHub)

## 2. Persistência de Dados

- ✅ ~~Criar backend/API para persistir movimentações financeiras (receitas e despesas)~~ — concluído na Sprint 3 (Supabase + RLS)
- 🔴 Persistir dados de usuário adicionais além do `user_metadata` do Supabase Auth (ex: tabela `profiles`, caso necessário)
- ✅ ~~Migrar estado local do `Dashboard.tsx` para consumo de API~~ — concluído na Sprint 3 (`useTransactions`)
- 🟡 Gerar tipos TypeScript a partir do schema do Supabase (`supabase gen types typescript`) e remover os casts manuais (`as TransactionRow`/`as BillRow`/`as GoalRow`/`as FinancialProfileRow`/`as FixedExpenseRow`) nos services
- 🟡 Criar tabela `goal_contributions` para histórico/auditoria individual de aportes (hoje só o valor acumulado `current_amount` é armazenado — Sprint 4)
- 🟡 Edição de despesas fixas (`fixed_expenses`) — hoje só criar/remover (Sprint 5, mesma limitação aceita para `bills`/`goals`)
- 🟢 Avaliar "dia de vencimento" nas despesas fixas caso se torne necessário distinguir despesas já pagas no mês das ainda pendentes (hoje o valor total é sempre considerado "a ocorrer")
- 🟢 Avaliar necessidade de cache de dados (React Query/TanStack Query) conforme o volume de dados crescer

## 3. Dashboard e Funcionalidades Financeiras

- ✅ ~~Implementar modal "Nova Despesa" (atualmente é apenas um `alert`)~~ — concluído na Sprint 3
- 🟡 Editar movimentações existentes (exclusão já implementada na Sprint 3)
- 🟡 Filtros de movimentações por período, tipo e categoria
- 🟡 Categorização de receitas e despesas (ex: alimentação, transporte, salário)
- 🟢 Gráficos de evolução financeira (mensal/anual)
- 🟢 Exportação de relatórios (PDF/CSV)
- ✅ ~~Metas financeiras e orçamento mensal~~ — metas concluídas na Sprint 4 (`goals`, `GoalsPanel`); orçamento mensal (limites de gasto por categoria) ainda não implementado
- 🟡 "Ver todas as contas" no `UpcomingBillsPanel` (hoje mostra só vencidas/vencendo em 7 dias; contas futuras distantes ou já pagas não aparecem)
- 🟡 Conversão automática de conta paga (`bills`) em movimentação (`transactions`) — hoje os domínios ficam desacoplados
- 🟡 Janela de "gastos do mês" (`receitasDoMes`/`despesasDoMes` em `useTransactions`) usa o prefixo `YYYY-MM` de `created_at`; revisitar com um corte de fuso horário mais preciso se necessário
- 🟡 Paginação ou filtro por período nas listagens (transações, contas, metas, despesas fixas) — hoje toda a lista é carregada de uma vez a cada acesso ao Dashboard; aceitável para o volume inicial de um Alpha privado, mas deve ser revisitado antes de um uso diário prolongado (a lista só cresce)

## 4. Inteligência e Recomendações (Sprint 4/5)

- 🔴 Implementar `aiRecommendationProvider` real (Supabase Edge Function + LLM), substituindo/complementando o motor de regras `recommendationEngine.ts` por trás do mesmo contrato `RecommendationProvider`
- 🟡 Ajustar/expandir as regras heurísticas atuais conforme feedback de uso real (hoje: saldo negativo, contas vencidas/próximas, gastos do mês acima da renda, metas quase concluídas, risco financeiro alto)
- 🔴 Implementar `aiPlanningProvider` real (Supabase Edge Function), substituindo/complementando o motor `planningEngine.ts` por trás do mesmo contrato `PlanningProvider` — usar o histórico real de transações para prever gastos variáveis (hoje o cálculo assume apenas despesas fixas/contas pendentes, sem prever gastos variáveis futuros)
- 🟡 Metas sem `targetDate` não entram no cálculo de "quanto precisa guardar" (`usePlanning`/`planningEngine.ts`) — avaliar uma forma de estimar ritmo mensal mesmo sem prazo definido

## 5. Qualidade e Testes

- 🔴 Configurar testes unitários (Vitest + React Testing Library) — inclui o motor `recommendationEngine.ts`, que é puro e fácil de testar sem mocks de rede
- 🟡 Configurar testes E2E (Playwright ou Cypress)
- 🟡 Configurar pipeline de CI (lint + build + testes em pull requests)
- 🟢 Configurar cobertura mínima de testes

## 6. Experiência do Usuário (UX/UI)

> **"Experiência do Usuário, Responsividade e Deploy"**: escopo original planejado para o número "Sprint 5" (ver histórico em `roadmap/changelog.md`), reagendado quando a Sprint 5 passou a cobrir o "Planejamento Financeiro Inteligente" (mesmo precedente da Sprint 4). A responsividade e a preparação de deploy foram retomadas e concluídas na Sprint 6 (Alpha Readiness); os demais itens desta seção permanecem para uma sprint futura.

- ✅ ~~Tornar a aplicação responsiva (mobile-first)~~ — concluído na Sprint 6: Login/Cadastro/telas de senha/onboarding/Dashboard/painéis/listas/modais revisados entre 320px e 1920px. Recomenda-se, ainda assim, um teste manual em ao menos um dispositivo mobile real antes do Alpha (ver `docs/deploy.md`)
- 🟡 Criar design system consolidado (tokens de cor, tipografia, espaçamento)
- 🟡 Adicionar feedback visual de loading e erros nas requisições
- 🟢 Modo claro/escuro (dark mode) configurável pelo usuário
- ✅ ~~Acessibilidade (ARIA, navegação por teclado, contraste) — estender `aria-label` para `Login.tsx`/`Register.tsx`~~ — concluído na Auto Code Review da Missão Alpha Ready: modais e o wizard de onboarding já possuem `role="dialog"`/`aria-modal`; `ProgressBar` e a barra de progresso do onboarding usam `role="progressbar"`; severidade sempre com ícone+texto (`SeverityBadge`); `Login.tsx`/`Register.tsx` passaram a ter `aria-label` em todos os campos, no mesmo padrão já usado pelo restante da aplicação
- 🟢 Revisar contraste de cores (WCAG AA) de forma sistemática — hoje os tons foram escolhidos visualmente, sem auditoria formal de contraste
- 🟡 Permitir revisitar/editar manualmente os dados coletados no onboarding (hoje só é possível pelos painéis normais do Dashboard após concluído — funcional, mas sem um link direto de volta ao wizard)

## 7. Infraestrutura e DevOps

- ✅ ~~Documentar variáveis de ambiente e checklist de deploy~~ — concluído na Sprint 6 (`docs/deploy.md`: migrações, configuração de Auth no Supabase, variáveis de ambiente, build, hospedagem)
- ✅ ~~Preparar configuração explícita de deploy para Vercel (SPA fallback, cache)~~ — concluído na Missão Primeiro Deploy Oficial (`apps/web/vercel.json`); guia não-técnico passo a passo criado em `docs/guia-deploy-fundador.md`
- 🟡 Configurar deploy automatizado (CI/CD publicando em Vercel/Netlify a cada merge) — hoje o deploy é manual, seguindo o checklist de `docs/deploy.md`/`docs/guia-deploy-fundador.md`
- 🔴 Monitoramento de erros em produção (Sentry ou similar) — recomendado como próximo passo antes de convidar os primeiros usuários reais (elevado de 🟢 para 🔴 após a Auditoria de Produto: sem isso, falhas em uso diário não geram nenhum alerta)
- 🟢 Observabilidade e métricas de uso

## 8.1 Limpeza de Código Morto (identificado na FAT)

- 🟢 `App.css` mantém um bloco de classes de uma landing page antiga (`.hero`, `.header`, `nav`, `.actions`, `.btn-login`, `.btn-primary`, `.tag`, `.hero-button`) não utilizado por nenhum componente atual — inofensivo (já sobrescrito onde colide com estilos reais), mas deve ser removido na próxima refatoração de estilos para reduzir confusão.
- 🟢 `public/icons.svg` não é referenciado por nenhum componente — avaliar remoção ou uso futuro.

## 8. Estado Global e Arquitetura de Front-end

- 🟡 Avaliar necessidade de gerenciador de estado global (Context API, Zustand ou Redux) à medida que a aplicação cresce
- 🟢 Introduzir camada de cache de dados (React Query / TanStack Query) — mitigaria a necessidade atual de repassar `useTransactions`/`useBills`/`useGoals`/`useFinancialProfile`/`useFixedExpenses` como props a partir de `Dashboard.tsx` para evitar buscas duplicadas
- 🟢 `npm run build` alerta que o bundle único (`index-*.js`) já passa de 500 kB minificado; avaliar code-splitting (ex: `React.lazy` nos modais `TransactionModal`/`BillModal`/`GoalModal`/`FinancialProfileModal`/`FixedExpenseModal`, carregados só quando abertos) quando o crescimento da aplicação justificar

---

> Este backlog é vivo e deve ser revisado ao final de cada sprint, incorporando novos itens identificados e reclassificando prioridades conforme o aprendizado do time.

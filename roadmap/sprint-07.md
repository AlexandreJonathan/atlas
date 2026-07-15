# Sprint 07 — Atlas Premium Experience (Design System + Dashboard 2.0)

## Status: ✅ Concluída

## 1. Objetivo

Transformar a experiência visual da Atlas em um produto de nível premium ("sentir que está usando um produto de uma grande fintech"), através de um Design System oficial e do redesenho completo de Auth, Onboarding, Dashboard e da nova identidade "Atlas Intelligence" — **sem alterar nenhuma regra de negócio, banco de dados, autenticação, Open Finance ou lógica existente**. Escopo exclusivamente de UX/UI.

## 2. Escopo Implementado

### 2.1 Design System (Fase 1)

- `src/styles/tokens.css` (novo, importado uma única vez em `main.tsx`): cor (superfícies, texto, marca, semânticas), tipografia (`Inter Variable`, escala, pesos), espaçamento (escala de 4px), radius, sombra (glow suave para tema escuro) e motion — todos como CSS custom properties, respeitando `prefers-reduced-motion`.
- Novas dependências: `lucide-react` (ícones SVG tree-shakeable, substituem os ~15 emojis usados como "ícone" antes desta sprint) e `@fontsource-variable/inter` (fonte self-hosted, sem chamada externa a CDN).
- Nova pasta `src/components/ui/`: `Button`, `Card`, `Input`, `Modal`, `Badge`, `ProgressBar` (migrado), `ProgressRing` (novo), `MiniBarChart` (novo — substitui o conceito de "Sparkline" original do plano: como os dados disponíveis são agregados mensais, não uma série temporal diária, um gráfico de barras comparativo é o que reflete os dados reais sem inventar histórico), `StatCard`, `AtlasLogo`. Todas as classes usam o prefixo `atlas-` para diferenciar claramente do CSS legado durante a migração.
- `roadmap/design-system.md` (novo): documentação completa da paleta, tipografia, espaçamento, radius, sombra, motion e da API de cada componente.
- `SeverityBadge.tsx` e `AsyncStateView.tsx` mantidos (mesma API pública usada pelo resto da aplicação), porém reescritos por dentro: `SeverityBadge` passou a ser um wrapper fino sobre `Badge` (ícones em vez de emoji); `AsyncStateView` ganhou um skeleton com efeito shimmer no estado de carregamento.

### 2.2 Redesenho de Auth e Onboarding (Fase 2)

- Novo `AuthLayout.tsx`/`.css`: elimina a duplicação que existia entre `Login`/`Register`/`ForgotPassword`/`ResetPassword` (todos compartilhavam a mesma estrutura de card via CSS solto em `App.css`).
- `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`: migrados para `AuthLayout` + `Input`/`Button` do Design System, com ícones (`Mail`/`Lock`/`User`). 100% da lógica de formulário (`react-hook-form` + `zod`), mensagens de erro/sucesso e `aria-label` preservados.
- `App.css`: removido por completo — o bloco morto de landing page (`.hero`, `.btn-login`, `.btn-primary`, etc., já identificado como código morto na FAT) foi eliminado, e as classes ainda em uso (`.campo`, `.erro-campo`, `.erro-geral`, `.mensagem-sucesso`, `.link-botao`) foram migradas para `AuthLayout.css` (com o prefixo `atlas-`) antes da remoção do arquivo.
- `OnboardingWizard.tsx` + os 6 passos: reescritos com `Card`, `Button`, `Input`, `ProgressBar` (reaproveitado do Design System) e um ícone por passo (`Sparkles`, `Wallet`, `ShieldCheck`, `Receipt`, `Target`, `CheckCircle2`). Toda a lógica de navegação, persistência de progresso e o guard "passo 3 sem renda → volta ao passo 2" (corrigido na FAT) permanecem intactos.

### 2.3 Dashboard 2.0 (Fase 3)

- `Dashboard.tsx`: reorganizado com cabeçalho (logo + saudação personalizada com o nome do usuário, quando disponível em `user_metadata` + prévia em uma linha do resumo gerado pela Atlas Intelligence) e um `<main>` com hierarquia clara: Atlas Intelligence → resumo financeiro → planejamento → grade de painéis → movimentações recentes.
- `FinancialSummaryCards.tsx`: os 4 cards simples (título + valor) foram substituídos por `StatCard` (ícone + tom semântico) e ganharam um `MiniBarChart` comparando receitas x despesas do mês (dado já calculado por `useFinancialSummary`, sem nova busca).
- `PlanningPanel.tsx`: ganhou um `ProgressRing` (saúde financeira do mês, mesma comparação saldo-previsto/reserva-mínima que já define o `risco` em `planningEngine.ts` — só uma nova visualização do dado existente) e `StatCard`s no lugar dos cards simples.
- `Dashboard.css`: reduzido de ~570 para ~110 linhas — a maior parte do visual agora vive em `components/ui/*.css` e no novo `Panels.css` compartilhado.

### 2.4 Painéis, listas e modais (parte da Fase 3/5)

- Novo `src/components/Panels.css`: estilos compartilhados de cabeçalho de painel e linhas de lista, usado por `PlanningPanel`, `UpcomingBillsPanel`, `GoalsPanel`, `FixedExpensesPanel`, `TransactionsList`, `BillsList`, `GoalsList`, `FixedExpensesList` — evita repetir a mesma folha de estilo em 8 arquivos.
- Os 4 painéis migrados para `Card` + `Button` + ícone por domínio (`CalendarClock`, `Target`, `Receipt`, `BarChart3`).
- As 4 listas migradas para linhas com ícone por tipo (receita/despesa via `ArrowUpRight`/`ArrowDownLeft`, conta via mesma lógica, despesa fixa via `Receipt`, meta via `Target`), hover state e entrada em stagger sutil (`animation-delay` por item, CSS puro).
- Os 5 modais (`TransactionModal`, `BillModal`, `GoalModal`, `FinancialProfileModal`, `FixedExpenseModal`) migrados para o novo `Modal` compartilhado (`src/components/ui/Modal.tsx`) — elimina a duplicação do shell overlay/card/`role="dialog"`/listener de tecla `Esc` que existia em cada um dos 5 arquivos; agora cada modal só contém seus campos específicos (`Input`) e ações (`Button`).

### 2.5 Atlas Intelligence (Fase 4)

- `RecommendationsPanel.tsx` → renomeado para `AtlasIntelligencePanel.tsx`: tratamento visual de destaque (gradiente sutil, `box-shadow` de glow de marca, ícone de "cérebro" — `BrainCircuit` — com uma pulsação sutil).
- Nova `src/lib/atlasIntelligenceCopy.ts`: função pura `gerarAtlasIntelligenceCopy(recomendacoes, agora?)` que recebe o `Recommendation[]` já calculado por `useRecommendations`/`recommendationEngine.ts` e gera apenas texto de apresentação — saudação por horário do dia ("Bom dia"/"Boa tarde"/"Boa noite") e uma frase-resumo ("Hoje encontrei N oportunidade(s) para melhorar sua vida financeira", com variação para quando não há pendências ou não há recomendação alguma). **Nenhuma regra de negócio nova** — é uma transformação de apresentação sobre um dado que o motor já calcula.
- `Dashboard.tsx` usa a mesma função para exibir uma prévia de uma linha no cabeçalho, e o `AtlasIntelligencePanel` exibe a versão completa (saudação + resumo + lista de recomendações com `Badge`).

### 2.6 Consolidação (Fase 5)

- Auditados e confirmados: todos os botões usam `Button`, todos os modais usam `Modal`, todos os inputs de formulário usam `Input`, todos os painéis usam `Card` — nenhuma classe CSS de botão/card/modal/input duplicada remanescente (verificado por busca textual de `className="painel"`, `className="modal"`, `className="card"`, `className="cards"`, etc. — zero ocorrências fora de `components/ui/`/`Panels.css`).
- Código morto removido: `App.css` (bloco de landing page + classes migradas), `public/icons.svg` (nunca referenciado, já identificado na FAT).
- Nenhum emoji restante como "ícone" em nenhum componente (confirmado por busca).

## 3. Critérios de Aceite

- [x] Design System documentado (`roadmap/design-system.md`) com tokens e API de cada componente reutilizável.
- [x] Login, Cadastro, Recuperação de senha e Onboarding redesenhados sem alterar nenhuma validação, navegação ou chamada ao Supabase Auth.
- [x] Dashboard reorganizado com hierarquia visual clara, cards premium e ao menos um gráfico leve (SVG/CSS puro) usando dados já existentes.
- [x] Seção "Atlas Intelligence" com identidade visual própria e texto conversacional gerado a partir das recomendações já calculadas.
- [x] Nenhuma duplicação remanescente de botão/card/input/modal fora de `components/ui/`.
- [x] Nenhuma alteração de regra de negócio, schema de banco, RLS ou fluxo de autenticação.
- [x] `npm run lint` e `npm run build` executam sem erros.
- [x] Responsividade 320px–1920px preservada em todas as telas redesenhadas.

## 4. Auto Code Review

- `npm run lint`: sem erros/avisos em todo o código novo e migrado.
- `npm run build`: build de produção concluído com sucesso; bundle JS foi de 587 kB para ~599 kB minificado (aviso de chunk >500 kB já existente antes desta sprint, não agravado de forma relevante — `lucide-react` é tree-shakeable e só os ícones de fato usados entram no bundle; a fonte `Inter Variable` é servida como `.woff2` estático, fora do bundle JS).
- Verificado manualmente: nenhum emoji remanescente como ícone; nenhuma classe legada (`painel`, `modal`, `card`, `cards`, `btn-*`, `campo`, `erro-*`) fora de `components/ui/`/`Panels.css`; `App.css` e `public/icons.svg` removidos sem quebrar nenhuma tela.

## 5. Itens Adiados (registrados no backlog)

- Tema claro/alternância dark-light — a Atlas hoje é 100% tema escuro por decisão desta sprint (evolução da paleta navy já existente).
- Auditoria formal de contraste WCAG AA com a nova paleta — os tons foram escolhidos visualmente, sem verificação automatizada de contraste ainda.
- Code-splitting dos modais/`OnboardingWizard` via `React.lazy` — aviso de bundle >500 kB já existia antes desta sprint e continua não bloqueante; oportunidade natural agora que os 5 modais compartilham o mesmo `Modal.tsx`.

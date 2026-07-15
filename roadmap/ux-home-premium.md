# Missão 06 — Atlas Premium Home (UX First)

**Status:** ✅ Aprovada e implementada (Sprint 9)  
**Escopo desta missão original:** documento de UX e arquitetura. Implementação concluída na Sprint 9.  
**Referências de qualidade (não copiar identidade):** Nubank, C6 Bank, Inter, Revolut, Apple Wallet, Linear.

---

## ETAPA 1 — Análise crítica da Home atual

Fonte analisada: [`apps/web/src/pages/HomePage.tsx`](../apps/web/src/pages/HomePage.tsx) + CSS, painéis reutilizados (`AtlasIntelligencePanel`, `UpcomingBillsPanel`, `GoalsPanel`, `PlanningPanel`, `FixedExpensesPanel`, `TransactionsList`), tokens do Design System.

### Fluxo atual (de cima para baixo)

1. Saudação + resumo da Intelligence (texto)
2. Dois `StatCard` lado a lado (patrimônio / saldo)
3. Quatro botões de atalho (texto longo)
4. Atlas Intelligence (card completo + lista)
5. Contas a vencer (painel CRUD completo)
6. Metas (painel CRUD completo)
7. Últimas movimentações (lista completa)
8. Evolução financeira (`MiniBarChart` receitas × despesas)
9. Planejamento (painel completo)
10. Despesas fixas (painel CRUD completo)
11. Bottom Navigation (global)

### O que parece amador

- **Empilhamento de “painéis de admin”**: a Home parece um dashboard interno (CRUD + listas + formulários embutidos), não um produto de consumo. Metas, contas e despesas fixas expõem botões “+ Nova…”, “Remover”, inputs de aporte — linguagem de backoffice.
- **Atalhos como botões de formulário**: textos longos (“Adicionar Receita”) em grade 4→2→1; em mobile vira coluna de CTAs pesados, sem o padrão fintech de ícone circular + label curta.
- **Patrimônio com asterisco de mock**: o hint “Saldo + investimentos simulados” quebra confiança no primeiro olhar — fintechs premium não anunciam simulação no hero.
- **Duplicação de mensagem**: a saudação no header e o card Atlas Intelligence repetem o mesmo resumo conversacional (`atlasCopy` / `gerarAtlasIntelligenceCopy`).
- **Evolução financeira fraca**: duas barras horizontais (“Receitas” / “Despesas”) sem narrativa temporal — parece um widget incompleto, não “evolução”.
- **Lista infinita na Home**: `TransactionsList` completa com remoção compete com o scroll e dilui o foco; Home deveria ser síntese, não extrato.

### O que parece simples (não premium)

- Header só tipográfico: sem marca, sem avatar, sem “hoje”, sem contexto visual.
- Dois cards iguais em peso visual (patrimônio e saldo) — sem hero dominante.
- Cards com borda sutil + ícone colorido: correto tecnicamente, mas **homogêneos demais**; nenhuma superfície “wallet” / full-bleed.
- Espaçamento uniforme (`gap: 24px`) entre blocos de importância muito diferente — falta respiração e ritmo (grandes vazios vs. agrupamentos densos).
- Tipografia financeira no `StatCard` usa `--font-size-2xl` (24px): em fintechs o valor principal costuma ser bem maior (display).

### O que gera pouco impacto

- Intelligence parece “mais um card na fila”, não o cérebro do produto (exceto o glow, que compete com volume de lista abaixo).
- Planejamento e despesas fixas no final: usuário médio não chega lá; quem chega encontra outro CRUD.
- Não há **próxima ação óbvia** (ex.: “sua conta vence amanhã”) no primeiro viewport — só números genéricos.
- Não há **sensação de progresso** (metas/reserva) no primeiro olhar.
- Bottom nav existe, mas a Home não dialoga com as outras abas (sem teaser de Investimentos / Contas / Atlas IA).

### O que já transmite sensação premium (preservar)

- Tema escuro + tokens consistentes (`tokens.css`).
- Inter Variable + `tabular-nums`.
- Atlas Intelligence: eyebrow, glow de marca, ícone com pulse (respeita `prefers-reduced-motion`).
- Componentes `Card` / `StatCard` / `Badge` / `ProgressRing` / `ProgressBar` já com linguagem fintech.
- Bottom Navigation com estado ativo claro.
- Microcopy de saudação por horário (Bom dia / Boa tarde / Boa noite).

### O que deve ser removido da Home (ou rebaixado)

| Remover / rebaixar | Motivo |
|---|---|
| CRUD completo de Despesas fixas | Pertence a Planejamento / Perfil / fluxo de configuração — não ao primeiro scroll |
| Lista completa de movimentações com “Remover” | Extrato vive melhor como “ver todas” → detalhe; Home mostra 3–5 itens |
| Hint “investimentos simulados” no hero | Quebra confiança; disclaimer só em Investimentos |
| Resumo Intelligence duplicado no header | Uma voz só — no bloco Intelligence |
| Botões de atalho com texto longo | Substituir por quick actions icônicas |
| Painel de Metas em modo “gestão total” | Home = progresso + CTA; gestão no próprio painel compacto ou modal |

### O que deve ser reorganizado

1. **Hero financeiro único** (patrimônio protagonista; saldo como secundário).
2. **Atalhos** logo após o hero (padrão mental: “ver → agir”).
3. **Atlas Intelligence** como protagonista narrativo (logo abaixo dos atalhos).
4. **Timeline do dia/semana** (contas + eventos), não painel CRUD de contas.
5. **Metas** como anéis/progresso visual, não lista administrativa.
6. **Teaser de Investimentos** (ponte para a aba), não mock misturado no patrimônio sem contexto.
7. **Planejamento** compacto (1 insight + ring), não card de 4 métricas + modal.
8. **Movimentações** no fim, resumidas; Evolução como gráfico no hero ou junto ao planejamento — nunca “duas barras” órfãs no meio.

### O que falta

- Composição de **primeiro viewport** (brand + um número dominante + uma frase + CTAs).
- Hierarquia tipográfica de **display** para dinheiro.
- Superfície estilo **carteira** (gradiente sutil / depth) sem copiar Nubank roxo.
- **Quick actions** circulares.
- **Timeline** de compromissos (vencimentos), não só lista de bills.
- Teasers de outras abas (Investimentos, Atlas IA).
- Estados vazios emocionais (“ainda sem metas — criar a primeira”).
- Entrada em cena com stagger intencional (já existe em listas; falta no hero).
- Uso da arquitetura `microinteractions` (hoje no-op) — pelo menos contrato visual de press/success.

---

## ETAPA 2 — Proposta completa da nova Home

### Princípio norteador

> A Home não é um dashboard de gestão.  
> É o **painel do dia**: quanto eu tenho, o que a Atlas me diz, o que vence, para onde estou indo — e atalhos para agir em 2 toques.

Identidade Atlas (própria):

- Escuro navy profundo (já existe) + accent indigo/violeta `#5B5FEF`.
- Inteligência como “luz” (glow pontual), não como chatbot genérico na Home.
- Números grandes, pouco texto, muito espaço negativo.
- Evitar: roxo Nubank, laranja Inter, verde C6, glassmorphism exagerado, pills neon.

### Estrutura proposta (ordem)

1. **Header leve** — saudação + avatar (iniciais) → Perfil  
2. **Hero Financeiro** — patrimônio display + saldo secundário + mini tendência do mês  
3. **Quick Actions** — 4 ações icônicas  
4. **Atlas Intelligence** — 1 frase + até 2 insights (link “Abrir Atlas IA”)  
5. **Timeline** — próximas contas / compromissos (máx. 3)  
6. **Metas em foco** — até 2 metas com progresso visual  
7. **Investimentos (teaser)** — patrimônio investido + CTA para aba  
8. **Planejamento (resumo)** — “quanto posso gastar hoje” + ring de saúde  
9. **Últimas movimentações** — 5 itens + “Ver todas” (sem remover na Home)  
10. **Bottom Navigation** (inalterada em função)

**Fora da Home (não destruir lógica):** Despesas fixas permanecem acessíveis via Planejamento (modal/expand) ou Perfil/config — não como bloco CRUD na Home.

### Hierarquia visual

| Nível | Elemento | Tamanho / peso |
|---|---|---|
| 1 | Valor do patrimônio | `--font-size-4xl` (ou 3xl no mobile), weight bold, `tabular-nums` |
| 2 | Saudação / frase Intelligence | `--font-size-lg`–`xl` |
| 3 | Saldo disponível, “posso gastar” | `--font-size-xl` |
| 4 | Labels, datas, listas | `--font-size-sm` |
| 5 | Eyebrows, captions | `--font-size-xs`, uppercase tracking |

Um único ponto de brilho de marca por viewport: o bloco Intelligence **ou** o anel do hero — não ambos competindo.

### Componentes (novos vs. reuso)

| Bloco | Reuso | Novo (só UX nesta proposta) |
|---|---|---|
| Header | `saudacaoPorHorario`, avatar estilo Perfil | `HomeHeader` |
| Hero | tokens, `MiniBarChart` ou spark interno | `WealthHero` (superfície premium) |
| Atalhos | abre modais existentes | `QuickActions` (ícone + label curta) |
| Intelligence | `gerarAtlasIntelligenceCopy`, recomendações | `IntelligenceBrief` (versão compacta; painel atual vira detalhe na aba) |
| Timeline | dados de `useBills` | `BillsTimeline` (somente leitura + “marcar paga”) |
| Metas | `ProgressRing` / `ProgressBar`, `useGoals` | `GoalsFocus` (máx. 2) |
| Investimentos | `MOCK_INVESTMENTS` | `InvestmentsTeaser` |
| Planejamento | `usePlanning`, `ProgressRing` | `PlanningSnapshot` |
| Movimentações | `TransactionsList` filtrada | prop `limit` / variante compacta |
| Despesas fixas | — | **não renderizar** na Home; link em PlanningSnapshot |

### Espaçamento

- Página: padding horizontal `--space-5` mobile / `--space-7` desktop; max-width ~480–560px **mobile-first** (app feel), expandindo a 720px em tablet — evitar “site largo de 1100px” que dilui o produto.
- Entre seções principais: `--space-8` (40px); dentro de um card: `--space-4`–`--space-5`.
- Hero: padding interno generoso (`--space-7`), margin-bottom `--space-7`.
- Quick actions: gap `--space-4`, área de toque ≥ 44px.

### Cards

- **Hero**: superfície elevada, radius `--radius-xl`, gradiente sutil canvas→elevated, **sem** borda forte; sombra `--shadow-md` + glow muito leve.
- **Seções**: `Card` elevated padrão; seções com título “eyebrow + ação à direita” (padrão Linear).
- Evitar grid 3 colunas de painéis CRUD na Home (era o Dashboard antigo).

### Cores

- Manter tokens atuais.
- Hero valor neutro/branco; variação positiva/negativa só no saldo e no delta do mês.
- Intelligence: manter soft brand + glow.
- Timeline: tom de severidade só no badge (já existe), não no fundo inteiro do card.

### Gráficos

- No Hero: **spark/delta do mês** (receitas − despesas ou barras mini) — dados reais de `useFinancialSummary`, sem inventar histórico.
- Remover seção isolada “Evolução financeira” com só 2 barras; integrar no Hero ou no PlanningSnapshot.
- Metas: `ProgressRing` (já existe) — mais “Apple Wallet / goal” do que barra sozinha.

### Tipografia

- Display financeiro no Hero.
- Labels sempre secondary; valores always `tabular-nums`.
- Menos títulos `h2` genéricos (“Últimas movimentações”) — preferir eyebrow + título curto (“Recentes”).

### Animações e microinterações

- Entrada: fade + translateY 8px no Hero e nas seções (stagger 40–60ms), respeitando `prefers-reduced-motion`.
- Quick action press: scale 0.96 (`--duration-fast`).
- Intelligence: manter pulse suave no ícone (já existe).
- Sucesso ao salvar modal: chamar `triggerMicrointeraction('success')` (ainda no-op, mas amarra a arquitetura Sprint 8).
- **Não** celebrar com confetti nesta missão de implementação futura, a menos que o plano técnico aprove — só preparar o gancho.

### Justificativas condensadas

| Decisão | Por quê |
|---|---|
| Hero único dominante | Fintechs premium abrem com “seu dinheiro”, não com grid de KPIs |
| Quick actions icônicas | Reduz carga cognitiva; padrão Revolut/Nubank |
| Intelligence compacta + deep link | Protagonismo sem virar feed de alertas |
| Timeline máx. 3 | Urgência > inventário |
| Teaser Investimentos | Conecta abas; Home deixa de ser silo |
| Tirar despesas fixas da Home | Menos ruído; lógica permanece no app |
| Coluna estreita mobile-first | Sente app, não planilha web |

---

## ETAPA 3 — Wireframe textual

```
┌─────────────────────────────────────┐
│  Bom dia, Alexandre.          (AJ)  │  ← HomeHeader (avatar → /perfil)
├─────────────────────────────────────┤
│                                     │
│         PATRIMÔNIO TOTAL            │
│         R$ 12.430,50                │  ← WealthHero (display)
│         Saldo disponível R$ …       │
│         ▁▃▅ Month delta / mini bars │
│                                     │
├─────────────────────────────────────┤
│   (＋)    (－)    (📄)    (◎)       │  ← QuickActions
│  Receita Despesa Conta   Meta       │
├─────────────────────────────────────┤
│  ✦ ATLAS INTELLIGENCE               │
│  “Hoje encontrei 2 oportunidades…”  │  ← IntelligenceBrief
│  [insight] [insight]                │
│              Abrir Atlas IA →       │
├─────────────────────────────────────┤
│  HOJE E PRÓXIMOS                    │  ← BillsTimeline
│  • Luz  · amanhã · R$ 180  [Pagar]  │
│  • Aluguel · 20/07 · R$ 1.200       │
│  • …                                │
│              Ver contas →           │
├─────────────────────────────────────┤
│  METAS                              │  ← GoalsFocus
│  [○ 62%] Viagem   [○ 20%] Reserva   │
│              Nova meta / ver todas  │
├─────────────────────────────────────┤
│  INVESTIMENTOS                      │  ← InvestmentsTeaser
│  R$ 12.500 investidos  ·  +0,82%    │
│  A Atlas não vende investimentos.   │
│              Ver investimentos →    │
├─────────────────────────────────────┤
│  PLANEJAMENTO                       │  ← PlanningSnapshot
│  Posso gastar hoje  R$ …   (ring)   │
│  Risco: Atenção                     │
│         Ajustar renda / reserva →   │
├─────────────────────────────────────┤
│  RECENTES                           │  ← TransactionsPreview
│  ↑ Salário     +3.000               │
│  ↓ Mercado       -84                │
│  …                                  │
│              Ver todas →            │
├─────────────────────────────────────┤
│ Início  Contas  Invest.  IA  Perfil │  ← BottomNavigation
└─────────────────────────────────────┘
```

---

## ETAPA 4 — Como cada bloco melhora a experiência

| Bloco | Melhora |
|---|---|
| **HomeHeader** | Reconhece a pessoa; acesso rápido ao Perfil sem “Sair” na Home; remove duplicação com Intelligence |
| **WealthHero** | Resposta imediata a “quanto eu tenho?”; emocionalmente o produto “vale a pena abrir” |
| **QuickActions** | Reduz atrito para o hábito diário (registrar / pagar / meta) em um toque |
| **IntelligenceBrief** | Mantém a Atlas como conselheira sem poluir; CTA para a aba IA aumenta retenção da nova arquitetura |
| **BillsTimeline** | Transforma “lista de bills” em **agenda financeira** — urgência e clareza |
| **GoalsFocus** | Motiva com progresso visual; evita sobrecarga de gestão |
| **InvestmentsTeaser** | Educa + navega; reforça disclaimer sem contaminar o hero |
| **PlanningSnapshot** | Entrega o insight mais útil do motor de planejamento (“posso gastar hoje”) sem exigir scroll infinito |
| **TransactionsPreview** | Confirma atividade recente; extrato completo deixa de competir com a narrativa da Home |
| **Bottom Nav** | Âncora do app; Home deixa de tentar ser todas as abas |

---

## ETAPA 5 — Plano técnico (rascunho — executar só após aprovação UX)

> Este plano **não deve ser implementado** até a proposta das Etapas 1–4 ser aprovada.  
> Commits pequenos, sem alterar banco/auth/engines; só apresentação e composição da Home.

### Princípios de implementação

- Reusar hooks existentes (`useTransactions`, `useBills`, `useGoals`, `usePlanning`, `useRecommendations`, `useFinancialSummary`).
- Não inventar série histórica; gráficos só com dados agregados já disponíveis.
- Disclaimer de investimentos **só** no teaser / aba Investimentos.
- Despesas fixas: remover da Home; garantir acesso via `PlanningSnapshot` → painel/modal já existente ou link interno.

### Commits sugeridos

1. **`feat(home): WealthHero + HomeHeader`** — layout do primeiro viewport; tipografia display; sem mudar dados.
2. **`feat(home): QuickActions icônicas`** — substitui grade de botões longos; mesmos modais.
3. **`feat(home): IntelligenceBrief compacto`** — extrai variante compacta; link para `/atlas-ia`; remove resumo duplicado do header.
4. **`feat(home): BillsTimeline`** — preview de até 3 contas; ações marcar paga / ver mais.
5. **`feat(home): GoalsFocus + InvestmentsTeaser + PlanningSnapshot`** — blocos médios; remove `FixedExpensesPanel` da Home.
6. **`feat(home): TransactionsPreview`** — limite 5; remove seção “Evolução” isolada (integrada no Hero).
7. **`chore(home): polish motion + microinteraction hooks`** — stagger / press; `triggerMicrointeraction` nos saves.
8. **`docs: sprint-09 / changelog`** — documentar Home Premium após lint/build.

### Critérios de aceite (pós-aprovação)

- [ ] Primeiro viewport: saudação + patrimônio dominante + saldo + quick actions (sem scroll em mobile médio ~700px altura útil, na medida do possível).
- [ ] Nenhuma lista CRUD completa (despesas fixas / extrato com remover) na Home.
- [ ] Intelligence não duplica texto do header.
- [ ] Teaser de investimentos com disclaimer.
- [ ] `npm run lint` + `npm run build` ok.
- [ ] Lógica de negócio intacta.

### Fora de escopo (mesmo após aprovação desta UX)

- Open Finance real, IA real, novos schemas.
- Tema claro.
- Redesenho das outras abas (exceto deep links).
- Implementação real de som/vibração.

---

## Decisão pedida ao fundador

Aprovar, rejeitar ou ajustar esta proposta (especialmente):

1. Coluna **mobile-first estreita** (~480–720px) vs. manter max-width 1100px tipo “desktop dashboard”.
2. Remover **Despesas fixas** da Home (acesso só via Planejamento).
3. Patrimônio **sem** hint de mock no hero (mock só no teaser/aba).

Após aprovação → iniciar Etapa 5 (implementação por commits).

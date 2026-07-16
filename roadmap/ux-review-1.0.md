# Missão 14 — Atlas UX/UI Review 1.0

**Status:** Relatório aprovado — polish implementado na Sprint 13  
**Data:** 16 de julho de 2026  
**Perspectiva:** Product Design + UX + UI + Design Systems + Fintech  
**Premissa:** amanhã a Atlas seria apresentada a investidores. O que ainda não transmite produto premium?  
**Follow-up:** itens de 1 dia (Home, shell, Atlas IA, nav, auth links) aplicados em `roadmap/sprint-13.md`.

Fontes analisadas: `apps/web/src` (telas, CSS, tokens), `roadmap/design-system.md`, arquitetura atual (Home Premium, Open Finance Foundation, Intelligence 1.0, Microinterações).

---

## Sumário executivo

A Atlas já **saiu do “CRUD financeiro”**. Auth, onboarding, WealthHero, Intelligence e microinterações passam um sinal de fintech moderna. Porém, o produto ainda **não sustenta a mesma qualidade em todas as abas**: a Home é densa demais no meio do scroll; Investimentos e Perfil parecem um shell administrativo mais largo; Atlas IA mistura feed + chat sem hierarquia de “app de conversa”; e o Design System é forte em tokens, mas **não é aplicado com a mesma disciplina** em todas as superfícies.

**Veredito para investidor:**  
> “Produto com visão e base premium, ainda inconsistente na execução. Os primeiros 10 segundos impressionam; os próximos 60 revelam MVP.”

**Nota UX geral: 7.2 / 10**

---

## ETAPA 1 — Mapa das telas analisadas

| Superfície | Rota / contexto | Arquivos-chave |
|---|---|---|
| Login | `/login` | `Login.tsx`, `AuthLayout` |
| Cadastro | `/cadastro` | `Register.tsx`, `AuthLayout` |
| Recuperação de senha | `/esqueci-senha`, `/redefinir-senha` | Forgot/Reset + AuthLayout |
| Onboarding | AppShell (primeiro acesso) | `OnboardingWizard` + steps |
| Home | `/inicio` | `HomePage` + `components/home/*` + Insights/Feed |
| Contas | `/contas`, `/contas/conectar`, `/contas/conectadas` | Open Finance hub |
| Investimentos | `/investimentos` | `InvestmentsPage` |
| Atlas IA | `/atlas-ia` | `AtlasAIPage` + Intelligence |
| Perfil | `/perfil` | `ProfilePage` |
| Bottom Navigation | global autenticado | `BottomNavigation` |
| Design System | global | `tokens.css`, `components/ui/*` |

---

## ETAPA 2 — Avaliação de fundamentos visuais

### Hierarquia visual
- **Forte** no topo da Home (Hero → Pulse) e no Auth/Onboarding (logo → card → CTA).
- **Fraca** no miolo da Home: Insights + Intelligence Panel + Feed competem pelo mesmo peso visual.
- Títulos de seção na Home usam `--font-size-md` (quase corpo); em Contas usam `lg`. Hierarquia inconsistente.

### Espaçamento
- Escala de 4px bem usada (`--space-*`).
- Home com `gap: var(--space-7)` entre blocos — bom fôlego, mas com ~10 blocos vira scroll infinito.
- Magic numbers fora da escala: clearance da nav `72px`, toast `380px`, vários ícones 44/56/64.

### Tipografia
- Inter Variable é adequada e profissional, porém **pouco expressiva** para um pitch (fintechs premium misturam display + UI).
- Escala `3xl`/`4xl` quase só aparece via `clamp` no Hero — tokens de display subutilizados.
- Saudação da Home (`xl`) é menor que o `h1` de Contas (`2xl`) — a Home deveria “vencer” tipograficamente.

### Cores, contraste, sombras, bordas, radius
- Paleta dark + brand índigo + success teal é **coesa e “bank-like”**.
- Risco real: `--color-text-tertiary` (`#6B7488` em `#05070D`) — contraste fraco para meta/labels pequenos (já reconhecido no backlog WCAG).
- Bordas `rgba(255,255,255,0.08)` + radius `lg/xl` funcionam bem.
- Glow brand é um diferencial — mas usado de forma irregular (Intelligence sim; muitos cards Home não).

### Ícones, botões, cards, inputs
- `lucide-react` consistente; severidade com ícone+texto — bom.
- `Button`/`Input`/`Card` do DS são sólidos.
- Home **reimplementa cards** em CSS por seção em vez de usar `<Card>` — drift visual inevitável.
- Atlas IA usa input nativo estilizado à mão — quebra o contrato do Design System.

### Responsividade / Mobile First
- Home e Contas: coluna mobile (480 → 560 → 720) — produto coerente.
- Investimentos / Perfil: `max-width: 1100px` — sensação de dashboard web legado.
- Bottom nav com 5 itens e labels longas (`Investimentos`) → ellipsis em telas estreitas.
- Atlas IA: `height: calc(100vh - 72px)` + padding do shell → risco de faixa vazia / composer desalinhado.

---

## ETAPA 3 — Experiência emocional

### Quando o usuário abre a Atlas… o que sente?

| Momento | Sensação provável |
|---|---|
| Login / cadastro | “App sério, dark, cuidado” |
| Onboarding | “Produto pensado; me guiam” |
| Primeiro viewport da Home | “Fintech — patrimônio, pulso, inteligência” |
| Scroll da Home (meio) | “Muita informação; três cérebros falando ao mesmo tempo” |
| Contas | “Hub financeiro moderno, ainda mock” |
| Investimentos | “Tela de preenchimento / slide de pitch” |
| Atlas IA | “Chat + feed amontoados; promissor, não refinado” |
| Perfil | “Funcional, sem personalidade” |

### O que parece moderno?
- WealthHero + glow + contadores animados  
- Atlas Intelligence (glow, conversa)  
- Microinterações (som, toast, money rain)  
- Auth atmospheric + onboarding com progress  
- Hub Contas com eyebrow + stats  

### O que parece antigo / MVP?
- Investimentos e Perfil “página larga”  
- Densidade e repetição de painéis iguais na Home  
- Feed + Insights + Panel = tripla narrativa  
- Labels truncadas na bottom nav  
- Disclaimer amarelo de investimentos sem sofisticação  
- Placeholders de bancos (iniciais) sem marca visual premium  

### O que transmite confiança?
- Tema escuro consistente, números tabulares, microcopy em PT-BR  
- Separação clara Auth vs App  
- Microinterações de sucesso (receita)  

### O que ainda transmite “MVP construído em sprints”?
- Inconsistência de layout entre abas  
- Conteúdo mock sem “estado vazio premium” unificado  
- Intelligence / recomendações / Pulse / Feed sem um único modelo mental  
- Tipografia só Inter, sem momento de marca tipográfica  

---

## ETAPA 4 — Tela a tela

### Login
| | |
|---|---|
| 🟢 Manter | AuthLayout atmosférico, Card elevated, logo, CTA primary com glow, motion de entrada |
| 🟡 Melhorar | Unificar cor dos links (brand vs info); estados de erro mais “premium”; microcopy de confiança (segurança) |
| 🔴 Remover | Qualquer residual de template/landing (já limpo — manter disciplina) |

### Cadastro
| | |
|---|---|
| 🟢 Manter | Mesmo shell do Login; fluxo de e-mail não confirmado |
| 🟡 Melhorar | Progresso/expectativa pós-cadastro mais celebratório; hierarquia senha/confirmação |
| 🔴 Remover | Sensação de formulário “mais do mesmo” sem diferencial — precisa de um único momento de marca |

### Onboarding
| | |
|---|---|
| 🟢 Manter | Card glow, ícone por passo, progress, atmosfera Auth |
| 🟡 Melhorar | Transições entre passos; preview do valor gerado (“você poderá gastar X”); skip menos genérico |
| 🔴 Remover | Sensação de checklist administrativo se o copy for seco demais |

### Home
| | |
|---|---|
| 🟢 Manter | WealthHero, Pulse, QuickActions, microinterações, Intelligence glow |
| 🟡 Melhorar | Hierarquia de títulos (`md` → `lg`); unificar painéis em `<Card>`; reduzir stack Insights+Panel+Feed; empty states premium |
| 🔴 Remover | Redundância narrativa (três blocos de “cérebro”); scroll sem âncoras; seção fraca após o Hero |

### Contas (Hub / Conectar / Conectadas)
| | |
|---|---|
| 🟢 Manter | Coluna mobile alinhada à Home, eyebrow, StatCards, sync spin, fluxo conectar |
| 🟡 Melhorar | Logos reais / marca visual; estados vazios cinematográficos; hierarquia stats vs lista; skeleton premium |
| 🔴 Remover | Qualquer cheiro de “lista técnica de integração” sem storytelling de patrimônio |

### Investimentos
| | |
|---|---|
| 🟢 Manter | Disclaimer ético (“não vende investimentos”); uso de StatCard/MiniBarChart |
| 🟡 Melhorar | Entrar no mesmo max-width da Home; storytelling visual; menos “dashboard 1100px” |
| 🔴 Remover | Faixa warning genérica sem design; sensação de placeholder de pitch deck |

### Atlas IA
| | |
|---|---|
| 🟢 Manter | Identidade BrainCircuit; chat; Feed inteligente como conceito |
| 🟡 Melhorar | Composer com `Input` do DS; altura/nav tokenizada; Feed como drawer/aba, não empilhado no mesmo viewport |
| 🔴 Remover | Dupla carga cognitiva feed+thread no primeiro viewport; input one-off |

### Perfil
| | |
|---|---|
| 🟢 Manter | Avatar, menu claro, logout, link Open Finance |
| 🟡 Melhorar | Layout mobile-column; plano/assinatura com visual de produto; settings reais ou ocultar “Em breve” |
| 🔴 Remover | Toggles desabilitados que parecem bug; largura 1100px |

### Bottom Navigation
| | |
|---|---|
| 🟢 Manter | 5 destinos claros; estado ativo brand-soft; safe-area |
| 🟡 Melhorar | Token `--atlas-nav-height`; labels curtas ou ícone-first em &lt;360px; active indicator mais premium (pill/dot) |
| 🔴 Remover | Ellipsis de labels como solução permanente |

---

## ETAPA 5 — Notas (0–10)

| Área | Nota | Comentário curto |
|---|---:|---|
| Login | **8.2** | Atmosfera e CTA fortes; polish de links/confiança |
| Cadastro | **7.8** | Coeso com Login; falta momento memorável |
| Home | **7.4** | Topo 9/10; miolo denso 5.5/10 |
| Contas | **7.6** | Melhor continuidade pós-Home; falta marca bancária |
| Investimentos | **5.8** | Conteúdo e layout ainda “preenchimento” |
| Atlas IA | **6.4** | Conceito certo; composição do viewport errada |
| Perfil | **6.0** | Limpo, sem alma de produto |
| Design System | **8.0** | Tokens e UI kit bons; adoção irregular |
| **UX Geral** | **7.2** | Pronto para impressionar 15s; não sustenta 2 min |

---

## ETAPA 6 — Comparativo de experiência (não de identidade)

Referências de **padrão de uso**: Nubank, Inter, C6, Revolut, Apple Wallet.

### O que esses apps fazem melhor
1. **Uma ideia por viewport** — Hero decide o job; o resto é progressivo.  
2. **Navegação com labels que cabem** — ou só ícone + label curta.  
3. **Estados vazios e loading como produto**, não como “Carregando…”.  
4. **Consistência de shell** — mesma largura, tipografia e card em todas as abas.  
5. **IA/insights como camada**, não como três widgets empilhados.  
6. **Marca tipográfica / motion com intenção** — poucos movimentos, memoráveis.  
7. **Wallet-like hierarchy** (Apple Wallet / Revolut): número grande → ação → detalhe.

### O que a Atlas já faz bem
- Dark system próprio (não clone roxo genérico).  
- Hero de patrimônio + Pulse + Intelligence como assinatura.  
- Microinterações que reforçam “dinheiro entrou”.  
- Onboarding e Auth com atmosfera.  
- Hub Contas alinhado mobile-first com a Home.  
- Ética em investimentos (não vende) — diferencial de confiança.

### O que ainda falta
- **Unidade de shell** entre abas.  
- **Dieta de informação** na Home.  
- **Modelo mental único** de Intelligence (Pulse vs Insights vs Panel vs Feed vs Chat).  
- **Empty/loading/error** premium unificados.  
- **Contraste AA** e tipografia com mais presença de marca.  
- **Investimentos / Perfil / IA** no mesmo nível de acabamento do topo da Home.

---

## ETAPA 7 — Roadmap de UX (por impacto)

### Melhorias rápidas (≈ 1 dia) — alto impacto / baixo risco
Ordenadas por impacto:

1. **Colapsar inteligência na Home** — manter Pulse + 1 bloco (Insights *ou* Panel); Feed só em `/atlas-ia` ou atrás de “Ver feed”.  
2. **Unificar max-width** de Investimentos/Perfil com Home/Contas (480→560→720).  
3. **Subir títulos de seção da Home** de `md` para `lg`.  
4. **Token `--atlas-bottom-nav-height`** e uso no AppShell + Atlas IA.  
5. **Composer da Atlas IA** com `Input`/`Button` do DS.  
6. **Labels da nav** mais curtas (`Invest.`, `IA`) ou tipografia responsiva.  
7. **Links do Auth** numa única cor (brand).  
8. Remover/ocultar toggles “Em breve” que parecem quebrados no Perfil.

### Melhorias médias (≈ 1 semana)
1. Migrar painéis da Home para `<Card>` (ou utilitário `.atlas-surface`) — fim do drift.  
2. Empty states ilustrados (Contas sem banco, metas vazias, IA sem feed).  
3. Skeletons unificados (AsyncStateView em Contas/IA/Insights).  
4. Auditoria de contraste (tertiary, badges, disclaimer).  
5. Redesign leve de Investimentos: hero de patrimônio investido + 1 gráfico + 1 lista (sem faixa warning crua).  
6. Perfil como “conta Atlas”: plano, segurança, Open Finance, preferências de som/microinteração.  
7. Atlas IA: layout chat-first; Feed em sheet/aba “Atividade”.  
8. Hierarquia tipográfica documentada (Display / Title / Section / Body / Meta).

### Melhorias grandes (≈ 1 mês)
1. **Information architecture da Intelligence** — um cérebro, várias superfícies (Pulse = 1 frase; Insights = top 3; Chat = conversa; Feed = histórico).  
2. **Motion system** oficial (entrada de seções, page transitions) além das microinterações pontuais.  
3. **Identidade tipográfica** (display + UI) sem perder Inter no corpo.  
4. **Brand kit bancário** (logos, cores por instituição) no Open Finance.  
5. **Tema / contraste / acessibilidade** formal WCAG AA.  
6. **Design QA checklist** por sprint (antes de merge: shell, tipografia, empty, nav).  
7. Pesquisa rápida com 5 usuários no fluxo Login → Onboarding → Home → Contas (validar sensação premium).

---

## ETAPA 8 — Relatório final (síntese para decisão)

### O que vender amanhã (manter e destacar)
- Home topo (Hero + Pulse + Intelligence glow)  
- Auth + Onboarding  
- Design tokens + microinterações  
- Hub Contas mobile-first  
- Posicionamento ético de investimentos  

### O que NÃO mostrar em demo (ou mostrar por último)
- Scroll completo da Home com Insights+Panel+Feed  
- Investimentos no layout 1100px  
- Perfil com “Em breve”  
- Atlas IA com feed empilhado no chat  

### Hipótese de produto
A Atlas já tem **alma de fintech** no primeiro viewport. O gap para “produto investível” não é falta de feature — é **disciplina de experiência**: menos blocos, mais consistência, um modelo mental de Intelligence, e acabamento igual em todas as abas.

### Próximo passo (combinado)
Nenhuma implementação nesta missão.  
**Decidir juntos**, a partir deste relatório, quais itens da lista de 1 dia / 1 semana entram na próxima sprint de polish — com prioridade explícita de impacto para o usuário (e para a demo a investidores).

---

## Apêndice A — Evidências técnicas (para o time)

| Achado | Evidência |
|---|---|
| Home densa | `HomePage.tsx`: Hero → Pulse → Insights → QuickActions → Panel → Feed → … |
| Títulos Home fracos | `.atlas-home-block-header h2` → `font-size-md` em `HomePage.css` |
| Shell inconsistente | `.atlas-home` / `.atlas-page-of` (≤720) vs `.atlas-page` (1100) |
| Nav magic number | `72px` em `AppShell.css` e `AtlasAIPage.css` |
| Contraste tertiary | `--color-text-tertiary: #6b7488` em `tokens.css` |
| Card drift | Painéis Home em CSS próprio; Contas/Invest usam `<Card elevated>` |
| IA fora do DS | `.atlas-ai-composer input` one-off |
| Glow subutilizado | `Card glow` quase só no onboarding |

## Apêndice B — Scorecard visual (radar mental)

```
Hierarquia     ████████░░  7.5
Consistência   ██████░░░░  6.0
Mobile-first   ████████░░  8.0
Polimento DS   ████████░░  8.0
Clareza UX     ███████░░░  7.0
Wow investidor ████████░░  7.5  (primeiros 10s)
Sustentação    █████░░░░░  5.5  (após 60s)
```

---

> Documento vivo da Missão 14. Qualquer implementação futura deve referenciar itens deste arquivo e ser aprovada item a item antes do código.

# Atlas Design System

Criado na Missão 04 ("Atlas Premium Experience"). Este documento é a referência de estilo/UI da Atlas — qualquer nova tela deve usar estes tokens e componentes em vez de valores/estilos ad-hoc.

## 1. Princípios

- **Tema escuro, identidade própria**: inspirado (não copiado) em Nubank, C6 Bank, Revolut, Apple Wallet, Linear e Arc Browser — evolução da paleta navy que a Atlas já usava, elevada a um sistema consistente.
- **Zero dependência pesada**: ícones (`lucide-react`) e fonte (`@fontsource-variable/inter`, self-hosted) são as únicas bibliotecas de UI adicionadas. Gráficos são SVG/CSS puro — sem biblioteca de gráficos, para não agravar o tamanho do bundle.
- **CSS puro por componente**: mantém o padrão já estabelecido no `CLAUDE.md`. Cada componente de `src/components/ui/` tem seu próprio `.css`.
- **Acessibilidade em primeiro lugar**: severidade sempre por ícone + texto (nunca só cor); todos os componentes interativos preservam `aria-*`/`role` já existentes.

## 2. Tokens (`src/styles/tokens.css`)

Custom properties CSS, importadas uma única vez em `main.tsx`. Nenhum componente deve usar cores/espaçamentos "mágicos" fora destes tokens.

### Cor

| Token | Valor | Uso |
|---|---|---|
| `--color-bg-canvas` | `#05070D` | Fundo da página |
| `--color-bg-surface` | `#0F1420` | Cards/painéis |
| `--color-bg-elevated` | `#161C2C` | Modais, cards em destaque |
| `--color-text-primary` | `#F5F7FA` | Texto principal |
| `--color-text-secondary` | `#9AA5B8` | Texto secundário/labels |
| `--color-text-tertiary` | `#6B7488` | Texto auxiliar/placeholder |
| `--color-brand` / `--color-brand-strong` | `#5B5FEF` / `#4347D9` | Marca Atlas — CTAs primários, foco, logo |
| `--color-success` | `#2DD4BF` | Positivo (receitas, metas concluídas) |
| `--color-warning` | `#F5A524` | Atenção |
| `--color-danger` | `#FF5C72` | Crítico/erro/despesa |
| `--color-info` | `#4DA3FF` | Informativo |

Cada cor semântica tem uma variante `-soft` (ex: `--color-danger-soft`) para fundos de badge/ícone.

### Tipografia

- Família: `Inter Variable` (self-hosted via `@fontsource-variable/inter/wght.css`), com fallback de sistema.
- Escala: `--font-size-xs` (12px) até `--font-size-4xl` (44px).
- Pesos: `--font-weight-regular/medium/semibold/bold`.
- Números financeiros: classe utilitária `.tabular-nums` (algarismos tabulares, para alinhar valores em colunas).

### Espaçamento, radius, sombra, movimento

- Espaçamento: escala de 4px, `--space-1` (4px) a `--space-12` (96px).
- Radius: `--radius-sm` (8px) a `--radius-xl` (28px), `--radius-full` para pills/badges.
- Sombra: `--shadow-sm/md/lg` (glow suave, não preto puro — pensado para fundo escuro) e `--shadow-glow-brand` (uso pontual, ex: seção Atlas Intelligence).
- Movimento: `--duration-fast/base/slow` + `--ease-standard`; respeita `prefers-reduced-motion`.

## 3. Componentes (`src/components/ui/`)

| Componente | Props principais | Substitui |
|---|---|---|
| `Button` | `variant` (`primary/secondary/ghost/danger`), `size` (`sm/md/lg`), `fullWidth`, `loading` | `.btn-primary`, `.btn-logout`, `.btn-remover`, `.btn-marcar-pago`, `.btn-primario`/`.btn-secundario`, botões de modal/painel |
| `Card` | `elevated`, `glow`, `padding` (`sm/md/lg`) | `.painel`, `.card` |
| `Input` | `label`, `error`, `hint`, `icon` — compatível com `register()` do react-hook-form | inputs soltos com `.campo`/`.erro-campo` |
| `Modal` | `titleId`, `title`, `onClose` — trata Escape e clique fora | overlay/card duplicados nos 5 modais |
| `Badge` | `tone` (`critica/atencao/positiva/informativa/neutra`) | `.severity-badge` (emoji → ícone `lucide-react`) |
| `ProgressBar` | `value` (0–1), `label` | mesmo de antes, só o visual mudou |
| `ProgressRing` | `value`, `label`, `tone`, `centerText` | novo — anel circular (metas, planejamento) |
| `MiniBarChart` | `items: { label, value, tone }[]`, `formatValue` | novo — comparação de valores (ex: receitas x despesas do mês) |
| `StatCard` | `icon`, `label`, `value`, `tone`, `hint` | os 4 cards simples de `FinancialSummaryCards` |
| `AtlasLogo` | `size`, `withWordmark` | emoji 🚀 usado como "logo" |

`SeverityBadge` (em `src/components/`) permanece como wrapper de domínio fino sobre `Badge`, mesma API (`tone`/`label`) usada por `BillsList`, `PlanningPanel` e `AtlasIntelligencePanel`. `AsyncStateView` também permanece com a mesma API, apenas restilizado (skeleton shimmer no loading).

## 4. Convenção de nomenclatura CSS

Todas as classes dos componentes de `components/ui/` usam o prefixo `atlas-` (ex: `.atlas-btn`, `.atlas-card`, `.atlas-input`). Isso separa claramente o Design System novo de qualquer classe legada remanescente durante a migração, e facilita auditoria (`grep "atlas-"` mostra a adoção).

## 5. O que fica para depois (fora do escopo desta missão)

- Tema claro / alternância dark-light.
- Auditoria formal de contraste WCAG AA com a nova paleta (ver `roadmap/backlog.md`).
- Biblioteca de gráficos mais rica (hoje: SVG/CSS puro, suficiente para os dados agregados disponíveis).

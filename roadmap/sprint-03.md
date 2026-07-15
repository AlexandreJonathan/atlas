# Sprint 03 — Persistência de Dados Financeiros

## Status: ✅ Concluída (parcial — edição de movimentações adiada, ver seção 5) + Auto Code Review aplicada (seção 6)

## 1. Objetivo

Substituir o estado local volátil do `Dashboard.tsx` por uma camada de persistência real, permitindo que receitas e despesas sejam armazenadas, recuperadas e mantidas entre sessões do usuário.

## 2. Escopo Implementado

- Tabela `transactions` no Supabase (Postgres), com Row Level Security por usuário (ver migração em `supabase/migrations/`).
- Camada de serviços (`src/services/transactionsService.ts`) para `listTransactions`, `createTransaction` e `deleteTransaction`.
- Hook `useTransactions` (`src/hooks/useTransactions.ts`) centralizando estado de carregamento, erro, lista de movimentações e saldo/receitas/despesas derivados automaticamente.
- `Dashboard.tsx` refatorado para consumir dados reais via `useTransactions`, sem nenhum estado financeiro mockado.
- Modal único e reutilizável (`TransactionModal.tsx`) para "Nova Receita" e "Nova Despesa", usando `react-hook-form` + `zod` (schema em `src/validations/transactionSchema.ts`), substituindo o `alert()` que existia para despesas.
- Exclusão de movimentações a partir do Dashboard (botão "Remover"), item do critério original de edição/exclusão.
- Estados de carregamento, erro (com botão "Tentar novamente") e lista vazia implementados na listagem de movimentações.

## 3. Critérios de Aceite

- [x] Existe uma camada de serviços para criar, listar e excluir movimentações financeiras.
- [x] Movimentações criadas persistem após recarregar a página (dados reais no Supabase, não mais em `useState` local).
- [x] Cada usuário visualiza apenas suas próprias movimentações (garantido por Row Level Security no banco).
- [x] O botão "Nova Despesa" abre um modal funcional equivalente ao de "Nova Receita", persistindo a despesa via Supabase.
- [x] É possível excluir uma movimentação existente a partir do Dashboard.
- [ ] É possível **editar** uma movimentação existente — não implementado nesta rodada (fora do escopo explícito solicitado; ver seção 5).
- [x] O Dashboard exibe estado de carregamento enquanto os dados são buscados.
- [x] Erros de rede/API são tratados e exibidos ao usuário de forma amigável (sem expor mensagens técnicas do Postgres).
- [x] `npm run lint` e `npm run build` executam sem erros.
- [x] Não há regressão nas funcionalidades de autenticação e roteamento das sprints anteriores.
- [x] Nenhum dado mockado ou uso de `localStorage` para persistência de movimentações.

## 4. Como Aplicar a Migração

A migração SQL (`supabase/migrations/20260712210000_create_transactions_table.sql`) precisa ser aplicada manualmente pelo responsável pelo projeto Supabase (o agente não executa DDL diretamente no banco em produção/desenvolvimento sem revisão humana):

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor.
2. Cole o conteúdo do arquivo de migração e execute.
3. Alternativamente, com o Supabase CLI configurado e o projeto linkado: `supabase db push`.

## 5. Itens Adiados

- **Edição de movimentações**: não solicitada explicitamente no escopo desta rodada; recomendada como próximo passo (ver `backlog.md`).
- **Categorização de receitas/despesas**: mantida fora de escopo, já registrada separadamente no backlog.

## 6. Auto Code Review (Tech Lead)

Antes de considerar a Sprint 3 concluída, foi realizada uma revisão técnica completa do código implementado (duplicação, arquitetura, responsabilidades, tamanho de componentes, performance, segurança, acessibilidade, tipagem, tratamento de erros, nomenclatura e aderência ao `CLAUDE.md`). Todas as melhorias identificadas foram corrigidas automaticamente, sem alterar o escopo funcional descrito acima. Detalhes completos em `roadmap/changelog.md` (seção "[Sprint 3 — Auto Code Review]"). Resumo:

- Corrigida inconsistência entre a validação do formulário e a constraint do banco para `description` (`.trim()`).
- Corrigido bug de UX: erro ao excluir uma movimentação não esconde mais a lista já carregada (estado `actionError` dedicado).
- `Dashboard.tsx` reduzido: lista de movimentações extraída para `components/TransactionsList.tsx`.
- Duplicação de lógica de busca eliminada em `useTransactions.ts`.
- Acessibilidade do `TransactionModal` reforçada (`role="dialog"`, `aria-modal`, fechamento via Esc, foco inicial, `aria-label` nos campos).
- Pequenas duplicações de constantes e casts de tipo documentados/eliminados.
- `npm run lint` e `npm run build` executados novamente após as correções — sem erros.

Nenhuma melhoria identificada exigiu alteração do escopo funcional da sprint (persistência, listagem, criação, exclusão e estados de loading/erro continuam funcionando como especificado).

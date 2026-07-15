-- Sprint 3 — Persistência de Movimentações Financeiras
-- Cria a tabela "transactions" (receitas e despesas) associada ao usuário
-- autenticado (auth.users), com Row Level Security garantindo que cada
-- usuário só possa ler/escrever suas próprias movimentações.
--
-- Como aplicar:
--   1. Supabase Dashboard > SQL Editor > cole e execute este arquivo; ou
--   2. Supabase CLI: `supabase db push` (com o projeto linkado).

create extension if not exists "pgcrypto";

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('receita', 'despesa')),
  description text not null check (char_length(trim(description)) >= 3),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

comment on table public.transactions is 'Receitas e despesas registradas pelos usuários do Atlas.';
comment on column public.transactions.type is 'Tipo da movimentação: receita ou despesa.';
comment on column public.transactions.amount is 'Valor monetário da movimentação, sempre positivo.';

create index if not exists transactions_user_id_created_at_idx
  on public.transactions (user_id, created_at desc);

alter table public.transactions enable row level security;

drop policy if exists "Usuários podem ver suas próprias transações" on public.transactions;
create policy "Usuários podem ver suas próprias transações"
  on public.transactions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir suas próprias transações" on public.transactions;
create policy "Usuários podem inserir suas próprias transações"
  on public.transactions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar suas próprias transações" on public.transactions;
create policy "Usuários podem atualizar suas próprias transações"
  on public.transactions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir suas próprias transações" on public.transactions;
create policy "Usuários podem excluir suas próprias transações"
  on public.transactions
  for delete
  using (auth.uid() = user_id);

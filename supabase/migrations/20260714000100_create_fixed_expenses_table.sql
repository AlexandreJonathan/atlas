-- Sprint 5 — Planejamento Financeiro Inteligente
-- Cria a tabela "fixed_expenses" (despesas fixas recorrentes, ex: aluguel,
-- assinaturas) associada ao usuário autenticado, com Row Level Security
-- garantindo que cada usuário só possa ler/escrever suas próprias despesas.
--
-- Sem coluna de "dia de vencimento": é uma despesa mensal recorrente por
-- definição — o valor total é sempre considerado "ainda a ocorrer" no
-- cálculo do mês (ver src/lib/planningEngine.ts). Vencimento com data e
-- status pago/pendente já existe no domínio "bills" para contas pontuais.
--
-- Como aplicar:
--   1. Supabase Dashboard > SQL Editor > cole e execute este arquivo; ou
--   2. Supabase CLI: `supabase db push` (com o projeto linkado).

create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null check (char_length(trim(description)) >= 3),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

comment on table public.fixed_expenses is 'Despesas fixas recorrentes mensais (ex: aluguel, assinaturas) usadas no planejamento financeiro.';

create index if not exists fixed_expenses_user_id_idx
  on public.fixed_expenses (user_id);

alter table public.fixed_expenses enable row level security;

drop policy if exists "Usuários podem ver suas próprias despesas fixas" on public.fixed_expenses;
create policy "Usuários podem ver suas próprias despesas fixas"
  on public.fixed_expenses
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir suas próprias despesas fixas" on public.fixed_expenses;
create policy "Usuários podem inserir suas próprias despesas fixas"
  on public.fixed_expenses
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar suas próprias despesas fixas" on public.fixed_expenses;
create policy "Usuários podem atualizar suas próprias despesas fixas"
  on public.fixed_expenses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir suas próprias despesas fixas" on public.fixed_expenses;
create policy "Usuários podem excluir suas próprias despesas fixas"
  on public.fixed_expenses
  for delete
  using (auth.uid() = user_id);

-- Sprint 4 — Dashboard Inteligente
-- Cria a tabela "bills" (contas a pagar/receber) associada ao usuário
-- autenticado, com Row Level Security garantindo que cada usuário só
-- possa ler/escrever suas próprias contas.
--
-- Como aplicar:
--   1. Supabase Dashboard > SQL Editor > cole e execute este arquivo; ou
--   2. Supabase CLI: `supabase db push` (com o projeto linkado).

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('a_pagar', 'a_receber')),
  description text not null check (char_length(trim(description)) >= 3),
  amount numeric(12, 2) not null check (amount > 0),
  due_date date not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.bills is 'Contas a pagar/receber com vencimento, registradas pelos usuários do Atlas.';
comment on column public.bills.type is 'Tipo da conta: a_pagar ou a_receber.';
comment on column public.bills.status is 'Situação da conta: pendente ou pago.';
comment on column public.bills.paid_at is 'Data/hora em que a conta foi marcada como paga (nulo enquanto pendente).';

create index if not exists bills_user_id_due_date_idx
  on public.bills (user_id, due_date);

create index if not exists bills_user_id_status_idx
  on public.bills (user_id, status);

alter table public.bills enable row level security;

drop policy if exists "Usuários podem ver suas próprias contas" on public.bills;
create policy "Usuários podem ver suas próprias contas"
  on public.bills
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir suas próprias contas" on public.bills;
create policy "Usuários podem inserir suas próprias contas"
  on public.bills
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar suas próprias contas" on public.bills;
create policy "Usuários podem atualizar suas próprias contas"
  on public.bills
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir suas próprias contas" on public.bills;
create policy "Usuários podem excluir suas próprias contas"
  on public.bills
  for delete
  using (auth.uid() = user_id);

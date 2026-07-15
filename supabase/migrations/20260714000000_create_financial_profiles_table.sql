-- Sprint 5 — Planejamento Financeiro Inteligente
-- Cria a tabela "financial_profiles" (renda mensal e reserva mínima),
-- uma linha por usuário, com Row Level Security garantindo que cada
-- usuário só possa ler/escrever seu próprio perfil.
--
-- "user_id" é a própria chave primária (relação 1:1 com auth.users),
-- o que permite salvar via upsert (insert ... on conflict) sem precisar
-- distinguir criação de atualização no service.
--
-- Como aplicar:
--   1. Supabase Dashboard > SQL Editor > cole e execute este arquivo; ou
--   2. Supabase CLI: `supabase db push` (com o projeto linkado).

create table if not exists public.financial_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_income numeric(12, 2) not null check (monthly_income > 0),
  minimum_reserve numeric(12, 2) not null default 0 check (minimum_reserve >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.financial_profiles is 'Renda mensal e reserva mínima configuradas pelo usuário para o planejamento financeiro.';
comment on column public.financial_profiles.monthly_income is 'Salário mensal ou renda prevista informada pelo usuário.';
comment on column public.financial_profiles.minimum_reserve is 'Valor mínimo que o usuário deseja manter guardado (reserva de emergência).';

alter table public.financial_profiles enable row level security;

drop policy if exists "Usuários podem ver seu próprio perfil financeiro" on public.financial_profiles;
create policy "Usuários podem ver seu próprio perfil financeiro"
  on public.financial_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir seu próprio perfil financeiro" on public.financial_profiles;
create policy "Usuários podem inserir seu próprio perfil financeiro"
  on public.financial_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar seu próprio perfil financeiro" on public.financial_profiles;
create policy "Usuários podem atualizar seu próprio perfil financeiro"
  on public.financial_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir seu próprio perfil financeiro" on public.financial_profiles;
create policy "Usuários podem excluir seu próprio perfil financeiro"
  on public.financial_profiles
  for delete
  using (auth.uid() = user_id);

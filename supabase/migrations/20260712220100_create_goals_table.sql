-- Sprint 4 — Dashboard Inteligente
-- Cria a tabela "goals" (metas financeiras) associada ao usuário
-- autenticado, com Row Level Security garantindo que cada usuário só
-- possa ler/escrever suas próprias metas.
--
-- Progresso (%) e "concluída" são derivados no front-end a partir de
-- current_amount / target_amount — não há coluna de status redundante.
--
-- Como aplicar:
--   1. Supabase Dashboard > SQL Editor > cole e execute este arquivo; ou
--   2. Supabase CLI: `supabase db push` (com o projeto linkado).

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 3),
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  target_date date,
  created_at timestamptz not null default now()
);

comment on table public.goals is 'Metas financeiras registradas pelos usuários do Atlas.';
comment on column public.goals.current_amount is 'Valor já acumulado rumo à meta (atualizado via aportes).';
comment on column public.goals.target_date is 'Prazo opcional para atingir a meta.';

create index if not exists goals_user_id_idx
  on public.goals (user_id);

alter table public.goals enable row level security;

drop policy if exists "Usuários podem ver suas próprias metas" on public.goals;
create policy "Usuários podem ver suas próprias metas"
  on public.goals
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir suas próprias metas" on public.goals;
create policy "Usuários podem inserir suas próprias metas"
  on public.goals
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar suas próprias metas" on public.goals;
create policy "Usuários podem atualizar suas próprias metas"
  on public.goals
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir suas próprias metas" on public.goals;
create policy "Usuários podem excluir suas próprias metas"
  on public.goals
  for delete
  using (auth.uid() = user_id);

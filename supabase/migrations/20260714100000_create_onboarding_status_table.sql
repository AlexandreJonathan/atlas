-- Sprint 6 — Alpha Readiness
-- Cria a tabela "onboarding_status": progresso do onboarding guiado
-- (passo atual e data de conclusão), uma linha por usuário, com Row Level
-- Security garantindo que cada usuário só possa ler/escrever seu próprio
-- progresso.
--
-- "user_id" é a própria chave primária (relação 1:1 com auth.users), mesmo
-- padrão de "financial_profiles" (Sprint 5) — permite salvar via upsert sem
-- distinguir criação de atualização no service.
--
-- Como aplicar:
--   1. Supabase Dashboard > SQL Editor > cole e execute este arquivo; ou
--   2. Supabase CLI: `supabase db push` (com o projeto linkado).

create table if not exists public.onboarding_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_step smallint not null default 1 check (current_step >= 1 and current_step <= 6),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.onboarding_status is 'Progresso do onboarding guiado (Sprint 6): passo atual e data de conclusão por usuário.';
comment on column public.onboarding_status.current_step is 'Passo atual do onboarding (1 a 6), usado para retomar de onde o usuário parou.';
comment on column public.onboarding_status.completed_at is 'Data/hora em que o usuário concluiu o onboarding; null enquanto não concluído. Uma vez definido, o onboarding nunca é exibido novamente.';

alter table public.onboarding_status enable row level security;

drop policy if exists "Usuários podem ver seu próprio progresso de onboarding" on public.onboarding_status;
create policy "Usuários podem ver seu próprio progresso de onboarding"
  on public.onboarding_status
  for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir seu próprio progresso de onboarding" on public.onboarding_status;
create policy "Usuários podem inserir seu próprio progresso de onboarding"
  on public.onboarding_status
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar seu próprio progresso de onboarding" on public.onboarding_status;
create policy "Usuários podem atualizar seu próprio progresso de onboarding"
  on public.onboarding_status
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir seu próprio progresso de onboarding" on public.onboarding_status;
create policy "Usuários podem excluir seu próprio progresso de onboarding"
  on public.onboarding_status
  for delete
  using (auth.uid() = user_id);

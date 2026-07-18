-- Atlas v1.2 — Installment Intelligence
-- Compromissos parcelados (planos + parcelas) com RLS por usuário.

create table if not exists public.installment_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null check (char_length(trim(description)) >= 3),
  category text not null
    check (
      category in (
        'housing',
        'food',
        'transport',
        'health',
        'leisure',
        'education',
        'shopping',
        'bills',
        'subscriptions',
        'other'
      )
    ),
  total_amount numeric(12, 2) not null check (total_amount > 0),
  installment_count integer not null check (installment_count >= 1 and installment_count <= 120),
  installment_amount numeric(12, 2) not null check (installment_amount > 0),
  first_due_date date not null,
  card_label text,
  status text not null default 'active'
    check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.installment_plans is
  'Compras parceladas (Installment Intelligence).';
comment on column public.installment_plans.card_label is
  'Identificação opcional do cartão (texto livre).';

create index if not exists installment_plans_user_id_idx
  on public.installment_plans (user_id);

alter table public.installment_plans enable row level security;

drop policy if exists "Usuários podem ver seus planos parcelados" on public.installment_plans;
create policy "Usuários podem ver seus planos parcelados"
  on public.installment_plans for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir planos parcelados" on public.installment_plans;
create policy "Usuários podem inserir planos parcelados"
  on public.installment_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar planos parcelados" on public.installment_plans;
create policy "Usuários podem atualizar planos parcelados"
  on public.installment_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir planos parcelados" on public.installment_plans;
create policy "Usuários podem excluir planos parcelados"
  on public.installment_plans for delete
  using (auth.uid() = user_id);

create or replace function public.set_installment_plans_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists installment_plans_set_updated_at on public.installment_plans;
create trigger installment_plans_set_updated_at
  before update on public.installment_plans
  for each row
  execute function public.set_installment_plans_updated_at();

-- ---------------------------------------------------------------------------
-- installment_payments
-- ---------------------------------------------------------------------------
create table if not exists public.installment_payments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.installment_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence integer not null check (sequence >= 1),
  due_date date not null,
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'skipped')),
  paid_at timestamptz,
  transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, sequence)
);

comment on table public.installment_payments is
  'Parcelas geradas a partir de um plano. Compromissos futuros não criam transactions automaticamente.';
comment on column public.installment_payments.transaction_id is
  'Opcional: vínculo com lançamento de caixa quando a parcela for paga.';

create index if not exists installment_payments_user_id_due_idx
  on public.installment_payments (user_id, due_date);

create index if not exists installment_payments_plan_id_idx
  on public.installment_payments (plan_id);

alter table public.installment_payments enable row level security;

drop policy if exists "Usuários podem ver suas parcelas" on public.installment_payments;
create policy "Usuários podem ver suas parcelas"
  on public.installment_payments for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir parcelas" on public.installment_payments;
create policy "Usuários podem inserir parcelas"
  on public.installment_payments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar parcelas" on public.installment_payments;
create policy "Usuários podem atualizar parcelas"
  on public.installment_payments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir parcelas" on public.installment_payments;
create policy "Usuários podem excluir parcelas"
  on public.installment_payments for delete
  using (auth.uid() = user_id);

create or replace function public.set_installment_payments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists installment_payments_set_updated_at on public.installment_payments;
create trigger installment_payments_set_updated_at
  before update on public.installment_payments
  for each row
  execute function public.set_installment_payments_updated_at();

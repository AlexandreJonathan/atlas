-- Atlas v1.0 — Budget Planner (Módulo 2)
-- 1) Categoria em transactions (despesas alimentam o orçamento)
-- 2) Tabelas budgets + budget_categories com RLS

-- ---------------------------------------------------------------------------
-- transactions.category
-- ---------------------------------------------------------------------------
alter table public.transactions
  add column if not exists category text;

alter table public.transactions
  drop constraint if exists transactions_category_check;

alter table public.transactions
  add constraint transactions_category_check
  check (
    category is null
    or category in (
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
  );

comment on column public.transactions.category is
  'Categoria da despesa para Budget Planner. Receitas podem ficar null.';

-- ---------------------------------------------------------------------------
-- budgets (orçamento mensal por usuário)
-- ---------------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null check (year >= 2000 and year <= 2100),
  month integer not null check (month >= 1 and month <= 12),
  status text not null default 'active'
    check (status in ('active', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

comment on table public.budgets is 'Orçamento mensal do usuário (Budget Planner).';
comment on column public.budgets.status is 'active | archived';

create index if not exists budgets_user_id_period_idx
  on public.budgets (user_id, year desc, month desc);

alter table public.budgets enable row level security;

drop policy if exists "Usuários podem ver seus orçamentos" on public.budgets;
create policy "Usuários podem ver seus orçamentos"
  on public.budgets for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir seus orçamentos" on public.budgets;
create policy "Usuários podem inserir seus orçamentos"
  on public.budgets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar seus orçamentos" on public.budgets;
create policy "Usuários podem atualizar seus orçamentos"
  on public.budgets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir seus orçamentos" on public.budgets;
create policy "Usuários podem excluir seus orçamentos"
  on public.budgets for delete
  using (auth.uid() = user_id);

create or replace function public.set_budgets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at
  before update on public.budgets
  for each row
  execute function public.set_budgets_updated_at();

-- ---------------------------------------------------------------------------
-- budget_categories (limites por categoria)
-- ---------------------------------------------------------------------------
create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
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
  limit_amount numeric(12, 2) not null check (limit_amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (budget_id, category)
);

comment on table public.budget_categories is
  'Limites de gasto por categoria dentro de um orçamento mensal.';
comment on column public.budget_categories.limit_amount is
  'Teto de gasto da categoria no mês. Gasto real é derivado das transactions.';

create index if not exists budget_categories_user_id_idx
  on public.budget_categories (user_id);

create index if not exists budget_categories_budget_id_idx
  on public.budget_categories (budget_id);

alter table public.budget_categories enable row level security;

drop policy if exists "Usuários podem ver limites do orçamento" on public.budget_categories;
create policy "Usuários podem ver limites do orçamento"
  on public.budget_categories for select
  using (auth.uid() = user_id);

drop policy if exists "Usuários podem inserir limites do orçamento" on public.budget_categories;
create policy "Usuários podem inserir limites do orçamento"
  on public.budget_categories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem atualizar limites do orçamento" on public.budget_categories;
create policy "Usuários podem atualizar limites do orçamento"
  on public.budget_categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuários podem excluir limites do orçamento" on public.budget_categories;
create policy "Usuários podem excluir limites do orçamento"
  on public.budget_categories for delete
  using (auth.uid() = user_id);

create or replace function public.set_budget_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists budget_categories_set_updated_at on public.budget_categories;
create trigger budget_categories_set_updated_at
  before update on public.budget_categories
  for each row
  execute function public.set_budget_categories_updated_at();

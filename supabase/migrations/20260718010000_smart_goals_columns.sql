-- Atlas v1.0 — Smart Goals
-- Estende public.goals com description, category, status e updated_at.
-- deadline continua sendo target_date (já existente).

alter table public.goals
  add column if not exists description text,
  add column if not exists category text not null default 'other',
  add column if not exists status text not null default 'active',
  add column if not exists updated_at timestamptz not null default now();

alter table public.goals
  drop constraint if exists goals_category_check;

alter table public.goals
  add constraint goals_category_check
  check (
    category in (
      'emergency',
      'travel',
      'purchase',
      'debt',
      'education',
      'investment',
      'other'
    )
  );

alter table public.goals
  drop constraint if exists goals_status_check;

alter table public.goals
  add constraint goals_status_check
  check (status in ('active', 'completed', 'paused', 'cancelled'));

comment on column public.goals.description is 'Descrição opcional da meta (Smart Goals).';
comment on column public.goals.category is 'Categoria da meta (Smart Goals).';
comment on column public.goals.status is 'active | completed | paused | cancelled';
comment on column public.goals.updated_at is 'Última atualização da meta.';

create or replace function public.set_goals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
  before update on public.goals
  for each row
  execute function public.set_goals_updated_at();

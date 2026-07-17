-- Sprint 21 / Missão 21 — vínculos Item Pluggy ↔ usuário Atlas.
-- Escrita/leitura via Edge (service role); UI nunca vê CLIENT_SECRET.

create table if not exists public.pluggy_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  connector_id text,
  connector_name text,
  status text not null default 'updated',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists pluggy_connections_user_id_idx
  on public.pluggy_connections (user_id);

comment on table public.pluggy_connections is
  'Itens Pluggy vinculados ao usuário Atlas (Open Finance / FDL).';

alter table public.pluggy_connections enable row level security;

-- Sem policies para anon/authenticated: apenas service_role na Edge.
revoke all on table public.pluggy_connections from anon, authenticated;

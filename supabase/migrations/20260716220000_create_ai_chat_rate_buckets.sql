-- Sprint 18 / Missão 19 — Rate limiting da Edge Function atlas-ai-chat.
-- Buckets acessados apenas via service role na Edge (não pela UI).

create table if not exists public.ai_chat_rate_buckets (
  bucket_key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.ai_chat_rate_buckets is
  'Contadores de rate limit para atlas-ai-chat (chave user:<uuid> ou ip:<hash>).';

alter table public.ai_chat_rate_buckets enable row level security;

-- Sem policies para anon/authenticated: apenas service_role (bypass RLS) na Edge.
revoke all on table public.ai_chat_rate_buckets from anon, authenticated;

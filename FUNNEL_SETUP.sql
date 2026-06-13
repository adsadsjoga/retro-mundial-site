-- ─── SETUP DO FUNIL ───────────────────────────────────────────────────────────
-- Executa isto no Supabase: Dashboard → SQL Editor → New query → cola e Run.
-- Cria a tabela que regista os eventos do Pixel/CAPI para o funil interno.

create table if not exists funnel_events (
  id           bigint generated always as identity primary key,
  event_name   text not null,            -- PageView, ViewContent, AddToCart, InitiateCheckout, ViewCart, Lead
  event_id     text,                     -- mesmo id usado na deduplicação do Meta
  url          text,
  value        numeric,
  currency     text,
  content_name text,
  created_at   timestamptz not null default now()
);

-- Índices para as queries do funil (filtro por data + contagem por evento)
create index if not exists funnel_events_created_at_idx on funnel_events (created_at);
create index if not exists funnel_events_name_date_idx  on funnel_events (event_name, created_at);

-- RLS: só o backend (service key) escreve/lê — sem acesso público
alter table funnel_events enable row level security;

-- ─── SNAPSHOTS SEMANAIS ───────────────────────────────────────────────────────
-- Foto do funil tirada toda segunda 06:00 (cron Vercel) para ver a progressão.
create table if not exists funnel_snapshots (
  week_start  date primary key,        -- início da semana fotografada
  days        int  not null default 7,
  spend       numeric,
  revenue     numeric,
  roas        numeric,
  stages      jsonb not null,          -- os 7 estágios com valores e taxas
  created_at  timestamptz not null default now()
);
alter table funnel_snapshots enable row level security;

-- ─── HISTÓRICO DE INSIGHTS (análises do Claude) ───────────────────────────────
create table if not exists funnel_insights (
  id            bigint generated always as identity primary key,
  model         text,
  deep          boolean default false,
  days          int,
  period_since  date,
  period_until  date,
  spend         numeric,
  revenue       numeric,
  insights      text not null,
  created_at    timestamptz not null default now()
);
alter table funnel_insights enable row level security;

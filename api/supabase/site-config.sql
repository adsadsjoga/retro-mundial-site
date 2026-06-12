-- Tabela que guarda a config do site (imagens, textos, produtos) numa única
-- linha, para que as edições do admin apareçam para TODOS os visitantes.
-- Rode isto uma vez no Supabase: Dashboard → SQL Editor → New query → Run.

create table if not exists site_config (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table site_config enable row level security;

-- leitura pública (todos os visitantes carregam a config)
drop policy if exists "site_config public read" on site_config;
create policy "site_config public read"
  on site_config for select using (true);

-- escrita liberada (o admin grava). A proteção prática é a senha do admin
-- na interface. Para travar mais, depois pode-se usar uma service_role key.
drop policy if exists "site_config public insert" on site_config;
create policy "site_config public insert"
  on site_config for insert with check (true);

drop policy if exists "site_config public update" on site_config;
create policy "site_config public update"
  on site_config for update using (true) with check (true);

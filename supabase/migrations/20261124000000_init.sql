-- =========================================================================
--  Fluxo CRM — esquema inicial
--  Tabelas: profiles, deals, deal_logs
--  Segurança: Row Level Security (cada usuário só acessa os próprios dados)
--  Execute no SQL Editor do Supabase ou com `supabase db push`.
-- =========================================================================

-- ---------- Perfis (nome exibido; o login fica em auth.users) ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  created_at  timestamptz not null default now()
);

-- Cria o perfil automaticamente no cadastro, com o nome enviado pelo app.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Negócios ----------
create table public.deals (
  id            text primary key check (char_length(id) between 1 and 64),
  owner_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo        text not null check (char_length(titulo) between 1 and 200),
  etapa         text not null default 'prosp'
                check (etapa in ('prosp', 'qual', 'prop', 'neg', 'ganho', 'perdido')),
  motivo_perda  text,
  valor         numeric(14, 2) not null default 0 check (valor >= 0),
  prob          smallint not null default 10 check (prob between 0 and 100),
  fechamento    date,
  resp          text,
  origem        text,
  empresa       text,
  cnpj          text,
  contato       text,
  cargo         text,
  email         text,
  tel           text,
  cidade        text,
  atv_tipo      text,
  atv_data      date,
  atv_desc      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Negócio perdido precisa de motivo (a mesma regra do formulário).
  constraint motivo_obrigatorio check (etapa <> 'perdido' or motivo_perda is not null)
);

create index deals_owner_updated_idx on public.deals (owner_id, updated_at desc);
create index deals_owner_etapa_idx on public.deals (owner_id, etapa);

-- ---------- Histórico de cada negócio ----------
create table public.deal_logs (
  id          uuid primary key default gen_random_uuid(),
  deal_id     text not null references public.deals (id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text        text not null check (char_length(text) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index deal_logs_deal_idx on public.deal_logs (deal_id, created_at desc);
create index deal_logs_owner_idx on public.deal_logs (owner_id);

-- ---------- Row Level Security ----------
alter table public.profiles  enable row level security;
alter table public.deals     enable row level security;
alter table public.deal_logs enable row level security;

-- (select auth.uid()) é avaliado uma vez por consulta: melhor desempenho.
create policy "perfil: ler o próprio"      on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "perfil: editar o próprio"   on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "negócios: ler os próprios"    on public.deals for select to authenticated using (owner_id = (select auth.uid()));
create policy "negócios: criar"              on public.deals for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "negócios: editar os próprios" on public.deals for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "negócios: excluir os próprios" on public.deals for delete to authenticated using (owner_id = (select auth.uid()));

create policy "histórico: ler o próprio"  on public.deal_logs for select to authenticated using (owner_id = (select auth.uid()));
create policy "histórico: registrar"      on public.deal_logs for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.deals d where d.id = deal_id and d.owner_id = (select auth.uid()))
  );
create policy "histórico: excluir o próprio" on public.deal_logs for delete to authenticated using (owner_id = (select auth.uid()));

-- ---------- Sincronização em tempo real entre abas e dispositivos ----------
alter publication supabase_realtime add table public.deals, public.deal_logs;

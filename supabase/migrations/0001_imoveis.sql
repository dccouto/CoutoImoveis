-- Couto Imóveis
-- Cole este script inteiro no SQL Editor do Supabase, em um projeto ainda vazio.
-- Não use service_role no site. A chave do app é só a anon/publishable.

create extension if not exists pgcrypto;

create table public.imoveis (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null check (tipo in ('casa', 'apartamento')),
  status text not null default 'rascunho' check (status in ('rascunho', 'ativo', 'vendido')),
  preco_centavos bigint not null check (preco_centavos >= 0),
  descricao text not null default '',
  bairro text not null default '',
  cidade text not null default '',
  quartos integer not null default 0 check (quartos >= 0),
  banheiros integer not null default 0 check (banheiros >= 0),
  vagas integer not null default 0 check (vagas >= 0),
  area_m2 numeric not null default 0 check (area_m2 >= 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.fotos_imovel (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references public.imoveis (id) on delete cascade,
  caminho text not null,
  capa boolean not null default false,
  ordem integer not null default 0
);

create table public.configuracoes (
  id smallint primary key default 1 check (id = 1),
  numero_whatsapp text not null default '',
  nome_exibido text not null default 'Couto Imóveis'
);

insert into public.configuracoes (id, numero_whatsapp, nome_exibido)
values (1, '', 'Couto Imóveis');

create index imoveis_status_idx on public.imoveis (status);
create index fotos_imovel_imovel_idx on public.fotos_imovel (imovel_id);

create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger imoveis_definir_atualizado_em
before update on public.imoveis
for each row
execute function public.definir_atualizado_em();

alter table public.imoveis enable row level security;
alter table public.fotos_imovel enable row level security;
alter table public.configuracoes enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.imoveis to anon, authenticated;
grant insert, update, delete on public.imoveis to authenticated;
grant select on public.fotos_imovel to anon, authenticated;
grant insert, update, delete on public.fotos_imovel to authenticated;
grant select on public.configuracoes to anon, authenticated;
grant update on public.configuracoes to authenticated;

create policy "publico le imoveis publicados"
on public.imoveis
for select
to anon, authenticated
using (status in ('ativo', 'vendido'));

create policy "autenticado le todos os imoveis"
on public.imoveis
for select
to authenticated
using (true);

create policy "autenticado cria imoveis"
on public.imoveis
for insert
to authenticated
with check (true);

create policy "autenticado atualiza imoveis"
on public.imoveis
for update
to authenticated
using (true)
with check (true);

create policy "autenticado exclui imoveis"
on public.imoveis
for delete
to authenticated
using (true);

create policy "publico le fotos de imoveis publicados"
on public.fotos_imovel
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.imoveis
    where imoveis.id = fotos_imovel.imovel_id
      and imoveis.status in ('ativo', 'vendido')
  )
);

create policy "autenticado le todas as fotos"
on public.fotos_imovel
for select
to authenticated
using (true);

create policy "autenticado cria fotos"
on public.fotos_imovel
for insert
to authenticated
with check (true);

create policy "autenticado atualiza fotos"
on public.fotos_imovel
for update
to authenticated
using (true)
with check (true);

create policy "autenticado exclui fotos"
on public.fotos_imovel
for delete
to authenticated
using (true);

create policy "publico le configuracoes"
on public.configuracoes
for select
to anon, authenticated
using (true);

create policy "autenticado atualiza configuracoes"
on public.configuracoes
for update
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'imoveis',
  'imoveis',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "publico le bucket imoveis"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'imoveis');

create policy "autenticado envia bucket imoveis"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'imoveis');

create policy "autenticado atualiza bucket imoveis"
on storage.objects
for update
to authenticated
using (bucket_id = 'imoveis')
with check (bucket_id = 'imoveis');

create policy "autenticado exclui bucket imoveis"
on storage.objects
for delete
to authenticated
using (bucket_id = 'imoveis');

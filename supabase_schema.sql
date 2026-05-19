-- JMML - Estoque Doméstico (Supabase)
-- Execute este SQL no Supabase (SQL Editor) para criar as tabelas e políticas.
--
-- Requisitos:
-- 1) Auth habilitado (Supabase padrão)
-- 2) RLS habilitado (já incluído aqui)

-- Extensões úteis
create extension if not exists pgcrypto;

-- ====== Tabelas de "Casa/Grupo" (estoque compartilhado) ======
create table if not exists public.cas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo_convite text not null unique,
  criado_em timestamptz not null default now()
);

-- Membros da casa: define quem pode acessar os itens
create table if not exists public.casa_membros (
  casa_id uuid not null references public.cas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  criado_em timestamptz not null default now(),
  primary key (casa_id, user_id)
);

-- ====== Itens de estoque ======
create table if not exists public.estoque_itens (
  id text primary key,
  casa_id uuid not null references public.cas(id) on delete cascade,
  nome text not null,
  categoria text not null,
  local_armazenamento text not null,
  quantidade_atual int not null,
  quantidade_minima_desejada int not null,
  validade date not null,
  observacao text not null default '',
  monitorado boolean not null default true,
  criado_em timestamptz not null,
  atualizado_em timestamptz not null
);

create index if not exists idx_estoque_itens_casa on public.estoque_itens (casa_id);
create index if not exists idx_casa_membros_user on public.casa_membros (user_id);

-- ====== Segurança (RLS) ======
alter table public.cas enable row level security;
alter table public.casa_membros enable row level security;
alter table public.estoque_itens enable row level security;

-- Helper: o usuário é membro da casa?
create or replace function public.is_membro_casa(_casa_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.casa_membros cm
    where cm.casa_id = _casa_id
      and cm.user_id = auth.uid()
  );
$$;

-- Boas práticas: não exponha a função para anônimos
revoke all on function public.is_membro_casa(uuid) from public;
grant execute on function public.is_membro_casa(uuid) to authenticated;

-- Políticas: CAS
-- Usuário pode ver casas das quais é membro
drop policy if exists "cas_select_membro" on public.cas;
create policy "cas_select_membro"
on public.cas
for select
using (public.is_membro_casa(id));

-- Usuário autenticado pode criar uma casa (sem depender de membership anterior)
drop policy if exists "cas_insert_auth" on public.cas;
create policy "cas_insert_auth"
on public.cas
for insert
to authenticated
with check (true);

-- Políticas: CASA_MEMBROS
-- Usuário pode ver membros das casas em que ele é membro
drop policy if exists "casa_membros_select_membro" on public.casa_membros;
create policy "casa_membros_select_membro"
on public.casa_membros
for select
using (public.is_membro_casa(casa_id));

-- Usuário pode inserir a si mesmo como membro APENAS via função join (recomendado),
-- então não abrimos insert direto aqui.

-- Políticas: ESTOQUE_ITENS
drop policy if exists "estoque_select_membro" on public.estoque_itens;
create policy "estoque_select_membro"
on public.estoque_itens
for select
using (public.is_membro_casa(casa_id));

drop policy if exists "estoque_insert_membro" on public.estoque_itens;
create policy "estoque_insert_membro"
on public.estoque_itens
for insert
with check (public.is_membro_casa(casa_id));

drop policy if exists "estoque_update_membro" on public.estoque_itens;
create policy "estoque_update_membro"
on public.estoque_itens
for update
using (public.is_membro_casa(casa_id))
with check (public.is_membro_casa(casa_id));

drop policy if exists "estoque_delete_membro" on public.estoque_itens;
create policy "estoque_delete_membro"
on public.estoque_itens
for delete
using (public.is_membro_casa(casa_id));

-- ====== Função RPC: entrar na casa por código ======
-- Segurança: SECURITY DEFINER permite inserir membership sem abrir policy de insert.
-- A função valida o código e adiciona o usuário atual como membro.
create or replace function public.entrar_na_casa(_codigo_convite text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_casa_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select c.id into v_casa_id
  from public.cas c
  where c.codigo_convite = _codigo_convite
  limit 1;

  if v_casa_id is null then
    raise exception 'codigo_invalido';
  end if;

  insert into public.casa_membros (casa_id, user_id, role)
  values (v_casa_id, auth.uid(), 'member')
  on conflict (casa_id, user_id) do nothing;

  return v_casa_id;
end;
$$;

revoke all on function public.entrar_na_casa(text) from public;
grant execute on function public.entrar_na_casa(text) to authenticated;

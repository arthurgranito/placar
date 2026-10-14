-- Fase 1 — perfis (profiles), já no formato do roadmap do Placar.
--
-- Regras (ADR-02, ADR-03):
-- * O perfil nasce pelo trigger em auth.users; o cliente nunca faz insert nem delete.
-- * O cliente só atualiza display_name, avatar_url, timezone e show_in_cards (grant por coluna).
-- * is_adult_confirmed / adult_confirmed_at só mudam por confirm_adult() (security definer).

-- Valida nomes de fuso do IANA (ex.: America/Sao_Paulo).
create or replace function public.is_valid_timezone(tz text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  perform now() at time zone tz;
  return true;
exception when others then
  return false;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null
    constraint profiles_display_name_tamanho check (char_length(btrim(display_name)) between 1 and 40),
  avatar_url text
    constraint profiles_avatar_url_tamanho check (char_length(avatar_url) <= 2048),
  timezone text not null default 'America/Sao_Paulo'
    constraint profiles_timezone_valido check (public.is_valid_timezone(timezone)),
  is_adult_confirmed boolean not null default false,
  adult_confirmed_at timestamptz,
  show_in_cards boolean not null default true,
  created_at timestamptz not null default now(),
  constraint profiles_adulto_coerente
    check (is_adult_confirmed = (adult_confirmed_at is not null))
);

comment on table public.profiles is 'Perfil de cada pessoa (1:1 com auth.users). Criado pelo trigger on_auth_user_created.';
comment on column public.profiles.is_adult_confirmed is 'Autodeclaração 18+ (ADR-03). Só muda por confirm_adult().';
comment on column public.profiles.show_in_cards is 'Consentimento para o nome/avatar aparecer nos cards da casa (ADR-06).';

alter table public.profiles enable row level security;

-- Privilégios: nada de insert/delete pelo cliente; update só nas colunas editáveis.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url, timezone, show_in_cards) on table public.profiles to authenticated;

-- Leitura: o próprio perfil.
-- TODO(fase 3): incluir os perfis dos membros da mesma casa, usando is_member(household_id)
-- quando households/household_members existirem.
create policy "profiles: ler o próprio perfil"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles: atualizar o próprio perfil"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Nome inicial a partir dos metadados do Google (ou do e-mail), limitado a 40 caracteres.
create or replace function public.profile_name_from_metadata(meta jsonb, email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select left(
    coalesce(
      nullif(btrim(meta ->> 'full_name'), ''),
      nullif(btrim(meta ->> 'name'), ''),
      nullif(btrim(split_part(coalesce(email, ''), '@', 1)), ''),
      'Morador(a)'
    ),
    40
  );
$$;

-- Trigger: cria o perfil quando a pessoa entra pela primeira vez (F01, passo 4).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    public.profile_name_from_metadata(new.raw_user_meta_data, new.email),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Garante o perfil da pessoa logada (F01, erro 4e: o callback cria o profile se ele faltar).
create or replace function public.ensure_profile()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'sem sessão' using errcode = '42501';
  end if;

  insert into public.profiles (id, display_name, avatar_url)
  select
    u.id,
    public.profile_name_from_metadata(u.raw_user_meta_data, u.email),
    coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
  from auth.users u
  where u.id = uid
  on conflict (id) do nothing;
end;
$$;

revoke execute on function public.ensure_profile() from public, anon;
grant execute on function public.ensure_profile() to authenticated;

-- Autodeclaração 18+ (F02, passo 2). Idempotente: mantém a data da primeira confirmação.
create or replace function public.confirm_adult()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'sem sessão' using errcode = '42501';
  end if;

  update public.profiles
     set is_adult_confirmed = true,
         adult_confirmed_at = coalesce(adult_confirmed_at, now())
   where id = uid;

  if not found then
    raise exception 'perfil não encontrado' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.confirm_adult() from public, anon;
grant execute on function public.confirm_adult() to authenticated;

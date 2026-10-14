-- Testes de profiles: trigger de criação, RLS, grant por coluna e confirm_adult().
begin;
create extension if not exists pgtap with schema extensions;

select plan(29);

-- Usuários de teste (o trigger on_auth_user_created cria os perfis).
insert into auth.users (id, email, raw_user_meta_data, aud, role)
values
  ('00000000-0000-0000-0000-00000000000a', 'ana@exemplo.com',
   '{"full_name": "Ana Souza", "avatar_url": "https://exemplo.com/ana.png"}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000b', 'joao@exemplo.com',
   '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000c', 'longo@exemplo.com',
   jsonb_build_object('name', repeat('x', 60)), 'authenticated', 'authenticated');

-- Estrutura -----------------------------------------------------------------
select has_table('public', 'profiles', 'profiles existe');
select columns_are('public', 'profiles',
  array['id', 'display_name', 'avatar_url', 'timezone', 'is_adult_confirmed',
        'adult_confirmed_at', 'show_in_cards', 'created_at'],
  'profiles tem exatamente as colunas do roadmap');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'RLS ligado em profiles');

-- Trigger --------------------------------------------------------------------
select results_eq(
  $$ select display_name, avatar_url, timezone, is_adult_confirmed, adult_confirmed_at, show_in_cards
       from public.profiles where id = '00000000-0000-0000-0000-00000000000a' $$,
  $$ values ('Ana Souza'::text, 'https://exemplo.com/ana.png'::text, 'America/Sao_Paulo'::text,
             false, null::timestamptz, true) $$,
  'trigger cria o perfil com nome e avatar do Google e os padrões');
select is(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000b'),
  'joao', 'sem nome nos metadados, usa a parte local do e-mail');
select is(
  (select char_length(display_name) from public.profiles where id = '00000000-0000-0000-0000-00000000000c'),
  40, 'nome do Google é cortado em 40 caracteres');

-- Grants por coluna ----------------------------------------------------------
select ok(has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE'), 'pode atualizar display_name');
select ok(has_column_privilege('authenticated', 'public.profiles', 'avatar_url', 'UPDATE'), 'pode atualizar avatar_url');
select ok(has_column_privilege('authenticated', 'public.profiles', 'timezone', 'UPDATE'), 'pode atualizar timezone');
select ok(has_column_privilege('authenticated', 'public.profiles', 'show_in_cards', 'UPDATE'), 'pode atualizar show_in_cards');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'is_adult_confirmed', 'UPDATE'), 'não pode atualizar is_adult_confirmed');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'adult_confirmed_at', 'UPDATE'), 'não pode atualizar adult_confirmed_at');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE'), 'não pode atualizar id');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'created_at', 'UPDATE'), 'não pode atualizar created_at');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'INSERT'), 'authenticated não insere');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'DELETE'), 'authenticated não apaga');
select ok(not has_table_privilege('anon', 'public.profiles', 'SELECT'), 'anon não lê profiles');
select ok(not has_function_privilege('anon', 'public.confirm_adult()', 'EXECUTE'), 'anon não executa confirm_adult');

-- Como Ana (authenticated) ----------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}', true);

select is((select count(*)::int from public.profiles), 1, 'Ana só vê o próprio perfil');

update public.profiles
   set display_name = 'Ana', show_in_cards = false, timezone = 'America/Manaus'
 where id = '00000000-0000-0000-0000-00000000000a';
select results_eq(
  $$ select display_name, show_in_cards, timezone from public.profiles $$,
  $$ values ('Ana'::text, false, 'America/Manaus'::text) $$,
  'Ana atualiza nome, cards e fuso');

select throws_ok(
  $$ update public.profiles set is_adult_confirmed = true where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501', null, 'update direto em is_adult_confirmed é negado');

select throws_ok(
  $$ update public.profiles set display_name = '   ' where id = '00000000-0000-0000-0000-00000000000a' $$,
  '23514', null, 'nome vazio é rejeitado');
select throws_ok(
  $$ update public.profiles set display_name = repeat('a', 41) where id = '00000000-0000-0000-0000-00000000000a' $$,
  '23514', null, 'nome com mais de 40 caracteres é rejeitado');
select throws_ok(
  $$ update public.profiles set timezone = 'Lua/Base_Alfa' where id = '00000000-0000-0000-0000-00000000000a' $$,
  '23514', null, 'fuso inválido é rejeitado');

update public.profiles set display_name = 'Hackeado' where id = '00000000-0000-0000-0000-00000000000b';

select lives_ok($$ select public.confirm_adult() $$, 'Ana confirma 18+');

reset role;
select is(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000b'),
  'joao', 'Ana não altera o perfil do João');

select ok(
  (select is_adult_confirmed and adult_confirmed_at is not null
     from public.profiles where id = '00000000-0000-0000-0000-00000000000a'),
  'confirm_adult grava is_adult_confirmed e adult_confirmed_at');
select ok(
  (select not is_adult_confirmed from public.profiles where id = '00000000-0000-0000-0000-00000000000b'),
  'confirm_adult só mexe no perfil de quem chamou');

-- ensure_profile recria um perfil que faltou (F01-4e).
delete from public.profiles where id = '00000000-0000-0000-0000-00000000000b';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-00000000000b", "role": "authenticated"}', true);
select public.ensure_profile();
select is((select display_name from public.profiles), 'joao', 'ensure_profile recria o perfil que faltava');

select * from finish();
rollback;

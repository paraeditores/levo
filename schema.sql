-- Pega esto en Supabase → SQL Editor → Run
create table if not exists habits(
  id text primary key, user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null, area text not null check (area in ('cuerpo','trabajo','mente','vida')),
  ord bigint default 0, active boolean default true);
create table if not exists days(
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day date not null, done jsonb not null default '{}', updated_at timestamptz default now(),
  primary key(user_id,day));
create table if not exists log(
  id bigserial primary key, user_id uuid not null default auth.uid() references auth.users on delete cascade,
  at timestamptz not null default now(), text text not null, kind text default 'nota');
create table if not exists push_subs(
  endpoint text primary key, user_id uuid not null default auth.uid() references auth.users on delete cascade,
  sub jsonb not null, created_at timestamptz default now());
create table if not exists avisos(
  user_id uuid not null references auth.users on delete cascade, day date not null, slot text not null,
  sent_at timestamptz default now(), primary key(user_id,day,slot));
alter table habits enable row level security;
alter table days enable row level security;
alter table log enable row level security;
alter table push_subs enable row level security;
alter table avisos enable row level security;
create policy own_habits on habits for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy own_days on days for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy own_log on log for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy own_push on push_subs for all using (user_id=auth.uid()) with check (user_id=auth.uid());
-- Fase casa y premios (2026-10-17)
create table if not exists purchases(id bigserial primary key, user_id uuid not null default auth.uid() references auth.users on delete cascade, item text not null, kind text not null default 'item', cost int not null, minutes int, at timestamptz not null default now());
create table if not exists profile(user_id uuid primary key default auth.uid() references auth.users on delete cascade, outfit jsonb not null default '{}', updated_at timestamptz default now());
alter table purchases enable row level security;
alter table profile enable row level security;
create policy own_purchases on purchases for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy own_profile on profile for all using (user_id=auth.uid()) with check (user_id=auth.uid());
-- Amigos, habitaciones visibles y toques (2026-10-17)
create table if not exists rooms(user_id uuid primary key references auth.users on delete cascade, code text unique not null, name text not null default 'Jugador', snap jsonb not null default '{}', updated_at timestamptz default now());
create table if not exists friends(user_id uuid not null references auth.users on delete cascade, friend_id uuid not null references auth.users on delete cascade, status text not null default 'pending', created_at timestamptz default now(), primary key(user_id,friend_id));
create table if not exists nudges(id bigserial primary key, from_id uuid not null default auth.uid() references auth.users on delete cascade, to_id uuid not null references auth.users on delete cascade, at timestamptz default now(), sent boolean default false, seen boolean default false);
alter table rooms enable row level security; alter table friends enable row level security; alter table nudges enable row level security;
create or replace function are_linked(a uuid, b uuid) returns boolean language sql security definer set search_path=public as $$ select exists(select 1 from friends where (user_id=a and friend_id=b) or (user_id=b and friend_id=a)) $$;
create or replace function are_friends(a uuid, b uuid) returns boolean language sql security definer set search_path=public as $$ select exists(select 1 from friends where status='accepted' and ((user_id=a and friend_id=b) or (user_id=b and friend_id=a))) $$;
create policy rooms_read on rooms for select using (user_id=auth.uid() or are_linked(auth.uid(), user_id));
create policy rooms_ins on rooms for insert with check (user_id=auth.uid());
create policy rooms_upd on rooms for update using (user_id=auth.uid());
create policy friends_read on friends for select using (user_id=auth.uid() or friend_id=auth.uid());
create policy friends_upd on friends for update using (friend_id=auth.uid());
create policy friends_del on friends for delete using (user_id=auth.uid() or friend_id=auth.uid());
create policy nudges_ins on nudges for insert with check (from_id=auth.uid() and are_friends(auth.uid(), to_id));
create policy nudges_read on nudges for select using (to_id=auth.uid() or from_id=auth.uid());
create policy nudges_upd on nudges for update using (to_id=auth.uid());
create or replace function add_friend(c text) returns text language plpgsql security definer set search_path=public as $$ declare t uuid; begin select user_id into t from rooms where code=upper(c); if t is null then return 'no_existe'; end if; if t=auth.uid() then return 'eres_tu'; end if; if exists(select 1 from friends where user_id=t and friend_id=auth.uid()) then update friends set status='accepted' where user_id=t and friend_id=auth.uid(); return 'aceptado'; end if; insert into friends(user_id,friend_id) values(auth.uid(),t) on conflict do nothing; return 'enviado'; end $$;
-- Tu cuerpo (2026-10-18): datos privados, nunca en la foto que ven los amigos
create table if not exists body_profile(user_id uuid primary key default auth.uid() references auth.users on delete cascade, height_cm numeric, weight_kg numeric, goal text check (goal in ('perder','mantener','ganar')), updated_at timestamptz default now());
create table if not exists weighins(user_id uuid not null default auth.uid() references auth.users on delete cascade, day date not null, kg numeric not null, primary key(user_id,day));
alter table body_profile enable row level security; alter table weighins enable row level security;
create policy own_body on body_profile for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy own_weighins on weighins for all using (user_id=auth.uid()) with check (user_id=auth.uid());

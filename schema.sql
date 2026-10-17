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

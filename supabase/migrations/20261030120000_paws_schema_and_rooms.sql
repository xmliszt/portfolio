create schema if not exists "paws";

grant usage on schema "paws" to "anon", "authenticated", "service_role";

alter default privileges for role "postgres" in schema "paws" grant all on tables to "service_role";
alter default privileges for role "postgres" in schema "paws" grant all on sequences to "service_role";
alter default privileges for role "postgres" in schema "paws" grant all on functions to "service_role";

create table "paws"."room_members" (
  "room_id" text not null check ("room_id" ~ '^[a-z0-9-]{1,64}$'),
  "user_id" uuid not null references "auth"."users" ("id") on delete cascade,
  "role" text not null check ("role" in ('player', 'watcher')),
  "joined_at" timestamptz not null default now(),
  "last_seen_at" timestamptz not null default now(),
  primary key ("room_id", "user_id")
);

create index "room_members_user_id_idx" on "paws"."room_members" ("user_id");
create index "room_members_last_seen_at_idx" on "paws"."room_members" ("last_seen_at");

alter table "paws"."room_members" enable row level security;

create table "paws"."room_joins" (
  "id" bigint generated always as identity primary key,
  "user_id" uuid not null references "auth"."users" ("id") on delete cascade,
  "created_at" timestamptz not null default now()
);

create index "room_joins_user_id_created_at_idx" on "paws"."room_joins" ("user_id", "created_at");

alter table "paws"."room_joins" enable row level security;

grant all on table "paws"."room_members", "paws"."room_joins" to "service_role";

-- Realtime policies run as the caller, who cannot read "room_members" through RLS.
create function "paws"."room_role"("p_topic" text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from paws.room_members m
  where p_topic like 'paws:room:%'
    and m.room_id = substr(p_topic, char_length('paws:room:') + 1)
    and m.user_id = (select auth.uid())
    and m.last_seen_at > now() - interval '90 seconds';
$$;

revoke execute on function "paws"."room_role"(text) from public, "anon";
grant execute on function "paws"."room_role"(text) to "authenticated", "service_role";

create policy "paws room members receive"
on "realtime"."messages"
for select
to "authenticated"
using (
  (select realtime.topic()) like 'paws:room:%'
  and "realtime"."messages"."extension" in ('broadcast', 'presence')
  and (select paws.room_role((select realtime.topic()))) is not null
);

create policy "paws room players send"
on "realtime"."messages"
for insert
to "authenticated"
with check (
  (select realtime.topic()) like 'paws:room:%'
  and "realtime"."messages"."extension" in ('broadcast', 'presence')
  and (select paws.room_role((select realtime.topic()))) = 'player'
);

create policy "paws room guests never send"
on "realtime"."messages"
as restrictive
for insert
to "authenticated"
with check (
  (select realtime.topic()) not like 'paws:room:%'
  or (select (auth.jwt()->>'is_anonymous')::boolean) is false
);

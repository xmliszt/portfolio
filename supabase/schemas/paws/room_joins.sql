create table "paws"."room_joins" (
  "id" bigint generated always as identity primary key,
  "user_id" uuid not null references "auth"."users" ("id") on delete cascade,
  "created_at" timestamptz not null default now()
);

create index "room_joins_user_id_created_at_idx" on "paws"."room_joins" ("user_id", "created_at");

alter table "paws"."room_joins" enable row level security;
revoke all on table "paws"."room_joins" from public, "anon", "authenticated";
grant all on table "paws"."room_joins" to "service_role";

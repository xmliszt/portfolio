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
revoke all on table "paws"."room_members" from public, "anon", "authenticated";
grant all on table "paws"."room_members" to "service_role";

create table "paws"."chat_messages" (
  "id" uuid primary key default gen_random_uuid(),
  "room_id" text not null check ("room_id" ~ '^[a-z0-9-]{1,64}$'),
  "user_id" uuid not null references "auth"."users" ("id") on delete cascade,
  "text" text not null check (char_length("text") between 1 and 60),
  "created_at" timestamptz not null default now()
);

create index "chat_messages_user_id_created_at_idx" on "paws"."chat_messages" ("user_id", "created_at");

alter table "paws"."chat_messages" enable row level security;
revoke all on table "paws"."chat_messages" from public, "anon", "authenticated";
grant all on table "paws"."chat_messages" to "service_role";

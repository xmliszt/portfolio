create table "paws"."cats" (
  "user_id" uuid primary key references auth.users on delete cascade,
  "look" jsonb not null,
  "voice" jsonb not null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

alter table "paws"."cats" enable row level security;
revoke all on table "paws"."cats" from public, "anon", "authenticated";
grant all on table "paws"."cats" to "service_role";

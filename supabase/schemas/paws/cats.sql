create table "paws"."cats" (
  "user_id" uuid primary key references auth.users on delete cascade,
  "look" jsonb not null,
  "voice" jsonb not null,
  "meow_key" text references "paws"."meows" ("key") on delete set null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create index "cats_meow_key_idx" on "paws"."cats" using btree ("meow_key");

alter table "paws"."cats" enable row level security;
revoke all on table "paws"."cats" from public, "anon", "authenticated";
grant all on table "paws"."cats" to "service_role";

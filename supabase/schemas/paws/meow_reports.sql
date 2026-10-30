create table "paws"."meow_reports" (
  "meow_key" text not null references "paws"."meows" ("key") on delete cascade,
  "reporter_id" uuid not null references auth.users on delete cascade,
  "created_at" timestamptz not null default now(),
  primary key ("meow_key", "reporter_id")
);

alter table "paws"."meow_reports" enable row level security;
revoke all on table "paws"."meow_reports" from public, "anon", "authenticated";
grant all on table "paws"."meow_reports" to "service_role";

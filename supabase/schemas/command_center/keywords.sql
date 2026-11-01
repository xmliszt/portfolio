create table "command_center"."keywords" (
  "id" uuid primary key default gen_random_uuid(),
  "term" text not null unique,
  "created_at" timestamptz not null default now(),
  "archived_at" timestamptz
);

alter table "command_center"."keywords" enable row level security;
revoke all on table "command_center"."keywords" from public, "anon", "authenticated";
grant all on table "command_center"."keywords" to "service_role";

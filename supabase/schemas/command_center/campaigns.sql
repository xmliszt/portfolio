create table "command_center"."campaigns" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "link" text,
  "starts_at" timestamptz,
  "notes" text,
  "created_at" timestamptz not null default now()
);

alter table "command_center"."campaigns" enable row level security;
revoke all on table "command_center"."campaigns" from public, "anon", "authenticated";
grant all on table "command_center"."campaigns" to "service_role";

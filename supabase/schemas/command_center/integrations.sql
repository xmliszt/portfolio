create table "command_center"."integrations" (
  "provider" text primary key,
  "access_token" text not null,
  "user_id" text,
  "username" text,
  "expires_at" timestamptz,
  "updated_at" timestamptz not null default now()
);

alter table "command_center"."integrations" enable row level security;
revoke all on table "command_center"."integrations" from public, "anon", "authenticated";
grant all on table "command_center"."integrations" to "service_role";

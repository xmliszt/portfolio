create table "command_center"."telegram_updates" (
  "update_id" bigint primary key,
  "received_at" timestamptz not null default now()
);

alter table "command_center"."telegram_updates" enable row level security;
revoke all on table "command_center"."telegram_updates" from public, "anon", "authenticated";
grant all on table "command_center"."telegram_updates" to "service_role";

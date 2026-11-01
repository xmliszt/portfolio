create table "command_center"."notes" (
  "id" uuid primary key default gen_random_uuid(),
  "campaign_id" uuid not null references "command_center"."campaigns" ("id") on delete cascade,
  "body" text not null,
  "created_at" timestamptz not null default now()
);

create index "notes_campaign_id_idx" on "command_center"."notes" ("campaign_id");

alter table "command_center"."notes" enable row level security;
revoke all on table "command_center"."notes" from public, "anon", "authenticated";
grant all on table "command_center"."notes" to "service_role";

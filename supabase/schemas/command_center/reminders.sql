create table "command_center"."reminders" (
  "id" bigint generated always as identity primary key,
  "post_id" uuid not null references "command_center"."posts" ("id") on delete cascade,
  "kind" text not null check ("kind" in ('post', 'reply', 'log', 'repost')),
  "checkpoint" text check ("checkpoint" in ('1h', '24h', '7d', 'extra')),
  "fire_at" timestamptz not null,
  "sent_at" timestamptz,
  "telegram_message_id" bigint,
  "done_at" timestamptz,
  unique nulls not distinct ("post_id", "kind", "checkpoint")
);

create index "reminders_fire_at_idx" on "command_center"."reminders" ("fire_at") where "sent_at" is null;
create index "reminders_telegram_message_id_idx" on "command_center"."reminders" ("telegram_message_id");

alter table "command_center"."reminders" enable row level security;
revoke all on table "command_center"."reminders" from public, "anon", "authenticated";
grant all on table "command_center"."reminders" to "service_role";

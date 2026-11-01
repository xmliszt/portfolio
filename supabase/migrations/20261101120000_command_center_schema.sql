create schema if not exists "command_center";

grant usage on schema "command_center" to "service_role";

alter default privileges for role "postgres" in schema "command_center" grant all on tables to "service_role";
alter default privileges for role "postgres" in schema "command_center" grant all on sequences to "service_role";
alter default privileges for role "postgres" in schema "command_center" grant all on functions to "service_role";

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

create table "command_center"."posts" (
  "id" uuid primary key default gen_random_uuid(),
  "campaign_id" uuid not null references "command_center"."campaigns" ("id") on delete cascade,
  "platform" text not null check ("platform" in ('producthunt', 'x', 'threads', 'instagram', 'tiktok', 'reddit', 'xiaohongshu', 'wechat_channels', 'wechat_article', 'youtube')),
  "kind" text not null default 'post' check ("kind" in ('post', 'reply', 'comment', 'repost')),
  "parent_post_id" uuid references "command_center"."posts" ("id") on delete cascade,
  "target" text,
  "scheduled_at" timestamptz,
  "posted_at" timestamptz,
  "status" text not null default 'draft' check ("status" in ('draft', 'scheduled', 'posted', 'skipped')),
  "title" text,
  "body" text not null default '',
  "hashtags" text[] not null default '{}',
  "link" text,
  "assets" jsonb not null default '[]',
  "url" text,
  "variant" text not null default 'mine' check ("variant" in ('mine', 'chatgpt')),
  "variant_group" uuid,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create index "posts_campaign_id_scheduled_at_idx" on "command_center"."posts" ("campaign_id", "scheduled_at");
create index "posts_parent_post_id_idx" on "command_center"."posts" ("parent_post_id");

alter table "command_center"."posts" enable row level security;
revoke all on table "command_center"."posts" from public, "anon", "authenticated";
grant all on table "command_center"."posts" to "service_role";

create table "command_center"."post_metrics" (
  "id" bigint generated always as identity primary key,
  "post_id" uuid not null references "command_center"."posts" ("id") on delete cascade,
  "checkpoint" text not null check ("checkpoint" in ('1h', '24h', '7d', 'extra')),
  "captured_at" timestamptz not null default now(),
  "views" integer,
  "likes" integer,
  "comments" integer,
  "shares" integer,
  "saves" integer,
  "clicks" integer,
  "upvotes" integer,
  "rank" integer
);

create index "post_metrics_post_id_captured_at_idx" on "command_center"."post_metrics" ("post_id", "captured_at");

alter table "command_center"."post_metrics" enable row level security;
revoke all on table "command_center"."post_metrics" from public, "anon", "authenticated";
grant all on table "command_center"."post_metrics" to "service_role";

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


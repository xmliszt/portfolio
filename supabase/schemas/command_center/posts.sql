create table "command_center"."posts" (
  "id" uuid primary key default gen_random_uuid(),
  "campaign_id" uuid not null references "command_center"."campaigns" ("id") on delete cascade,
  "platform" text not null check ("platform" in ('producthunt', 'x', 'threads', 'instagram', 'tiktok', 'reddit', 'xiaohongshu', 'wechat_channels', 'wechat_moments', 'youtube')),
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

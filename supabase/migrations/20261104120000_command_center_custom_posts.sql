alter table "command_center"."posts"
  alter column "campaign_id" drop not null,
  add column "project" text,
  add constraint "posts_custom_post_has_project" check ("campaign_id" is not null or "project" is not null);

create index "posts_custom_scheduled_at_idx" on "command_center"."posts" ("scheduled_at") where "campaign_id" is null;

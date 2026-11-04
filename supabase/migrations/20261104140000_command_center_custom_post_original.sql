alter table "command_center"."posts"
  add column "original_ref" text,
  add constraint "posts_original_ref_custom_only" check ("original_ref" is null or ("campaign_id" is null and "parent_post_id" is null));

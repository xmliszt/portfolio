alter table "command_center"."posts"
  drop constraint "posts_custom_post_has_project",
  add constraint "posts_custom_post_has_project" check ("campaign_id" is not null or btrim(coalesce("project", '')) <> '');

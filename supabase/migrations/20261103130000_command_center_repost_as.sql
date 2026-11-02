alter table "command_center"."posts"
  add column "repost_as" text not null default 'post' check ("repost_as" in ('post', 'quote', 'repost'));

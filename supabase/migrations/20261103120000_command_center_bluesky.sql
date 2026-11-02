alter table "command_center"."posts" drop constraint "posts_platform_check";

alter table "command_center"."posts" add constraint "posts_platform_check" check ("platform" in ('producthunt', 'x', 'threads', 'instagram', 'tiktok', 'reddit', 'xiaohongshu', 'wechat_channels', 'wechat_moments', 'youtube', 'linkedin', 'bluesky'));

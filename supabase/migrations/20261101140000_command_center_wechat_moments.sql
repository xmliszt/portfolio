alter table "command_center"."posts" drop constraint "posts_platform_check";

update "command_center"."posts"
set
  "platform" = 'wechat_moments',
  "title" = null,
  "body" = '做了一个小小的网页作品，叫 Paws。

隔着一层磨砂玻璃，从下面抬头看大家的猫。你不知道它们的主人是谁，但也许某一刻，一只猫会慢慢走过来，轻轻把爪子贴在你的指尖。

可以捏一只自己的猫带进来，也可以只是待一会儿 🐾
链接在评论里',
  "assets" = '[{"file":"social/xiaohongshu-1.png","alt":""},{"file":"social/xiaohongshu-2.png","alt":""},{"file":"social/xiaohongshu-3.png","alt":""},{"file":"social/xiaohongshu-4.png","alt":""},{"file":"social/xiaohongshu-5.png","alt":""},{"file":"social/xiaohongshu-6.png","alt":""}]',
  "updated_at" = now()
where "platform" = 'wechat_article';

alter table "command_center"."posts" add constraint "posts_platform_check" check ("platform" in ('producthunt', 'x', 'threads', 'instagram', 'tiktok', 'reddit', 'xiaohongshu', 'wechat_channels', 'wechat_moments', 'youtube'));

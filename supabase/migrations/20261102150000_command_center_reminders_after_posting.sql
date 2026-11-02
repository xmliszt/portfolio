delete from "command_center"."reminders" r
using "command_center"."posts" p
where p."id" = r."post_id"
  and p."status" <> 'posted'
  and r."kind" in ('reply', 'log')
  and r."sent_at" is null;

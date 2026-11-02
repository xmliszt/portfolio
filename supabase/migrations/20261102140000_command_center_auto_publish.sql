alter table "command_center"."posts"
  add column "auto_publish" boolean not null default false,
  add column "publish_claimed_at" timestamptz,
  add column "publish_error" text,
  add column "platform_post_id" text;

create index "posts_auto_publish_due_idx" on "command_center"."posts" ("scheduled_at")
  where "auto_publish" and "status" = 'scheduled';

select cron.schedule(
  'command-center-publish',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://cc.liyuxuan.dev/api/cc/publish/run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cc_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 300000
  )
  where exists (select 1 from vault.decrypted_secrets where name = 'cc_cron_secret');
  $$
);

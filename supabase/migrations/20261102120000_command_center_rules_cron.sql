select cron.schedule(
  'command-center-rules',
  '40 2 * * *',
  $$
  select net.http_post(
    url := 'https://cc.liyuxuan.dev/api/cc/rules/run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cc_cron_secret')
    ),
    body := '{}'::jsonb
  )
  where exists (select 1 from vault.decrypted_secrets where name = 'cc_cron_secret');
  $$
);

create unique index "posts_one_repost_per_original_idx" on "command_center"."posts" ("parent_post_id") where "kind" = 'repost';

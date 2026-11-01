create extension if not exists "pg_cron";
create extension if not exists "pg_net";

select cron.schedule(
  'command-center-reminders',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://cc.liyuxuan.dev/api/cc/reminders/run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cc_cron_secret')
    ),
    body := '{}'::jsonb
  )
  where exists (select 1 from vault.decrypted_secrets where name = 'cc_cron_secret');
  $$
);

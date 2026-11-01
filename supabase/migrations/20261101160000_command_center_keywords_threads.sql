create table "command_center"."keywords" (
  "id" uuid primary key default gen_random_uuid(),
  "term" text not null unique,
  "created_at" timestamptz not null default now(),
  "archived_at" timestamptz
);

alter table "command_center"."keywords" enable row level security;
revoke all on table "command_center"."keywords" from public, "anon", "authenticated";
grant all on table "command_center"."keywords" to "service_role";

create table "command_center"."keyword_counts" (
  "keyword_id" uuid not null references "command_center"."keywords" ("id") on delete cascade,
  "day" date not null,
  "source" text not null default 'x',
  "count" integer not null,
  "fetched_at" timestamptz not null default now(),
  primary key ("keyword_id", "day", "source")
);

alter table "command_center"."keyword_counts" enable row level security;
revoke all on table "command_center"."keyword_counts" from public, "anon", "authenticated";
grant all on table "command_center"."keyword_counts" to "service_role";

create table "command_center"."integrations" (
  "provider" text primary key,
  "access_token" text not null,
  "user_id" text,
  "username" text,
  "expires_at" timestamptz,
  "updated_at" timestamptz not null default now()
);

alter table "command_center"."integrations" enable row level security;
revoke all on table "command_center"."integrations" from public, "anon", "authenticated";
grant all on table "command_center"."integrations" to "service_role";

select cron.schedule(
  'command-center-keywords',
  '10 2 * * *',
  $$
  select net.http_post(
    url := 'https://cc.liyuxuan.dev/api/cc/keywords/run',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cc_cron_secret')
    ),
    body := '{}'::jsonb
  )
  where exists (select 1 from vault.decrypted_secrets where name = 'cc_cron_secret');
  $$
);

select cron.schedule(
  'command-center-threads-sync',
  '20 2 * * *',
  $$
  select net.http_post(
    url := 'https://cc.liyuxuan.dev/api/cc/threads/sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cc_cron_secret')
    ),
    body := '{}'::jsonb
  )
  where exists (select 1 from vault.decrypted_secrets where name = 'cc_cron_secret');
  $$
);

drop function if exists "paws"."claim_meow"(uuid, timestamptz, timestamptz);
drop function if exists "paws"."reserve_credits"(date, integer, integer);
drop function if exists "paws"."release_credits"(date, integer);
drop trigger if exists "meow_reports_count" on "paws"."meow_reports";
drop function if exists "paws"."count_meow_report"();
drop table if exists "paws"."meow_reports";
drop table if exists "paws"."meow_attempts";
drop table if exists "paws"."daily_credits";
drop index if exists "paws"."cats_meow_key_idx";
alter table "paws"."cats"
  drop column if exists "meow_key",
  drop column if exists "meow_claimed_at";
drop table if exists "paws"."meows";

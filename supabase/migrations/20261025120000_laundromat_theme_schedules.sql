create table "laundro_cafe"."theme_schedules" (
  "id" text primary key check (length("id") between 1 and 100),
  "theme_id" text not null check ("theme_id" ~ '^[a-z][a-z0-9-]{0,63}$'),
  "enabled" boolean not null default false,
  "start_month" integer not null check ("start_month" between 1 and 12),
  "start_day" integer not null check ("start_day" between 1 and 31),
  "end_month" integer not null check ("end_month" between 1 and 12),
  "end_day" integer not null check ("end_day" between 1 and 31),
  "time_zone" text not null default 'UTC',
  "priority" integer not null default 0,
  constraint "theme_schedule_start_date" check (make_date(2001, "start_month", "start_day") is not null),
  constraint "theme_schedule_end_date" check (make_date(2001, "end_month", "end_day") is not null),
  constraint "theme_schedule_distinct_dates" check (("start_month", "start_day") <> ("end_month", "end_day"))
);

alter table "laundro_cafe"."theme_schedules" enable row level security;
revoke all on table "laundro_cafe"."theme_schedules" from public, "anon", "authenticated";
grant select, insert, update, delete on table "laundro_cafe"."theme_schedules" to "service_role";

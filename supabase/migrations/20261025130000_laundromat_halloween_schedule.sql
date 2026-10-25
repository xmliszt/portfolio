insert into "laundro_cafe"."theme_schedules"
  ("id", "theme_id", "enabled", "start_month", "start_day", "end_month", "end_day", "time_zone", "priority")
values
  ('halloween', 'halloween', true, 10, 15, 11, 1, 'UTC', 10)
on conflict ("id") do nothing;

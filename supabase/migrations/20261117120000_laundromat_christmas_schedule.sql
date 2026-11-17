insert into "laundro_cafe"."theme_schedules"
  ("id", "theme_id", "enabled", "start_month", "start_day", "end_month", "end_day", "time_zone", "priority")
values
  ('christmas', 'christmas', true, 12, 1, 1, 7, 'UTC', 10)
on conflict ("id") do nothing;

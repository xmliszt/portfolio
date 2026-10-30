create or replace function "paws"."count_meow_report"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update paws.meows
  set
    report_count = report_count + 1,
    blocked = blocked or report_count + 1 >= 2
  where key = new.meow_key;
  return new;
end;
$$;

create trigger "meow_reports_count"
  after insert on "paws"."meow_reports"
  for each row execute function "paws"."count_meow_report"();

revoke execute on function "paws"."count_meow_report"() from public, "anon", "authenticated";

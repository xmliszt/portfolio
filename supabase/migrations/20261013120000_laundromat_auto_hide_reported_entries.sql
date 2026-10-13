create or replace function "laundro_cafe"."count_entry_report"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update laundro_cafe.notebook_entries
    set
      report_count = report_count + 1,
      hidden_at = case
        when hidden_at is null and report_count + 1 >= 3 then now()
        else hidden_at
      end
    where id = new.entry_id;
    return new;
  end if;
  update laundro_cafe.notebook_entries
  set report_count = greatest(report_count - 1, 0)
  where id = old.entry_id;
  return old;
end;
$$;

update "laundro_cafe"."notebook_entries"
set "hidden_at" = now()
where "hidden_at" is null and "report_count" >= 3;

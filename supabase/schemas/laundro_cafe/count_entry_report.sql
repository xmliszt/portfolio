create function "laundro_cafe"."count_entry_report"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update laundro_cafe.notebook_entries
    set report_count = report_count + 1
    where id = new.entry_id;
    return new;
  end if;
  update laundro_cafe.notebook_entries
  set report_count = greatest(report_count - 1, 0)
  where id = old.entry_id;
  return old;
end;
$$;

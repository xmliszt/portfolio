create function "laundro_cafe"."reclaim_hidden_lines"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform 1
  from laundro_cafe.notebooks
  where id = new.notebook_id and filled_at is null
  for update;

  update laundro_cafe.notebooks n
  set lines_used = coalesce((
    select max((e.page - 1) * n.lines_per_page + e.line_start - 1 + e.line_count)
    from laundro_cafe.notebook_entries e
    where e.notebook_id = n.id and e.hidden_at is null
  ), 0)
  where n.id = new.notebook_id and n.filled_at is null;
  return new;
end;
$$;

create trigger "notebook_entries_reclaim_hidden_lines"
  after update of "hidden_at" on "laundro_cafe"."notebook_entries"
  for each row
  when (old."hidden_at" is distinct from new."hidden_at")
  execute function "laundro_cafe"."reclaim_hidden_lines"();

update "laundro_cafe"."notebooks" n
set "lines_used" = coalesce((
  select max((e."page" - 1) * n."lines_per_page" + e."line_start" - 1 + e."line_count")
  from "laundro_cafe"."notebook_entries" e
  where e."notebook_id" = n."id" and e."hidden_at" is null
), 0)
where n."filled_at" is null;

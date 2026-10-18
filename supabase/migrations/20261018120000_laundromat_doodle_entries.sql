alter table "laundro_cafe"."notebook_entries" add column "kind" text not null default 'text';
alter table "laundro_cafe"."notebook_entries" add column "drawing" jsonb;

alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_kind_check" check ("kind" = any (array['text'::text, 'doodle'::text]));
alter table "laundro_cafe"."notebook_entries" drop constraint "notebook_entries_body_check";
alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_body_check" check (
  ("kind" = 'text' and char_length("body") between 1 and 1200 and "drawing" is null)
  or ("kind" = 'doodle' and "body" = '' and "drawing" is not null)
);

grant select ("kind", "drawing") on table "laundro_cafe"."notebook_entries" to "anon", "authenticated";

create function "laundro_cafe"."append_doodle"(
  "p_visitor_id" uuid,
  "p_drawing" jsonb,
  "p_line_count" integer
)
returns "laundro_cafe"."notebook_entries"
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_notebook laundro_cafe.notebooks;
  v_capacity integer;
  v_space_lines constant integer := 7;
  v_row integer;
  v_skip integer;
  v_entry laundro_cafe.notebook_entries;
begin
  if p_visitor_id is null then
    raise exception 'missing_visitor' using errcode = '22023';
  end if;

  if jsonb_typeof(p_drawing -> 'strokes') is distinct from 'array' then
    raise exception 'invalid_drawing' using errcode = '22023';
  end if;

  if jsonb_array_length(p_drawing -> 'strokes') not between 1 and 300
    or octet_length(p_drawing::text) > 32768 then
    raise exception 'invalid_drawing' using errcode = '22023';
  end if;

  if p_line_count is null or p_line_count not between 2 and v_space_lines then
    raise exception 'invalid_line_count' using errcode = '22023';
  end if;

  loop
    select * into v_notebook
    from laundro_cafe.notebooks
    where filled_at is null
    for update;

    exit when found;

    insert into laundro_cafe.notebooks ("number")
    select coalesce(max("number"), 0) + 1 from laundro_cafe.notebooks
    on conflict do nothing;
  end loop;

  if exists (
    select 1
    from laundro_cafe.notebook_entry_authors
    where visitor_id = p_visitor_id
      and created_at > now() - interval '2 minutes'
  ) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  v_row := v_notebook.lines_used % v_notebook.lines_per_page;
  v_skip := case
    when v_row + v_space_lines > v_notebook.lines_per_page then v_notebook.lines_per_page - v_row
    else 0
  end;
  v_capacity := v_notebook.page_count * v_notebook.lines_per_page;

  if v_notebook.lines_used + v_skip + v_space_lines > v_capacity then
    update laundro_cafe.notebooks set filled_at = now() where id = v_notebook.id;

    insert into laundro_cafe.notebooks ("number")
    values (v_notebook."number" + 1)
    returning * into v_notebook;

    v_skip := 0;
    v_capacity := v_notebook.page_count * v_notebook.lines_per_page;
  end if;

  insert into laundro_cafe.notebook_entries (notebook_id, page, line_start, line_count, kind, body, drawing, sign_off, script)
  values (
    v_notebook.id,
    (v_notebook.lines_used + v_skip) / v_notebook.lines_per_page + 1,
    (v_notebook.lines_used + v_skip) % v_notebook.lines_per_page + 1,
    p_line_count,
    'doodle',
    '',
    p_drawing,
    null,
    'latin'
  )
  returning * into v_entry;

  insert into laundro_cafe.notebook_entry_authors (entry_id, visitor_id)
  values (v_entry.id, p_visitor_id);

  update laundro_cafe.notebooks
  set lines_used = lines_used + v_skip + p_line_count,
      filled_at = case when lines_used + v_skip + p_line_count = v_capacity then now() end
  where id = v_notebook.id;

  if v_notebook.lines_used + v_skip + p_line_count = v_capacity then
    insert into laundro_cafe.notebooks ("number") values (v_notebook."number" + 1);
  end if;

  return v_entry;
end;
$$;

revoke execute on function "laundro_cafe"."append_doodle"(uuid, jsonb, integer) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."append_doodle"(uuid, jsonb, integer) to "service_role";

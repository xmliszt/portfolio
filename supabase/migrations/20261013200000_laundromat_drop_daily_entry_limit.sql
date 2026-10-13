create or replace function "laundro_cafe"."append_entry"(
  "p_visitor_id" uuid,
  "p_body" text,
  "p_sign_off" text,
  "p_script" text,
  "p_line_count" integer
)
returns "laundro_cafe"."notebook_entries"
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_body text := btrim(p_body);
  v_sign_off text := nullif(btrim(p_sign_off), '');
  v_notebook laundro_cafe.notebooks;
  v_capacity integer;
  v_entry laundro_cafe.notebook_entries;
begin
  if p_visitor_id is null then
    raise exception 'missing_visitor' using errcode = '22023';
  end if;

  if v_body is null or v_body = '' then
    raise exception 'empty_body' using errcode = '22023';
  end if;

  if char_length(v_body) > 1200 then
    raise exception 'body_too_long' using errcode = '22023';
  end if;

  if char_length(v_sign_off) > 40 then
    raise exception 'sign_off_too_long' using errcode = '22023';
  end if;

  if p_script is null or p_script <> all (array['latin', 'korean', 'japanese', 'chinese', 'arabic', 'hebrew', 'devanagari', 'bengali']) then
    raise exception 'invalid_script' using errcode = '22023';
  end if;

  if concat_ws(' ', v_body, v_sign_off) ~* '(https?://|www\.)' then
    raise exception 'contains_link' using errcode = '22023';
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

  if p_line_count is null or p_line_count < 1 or p_line_count > 2 * v_notebook.lines_per_page then
    raise exception 'invalid_line_count' using errcode = '22023';
  end if;

  if exists (
    select 1
    from laundro_cafe.notebook_entry_authors
    where visitor_id = p_visitor_id
      and created_at > now() - interval '2 minutes'
  ) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  v_capacity := v_notebook.page_count * v_notebook.lines_per_page;

  if v_notebook.lines_used + p_line_count > v_capacity then
    update laundro_cafe.notebooks set filled_at = now() where id = v_notebook.id;

    insert into laundro_cafe.notebooks ("number")
    values (v_notebook."number" + 1)
    returning * into v_notebook;

    v_capacity := v_notebook.page_count * v_notebook.lines_per_page;
  end if;

  insert into laundro_cafe.notebook_entries (notebook_id, page, line_start, line_count, body, sign_off, script)
  values (
    v_notebook.id,
    v_notebook.lines_used / v_notebook.lines_per_page + 1,
    v_notebook.lines_used % v_notebook.lines_per_page + 1,
    p_line_count,
    v_body,
    v_sign_off,
    p_script
  )
  returning * into v_entry;

  insert into laundro_cafe.notebook_entry_authors (entry_id, visitor_id)
  values (v_entry.id, p_visitor_id);

  update laundro_cafe.notebooks
  set lines_used = lines_used + p_line_count,
      filled_at = case when lines_used + p_line_count = v_capacity then now() end
  where id = v_notebook.id;

  if v_notebook.lines_used + p_line_count = v_capacity then
    insert into laundro_cafe.notebooks ("number") values (v_notebook."number" + 1);
  end if;

  return v_entry;
end;
$$;

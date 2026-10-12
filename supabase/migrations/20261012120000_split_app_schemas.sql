create schema if not exists "portfolio";
create schema if not exists "laundro_cafe";

grant usage on schema "portfolio" to "anon", "authenticated", "service_role";
grant usage on schema "laundro_cafe" to "anon", "authenticated", "service_role";

alter default privileges for role "postgres" in schema "portfolio" grant all on tables to "service_role";
alter default privileges for role "postgres" in schema "portfolio" grant all on sequences to "service_role";
alter default privileges for role "postgres" in schema "portfolio" grant all on functions to "service_role";
alter default privileges for role "postgres" in schema "laundro_cafe" grant all on tables to "service_role";
alter default privileges for role "postgres" in schema "laundro_cafe" grant all on sequences to "service_role";
alter default privileges for role "postgres" in schema "laundro_cafe" grant all on functions to "service_role";

alter table "public"."bgms" set schema "portfolio";
alter table "public"."post_views" set schema "portfolio";
alter table "public"."ratings" set schema "portfolio";
alter table "public"."hobby_item_groups" set schema "portfolio";
alter table "public"."hobby_items" set schema "portfolio";

alter table "public"."notebooks" set schema "laundro_cafe";
alter table "public"."notebook_entries" set schema "laundro_cafe";
alter table "public"."notebook_entry_authors" set schema "laundro_cafe";
alter table "public"."entry_reports" set schema "laundro_cafe";

grant all on table
  "portfolio"."bgms",
  "portfolio"."post_views",
  "portfolio"."ratings",
  "portfolio"."hobby_item_groups",
  "portfolio"."hobby_items"
to "anon", "authenticated", "service_role";

grant all on table
  "laundro_cafe"."notebooks",
  "laundro_cafe"."notebook_entries",
  "laundro_cafe"."notebook_entry_authors",
  "laundro_cafe"."entry_reports"
to "service_role";

alter function "public"."append_entry"(uuid, text, text, text, integer) set schema "laundro_cafe";
alter function "public"."count_entry_report"() set schema "laundro_cafe";

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

  if (
    select count(*)
    from laundro_cafe.notebook_entry_authors
    where visitor_id = p_visitor_id
      and created_at > now() - interval '1 day'
  ) >= 10 then
    raise exception 'daily_limit_reached' using errcode = 'P0001';
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

create or replace function "laundro_cafe"."count_entry_report"()
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

-- Compatibility views for clients that still read "public"; a later migration drops them.
create view "public"."bgms" with (security_invoker = true) as select * from "portfolio"."bgms";
create view "public"."post_views" with (security_invoker = true) as select * from "portfolio"."post_views";
create view "public"."ratings" with (security_invoker = true) as select * from "portfolio"."ratings";
create view "public"."hobby_item_groups" with (security_invoker = true) as select * from "portfolio"."hobby_item_groups";
create view "public"."hobby_items" with (security_invoker = true) as select * from "portfolio"."hobby_items";
create view "public"."notebooks" with (security_invoker = true) as select * from "laundro_cafe"."notebooks";
create view "public"."notebook_entries" with (security_invoker = true) as select * from "laundro_cafe"."notebook_entries";
create view "public"."notebook_entry_authors" with (security_invoker = true) as select * from "laundro_cafe"."notebook_entry_authors";
create view "public"."entry_reports" with (security_invoker = true) as select * from "laundro_cafe"."entry_reports";

revoke all on table
  "public"."bgms",
  "public"."post_views",
  "public"."ratings",
  "public"."hobby_item_groups",
  "public"."hobby_items",
  "public"."notebooks",
  "public"."notebook_entries",
  "public"."notebook_entry_authors",
  "public"."entry_reports"
from "anon", "authenticated";

grant all on table
  "public"."bgms",
  "public"."post_views",
  "public"."ratings",
  "public"."hobby_item_groups",
  "public"."hobby_items",
  "public"."notebooks",
  "public"."notebook_entries",
  "public"."notebook_entry_authors",
  "public"."entry_reports"
to "service_role";

create function "public"."append_entry"(
  "p_visitor_id" uuid,
  "p_body" text,
  "p_sign_off" text,
  "p_script" text,
  "p_line_count" integer
)
returns "laundro_cafe"."notebook_entries"
language sql
set search_path = ''
as $$
  select * from laundro_cafe.append_entry(p_visitor_id, p_body, p_sign_off, p_script, p_line_count);
$$;

revoke execute on function "public"."append_entry"(uuid, text, text, text, integer) from public, "anon", "authenticated";
grant execute on function "public"."append_entry"(uuid, text, text, text, integer) to "service_role";

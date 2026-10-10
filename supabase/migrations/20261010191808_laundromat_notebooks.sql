create table if not exists "public"."notebooks" (
  "id" bigint generated always as identity not null,
  "number" integer not null,
  "page_count" integer not null default 48,
  "lines_per_page" integer not null default 24,
  "lines_used" integer not null default 0,
  "started_at" timestamp with time zone not null default now(),
  "filled_at" timestamp with time zone,
  constraint "notebooks_pkey" primary key ("id"),
  constraint "notebooks_number_key" unique ("number"),
  constraint "notebooks_number_check" check ("number" > 0),
  constraint "notebooks_page_count_check" check ("page_count" > 0),
  constraint "notebooks_lines_per_page_check" check ("lines_per_page" > 0),
  constraint "notebooks_lines_used_check" check ("lines_used" between 0 and "page_count" * "lines_per_page")
);

create unique index if not exists "notebooks_single_current_idx"
  on "public"."notebooks" using btree ((true))
  where "filled_at" is null;

create table if not exists "public"."notebook_entries" (
  "id" bigint generated always as identity not null,
  "notebook_id" bigint not null,
  "page" integer not null,
  "line_start" integer not null,
  "line_count" integer not null,
  "body" text not null,
  "sign_off" text,
  "script" text not null,
  "created_at" timestamp with time zone not null default now(),
  "hidden_at" timestamp with time zone,
  constraint "notebook_entries_pkey" primary key ("id"),
  constraint "notebook_entries_notebook_id_fkey" foreign key ("notebook_id") references "public"."notebooks"("id") on delete restrict,
  constraint "notebook_entries_page_check" check ("page" > 0),
  constraint "notebook_entries_line_start_check" check ("line_start" > 0),
  constraint "notebook_entries_line_count_check" check ("line_count" > 0),
  constraint "notebook_entries_body_check" check (char_length("body") between 1 and 1200),
  constraint "notebook_entries_sign_off_check" check (char_length("sign_off") between 1 and 40),
  constraint "notebook_entries_script_check" check ("script" = any (array['latin'::text, 'korean'::text, 'japanese'::text, 'chinese'::text, 'arabic'::text, 'hebrew'::text, 'devanagari'::text, 'bengali'::text]))
);

create index if not exists "notebook_entries_notebook_id_page_line_start_idx"
  on "public"."notebook_entries" using btree ("notebook_id", "page", "line_start");

create table if not exists "public"."notebook_entry_authors" (
  "entry_id" bigint not null,
  "visitor_id" uuid not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "notebook_entry_authors_pkey" primary key ("entry_id"),
  constraint "notebook_entry_authors_entry_id_fkey" foreign key ("entry_id") references "public"."notebook_entries"("id") on delete cascade
);

create index if not exists "notebook_entry_authors_visitor_id_created_at_idx"
  on "public"."notebook_entry_authors" using btree ("visitor_id", "created_at" desc);

create table if not exists "public"."entry_reports" (
  "id" bigint generated always as identity not null,
  "entry_id" bigint not null,
  "visitor_id" uuid not null,
  "reason" text,
  "created_at" timestamp with time zone not null default now(),
  constraint "entry_reports_pkey" primary key ("id"),
  constraint "entry_reports_entry_id_visitor_id_key" unique ("entry_id", "visitor_id"),
  constraint "entry_reports_entry_id_fkey" foreign key ("entry_id") references "public"."notebook_entries"("id") on delete cascade,
  constraint "entry_reports_reason_check" check (char_length("reason") between 1 and 280)
);

alter table "public"."notebooks" enable row level security;
alter table "public"."notebook_entries" enable row level security;
alter table "public"."notebook_entry_authors" enable row level security;
alter table "public"."entry_reports" enable row level security;

revoke all on table "public"."notebooks" from "anon", "authenticated";
revoke all on table "public"."notebook_entries" from "anon", "authenticated";
revoke all on table "public"."notebook_entry_authors" from "anon", "authenticated";
revoke all on table "public"."entry_reports" from "anon", "authenticated";

grant select on table "public"."notebooks" to "anon", "authenticated";
grant select on table "public"."notebook_entries" to "anon", "authenticated";

drop policy if exists "Notebooks are readable by everyone" on "public"."notebooks";
create policy "Notebooks are readable by everyone"
  on "public"."notebooks"
  for select
  to "anon", "authenticated"
  using (true);

drop policy if exists "Visible notebook entries are readable by everyone" on "public"."notebook_entries";
create policy "Visible notebook entries are readable by everyone"
  on "public"."notebook_entries"
  for select
  to "anon", "authenticated"
  using ("hidden_at" is null);

insert into "public"."notebooks" ("number") values (1) on conflict do nothing;

create or replace function "public"."append_entry"(
  "p_visitor_id" uuid,
  "p_body" text,
  "p_sign_off" text,
  "p_script" text,
  "p_line_count" integer
)
returns "public"."notebook_entries"
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_body text := btrim(p_body);
  v_sign_off text := nullif(btrim(p_sign_off), '');
  v_notebook public.notebooks;
  v_capacity integer;
  v_entry public.notebook_entries;
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
    from public.notebooks
    where filled_at is null
    for update;

    exit when found;

    insert into public.notebooks ("number")
    select coalesce(max("number"), 0) + 1 from public.notebooks
    on conflict do nothing;
  end loop;

  if p_line_count is null or p_line_count < 1 or p_line_count > 2 * v_notebook.lines_per_page then
    raise exception 'invalid_line_count' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.notebook_entry_authors
    where visitor_id = p_visitor_id
      and created_at > now() - interval '2 minutes'
  ) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if (
    select count(*)
    from public.notebook_entry_authors
    where visitor_id = p_visitor_id
      and created_at > now() - interval '1 day'
  ) >= 10 then
    raise exception 'daily_limit_reached' using errcode = 'P0001';
  end if;

  v_capacity := v_notebook.page_count * v_notebook.lines_per_page;

  if v_notebook.lines_used + p_line_count > v_capacity then
    update public.notebooks set filled_at = now() where id = v_notebook.id;

    insert into public.notebooks ("number")
    values (v_notebook."number" + 1)
    returning * into v_notebook;

    v_capacity := v_notebook.page_count * v_notebook.lines_per_page;
  end if;

  insert into public.notebook_entries (notebook_id, page, line_start, line_count, body, sign_off, script)
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

  insert into public.notebook_entry_authors (entry_id, visitor_id)
  values (v_entry.id, p_visitor_id);

  update public.notebooks
  set lines_used = lines_used + p_line_count,
      filled_at = case when lines_used + p_line_count = v_capacity then now() end
  where id = v_notebook.id;

  if v_notebook.lines_used + p_line_count = v_capacity then
    insert into public.notebooks ("number") values (v_notebook."number" + 1);
  end if;

  return v_entry;
end;
$$;

revoke execute on function "public"."append_entry"(uuid, text, text, text, integer) from public, "anon", "authenticated";
grant execute on function "public"."append_entry"(uuid, text, text, text, integer) to "service_role";

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'notebook_entries'
    )
  then
    alter publication "supabase_realtime" add table "public"."notebook_entries";
  end if;
end $$;

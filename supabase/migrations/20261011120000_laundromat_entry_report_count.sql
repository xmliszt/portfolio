alter table "public"."notebook_entries"
  add column if not exists "report_count" integer not null default 0;

update "public"."notebook_entries" as entries
set "report_count" = counts.total
from (
  select "entry_id", count(*)::integer as total
  from "public"."entry_reports"
  group by "entry_id"
) as counts
where entries."id" = counts."entry_id";

create index if not exists "notebook_entries_report_count_idx"
  on "public"."notebook_entries" using btree ("report_count" desc)
  where "report_count" > 0;

create or replace function "public"."count_entry_report"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.notebook_entries
    set report_count = report_count + 1
    where id = new.entry_id;
    return new;
  end if;
  update public.notebook_entries
  set report_count = greatest(report_count - 1, 0)
  where id = old.entry_id;
  return old;
end;
$$;

drop trigger if exists "entry_reports_count" on "public"."entry_reports";
create trigger "entry_reports_count"
  after insert or delete on "public"."entry_reports"
  for each row execute function "public"."count_entry_report"();

revoke select on table "public"."notebook_entries" from "anon", "authenticated";
grant select (
  "id",
  "notebook_id",
  "page",
  "line_start",
  "line_count",
  "body",
  "sign_off",
  "script",
  "created_at",
  "hidden_at"
) on table "public"."notebook_entries" to "anon", "authenticated";

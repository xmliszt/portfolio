create table "laundro_cafe"."notebook_entries" (
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
  "report_count" integer not null default 0
);

alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_pkey" primary key ("id");
alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_notebook_id_fkey" foreign key ("notebook_id") references "laundro_cafe"."notebooks"("id") on delete restrict;
alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_page_check" check ("page" > 0);
alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_line_start_check" check ("line_start" > 0);
alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_line_count_check" check ("line_count" > 0);
alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_body_check" check (char_length("body") between 1 and 1200);
alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_sign_off_check" check (char_length("sign_off") between 1 and 40);
alter table "laundro_cafe"."notebook_entries" add constraint "notebook_entries_script_check" check ("script" = any (array['latin'::text, 'korean'::text, 'japanese'::text, 'chinese'::text, 'arabic'::text, 'hebrew'::text, 'devanagari'::text, 'bengali'::text]));
create index "notebook_entries_notebook_id_page_line_start_idx" on "laundro_cafe"."notebook_entries" using btree ("notebook_id", "page", "line_start");
create index "notebook_entries_report_count_idx" on "laundro_cafe"."notebook_entries" using btree ("report_count" desc) where "report_count" > 0;
alter table "laundro_cafe"."notebook_entries" enable row level security;

grant all on table "laundro_cafe"."notebook_entries" to "service_role";
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
) on table "laundro_cafe"."notebook_entries" to "anon", "authenticated";

create policy "Visible notebook entries are readable by everyone"
  on "laundro_cafe"."notebook_entries"
  for select
  to "anon", "authenticated"
  using ("hidden_at" is null);

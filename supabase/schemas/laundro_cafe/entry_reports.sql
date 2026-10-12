create table "laundro_cafe"."entry_reports" (
  "id" bigint generated always as identity not null,
  "entry_id" bigint not null,
  "visitor_id" uuid not null,
  "reason" text,
  "created_at" timestamp with time zone not null default now()
);

alter table "laundro_cafe"."entry_reports" add constraint "entry_reports_pkey" primary key ("id");
alter table "laundro_cafe"."entry_reports" add constraint "entry_reports_entry_id_visitor_id_key" unique ("entry_id", "visitor_id");
alter table "laundro_cafe"."entry_reports" add constraint "entry_reports_entry_id_fkey" foreign key ("entry_id") references "laundro_cafe"."notebook_entries"("id") on delete cascade;
alter table "laundro_cafe"."entry_reports" add constraint "entry_reports_reason_check" check (char_length("reason") between 1 and 280);
alter table "laundro_cafe"."entry_reports" enable row level security;

grant all on table "laundro_cafe"."entry_reports" to "service_role";

create trigger "entry_reports_count"
  after insert or delete on "laundro_cafe"."entry_reports"
  for each row execute function "laundro_cafe"."count_entry_report"();

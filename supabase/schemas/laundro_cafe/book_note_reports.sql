create table "laundro_cafe"."book_note_reports" (
  "id" bigint generated always as identity not null,
  "note_id" bigint not null,
  "visitor_id" uuid not null,
  "reason" text,
  "created_at" timestamp with time zone not null default now()
);

alter table "laundro_cafe"."book_note_reports" add constraint "book_note_reports_pkey" primary key ("id");
alter table "laundro_cafe"."book_note_reports" add constraint "book_note_reports_note_id_visitor_id_key" unique ("note_id", "visitor_id");
alter table "laundro_cafe"."book_note_reports" add constraint "book_note_reports_note_id_fkey" foreign key ("note_id") references "laundro_cafe"."book_notes"("id") on delete cascade;
alter table "laundro_cafe"."book_note_reports" add constraint "book_note_reports_reason_check" check (char_length("reason") between 1 and 280);

alter table "laundro_cafe"."book_note_reports" enable row level security;

grant all on table "laundro_cafe"."book_note_reports" to "service_role";

create trigger "book_note_reports_count"
  after insert or delete on "laundro_cafe"."book_note_reports"
  for each row execute function "laundro_cafe"."count_book_note_report"();

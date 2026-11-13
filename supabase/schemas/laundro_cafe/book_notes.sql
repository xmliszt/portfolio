create table "laundro_cafe"."book_notes" (
  "id" bigint generated always as identity not null,
  "book_id" bigint not null,
  "body" text not null,
  "sign_off" text,
  "report_count" integer not null default 0,
  "hidden_at" timestamp with time zone,
  "created_at" timestamp with time zone not null default now()
);

alter table "laundro_cafe"."book_notes" add constraint "book_notes_pkey" primary key ("id");
alter table "laundro_cafe"."book_notes" add constraint "book_notes_book_id_fkey" foreign key ("book_id") references "laundro_cafe"."books"("id") on delete cascade;
alter table "laundro_cafe"."book_notes" add constraint "book_notes_body_check" check (char_length("body") between 1 and 140);
alter table "laundro_cafe"."book_notes" add constraint "book_notes_sign_off_check" check (char_length("sign_off") between 1 and 24);
alter table "laundro_cafe"."book_notes" add constraint "book_notes_report_count_check" check ("report_count" >= 0);

create index "book_notes_book_id_created_at_idx" on "laundro_cafe"."book_notes" using btree ("book_id", "created_at" desc);

alter table "laundro_cafe"."book_notes" enable row level security;

grant all on table "laundro_cafe"."book_notes" to "service_role";

create trigger "book_notes_count_visible"
  after insert or delete or update of "hidden_at", "book_id" on "laundro_cafe"."book_notes"
  for each row execute function "laundro_cafe"."count_visible_book_notes"();

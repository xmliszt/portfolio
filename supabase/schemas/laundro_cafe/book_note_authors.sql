create table "laundro_cafe"."book_note_authors" (
  "note_id" bigint not null,
  "visitor_id" uuid not null,
  "created_at" timestamp with time zone not null default now()
);

alter table "laundro_cafe"."book_note_authors" add constraint "book_note_authors_pkey" primary key ("note_id");
alter table "laundro_cafe"."book_note_authors" add constraint "book_note_authors_note_id_fkey" foreign key ("note_id") references "laundro_cafe"."book_notes"("id") on delete cascade;

create index "book_note_authors_visitor_id_created_at_idx" on "laundro_cafe"."book_note_authors" using btree ("visitor_id", "created_at" desc);

alter table "laundro_cafe"."book_note_authors" enable row level security;

grant all on table "laundro_cafe"."book_note_authors" to "service_role";

create table "laundro_cafe"."book_note_translations" (
  "note_id" bigint not null,
  "locale" text not null,
  "body" text,
  "source_language" text not null,
  "created_at" timestamp with time zone not null default now()
);

comment on column "laundro_cafe"."book_note_translations"."body" is 'null when the note is already written in "locale"';

alter table "laundro_cafe"."book_note_translations" add constraint "book_note_translations_pkey" primary key ("note_id", "locale");
alter table "laundro_cafe"."book_note_translations" add constraint "book_note_translations_note_id_fkey" foreign key ("note_id") references "laundro_cafe"."book_notes"("id") on delete cascade;
alter table "laundro_cafe"."book_note_translations" add constraint "book_note_translations_locale_check" check (char_length("locale") between 2 and 16);
alter table "laundro_cafe"."book_note_translations" add constraint "book_note_translations_body_check" check (char_length("body") between 1 and 4000);
alter table "laundro_cafe"."book_note_translations" add constraint "book_note_translations_source_language_check" check (char_length("source_language") between 2 and 16);

alter table "laundro_cafe"."book_note_translations" enable row level security;

grant all on table "laundro_cafe"."book_note_translations" to "service_role";

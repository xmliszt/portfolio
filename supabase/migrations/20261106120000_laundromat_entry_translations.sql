create table if not exists "laundro_cafe"."entry_translations" (
  "entry_id" bigint not null,
  "locale" text not null,
  "body" text,
  "source_language" text not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "entry_translations_pkey" primary key ("entry_id", "locale"),
  constraint "entry_translations_entry_id_fkey" foreign key ("entry_id") references "laundro_cafe"."notebook_entries"("id") on delete cascade,
  constraint "entry_translations_locale_check" check (char_length("locale") between 2 and 16),
  constraint "entry_translations_body_check" check (char_length("body") between 1 and 4000),
  constraint "entry_translations_source_language_check" check (char_length("source_language") between 2 and 16)
);

comment on column "laundro_cafe"."entry_translations"."body" is 'null when the entry is already written in "locale"';

alter table "laundro_cafe"."entry_translations" enable row level security;

revoke all on table "laundro_cafe"."entry_translations" from "anon", "authenticated";

grant all on table "laundro_cafe"."entry_translations" to "service_role";

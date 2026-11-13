create table "laundro_cafe"."books" (
  "id" bigint generated always as identity not null,
  "source" text not null,
  "source_id" text,
  "title" text not null,
  "subtitle" text,
  "authors" text not null,
  "published_year" integer,
  "language" text,
  "cover_ref" text,
  "vote_count" integer not null default 0,
  "visible_note_count" integer not null default 0,
  "created_at" timestamp with time zone not null default now()
);

comment on column "laundro_cafe"."books"."source_id" is 'Open Library work id (OL…W) or Google Books volume id; null for books added by hand';
comment on column "laundro_cafe"."books"."cover_ref" is 'Open Library cover id or Google Books volume id; the server builds the image URL from it';
comment on column "laundro_cafe"."books"."visible_note_count" is 'notes not hidden by reports; the shelf shows only books above 0';

alter table "laundro_cafe"."books" add constraint "books_pkey" primary key ("id");
alter table "laundro_cafe"."books" add constraint "books_source_source_id_key" unique ("source", "source_id");
alter table "laundro_cafe"."books" add constraint "books_source_check" check (
  ("source" = 'openlibrary' and "source_id" is not null and "source_id" ~ '^OL[0-9]{1,12}W$')
  or ("source" = 'googlebooks' and "source_id" is not null and "source_id" ~ '^[A-Za-z0-9_-]{8,16}$')
  or ("source" = 'manual' and "source_id" is null)
);
alter table "laundro_cafe"."books" add constraint "books_title_check" check (char_length("title") between 1 and 200);
alter table "laundro_cafe"."books" add constraint "books_subtitle_check" check (char_length("subtitle") between 1 and 200);
alter table "laundro_cafe"."books" add constraint "books_authors_check" check (char_length("authors") between 1 and 200);
alter table "laundro_cafe"."books" add constraint "books_published_year_check" check ("published_year" between -3000 and 2100);
alter table "laundro_cafe"."books" add constraint "books_language_check" check ("language" ~ '^[a-z]{2,3}$');
alter table "laundro_cafe"."books" add constraint "books_cover_ref_check" check ("cover_ref" ~ '^[A-Za-z0-9_-]{1,16}$');
alter table "laundro_cafe"."books" add constraint "books_vote_count_check" check ("vote_count" >= 0);
alter table "laundro_cafe"."books" add constraint "books_visible_note_count_check" check ("visible_note_count" >= 0);

create index "books_most_loved_idx" on "laundro_cafe"."books" using btree ("vote_count" desc, "created_at" desc) where "visible_note_count" > 0;
create index "books_newest_idx" on "laundro_cafe"."books" using btree ("created_at" desc) where "visible_note_count" > 0;

alter table "laundro_cafe"."books" enable row level security;

grant all on table "laundro_cafe"."books" to "service_role";

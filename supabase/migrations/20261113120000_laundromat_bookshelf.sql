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

create or replace function "laundro_cafe"."count_visible_book_notes"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform 1
  from laundro_cafe.books
  where id in (new.book_id, old.book_id)
  order by id
  for update;

  update laundro_cafe.books
  set visible_note_count = (
    select count(*)
    from laundro_cafe.book_notes
    where book_id = books.id and hidden_at is null
  )
  where id in (new.book_id, old.book_id);
  return null;
end;
$$;

revoke execute on function "laundro_cafe"."count_visible_book_notes"() from public, "anon", "authenticated";

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

create or replace function "laundro_cafe"."count_book_vote"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update laundro_cafe.books set vote_count = vote_count + 1 where id = new.book_id;
    return new;
  end if;
  update laundro_cafe.books set vote_count = greatest(vote_count - 1, 0) where id = old.book_id;
  return old;
end;
$$;

revoke execute on function "laundro_cafe"."count_book_vote"() from public, "anon", "authenticated";

create table "laundro_cafe"."book_votes" (
  "book_id" bigint not null,
  "visitor_id" uuid not null,
  "created_at" timestamp with time zone not null default now()
);

alter table "laundro_cafe"."book_votes" add constraint "book_votes_pkey" primary key ("book_id", "visitor_id");
alter table "laundro_cafe"."book_votes" add constraint "book_votes_book_id_fkey" foreign key ("book_id") references "laundro_cafe"."books"("id") on delete cascade;

create index "book_votes_visitor_id_idx" on "laundro_cafe"."book_votes" using btree ("visitor_id");

alter table "laundro_cafe"."book_votes" enable row level security;

grant all on table "laundro_cafe"."book_votes" to "service_role";

create trigger "book_votes_count"
  after insert or delete on "laundro_cafe"."book_votes"
  for each row execute function "laundro_cafe"."count_book_vote"();

create or replace function "laundro_cafe"."count_book_note_report"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update laundro_cafe.book_notes
    set
      report_count = report_count + 1,
      hidden_at = case
        when hidden_at is null and report_count + 1 >= 3 then now()
        else hidden_at
      end
    where id = new.note_id;
    return new;
  end if;
  update laundro_cafe.book_notes
  set report_count = greatest(report_count - 1, 0)
  where id = old.note_id;
  return old;
end;
$$;

revoke execute on function "laundro_cafe"."count_book_note_report"() from public, "anon", "authenticated";

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

create or replace function "laundro_cafe"."latest_visible_book_notes"("p_book_ids" bigint[])
returns setof "laundro_cafe"."book_notes"
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (book_id) *
  from laundro_cafe.book_notes
  where book_id = any (p_book_ids) and hidden_at is null
  order by book_id, created_at desc, id desc;
$$;

revoke execute on function "laundro_cafe"."latest_visible_book_notes"(bigint[]) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."latest_visible_book_notes"(bigint[]) to "service_role";

create or replace function "laundro_cafe"."recommend_book"(
  "p_visitor_id" uuid,
  "p_source" text,
  "p_source_id" text,
  "p_title" text,
  "p_subtitle" text,
  "p_authors" text,
  "p_published_year" integer,
  "p_language" text,
  "p_cover_ref" text,
  "p_body" text,
  "p_sign_off" text
)
returns table ("book_id" bigint, "note_id" bigint, "is_new_book" boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_body text := regexp_replace(p_body, '^\s+|\s+$', '', 'g');
  v_sign_off text := nullif(regexp_replace(p_sign_off, '^\s+|\s+$', '', 'g'), '');
  v_title text := regexp_replace(p_title, '^\s+|\s+$', '', 'g');
  v_authors text := regexp_replace(p_authors, '^\s+|\s+$', '', 'g');
  v_source_id text := nullif(btrim(p_source_id), '');
  v_book_id bigint;
  v_note_id bigint;
  v_is_new boolean := false;
begin
  if p_visitor_id is null then
    raise exception 'missing_visitor' using errcode = '22023';
  end if;

  if v_body is null or v_body = '' then
    raise exception 'empty_body' using errcode = '22023';
  end if;

  if char_length(v_body) > 140 then
    raise exception 'body_too_long' using errcode = '22023';
  end if;

  if char_length(v_sign_off) > 24 then
    raise exception 'sign_off_too_long' using errcode = '22023';
  end if;

  if v_title is null or v_title = '' or v_authors is null or v_authors = '' then
    raise exception 'invalid_book' using errcode = '22023';
  end if;

  if concat_ws(' ', v_body, v_sign_off, v_title, p_subtitle, v_authors) ~* '(https?://|www\.)' then
    raise exception 'contains_link' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('recommend_book:' || p_visitor_id::text, 0));

  if exists (
    select 1
    from laundro_cafe.book_note_authors
    where visitor_id = p_visitor_id
      and created_at > now() - interval '2 minutes'
  ) then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if p_source <> 'manual' then
    select id into v_book_id
    from laundro_cafe.books
    where source = p_source and source_id = v_source_id;
  end if;

  if v_book_id is null then
    begin
      insert into laundro_cafe.books (source, source_id, title, subtitle, authors, published_year, language, cover_ref)
      values (
        p_source,
        v_source_id,
        v_title,
        nullif(btrim(p_subtitle), ''),
        v_authors,
        nullif(p_published_year, 0),
        nullif(btrim(p_language), ''),
        nullif(btrim(p_cover_ref), '')
      )
      returning id into v_book_id;
      v_is_new := true;
    exception
      when unique_violation then
        select id into v_book_id
        from laundro_cafe.books
        where source = p_source and source_id = v_source_id;
      when check_violation then
        raise exception 'invalid_book' using errcode = '22023';
    end;
  end if;

  insert into laundro_cafe.book_notes (book_id, body, sign_off)
  values (v_book_id, v_body, v_sign_off)
  returning id into v_note_id;

  insert into laundro_cafe.book_note_authors (note_id, visitor_id)
  values (v_note_id, p_visitor_id);

  insert into laundro_cafe.book_votes (book_id, visitor_id)
  values (v_book_id, p_visitor_id)
  on conflict do nothing;

  return query select v_book_id, v_note_id, v_is_new;
end;
$$;

revoke execute on function "laundro_cafe"."recommend_book"(uuid, text, text, text, text, text, integer, text, text, text, text) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."recommend_book"(uuid, text, text, text, text, text, integer, text, text, text, text) to "service_role";

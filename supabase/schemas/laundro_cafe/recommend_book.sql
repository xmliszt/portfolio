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

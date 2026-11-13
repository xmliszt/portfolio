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
